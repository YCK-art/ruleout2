# 의료 가이드라인 AI 검색 플랫폼

한국 의사들을 위한 AI 기반 진료 가이드라인 검색 서비스입니다.

## 프로젝트 구조

```
medical/
├── data-pipeline/          # PDF 처리 및 벡터화 파이프라인
├── backend/               # FastAPI 백엔드 (RAG 서비스)
├── frontend/              # Next.js 프론트엔드
└── pdf_files/             # 원본 PDF 가이드라인 파일
```

## 기술 스택

### 데이터 파이프라인
- **PyMuPDF**: PDF 텍스트 및 구조 추출
- **OpenAI Embeddings**: text-embedding-ada-002 (1536차원)
- **Pinecone**: 벡터 데이터베이스
- **시맨틱 청킹**: 제목 기반 계층적 청킹 (Level 1-3 헤딩, 최대 1200 토큰)

### 백엔드 (FastAPI)
- **FastAPI**: RESTful API 프레임워크
- **SSE (Server-Sent Events)**: 실시간 진행 상황 스트리밍
- **OpenAI GPT-4**: 답변 생성
- **Pinecone**: 유사도 검색 (top_k=5)

### 프론트엔드 (Next.js)
- **Next.js 14**: React 프레임워크
- **TypeScript**: 타입 안전성
- **Tailwind CSS**: 스타일링
- **Pretendard 폰트**: 한국어 타이포그래피

## 설치 및 실행

### 1. 환경 변수 설정

backend/.env 파일에 API 키를 설정하세요:
```
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=medical-guidelines-kr
```

### 2. 데이터 파이프라인 실행 (최초 1회)

```bash
cd data-pipeline
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# PDF를 시맨틱 청크로 변환하여 Pinecone에 업로드
python semantic_chunking_pdfs.py
```

### 3. 백엔드 서버 실행

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# FastAPI 서버 시작 (포트 8000)
uvicorn main:app --reload --port 8000
```

### 4. 프론트엔드 서버 실행

```bash
cd frontend
npm install

# Next.js 개발 서버 시작 (포트 3000)
npm run dev
```

### 5. 접속

브라우저에서 http://localhost:3000 접속

## API 엔드포인트

### GET /health
서버 상태 및 연결 확인
```json
{
  "status": "healthy",
  "services": {
    "openai": "connected",
    "pinecone": "connected",
    "vectors": 1084
  }
}
```

### POST /query-stream
SSE 스트리밍 질의응답

**Request:**
```json
{
  "question": "결장암 수술 후 항암치료는 언제 시작하나요?"
}
```

**Response (SSE Stream):**
```
data: {"status": "analyzing", "message": "질문 분석 중..."}
data: {"status": "embedding", "message": "질문을 벡터로 변환 중..."}
data: {"status": "searching", "message": "의학 문헌 및 가이드라인 검색 중..."}
data: {"status": "synthesizing", "message": "관련 정보 통합 중..."}
data: {"status": "generating", "message": "GPT로 답변 생성 중..."}
data: {"status": "done", "answer": "...", "references": [...]}
```

## RAG 플로우

1. **질문 분석** - 사용자 질문 수신
2. **벡터 변환** - OpenAI Embeddings로 질문 임베딩 생성
3. **벡터 검색** - Pinecone에서 유사한 가이드라인 청크 검색 (top 5)
4. **정보 통합** - 검색된 청크를 컨텍스트로 구성
5. **답변 생성** - GPT-4로 한국어 의학 답변 생성
6. **완료** - 답변 + 참고문헌 반환

## 데이터베이스 현황

- **인덱스**: medical-guidelines-kr
- **벡터 수**: 1,084개 청크
- **출처**: 대한대장항문학회 결장암 진료권고안 2023
- **임베딩 차원**: 1536

## 주요 기능

- ✅ 의미론적 문서 청킹 (제목 기반 계층 보존)
- ✅ SSE 기반 실시간 진행 상황 표시
- ✅ GPT-4 기반 정확한 의학 답변
- ✅ 출처 명시 (학회명, 제목, 연도, 페이지)
- ✅ 반응형 다크 테마 UI
- ✅ 대화형 채팅 인터페이스

## 향후 계획

- [ ] 더 많은 의학회 가이드라인 추가
- [ ] Firebase를 통한 채팅 기록 저장
- [ ] 답변 피드백 시스템 (좋아요/싫어요)
- [ ] PDF 하이라이트 뷰어
- [ ] 다국어 지원 (영문 가이드라인)

## 라이선스

이 프로젝트는 의학 교육 목적으로만 사용되어야 하며, 실제 진료 결정은 반드시 의사의 전문적 판단에 따라 이루어져야 합니다.
