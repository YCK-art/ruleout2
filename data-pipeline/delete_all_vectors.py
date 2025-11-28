"""
Pinecone 인덱스의 모든 벡터 삭제
"""
import os
from dotenv import load_dotenv
from pinecone import Pinecone

load_dotenv()

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("medical-guidelines")

# 모든 벡터 삭제
print("⚠️  모든 벡터를 삭제합니다...")
index.delete(delete_all=True)

print("✅ 모든 벡터 삭제 완료!")

# 확인
stats = index.describe_index_stats()
print(f"현재 벡터 수: {stats['total_vector_count']}")
