#!/usr/bin/env python3
"""
의료 가이드라인 RAG 서비스 Backend (FastAPI)
SSE를 사용한 실시간 진행상황 표시
"""

import os
import json
import asyncio
import re
from typing import List, Dict, AsyncGenerator, Set
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv

from openai import OpenAI
from pinecone import Pinecone

# 환경 변수 로드
load_dotenv()

# PDF URL 매핑 로드
PDF_URL_MAPPING = {}
url_mapping_path = Path(__file__).parent / "pdf_url_mapping.json"
if url_mapping_path.exists():
    with open(url_mapping_path, 'r', encoding='utf-8') as f:
        PDF_URL_MAPPING = json.load(f)
        print(f"✅ PDF URL 매핑 로드 완료: {len(PDF_URL_MAPPING)}개")

# PDF 메타데이터 매핑 로드 (title → filename)
TITLE_TO_FILENAME = {}
metadata_mapping_path = Path(__file__).parent.parent / "data-pipeline" / "pdf_metadata_mapping.json"
if metadata_mapping_path.exists():
    with open(metadata_mapping_path, 'r', encoding='utf-8') as f:
        metadata = json.load(f)
        # title → filename 역매핑 생성
        for filename, meta in metadata.items():
            title = meta.get("title", "")
            if title:
                # title을 정규화해서 저장 (공백, 대소문자 무시)
                normalized_title = title.lower().strip()
                TITLE_TO_FILENAME[normalized_title] = filename
        print(f"✅ Title → Filename 매핑 로드 완료: {len(TITLE_TO_FILENAME)}개")
else:
    print(f"⚠️  메타데이터 매핑 파일을 찾을 수 없습니다: {metadata_mapping_path}")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "medical-guidelines-kr")

# OpenAI 클라이언트
openai_client = OpenAI(api_key=OPENAI_API_KEY)

# Pinecone 클라이언트
pc = Pinecone(api_key=PINECONE_API_KEY)
pinecone_index = pc.Index(PINECONE_INDEX_NAME)

# FastAPI 앱
app = FastAPI(
    title="의료 가이드라인 RAG API",
    description="한국 의학회 진료지침서 AI 검색 플랫폼",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Next.js 개발 서버
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response 모델
class QueryRequest(BaseModel):
    question: str
    conversation_history: List[Dict] = []
    language: str = "한국어"  # 기본값: 한국어


class FollowUpRequest(BaseModel):
    question: str
    answer: str
    conversation_history: List[Dict] = []


class Reference(BaseModel):
    source: str
    title: str
    year: str
    page: int
    text: str
    authors: str = ""
    journal: str = ""
    doi: str = ""
    score: float = 0.0
    url: str = ""  # 논문 URL 추가


# SSE 이벤트 생성 헬퍼
def create_sse_event(data: dict) -> str:
    """SSE 형식으로 데이터 포맷"""
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"


# Pinecone 검색 함수
async def search_pinecone(query_embedding: List[float], top_k: int = 5, min_similarity: float = 0.45, max_chunks_per_doc: int = 2) -> List[Dict]:
    """
    Pinecone에서 유사한 가이드라인 검색
    - top_k: 검색할 최대 청크 개수
    - min_similarity: 최소 유사도 임계값 (0.0~1.0)
    - max_chunks_per_doc: 동일 문서에서 선택할 최대 청크 개수 (출처 다양성 확보)
    """
    try:
        results = pinecone_index.query(
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True
        )

        chunks = []
        for match in results.matches:
            # 유사도가 임계값 이상인 것만 포함
            if match.score < min_similarity:
                print(f"⚠️  낮은 유사도로 필터링됨: {match.score:.4f} (임계값: {min_similarity})")
                continue

            metadata = match.metadata

            chunks.append({
                "text": metadata.get("text", ""),
                "source": metadata.get("source", ""),
                "title": metadata.get("title", ""),
                "year": metadata.get("year", ""),
                "page": metadata.get("page", 0),
                "section": metadata.get("section", ""),
                "authors": metadata.get("authors", ""),
                "journal": metadata.get("journal", ""),
                "doi": metadata.get("doi", ""),
                "score": match.score
            })

        # 유사도 점수로 재정렬 (내림차순 - 높은 점수가 먼저)
        chunks.sort(key=lambda x: x["score"], reverse=True)

        # 문서별 청크 제한 (출처 다양성 확보)
        doc_chunk_count = {}
        filtered_chunks = []

        for chunk in chunks:
            # 문서 식별자: source + title (동일 문서 판별)
            doc_id = f"{chunk['source']}_{chunk['title']}"

            # 현재 문서의 청크 개수 확인
            current_count = doc_chunk_count.get(doc_id, 0)

            if current_count < max_chunks_per_doc:
                filtered_chunks.append(chunk)
                doc_chunk_count[doc_id] = current_count + 1
            else:
                print(f"⚠️  문서별 제한으로 필터링됨: {chunk['title'][:50]}... (이미 {max_chunks_per_doc}개 선택됨)")

        print(f"✅ {len(filtered_chunks)}개 청크 검색 완료 (유사도 {min_similarity} 이상, 문서당 최대 {max_chunks_per_doc}개)")
        print(f"   총 {len(doc_chunk_count)}개 서로 다른 문서에서 선택됨")
        if filtered_chunks:
            print(f"   최고 유사도: {filtered_chunks[0]['score']:.4f}, 최저 유사도: {filtered_chunks[-1]['score']:.4f}")

        return filtered_chunks
    except Exception as e:
        print(f"Pinecone 검색 오류: {e}")
        return []


# Citation 파싱 함수
def extract_cited_indices(answer: str) -> Set[int]:
    """
    답변에서 실제로 인용된 citation 번호를 추출
    예: [1], [2-3], [1,4] 등을 파싱
    """
    cited_indices = set()

    # [1], [2], [3] 형태의 단일 citation
    single_citations = re.findall(r'\[(\d+)\]', answer)
    for num in single_citations:
        cited_indices.add(int(num))

    # [2-3], [1-5] 형태의 범위 citation
    range_citations = re.findall(r'\[(\d+)-(\d+)\]', answer)
    for start, end in range_citations:
        for num in range(int(start), int(end) + 1):
            cited_indices.add(num)

    # [1,4], [2,5,7] 형태의 복수 citation
    multi_citations = re.findall(r'\[(\d+(?:,\s*\d+)+)\]', answer)
    for group in multi_citations:
        nums = group.split(',')
        for num in nums:
            cited_indices.add(int(num.strip()))

    return cited_indices


# GPT 답변 생성 함수 (스트리밍)
async def generate_answer_stream(question: str, context_chunks: List[Dict]) -> AsyncGenerator[tuple[str, bool], None]:
    """
    GPT-4를 사용하여 답변을 스트리밍으로 생성
    yield (chunk_text, is_done)
    """
    # 문서별로 청크를 그룹핑 (중복 문서 제거, 처음부터 올바른 Reference 번호 사용)
    doc_order, seen_docs = group_chunks_by_document(context_chunks)

    # 컨텍스트 구성 (문서별로 통합된 Reference 번호)
    context_text = ""
    for i, ref_key in enumerate(doc_order, 1):
        chunks = seen_docs[ref_key]
        first_chunk = chunks[0]

        context_text += f"\n[Reference {i}] {first_chunk['source']}, {first_chunk['title']}, {first_chunk['year']}\n"

        # 같은 문서의 여러 페이지 내용을 결합
        for chunk in chunks:
            context_text += f"(Page {chunk['page']})\n{chunk['text']}\n"
        context_text += "-" * 80 + "\n"

    # 시스템 프롬프트
    system_prompt = """You are a professional AI assistant specializing in veterinary clinical guidelines for veterinarians.

Provide professional and detailed answers based on the provided veterinary guidelines.

Important rules:
1. Always cite reference numbers in square brackets at the end of each sentence or paragraph (e.g., [1], [2-3], [1,4])
2. Answers should be sufficiently detailed and medically accurate
3. Include background information, recommendations, and evidence levels comprehensively
4. **CRITICAL: Always respond in the SAME LANGUAGE as the user's question**
   - If the user asks in English, respond in English
   - If the user asks in Korean, respond in Korean
5. Use professional veterinary medical terminology, and include English terms in parentheses when necessary
6. Explicitly state if information is not available in the provided guidelines
7. Actively use headings (##), subheadings (###), bullet points, and table formats when needed
8. Use Markdown format to create structured answers"""

    # 사용자 프롬프트
    user_prompt = f"""Please answer the following question based on the veterinary clinical guideline content provided below:

{context_text}

Question: {question}

Answer Guidelines:
1. **CRITICAL**: Cite ONLY using bracketed numbers at the end of sentences (e.g., "...is recommended.[1]" or "...has been reported.[2-3]")
2. **DO NOT mention "Reference 1", "Reference 2", "according to Reference X", or "based on Reference Y" in your answer text**
3. **ONLY use bracketed citations [1], [2], [3], etc.**
4. Write detailed answers in 3-5 paragraphs including background information, clinical significance, and specific recommendations
5. Maintain a professional and academic tone
6. Mention recommendation grades or evidence levels when available
7. **Important**: Use the following formats to convey content more clearly:
   - Headings: ## Main Recommendations
   - Subheadings: ### First-line Treatment
   - Bullet points: - Item 1
   - Numbered lists: 1. First
   - Tables: Use markdown tables when comparisons are needed"""

    try:
        stream = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=3000,
            stream=True  # 스트리밍 활성화
        )

        full_answer = ""
        chunk_num = 0
        for chunk in stream:
            if chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                full_answer += content
                chunk_num += 1
                # 실시간 청크 전송 (타이핑 효과)
                print(f"📝 Chunk #{chunk_num}: {content[:30]}... ({len(content)} chars)")
                yield (content, False)

                # 비동기 yield 허용을 위한 짧은 지연
                await asyncio.sleep(0)

        # 스트리밍 완료
        print(f"✅ Streaming complete. Total: {chunk_num} chunks, {len(full_answer)} chars")
        yield (full_answer, True)

    except Exception as e:
        print(f"GPT 스트리밍 오류: {e}")
        yield ("죄송합니다. 답변 생성 중 오류가 발생했습니다.", True)


# 문서별 그룹핑 함수
def group_chunks_by_document(context_chunks: List[Dict]) -> tuple[list, dict]:
    """
    청크를 문서별로 그룹핑하고, 문서 순서와 매핑 정보 반환
    Returns: (doc_order, grouped_chunks)
    """
    seen_docs = {}
    doc_order = []

    for chunk in context_chunks:
        ref_key = f"{chunk['source']}_{chunk['title']}_{chunk['year']}"
        if ref_key not in seen_docs:
            seen_docs[ref_key] = []
            doc_order.append(ref_key)
        seen_docs[ref_key].append(chunk)

    return doc_order, seen_docs


# 기존 generate_answer 함수 (참고문헌 추출용)
async def extract_references_from_answer(answer: str, context_chunks: List[Dict]) -> List[Reference]:
    """
    답변에서 실제 사용된 참고문헌만 추출 (이미 올바른 번호로 citation됨)
    """
    try:
        # 답변에서 실제 사용된 citation 번호 추출
        cited_indices = extract_cited_indices(answer)

        # 문서별로 그룹핑 (GPT가 받은 것과 동일)
        doc_order, seen_docs = group_chunks_by_document(context_chunks)

        # 실제 사용된 참고문헌만 추출
        references = []

        for idx in sorted(cited_indices):
            # citation은 1부터 시작
            if 1 <= idx <= len(doc_order):
                ref_key = doc_order[idx - 1]
                chunks = seen_docs[ref_key]
                first_chunk = chunks[0]  # 대표 청크 사용

                # Title을 사용해서 filename 찾기
                paper_url = ""
                chunk_title = first_chunk['title'].strip()
                normalized_title = chunk_title.lower().strip()

                # Title → Filename 매핑에서 찾기
                source_filename = TITLE_TO_FILENAME.get(normalized_title, "")

                if source_filename:
                    # Filename → URL 매핑에서 찾기
                    paper_url = PDF_URL_MAPPING.get(source_filename, "")
                    if paper_url:
                        print(f"✅ URL found: {chunk_title[:50]}... → {source_filename} → {paper_url}")
                    else:
                        print(f"⚠️  Filename found but no URL: {chunk_title[:50]}... → {source_filename}")
                else:
                    print(f"⚠️  No filename mapping for title: {chunk_title[:50]}...")
                    print(f"   Normalized title: {normalized_title[:50]}...")

                references.append(Reference(
                    source=first_chunk['source'],
                    title=first_chunk['title'],
                    year=first_chunk['year'],
                    page=0,  # Page 정보 제거
                    text=first_chunk['text'][:200] + "...",
                    authors=first_chunk.get('authors', ''),
                    journal=first_chunk.get('journal', ''),
                    doi=first_chunk.get('doi', ''),
                    score=first_chunk.get('score', 0.0),
                    url=paper_url
                ))

        # 더 이상 재매핑 필요 없음 (GPT가 이미 올바른 번호 사용)
        return answer, references

    except Exception as e:
        print(f"참고문헌 추출 오류: {e}")
        return answer, []


# 후속 질문 생성 함수
async def generate_followup_questions(question: str, answer: str, conversation_history: List[Dict]) -> List[str]:
    """
    GPT-4o-mini를 사용하여 맥락 기반 후속 질문 3-4개 생성
    """
    # 대화 맥락 구성
    context = ""
    if conversation_history:
        context = "Previous conversation:\n"
        for msg in conversation_history[-3:]:  # 최근 3개만
            context += f"{msg['role']}: {msg['content'][:200]}...\n"

    prompt = f"""Based on the following veterinary medicine Q&A conversation, generate 3-4 relevant follow-up questions that a veterinarian might ask.

{context}

Current Question: {question}

Current Answer: {answer[:500]}...

Generate 3-4 follow-up questions that:
1. Are directly related to the current topic
2. Explore deeper clinical details
3. Ask about related conditions or treatments
4. Are practical and useful for veterinarians

**CRITICAL**: Respond in the SAME LANGUAGE as the original question.
- If the question is in Korean, generate Korean follow-up questions
- If the question is in English, generate English follow-up questions

Return ONLY the questions, one per line, without numbering or bullet points."""

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",  # 가성비 있는 모델
            messages=[
                {"role": "system", "content": "You are a helpful assistant that generates relevant follow-up questions for veterinary medical discussions."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=300
        )

        questions_text = response.choices[0].message.content
        questions = [q.strip() for q in questions_text.split('\n') if q.strip() and not q.strip().startswith(('-', '•', '*', '1.', '2.', '3.', '4.'))]

        # 최대 4개까지만
        return questions[:4]

    except Exception as e:
        print(f"후속 질문 생성 오류: {e}")
        return []


# 언어 감지 함수 (간단한 휴리스틱)
def detect_language(text: str) -> str:
    """
    간단한 정규식 기반 언어 감지
    - 한글: Korean
    - 일본어: Japanese
    - 기타: English (기본값)
    """
    # 한글 유니코드 범위: AC00-D7A3
    if re.search(r'[\uAC00-\uD7A3]', text):
        return "Korean"
    # 일본어 유니코드 범위: 히라가나(3040-309F), 카타카나(30A0-30FF), 한자(4E00-9FFF)
    if re.search(r'[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]', text):
        return "Japanese"
    return "English"


# 질문 번역 함수
async def translate_to_english(question: str, detected_lang: str) -> str:
    """
    비영어 질문을 영어로 빠르게 번역
    이미 영어면 그대로 반환
    """
    if detected_lang == "English":
        return question

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",  # 빠른 번역용
            messages=[
                {"role": "system", "content": "You are a professional medical translator. Translate the following veterinary medical question to English accurately. Return ONLY the translated question, nothing else."},
                {"role": "user", "content": question}
            ],
            temperature=0.3,
            max_tokens=300
        )
        translated = response.choices[0].message.content.strip()
        print(f"✅ 번역 완료: {detected_lang} → English")
        print(f"   원문: {question[:100]}...")
        print(f"   번역: {translated[:100]}...")
        return translated
    except Exception as e:
        print(f"⚠️  번역 실패, 원문 사용: {e}")
        return question


# SSE 스트리밍 엔드포인트 (최적화 버전)
async def query_stream_generator(question: str, conversation_history: List[Dict] = [], language: str = "한국어") -> AsyncGenerator[str, None]:
    """
    질문에 대한 답변을 실시간 SSE 스트리밍
    최적화:
    1. 번역 제거 - 다국어 임베딩 직접 사용
    2. GPT 실시간 스트리밍
    3. 후속 질문 병렬 생성
    """
    try:
        # 1단계: 질문 벡터화 (번역 제거 - 다국어 임베딩 사용)
        yield create_sse_event({
            "status": "embedding",
            "message": "질문을 벡터로 변환 중..."
        })

        embedding_response = openai_client.embeddings.create(
            model="text-embedding-3-small",
            input=question  # 원본 질문 직접 사용 (다국어 지원)
        )
        query_embedding = embedding_response.data[0].embedding

        # 2단계: 벡터 DB 검색
        yield create_sse_event({
            "status": "searching",
            "message": "의학 문헌 및 가이드라인 검색 중..."
        })

        context_chunks = await search_pinecone(query_embedding, top_k=8, min_similarity=0.48)

        if not context_chunks:
            # 언어별 에러 메시지
            print(f"🌐 받은 언어: {language}")
            error_messages = {
                "한국어": "Ruleout은 수의사가 근거 기반 임상 결정을 내리도록 돕기 위해 설계되었습니다.\n\n다음과 같은 질문을 시도해보세요:\n\"급성 심부전이 의심되는 개에게 어떤 진단 검사를 지시해야 하나요?\"",
                "English": "Ruleout is designed to help veterinarians make evidence-based clinical decisions.\n\nTry asking a question like:\n\"What diagnostic tests should I order for a dog with suspected acute heart failure?\"",
                "日本語": "Ruleoutは、獣医師がエビデンスに基づいた臨床判断を下すのを支援するために設計されています。\n\n次のような質問を試してみてください：\n「急性心不全が疑われる犬にどのような診断検査を指示すべきですか？\""
            }
            error_message = error_messages.get(language, error_messages["한국어"])
            print(f"📝 에러 메시지 선택: {error_message[:50]}...")

            yield create_sse_event({
                "status": "error",
                "message": error_message
            })
            return

        # 3단계: GPT 답변 스트리밍 시작
        yield create_sse_event({
            "status": "generating",
            "message": "답변 생성 중..."
        })

        # GPT 스트리밍
        full_answer = ""
        chunk_count = 0
        async for chunk_content, is_done in generate_answer_stream(question, context_chunks):
            if not is_done:
                # 스트리밍 청크 전송
                chunk_count += 1
                event_data = create_sse_event({
                    "status": "streaming",
                    "chunk": chunk_content
                })
                print(f"🔥 Sending chunk #{chunk_count}: {len(chunk_content)} chars")
                yield event_data
            else:
                # 스트리밍 완료 - full_answer 받음
                full_answer = chunk_content
                print(f"✅ Total chunks sent: {chunk_count}")

        # 4단계: 참고문헌 추출 및 후속 질문 생성 (병렬 실행)
        print("📚 참고문헌 추출 및 후속 질문 생성 시작...")

        # 병렬 실행을 위한 태스크 생성
        refs_task = extract_references_from_answer(full_answer, context_chunks)
        followup_task = generate_followup_questions(question, full_answer, conversation_history)

        # 동시 실행
        results = await asyncio.gather(refs_task, followup_task, return_exceptions=True)

        # 결과 처리
        if isinstance(results[0], tuple):
            remapped_answer, references = results[0]
        else:
            print(f"참고문헌 추출 오류: {results[0]}")
            remapped_answer = full_answer
            references = []

        if isinstance(results[1], list):
            followup_questions = results[1]
        else:
            print(f"후속 질문 생성 오류: {results[1]}")
            followup_questions = []

        # 5단계: 완료 (재매핑된 답변 + 참고문헌 + 후속 질문)
        yield create_sse_event({
            "status": "done",
            "message": "완료",
            "answer": remapped_answer,
            "references": [ref.dict() for ref in references],
            "followup_questions": followup_questions
        })

    except Exception as e:
        print(f"스트리밍 오류: {e}")
        import traceback
        traceback.print_exc()
        yield create_sse_event({
            "status": "error",
            "message": f"오류 발생: {str(e)}"
        })


@app.get("/")
async def root():
    """헬스 체크"""
    return {
        "service": "의료 가이드라인 RAG API",
        "status": "running",
        "version": "1.0.0"
    }


@app.post("/query-stream")
async def query_stream(request: QueryRequest):
    """
    SSE를 사용한 질문 처리 (실시간 진행상황 표시 + 후속 질문 생성)
    """
    if not request.question or not request.question.strip():
        raise HTTPException(status_code=400, detail="질문을 입력해주세요")

    return StreamingResponse(
        query_stream_generator(request.question, request.conversation_history, request.language),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@app.get("/health")
async def health_check():
    """상세 헬스 체크"""
    try:
        # Pinecone 연결 확인
        stats = pinecone_index.describe_index_stats()

        return {
            "status": "healthy",
            "services": {
                "openai": "connected" if OPENAI_API_KEY else "not_configured",
                "pinecone": "connected",
                "vectors": stats.total_vector_count
            }
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
