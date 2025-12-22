"""
BMC Veterinary Research XML 논문 처리 파이프라인
PMC XML 파일을 파싱하여 Pinecone 벡터 DB에 청킹 및 임베딩 저장
진행 상황 자동 저장 (10개마다)
"""

import os
import re
import json
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import List, Dict, Optional
from dotenv import load_dotenv
from openai import OpenAI
from pinecone import Pinecone
import sys

load_dotenv()

# 클라이언트 초기화
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("medical-guidelines")

# 진행 상황 파일
PROGRESS_FILE = Path("/Users/ksinfosys/medical/data-pipeline/bmcvetres_processing_progress.json")


# ============================================================
# 진행 상황 관리
# ============================================================

def load_progress():
    """진행 상황 로드"""
    if PROGRESS_FILE.exists():
        with open(PROGRESS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {
        "processed_files": [],
        "total_processed": 0,
        "total_chunks": 0
    }


def save_progress(progress):
    """진행 상황 저장"""
    with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
        json.dump(progress, f, indent=2, ensure_ascii=False)
    print(f"\n  💾 진행 상황 저장됨: {progress['total_processed']}개 파일, {progress['total_chunks']}개 청크")


# ============================================================
# Step 1: XML 메타데이터 추출
# ============================================================

def extract_text_from_element(element, default=""):
    """XML 엘리먼트에서 텍스트 추출"""
    if element is None:
        return default
    text = ''.join(element.itertext()).strip()
    return text if text else default


def extract_xml_metadata(xml_path: Path) -> Dict:
    """PMC XML에서 메타데이터 추출"""

    try:
        tree = ET.parse(xml_path)
        root = tree.getroot()

        # Namespace 처리 (PMC XML은 보통 namespace가 있음)
        namespaces = {'': 'http://www.w3.org/1998/Math/MathML'} if root.tag.startswith('{') else {}

        # 메타데이터 초기화
        metadata = {
            "title": "",
            "authors": "",
            "journal": "",
            "year": "",
            "doi": "",
            "pmcid": "",
            "pmid": "",
            "abstract": ""
        }

        # PMCID 추출 (파일명에서)
        pmcid_match = re.search(r'PMC\d+', xml_path.name)
        if pmcid_match:
            metadata["pmcid"] = pmcid_match.group(0)

        # article-meta 찾기
        article_meta = root.find('.//article-meta')
        if article_meta is None:
            print(f"  ⚠️  article-meta를 찾을 수 없습니다.")
            return metadata

        # 제목 추출
        title_elem = article_meta.find('.//article-title')
        if title_elem is not None:
            metadata["title"] = extract_text_from_element(title_elem)

        # 저자 추출
        authors = []
        for contrib in article_meta.findall('.//contrib[@contrib-type="author"]'):
            name_elem = contrib.find('.//name')
            if name_elem is not None:
                surname = extract_text_from_element(name_elem.find('surname'))
                given = extract_text_from_element(name_elem.find('given-names'))
                if surname:
                    author_name = f"{given} {surname}" if given else surname
                    authors.append(author_name)

        if authors:
            if len(authors) <= 6:
                # 저자가 6명 이하 → 전원 표기
                metadata["authors"] = ", ".join(authors)
            else:
                # 저자가 7명 이상 → 앞 6명만 표기하고 et al.
                metadata["authors"] = ", ".join(authors[:6]) + ", et al."

        # 저널명 추출
        journal_elem = root.find('.//journal-title')
        if journal_elem is not None:
            metadata["journal"] = extract_text_from_element(journal_elem)

        # 연도 추출
        year_elem = article_meta.find('.//pub-date[@pub-type="epub"]/year')
        if year_elem is None:
            year_elem = article_meta.find('.//pub-date/year')
        if year_elem is not None:
            metadata["year"] = extract_text_from_element(year_elem)

        # DOI 추출
        doi_elem = article_meta.find('.//article-id[@pub-id-type="doi"]')
        if doi_elem is not None:
            metadata["doi"] = extract_text_from_element(doi_elem)

        # PMID 추출
        pmid_elem = article_meta.find('.//article-id[@pub-id-type="pmid"]')
        if pmid_elem is not None:
            metadata["pmid"] = extract_text_from_element(pmid_elem)

        # 초록 추출
        abstract_elem = article_meta.find('.//abstract')
        if abstract_elem is not None:
            metadata["abstract"] = extract_text_from_element(abstract_elem)

        return metadata

    except Exception as e:
        print(f"  ❌ XML 파싱 오류: {e}")
        return {
            "title": xml_path.stem,
            "authors": "",
            "journal": "",
            "year": "",
            "doi": "",
            "pmcid": "",
            "pmid": "",
            "abstract": ""
        }


def extract_xml_body_text(xml_path: Path) -> str:
    """PMC XML에서 본문 텍스트 추출"""

    try:
        tree = ET.parse(xml_path)
        root = tree.getroot()

        # body 엘리먼트 찾기
        body_elem = root.find('.//body')
        if body_elem is None:
            print(f"  ⚠️  본문(body)을 찾을 수 없습니다.")
            return ""

        # 본문 텍스트 추출
        body_text = extract_text_from_element(body_elem)

        return body_text

    except Exception as e:
        print(f"  ❌ 본문 추출 오류: {e}")
        return ""


# ============================================================
# Step 2: 텍스트 전처리
# ============================================================

def clean_xml_text(text: str) -> str:
    """XML 텍스트 정리"""

    # 여러 줄바꿈을 2개로
    text = re.sub(r'\n{3,}', '\n\n', text)

    # 여러 공백을 1개로
    text = re.sub(r' {2,}', ' ', text)

    # 특수 문자 정리
    text = text.replace('\u200b', '')  # Zero-width space
    text = text.replace('\xa0', ' ')  # Non-breaking space

    return text.strip()


# ============================================================
# Step 3: 시맨틱 청킹 (PDF와 동일)
# ============================================================

def recursive_chunk_with_overlap(text: str, chunk_size: int = 600, overlap: int = 150) -> List[str]:
    """Recursive Chunking with Overlap (PDF 파이프라인과 동일)"""

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
# Step 4: 임베딩 및 Pinecone 저장 (PDF와 동일)
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
    """Pinecone에 벡터 저장 (PDF 파이프라인과 동일)"""

    total = len(chunks_metadata)

    for i in range(0, total, batch_size):
        batch_meta = chunks_metadata[i:i + batch_size]
        batch_emb = embeddings[i:i + batch_size]

        vectors = []
        for chunk_meta, embedding in zip(batch_meta, batch_emb):
            metadata = {
                "doc_type": "paper",  # XML은 모두 논문
                "title": chunk_meta["title"],
                "year": chunk_meta["year"],
                "page": chunk_meta.get("chunk_index", 0),  # XML은 페이지 대신 청크 인덱스
                "text": chunk_meta["text"],
                "reference_format": chunk_meta["reference_format"],
                "authors": chunk_meta.get("authors", ""),
                "journal": chunk_meta.get("journal", ""),
                "doi": chunk_meta.get("doi", ""),
                "pmcid": chunk_meta.get("pmcid", ""),
                "pmid": chunk_meta.get("pmid", "")
            }

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

def process_single_xml(xml_path: Path) -> Dict:
    """단일 XML 파일 처리"""

    try:
        print(f"\n{'='*60}")
        print(f"📄 처리 중: {xml_path.name}")
        print(f"{'='*60}")
        sys.stdout.flush()

        # 메타데이터 추출
        print("  ⚙️  메타데이터 추출 중...")
        sys.stdout.flush()
        metadata = extract_xml_metadata(xml_path)

        print(f"  📋 제목: {metadata.get('title', 'Unknown')[:60]}...")
        print(f"  ✍️  저자: {metadata.get('authors', 'Unknown')}")
        print(f"  📰 저널: {metadata.get('journal', 'Unknown')}")
        print(f"  📅 연도: {metadata.get('year', 'Unknown')}")
        print(f"  🔗 DOI: {metadata.get('doi', 'N/A')}")
        print(f"  🆔 PMCID: {metadata.get('pmcid', 'N/A')}")
        sys.stdout.flush()

        # 본문 텍스트 추출
        print("  ⚙️  본문 텍스트 추출 중...")
        sys.stdout.flush()
        body_text = extract_xml_body_text(xml_path)

        if not body_text or len(body_text) < 100:
            print(f"  ⚠️  본문이 너무 짧거나 없습니다. (길이: {len(body_text)})")
            return {
                "success": False,
                "error": "본문이 없거나 너무 짧음"
            }

        # 텍스트 정리
        clean_text = clean_xml_text(body_text)
        print(f"  📏 본문 길이: {len(clean_text):,}자")
        sys.stdout.flush()

        # 청크 분할
        print("  ⚙️  텍스트 청킹 중...")
        sys.stdout.flush()
        chunks = recursive_chunk_with_overlap(clean_text, chunk_size=600, overlap=150)
        print(f"  📦 총 {len(chunks)}개 청크 생성")
        sys.stdout.flush()

        # 각 청크에 메타데이터 추가
        all_chunks_metadata = []

        for chunk_idx, chunk_text in enumerate(chunks):
            # ID 생성 (paper_pmcid_c인덱스)
            pmcid = metadata.get('pmcid', xml_path.stem)
            chunk_id = f"paper_{pmcid}_c{chunk_idx}"
            chunk_id = re.sub(r'[^a-zA-Z0-9_-]', '_', chunk_id)

            # Reference 형식 생성 (PDF 스타일)
            ref_parts = []
            if metadata.get('authors'):
                ref_parts.append(metadata['authors'])
            if metadata.get('journal'):
                ref_parts.append(metadata['journal'])
            if metadata.get('year'):
                ref_parts.append(metadata['year'])

            ref_format = ". ".join(ref_parts) if ref_parts else metadata.get('title', '')[:50]
            if metadata.get('doi'):
                ref_format += f". doi:{metadata['doi']}"

            chunk_meta = {
                "id": chunk_id,
                "title": metadata.get("title", ""),
                "year": metadata.get("year", ""),
                "authors": metadata.get("authors", ""),
                "journal": metadata.get("journal", ""),
                "doi": metadata.get("doi", ""),
                "pmcid": metadata.get("pmcid", ""),
                "pmid": metadata.get("pmid", ""),
                "chunk_index": chunk_idx,
                "text": chunk_text,
                "reference_format": ref_format
            }

            all_chunks_metadata.append(chunk_meta)

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
            "metadata": metadata
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
    xml_folder = Path("/Users/ksinfosys/medical/data-pipeline/guidelines/xml_bmcvetres")

    # 진행 상황 로드
    progress = load_progress()
    processed_files_set = set(progress["processed_files"])

    print(f"\n{'='*60}")
    print(f"🚀 BMC Veterinary Research XML 논문 처리 시작")
    print(f"{'='*60}")
    print(f"📁 폴더: {xml_folder}")
    print(f"💾 이전 진행: {progress['total_processed']}개 파일, {progress['total_chunks']}개 청크")
    print(f"{'='*60}\n")

    # XML 파일 목록 가져오기
    xml_files = list(xml_folder.glob("*.xml"))
    xml_files = [f for f in xml_files if not f.name.startswith(".")]

    # 아직 처리하지 않은 파일만 필터링
    remaining_files = [f for f in xml_files if f.name not in processed_files_set]

    print(f"📊 전체 파일: {len(xml_files)}개")
    print(f"✅ 이미 처리됨: {len(processed_files_set)}개")
    print(f"⏳ 남은 파일: {len(remaining_files)}개\n")

    if not remaining_files:
        print("✅ 모든 파일이 이미 처리되었습니다!")
        sys.exit(0)

    # 남은 파일 처리
    for idx, xml_file in enumerate(remaining_files, 1):
        print(f"\n[{idx}/{len(remaining_files)}] 처리 중...")

        result = process_single_xml(xml_file)

        if result["success"]:
            # 진행 상황 업데이트
            progress["processed_files"].append(xml_file.name)
            progress["total_processed"] += 1
            progress["total_chunks"] += result["chunks"]

            # 10개마다 자동 저장
            if progress["total_processed"] % 10 == 0:
                save_progress(progress)

        # 최종 저장
        if idx == len(remaining_files):
            save_progress(progress)

    # 최종 결과
    print(f"\n{'='*60}")
    print("📊 처리 완료!")
    print(f"{'='*60}")
    print(f"✅ 총 처리된 파일: {progress['total_processed']}개")
    print(f"📦 총 생성된 청크: {progress['total_chunks']:,}개")
    print(f"{'='*60}\n")
