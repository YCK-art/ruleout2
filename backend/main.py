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
async def generate_answer_stream(question: str, context_chunks: List[Dict], detected_lang: str = "English") -> AsyncGenerator[tuple[str, bool], None]:
    """
    GPT-4를 사용하여 답변을 스트리밍으로 생성
    question: 원본 질문 (한국어/일본어/영어)
    detected_lang: 감지된 언어 (Korean/Japanese/English)
    yield (chunk_text, is_done)
    """
    # 문서별로 청크를 그룹핑 (중복 문서 제거, 처음부터 올바른 Reference 번호 사용)
    doc_order, seen_docs = group_chunks_by_document(context_chunks)

    print(f"📚 generate_answer_stream:")
    print(f"   context_chunks: {len(context_chunks)} chunks")
    print(f"   doc_order: {len(doc_order)} documents")

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

    # 언어별 응답 언어 지시
    language_instruction = {
        "Korean": "**CRITICAL: You MUST respond in KOREAN (한국어). All your answers, explanations, and text must be written in Korean.**",
        "Japanese": "**CRITICAL: You MUST respond in JAPANESE (日本語). All your answers, explanations, and text must be written in Japanese.**",
        "English": "**CRITICAL: You MUST respond in ENGLISH. All your answers, explanations, and text must be written in English.**"
    }

    lang_instruction = language_instruction.get(detected_lang, language_instruction["English"])

    # 시스템 프롬프트
    system_prompt = f"""You are a professional AI assistant specializing in veterinary clinical guidelines for veterinarians.

Provide professional and detailed answers based on the provided veterinary guidelines.

{lang_instruction}

**CRITICAL - Response Style Selection:**
Before answering, analyze the question type and automatically adjust your response format:

A) **DIAGNOSTIC/DIFFERENTIAL Questions** (e.g., what disease causes X, my dog has Y symptom, possible causes of Z):
   → Provide SPECIFIC disease names in a clear list format
   → For each disease, include:
     * Characteristic clinical signs (be specific, not vague)
     * Typical duration/progression
     * Predisposed breeds/ages if relevant
     * Key differential points
   → Use bullet points or tables for clarity
   → Example format:
     **Possible Diseases:**

     1. **Kennel Cough (Infectious Tracheobronchitis)**
        - Clinical signs: Dry, hacking cough with honking sound; often worse with excitement
        - Duration: 7-10 days with self-limiting course
        - Notes: Activity and appetite usually normal[1]

     2. **Canine Influenza (H3N8/H3N2)**
        - Clinical signs: Wet cough, high fever (over 42C), lethargy, nasal discharge
        - Risk: Highly contagious in group settings; may progress to pneumonia
        - Notes: Requires supportive care and monitoring for secondary infections[2]

B) **TREATMENT/PROTOCOL Questions** (e.g., how to treat X, what drugs for Y, dosage recommendations):
   → Provide SPECIFIC drug names, dosages, and protocols
   → Use tables when comparing multiple treatment options
   → Include contraindications and monitoring parameters
   → Be practical and clinically actionable

C) **GENERAL KNOWLEDGE/PATHOPHYSIOLOGY Questions** (e.g., what is X, explain the mechanism, background on Y):
   → Provide comprehensive conceptual explanations
   → Use detailed paragraphs explaining mechanisms and concepts
   → Include background information and evidence basis

Important rules:
1. Always cite reference numbers in square brackets at the end of each sentence or paragraph (e.g., [1], [2-3], [1,4])
2. Be SPECIFIC and PRACTICAL - avoid vague statements like various conditions or may cause
3. Use concrete numbers, durations, breed names, drug names when available
4. Include clinical significance and practical implications for veterinarians
5. Use professional veterinary medical terminology, and include English terms in parentheses when necessary
6. Explicitly state if information is not available in the provided guidelines
7. Actively use headings (##), subheadings (###), bullet points, and table formats when needed
8. Use Markdown format to create structured answers"""

    # 사용 가능한 Reference 번호 계산
    num_references = len(doc_order)
    valid_refs = ", ".join([f"[{i}]" for i in range(1, num_references + 1)])

    # 사용자 프롬프트
    user_prompt = f"""Please answer the following question based on the veterinary clinical guideline content provided below:

{context_text}

Question: {question}

Answer Guidelines:
1. **CRITICAL**: You have EXACTLY {num_references} references available: {valid_refs}
2. **ONLY cite these numbers**: {valid_refs}. DO NOT use any other numbers like [6], [7], [8] etc. if they don't exist.
3. **EVERY sentence must cite at least one reference**. If you cannot answer based on the provided references, say "The provided guidelines do not contain information about this topic."
4. Cite using bracketed numbers at the end of sentences (e.g., "...is recommended.[1]" or "...has been reported.[2-3]")
5. **DO NOT mention "Reference 1", "Reference 2", "according to Reference X", or "based on Reference Y" in your answer text**
6. **ONLY use bracketed citations like [1], [2], [3]**
7. Write detailed answers in 2-4 paragraphs including background information, clinical significance, and specific recommendations
8. Maintain a professional and academic tone
9. Mention recommendation grades or evidence levels when available
10. **Important - Formatting Guidelines**:
   - Headings: ## Main Recommendations
   - Subheadings: ### First-line Treatment
   - Bullet points: - Item 1
   - Numbered lists: 1. First
   - **Tables: ACTIVELY USE markdown tables when:**
     * Comparing drugs/medications (dosage, side effects, contraindications)
     * Listing multiple treatment options with characteristics
     * Comparing diagnostic tests (sensitivity, specificity, cost)
     * Showing breed-specific or age-specific recommendations
     * Any comparison or structured data that benefits from tabular format
   - Example table format:
     | Drug | Dosage | Side Effects | Notes |
     |------|--------|--------------|-------|
     | Drug A | 10mg | Nausea | First-line[1] |"""

    try:
        stream = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=1200,  # 2000 → 1200으로 감소 (더 간결한 답변)
            stream=True  # 스트리밍 활성화
        )

        full_answer = ""
        chunk_num = 0
        seen_citations = set()  # 실시간으로 등장한 citation 추적
        citation_map = {}  # 원본 번호 → 재매핑된 번호
        buffer = ""  # 청크 버퍼 (완전한 citation 감지용)

        import sys
        print(f"\n🚀 Starting stream with num_references={num_references}", file=sys.stderr, flush=True)

        for chunk in stream:
            if chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                chunk_num += 1

                # 버퍼에 추가
                buffer += content

                # 버퍼에서 완전한 citation 패턴 찾기 및 즉시 재매핑
                output_chunk = ""

                while buffer:
                    # citation 패턴 찾기: [숫자]
                    match = re.search(r'\[(\d+)\]', buffer)

                    if match:
                        cite_num = int(match.group(1))

                        # citation 앞부분 먼저 출력
                        before_citation = buffer[:match.start()]
                        output_chunk += before_citation

                        # 유효한 citation인지 확인
                        if 1 <= cite_num <= num_references:
                            # 처음 등장하는 citation이면 매핑 생성
                            if cite_num not in seen_citations:
                                seen_citations.add(cite_num)
                                citation_map[cite_num] = len(citation_map) + 1
                                print(f"🆕 New citation discovered: [{cite_num}] → [{citation_map[cite_num]}]", file=sys.stderr, flush=True)

                            # 재매핑된 번호로 출력
                            new_num = citation_map[cite_num]
                            output_chunk += f"[{new_num}]"
                            print(f"   ✅ Remapped [{cite_num}] → [{new_num}]", file=sys.stderr, flush=True)
                        else:
                            # 무효한 citation은 제거 (빈 문자열)
                            print(f"⚠️  Invalid citation [{cite_num}] removed (max: {num_references})", file=sys.stderr, flush=True)

                        # 버퍼에서 처리된 부분 제거
                        buffer = buffer[match.end():]
                    else:
                        # citation이 없으면, 마지막 5글자는 남겨둠 (다음 청크에서 [가 올 수 있음)
                        if len(buffer) > 5:
                            output_chunk += buffer[:-5]
                            buffer = buffer[-5:]
                        break

                # 재매핑된 청크 출력
                if output_chunk:
                    full_answer += output_chunk
                    yield (output_chunk, False)

                # 비동기 yield 허용을 위한 짧은 지연
                await asyncio.sleep(0)

        # 스트리밍 완료 후 버퍼에 남은 내용 처리 (재매핑 적용)
        if buffer:
            print(f"📝 Final buffer before processing: '{buffer}'", file=sys.stderr, flush=True)

            # 버퍼에 남은 citation도 재매핑
            while buffer:
                match = re.search(r'\[(\d+)\]', buffer)

                if match:
                    cite_num = int(match.group(1))
                    before_citation = buffer[:match.start()]
                    full_answer += before_citation

                    if 1 <= cite_num <= num_references:
                        if cite_num not in seen_citations:
                            seen_citations.add(cite_num)
                            citation_map[cite_num] = len(citation_map) + 1
                            print(f"🆕 New citation in final buffer: [{cite_num}] → [{citation_map[cite_num]}]", file=sys.stderr, flush=True)

                        new_num = citation_map[cite_num]
                        full_answer += f"[{new_num}]"
                        print(f"   ✅ Remapped [{cite_num}] → [{new_num}] in final buffer", file=sys.stderr, flush=True)
                        yield (before_citation + f"[{new_num}]", False)
                    else:
                        print(f"⚠️  Invalid citation [{cite_num}] removed from final buffer", file=sys.stderr, flush=True)
                        yield (before_citation, False)

                    buffer = buffer[match.end():]
                else:
                    # citation 없으면 그대로 출력
                    full_answer += buffer
                    yield (buffer, False)
                    break

        # 스트리밍 완료 - 답변 검증
        print(f"✅ Streaming complete. Final citation_map: {citation_map}", file=sys.stderr, flush=True)
        print(f"   Total: {chunk_num} chunks, {len(full_answer)} chars", file=sys.stderr, flush=True)

        # Citation 검증 - 실시간 필터링으로 이미 처리되었으므로 최종 확인만
        final_cited = extract_cited_indices(full_answer)
        invalid_citations = [idx for idx in final_cited if idx > num_references]

        if invalid_citations:
            # 혹시 놓친 잘못된 citation이 있으면 제거 (이중 안전장치)
            print(f"⚠️  Missed invalid citations: {invalid_citations}. Removing...")
            for invalid_idx in sorted(invalid_citations, reverse=True):
                full_answer = re.sub(rf'\[{invalid_idx}\]', '', full_answer)
            final_cited = extract_cited_indices(full_answer)

        # Citation 존재 검증 - 참고문헌이 없으면 에러
        if not final_cited:
            print(f"❌ No valid citations found in answer")
            error_msg = "The provided guidelines do not contain sufficient information to answer this question."
            yield (error_msg, True, doc_order, seen_docs, {})
            return

        print(f"✅ Validation passed. Valid citations: {sorted(final_cited)}")
        print(f"🔄 Final citation mapping: {citation_map}")
        # doc_order, seen_docs, citation_map 함께 반환
        yield (full_answer, True, doc_order, seen_docs, citation_map)

    except Exception as e:
        print(f"GPT 스트리밍 오류: {e}")
        yield ("죄송합니다. 답변 생성 중 오류가 발생했습니다.", True, [], {}, {})


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
async def extract_references_from_answer(answer: str, doc_order: List[str], seen_docs: Dict, citation_map: Dict = None) -> List[Reference]:
    """
    답변에서 실제 사용된 참고문헌만 추출 (스트리밍 중 이미 재매핑됨)
    doc_order, seen_docs, citation_map은 generate_answer_stream에서 전달받음
    """
    try:
        # 답변에서 실제 사용된 citation 번호 추출 (이미 재매핑된 상태)
        cited_indices = extract_cited_indices(answer)

        print(f"🔍 extract_references_from_answer:")
        print(f"   doc_order: {len(doc_order)} documents")
        print(f"   cited_indices (already remapped): {sorted(cited_indices)}")
        print(f"   citation_map from streaming: {citation_map}")

        # 스트리밍에서 이미 재매핑되어 있으므로, 역매핑 생성 (새 번호 → 원본 번호)
        reverse_map = {v: k for k, v in (citation_map or {}).items()}
        print(f"   reverse_map: {reverse_map}")

        # 실제 사용된 참고문헌만 추출 (이미 재매핑된 번호 기준)
        references = []

        for new_idx in sorted(cited_indices):
            # 역매핑으로 원본 문서 번호 찾기
            old_idx = reverse_map.get(new_idx, new_idx)  # 매핑이 없으면 그대로 사용

            # citation은 1부터 시작
            if 1 <= old_idx <= len(doc_order):
                ref_key = doc_order[old_idx - 1]
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
            else:
                print(f"❌ ERROR: Citation [{old_idx}] out of range! doc_order has only {len(doc_order)} documents")
                print(f"   This should have been caught in validation!")
                continue

        # 스트리밍에서 이미 재매핑되었으므로 answer를 그대로 반환
        print(f"✅ Extracted {len(references)} references (citations already remapped during streaming)")
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
    1. 언어 감지 및 쿼리 번역 (한국어/일본어 → 영어)
    2. 영어 쿼리로 벡터 검색 (정확도 향상)
    3. GPT 실시간 스트리밍 (원본 언어로 답변)
    4. 후속 질문 병렬 생성
    """
    try:
        # 1단계: 언어 감지 및 번역 (필요 시)
        detected_lang = detect_language(question)
        print(f"🌐 감지된 언어: {detected_lang}")

        # 영어가 아니면 번역
        if detected_lang != "English":
            yield create_sse_event({
                "status": "translating",
                "message": f"질문을 영어로 번역 중... (감지된 언어: {detected_lang})"
            })
            english_query = await translate_to_english(question, detected_lang)
        else:
            english_query = question

        # 2단계: 질문 벡터화 (영어 질문 사용)
        yield create_sse_event({
            "status": "embedding",
            "message": "질문을 벡터로 변환 중..."
        })

        embedding_response = openai_client.embeddings.create(
            model="text-embedding-3-small",
            input=english_query  # 영어로 번역된 질문 사용
        )
        query_embedding = embedding_response.data[0].embedding

        # 3단계: 벡터 DB 검색
        yield create_sse_event({
            "status": "searching",
            "message": "의학 문헌 및 가이드라인 검색 중..."
        })

        context_chunks = await search_pinecone(query_embedding, top_k=10, min_similarity=0.48)

        if not context_chunks:
            # 언어별 에러 메시지 (detected_lang 사용)
            print(f"🌐 감지된 언어: {detected_lang}")
            error_messages = {
                "Korean": "Ruleout은 수의사가 근거 기반 임상 결정을 내리도록 돕기 위해 설계되었습니다.\n\n다음과 같은 질문을 시도해보세요:\n\"급성 심부전이 의심되는 개에게 어떤 진단 검사를 지시해야 하나요?\"",
                "English": "Ruleout is designed to help veterinarians make evidence-based clinical decisions.\n\nTry asking a question like:\n\"What diagnostic tests should I order for a dog with suspected acute heart failure?\"",
                "Japanese": "Ruleoutは、獣医師がエビデンスに基づいた臨床判断を下すのを支援するために設計されています。\n\n次のような質問を試してみてください：\n「急性心不全が疑われる犬にどのような診断検査を指示すべきですか？\""
            }
            error_message = error_messages.get(detected_lang, error_messages["Korean"])
            print(f"📝 에러 메시지 선택: {error_message[:50]}...")

            yield create_sse_event({
                "status": "error",
                "message": error_message
            })
            return

        # 4단계: GPT 답변 스트리밍 시작
        yield create_sse_event({
            "status": "generating",
            "message": "답변 생성 중..."
        })

        # GPT 스트리밍 (원본 질문과 감지된 언어 전달)
        full_answer = ""
        chunk_count = 0
        doc_order = []
        seen_docs = {}
        citation_map = {}
        async for result in generate_answer_stream(question, context_chunks, detected_lang):
            if len(result) == 2:  # 스트리밍 중
                chunk_content, is_done = result
                # 스트리밍 청크 전송
                chunk_count += 1
                event_data = create_sse_event({
                    "status": "streaming",
                    "chunk": chunk_content
                })
                print(f"🔥 Sending chunk #{chunk_count}: {len(chunk_content)} chars")
                yield event_data
            else:  # 스트리밍 완료
                full_answer, is_done, doc_order, seen_docs, citation_map = result
                print(f"✅ Total chunks sent: {chunk_count}")

        # 5단계: 참고문헌 추출 및 후속 질문 생성 (병렬 실행)
        print("📚 참고문헌 추출 및 후속 질문 생성 시작...")

        # 병렬 실행을 위한 태스크 생성
        refs_task = extract_references_from_answer(full_answer, doc_order, seen_docs, citation_map)
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

        # 6단계: 완료 (재매핑된 답변 + 참고문헌 + 후속 질문)
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
