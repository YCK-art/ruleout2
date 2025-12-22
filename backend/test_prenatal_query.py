"""
Test specific query: Effects of Prenatal Testosterone Excess
"""
import requests
import json

BACKEND_URL = "http://localhost:8000"

def test_prenatal_query():
    print("="*70)
    print("🧪 Testing: Effects of Prenatal Testosterone Excess")
    print("="*70)

    query = "What are the effects of prenatal testosterone excess?"

    print(f"\n질문: {query}")
    print(f"\n요청 중... POST {BACKEND_URL}/query-stream\n")

    response = requests.post(
        f"{BACKEND_URL}/query-stream",
        json={"question": query},
        stream=True
    )

    print(f"응답 상태: {response.status_code}\n")
    print("📊 SSE 이벤트 스트림:")
    print("-"*70)

    answer_text = None
    references = None

    for line in response.iter_lines():
        if line:
            line_str = line.decode('utf-8')
            if line_str.startswith('data: '):
                data_str = line_str[6:]
                try:
                    data = json.loads(data_str)
                    status = data.get('status')
                    message = data.get('message', '')

                    print(f"[{status}] {message}")

                    if status == 'done':
                        answer_text = data.get('answer', '')
                        references = data.get('references', [])

                except json.JSONDecodeError:
                    pass

    if answer_text:
        print("\n" + "="*70)
        print("✅ 답변 생성 완료")
        print("="*70)
        print("\n📝 답변:")
        print("-"*70)
        print(answer_text[:800] if len(answer_text) > 800 else answer_text)

        if len(answer_text) > 800:
            print("...(truncated)")

        print("\n📚 참고문헌:")
        print("-"*70)
        for i, ref in enumerate(references, 1):
            print(f"[{i}] {ref.get('title', 'Unknown')[:80]}")
            print(f"    {ref.get('authors', 'Unknown')[:60]}... ({ref.get('year', 'Unknown')})")
            print(f"    Page {ref.get('page', 0)}, Score: {ref.get('score', 0):.4f}")
            print()

        if "no information" in answer_text.lower() or "cannot find" in answer_text.lower():
            print("\n❌ 경고: GPT가 정보를 찾지 못했다고 응답함")
        else:
            print("\n✅ 성공: GPT가 관련 정보를 찾아서 답변함")
    else:
        print("\n❌ 답변을 받지 못함")

    print("\n" + "="*70)

if __name__ == "__main__":
    test_prenatal_query()
