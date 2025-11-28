"""
수의학 PDF 처리 파이프라인 (간소화 버전)
Pinecone 벡터 DB에 청킹 및 임베딩 저장
"""

import os
import re
import fitz  # PyMuPDF
from pathlib import Path
from typing import List, Dict
from dotenv import load_dotenv
from openai import OpenAI
from pinecone import Pinecone
import sys
import json

load_dotenv()

# 클라이언트 초기화
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("medical-guidelines")

# 메타데이터 매핑 로드
METADATA_MAPPING = {}
mapping_file = Path(__file__).parent / "pdf_metadata_mapping.json"
if mapping_file.exists():
    with open(mapping_file, 'r', encoding='utf-8') as f:
        METADATA_MAPPING = json.load(f)
    print(f"✅ 메타데이터 매핑 파일 로드 완료: {len(METADATA_MAPPING)}개 PDF")
else:
    print("⚠️  메타데이터 매핑 파일을 찾을 수 없습니다. 자동 추출을 사용합니다.")


# ============================================================
# Step 1: PDF 구조 분석
# ============================================================

def detect_document_type(first_page_text: str, filename: str) -> str:
    """문서 타입 감지 (guideline vs paper)"""

    guideline_patterns = [
        r'guideline', r'recommendation', r'consensus', r'protocol',
        r'standard', r'practice parameter', r'best practice'
    ]

    paper_patterns = [
        r'abstract', r'introduction', r'methods', r'results',
        r'discussion', r'conclusion', r'doi:', r'journal'
    ]

    text_lower = first_page_text.lower()

    guideline_score = sum(1 for p in guideline_patterns if re.search(p, text_lower))
    paper_score = sum(1 for p in paper_patterns if re.search(p, text_lower))

    if guideline_score > paper_score:
        return "guideline"
    else:
        return "paper"


def extract_guideline_metadata(doc: fitz.Document, pdf_path: Path) -> Dict:
    """가이드라인 메타데이터 추출 (매핑 파일 우선)"""

    # 매핑 파일에 정의된 경우 우선 사용
    if pdf_path.name in METADATA_MAPPING:
        mapping = METADATA_MAPPING[pdf_path.name]
        return {
            "title": mapping.get("title", pdf_path.stem),
            "year": mapping.get("year", ""),
            "source": mapping.get("source", ""),
            "authors": mapping.get("authors", ""),
            "journal": mapping.get("journal", ""),
            "doi": mapping.get("doi", ""),
            "filename": pdf_path.name
        }

    # 매핑 파일에 없으면 자동 추출 (기존 로직)
    first_page = doc[0].get_text()

    # 제목 추출 (첫 1000자에서 찾기)
    title_match = re.search(r'^(.+?)\n', first_page[:1000], re.MULTILINE)
    title = title_match.group(1).strip() if title_match else pdf_path.stem

    # 연도 추출
    year_match = re.search(r'\b(19|20)\d{2}\b', first_page)
    year = year_match.group(0) if year_match else "Unknown"

    # 발행처 (ACVIM, WSAVA 등)
    source_patterns = [r'ACVIM', r'WSAVA', r'AAHA', r'AVMA']
    source = "Unknown"
    for pattern in source_patterns:
        if re.search(pattern, first_page, re.IGNORECASE):
            source = pattern
            break

    return {
        "title": title[:200],
        "year": year,
        "source": source,
        "filename": pdf_path.name
    }


def extract_paper_metadata(doc: fitz.Document, pdf_path: Path) -> Dict:
    """논문 메타데이터 추출 (매핑 파일 우선)"""

    # 매핑 파일에 정의된 경우 우선 사용
    if pdf_path.name in METADATA_MAPPING:
        mapping = METADATA_MAPPING[pdf_path.name]
        return {
            "title": mapping.get("title", pdf_path.stem),
            "year": mapping.get("year", ""),
            "authors": mapping.get("authors", ""),
            "journal": mapping.get("journal", ""),
            "doi": mapping.get("doi", ""),
            "filename": pdf_path.name
        }

    # 매핑 파일에 없으면 자동 추출 (기존 로직)
    first_page = doc[0].get_text()

    # 제목
    title_match = re.search(r'^(.+?)\n', first_page[:500], re.MULTILINE)
    title = title_match.group(1).strip() if title_match else pdf_path.stem

    # 연도
    year_match = re.search(r'\b(19|20)\d{2}\b', first_page)
    year = year_match.group(0) if year_match else "Unknown"

    # DOI
    doi_match = re.search(r'doi:\s*([^\s]+)', first_page, re.IGNORECASE)
    doi = doi_match.group(1) if doi_match else ""

    # 저자 (간단하게)
    authors = "Unknown"

    # 저널
    journal = "Unknown"

    return {
        "title": title[:200],
        "year": year,
        "authors": authors,
        "journal": journal,
        "doi": doi,
        "filename": pdf_path.name
    }


def analyze_pdf_structure(doc: fitz.Document, pdf_path: Path) -> Dict:
    """PDF 문서 구조 분석"""

    first_page_text = doc[0].get_text()
    doc_type = detect_document_type(first_page_text, pdf_path.name)

    if doc_type == "guideline":
        metadata = extract_guideline_metadata(doc, pdf_path)
    else:
        metadata = extract_paper_metadata(doc, pdf_path)

    return {
        "doc_type": doc_type,
        "metadata": metadata
    }


# ============================================================
# Step 2: 텍스트 전처리
# ============================================================

def clean_pdf_text(text: str) -> str:
    """PDF 노이즈 제거"""

    # 목차 패턴 제거 (점선)
    text = re.sub(r'\.{3,}.*?\d+', '', text)

    # 페이지 번호 제거 (줄 시작의 숫자)
    text = re.sub(r'^\d+\s*$', '', text, flags=re.MULTILINE)

    # 여러 줄바꿈을 2개로
    text = re.sub(r'\n{3,}', '\n\n', text)

    # 여러 공백을 1개로
    text = re.sub(r' {2,}', ' ', text)

    return text.strip()


# ============================================================
# Step 3: 시맨틱 청킹
# ============================================================

def recursive_chunk_with_overlap(text: str, chunk_size: int = 600, overlap: int = 150) -> List[str]:
    """Recursive Chunking with Overlap"""

    chunks = []
    start = 0

    while start < len(text):
        end = min(start + chunk_size, len(text))

        # 문장 경계로 조정 (텍스트 끝이 아닐 때만)
        if end < len(text):
            found_separator = False
            for separator in ['. ', '.\n', '\n\n', '\n', ' ']:
                last_sep = text.rfind(separator, start, end)
                if last_sep > start:
                    end = last_sep + len(separator)
                    found_separator = True
                    break

            # 구분자를 찾지 못했으면 강제로 chunk_size만큼 자르기
            if not found_separator:
                end = start + chunk_size

        chunk = text[start:end].strip()
        if chunk and len(chunk) > 50:
            chunks.append(chunk)

        # 다음 시작 위치 (overlap 적용)
        next_start = end - overlap

        # 진행이 없으면 강제로 앞으로 이동
        if next_start <= start:
            next_start = start + chunk_size

        start = next_start

        # 무한 루프 방지
        if start >= len(text):
            break

    return chunks


# ============================================================
# Step 4: 임베딩 및 Pinecone 저장
# ============================================================

def create_embeddings(texts: List[str], batch_size: int = 100) -> List[List[float]]:
    """OpenAI API로 임베딩 생성"""

    all_embeddings = []

    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]

        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=batch
        )

        batch_embeddings = [item.embedding for item in response.data]
        all_embeddings.extend(batch_embeddings)

        print(f"  📊 임베딩 생성: {i+1}-{i+len(batch)}/{len(texts)}")

    return all_embeddings


def upsert_to_pinecone(chunks_metadata: List[Dict], embeddings: List[List[float]], batch_size: int = 100):
    """Pinecone에 벡터 저장"""

    total = len(chunks_metadata)

    for i in range(0, total, batch_size):
        batch_meta = chunks_metadata[i:i + batch_size]
        batch_emb = embeddings[i:i + batch_size]

        vectors = []
        for chunk_meta, embedding in zip(batch_meta, batch_emb):
            metadata = {
                "doc_type": chunk_meta["doc_type"],
                "title": chunk_meta["title"],
                "year": chunk_meta["year"],
                "page": chunk_meta["page"],
                "text": chunk_meta["text"],
                "reference_format": chunk_meta["reference_format"]
            }

            # 모든 doc_type에 대해 authors, journal, doi 저장
            metadata["authors"] = chunk_meta.get("authors", "")
            metadata["journal"] = chunk_meta.get("journal", "")
            metadata["doi"] = chunk_meta.get("doi", "")

            vectors.append({
                "id": chunk_meta["id"],
                "values": embedding,
                "metadata": metadata
            })

        index.upsert(vectors=vectors)
        print(f"  💾 Pinecone 저장: {i+1}-{i+len(batch_meta)}/{total}")


# ============================================================
# Step 5: 메인 파이프라인
# ============================================================

def process_single_pdf(pdf_path: Path) -> Dict:
    """단일 PDF 처리"""

    try:
        print(f"\n{'='*60}")
        print(f"📄 처리 중: {pdf_path.name}")
        print(f"{'='*60}")
        sys.stdout.flush()

        # PDF 열기
        doc = fitz.open(pdf_path)

        # 문서 구조 분석
        print("  ⚙️  문서 분석 중...")
        sys.stdout.flush()
        analysis = analyze_pdf_structure(doc, pdf_path)
        doc_type = analysis["doc_type"]
        base_metadata = analysis["metadata"]

        print(f"  📋 문서 타입: {doc_type.upper()}")
        print(f"  📄 제목: {base_metadata.get('title', 'Unknown')[:60]}...")
        print(f"  📅 연도: {base_metadata.get('year', 'Unknown')}")
        print(f"  📊 총 페이지: {len(doc)}")
        sys.stdout.flush()

        # 페이지별 처리
        all_chunks_metadata = []

        print("  ⚙️  페이지 처리 중...")
        sys.stdout.flush()

        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text()

            # 간단한 필터링
            if len(text.strip()) < 100:
                continue

            # 텍스트 정리
            clean_text = clean_pdf_text(text)

            if len(clean_text) < 100:
                continue

            # 청크 분할
            chunks = recursive_chunk_with_overlap(clean_text, chunk_size=600, overlap=150)

            # 각 청크에 메타데이터 추가
            for chunk_idx, chunk_text in enumerate(chunks):
                chunk_id = f"{doc_type}_{pdf_path.stem[:20]}_p{page_num+1}_c{chunk_idx}"
                chunk_id = re.sub(r'[^a-zA-Z0-9_-]', '_', chunk_id)  # 안전한 ID

                # Reference 형식 생성 (모든 문서 동일한 형식)
                ref_parts = []
                if base_metadata.get('authors'):
                    ref_parts.append(base_metadata['authors'])
                if base_metadata.get('journal'):
                    ref_parts.append(base_metadata['journal'])
                if base_metadata.get('year'):
                    ref_parts.append(base_metadata['year'])

                ref_format = ". ".join(ref_parts) if ref_parts else base_metadata.get('title', '')[:50]
                if base_metadata.get('doi'):
                    ref_format += f". doi:{base_metadata['doi']}"

                chunk_meta = {
                    "id": chunk_id,
                    "doc_type": doc_type,
                    "title": base_metadata.get("title", ""),
                    "year": base_metadata.get("year", ""),
                    "authors": base_metadata.get("authors", ""),
                    "journal": base_metadata.get("journal", ""),
                    "doi": base_metadata.get("doi", ""),
                    "page": page_num + 1,
                    "text": chunk_text,
                    "reference_format": ref_format
                }

                all_chunks_metadata.append(chunk_meta)

            if (page_num + 1) % 5 == 0:
                print(f"    ✓ 페이지 {page_num + 1}/{len(doc)} 완료")
                sys.stdout.flush()

        print(f"  📦 총 {len(all_chunks_metadata)}개 청크 생성")
        sys.stdout.flush()

        # 샘플 청크 출력
        print(f"\n  {'─'*58}")
        print("  📋 샘플 청크 (처음 3개)")
        print(f"  {'─'*58}")
        for i, chunk in enumerate(all_chunks_metadata[:3]):
            print(f"\n  [청크 {i+1}]")
            print(f"  페이지: {chunk['page']}")
            print(f"  텍스트: {chunk['text'][:200]}...")
            print(f"  Reference: {chunk['reference_format']}")
        sys.stdout.flush()

        # 임베딩 생성
        print(f"\n  ⚙️  임베딩 생성 중...")
        sys.stdout.flush()
        chunk_texts = [c["text"] for c in all_chunks_metadata]
        embeddings = create_embeddings(chunk_texts)

        # Pinecone에 저장
        print(f"\n  ⚙️  Pinecone에 저장 중...")
        sys.stdout.flush()
        upsert_to_pinecone(all_chunks_metadata, embeddings)

        print(f"\n  ✅ 완료!")
        sys.stdout.flush()

        return {
            "success": True,
            "chunks": len(all_chunks_metadata),
            "metadata": base_metadata
        }

    except Exception as e:
        print(f"\n  ❌ 오류: {e}")
        import traceback
        traceback.print_exc()
        sys.stdout.flush()
        return {
            "success": False,
            "error": str(e)
        }


# ============================================================
# 메인 실행
# ============================================================

if __name__ == "__main__":
    guidelines_folder = Path("/Users/ksinfosys/medical/data-pipeline/guidelines")

    # 테스트: 1개 PDF만 처리
    test_mode = len(sys.argv) > 1 and sys.argv[1] == "--test"

    if test_mode:
        pdf_files = list(guidelines_folder.glob("*.pdf"))
        pdf_files = [f for f in pdf_files if not f.name.startswith(".")]

        if pdf_files:
            print(f"🧪 테스트 모드: 1개 PDF만 처리")
            result = process_single_pdf(pdf_files[0])

            if result["success"]:
                print(f"\n✅ 성공! {result['chunks']}개 청크 처리됨")
            else:
                print(f"\n❌ 실패: {result.get('error')}")
        else:
            print("❌ PDF 파일을 찾을 수 없습니다.")

    else:
        # 전체 처리
        pdf_files = list(guidelines_folder.glob("*.pdf"))
        pdf_files = [f for f in pdf_files if not f.name.startswith(".")]

        print(f"🚀 전체 처리 시작: {len(pdf_files)}개 PDF")

        results = []
        for pdf_file in pdf_files:
            result = process_single_pdf(pdf_file)
            results.append({
                "filename": pdf_file.name,
                **result
            })

        # 결과 요약
        print(f"\n{'='*60}")
        print("📊 처리 결과 요약")
        print(f"{'='*60}")

        success_count = sum(1 for r in results if r["success"])
        total_chunks = sum(r.get("chunks", 0) for r in results if r["success"])

        print(f"✅ 성공: {success_count}/{len(results)}")
        print(f"📦 총 청크: {total_chunks:,}개")

        if any(not r["success"] for r in results):
            print(f"\n❌ 실패한 파일:")
            for r in results:
                if not r["success"]:
                    print(f"   - {r['filename']}: {r.get('error', 'Unknown')}")
