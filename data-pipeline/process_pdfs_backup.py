#!/usr/bin/env python3
"""
한국 의학회 진료지침서 PDF를 벡터 DB로 변환하는 스크립트
"""

import os
import sys
from pathlib import Path
from typing import List, Dict, Tuple
import warnings
import hashlib
import pdfplumber
from langchain_text_splitters import RecursiveCharacterTextSplitter
from openai import OpenAI
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv
import time

# PDF 경고 무시
warnings.filterwarnings('ignore')

# 환경 변수 로드
# 스크립트 파일과 같은 디렉토리의 .env 파일 로드
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

# API 키 확인
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")

if not OPENAI_API_KEY or OPENAI_API_KEY == "your_openai_api_key_here":
    print("❌ OPENAI_API_KEY가 설정되지 않았습니다. .env 파일을 확인해주세요.")
    sys.exit(1)

if not PINECONE_API_KEY or PINECONE_API_KEY == "your_pinecone_api_key_here":
    print("❌ PINECONE_API_KEY가 설정되지 않았습니다. .env 파일을 확인해주세요.")
    sys.exit(1)

# OpenAI 클라이언트 초기화
openai_client = OpenAI(api_key=OPENAI_API_KEY)

# Pinecone 초기화
pc = Pinecone(api_key=PINECONE_API_KEY)
INDEX_NAME = "medical-guidelines-kr"

# 텍스트 분할기 설정 (500자 단위)
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,  # 문맥 유지를 위한 오버랩
    length_function=len,
    separators=["\n\n", "\n", ".", "!", "?", ",", " ", ""]
)


def parse_filename(filename: str) -> Tuple[str, str, str]:
    """
    파일명에서 학회명, 가이드라인명, 년도를 추출
    형식: '학회명, 가이드라인명, 년도.pdf'

    Args:
        filename: PDF 파일명

    Returns:
        (학회명, 가이드라인명, 년도) 튜플
    """
    # .pdf 확장자 제거
    name_without_ext = filename.replace('.pdf', '')

    # 쉼표로 분리
    parts = [part.strip() for part in name_without_ext.split(',')]

    if len(parts) != 3:
        print(f"⚠️  파일명 형식이 올바르지 않습니다: {filename}")
        print(f"   예상 형식: '학회명, 가이드라인명, 년도.pdf'")
        return ("알 수 없음", "알 수 없음", "알 수 없음")

    source, title, year = parts
    return (source, title, year)


def extract_text_from_pdf(pdf_path: str) -> List[Tuple[int, str]]:
    """
    PDF 파일에서 페이지별 텍스트 추출

    Args:
        pdf_path: PDF 파일 경로

    Returns:
        [(페이지번호, 텍스트내용)] 리스트
    """
    pages_text = []

    try:
        with pdfplumber.open(pdf_path) as pdf:
            total_pages = len(pdf.pages)
            print(f"   📄 총 {total_pages}페이지 처리 중...")

            for page_num, page in enumerate(pdf.pages, start=1):
                # 텍스트 추출
                text = page.extract_text()

                if text and text.strip():
                    pages_text.append((page_num, text.strip()))

                # 진행상황 표시 (5페이지마다)
                if page_num % 5 == 0:
                    print(f"      {page_num}/{total_pages} 페이지 처리됨", flush=True)

    except Exception as e:
        print(f"❌ PDF 읽기 오류: {e}")
        return []

    return pages_text


def create_chunks_with_metadata(
    pages_text: List[Tuple[int, str]],
    source: str,
    title: str,
    year: str,
    base_filename: str
) -> List[Dict]:
    """
    페이지 텍스트를 청크로 분할하고 메타데이터 추가

    Args:
        pages_text: [(페이지번호, 텍스트)] 리스트
        source: 학회명
        title: 가이드라인명
        year: 년도
        base_filename: 기본 파일명 (확장자 제외)

    Returns:
        메타데이터가 포함된 청크 리스트
    """
    all_chunks = []

    for page_num, page_text in pages_text:
        # 페이지 텍스트를 청크로 분할
        chunks = text_splitter.split_text(page_text)

        # 각 청크에 메타데이터 추가
        for chunk_idx, chunk_text in enumerate(chunks, start=1):
            # 고유 ID 생성: 한글을 포함하여 해시로 변환 (ASCII 호환)
            # 원본 ID 형식: "{학회명}_{가이드라인명}_{년도}_p{페이지번호}_chunk{청크번호}"
            original_id = f"{source}_{title}_{year}_p{page_num}_chunk{chunk_idx}"
            # MD5 해시로 변환하여 ASCII 호환 ID 생성
            chunk_id = hashlib.md5(original_id.encode('utf-8')).hexdigest()

            chunk_data = {
                "id": chunk_id,
                "text": chunk_text,
                "metadata": {
                    "source": source,
                    "title": title,
                    "year": year,
                    "page": page_num,
                    "chunk_index": chunk_idx,
                    "original_id": original_id  # 원본 ID도 메타데이터에 저장
                }
            }

            all_chunks.append(chunk_data)

    return all_chunks


def get_embedding(text: str) -> List[float]:
    """
    OpenAI API를 사용하여 텍스트를 벡터로 변환

    Args:
        text: 임베딩할 텍스트

    Returns:
        임베딩 벡터 (1536차원)
    """
    try:
        response = openai_client.embeddings.create(
            model="text-embedding-ada-002",
            input=text
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"❌ 임베딩 생성 오류: {e}")
        return []


def initialize_pinecone_index():
    """
    Pinecone 인덱스 초기화 (없으면 생성)
    """
    try:
        # 기존 인덱스 목록 확인
        existing_indexes = [index['name'] for index in pc.list_indexes()]

        if INDEX_NAME not in existing_indexes:
            print(f"🔧 Pinecone 인덱스 '{INDEX_NAME}' 생성 중...")
            pc.create_index(
                name=INDEX_NAME,
                dimension=1536,  # text-embedding-ada-002 차원
                metric="cosine",
                spec=ServerlessSpec(
                    cloud="aws",
                    region="us-east-1"
                )
            )
            print(f"✅ 인덱스 '{INDEX_NAME}' 생성 완료")
            # 인덱스 준비 대기
            time.sleep(5)
        else:
            print(f"✅ 기존 인덱스 '{INDEX_NAME}' 사용")

        return pc.Index(INDEX_NAME)

    except Exception as e:
        print(f"❌ Pinecone 인덱스 초기화 오류: {e}")
        return None


def upsert_to_pinecone(index, chunks: List[Dict], batch_size: int = 100):
    """
    청크 데이터를 Pinecone에 업로드

    Args:
        index: Pinecone 인덱스 객체
        chunks: 청크 데이터 리스트
        batch_size: 배치 크기
    """
    total_chunks = len(chunks)
    print(f"   🚀 {total_chunks}개 청크를 Pinecone에 업로드 중...")

    for i in range(0, total_chunks, batch_size):
        batch = chunks[i:i + batch_size]
        vectors = []

        for chunk in batch:
            # 임베딩 생성
            embedding = get_embedding(chunk["text"])

            if embedding:
                # Pinecone 형식으로 변환
                vector_data = {
                    "id": chunk["id"],
                    "values": embedding,
                    "metadata": {
                        **chunk["metadata"],
                        "text": chunk["text"]  # 텍스트도 메타데이터에 포함
                    }
                }
                vectors.append(vector_data)

        # Pinecone에 업로드
        if vectors:
            try:
                index.upsert(vectors=vectors)
                print(f"      {min(i + batch_size, total_chunks)}/{total_chunks} 청크 업로드됨")
            except Exception as e:
                print(f"❌ 업로드 오류 (batch {i//batch_size + 1}): {e}")

        # API 속도 제한 방지
        time.sleep(0.5)


def process_pdf_file(pdf_path: Path, index) -> Dict:
    """
    단일 PDF 파일 처리

    Args:
        pdf_path: PDF 파일 경로
        index: Pinecone 인덱스

    Returns:
        처리 통계
    """
    filename = pdf_path.name
    print(f"\n📚 처리 중: {filename}")

    # 파일명에서 메타데이터 추출
    source, title, year = parse_filename(filename)
    print(f"   학회: {source}")
    print(f"   가이드라인: {title}")
    print(f"   년도: {year}")

    # PDF에서 텍스트 추출
    pages_text = extract_text_from_pdf(str(pdf_path))

    if not pages_text:
        print(f"⚠️  {filename}: 텍스트를 추출할 수 없습니다.")
        return {"filename": filename, "chunks": 0, "pages": 0}

    print(f"   ✅ {len(pages_text)}개 페이지에서 텍스트 추출 완료")

    # 청크 생성
    base_filename = filename.replace('.pdf', '')
    chunks = create_chunks_with_metadata(pages_text, source, title, year, base_filename)

    print(f"   ✅ {len(chunks)}개 청크 생성 완료")

    # Pinecone에 업로드
    upsert_to_pinecone(index, chunks)

    print(f"   ✅ {filename} 처리 완료!")

    return {
        "filename": filename,
        "chunks": len(chunks),
        "pages": len(pages_text)
    }


def main():
    """
    메인 실행 함수
    """
    print("=" * 70)
    print("🏥 한국 의학회 진료지침서 벡터 DB 변환 시작")
    print("=" * 70)

    # guidelines 폴더 경로
    guidelines_dir = Path(__file__).parent / "guidelines"

    if not guidelines_dir.exists():
        print(f"❌ guidelines 폴더를 찾을 수 없습니다: {guidelines_dir}")
        sys.exit(1)

    # PDF 파일 목록 가져오기
    pdf_files = list(guidelines_dir.glob("*.pdf"))

    if not pdf_files:
        print(f"❌ guidelines 폴더에 PDF 파일이 없습니다: {guidelines_dir}")
        sys.exit(1)

    print(f"\n📁 {len(pdf_files)}개의 PDF 파일 발견")

    # Pinecone 인덱스 초기화
    index = initialize_pinecone_index()

    if not index:
        print("❌ Pinecone 인덱스 초기화 실패")
        sys.exit(1)

    # 각 PDF 파일 처리
    stats = []

    for pdf_file in pdf_files:
        try:
            file_stats = process_pdf_file(pdf_file, index)
            stats.append(file_stats)
        except Exception as e:
            print(f"❌ {pdf_file.name} 처리 중 오류 발생: {e}")
            stats.append({"filename": pdf_file.name, "chunks": 0, "pages": 0})

    # 최종 통계 출력
    print("\n" + "=" * 70)
    print("📊 처리 완료 통계")
    print("=" * 70)

    total_chunks = 0
    total_pages = 0

    for stat in stats:
        print(f"\n파일: {stat['filename']}")
        print(f"  - 페이지 수: {stat['pages']}")
        print(f"  - 청크 수: {stat['chunks']}")

        total_chunks += stat['chunks']
        total_pages += stat['pages']

    print("\n" + "=" * 70)
    print(f"✅ 전체 완료!")
    print(f"   총 파일 수: {len(stats)}")
    print(f"   총 페이지 수: {total_pages}")
    print(f"   총 청크 수: {total_chunks}")
    print(f"   Pinecone 인덱스: {INDEX_NAME}")
    print("=" * 70)


if __name__ == "__main__":
    main()
