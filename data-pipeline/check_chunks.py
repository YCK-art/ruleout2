from dotenv import load_dotenv
import os
from pinecone import Pinecone
import tiktoken

load_dotenv()

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("medical-guidelines")

# Stats
stats = index.describe_index_stats()
print(f"Total vectors: {stats.total_vector_count}")
print("")

# Query 샘플
dummy_vector = [0.1] * 1536
results = index.query(vector=dummy_vector, top_k=5, include_metadata=True)

print("Sample chunks from Pinecone:")
print("=" * 80)

encoding = tiktoken.encoding_for_model('gpt-4o-mini')

for i, match in enumerate(results.matches, 1):
    metadata = match.metadata
    text = metadata.get('text', '')
    
    print(f"\nChunk {i}:")
    print(f"  Source: {metadata.get('source', 'N/A')}")
    print(f"  Title: {metadata.get('title', 'N/A')[:60]}...")
    print(f"  Text length: {len(text)} characters")
    
    token_count = len(encoding.encode(text))
    print(f"  Token count: {token_count} tokens")
    print(f"  Chars/token ratio: {len(text) / token_count:.2f}")
    print(f"  Preview: {text[:200]}...")
    print("-" * 80)
