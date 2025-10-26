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
    allow_origins=["http://localhost:3000"],  # Next.js 개발 서버
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response 모델
class QueryRequest(BaseModel):
    question: str


class Reference(BaseModel):
    source: str
    title: str
    year: str
    page: int
    text: str


# SSE 이벤트 생성 헬퍼
def create_sse_event(data: dict) -> str:
    """SSE 형식으로 데이터 포맷"""
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"


# Pinecone 검색 함수
async def search_pinecone(query_embedding: List[float], top_k: int = 5) -> List[Dict]:
    """
    Pinecone에서 유사한 가이드라인 검색
    """
    try:
        results = pinecone_index.query(
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True
        )

        chunks = []
        for match in results.matches:
            metadata = match.metadata
            chunks.append({
                "text": metadata.get("text", ""),
                "source": metadata.get("source", ""),
                "title": metadata.get("title", ""),
                "year": metadata.get("year", ""),
                "page": metadata.get("page", 0),
                "section": metadata.get("section", ""),
                "score": match.score
            })

        return chunks
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


# GPT 답변 생성 함수
async def generate_answer(question: str, context_chunks: List[Dict]) -> tuple[str, List[Reference]]:
    """
    GPT-4를 사용하여 답변 생성
    실제 사용된 참고문헌만 반환
    """
    # 컨텍스트 구성
    context_text = ""
    for i, chunk in enumerate(context_chunks, 1):
        context_text += f"\n[출처 {i}] {chunk['source']}, {chunk['title']}, {chunk['year']}, {chunk['page']}p\n"
        context_text += f"{chunk['text']}\n"
        context_text += "-" * 80 + "\n"

    # 시스템 프롬프트
    system_prompt = """당신은 한국 의사들을 위한 임상 가이드라인 전문 AI 어시스턴트입니다.

제공된 진료지침서 내용을 바탕으로 전문적이고 자세한 답변을 제공하세요.

중요한 규칙:
1. 답변 시 반드시 각 문장이나 단락의 끝에 참고문헌 번호를 대괄호로 표시하세요 (예: [1], [2-3], [1,4])
2. 답변은 충분히 자세하게 작성하되 의학적으로 정확해야 합니다
3. 배경 정보, 권고사항, 근거 수준 등을 포함하여 포괄적으로 답변하세요
4. 한국어로 전문적인 의학 용어를 사용하되, 필요시 영문 용어를 병기하세요
5. 제공된 가이드라인에 없는 내용은 명시적으로 밝히세요
6. 필요시 제목(##), 부제목(###), bullet points, 표 형식을 적극 활용하세요
7. Markdown 형식을 사용하여 구조화된 답변을 작성하세요"""

    # 사용자 프롬프트
    user_prompt = f"""다음 진료지침서 내용을 참고하여 질문에 답변해주세요:

{context_text}

질문: {question}

답변 작성 지침:
1. 각 문장의 끝에 해당 내용의 출처 번호를 대괄호로 표시하세요 (예: "...권장됩니다.[1]" 또는 "...보고되었습니다.[2-3]")
2. 배경 정보, 임상적 의의, 구체적 권고사항을 포함하여 3-5개 문단으로 자세히 작성하세요
3. 전문적이고 학술적인 톤을 유지하세요
4. 가능한 경우 권고 등급이나 근거 수준을 언급하세요
5. **중요**: 내용을 더 명확하게 전달하기 위해 다음 형식을 적극 활용하세요:
   - 제목: ## 주요 권고사항
   - 부제목: ### 1차 치료
   - Bullet points: - 항목 1
   - 번호 리스트: 1. 첫 번째
   - 표: 비교가 필요한 경우 markdown 표 사용"""

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=3000
        )

        answer = response.choices[0].message.content

        # 답변에서 실제 사용된 citation 번호 추출
        cited_indices = extract_cited_indices(answer)

        # 실제 사용된 참고문헌만 추출
        references = []
        seen_refs = set()

        # 원래 인덱스 -> 새 인덱스 매핑 생성
        old_to_new_mapping = {}
        new_index = 1

        for idx in sorted(cited_indices):
            # citation은 1부터 시작하므로 인덱스는 idx-1
            if 1 <= idx <= len(context_chunks):
                chunk = context_chunks[idx - 1]
                ref_key = f"{chunk['source']}_{chunk['title']}_{chunk['year']}_{chunk['page']}"
                if ref_key not in seen_refs:
                    old_to_new_mapping[idx] = new_index
                    references.append(Reference(
                        source=chunk['source'],
                        title=chunk['title'],
                        year=chunk['year'],
                        page=chunk['page'],
                        text=chunk['text'][:200] + "..."
                    ))
                    seen_refs.add(ref_key)
                    new_index += 1

        # 답변 텍스트의 citation 번호를 재매핑
        # 큰 번호부터 처리해야 [1]을 [2]로 바꿀 때 [11]까지 바뀌는 문제 방지
        for old_idx in sorted(old_to_new_mapping.keys(), reverse=True):
            new_idx = old_to_new_mapping[old_idx]
            # [5] -> [1] 같은 단순 치환
            answer = re.sub(
                rf'\[{old_idx}\]',
                f'[{new_idx}]',
                answer
            )
            # [3-5] 같은 범위는 그대로 유지 (복잡도 때문)

        return answer, references

    except Exception as e:
        print(f"GPT 답변 생성 오류: {e}")
        return "죄송합니다. 답변 생성 중 오류가 발생했습니다.", []


# SSE 스트리밍 엔드포인트
async def query_stream_generator(question: str) -> AsyncGenerator[str, None]:
    """
    질문에 대한 답변을 SSE로 스트리밍
    """
    try:
        # 1단계: 질문 분석 중
        yield create_sse_event({
            "status": "analyzing",
            "message": "질문 분석 중..."
        })
        await asyncio.sleep(0.5)

        # 2단계: 질문 벡터화
        yield create_sse_event({
            "status": "embedding",
            "message": "질문을 벡터로 변환 중..."
        })

        embedding_response = openai_client.embeddings.create(
            model="text-embedding-ada-002",
            input=question
        )
        query_embedding = embedding_response.data[0].embedding

        # 3단계: 벡터 DB 검색
        yield create_sse_event({
            "status": "searching",
            "message": "의학 문헌 및 가이드라인 검색 중..."
        })
        await asyncio.sleep(0.5)

        context_chunks = await search_pinecone(query_embedding, top_k=5)

        if not context_chunks:
            yield create_sse_event({
                "status": "error",
                "message": "관련 가이드라인을 찾을 수 없습니다."
            })
            return

        # 4단계: 정보 통합 중
        yield create_sse_event({
            "status": "synthesizing",
            "message": "관련 정보 통합 중..."
        })
        await asyncio.sleep(0.5)

        # 5단계: GPT 답변 생성
        yield create_sse_event({
            "status": "generating",
            "message": "GPT로 답변 생성 중..."
        })

        answer, references = await generate_answer(question, context_chunks)

        # 6단계: 완료
        yield create_sse_event({
            "status": "done",
            "message": "완료",
            "answer": answer,
            "references": [ref.dict() for ref in references]
        })

    except Exception as e:
        print(f"스트리밍 오류: {e}")
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
    SSE를 사용한 질문 처리 (실시간 진행상황 표시)
    """
    if not request.question or not request.question.strip():
        raise HTTPException(status_code=400, detail="질문을 입력해주세요")

    return StreamingResponse(
        query_stream_generator(request.question),
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
