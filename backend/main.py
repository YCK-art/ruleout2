#!/usr/bin/env python3
"""
의료 가이드라인 RAG 서비스 Backend (FastAPI)
SSE를 사용한 실시간 진행상황 표시
Citation 배너 형식 지원
"""

import os
import json
import asyncio
import re
import sys
from typing import List, Dict, AsyncGenerator, Set, Tuple, Optional
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
        print(f"✅ PDF URL 매핑 로드 완료: {len(PDF_URL_MAPPING)}개", file=sys.stderr, flush=True)

# PDF 메타데이터 매핑 로드 (title → filename)
TITLE_TO_FILENAME = {}
metadata_mapping_path = Path(__file__).parent.parent / "data-pipeline" / "pdf_metadata_mapping.json"
if metadata_mapping_path.exists():
    with open(metadata_mapping_path, 'r', encoding='utf-8') as f:
        metadata = json.load(f)
        for filename, meta in metadata.items():
            title = meta.get("title", "")
            if title:
                normalized_title = title.lower().strip()
                TITLE_TO_FILENAME[normalized_title] = filename
        print(f"✅ Title → Filename 매핑 로드 완료: {len(TITLE_TO_FILENAME)}개", file=sys.stderr, flush=True)
else:
    print(f"⚠️  메타데이터 매핑 파일을 찾을 수 없습니다: {metadata_mapping_path}", file=sys.stderr, flush=True)

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
    version="2.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://medical-production-f4e4.up.railway.app",
        "https://mindful-dream-production-76f5.up.railway.app",
        "https://ruleout.co",
        "https://www.ruleout.co"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response 모델
class QueryRequest(BaseModel):
    question: str
    conversation_history: List[Dict] = []
    previous_context_chunks: List[Dict] = []  # 누적 컨텍스트
    language: str = "한국어"


class Reference(BaseModel):
    source: str
    title: str
    authors: str
    journal: str
    year: str
    doi: str
    url: str
    relevance_score: float = 0.0


def create_sse_event(data: dict) -> str:
    """SSE 이벤트 생성"""
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"


def extract_cited_indices(text: str) -> Set[int]:
    """
    텍스트에서 citation 번호 추출
    예: {{citation:0}}, {citation:1,2,3}} 등을 파싱
    """
    citations = set()
    # {{citation:N}}, {citation:N} 모두 파싱
    matches = re.findall(r'\{\{?citation:(\d+(?:,\d+)*)\}\}?', text)
    for match in matches:
        # 쉼표로 구분된 숫자들 파싱
        nums = [int(n.strip()) for n in match.split(',')]
        citations.update(nums)
    return citations


def group_chunks_by_document(chunks: List[Dict]) -> Tuple[List[str], Dict[str, List[Dict]]]:
    """
    청크들을 문서별로 그룹화
    Returns: (doc_order, grouped_chunks)
    """
    seen_docs = {}
    doc_order = []

    for chunk in chunks:
        ref_key = f"{chunk.get('source', 'unknown')}_{chunk.get('title', 'unknown')}"
        if ref_key not in seen_docs:
            seen_docs[ref_key] = []
            doc_order.append(ref_key)
        seen_docs[ref_key].append(chunk)

    return doc_order, seen_docs


async def extract_references_from_answer(answer: str, doc_order: List[str], seen_docs: Dict) -> Tuple[str, List[Reference]]:
    """
    답변에서 실제 사용된 참고문헌만 추출하고 citation 번호를 재매핑
    """
    try:
        # 답변에서 실제 사용된 citation 번호 추출
        cited_indices = extract_cited_indices(answer)

        print(f"🔍 extract_references_from_answer:", file=sys.stderr, flush=True)
        print(f"   doc_order: {len(doc_order)} documents", file=sys.stderr, flush=True)
        print(f"   cited_indices from answer: {sorted(cited_indices)}", file=sys.stderr, flush=True)

        if not cited_indices:
            print("⚠️  No citations found in answer", file=sys.stderr, flush=True)
            return answer, []

        # cited_indices를 정렬하여 새로운 인덱스 생성 (0부터 시작)
        sorted_cited = sorted(cited_indices)
        old_to_new = {old_idx: new_idx for new_idx, old_idx in enumerate(sorted_cited)}

        print(f"   Remapping: {old_to_new}", file=sys.stderr, flush=True)

        # 답변의 citation 번호를 재매핑
        remapped_answer = answer

        # 🔥 모든 citation 태그를 찾아서 재매핑
        def remap_citation(match):
            nums_str = match.group(1)  # "0,1,2" 또는 "5"
            nums = [int(n.strip()) for n in nums_str.split(',')]
            # 각 번호를 재매핑
            remapped_nums = [str(old_to_new.get(n, n)) for n in nums]
            return '{{citation:' + ','.join(remapped_nums) + '}}'

        # 정확한 {{citation:N,M,...}} 패턴만 매칭
        remapped_answer = re.sub(
            r'\{\{citation:(\d+(?:,\d+)*)\}\}',
            remap_citation,
            answer
        )

        print(f"   Original answer length: {len(answer)}", file=sys.stderr, flush=True)
        print(f"   Remapped answer length: {len(remapped_answer)}", file=sys.stderr, flush=True)

        # 🔥 Punctuation relocation removed - GPT now instructed to place punctuation BEFORE citations
        # This prevents {. pattern during streaming when chunks split at citation boundaries

        # References 생성 (새로운 순서대로)
        references = []
        for new_idx, old_idx in enumerate(sorted_cited):
            if old_idx >= len(doc_order):
                print(f"⚠️  Invalid index {old_idx} >= {len(doc_order)}", file=sys.stderr, flush=True)
                continue

            ref_key = doc_order[old_idx]
            chunks = seen_docs[ref_key]
            first_chunk = chunks[0]

            # URL 생성 (우선순위: PMCID > PMID > DOI > PDF URL)
            url = ""
            pmcid = first_chunk.get('pmcid', '')
            pmid = first_chunk.get('pmid', '')
            doi = first_chunk.get('doi', '')

            print(f"🔗 URL 생성 중 - PMCID: '{pmcid}', PMID: '{pmid}', DOI: '{doi}'", file=sys.stderr, flush=True)

            if pmcid and pmcid.startswith('PMC'):
                # PMCID가 있으면 PubMed Central URL 생성
                url = f"https://www.ncbi.nlm.nih.gov/pmc/articles/{pmcid}/"
                print(f"   ✅ PMCID URL 생성: {url}", file=sys.stderr, flush=True)
            elif pmid:
                # PMID가 있으면 PubMed URL 생성
                url = f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"
                print(f"   ✅ PMID URL 생성: {url}", file=sys.stderr, flush=True)
            elif doi:
                # DOI가 있으면 DOI URL 생성
                url = f"https://doi.org/{doi}"
                print(f"   ✅ DOI URL 생성: {url}", file=sys.stderr, flush=True)
            else:
                # 없으면 PDF URL 매핑에서 찾기
                title = first_chunk.get('title', 'Unknown')
                normalized_title = title.lower().strip()
                if normalized_title in TITLE_TO_FILENAME:
                    filename = TITLE_TO_FILENAME[normalized_title]
                    url = PDF_URL_MAPPING.get(filename, "")
                    print(f"   ✅ PDF URL 매핑: {url}", file=sys.stderr, flush=True)
                else:
                    print(f"   ⚠️  URL을 찾을 수 없음", file=sys.stderr, flush=True)

            # source 필드가 없으면 journal을 사용 (XML 논문의 경우)
            source = first_chunk.get('source', first_chunk.get('journal', 'Unknown'))

            ref = Reference(
                title=first_chunk.get('title', 'Unknown'),
                authors=first_chunk.get('authors', 'Unknown'),
                journal=first_chunk.get('journal', 'Unknown'),
                year=first_chunk.get('year', 'Unknown'),
                doi=doi if doi else 'Unknown',
                url=url,
                source=source,
                relevance_score=first_chunk.get('score', 0.0)
            )
            references.append(ref)

        print(f"✅ Extracted {len(references)} references", file=sys.stderr, flush=True)
        return remapped_answer, references

    except Exception as e:
        print(f"❌ Error in extract_references_from_answer: {e}", file=sys.stderr, flush=True)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return answer, []


async def generate_answer_stream(
    question: str,
    context_chunks: List[Dict],
    language: str,
    conversation_history: List[Dict]
) -> AsyncGenerator[Tuple, None]:
    """
    GPT를 사용하여 답변 스트리밍 생성
    Yields: (chunk_text, is_done) OR (full_answer, True, doc_order, seen_docs)
    """
    doc_order, seen_docs = group_chunks_by_document(context_chunks)
    num_references = len(doc_order)

    print(f"🤖 generate_answer_stream started", file=sys.stderr, flush=True)
    print(f"   question: {question[:50]}...", file=sys.stderr, flush=True)
    print(f"   language: {language}", file=sys.stderr, flush=True)
    print(f"   context_chunks: {len(context_chunks)}", file=sys.stderr, flush=True)
    print(f"   doc_order: {len(doc_order)} documents", file=sys.stderr, flush=True)
    print(f"   conversation_history: {len(conversation_history)} messages", file=sys.stderr, flush=True)

    # 컨텍스트 구성
    context_text = "\n\n".join([
        f"Document {i}: {chunk.get('text', '')}"
        for i, chunk in enumerate(context_chunks[:25])
    ])

    # 시스템 프롬프트
    system_prompt = f"""You are an EVIDENCE-BASED CITATION ENGINE for VETERINARY MEDICINE.

Your role is to provide answers that are CLOSELY BASED on the provided veterinary literature, extracting and citing content from the references.

────────────────────────────────────────
CRITICAL – YOUR ROLE (EVIDENCE-BASED ANSWERING)
────────────────────────────────────────
**You are an evidence-based assistant, NOT a general knowledge chatbot.**
**Your answers MUST be grounded in the provided references.**
**Extract content from references with minimal adaptation if needed.**

OpenEvidence Philosophy:
"This claim comes directly from the paper — with minimal paraphrasing only when necessary for clarity."

────────────────────────────────────────
FOLLOW-UP QUESTION HANDLING
────────────────────────────────────────
**When the user asks a follow-up question (e.g., "What are the causes?", "Why does that happen?", "What else?"):**

1. **Understand the context**: Review the conversation history to understand what was already discussed
2. **Go DEEPER, not broader**:
   - ❌ DON'T repeat the same information from your previous answer
   - ✅ DO provide MORE SPECIFIC details, mechanisms, or examples
3. **Build on previous context**:
   - If you already mentioned "IgE-mediated response" → explain WHY and HOW it occurs
   - If you already listed "environmental antigens" → give SPECIFIC EXAMPLES and comparisons
4. **Add NEW information**: Use the references to find additional details not covered before
5. **Be progressive**: Each follow-up should ADD to the conversation, not restart it

**Example of GOOD follow-up response:**
- User: "What causes atopic dermatitis?"
- Previous answer: "Caused by IgE-mediated response to environmental antigens"
- User: "Why does the IgE response occur?"
- Good answer: "The IgE response occurs because of [specific mechanism from papers], involving [specific cells/pathways], triggered by [specific factors]"
- Bad answer: ❌ "Atopic dermatitis is caused by IgE-mediated response..." (repeating same info)

────────────────────────────────────────
CRITICAL – EVIDENCE EXTRACTION RULES
────────────────────────────────────────
1. **STAY CLOSE TO SOURCE**: Extract sentences/findings from references, keeping them as close to the original as possible
2. **MINIMAL PARAPHRASING**: Only rephrase if absolutely necessary for clarity or to answer the specific question
3. **PRESERVE KEY DETAILS**: Always keep exact numbers, dosages, percentages, disease names, breed names, test values
4. **EXTRACT SPECIFIC CLINICAL DATA**:
   - ✅ Drug names (generic AND brand): "amoxicillin-clavulanate (Clavamox)", "enrofloxacin (Baytril)", "oclacitinib (Apoquel)"
   - ✅ Exact dosages: "10 mg/kg PO q12h", "5-10 mg/kg IV once daily", "0.4-0.6 mg/kg BID"
   - ✅ Treatment duration: "7-14 days", "minimum 4 weeks", "long-term maintenance therapy"
   - ✅ Specific protocols: "TPLO surgery", "extracapsular suture stabilization", "allergen-specific immunotherapy"
   - ✅ Quantitative values: "sensitivity 85%", "T4 >4.0 μg/dL", "WBC >15,000/μL", "pruritus score decreased by 50%"
   - ✅ Study findings: "in 234 dogs, 67% showed improvement", "median survival time was 18 months"
   - ❌ NEVER use generic statements like: "antibiotics are used", "appropriate dosage should be given", "항히스타민제가 사용됩니다"
   - ❌ FORBIDDEN: Vague descriptions without specific drug names, exact dosages, or quantitative results

**CRITICAL RULE FOR TREATMENT QUESTIONS:**
When the user asks about treatment/therapy/medication:
- ✅ MUST include: Specific drug name + exact dosage + route + frequency
- ✅ Example: "Oclacitinib (Apoquel) at 0.4-0.6 mg/kg PO twice daily is recommended as first-line therapy"
- ❌ FORBIDDEN: "항히스타민제는 가려움증 완화에 효과적입니다" (too vague - WHERE is the drug name? dosage?)
- ❌ FORBIDDEN: "스테로이드가 사용됩니다" (WHICH steroid? what dose?)

If the references don't contain specific dosages/protocols, you MUST say so explicitly rather than giving generic advice.
5. **NO HALLUCINATION**: Do not add clinical reasoning, mechanisms, or information beyond what's explicitly stated in the references
6. **IF NOT IN REFERENCES**: If the question is COMPLETELY outside the scope of the provided documents (e.g., asking for general definitions when documents only contain specific clinical studies), respond with EXACTLY this: "OUT_OF_SCOPE_QUERY"

────────────────────────────────────────
CITATION RULES
────────────────────────────────────────
1. **ALWAYS cite sources** using {{{{citation:N}}}} format where N is the document index (0-based)
2. **CRITICAL**: You have EXACTLY {num_references} documents available (indices 0 to {num_references-1})
3. **NEVER cite document indices >= {num_references}** - such citations are INVALID and will be removed
4. **Place citations at the END of each paragraph** that uses information from sources
5. **Multiple citations**: Use comma-separated indices like {{{{citation:0,1,2}}}}
6. **Every clinical claim MUST have a citation**
7. **Do NOT make claims without citation support**
8. **ONLY use document indices that exist in the provided references (0 to {num_references-1})**
9. **PUNCTUATION PLACEMENT**: ALWAYS place periods, exclamation marks, and question marks BEFORE citations, not after
   - ✅ Correct: "This is a sentence.{{{{citation:0}}}}"
   - ❌ Wrong: "This is a sentence{{{{citation:0}}}}."
   - This prevents rendering issues during streaming

────────────────────────────────────────
CONTENT & FORMATTING REQUIREMENTS
────────────────────────────────────────

1. **Depth & Specificity**:
   - Provide DETAILED, SPECIFIC clinical information (exact protocols, dosages, diagnostic criteria, pathophysiology)
   - Include relevant statistics, study findings, and clinical evidence from the literature
   - Discuss mechanisms, risk factors, contraindications, and clinical significance
   - Write for EXPERIENCED veterinarians - use appropriate medical terminology

2. **Structure**:
   - Use **PARAGRAPH FORMAT** as default (3-5 substantive paragraphs)
   - Each paragraph should be 4-6 sentences covering a specific aspect
   - Each paragraph MUST end with {{{{citation:X,Y,Z}}}}
   - Start each paragraph with a topic sentence

3. **Emphasis**:
   - Use **bold markdown** for KEY CLINICAL POINTS that veterinarians must remember
   - Bold critical findings, important warnings, essential diagnostic criteria, or significant clinical implications
   - Example: "**Despite their social nature, domestic cats retain strong territorial instincts...**"

4. **Tables** (use when appropriate):
   - For comparing diagnostic tests, treatment options, differential diagnoses, drug protocols, or breed characteristics
   - Format tables in markdown with proper headers
   - Add citation after the table

5. **Language**:
   - Write in {language}
   - Use professional veterinary medical terminology
   - Be precise and clinically relevant

EXAMPLE STRUCTURE:

[Opening paragraph with detailed pathophysiology/background and specific clinical details. **Bold the most important clinical insight.** Include relevant statistics or mechanisms.]{{{{citation:0,1,2}}}}

[Second paragraph focusing on diagnostic approaches, specific tests, interpretation criteria. **Bold critical diagnostic points.**]{{{{citation:3,4}}}}

[Third paragraph on treatment protocols with specific dosages, monitoring parameters, contraindications. **Bold key treatment considerations.**]{{{{citation:5,6,7}}}}

[Optional: Comparison table if needed]

[Concluding paragraph with prognosis, complications to monitor, or clinical pearls. **Bold the take-home message.**]{{{{citation:8,9}}}}

Available documents: 0 to {num_references-1}
"""

    # 메시지 구성
    messages = [{"role": "system", "content": system_prompt}]

    # 대화 히스토리 추가
    for msg in conversation_history[-6:]:  # 최근 3턴
        messages.append({
            "role": msg["role"],
            "content": msg["content"]
        })

    # 현재 질문
    user_message = f"""Question: {question}

Context (Documents 0-{num_references-1}):
{context_text}

Provide a comprehensive, detailed clinical answer in {language} following the format above. Include specific clinical details, use bold for key points, and structure your answer in clear paragraphs with citations."""

    messages.append({"role": "user", "content": user_message})

    # GPT 스트리밍
    try:
        stream = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            stream=True,
            temperature=0.3,
            max_tokens=2000
        )

        full_answer = ""  # 🔥 Cleaned answer (invalid citations removed)
        buffer = ""
        seen_citations = set()
        chunk_num = 0

        for chunk in stream:
            if chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                buffer += content  # 🔥 버퍼에만 원본 추가 (full_answer는 cleaned version 유지)
                chunk_num += 1

                # Citation 버퍼링: {{citation:...}} 패턴이 완성될 때까지 대기
                output_chunk = ""

                while buffer:
                    # Citation 패턴 찾기
                    match = re.search(r'\{\{?citation:(\d+(?:,\d+)*)\}\}?', buffer)

                    if match:
                        # Citation 앞부분 출력
                        before_citation = buffer[:match.start()]
                        output_chunk += before_citation
                        full_answer += before_citation  # 🔥 Cleaned answer에 추가

                        # Citation 유효성 검증
                        cite_nums_str = match.group(1)
                        cite_nums = [int(n.strip()) for n in cite_nums_str.split(',')]

                        valid_nums = []
                        for cite_num in cite_nums:
                            if 0 <= cite_num < num_references:
                                valid_nums.append(cite_num)
                                seen_citations.add(cite_num)
                            else:
                                print(f"⚠️  Invalid citation {{{{citation:{cite_num}}}}} removed", file=sys.stderr, flush=True)

                        # 유효한 citation 출력
                        if valid_nums:
                            valid_citation = '{{citation:' + ','.join(map(str, valid_nums)) + '}}'
                            output_chunk += valid_citation
                            full_answer += valid_citation  # 🔥 Cleaned answer에 추가

                        # Citation 이후 버퍼 업데이트
                        buffer = buffer[match.end():]
                    elif buffer and ('{{' in buffer[-10:] or buffer.endswith('{{')):
                        # Citation 시작 가능성 - 버퍼 유지
                        # 🔥 ONLY buffer if we see '{{' pattern (NOT single '{')
                        # This prevents false positives where GPT outputs '{' as regular text

                        # buffer에서 마지막 '{{' 위치 찾기
                        last_double_brace_idx = buffer.rfind('{{')

                        if last_double_brace_idx != -1:
                            # '{{' 이후 텍스트 추출
                            after_brace = buffer[last_double_brace_idx:]

                            # Partial citation 패턴들 (MUST start with '{{', NOT single '{')
                            partial_patterns = ['{{', '{{c', '{{ci', '{{cit', '{{cita', '{{citat',
                                              '{{citati', '{{citatio', '{{citation', '{{citation:']

                            is_partial = any(after_brace.startswith(p) for p in partial_patterns)

                            if is_partial:
                                # Partial citation - '{{' 앞까지만 출력
                                if last_double_brace_idx > 0:
                                    safe_chunk = buffer[:last_double_brace_idx]
                                    output_chunk += safe_chunk
                                    full_answer += safe_chunk
                                    buffer = buffer[last_double_brace_idx:]  # '{{' 부터 버퍼에 유지
                                break
                            else:
                                # '{{' 이후가 citation 패턴이 아님 - 전부 출력
                                output_chunk += buffer
                                full_answer += buffer
                                buffer = ""
                                break

                        # 일반적인 긴 버퍼 처리
                        if len(buffer) > 25:
                            safe_chunk = buffer[:-25]
                            output_chunk += safe_chunk
                            full_answer += safe_chunk
                            buffer = buffer[-25:]
                        break
                    else:
                        # 안전하게 출력
                        output_chunk += buffer
                        full_answer += buffer  # 🔥 Cleaned answer에 추가
                        buffer = ""
                        break

                # 청크 출력
                if output_chunk:
                    yield (output_chunk, False)
                    await asyncio.sleep(0.01)  # 🔥 타이핑 속도 조절 (10ms 딜레이)

        # 버퍼 비우기
        if buffer:
            print(f"📝 Flushing final buffer: '{buffer}'", file=sys.stderr, flush=True)

            final_output = ""
            while buffer:
                match = re.search(r'\{\{?citation:(\d+(?:,\d+)*)\}\}?', buffer)

                if match:
                    before_citation = buffer[:match.start()]
                    final_output += before_citation

                    cite_nums_str = match.group(1)
                    cite_nums = [int(n.strip()) for n in cite_nums_str.split(',')]

                    valid_nums = []
                    for cite_num in cite_nums:
                        if 0 <= cite_num < num_references:
                            valid_nums.append(cite_num)
                            seen_citations.add(cite_num)
                        else:
                            print(f"⚠️  Invalid citation {{{{citation:{cite_num}}}}} removed from final buffer", file=sys.stderr, flush=True)

                    if valid_nums:
                        valid_citation = '{{citation:' + ','.join(map(str, valid_nums)) + '}}'
                        final_output += valid_citation

                    buffer = buffer[match.end():]
                else:
                    final_output += buffer
                    buffer = ""

            if final_output:
                full_answer += final_output
                yield (final_output, False)

        print(f"✅ Streaming complete. Seen citations: {sorted(seen_citations)}", file=sys.stderr, flush=True)
        print(f"   Total: {chunk_num} chunks, {len(full_answer)} chars", file=sys.stderr, flush=True)

        # 최종 답변 반환
        yield (full_answer, True, doc_order, seen_docs)

    except Exception as e:
        print(f"❌ Error in generate_answer_stream: {e}", file=sys.stderr, flush=True)
        import traceback
        traceback.print_exc(file=sys.stderr)
        error_msg = "죄송합니다. 답변 생성 중 오류가 발생했습니다."
        yield (error_msg, True, doc_order, seen_docs)


async def generate_followup_questions(question: str, answer: str, conversation_history: List[Dict], language: str = "Korean") -> List[str]:
    """후속 질문 생성"""
    try:
        # 언어별 지시사항
        language_instruction = {
            "Korean": "in Korean",
            "English": "in English",
            "Japanese": "in Japanese"
        }.get(language, "in the same language as the question")

        prompt = f"""Based on this veterinary medical Q&A, generate 3 SPECIFIC follow-up questions {language_instruction}.

Question: {question}
Answer: {answer[:800]}...

IMPORTANT: The follow-up questions must be:
1. SPECIFIC to the clinical details mentioned in the answer (medications, procedures, findings, etc.)
2. Directly related to the case discussed
3. Natural next questions a veterinarian would ask

Examples of GOOD follow-up questions:
- "What is the appropriate dosage of [specific medication mentioned] for a 5kg cat?"
- "How should we monitor for complications after [specific procedure mentioned]?"
- "What are the differential diagnoses if [specific finding mentioned] is present?"

Examples of BAD follow-up questions (too general):
- "What other treatments are available?"
- "How do we diagnose this?"
- "What are the causes?"

Generate 3 specific follow-up questions based on the actual content of the answer above.
Return only the questions, one per line, without numbering or bullet points."""

        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=300
        )

        followup_text = response.choices[0].message.content.strip()
        questions = [q.strip() for q in followup_text.split('\n') if q.strip()]

        print(f"✅ Generated {len(questions)} follow-up questions in {language}", file=sys.stderr, flush=True)
        return questions[:3]

    except Exception as e:
        print(f"❌ Error generating follow-up questions: {e}", file=sys.stderr, flush=True)
        return []


@app.get("/health")
async def health_check():
    """헬스 체크"""
    try:
        # OpenAI 연결 확인
        openai_status = "connected" if openai_client else "disconnected"

        # Pinecone 연결 확인
        stats = pinecone_index.describe_index_stats()
        pinecone_status = "connected"
        total_vectors = stats.get('total_vector_count', 0)

        return {
            "status": "healthy",
            "services": {
                "openai": openai_status,
                "pinecone": pinecone_status,
                "vectors": total_vectors
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/query-stream")
async def query_stream(request: QueryRequest):
    """
    SSE 스트리밍으로 답변 생성
    """
    async def event_generator():
        try:
            question = request.question
            conversation_history = request.conversation_history
            previous_context_chunks = request.previous_context_chunks
            language = request.language

            print(f"\n{'='*80}", file=sys.stderr, flush=True)
            print(f"📨 New query received", file=sys.stderr, flush=True)
            print(f"   Question: {question}", file=sys.stderr, flush=True)
            print(f"   Language: {language}", file=sys.stderr, flush=True)
            print(f"   Previous context: {len(previous_context_chunks)} chunks", file=sys.stderr, flush=True)
            print(f"   History: {len(conversation_history)} messages", file=sys.stderr, flush=True)

            # 1단계: 번역 (언어 감지)
            detected_lang = "Korean" if any(ord(c) >= 0xAC00 and ord(c) <= 0xD7A3 for c in question) else "English"
            yield create_sse_event({
                "status": "translating",
                "message": "질문 이해 중..."
            })

            # 2단계: 임베딩
            yield create_sse_event({
                "status": "embedding",
                "message": "벡터 변환 중..."
            })

            query_embedding = openai_client.embeddings.create(
                model="text-embedding-3-small",
                input=question
            ).data[0].embedding

            # 3단계: 검색
            yield create_sse_event({
                "status": "searching",
                "message": "문헌 검색 중..."
            })

            # Query expansion (3개 쿼리)
            expansion_prompt = f"""Generate 2 alternative phrasings of this veterinary question in Korean:

Original: {question}

Return only the alternative questions, one per line."""

            expansion_response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": expansion_prompt}],
                temperature=0.7,
                max_tokens=100
            )

            expanded_queries = [question]  # 원본 포함
            expansion_text = expansion_response.choices[0].message.content.strip()
            for line in expansion_text.split('\n'):
                if line.strip():
                    expanded_queries.append(line.strip())

            expanded_queries = expanded_queries[:3]  # 최대 3개

            print(f"🔍 Query expansion: {len(expanded_queries)} queries", file=sys.stderr, flush=True)

            # 모든 쿼리 임베딩 생성
            all_embeddings = []
            for exp_query in expanded_queries:
                emb = openai_client.embeddings.create(
                    model="text-embedding-3-small",
                    input=exp_query
                ).data[0].embedding
                all_embeddings.append(emb)

            # 병렬 검색
            async def search_single_query(embedding, idx):
                results = pinecone_index.query(
                    vector=embedding,
                    top_k=15,
                    include_metadata=True
                )
                chunks = []
                for match in results.matches:
                    chunk = match.metadata
                    chunk['score'] = match.score
                    chunks.append(chunk)
                return chunks

            search_tasks = [search_single_query(emb, idx) for idx, emb in enumerate(all_embeddings)]
            all_search_results = await asyncio.gather(*search_tasks)

            # 중복 제거
            all_chunks = []
            seen_chunk_ids = set()

            for chunks in all_search_results:
                for chunk in chunks:
                    chunk_id = f"{chunk.get('source', 'unknown')}_{chunk.get('title', 'unknown')}_{chunk.get('page', 0)}"
                    if chunk_id not in seen_chunk_ids:
                        all_chunks.append(chunk)
                        seen_chunk_ids.add(chunk_id)

            # 유사도 점수로 재정렬 및 상위 25개 선택
            all_chunks.sort(key=lambda x: x.get('score', 0), reverse=True)
            context_chunks = all_chunks[:25]

            print(f"✅ Query Expansion 검색 완료: {len(all_chunks)}개 청크 발견 → 상위 25개 선택", file=sys.stderr, flush=True)

            # 이전 컨텍스트 병합 (최대 5개)
            if previous_context_chunks and len(previous_context_chunks) > 0:
                print(f"🔄 이전 컨텍스트 {len(previous_context_chunks)}개 + 새 컨텍스트 {len(context_chunks)}개 병합", file=sys.stderr, flush=True)

                existing_ids = {chunk.get('chunk_id') for chunk in context_chunks if chunk.get('chunk_id')}

                added_count = 0
                for prev_chunk in previous_context_chunks[:5]:
                    chunk_id = prev_chunk.get('chunk_id')
                    if chunk_id and chunk_id not in existing_ids:
                        context_chunks.append(prev_chunk)
                        existing_ids.add(chunk_id)
                        added_count += 1

                print(f"   ✅ 이전 컨텍스트 {added_count}개 추가됨 (총 {len(context_chunks)}개)", file=sys.stderr, flush=True)

            if not context_chunks:
                error_message = "관련 문헌을 찾을 수 없습니다. 다른 질문을 시도해주세요."
                yield create_sse_event({
                    "status": "error",
                    "message": error_message
                })
                return

            # 4단계: 답변 생성
            yield create_sse_event({
                "status": "generating",
                "message": "답변 생성 중..."
            })

            # GPT 스트리밍
            full_answer = ""
            chunk_count = 0
            doc_order = []
            seen_docs = {}

            async for result in generate_answer_stream(question, context_chunks, detected_lang, conversation_history):
                if len(result) == 2:  # 스트리밍 중
                    chunk_content, is_done = result
                    chunk_count += 1

                    event_data = create_sse_event({
                        "status": "streaming",
                        "chunk": chunk_content
                    })
                    yield event_data
                else:  # 스트리밍 완료
                    full_answer, is_done, doc_order, seen_docs = result
                    print(f"✅ Total chunks sent: {chunk_count}", file=sys.stderr, flush=True)

            # OUT_OF_SCOPE 체크
            if "OUT_OF_SCOPE_QUERY" in full_answer:
                print("⚠️  Out of scope query detected", file=sys.stderr, flush=True)
                yield create_sse_event({
                    "status": "out_of_scope",
                    "message": "질문이 제공된 문서의 범위를 벗어났습니다."
                })
                return

            # 5단계: 참고문헌 추출
            print("📚 참고문헌 추출 및 후속 질문 생성 시작...", file=sys.stderr, flush=True)

            # 병렬 실행
            refs_task = extract_references_from_answer(full_answer, doc_order, seen_docs)
            followup_task = generate_followup_questions(question, full_answer, conversation_history, detected_lang)

            remapped_answer, references = await refs_task
            followup_questions = await followup_task

            # 참고문헌 전송
            yield create_sse_event({
                "status": "references_ready",
                "answer": remapped_answer,
                "references": [ref.dict() for ref in references]
            })
            print(f"✅ 참고문헌 전송 완료: {len(references)}개", file=sys.stderr, flush=True)

            # 완료
            yield create_sse_event({
                "status": "done",
                "message": "완료",
                "context_chunks": context_chunks
            })
            print(f"✅ 스트리밍 완료 이벤트 전송", file=sys.stderr, flush=True)

            # 후속 질문 전송
            if followup_questions:
                yield create_sse_event({
                    "status": "followup_ready",
                    "followup_questions": followup_questions
                })
                print(f"✅ 후속 질문 전송: {len(followup_questions)}개", file=sys.stderr, flush=True)

        except Exception as e:
            print(f"❌ Error in query_stream: {e}", file=sys.stderr, flush=True)
            import traceback
            traceback.print_exc(file=sys.stderr)
            yield create_sse_event({
                "status": "error",
                "message": "오류가 발생했습니다. 다시 시도해주세요."
            })

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
