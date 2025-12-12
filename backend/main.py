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

# 환경 변수 검증
if not OPENAI_API_KEY:
    raise ValueError("❌ OPENAI_API_KEY environment variable is not set! Please set it in Railway dashboard.")
if not PINECONE_API_KEY:
    raise ValueError("❌ PINECONE_API_KEY environment variable is not set! Please set it in Railway dashboard.")

print(f"✅ Environment variables loaded:")
print(f"   OPENAI_API_KEY: {OPENAI_API_KEY[:10]}...")
print(f"   PINECONE_API_KEY: {PINECONE_API_KEY[:10]}...")
print(f"   PINECONE_INDEX_NAME: {PINECONE_INDEX_NAME}")

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
async def generate_answer_stream(question: str, context_chunks: List[Dict], detected_lang: str = "English", conversation_history: List[Dict] = []) -> AsyncGenerator[tuple, None]:
    """
    GPT-4를 사용하여 답변을 스트리밍으로 생성
    question: 원본 질문 (한국어/일본어/영어)
    detected_lang: 감지된 언어 (Korean/Japanese/English)
    conversation_history: 이전 대화 내역 (맥락 유지용)
    yield (chunk_text, is_done) OR (full_answer, True, doc_order, seen_docs, citation_map)
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
    system_prompt = f"""You are a professional AI assistant specializing in VETERINARY MEDICINE for veterinarians treating ANIMALS (dogs, cats, horses, livestock, exotic pets, etc.).

**CRITICAL - Animal Medicine Context:**
- All your answers MUST be about ANIMAL PATIENTS, NOT human patients
- Use terms like "animals", "dogs", "cats", "pets", "veterinary patients" - NEVER "human patients", "people", or "hospitalized patients"
- If the source text uses human medicine terminology, you MUST adapt it to veterinary context
- Example: "환자" should be understood as "동물 환자" or specific animal types
- Focus on veterinary clinical practice, NOT human medicine

Provide professional and detailed answers based on the provided veterinary guidelines.

{lang_instruction}

**CRITICAL - ALWAYS BE SPECIFIC (Regardless of Format):**
ALL answers MUST include concrete, actionable veterinary details:
- ✅ Specific numbers: "5-8 years old", "85% sensitivity", "cortisol > 22 µg/dL", "3-5 kg body weight"
- ✅ Specific disease names: "Patellar luxation", "Cranial cruciate ligament rupture", "Feline hyperthyroidism"
- ✅ Specific breeds/ages: "Golden Retrievers aged 5-12 years", "Toy breed dogs", "middle-aged cats 8-12 years"
- ✅ Specific drugs/dosages: "Carprofen 2-4 mg/kg PO q12h", "Prednisolone 0.5-1 mg/kg PO q24h"
- ✅ Specific guidelines/organizations: "WSAVA recommendations", "ACVIM consensus statement", "AAHA guidelines", "ACVS protocol"
- ✅ Specific diagnostic criteria: "ACTH stimulation test cutoff", "Joint fluid WBC > 50,000/µL", "Drawer sign positive"
- ❌ AVOID vague terms: "various causes", "several options", "generally", "may occur", "common in dogs"

**CRITICAL - Response Style Selection:**
Before answering, analyze the question type and automatically adjust your response format:

A) **DIAGNOSTIC CRITERIA Questions** (keywords: "진단기준", "진단 기준", "diagnostic criteria", "how to diagnose", "confirmation test", "확진"):
   → **FORMAT**: Use tables for test comparisons
   → **CONTENT REQUIREMENTS**:
     * Exact cutoff values with units (e.g., "cortisol > 22 µg/dL", "T4 > 4.5 µg/dL")
     * Sensitivity/specificity percentages if available
     * Veterinary guideline organization names (WSAVA, ACVIM, AAHA, ACVS, etc.)
     * Clinical interpretation with specific thresholds
   → Example format:
     ## Diagnostic Criteria for Canine Hyperadrenocorticism (Cushing's Disease)

     | Test | Positive Criteria | Sensitivity | Specificity | Guideline |
     |------|------------------|-------------|-------------|-----------|
     | ACTH stimulation | Post-ACTH cortisol > 22 µg/dL | 85% | 91% | ACVIM[1] |
     | Low-dose dexamethasone | 8h cortisol > 1.4 µg/dL | 95% | 73% | ACVIM[2] |
     | UCCR (urine cortisol:creatinine) | Ratio > 30 × 10⁻⁶ | 99% | 25% | Screening only[1] |

     **Interpretation:**
     The ACVIM recommends ACTH stimulation as the gold standard confirmatory test for canine hyperadrenocorticism, with post-stimulation cortisol values above 22 µg/dL indicating disease. Diagnosis should combine test results with characteristic clinical signs including polyuria (>100 mL/kg/day), polydipsia, polyphagia, pot-bellied appearance, and bilateral symmetric alopecia.[1]

B) **DIFFERENTIAL DIAGNOSIS Questions** (e.g., what disease causes X, my dog has Y symptom, possible causes of Z, 절뚝거림 원인):
   → **FORMAT**: Use prose paragraphs organized by diagnostic priority
   → **STRUCTURE**: Group into "Most Likely Diagnoses" and "Not to Miss Diagnoses" sections
   → **CONTENT REQUIREMENTS** (for EACH disease):
     * Specific age range (e.g., "5-8 years old", "geriatric cats >12 years", NOT "older animals")
     * Specific breeds if relevant (e.g., "Labrador Retrievers and Golden Retrievers", NOT "large breeds")
     * Specific clinical signs (e.g., "acute non-weight-bearing lameness with positive drawer sign", NOT "limping")
     * Specific duration/timeline (e.g., "resolves within 7-10 days with NSAIDs", NOT "short duration")
     * Specific diagnostic findings with numbers (e.g., "joint fluid WBC > 50,000/µL with >90% neutrophils", NOT "elevated inflammatory markers")
     * Veterinary guideline organizations (e.g., "ACVIM recommends...", "WSAVA guidelines state...", "AAHA protocol...")
   → Example format:
     ## Most Likely Diagnoses

     Cranial cruciate ligament (CCL) partial rupture is the most common cause of hindlimb lameness in medium to large breed dogs aged 5-8 years, particularly in Labrador Retrievers, Golden Retrievers, and Rottweilers. Clinical presentation includes acute to chronic intermittent lameness, positive cranial drawer sign or tibial thrust test, and joint effusion. The ACVS (American College of Veterinary Surgeons) recommends early surgical stabilization (TPLO or TTA) to prevent progression to complete rupture and degenerative joint disease, with 85-90% of dogs returning to normal function post-surgery.[1]

     Patellar luxation occurs predominantly in toy and small breed dogs (Chihuahuas, Yorkshire Terriers, Pomeranians) aged 2-6 years, presenting as intermittent skipping or hindlimb lameness with the dog holding the leg off the ground for several steps before returning to normal gait. Physical examination reveals medial patellar displacement (Grade II-III on a I-IV scale), and the Orthopedic Foundation for Animals recommends surgical correction for Grade III-IV luxation to prevent cartilage damage and osteoarthritis.[2]

     ## Not to Miss Diagnoses

     Septic arthritis presents with acute severe lameness, non-weight-bearing on the affected limb, fever (>103°F/39.4°C), joint swelling, and severe pain on manipulation. Joint fluid analysis shows WBC count > 50,000/µL with >90% neutrophils and positive bacterial culture (commonly Staphylococcus or Streptococcus species). The ACVIM recommends immediate arthrotomy or arthroscopy for joint lavage combined with culture-based systemic antibiotics for 4-6 weeks, as delay beyond 24-48 hours significantly worsens prognosis.[3]

     Osteosarcoma is the most common primary bone tumor in large and giant breed dogs aged 7-10 years (Great Danes, Saint Bernards, Irish Wolfhounds), presenting as progressive non-weight-bearing lameness with firm palpable swelling over the metaphyseal region of long bones (most commonly distal radius, proximal humerus, distal femur). Radiographic findings include mixed lytic and proliferative bone lesions with cortical destruction and "sunburst" periosteal reaction. The ACVIM Oncology consensus statement recommends tissue biopsy for definitive diagnosis, limb amputation or limb-sparing surgery combined with adjuvant chemotherapy (carboplatin), with median survival of 10-12 months with treatment versus 4-5 months without.[4]

C) **TREATMENT/PROTOCOL Questions** (e.g., how to treat X, what drugs for Y, dosage recommendations, 치료 방법):
   → **FORMAT**: Use tables for drug comparisons or treatment protocols
   → **CONTENT REQUIREMENTS**:
     * Exact drug names and dosages with units (e.g., "Carprofen 2-4 mg/kg PO q12h", "Enrofloxacin 5-10 mg/kg IV q24h")
     * Specific routes of administration (PO, IV, SC, IM, topical)
     * Specific monitoring parameters with frequency (e.g., "Check ALT, ALP, creatinine every 2 weeks")
     * Specific contraindications (e.g., "Avoid in cats with chronic kidney disease CKD Stage 3+")
     * Veterinary guideline organizations (WSAVA, IRIS, ACVIM, AAHA, etc.)
   → Example:
     ## Treatment Protocol for Canine Osteoarthritis

     | Drug Class | Drug Name | Dosage | Route | Monitoring | Contraindications |
     |-----------|-----------|--------|-------|-----------|-------------------|
     | NSAIDs | Carprofen | 2-4 mg/kg q12h | PO | CBC, ALT, creatinine q6mo | Renal disease, concurrent steroids[1] |
     | NSAIDs | Meloxicam | 0.1 mg/kg q24h | PO | CBC, ALT, creatinine q6mo | GI ulceration, dehydration[1] |
     | Nutraceuticals | Glucosamine/Chondroitin | 20 mg/kg q24h | PO | None required | None known[2] |
     | Monoclonal antibody | Bedinvetmab | 0.5-1 mg/kg q28d | SC | None required | Hypersensitivity reactions[3] |

     **WSAVA Pain Management Guidelines Recommendations:**
     - Start with NSAIDs as first-line therapy for dogs without contraindications
     - Add multimodal analgesia (gabapentin 10-20 mg/kg q8-12h) for refractory pain
     - Monitor hepatic and renal function every 6 months in dogs on chronic NSAIDs
     - Consider bedinvetmab (Librela) for dogs with NSAID contraindications[1-3]

D) **PATHOPHYSIOLOGY/MECHANISM Questions** (e.g., what is X, explain the mechanism, how does it work, 병태생리, 작용 원리):
   → **FORMAT**: Use flowing prose paragraphs with minimal structural formatting
   → **CONTENT REQUIREMENTS** (STILL MUST BE SPECIFIC):
     * Specific percentages (e.g., "85% of cases", "occurs in 15% of affected animals", NOT "most cases")
     * Specific mechanisms with scientific names (e.g., "Type III hypersensitivity mediated by immune complex deposition", NOT "immune reaction")
     * Specific cell types/mediators (e.g., "IL-6, TNF-α, and PGE2 release", NOT "inflammatory cytokines")
     * Specific anatomical structures (e.g., "zona fasciculata of adrenal cortex", NOT "adrenal gland")
     * Specific timeline details (e.g., "within 24-48 hours of exposure", NOT "quickly")
   → Example:
     The pathophysiology of canine hyperadrenocorticism (Cushing's disease) involves excessive cortisol production from the adrenal cortex. In 85% of cases, this results from a pituitary macroadenoma (>1 cm diameter) or microadenoma (<1 cm) in the pars distalis secreting excessive ACTH, leading to bilateral adrenocortical hyperplasia and increased cortisol synthesis in the zona fasciculata.[1] In the remaining 15% of cases, a primary adrenal tumor (adenoma or carcinoma) autonomously secretes cortisol independent of ACTH regulation.[1] The excess cortisol produces multiple systemic effects through glucocorticoid receptor activation: protein catabolism causes progressive muscle weakness and thin skin (<0.5 mm thickness on ultrasound), hepatomegaly develops due to glycogen accumulation and steroid-induced hepatopathy (liver size >1.5× normal on ultrasound), and immunosuppression increases susceptibility to urinary tract infections (UTI prevalence 40-50% in affected dogs).[2] Clinical manifestations include polyuria (>100 mL/kg/day) and polydipsia (>100 mL/kg/day) due to cortisol interference with ADH binding in renal collecting ducts, polyphagia from hypothalamic appetite center stimulation, and bilateral symmetric alopecia from follicular atrophy.[2]

**Important Citation and Writing Rules:**
1. **Always cite references**: Every sentence or paragraph must cite at least one reference in square brackets (e.g., [1], [2-3], [1,4])
2. **Be SPECIFIC and PRACTICAL**: Avoid vague statements like "various conditions", "may cause", "commonly seen"
3. **Use concrete details**: Include exact numbers, durations, breed names, drug names, dosages from the references
4. **Name organizations**: When guidelines exist, cite the specific veterinary organization (WSAVA, ACVIM, AAHA, ACVS, IRIS, etc.)
5. **Include clinical significance**: Explain practical implications for veterinarians treating animal patients
6. **Use professional terminology**: Use proper veterinary medical terminology with English terms in parentheses when writing in other languages
7. **State limitations**: Explicitly state if specific information is not available in the provided guidelines
8. **Format appropriately**: Use tables for comparisons/criteria, prose for mechanisms/concepts (see examples above)"""

    # 사용 가능한 Reference 번호 계산
    num_references = len(doc_order)
    valid_refs = ", ".join([f"[{i}]" for i in range(1, num_references + 1)])

    # 사용자 프롬프트
    user_prompt = f"""Please answer the following question about VETERINARY MEDICINE based on the veterinary clinical guideline content provided below.

**IMPORTANT CONTEXT:**
- This is a VETERINARY MEDICINE platform for treating ANIMALS (dogs, cats, etc.)
- All references are from VETERINARY literature
- Your answer MUST be about ANIMAL PATIENTS, not human patients
- Use veterinary-specific terminology and animal-focused language

{context_text}

Question: {question}

Answer Guidelines:
1. **CRITICAL**: You have EXACTLY {num_references} references available: {valid_refs}
2. **ONLY cite these numbers**: {valid_refs}. DO NOT use any other numbers like [6], [7], [8] etc. if they don't exist.
3. **EVERY sentence must cite at least one reference**. If you cannot answer based on the provided references, say "The provided guidelines do not contain information about this topic."
4. Cite using bracketed numbers at the end of sentences (e.g., "...is recommended.[1]" or "...has been reported.[2-3]")
5. **DO NOT mention "Reference 1", "Reference 2", "according to Reference X", or "based on Reference Y" in your answer text**
6. **ONLY use bracketed citations like [1], [2], [3]**

**CRITICAL SPECIFICITY REQUIREMENTS (Apply to ALL Question Types):**
Your answer MUST include concrete veterinary details extracted from the references:
- Specific numbers: ages (e.g., "5-8 years"), percentages (e.g., "85% of cases"), measurements (e.g., "cortisol > 22 µg/dL")
- Specific disease names: full medical terminology (e.g., "Cranial cruciate ligament rupture", not just "knee injury")
- Specific breeds when mentioned: exact breed names (e.g., "Labrador Retrievers, Golden Retrievers", not "large breeds")
- Specific drugs/dosages: complete prescriptions (e.g., "Carprofen 2-4 mg/kg PO q12h", not "NSAIDs")
- Specific organizations: name the veterinary organization (e.g., "ACVIM recommends", "WSAVA guidelines state")
- Specific diagnostic criteria: exact thresholds and test names (e.g., "Joint fluid WBC > 50,000/µL", not "high white cell count")

**Formatting Instructions Based on Question Type:**

**For DIAGNOSTIC CRITERIA / TREATMENT PROTOCOL questions:**
- Use tables to compare tests or drugs
- Include exact cutoff values, sensitivity/specificity, dosages
- Add interpretation section with specific thresholds
- Example table format:
  | Test | Positive Criteria | Sensitivity | Specificity | Guideline |
  |------|------------------|-------------|-------------|-----------|
  | ACTH stimulation | Post-ACTH cortisol > 22 µg/dL | 85% | 91% | ACVIM[1] |

**For DIFFERENTIAL DIAGNOSIS questions:**
- Use prose paragraphs organized into "Most Likely Diagnoses" and "Not to Miss Diagnoses" sections
- For each disease, write a complete paragraph including: specific age/breed, specific clinical signs, specific diagnostic findings, specific treatment outcomes
- Focus on diagnostic priority and clinical decision-making
- Example: "Cranial cruciate ligament rupture is the most common cause of hindlimb lameness in medium to large breed dogs aged 5-8 years, particularly in Labrador Retrievers..."

**For PATHOPHYSIOLOGY / MECHANISM questions:**
- Use flowing prose paragraphs without excessive structure
- STILL include specific numbers, percentages, anatomical terms, cell types, mediators
- Example: "In 85% of cases, this results from a pituitary macroadenoma (>1 cm diameter) secreting excessive ACTH..."
"""

    try:
        # 대화 히스토리를 포함한 메시지 구성
        messages = [{"role": "system", "content": system_prompt}]

        # 이전 대화 히스토리 추가 (최근 3개까지만 - 컨텍스트 길이 제한)
        if conversation_history:
            # 최근 3턴(6개 메시지)까지만 포함
            recent_history = conversation_history[-6:]
            for msg in recent_history:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                if role in ["user", "assistant"] and content:
                    messages.append({"role": role, "content": content})

        # 현재 질문과 컨텍스트 추가
        messages.append({"role": "user", "content": user_prompt})

        stream = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.3,
            max_tokens=2000,  # 프롬프트가 길어서 충분한 토큰 필요
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

        # 🚀 스트리밍 완료 - 버퍼에 남은 내용 즉시 처리 및 전송 (버퍼링 제거)
        if buffer:
            print(f"📝 Flushing final buffer: '{buffer}'", file=sys.stderr, flush=True)

            # 버퍼에 남은 내용을 즉시 처리 (citation 재매핑 포함)
            final_output = ""
            while buffer:
                match = re.search(r'\[(\d+)\]', buffer)

                if match:
                    cite_num = int(match.group(1))
                    before_citation = buffer[:match.start()]
                    final_output += before_citation

                    if 1 <= cite_num <= num_references:
                        if cite_num not in seen_citations:
                            seen_citations.add(cite_num)
                            citation_map[cite_num] = len(citation_map) + 1
                            print(f"🆕 New citation in final buffer: [{cite_num}] → [{citation_map[cite_num]}]", file=sys.stderr, flush=True)

                        new_num = citation_map[cite_num]
                        final_output += f"[{new_num}]"
                        print(f"   ✅ Remapped [{cite_num}] → [{new_num}] in final buffer", file=sys.stderr, flush=True)
                    else:
                        print(f"⚠️  Invalid citation [{cite_num}] removed from final buffer", file=sys.stderr, flush=True)

                    buffer = buffer[match.end():]
                else:
                    # citation 없으면 그대로 추가
                    final_output += buffer
                    buffer = ""

            # 최종 버퍼 내용을 한 번에 전송 (버퍼링 없음)
            if final_output:
                full_answer += final_output
                yield (final_output, False)
                print(f"✅ Final buffer flushed: {len(final_output)} chars", file=sys.stderr, flush=True)

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
async def generate_followup_questions(question: str, answer: str, conversation_history: List[Dict], detected_lang: str = "Korean") -> List[str]:
    """
    GPT-4o-mini를 사용하여 맥락 기반 후속 질문 3-4개 생성
    detected_lang: 감지된 언어 (Korean/Japanese/English)
    """
    # 대화 맥락 구성
    context = ""
    if conversation_history:
        context = "Previous conversation:\n"
        for msg in conversation_history[-3:]:  # 최근 3개만
            context += f"{msg['role']}: {msg['content'][:200]}...\n"

    prompt = f"""Based on the following VETERINARY MEDICINE Q&A conversation about ANIMAL PATIENTS, generate 3-4 highly SPECIFIC follow-up questions that a veterinarian might ask.

**CONTEXT**: This is about VETERINARY medicine for treating ANIMALS (dogs, cats, etc.), NOT human medicine.

{context}

Current Question: {question}

Current Answer: {answer[:800]}...

**CRITICAL - Generate SPECIFIC, ACTIONABLE follow-up questions:**

Your follow-up questions MUST:
1. Reference SPECIFIC tests, criteria, or drugs mentioned in the answer (e.g., "ACTH 자극 검사", "Kocher criteria", "Carprofen 용량")
2. Ask about SPECIFIC next steps or clinical decisions (e.g., "어떤 검사를 추가로 진행해야 하나요?", "수술적 치료가 필요한가요?")
3. Include SPECIFIC patient contexts (e.g., "5세 래브라도에서", "만성 신부전이 있는 고양이에서")
4. Focus on practical clinical scenarios (e.g., "이 검사 결과가 양성이면 다음 단계는?", "약물 반응이 없으면 어떻게 하나요?")
5. Use ANIMAL-specific terminology (e.g., "개에서", "고양이에게", "for dogs", "in cats")

**BAD Examples (too vague):**
❌ "다른 원인은 무엇인가요?"
❌ "치료 방법은 무엇인가요?"
❌ "What are the symptoms?"

**GOOD Examples (specific and actionable):**
✅ "ACTH 자극 검사에서 cortisol이 22 µg/dL 이상 나오면 어떤 치료를 시작해야 하나요?"
✅ "십자인대 파열이 의심되는 7세 골든 리트리버에서 TPLO와 TTA 중 어떤 수술이 더 적합한가요?"
✅ "If joint fluid WBC is >50,000/µL, what antibiotics should I start empirically before culture results?"
✅ "쿠싱 증후군 확진 후 trilostane 용량은 어떻게 조절하나요?"

**CRITICAL - LANGUAGE REQUIREMENT:**
- The detected language is: {detected_lang}
- You MUST generate follow-up questions in {detected_lang}
- If detected_lang is "Korean", write in Korean (한국어)
- If detected_lang is "English", write in English
- If detected_lang is "Japanese", write in Japanese (日本語)

Return ONLY the questions, one per line, without numbering or bullet points."""

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",  # 가성비 있는 모델
            messages=[
                {"role": "system", "content": "You are a helpful assistant that generates relevant follow-up questions for VETERINARY MEDICINE discussions about ANIMAL PATIENTS (dogs, cats, horses, etc.). Always focus on animal health, not human health."},
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


# Query Rewriting 함수 (OpenEvidence 방식)
async def rewrite_query_with_context(question: str, conversation_history: List[Dict], detected_lang: str = "Korean") -> str:
    """
    대화 맥락을 보고 질문을 재작성 (OpenEvidence 방식)
    - 이전 대화를 참고하여 모호한 질문을 명확하게 재작성
    - 예: "진단기준은?" → "개 쿠싱 증후군의 진단기준은 무엇인가요?"
    """
    # 대화 히스토리가 없으면 원본 질문 그대로 반환
    if not conversation_history or len(conversation_history) == 0:
        print("📝 대화 히스토리 없음 → 원본 질문 사용")
        return question

    # 최근 2턴(4개 메시지)까지만 사용
    recent_history = conversation_history[-4:]

    # 대화 맥락 구성
    context = "Previous conversation:\n"
    for msg in recent_history:
        role = msg.get("role", "user")
        content = msg.get("content", "")[:300]  # 300자까지만
        context += f"{role}: {content}\n"

    # 언어별 프롬프트
    prompts = {
        "Korean": f"""You are a query rewriting assistant for a VETERINARY MEDICINE search system.

Given the conversation history and the user's new question, rewrite the question to be **standalone and self-contained** by incorporating relevant context from the conversation history.

**Rules:**
1. If the question is already clear and standalone, return it as-is
2. If the question is vague or uses pronouns (e.g., "그것", "이거", "진단기준"), rewrite it with full context
3. Keep the rewritten question concise (1-2 sentences max)
4. Preserve the original language (Korean)
5. Focus on VETERINARY context (animals, not humans)

{context}

Current Question: {question}

Rewrite the question to be standalone. Return ONLY the rewritten question in Korean, nothing else.""",

        "Japanese": f"""You are a query rewriting assistant for a VETERINARY MEDICINE search system.

Given the conversation history and the user's new question, rewrite the question to be **standalone and self-contained** by incorporating relevant context from the conversation history.

**Rules:**
1. If the question is already clear and standalone, return it as-is
2. If the question is vague or uses pronouns, rewrite it with full context
3. Keep the rewritten question concise (1-2 sentences max)
4. Preserve the original language (Japanese)
5. Focus on VETERINARY context (animals, not humans)

{context}

Current Question: {question}

Rewrite the question to be standalone. Return ONLY the rewritten question in Japanese, nothing else.""",

        "English": f"""You are a query rewriting assistant for a VETERINARY MEDICINE search system.

Given the conversation history and the user's new question, rewrite the question to be **standalone and self-contained** by incorporating relevant context from the conversation history.

**Rules:**
1. If the question is already clear and standalone, return it as-is
2. If the question is vague or uses pronouns (e.g., "it", "that", "the criteria"), rewrite it with full context
3. Keep the rewritten question concise (1-2 sentences max)
4. Preserve the original language (English)
5. Focus on VETERINARY context (animals, not humans)

{context}

Current Question: {question}

Rewrite the question to be standalone. Return ONLY the rewritten question in English, nothing else."""
    }

    prompt = prompts.get(detected_lang, prompts["English"])

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful query rewriting assistant for veterinary medicine."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=200
        )

        rewritten_query = response.choices[0].message.content.strip()

        # 큰따옴표나 작은따옴표로 감싸져 있으면 제거
        rewritten_query = rewritten_query.strip('"').strip("'").strip()

        print(f"🔄 Query Rewriting:")
        print(f"   원본: {question}")
        print(f"   재작성: {rewritten_query}")

        return rewritten_query
    except Exception as e:
        print(f"⚠️  Query Rewriting 실패, 원본 사용: {e}")
        return question


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
                {"role": "system", "content": "You are a professional VETERINARY MEDICINE translator. Translate the following veterinary medical question about ANIMAL PATIENTS to English accurately. Return ONLY the translated question, nothing else."},
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
    질문에 대한 답변을 실시간 SSE 스트리밍 (OpenEvidence 방식)

    처리 단계:
    1. 언어 감지
    2. Query Rewriting (대화 맥락을 보고 질문 재작성)
    3. 영어 번역 (재작성된 질문 사용)
    4. 질문 벡터화
    5. 벡터 DB 검색
    6. GPT 답변 스트리밍 (대화 히스토리 포함)
    7. 후속 질문 생성
    8. 완료
    """
    print(f"🗨️  대화 히스토리: {len(conversation_history)}개 메시지")
    if conversation_history:
        print(f"   최근 대화: {conversation_history[-1].get('role')}: {conversation_history[-1].get('content', '')[:100]}...")
    try:
        # 1단계: 언어 감지
        detected_lang = detect_language(question)
        print(f"🌐 감지된 언어: {detected_lang}")

        # 2단계: Query Rewriting (대화 맥락이 있으면)
        rewritten_question = question
        if conversation_history and len(conversation_history) > 0:
            yield create_sse_event({
                "status": "rewriting",
                "message": "대화 맥락을 분석하여 질문 재작성 중..."
            })
            rewritten_question = await rewrite_query_with_context(question, conversation_history, detected_lang)

        # 3단계: 영어 번역 (재작성된 질문 사용)
        if detected_lang != "English":
            yield create_sse_event({
                "status": "translating",
                "message": f"질문을 영어로 번역 중... (감지된 언어: {detected_lang})"
            })
            english_query = await translate_to_english(rewritten_question, detected_lang)
        else:
            english_query = rewritten_question

        # 4단계: 질문 벡터화 (영어 질문 사용)
        yield create_sse_event({
            "status": "embedding",
            "message": "질문을 벡터로 변환 중..."
        })

        embedding_response = openai_client.embeddings.create(
            model="text-embedding-3-small",
            input=english_query  # 영어로 번역된 질문 사용
        )
        query_embedding = embedding_response.data[0].embedding

        # 5단계: 벡터 DB 검색
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

        # 6단계: GPT 답변 스트리밍 시작
        yield create_sse_event({
            "status": "generating",
            "message": "답변 생성 중..."
        })

        # GPT 스트리밍 (원본 질문, 감지된 언어, 대화 히스토리 전달)
        full_answer = ""
        chunk_count = 0
        doc_order = []
        seen_docs = {}
        citation_map = {}
        references_sent = False  # References 전송 플래그

        async for result in generate_answer_stream(question, context_chunks, detected_lang, conversation_history):
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
            else:  # 스트리밍 완료 (5-tuple)
                full_answer, is_done, doc_order, seen_docs, citation_map = result
                print(f"✅ Total chunks sent: {chunk_count}")

                # 🚀 스트리밍 완료 즉시 참고문헌 추출 및 전송 (후속 질문 기다리지 않음)
                if not references_sent:
                    print("📚 즉시 참고문헌 추출 시작...")
                    remapped_answer, references = await extract_references_from_answer(full_answer, doc_order, seen_docs, citation_map)

                    # 참고문헌 즉시 전송
                    yield create_sse_event({
                        "status": "references_ready",
                        "answer": remapped_answer,
                        "references": [ref.dict() for ref in references]
                    })
                    references_sent = True
                    print(f"✅ 참고문헌 즉시 전송 완료: {len(references)}개")

        # 7단계: 후속 질문만 별도로 생성 (백그라운드에서)
        print("💡 후속 질문 생성 시작...")
        followup_questions = await generate_followup_questions(question, full_answer, conversation_history, detected_lang)

        # 8단계: 후속 질문 완료 전송
        yield create_sse_event({
            "status": "done",
            "message": "완료",
            "followup_questions": followup_questions
        })
        print(f"✅ 후속 질문 전송 완료: {len(followup_questions)}개")

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
