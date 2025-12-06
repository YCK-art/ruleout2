"""
Pinecone에 업로드된 XML 논문 데이터 검증
"""

import os
from dotenv import load_dotenv
from pinecone import Pinecone

load_dotenv()

# Pinecone 초기화
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("medical-guidelines")

# 인덱스 통계
print("=" * 60)
print("📊 Pinecone 인덱스 통계")
print("=" * 60)

stats = index.describe_index_stats()
print(f"총 벡터 수: {stats.get('total_vector_count', 0):,}개")
print()

# XML 논문 샘플 조회 (Open Veterinary Journal)
print("=" * 60)
print("🔍 XML 논문 샘플 조회 (최근 업로드된 데이터)")
print("=" * 60)

# PMC로 시작하는 ID 검색
try:
    # 최근 업로드된 XML 데이터 샘플 조회
    query_result = index.query(
        vector=[0.0] * 1536,  # 더미 벡터
        top_k=5,
        include_metadata=True,
        filter={"pmcid": {"$exists": True}}  # PMCID가 있는 것만 (XML 논문)
    )

    print(f"\n찾은 벡터 수: {len(query_result['matches'])}\n")

    for i, match in enumerate(query_result['matches'], 1):
        metadata = match.get('metadata', {})
        print(f"[샘플 {i}]")
        print(f"  ID: {match['id']}")
        print(f"  제목: {metadata.get('title', 'N/A')[:80]}...")
        print(f"  저자: {metadata.get('authors', 'N/A')}")
        print(f"  저널: {metadata.get('journal', 'N/A')}")
        print(f"  연도: {metadata.get('year', 'N/A')}")
        print(f"  DOI: {metadata.get('doi', 'N/A')}")
        print(f"  PMCID: {metadata.get('pmcid', 'N/A')}")
        print(f"  PMID: {metadata.get('pmid', 'N/A')}")
        print(f"  Reference: {metadata.get('reference_format', 'N/A')[:80]}...")
        print(f"  텍스트 길이: {len(metadata.get('text', ''))}자")
        print(f"  텍스트 샘플: {metadata.get('text', '')[:150]}...")
        print()

except Exception as e:
    print(f"❌ 쿼리 오류: {e}")
    print("\n대체 방법: fetch()로 특정 ID 조회")

    # 특정 ID로 직접 조회 (테스트에서 사용한 ID)
    try:
        fetch_result = index.fetch(ids=["paper_PMC12451179_c0"])
        if fetch_result['vectors']:
            for vec_id, vec_data in fetch_result['vectors'].items():
                metadata = vec_data.get('metadata', {})
                print(f"\n[직접 조회 결과]")
                print(f"  ID: {vec_id}")
                print(f"  제목: {metadata.get('title', 'N/A')[:80]}...")
                print(f"  저자: {metadata.get('authors', 'N/A')}")
                print(f"  저널: {metadata.get('journal', 'N/A')}")
                print(f"  연도: {metadata.get('year', 'N/A')}")
                print(f"  DOI: {metadata.get('doi', 'N/A')}")
                print(f"  PMCID: {metadata.get('pmcid', 'N/A')}")
                print(f"  Reference: {metadata.get('reference_format', 'N/A')}")
                print(f"  텍스트 샘플: {metadata.get('text', '')[:200]}...")
    except Exception as e2:
        print(f"❌ Fetch 오류: {e2}")

print("\n" + "=" * 60)
print("✅ 검증 완료")
print("=" * 60)
