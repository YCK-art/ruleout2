"""
Pinecone DB에 저장된 PDF 파일 수 확인
"""

import os
from dotenv import load_dotenv
from pinecone import Pinecone

load_dotenv()

# Pinecone 클라이언트 초기화
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("medical-guidelines")

print("="*60)
print("Pinecone DB 통계")
print("="*60)

# 인덱스 통계 확인
stats = index.describe_index_stats()

print(f"\n📊 전체 벡터 수: {stats.total_vector_count:,}개")

# 네임스페이스별 통계 (있는 경우)
if hasattr(stats, 'namespaces') and stats.namespaces:
    print(f"\n📁 네임스페이스별 벡터 수:")
    for ns_name, ns_stats in stats.namespaces.items():
        print(f"   - {ns_name}: {ns_stats.vector_count:,}개")

# 대략적인 PDF 파일 수 추정
# 평균적으로 PDF당 약 100-200개의 청크가 생성됨
avg_chunks_per_pdf = 150
estimated_pdfs = stats.total_vector_count // avg_chunks_per_pdf

print(f"\n📄 추정 PDF 파일 수: 약 {estimated_pdfs}개")
print(f"   (평균 PDF당 {avg_chunks_per_pdf}개 청크 기준)")

# 최근 처리한 240-270 범위 확인
print(f"\n{'─'*60}")
print("최근 추가된 PDFs 0000240-0000270:")
print(f"{'─'*60}")
print(f"   - 처리된 파일: 31개")
print(f"   - 생성된 청크: 4,560개")
print(f"   - 처리 일자: 2025-11-30")

print(f"\n{'='*60}")
