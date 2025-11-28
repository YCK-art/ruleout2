"""
Pinecone 저장 확인
"""

import os
from pinecone import Pinecone
from dotenv import load_dotenv

load_dotenv()

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("medical-guidelines")

# 인덱스 통계 확인
stats = index.describe_index_stats()

print("=" * 60)
print("📊 Pinecone 인덱스 상태")
print("=" * 60)
print(f"총 벡터 수: {stats.get('total_vector_count', 0):,}개")
print(f"차원: {stats.get('dimension', 0)}")

# 샘플 벡터 쿼리
print("\n" + "=" * 60)
print("🔍 샘플 벡터 조회 (처음 3개)")
print("=" * 60)

# 간단한 쿼리로 벡터 가져오기
query_result = index.query(
    vector=[0.0] * 1536,  # 더미 벡터
    top_k=3,
    include_metadata=True
)

for i, match in enumerate(query_result['matches']):
    print(f"\n[벡터 {i+1}]")
    print(f"ID: {match['id']}")
    print(f"메타데이터:")
    for key, value in match['metadata'].items():
        if key == 'text':
            print(f"  - {key}: {value[:100]}...")
        else:
            print(f"  - {key}: {value}")

print("\n✅ 검증 완료!")
