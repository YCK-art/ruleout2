import requests
import json

url = "http://localhost:8000/query-stream"
data = {
    "question": "What are the clinical signs of feline infectious peritonitis?",
    "conversation_history": []
}

response = requests.post(url, json=data, stream=True)

print("=== Testing Follow-up Questions ===")
print(f"Status: {response.status_code}\n")

for line in response.iter_lines():
    if line:
        line_str = line.decode('utf-8')
        if line_str.startswith('data: '):
            data_str = line_str[6:]
            try:
                data = json.loads(data_str)
                if data.get('status') == 'done':
                    print("\n✅ Answer received")
                    print(f"Answer length: {len(data.get('answer', ''))}")
                    print(f"References count: {len(data.get('references', []))}")
                    
                    followup = data.get('followup_questions', [])
                    print(f"\n🔍 Follow-up questions: {len(followup)}")
                    for i, q in enumerate(followup, 1):
                        print(f"  {i}. {q}")
                else:
                    print(f"[{data.get('status')}] {data.get('message', '')}")
            except json.JSONDecodeError as e:
                print(f"JSON parse error: {e}")
