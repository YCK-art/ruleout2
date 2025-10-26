#!/usr/bin/env python3
"""
의료 가이드라인 PDF 의미론적 청킹 파이프라인
제목 계층 구조를 유지하면서 의미 단위로 청킹하여 문맥 손실 최소화
"""

import os
import sys
import re
import hashlib
from pathlib import Path
from typing import List, Dict, Tuple
import warnings
import fitz  # PyMuPDF
from openai import OpenAI
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv
import time
from tqdm import tqdm

# 경고 무시
warnings.filterwarnings('ignore')

# 환경 변수 로드
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

# API 키 확인
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")

if not OPENAI_API_KEY or OPENAI_API_KEY == "your_openai_api_key_here":
    print("❌ OPENAI_API_KEY가 설정되지 않았습니다.")
    sys.exit(1)

if not PINECONE_API_KEY or PINECONE_API_KEY == "your_pinecone_api_key_here":
    print("❌ PINECONE_API_KEY가 설정되지 않았습니다.")
    sys.exit(1)

# OpenAI 클라이언트 초기화
openai_client = OpenAI(api_key=OPENAI_API_KEY)

# Pinecone 초기화
pc = Pinecone(api_key=PINECONE_API_KEY)
INDEX_NAME = "medical-guidelines-kr"

# 청킹 설정
MAX_CHUNK_SIZE = 1200  # 최대 토큰 수
OVERLAP_SIZE = 150  # 오버랩 문자 수


def clean_text(text: str) -> str:
    """
    PDF에서 추출한 텍스트 정제
    """
    if not text:
        return ""

    # 1. 과도한 공백 제거
    text = re.sub(r' +', ' ', text)

    # 2. 빈 줄 정리 (3개 이상 연속된 줄바꿈을 2개로)
    text = re.sub(r'\n{3,}', '\n\n', text)

    # 3. 특수문자 정리
    text = text.replace('\x00', '')  # null 문자
    text = text.replace('\uf0b7', '•')  # 깨진 불릿
    text = text.replace('\u2022', '•')  # 불릿

    # 4. 탭을 공백으로
    text = text.replace('\t', ' ')

    # 5. 양쪽 공백 제거
    text = text.strip()

    return text


def estimate_tokens(text: str) -> int:
    """
    텍스트의 대략적인 토큰 수 추정
    한글: 1.5 글자당 1토큰, 영어: 4 글자당 1토큰
    """
    korean_chars = len(re.findall(r'[가-힣]', text))
    other_chars = len(text) - korean_chars

    estimated_tokens = (korean_chars / 1.5) + (other_chars / 4)
    return int(estimated_tokens)


def is_heading(text: str, font_size: float, is_bold: bool, base_font_size: float = 8.0) -> Tuple[bool, int]:
    """
    텍스트가 제목인지 판단하고 레벨 반환
    """
    text = text.strip()

    # 빈 텍스트나 너무 긴 텍스트는 제목이 아님
    if not text or len(text) > 200:
        return False, 0

    # 참고문헌 항목은 제외
    if re.match(r'^\d+\.\s+[A-Z][a-z]', text):  # "1. Author A, et al."
        return False, 0

    # 제목 패턴 매칭
    patterns = [
        (r'^제\s*\d+\s*[장절]', 1),  # 제1장, 제2절
        (r'^[IVX]+\.\s+', 1),  # I., II., III.
        (r'^\d+\.\s+[가-힣A-Z]', 2),  # 1. 서론
        (r'^\d+\.\d+\s+', 3),  # 1.1
        (r'^\d+\.\d+\.\d+\s+', 4),  # 1.1.1
        (r'^[A-Z]\d+\.\s+', 2),  # A1.
    ]

    for pattern, level in patterns:
        if re.match(pattern, text):
            return True, level

    # 폰트 크기 기반 판단
    if font_size > base_font_size + 3:
        return True, 1
    elif font_size > base_font_size + 1.5:
        return True, 2
    elif font_size > base_font_size + 0.5:
        return True, 3

    # 볼드이고 짧은 텍스트
    if is_bold and len(text) < 100:
        return True, 3

    return False, 0


def extract_structured_content(pdf_path: str) -> List[Dict]:
    """
    PDF에서 구조화된 콘텐츠 추출
    """
    doc = fitz.open(pdf_path)
    structured_content = []
    current_section = None
    base_font_size = 8.0

    print(f"   📄 총 {len(doc)}페이지 처리 중...")

    for page_num in tqdm(range(len(doc)), desc="   페이지 추출"):
        page = doc[page_num]
        blocks = page.get_text("dict")["blocks"]

        for block in blocks:
            if block.get("type") == 0:  # 텍스트 블록
                for line in block.get("lines", []):
                    line_text = ""
                    max_font_size = 0
                    is_bold = False

                    for span in line.get("spans", []):
                        line_text += span.get("text", "")
                        font_size = span.get("size", 0)
                        max_font_size = max(max_font_size, font_size)

                        font_name = span.get("font", "").lower()
                        if "bold" in font_name or "black" in font_name:
                            is_bold = True

                    line_text = clean_text(line_text)

                    if not line_text:
                        continue

                    # 제목 판단
                    is_title, level = is_heading(line_text, max_font_size, is_bold, base_font_size)

                    if is_title and level <= 3:  # Level 1~3만 섹션 구분자로 사용
                        # 이전 섹션 저장
                        if current_section and current_section["content"].strip():
                            structured_content.append(current_section)

                        # 새 섹션 시작
                        current_section = {
                            "heading": line_text,
                            "level": level,
                            "page": page_num + 1,
                            "content": "",
                            "font_size": max_font_size
                        }
                    else:
                        # 본문 추가
                        if current_section:
                            current_section["content"] += line_text + "\n"
                        else:
                            # 제목 없이 시작하는 경우 (서문 등)
                            current_section = {
                                "heading": "서문",
                                "level": 1,
                                "page": page_num + 1,
                                "content": line_text + "\n",
                                "font_size": base_font_size
                            }

    # 마지막 섹션 저장
    if current_section and current_section["content"].strip():
        structured_content.append(current_section)

    doc.close()

    print(f"   ✅ {len(structured_content)}개 섹션 추출 완료")

    return structured_content


def create_semantic_chunks(structured_content: List[Dict], source: str, title: str, year: str) -> List[Dict]:
    """
    구조화된 콘텐츠를 의미론적 청크로 변환
    """
    chunks = []

    print(f"   🔧 의미론적 청킹 중...")

    for idx, section in enumerate(tqdm(structured_content, desc="   청크 생성")):
        heading = section["heading"]
        content = clean_text(section["content"])
        page = section["page"]
        level = section["level"]

        if not content:
            continue

        # 상위 컨텍스트 구성 (이전 섹션의 제목들)
        context_headings = []
        for i in range(max(0, idx - 3), idx):
            if structured_content[i]["level"] < level:
                context_headings.append(structured_content[i]["heading"])

        context = " > ".join(context_headings[-2:]) if context_headings else ""

        # 섹션 전체 텍스트
        full_text = f"{heading}\n\n{content}"
        tokens = estimate_tokens(full_text)

        # 청크 크기가 적당하면 그대로 사용
        if tokens <= MAX_CHUNK_SIZE:
            chunk_id = hashlib.md5(f"{source}_{title}_{year}_{heading}_{page}".encode('utf-8')).hexdigest()

            chunks.append({
                "id": chunk_id,
                "text": full_text,
                "metadata": {
                    "source": source,
                    "title": title,
                    "year": year,
                    "section": heading,
                    "context": context,
                    "page": page,
                    "level": level,
                    "tokens": tokens,
                    "original_id": f"{source}_{title}_{year}_{heading}_p{page}"
                }
            })
        else:
            # 너무 긴 경우 문단 단위로 분할
            paragraphs = re.split(r'\n\n+', content)
            current_chunk_text = f"{heading}\n\n"
            current_tokens = estimate_tokens(heading)
            sub_chunk_idx = 1

            for para in paragraphs:
                para = para.strip()
                if not para:
                    continue

                para_tokens = estimate_tokens(para)

                if current_tokens + para_tokens <= MAX_CHUNK_SIZE:
                    current_chunk_text += para + "\n\n"
                    current_tokens += para_tokens
                else:
                    # 현재 청크 저장
                    if current_chunk_text.strip() != heading:
                        chunk_id = hashlib.md5(
                            f"{source}_{title}_{year}_{heading}_{page}_sub{sub_chunk_idx}".encode('utf-8')
                        ).hexdigest()

                        chunks.append({
                            "id": chunk_id,
                            "text": current_chunk_text.strip(),
                            "metadata": {
                                "source": source,
                                "title": title,
                                "year": year,
                                "section": heading,
                                "context": context,
                                "page": page,
                                "level": level,
                                "sub_chunk": sub_chunk_idx,
                                "tokens": current_tokens,
                                "original_id": f"{source}_{title}_{year}_{heading}_p{page}_sub{sub_chunk_idx}"
                            }
                        })

                        sub_chunk_idx += 1

                    # 새 청크 시작 (오버랩 포함)
                    overlap_text = current_chunk_text[-OVERLAP_SIZE:] if len(current_chunk_text) > OVERLAP_SIZE else ""
                    current_chunk_text = f"{heading}\n\n{overlap_text}{para}\n\n"
                    current_tokens = estimate_tokens(current_chunk_text)

            # 마지막 청크 저장
            if current_chunk_text.strip() != heading:
                chunk_id = hashlib.md5(
                    f"{source}_{title}_{year}_{heading}_{page}_sub{sub_chunk_idx}".encode('utf-8')
                ).hexdigest()

                chunks.append({
                    "id": chunk_id,
                    "text": current_chunk_text.strip(),
                    "metadata": {
                        "source": source,
                        "title": title,
                        "year": year,
                        "section": heading,
                        "context": context,
                        "page": page,
                        "level": level,
                        "sub_chunk": sub_chunk_idx,
                        "tokens": current_tokens,
                        "original_id": f"{source}_{title}_{year}_{heading}_p{page}_sub{sub_chunk_idx}"
                    }
                })

    print(f"   ✅ {len(chunks)}개 청크 생성 완료")

    return chunks


def get_embedding(text: str) -> List[float]:
    """
    OpenAI API로 텍스트 임베딩 생성
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
    Pinecone 인덱스 초기화
    """
    try:
        existing_indexes = [index['name'] for index in pc.list_indexes()]

        if INDEX_NAME not in existing_indexes:
            print(f"🔧 Pinecone 인덱스 '{INDEX_NAME}' 생성 중...")
            pc.create_index(
                name=INDEX_NAME,
                dimension=1536,
                metric="cosine",
                spec=ServerlessSpec(
                    cloud="aws",
                    region="us-east-1"
                )
            )
            print(f"✅ 인덱스 '{INDEX_NAME}' 생성 완료")
            time.sleep(5)
        else:
            print(f"✅ 기존 인덱스 '{INDEX_NAME}' 사용")

        return pc.Index(INDEX_NAME)

    except Exception as e:
        print(f"❌ Pinecone 인덱스 초기화 오류: {e}")
        return None


def upsert_to_pinecone(index, chunks: List[Dict], batch_size: int = 100):
    """
    청크를 Pinecone에 업로드
    """
    total_chunks = len(chunks)
    print(f"   🚀 {total_chunks}개 청크를 Pinecone에 업로드 중...")

    for i in tqdm(range(0, total_chunks, batch_size), desc="   업로드"):
        batch = chunks[i:i + batch_size]
        vectors = []

        for chunk in batch:
            embedding = get_embedding(chunk["text"])

            if embedding:
                vector_data = {
                    "id": chunk["id"],
                    "values": embedding,
                    "metadata": {
                        **chunk["metadata"],
                        "text": chunk["text"][:1000]  # Pinecone 메타데이터 크기 제한
                    }
                }
                vectors.append(vector_data)

        if vectors:
            try:
                index.upsert(vectors=vectors)
            except Exception as e:
                print(f"❌ 업로드 오류 (batch {i//batch_size + 1}): {e}")

        time.sleep(0.5)

    print(f"   ✅ 업로드 완료!")


def parse_filename(filename: str) -> Tuple[str, str, str]:
    """
    파일명에서 학회명, 가이드라인명, 년도 추출
    """
    name_without_ext = filename.replace('.pdf', '')
    parts = [part.strip() for part in name_without_ext.split(',')]

    if len(parts) != 3:
        return ("알 수 없음", "알 수 없음", "알 수 없음")

    return tuple(parts)


def process_pdf_file(pdf_path: Path, index) -> Dict:
    """
    단일 PDF 파일 처리
    """
    filename = pdf_path.name
    print(f"\n📚 처리 중: {filename}")

    # 파일명에서 메타데이터 추출
    source, title, year = parse_filename(filename)
    print(f"   학회: {source}")
    print(f"   가이드라인: {title}")
    print(f"   년도: {year}")

    # 1. 구조화된 콘텐츠 추출
    structured_content = extract_structured_content(str(pdf_path))

    # 2. 의미론적 청킹
    chunks = create_semantic_chunks(structured_content, source, title, year)

    # 3. Pinecone에 업로드
    upsert_to_pinecone(index, chunks)

    print(f"   ✅ {filename} 처리 완료!")

    return {
        "filename": filename,
        "sections": len(structured_content),
        "chunks": len(chunks)
    }


def main():
    """
    메인 실행 함수
    """
    print("=" * 80)
    print("🏥 의료 가이드라인 PDF 의미론적 청킹 파이프라인")
    print("=" * 80)

    # guidelines 폴더 경로
    guidelines_dir = Path(__file__).parent / "guidelines"

    if not guidelines_dir.exists():
        print(f"❌ guidelines 폴더를 찾을 수 없습니다: {guidelines_dir}")
        sys.exit(1)

    # PDF 파일 목록
    pdf_files = list(guidelines_dir.glob("*.pdf"))

    if not pdf_files:
        print(f"❌ PDF 파일이 없습니다: {guidelines_dir}")
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
            import traceback
            traceback.print_exc()
            stats.append({"filename": pdf_file.name, "sections": 0, "chunks": 0})

    # 최종 통계
    print("\n" + "=" * 80)
    print("📊 처리 완료 통계")
    print("=" * 80)

    total_sections = 0
    total_chunks = 0

    for stat in stats:
        print(f"\n파일: {stat['filename']}")
        print(f"  - 섹션 수: {stat['sections']}")
        print(f"  - 청크 수: {stat['chunks']}")

        total_sections += stat['sections']
        total_chunks += stat['chunks']

    print("\n" + "=" * 80)
    print(f"✅ 전체 완료!")
    print(f"   총 파일 수: {len(stats)}")
    print(f"   총 섹션 수: {total_sections}")
    print(f"   총 청크 수: {total_chunks}")
    print(f"   Pinecone 인덱스: {INDEX_NAME}")
    print("=" * 80)


if __name__ == "__main__":
    main()
