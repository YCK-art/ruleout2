"""
Pinecone 인덱스 생성
"""

import os
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv

load_dotenv()

def create_index():
    """Pinecone 인덱스 생성"""

    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
    index_name = "medical-guidelines"

    # 기존 인덱스 목록 확인
    existing_indexes = pc.list_indexes().names()
    print(f"📋 기존 인덱스: {existing_indexes}")

    if index_name in existing_indexes:
        print(f"✅ '{index_name}' 인덱스가 이미 존재합니다.")

        # 인덱스 통계 확인
        index = pc.Index(index_name)
        stats = index.describe_index_stats()
        print(f"📊 벡터 수: {stats.get('total_vector_count', 0):,}개")

        return

    print(f"\n🔨 '{index_name}' 인덱스 생성 중...")

    # 인덱스 생성 (OpenAI text-embedding-3-small: 1536 차원)
    pc.create_index(
        name=index_name,
        dimension=1536,
        metric="cosine",
        spec=ServerlessSpec(
            cloud="aws",
            region="us-east-1"
        )
    )

    print(f"✅ '{index_name}' 인덱스 생성 완료!")

if __name__ == "__main__":
    print("=" * 60)
    print("🔧 Pinecone 인덱스 설정")
    print("=" * 60)
    create_index()
    print("=" * 60)
