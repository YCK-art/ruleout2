from pinecone import Pinecone
import os

# Initialize Pinecone
pc = Pinecone(api_key='pcsk_2wJQ3m_tAv8Lt7uXbDZnpx8CKfMVUzWdCzKzHUJ66wyFBtv5QX881UrgS94uU4TvzvT83')
index = pc.Index('medical-guidelines')

# Get index stats
stats = index.describe_index_stats()
print(f"Total vectors in index: {stats.total_vector_count}")
print(f"\nNamespace stats:")
for namespace, data in stats.namespaces.items():
    print(f"  {namespace}: {data.vector_count} vectors")

# Query for BMC Veterinary Research papers
results = index.query(
    vector=[0.0] * 1536,  # dummy vector
    filter={"source": {"$eq": "BMC Veterinary Research"}},
    top_k=5,
    include_metadata=True
)

print(f"\n{'='*80}")
print(f"Sample BMC Veterinary Research entries in Pinecone:")
print(f"{'='*80}")
for i, match in enumerate(results.matches[:3], 1):
    print(f"\n{i}. Vector ID: {match.id}")
    print(f"   PMCID: {match.metadata.get('pmcid', 'N/A')}")
    print(f"   Title: {match.metadata.get('title', 'N/A')[:100]}...")
    print(f"   Journal: {match.metadata.get('journal', 'N/A')}")
    print(f"   Year: {match.metadata.get('year', 'N/A')}")
    print(f"   Text preview: {match.metadata.get('text', 'N/A')[:150]}...")