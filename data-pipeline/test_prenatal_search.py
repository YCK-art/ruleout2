"""
Effects of Prenatal Testosterone Excess 검색 테스트
"""
from pinecone import Pinecone
from openai import OpenAI
import os
from pathlib import Path
from dotenv import load_dotenv

# 환경 변수 로드
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("medical-guidelines")

# 쿼리 생성
query = "Effects of Prenatal Testosterone Excess"
print(f"🔍 Query: {query}\n")

response = client.embeddings.create(
    model="text-embedding-3-small",
    input=[query]
)
query_embedding = response.data[0].embedding

# Pinecone 검색
results = index.query(
    vector=query_embedding,
    top_k=15,
    include_metadata=True
)

print(f"📊 검색 결과 ({len(results['matches'])}개):\n")
print("="*100)

for i, match in enumerate(results['matches'], 1):
    score = match['score']
    metadata = match['metadata']

    print(f"\n[결과 {i}] 유사도: {score:.4f}")
    print(f"  📄 Title: {metadata.get('title', 'Unknown')}")
    print(f"  📅 Year: {metadata.get('year', 'Unknown')}")
    print(f"  📖 Page: {metadata.get('page', 'Unknown')}")
    print(f"  👥 Authors: {metadata.get('authors', 'Unknown')[:80]}")
    print(f"  📝 Text preview: {metadata.get('text', '')[:250]}...")
    print("-"*100)

# 특정 논문에서만 검색
print("\n\n" + "="*100)
print("🎯 'Prenatal Steroids' 논문에서만 검색:")
print("="*100)

filtered_results = index.query(
    vector=query_embedding,
    top_k=10,
    include_metadata=True,
    filter={
        "title": {"$eq": "Prenatal Steroids and Metabolic Dysfunction: Lessons from Sheep"}
    }
)

print(f"\n📊 필터링된 결과 ({len(filtered_results['matches'])}개):\n")

for i, match in enumerate(filtered_results['matches'], 1):
    score = match['score']
    metadata = match['metadata']

    print(f"\n[결과 {i}] 유사도: {score:.4f}")
    print(f"  📖 Page: {metadata.get('page', 'Unknown')}")
    print(f"  📝 Text: {metadata.get('text', '')[:400]}...")
    print("-"*100)
