"""
Frontiers in Veterinary Science XML 처리 파이프라인
PMC XML 파일을 청킹하여 Pinecone 벡터 DB에 저장
"""

import os
import re
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import List, Dict, Tuple
from dotenv import load_dotenv
from openai import OpenAI
from pinecone import Pinecone
import json

load_dotenv()

# 클라이언트 초기화
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("medical-guidelines")


def extract_text_from_element(element):
    """XML 요소에서 모든 텍스트 추출"""
    if element is None:
        return ""

    text_parts = []
    if element.text:
        text_parts.append(element.text.strip())

    for child in element:
        child_text = extract_text_from_element(child)
        if child_text:
            text_parts.append(child_text)
        if child.tail:
            text_parts.append(child.tail.strip())

    return " ".join(text_parts)


def extract_authors(contrib_group):
    """저자 정보 추출 (6인까지, 이후 et al.)"""
    if contrib_group is None:
        return ""

    authors = []
    for contrib in contrib_group.findall('.//contrib[@contrib-type="author"]'):
        name_elem = contrib.find('.//name')
        if name_elem is not None:
            surname = name_elem.find('surname')
            given_names = name_elem.find('given-names')

            if surname is not None:
                surname_text = surname.text if surname.text else ""
                given_text = ""
                if given_names is not None and given_names.text:
                    # 이니셜만 추출
                    initials = ''.join([c[0] for c in given_names.text.split() if c])
                    given_text = initials

                if surname_text:
                    author = f"{surname_text} {given_text}".strip()
                    authors.append(author)

    # 6인까지만 표기, 이후 et al.
    if len(authors) > 6:
        return ", ".join(authors[:6]) + ", et al."
    else:
        return ", ".join(authors) + "."


def extract_metadata_from_xml(xml_path: Path) -> Dict:
    """PMC XML에서 메타데이터 추출"""
    try:
        tree = ET.parse(xml_path)
        root = tree.getroot()

        # 네임스페이스 처리
        ns = {'': 'http://www.w3.org/1998/Math/MathML'}

        # article-meta에서 정보 추출
        article_meta = root.find('.//article-meta')
        if article_meta is None:
            return None

        # PMCID
        pmcid_elem = article_meta.find('.//article-id[@pub-id-type="pmcid"]')
        pmcid = pmcid_elem.text if pmcid_elem is not None else xml_path.stem

        # PMID
        pmid_elem = article_meta.find('.//article-id[@pub-id-type="pmid"]')
        pmid = pmid_elem.text if pmid_elem is not None else ""

        # DOI
        doi_elem = article_meta.find('.//article-id[@pub-id-type="doi"]')
        doi = doi_elem.text if doi_elem is not None else ""

        # Title
        title_elem = article_meta.find('.//article-title')
        title = extract_text_from_element(title_elem) if title_elem is not None else ""

        # Authors
        contrib_group = article_meta.find('.//contrib-group')
        authors = extract_authors(contrib_group)

        # Journal
        journal_meta = root.find('.//journal-meta')
        journal_title = ""
        if journal_meta is not None:
            journal_elem = journal_meta.find('.//journal-title')
            if journal_elem is not None:
                journal_title = journal_elem.text

        # Publication date
        pub_date = article_meta.find('.//pub-date[@pub-type="epub"]')
        if pub_date is None:
            pub_date = article_meta.find('.//pub-date[@pub-type="collection"]')

        year = ""
        if pub_date is not None:
            year_elem = pub_date.find('year')
            month_elem = pub_date.find('month')
            day_elem = pub_date.find('day')

            year_text = year_elem.text if year_elem is not None else ""
            month_text = month_elem.text if month_elem is not None else ""
            day_text = day_elem.text if day_elem is not None else ""

            if year_text:
                year = f"{year_text}"
                if month_text:
                    year += f" {month_text}"
                if day_text:
                    year += f" {day_text}"

        return {
            "pmcid": pmcid,
            "pmid": pmid,
            "doi": doi,
            "title": title,
            "authors": authors,
            "journal": journal_title if journal_title else "Front Vet Sci",
            "year": year,
            "filename": xml_path.name
        }

    except Exception as e:
        print(f"  ❌ 메타데이터 추출 오류: {e}")
        return None


def extract_full_text_from_xml(xml_path: Path) -> str:
    """XML에서 전체 텍스트 추출"""
    try:
        tree = ET.parse(xml_path)
        root = tree.getroot()

        # body 섹션에서 텍스트 추출
        body = root.find('.//body')
        if body is None:
            return ""

        full_text = extract_text_from_element(body)

        # 중복 공백 제거
        full_text = re.sub(r'\s+', ' ', full_text).strip()

        return full_text

    except Exception as e:
        print(f"  ❌ 텍스트 추출 오류: {e}")
        return ""


def recursive_chunk_with_overlap(text: str, chunk_size: int = 600, overlap: int = 150) -> List[str]:
    """재귀적 청킹 (오버랩 포함)"""
    if not text or len(text) == 0:
        return []

    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size

        # 마지막 청크
        if end >= len(text):
            chunk = text[start:].strip()
            if len(chunk) > 50:  # 최소 길이 체크
                chunks.append(chunk)
            break

        # 문장 경계 찾기
        chunk = text[start:end]

        # 문장 끝 찾기 (., !, ?)
        sentence_end = max(
            chunk.rfind('. '),
            chunk.rfind('! '),
            chunk.rfind('? ')
        )

        if sentence_end > chunk_size * 0.5:
            chunk = text[start:start + sentence_end + 1].strip()
            chunks.append(chunk)
            start = start + sentence_end + 1 - overlap
        else:
            chunk = text[start:end].strip()
            chunks.append(chunk)
            start = end - overlap

    return chunks


def create_embeddings(texts: List[str]) -> List[List[float]]:
    """텍스트 리스트를 임베딩으로 변환"""
    embeddings = []
    batch_size = 100

    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        response = client.embeddings.create(
            input=batch,
            model="text-embedding-3-small"
        )
        batch_embeddings = [item.embedding for item in response.data]
        embeddings.extend(batch_embeddings)

    return embeddings


def process_single_xml(xml_path: Path) -> int:
    """단일 XML 파일 처리"""
    print(f"\n{'='*60}")
    print(f"📄 처리 중: {xml_path.name}")
    print(f"{'='*60}")

    # 메타데이터 추출
    print(f"  ⚙️  메타데이터 추출 중...")
    metadata = extract_metadata_from_xml(xml_path)
    if metadata is None:
        print(f"  ❌ 메타데이터 추출 실패")
        return 0

    print(f"  📋 제목: {metadata['title'][:60]}...")
    print(f"  👥 저자: {metadata['authors'][:60]}...")
    print(f"  📅 연도: {metadata['year']}")
    print(f"  🔖 PMCID: {metadata['pmcid']}")

    # 전체 텍스트 추출
    print(f"  ⚙️  전체 텍스트 추출 중...")
    full_text = extract_full_text_from_xml(xml_path)
    if not full_text:
        print(f"  ❌ 텍스트 추출 실패")
        return 0

    # 청킹
    print(f"  ⚙️  청킹 중...")
    chunks = recursive_chunk_with_overlap(full_text, chunk_size=600, overlap=150)
    print(f"  📦 총 {len(chunks)}개 청크 생성")

    if len(chunks) == 0:
        print(f"  ⚠️  청크 없음")
        return 0

    # Reference 형식 생성 (PDF 스타일과 동일)
    reference = f"{metadata['authors']} {metadata['journal']}. {metadata['year']}. doi:{metadata['doi']}"

    # 샘플 청크 출력
    print(f"\n  {'─'*58}")
    print(f"  📋 샘플 청크 (처음 2개)")
    print(f"  {'─'*58}")
    for i in range(min(2, len(chunks))):
        print(f"\n  [청크 {i+1}]")
        print(f"  텍스트: {chunks[i][:100]}...")
        print(f"  Reference: {reference}")

    # 임베딩 생성
    print(f"\n  ⚙️  임베딩 생성 중...")
    embeddings = create_embeddings(chunks)
    print(f"  📊 임베딩 생성 완료: {len(embeddings)}개")

    # Pinecone에 저장
    print(f"  ⚙️  Pinecone에 저장 중...")
    vectors = []
    pmcid = metadata['pmcid']

    for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        vector_id = f"frontvet_{pmcid}_c{i}"

        vector_metadata = {
            "text": chunk,
            "source": "frontiers_veterinary",
            "pmcid": metadata['pmcid'],
            "pmid": metadata['pmid'],
            "doi": metadata['doi'],
            "title": metadata['title'],
            "authors": metadata['authors'],
            "journal": metadata['journal'],
            "year": metadata['year'],
            "reference": reference,
            "chunk_index": i,
            "filename": metadata['filename']
        }

        vectors.append({
            "id": vector_id,
            "values": embedding,
            "metadata": vector_metadata
        })

    # 배치로 업로드
    batch_size = 100
    for i in range(0, len(vectors), batch_size):
        batch = vectors[i:i + batch_size]
        index.upsert(vectors=batch)
        print(f"  💾 Pinecone 저장: {i+1}-{min(i+batch_size, len(vectors))}/{len(vectors)}")

    print(f"  ✅ 완료! {len(chunks)}개 청크 저장")

    return len(chunks)


def process_all_xmls(xml_dir: Path, start_from: int = 0):
    """모든 XML 파일 처리"""
    xml_files = sorted(list(xml_dir.glob("*.xml")))

    print("="*60)
    print(f"Frontiers in Veterinary Science XML 처리 시작")
    print("="*60)
    print(f"총 XML 파일: {len(xml_files)}개")
    print(f"처리 시작 위치: {start_from}")
    print("="*60)

    total_chunks = 0
    processed_count = 0
    failed_count = 0

    # 이미 처리된 파일 목록 로드
    progress_file = Path("frontvet_processing_progress.json")
    processed_files = set()
    if progress_file.exists():
        with open(progress_file, 'r') as f:
            data = json.load(f)
            processed_files = set(data.get('processed_files', []))

    for idx, xml_path in enumerate(xml_files[start_from:], start=start_from):
        # 이미 처리된 파일은 스킵
        if xml_path.name in processed_files:
            print(f"\n⏭️  스킵: {xml_path.name} (이미 처리됨)")
            continue

        try:
            chunks_count = process_single_xml(xml_path)
            if chunks_count > 0:
                total_chunks += chunks_count
                processed_count += 1
                processed_files.add(xml_path.name)

                # 진행상황 저장 (10개마다)
                if processed_count % 10 == 0:
                    with open(progress_file, 'w') as f:
                        json.dump({
                            'processed_files': list(processed_files),
                            'total_processed': processed_count,
                            'total_chunks': total_chunks
                        }, f)
            else:
                failed_count += 1

        except Exception as e:
            print(f"  ❌ 오류: {e}")
            failed_count += 1
            continue

        # 진행상황 출력 (50개마다)
        if (idx + 1) % 50 == 0:
            print(f"\n{'='*60}")
            print(f"진행상황: {processed_count}/{len(xml_files)} 완료")
            print(f"총 청크: {total_chunks:,}개")
            print(f"실패: {failed_count}개")
            print(f"{'='*60}\n")

    # 최종 진행상황 저장
    with open(progress_file, 'w') as f:
        json.dump({
            'processed_files': list(processed_files),
            'total_processed': processed_count,
            'total_chunks': total_chunks
        }, f)

    print(f"\n{'='*60}")
    print(f"✅ 처리 완료!")
    print(f"{'='*60}")
    print(f"  - 처리된 파일: {processed_count}개")
    print(f"  - 실패: {failed_count}개")
    print(f"  - 총 청크: {total_chunks:,}개")
    print(f"{'='*60}")


if __name__ == "__main__":
    xml_dir = Path("guidelines/xml_frontvet")
    process_all_xmls(xml_dir, start_from=0)
