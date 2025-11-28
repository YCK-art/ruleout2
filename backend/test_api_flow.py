"""
백엔드 API 플로우 테스트
1. 질문 -> embedding API -> 벡터로 변환
2. 벡터로 Pinecone 검색
3. GPT-4가 답변 생성
"""

import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

BACKEND_URL = "http://localhost:8000"

def test_api_flow():
    print("="*70)
    print("🧪 백엔드 API 플로우 테스트")
    print("="*70)

    # 테스트 1: 영어 질문
    print("\n📝 테스트 1: 영어 질문")
    print("-"*70)

    test_question_en = "What are the core vaccines recommended for dogs?"

    print(f"질문: {test_question_en}")
    print(f"\n요청 중... POST {BACKEND_URL}/query-stream")

    response = requests.post(
        f"{BACKEND_URL}/query-stream",
        json={"question": test_question_en},
        stream=True
    )

    print(f"\n응답 상태: {response.status_code}")
    print("\n📊 SSE 이벤트 스트림:")
    print("-"*70)

    answer_text = None
    references = None

    for line in response.iter_lines():
        if line:
            line_str = line.decode('utf-8')
            if line_str.startswith('data: '):
                data_str = line_str[6:]  # 'data: ' 제거
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
        print(answer_text[:500] + "..." if len(answer_text) > 500 else answer_text)

        print("\n📚 참고문헌:")
        print("-"*70)
        for i, ref in enumerate(references[:3], 1):
            print(f"[{i}] {ref.get('source', 'Unknown')}, {ref.get('title', 'Unknown')[:60]}..., {ref.get('year', 'Unknown')}, p.{ref.get('page', 0)}")

        # 언어 확인
        if any(ord(c) > 127 for c in answer_text[:100]):  # 한글 포함 여부
            print("\n⚠️  경고: 답변에 한글이 포함되어 있습니다 (영어 질문이었는데)")
        else:
            print("\n✅ 답변 언어: 영어 (올바름)")

    print("\n" + "="*70)

    # 테스트 2: 한국어 질문
    print("\n📝 테스트 2: 한국어 질문")
    print("-"*70)

    test_question_ko = "강아지 백신 스케줄은 어떻게 되나요?"

    print(f"질문: {test_question_ko}")
    print(f"\n요청 중... POST {BACKEND_URL}/query-stream")

    response = requests.post(
        f"{BACKEND_URL}/query-stream",
        json={"question": test_question_ko},
        stream=True
    )

    print(f"\n응답 상태: {response.status_code}")
    print("\n📊 SSE 이벤트 스트림:")
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
        print(answer_text[:500] + "..." if len(answer_text) > 500 else answer_text)

        print("\n📚 참고문헌:")
        print("-"*70)
        for i, ref in enumerate(references[:3], 1):
            print(f"[{i}] {ref.get('source', 'Unknown')}, {ref.get('title', 'Unknown')[:60]}..., {ref.get('year', 'Unknown')}, p.{ref.get('page', 0)}")

        # 언어 확인
        if any(ord(c) > 127 for c in answer_text[:100]):  # 한글 포함 여부
            print("\n✅ 답변 언어: 한국어 (올바름)")
        else:
            print("\n⚠️  경고: 답변에 한글이 없습니다 (한국어 질문이었는데)")

    print("\n" + "="*70)
    print("🎉 테스트 완료!")
    print("="*70)


if __name__ == "__main__":
    test_api_flow()
