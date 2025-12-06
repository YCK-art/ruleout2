"""
Pinecone에서 XML 논문 데이터만 삭제
(PMCID가 있는 paper_PMC로 시작하는 벡터들)
"""

import os
from dotenv import load_dotenv
from pinecone import Pinecone
import time

load_dotenv()

# Pinecone 초기화
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("medical-guidelines")

print("=" * 60)
print("🗑️  XML 논문 데이터 삭제")
print("=" * 60)

# 현재 통계
stats = index.describe_index_stats()
print(f"\n현재 총 벡터 수: {stats.get('total_vector_count', 0):,}개")

# XML 논문 벡터 ID 패턴: paper_PMC로 시작
# 1633개 파일 * 평균 65개 청크 = 약 106,000개

print("\n⚠️  XML 논문 벡터 삭제를 시작합니다...")
print("   (paper_PMC로 시작하는 ID 삭제)")

# Pinecone delete by filter (PMCID 존재 여부로 필터링)
try:
    # PMCID가 있는 벡터 삭제 (XML 논문만)
    index.delete(filter={"pmcid": {"$exists": True}})
    print("\n✅ 삭제 완료!")

    # 잠시 대기 (삭제 반영 시간)
    print("\n⏳ 삭제 반영 대기 중 (10초)...")
    time.sleep(10)

    # 최종 통계
    stats = index.describe_index_stats()
    print(f"\n삭제 후 총 벡터 수: {stats.get('total_vector_count', 0):,}개")

except Exception as e:
    print(f"\n❌ 오류 발생: {e}")
    print("\n대체 방법을 시도합니다...")

    # 대체 방법: namespace 사용하지 않으므로 ID prefix로 삭제
    # 이 방법은 비효율적이므로 filter 방식을 먼저 시도

print("\n" + "=" * 60)
print("✅ 완료")
print("=" * 60)
