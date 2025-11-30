# 의료 가이드라인 AI 검색 시스템 - 전체 아키텍처 및 질문-응답 흐름

## 목차
1. [시스템 개요](#시스템-개요)
2. [기술 스택](#기술-스택)
3. [데이터 파이프라인](#데이터-파이프라인)
4. [질문-응답 처리 흐름](#질문-응답-처리-흐름)
5. [상세 프로세스](#상세-프로세스)

---

## 시스템 개요

이 시스템은 수의학 논문 및 가이드라인 PDF를 벡터 데이터베이스에 저장하고, 사용자 질문에 대해 RAG(Retrieval-Augmented Generation) 기반의 답변을 생성하는 AI 검색 플랫폼입니다.

### 핵심 구성 요소
- **Frontend**: Next.js (React) - 사용자 인터페이스
- **Backend**: FastAPI (Python) - API 서버
- **Vector DB**: Pinecone - 임베딩 벡터 저장소
- **LLM**: OpenAI GPT-4o-mini - 답변 생성
- **Embedding**: OpenAI text-embedding-3-small - 텍스트 벡터화
- **Database**: Firebase Firestore - 대화 히스토리 저장

---

## 기술 스택

### Frontend (Next.js)
```
- Next.js 14 (App Router)
- TypeScript
- React Markdown (답변 렌더링)
- Firebase SDK (인증 & Firestore)
- Tailwind CSS (스타일링)
```

### Backend (FastAPI)
```python
- FastAPI (비동기 웹 프레임워크)
- OpenAI SDK (GPT-4, Embeddings)
- Pinecone SDK (벡터 검색)
- SSE (Server-Sent Events) - 실시간 스트리밍
```

### Data Pipeline (Python)
```python
- PyMuPDF (fitz) - PDF 파싱
- OpenAI Embeddings API
- Pinecone Vector Database
```

---

## 데이터 파이프라인

### 1. PDF 수집 및 처리
**파일**: `data-pipeline/veterinary_pdf_pipeline_v2.py`

#### 1.1 PDF 메타데이터 추출
```python
# 파일 위치: data-pipeline/pdf_metadata_mapping.json
# 각 PDF 파일에 대한 메타데이터 (제목, 저자, 저널, 연도, DOI 등)

{
  "0000170.pdf": {
    "title": "논문 제목",
    "authors": "저자명",
    "journal": "저널명",
    "year": "2024",
    "doi": "10.1111/xxxxx"
  }
}
```

#### 1.2 PDF 텍스트 추출 및 전처리
```python
# 1. PDF 열기
doc = fitz.open(pdf_path)

# 2. 페이지별 텍스트 추출
for page_num in range(len(doc)):
    text = page.get_text()

    # 3. 노이즈 제거
    # - 목차 패턴 제거 (점선)
    # - 페이지 번호 제거
    # - 여러 줄바꿈 정리
    clean_text = clean_pdf_text(text)
```

#### 1.3 시맨틱 청킹 (Semantic Chunking)
```python
# Recursive Chunking with Overlap
chunk_size = 600 characters
overlap = 150 characters

# 문장 경계로 조정하여 자연스럽게 분할
chunks = recursive_chunk_with_overlap(clean_text,
                                      chunk_size=600,
                                      overlap=150)
```

**청킹 전략**:
- 각 청크는 약 600자 (문장 경계 고려)
- 150자 오버랩으로 문맥 유지
- 문장 중간에서 끊기지 않도록 구분자(`.`, `\n\n` 등) 기준으로 조정

#### 1.4 임베딩 생성
```python
# OpenAI Embeddings API 호출
response = client.embeddings.create(
    model="text-embedding-3-small",  # 1536 차원
    input=chunk_texts  # 배치 처리 (최대 100개)
)

embeddings = [item.embedding for item in response.data]
```

**임베딩 모델**: `text-embedding-3-small`
- 차원: 1536
- 속도: 빠름
- 비용: 저렴

#### 1.5 Pinecone에 벡터 저장
```python
# 벡터 업서트
vectors = [{
    "id": "paper_0000170_p1_c0",  # 고유 ID
    "values": embedding,           # 1536차원 벡터
    "metadata": {
        "doc_type": "paper",
        "title": "논문 제목",
        "authors": "저자명",
        "journal": "저널명",
        "year": "2024",
        "doi": "10.1111/xxxxx",
        "page": 1,
        "text": "청크 텍스트 내용...",
        "reference_format": "저자. 저널. 연도. doi:xxxxx"
    }
}]

index.upsert(vectors=vectors)
```

**현재 DB 상태**:
- 인덱스 이름: `medical-guidelines`
- 총 벡터 수: **39,757개**
- PDF 파일 범위: **0000170.pdf ~ 0000239.pdf** (70개)

---

## 질문-응답 처리 흐름

### 전체 플로우 다이어그램
```
[사용자 질문 입력]
        ↓
[Frontend: ChatView.tsx]
        ↓
[Backend: FastAPI /query-stream]
        ↓
[1. 질문 임베딩 생성] → OpenAI Embeddings API
        ↓
[2. Pinecone 벡터 검색] → 유사도 기반 청크 검색
        ↓
[3. 컨텍스트 구성] → Top-K 청크 선택
        ↓
[4. GPT-4o-mini 답변 생성] → RAG 프롬프트
        ↓
[5. Citation 필터링] → 실제 사용된 참고문헌만 추출
        ↓
[6. 후속 질문 생성] → GPT-4o-mini
        ↓
[7. SSE 스트리밍 응답] → Frontend로 전송
        ↓
[8. 타이핑 애니메이션] → 사용자에게 표시
        ↓
[9. Firestore 저장] → 대화 히스토리 보관
```

---

## 상세 프로세스

### Step 1: Frontend - 질문 입력 및 전송
**파일**: `frontend/app/components/ChatView.tsx`

```typescript
// 사용자가 질문 입력 및 제출
const handleSubmit = async (e: React.FormEvent) => {
  const question = input.trim();

  // Guest 모드 제한 확인 (5회)
  if (isGuestMode && !user && !canGuestQuery()) {
    setShowLoginModal(true);
    return;
  }

  // Backend API 호출
  await queryAPI(question, false);
};
```

### Step 2: Backend API - SSE 스트리밍 엔드포인트
**파일**: `backend/main.py`

```python
@app.post("/query-stream")
async def query_stream(request: QueryRequest):
    """SSE를 사용한 질문 처리"""
    return StreamingResponse(
        query_stream_generator(request.question, request.conversation_history),
        media_type="text/event-stream"
    )
```

### Step 3: 질문 임베딩 생성
**파일**: `backend/main.py:457-479`

```python
# 1단계: 상태 전송 - "질문 분석 중..."
yield create_sse_event({
    "status": "analyzing",
    "message": "질문 분석 중..."
})

# 2단계: OpenAI Embeddings API 호출
embedding_response = openai_client.embeddings.create(
    model="text-embedding-3-small",
    input=question  # 사용자 질문
)
query_embedding = embedding_response.data[0].embedding  # 1536차원 벡터

# SSE 이벤트 전송
yield create_sse_event({
    "status": "embedding",
    "message": "질문을 벡터로 변환 중..."
})
```

### Step 4: Pinecone 벡터 검색
**파일**: `backend/main.py:111-156`

```python
async def search_pinecone(query_embedding: List[float],
                         top_k: int = 5,
                         min_similarity: float = 0.45) -> List[Dict]:
    """
    Pinecone에서 유사한 가이드라인 검색
    """
    # Pinecone 검색 실행
    results = pinecone_index.query(
        vector=query_embedding,     # 질문 벡터 (1536차원)
        top_k=top_k,                # 상위 10개 청크
        include_metadata=True       # 메타데이터 포함
    )

    chunks = []
    for match in results.matches:
        # 유사도 임계값 필터링 (0.45 이상만 선택)
        if match.score < min_similarity:
            continue

        metadata = match.metadata
        chunks.append({
            "text": metadata.get("text", ""),
            "title": metadata.get("title", ""),
            "authors": metadata.get("authors", ""),
            "journal": metadata.get("journal", ""),
            "year": metadata.get("year", ""),
            "doi": metadata.get("doi", ""),
            "page": metadata.get("page", 0),
            "score": match.score  # 유사도 점수 (0~1)
        })

    # 유사도 점수로 정렬 (내림차순)
    chunks.sort(key=lambda x: x["score"], reverse=True)

    return chunks
```

**검색 파라미터**:
- `top_k=10`: 상위 10개 청크 검색
- `min_similarity=0.45`: 최소 유사도 45% 이상만 선택
- 결과: 유사도 점수로 정렬된 청크 리스트

**실행 시점**:
```python
# Step 3 이후
context_chunks = await search_pinecone(query_embedding,
                                      top_k=10,
                                      min_similarity=0.45)

yield create_sse_event({
    "status": "searching",
    "message": "의학 문헌 및 가이드라인 검색 중..."
})
```

### Step 5: 컨텍스트 구성 및 GPT 프롬프트 생성
**파일**: `backend/main.py:189-248`

```python
async def generate_answer(question: str, context_chunks: List[Dict]) -> tuple[str, List[Reference]]:
    """
    GPT-4를 사용하여 답변 생성
    """
    # 컨텍스트 구성
    context_text = ""
    for i, chunk in enumerate(context_chunks, 1):
        context_text += f"\n[Reference {i}] {chunk['source']}, {chunk['title']}, {chunk['year']}, {chunk['page']}p\n"
        context_text += f"{chunk['text']}\n"
        context_text += "-" * 80 + "\n"

    # 시스템 프롬프트
    system_prompt = """You are a professional AI assistant specializing in veterinary clinical guidelines.

Important rules:
1. Always cite reference numbers in square brackets [1], [2-3], [1,4]
2. Answers should be detailed and medically accurate
3. **CRITICAL: Always respond in the SAME LANGUAGE as the user's question**
   - If the user asks in English, respond in English
   - If the user asks in Korean, respond in Korean
4. Use professional veterinary medical terminology
5. Use Markdown format (headings, bullet points, tables)
"""

    # 사용자 프롬프트
    user_prompt = f"""Please answer the following question based on the veterinary clinical guideline content provided below:

{context_text}

Question: {question}

Answer Guidelines:
1. Cite ONLY using bracketed numbers [1], [2], etc.
2. DO NOT mention "Reference 1", "Reference 2" in your answer text
3. Write detailed answers in 3-5 paragraphs
4. Use headings (##), bullet points, and tables when needed
"""

    # GPT-4o-mini API 호출
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.3,      # 낮은 온도로 일관성 있는 답변
        max_tokens=3000       # 충분한 답변 길이
    )

    answer = response.choices[0].message.content

    return answer, references
```

**프롬프트 구조**:
1. **시스템 프롬프트**: AI의 역할과 규칙 정의
2. **컨텍스트**: Pinecone에서 검색한 청크들
3. **질문**: 사용자의 원본 질문
4. **답변 가이드라인**: Citation 형식, 마크다운 사용 등

### Step 6: Citation 필터링 (실제 사용된 참고문헌만 추출)
**파일**: `backend/main.py:159-186, 252-315`

```python
# 답변에서 citation 번호 추출
cited_indices = extract_cited_indices(answer)
# 예: answer = "...권장됩니다.[1] 또한...[2-3]"
# → cited_indices = {1, 2, 3}

# 실제 사용된 참고문헌만 추출
references = []
seen_refs = set()

for idx in sorted(cited_indices):
    chunk = context_chunks[idx - 1]  # 0-based index

    # 중복 제거 (같은 논문은 하나만)
    ref_key = f"{chunk['source']}_{chunk['title']}_{chunk['year']}"

    if ref_key not in seen_refs:
        # Title → Filename 매핑
        normalized_title = chunk['title'].lower().strip()
        source_filename = TITLE_TO_FILENAME.get(normalized_title, "")

        # Filename → URL 매핑
        paper_url = PDF_URL_MAPPING.get(source_filename, "")

        references.append(Reference(
            source=chunk['source'],
            title=chunk['title'],
            year=chunk['year'],
            page=0,  # Page 정보 제거 (같은 논문 통합)
            authors=chunk.get('authors', ''),
            journal=chunk.get('journal', ''),
            doi=chunk.get('doi', ''),
            score=chunk.get('score', 0.0),
            url=paper_url  # 논문 PDF URL
        ))
        seen_refs.add(ref_key)
```

**필터링 로직**:
1. 정규표현식으로 `[1]`, `[2-3]`, `[1,4]` 등 citation 패턴 추출
2. 실제 사용된 번호만 references 배열에 추가
3. 같은 논문은 하나로 통합 (페이지 다르더라도)
4. PDF URL 매핑 (Title → Filename → URL)

### Step 7: 후속 질문 생성
**파일**: `backend/main.py:402-453`

```python
async def generate_followup_questions(question: str,
                                     answer: str,
                                     conversation_history: List[Dict]) -> List[str]:
    """
    GPT-4o-mini를 사용하여 맥락 기반 후속 질문 3-4개 생성
    """
    # 대화 맥락 구성 (최근 3개)
    context = ""
    if conversation_history:
        context = "Previous conversation:\n"
        for msg in conversation_history[-3:]:
            context += f"{msg['role']}: {msg['content'][:200]}...\n"

    prompt = f"""Based on the following veterinary medicine Q&A conversation, generate 3-4 relevant follow-up questions.

{context}

Current Question: {question}
Current Answer: {answer[:500]}...

Generate 3-4 follow-up questions that:
1. Are directly related to the current topic
2. Explore deeper clinical details
3. Ask about related conditions or treatments
4. Are practical and useful for veterinarians

**CRITICAL**: Respond in the SAME LANGUAGE as the original question.
- If Korean question → Korean follow-up questions
- If English question → English follow-up questions

Return ONLY the questions, one per line, without numbering."""

    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that generates relevant follow-up questions."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,  # 창의적인 질문 생성
        max_tokens=300
    )

    questions_text = response.choices[0].message.content
    questions = [q.strip() for q in questions_text.split('\n') if q.strip()]

    return questions[:4]  # 최대 4개
```

### Step 8: SSE 스트리밍 응답 전송
**파일**: `backend/main.py:516-522`

```python
# 최종 완료 이벤트
yield create_sse_event({
    "status": "done",
    "message": "완료",
    "answer": answer,                      # GPT 생성 답변
    "references": [ref.dict() for ref in references],  # 참고문헌 리스트
    "followup_questions": followup_questions           # 후속 질문 3-4개
})
```

**SSE 이벤트 형식**:
```
data: {"status": "analyzing", "message": "질문 분석 중..."}

data: {"status": "embedding", "message": "질문을 벡터로 변환 중..."}

data: {"status": "searching", "message": "의학 문헌 및 가이드라인 검색 중..."}

data: {"status": "synthesizing", "message": "관련 정보 통합 중..."}

data: {"status": "generating", "message": "GPT로 답변 생성 중..."}

data: {"status": "done", "answer": "...", "references": [...], "followup_questions": [...]}
```

### Step 9: Frontend - SSE 스트림 수신 및 파싱
**파일**: `frontend/app/components/ChatView.tsx:248-308`

```typescript
// SSE 스트림 읽기
const response = await fetch("http://localhost:8000/query-stream", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    question: question,
    conversation_history: conversationHistory,  // 대화 맥락 전달
  }),
});

const reader = response.body?.getReader();
const decoder = new TextDecoder();

let buffer = "";
let finalAnswer = "";
let finalReferences: Reference[] = [];
let finalFollowupQuestions: string[] = [];

// 스트림 읽기 루프
while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split("\n");
  buffer = lines.pop() || "";

  for (const line of lines) {
    if (line.startsWith("data: ")) {
      const data = JSON.parse(line.slice(6));

      if (data.status === "done") {
        finalAnswer = data.answer || "";
        finalReferences = data.references || [];
        finalFollowupQuestions = data.followup_questions || [];
      }
    }
  }
}
```

### Step 10: 타이핑 애니메이션
**파일**: `frontend/app/components/ChatView.tsx:321-348`

```typescript
// 타이핑 애니메이션으로 답변 표시
if (finalAnswer) {
  const assistantMessage: Message = {
    role: "assistant",
    content: "",  // 초기에는 빈 문자열
    references: finalReferences,
    followupQuestions: finalFollowupQuestions,
    isStreaming: true,
    timestamp: new Date(),
  };
  setMessages((prev) => [...prev, assistantMessage]);

  // 타이핑 효과
  const typingSpeed = 4;       // 4ms 간격
  const charsPerChunk = 8;     // 한 번에 8자씩

  for (let i = 0; i <= finalAnswer.length; i += charsPerChunk) {
    await new Promise((resolve) => setTimeout(resolve, typingSpeed));

    const displayText = finalAnswer.slice(0, Math.min(i + charsPerChunk, finalAnswer.length));

    setMessages((prev) => {
      const newMessages = [...prev];
      const lastMsg = newMessages[newMessages.length - 1];
      if (lastMsg && lastMsg.role === "assistant") {
        lastMsg.content = displayText;
        lastMsg.isStreaming = displayText.length < finalAnswer.length;
      }
      return newMessages;
    });
  }
}
```

**타이핑 속도**:
- 4ms 간격으로 8자씩 표시
- 약 32자/초 속도 (매우 빠름)
- 사용자 경험 향상

### Step 11: Firestore 대화 저장
**파일**: `frontend/app/components/ChatView.tsx:359-420`

```typescript
// 첫 메시지인 경우 대화 생성
if (isFirstMessage && !currentConversationId) {
  const newConvId = await createConversation(user.uid);
  setCurrentConversationId(newConvId);

  // 사용자 메시지와 AI 메시지 모두 저장
  await addMessageToConversation(newConvId, userMessage);
  await addMessageToConversation(newConvId, completedAssistantMessage);

  // 제목 생성 및 업데이트
  const title = await generateChatTitle(question);
  await updateConversationTitle(newConvId, title);

  if (onConversationCreated) {
    onConversationCreated(newConvId);
  }
} else if (currentConversationId) {
  // 기존 대화에 AI 메시지만 추가
  await addMessageToConversation(currentConversationId, completedAssistantMessage);
}
```

**Firestore 구조**:
```
conversations/{conversationId}/
  - userId: string
  - title: string
  - createdAt: timestamp
  - updatedAt: timestamp
  - isFavorite: boolean
  - messages: [
      {
        role: "user" | "assistant",
        content: string,
        timestamp: timestamp,
        references?: Reference[],
        followupQuestions?: string[],
        feedback?: "like" | "dislike" | null
      }
    ]
```

### Step 12: UI 렌더링 (Markdown + Citation)
**파일**: `frontend/app/components/ChatView.tsx:943-978, 1044-1049`

```typescript
// Markdown 렌더링 시 citation 처리
const createComponents = (messageIndex: number) => ({
  p: ({ children, ...props }: any) => {
    return <p {...props}>{processChildrenWithCitations(children, messageIndex)}</p>;
  },
  // ... 다른 마크다운 요소들
});

// Citation 처리 함수
const processCitations = (text: string, messageIndex: number) => {
  const parts = text.split(/(\[\d+(?:-\d+)?(?:,\s*\d+(?:-\d+)?)*\])/g);
  return parts.map((part: string, index: number) => {
    if (/^\[\d+(?:-\d+)?(?:,\s*\d+(?:-\d+)?)*\]$/.test(part)) {
      return (
        <sup
          key={index}
          onClick={() => scrollToReference(part, messageIndex)}
          className="text-[0.65em] font-medium ml-0.5 cursor-pointer"
          style={{ color: '#5AC8D8' }}
        >
          {part}
        </sup>
      );
    }
    return part;
  });
};

// ReactMarkdown 렌더링
<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  components={createComponents(index)}
>
  {message.content}
</ReactMarkdown>
```

**Citation 동작**:
1. `[1]`, `[2-3]` 등의 패턴을 인식
2. `<sup>` 태그로 각주 형태 렌더링
3. 클릭 시 해당 참고문헌으로 스크롤
4. 참고문헌 하이라이트 (2초간)

### Step 13: 참고문헌 표시 및 URL 링크
**파일**: `frontend/app/components/ChatView.tsx:1122-1217`

```typescript
{/* 참고문헌 섹션 */}
{message.references && message.references.length > 0 && !message.isStreaming && (
  <div className="mt-6 pt-6 border-t border-gray-700">
    <button onClick={() => setReferencesCollapsed({
      ...referencesCollapsed,
      [index]: !referencesCollapsed[index]
    })}>
      <BookOpen className="w-5 h-5 text-gray-400" />
      <h3>참고문헌 ({message.references.length})</h3>
      {referencesCollapsed[index] ? <ChevronDown /> : <ChevronUp />}
    </button>

    <div className={referencesCollapsed[index] ? 'max-h-0' : 'max-h-[2000px]'}>
      {message.references.map((ref, refIdx) => (
        <div key={refIdx} id={`ref-${index}-${refIdx + 1}`}>
          {/* PDF URL이 있으면 링크, 없으면 일반 텍스트 */}
          {ref.url ? (
            <a href={ref.url} target="_blank" rel="noopener noreferrer">
              {ref.title}
            </a>
          ) : (
            <h4>{ref.title}</h4>
          )}

          {/* 저자 */}
          {ref.authors && <p>{ref.authors}</p>}

          {/* 저널 및 연도 */}
          {(ref.journal || ref.year) && (
            <p>{ref.journal}. {ref.year}</p>
          )}

          {/* DOI */}
          {ref.doi && <p>doi: {ref.doi}</p>}

          {/* 피드백 버튼 (좋아요/싫어요) */}
          <button onClick={() => handleReferenceFeedback(index, refIdx, 'like')}>
            <ThumbsUp />
          </button>
          <button onClick={() => handleReferenceFeedback(index, refIdx, 'dislike')}>
            <ThumbsDown />
          </button>
        </div>
      ))}
    </div>
  </div>
)}
```

**참고문헌 기능**:
- 접기/펼치기 (Collapsible)
- PDF URL 클릭 → 새 탭에서 열기
- 각 참고문헌별 좋아요/싫어요 피드백
- 피드백은 Firestore에 저장

### Step 14: 후속 질문 표시 및 클릭 처리
**파일**: `frontend/app/components/ChatView.tsx:1220-1241, 456-495`

```typescript
{/* 후속 질문 섹션 */}
{!message.isStreaming && message.followupQuestions && message.followupQuestions.length > 0 && (
  <div className="mt-10">
    <div className="rounded-xl border border-gray-700 bg-gray-800/30 p-5">
      <h3 className="text-lg font-medium">
        <List className="w-5 h-5" />
        관련 질문
      </h3>
      <div className="divide-y divide-gray-700">
        {message.followupQuestions.map((question, qIdx) => (
          <button
            key={qIdx}
            onClick={() => handleFollowupQuestionClick(question)}
            className="w-full text-left py-3 px-3 hover:text-[#5AC8D8]"
          >
            <span className="mr-2">↳</span>
            <span>{question}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
)}
```

**후속 질문 클릭 시**:
```typescript
const handleFollowupQuestionClick = async (question: string) => {
  // 1. Related Questions 섹션 제거
  setMessages((prev) => {
    const newMessages = [...prev];
    for (let i = newMessages.length - 1; i >= 0; i--) {
      if (newMessages[i].role === "assistant") {
        newMessages[i] = {
          ...newMessages[i],
          followupQuestions: undefined,  // 제거
        };
        break;
      }
    }
    return newMessages;
  });

  // 2. Guest 모드 제한 확인
  if (isGuestMode && !user && !canGuestQuery()) {
    setShowLoginModal(true);
    return;
  }

  // 3. 쿼리 카운트 증가 (Guest 모드)
  if (isGuestMode && !user) {
    incrementGuestQueryCount();
    setGuestQueriesRemaining(getGuestQueriesRemaining());
  }

  // 4. 질문 전송 (Step 2부터 다시 시작)
  await queryAPI(question, false);
};
```

---

## 성능 최적화

### 1. 벡터 검색 최적화
```python
# Top-K 제한: 10개만 검색
top_k = 10

# 유사도 임계값: 0.45 이상만
min_similarity = 0.45

# 결과: 관련성 높은 청크만 사용 → GPT 토큰 절약
```

### 2. 임베딩 배치 처리
```python
# 한 번에 최대 100개 청크 임베딩
batch_size = 100

for i in range(0, len(texts), batch_size):
    batch = texts[i:i + batch_size]
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=batch
    )
```

### 3. SSE 스트리밍
```python
# 실시간 진행 상태 전송 → UX 개선
yield create_sse_event({"status": "analyzing", ...})
yield create_sse_event({"status": "embedding", ...})
yield create_sse_event({"status": "searching", ...})
yield create_sse_event({"status": "generating", ...})
yield create_sse_event({"status": "done", ...})
```

### 4. 타이핑 애니메이션
```typescript
// 빠른 속도 (4ms 간격, 8자씩)
const typingSpeed = 4;
const charsPerChunk = 8;

// 약 32자/초 → 긴 답변도 빠르게 표시
```

### 5. Citation 필터링
```python
# GPT가 실제 사용한 참고문헌만 반환
# 예: 10개 청크 중 3개만 사용 → 3개만 반환
cited_indices = extract_cited_indices(answer)
references = [context_chunks[i-1] for i in cited_indices]
```

---

## 비용 분석

### OpenAI API 비용 (2024년 11월 기준)

#### Embedding API
- 모델: `text-embedding-3-small`
- 비용: $0.00002 / 1K tokens
- 예상 사용량:
  - 질문 임베딩: ~50 tokens → $0.000001
  - 데이터 파이프라인: 39,757 청크 × 평균 400 tokens = ~15.9M tokens → $0.32

#### GPT-4o-mini API
- 모델: `gpt-4o-mini`
- 비용:
  - Input: $0.00015 / 1K tokens
  - Output: $0.0006 / 1K tokens
- 예상 사용량 (질문 1회):
  - 프롬프트 (컨텍스트 10개 청크): ~4000 tokens → $0.0006
  - 답변 생성: ~1000 tokens → $0.0006
  - 후속 질문 생성: ~300 tokens → $0.00018
  - **총 비용**: ~$0.00138 / 질문

### Pinecone 비용
- Plan: Serverless (Free Tier)
- 저장량: 39,757 벡터 × 1536 차원 = ~61M dimensions
- 쿼리: Unlimited (Free Tier 내)
- **비용**: $0 (Free Tier)

### Firebase 비용
- Plan: Spark (Free Tier)
- Firestore: 1GB 저장 (Free)
- 읽기/쓰기: 50K/20K per day (Free)
- **비용**: $0 (Free Tier)

---

## 보안 및 제한

### 1. Guest 모드 제한
```typescript
// 5회 무료 쿼리
const GUEST_QUERY_LIMIT = 5;

// localStorage에 카운트 저장
const canGuestQuery = () => {
  const count = parseInt(localStorage.getItem('guestQueryCount') || '0');
  return count < GUEST_QUERY_LIMIT;
};

// 제한 도달 시 로그인 모달 표시
if (!canGuestQuery()) {
  setShowLoginModal(true);
}
```

### 2. API Key 보안
```python
# 환경 변수로 API Key 관리
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
```

### 3. CORS 설정
```python
# FastAPI CORS 미들웨어
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 4. Firebase 인증
```typescript
// Firebase Authentication
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

// 사용자 인증 확인
const { user } = useAuth();
if (user) {
  // 대화 저장
}
```

---

## 향후 개선 방향

### 1. 멀티모달 지원
- 이미지, 표, 그래프 등 PDF 내 시각 자료 추출 및 분석
- GPT-4 Vision API 활용

### 2. 실시간 스트리밍 타이핑
- GPT API의 `stream=True` 옵션 사용
- 토큰 단위 실시간 스트리밍 → 더 빠른 UX

### 3. 하이브리드 검색
- 벡터 검색 + 키워드 검색 (BM25)
- Pinecone의 Hybrid Search 기능 활용

### 4. 캐싱
- 자주 묻는 질문(FAQ) 캐싱
- Redis 활용

### 5. 피드백 루프
- 사용자 피드백(좋아요/싫어요) 데이터 수집
- 검색 랭킹 알고리즘 개선
- Fine-tuning 데이터로 활용

### 6. 다국어 지원
- 현재: 영어, 한국어, 일본어 UI
- 향후: 중국어, 스페인어 등 추가

---

## 문의 및 기여

프로젝트 관련 문의사항이나 기여는 다음을 통해 가능합니다:
- GitHub Issues
- Email: contact@ruleout-ai.com

---

**작성일**: 2024년 11월 29일
**버전**: 1.0.0
**작성자**: Claude Code Assistant
