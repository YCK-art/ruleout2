#!/usr/bin/env python3
"""
Pinecone 인덱스의 모든 벡터 데이터 삭제 스크립트
"""

import os
from pathlib import Path
from pinecone import Pinecone
from dotenv import load_dotenv

# 환경 변수 로드
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = "medical-guidelines-kr"

if not PINECONE_API_KEY or PINECONE_API_KEY == "your_pinecone_api_key_here":
    print("❌ PINECONE_API_KEY가 설정되지 않았습니다.")
    exit(1)

print("=" * 70)
print("🗑️  Pinecone 인덱스 데이터 삭제")
print("=" * 70)

# Pinecone 초기화
pc = Pinecone(api_key=PINECONE_API_KEY)

# 인덱스 존재 확인
existing_indexes = [index['name'] for index in pc.list_indexes()]

if INDEX_NAME not in existing_indexes:
    print(f"❌ 인덱스 '{INDEX_NAME}'를 찾을 수 없습니다.")
    exit(1)

# 인덱스 연결
index = pc.Index(INDEX_NAME)

# 인덱스 통계 확인
stats = index.describe_index_stats()
total_vectors = stats.get('total_vector_count', 0)

print(f"\n📊 현재 인덱스 상태:")
print(f"   - 인덱스명: {INDEX_NAME}")
print(f"   - 총 벡터 수: {total_vectors:,}개")

if total_vectors == 0:
    print("\n✅ 이미 비어있는 인덱스입니다.")
    exit(0)

# 모든 벡터 자동 삭제
print(f"\n🗑️  {total_vectors:,}개의 벡터 삭제 중...")
index.delete(delete_all=True)

print("\n✅ 삭제 완료!")

# 삭제 후 통계 확인
import time
time.sleep(2)  # 삭제 반영 대기
stats = index.describe_index_stats()
remaining_vectors = stats.get('total_vector_count', 0)

print(f"\n📊 삭제 후 인덱스 상태:")
print(f"   - 남은 벡터 수: {remaining_vectors:,}개")
print("=" * 70)
