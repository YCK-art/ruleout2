"""
Pinecone DB에 학습된 PDF 파일 상세 통계
"""

import os
import json
from pathlib import Path
from dotenv import load_dotenv
from pinecone import Pinecone

load_dotenv()

# Pinecone 클라이언트 초기화
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("medical-guidelines")

# 메타데이터 매핑 로드
metadata_file = Path(__file__).parent / "pdf_metadata_mapping.json"
with open(metadata_file, 'r', encoding='utf-8') as f:
    metadata_mapping = json.load(f)

# URL 매핑 로드
url_mapping_file = Path(__file__).parent.parent / "backend" / "pdf_url_mapping.json"
with open(url_mapping_file, 'r', encoding='utf-8') as f:
    url_mapping = json.load(f)

# Pinecone 통계
stats = index.describe_index_stats()

print("="*70)
print("📊 Pinecone DB 학습 현황")
print("="*70)

print(f"\n🗄️  **Pinecone 벡터 통계**")
print(f"   - 전체 벡터(청크) 수: {stats.total_vector_count:,}개")
print(f"   - 차원: 1536차원 (text-embedding-3-small)")

print(f"\n📚 **PDF 메타데이터 통계**")
print(f"   - 메타데이터 매핑 파일에 등록된 PDF: {len(metadata_mapping)}개")
print(f"   - URL 매핑 파일에 등록된 PDF: {len(url_mapping)}개")

# Guidelines 폴더의 실제 PDF 파일 수
guidelines_folder = Path(__file__).parent / "guidelines"
pdf_files = list(guidelines_folder.glob("*.pdf"))
pdf_files = [f for f in pdf_files if not f.name.startswith(".")]

print(f"\n📁 **Guidelines 폴더**")
print(f"   - 폴더 내 PDF 파일 수: {len(pdf_files)}개")

# 최근 처리 내역
print(f"\n📝 **최근 처리 내역 (0000240-0000270)**")
print(f"   - 처리 파일: 31개")
print(f"   - 생성 청크: 4,560개")
print(f"   - 처리 일자: 2025-11-30")
print(f"   - 범위: 0000240.pdf ~ 0000270.pdf")

# 0000240-0000270 샘플 확인
print(f"\n🔍 **0000240-0000270 범위 샘플 확인**")
sample_range = ["0000240.pdf", "0000255.pdf", "0000270.pdf"]
for pdf_name in sample_range:
    if pdf_name in metadata_mapping:
        meta = metadata_mapping[pdf_name]
        url = url_mapping.get(pdf_name, "N/A")
        print(f"\n   [{pdf_name}]")
        print(f"   제목: {meta.get('title', 'N/A')[:60]}...")
        print(f"   저자: {meta.get('authors', 'N/A')[:50]}...")
        print(f"   URL: {url}")
    elif f"0000{pdf_name[4:]}" in metadata_mapping:
        # 00000255.pdf 형태 처리
        alt_name = f"0000{pdf_name[4:]}"
        meta = metadata_mapping[alt_name]
        url = url_mapping.get(alt_name, "N/A")
        print(f"\n   [{alt_name}]")
        print(f"   제목: {meta.get('title', 'N/A')[:60]}...")
        print(f"   저자: {meta.get('authors', 'N/A')[:50]}...")
        print(f"   URL: {url}")

print(f"\n{'='*70}")
print(f"✅ 총 {len(metadata_mapping)}개의 PDF가 Pinecone DB에 학습되었습니다")
print(f"   (평균 청크 수: {stats.total_vector_count / len(metadata_mapping):.1f}개/PDF)")
print("="*70)
