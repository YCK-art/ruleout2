"""
수의학 XML 논문 처리 파이프라인
PMC XML 파일을 파싱하여 Pinecone 벡터 DB에 청킹 및 임베딩 저장
"""

import os
import re
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

            # Reference 형식 생성
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

        # 샘플 청크 출력
        print(f"\n  {'─'*58}")
        print("  📋 샘플 청크 (처음 2개)")
        print(f"  {'─'*58}")
        for i, chunk in enumerate(all_chunks_metadata[:2]):
            print(f"\n  [청크 {i+1}]")
            print(f"  텍스트: {chunk['text'][:150]}...")
            print(f"  Reference: {chunk['reference_format'][:80]}...")
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
    xml_folder = Path("/Users/ksinfosys/medical/data-pipeline/guidelines/xml")

    # 테스트: 1개 XML만 처리
    test_mode = len(sys.argv) > 1 and sys.argv[1] == "--test"

    if test_mode:
        xml_files = list(xml_folder.glob("*.xml"))
        xml_files = [f for f in xml_files if not f.name.startswith(".")]

        if xml_files:
            print(f"🧪 테스트 모드: 1개 XML만 처리")
            result = process_single_xml(xml_files[0])

            if result["success"]:
                print(f"\n✅ 성공! {result['chunks']}개 청크 처리됨")
            else:
                print(f"\n❌ 실패: {result.get('error')}")
        else:
            print("❌ XML 파일을 찾을 수 없습니다.")

    else:
        # 전체 처리
        xml_files = list(xml_folder.glob("*.xml"))
        xml_files = [f for f in xml_files if not f.name.startswith(".")]

        print(f"🚀 전체 처리 시작: {len(xml_files)}개 XML")

        results = []
        for xml_file in xml_files:
            result = process_single_xml(xml_file)
            results.append({
                "filename": xml_file.name,
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
