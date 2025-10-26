#!/usr/bin/env python3
"""
Pinecone 데이터 검증 스크립트
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from pinecone import Pinecone
from collections import Counter

# 환경 변수 로드
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = "medical-guidelines-kr"

if not PINECONE_API_KEY:
    print("❌ PINECONE_API_KEY가 설정되지 않았습니다.")
    sys.exit(1)

# Pinecone 초기화
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(INDEX_NAME)

print("=" * 80)
print("📊 Pinecone 데이터 검증")
print("=" * 80)

# 전체 통계
stats = index.describe_index_stats()
print(f"\n✅ 인덱스: {INDEX_NAME}")
print(f"   전체 벡터 수: {stats.total_vector_count:,}개")

# 샘플 데이터 조회 (각 가이드라인별로 검증)
guidelines = [
    ("대한대장항문학회", "대변실금 진료권고안", "2021"),
    ("대한대장항문학회", "우측 결장 게실염 진료권고안", "2021"),
    ("대한대장항문학회", "직장암 다학제 진료권고안", "2021"),
    ("대장암진료권고안위원회", "대장암진료권고안", "2012"),
    ("대한대장항문학회", "결장암 진료권고안", "2023"),  # 기존 파일
]

print(f"\n📚 가이드라인별 데이터 검증:")
print("-" * 80)

# 각 가이드라인의 청크 수를 확인하기 위해 쿼리
for source, title, year in guidelines:
    try:
        # 더미 벡터로 쿼리 (메타데이터 필터만 사용)
        results = index.query(
            vector=[0.0] * 1536,
            filter={
                "source": {"$eq": source},
                "title": {"$eq": title},
                "year": {"$eq": year}
            },
            top_k=1,
            include_metadata=True
        )

        # 참고: Pinecone은 필터링된 전체 개수를 직접 반환하지 않음
        # 샘플 메타데이터만 확인
        if results.matches:
            match = results.matches[0]
            metadata = match.metadata
            print(f"\n{source}")
            print(f"  가이드라인: {title}")
            print(f"  년도: {year}")
            print(f"  샘플 섹션: {metadata.get('section', 'N/A')[:60]}")
            print(f"  샘플 페이지: {metadata.get('page', 'N/A')}")
            print(f"  샘플 토큰: {metadata.get('tokens', 'N/A')}")
            print(f"  ✅ 데이터 존재 확인")
        else:
            print(f"\n{source} - {title} ({year})")
            print(f"  ⚠️  데이터를 찾을 수 없음")

    except Exception as e:
        print(f"\n❌ 오류 ({source} - {title}): {e}")

print("\n" + "=" * 80)
print("✅ 검증 완료!")
print("=" * 80)
