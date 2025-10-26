import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, conversationId, chatHistory } = body;

    // 백엔드 서버로 요청 전달 (SSE 스트림)
    const backendResponse = await fetch("http://localhost:8000/query-stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: query,
      }),
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend error: ${backendResponse.statusText}`);
    }

    // SSE 스트림을 읽어서 최종 응답 수집
    const reader = backendResponse.body?.getReader();
    const decoder = new TextDecoder();

    let answer = "";
    let references: any[] = [];
    let lastData: any = null;

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              lastData = data;

              // 마지막 "done" 상태에 answer와 references가 포함됨
              if (data.status === 'done' && data.answer) {
                answer = data.answer;
                references = data.references || [];
              }
            } catch (e) {
              // JSON 파싱 오류 무시
            }
          }
        }
      }
    }

    // 최종 응답 반환
    const response = {
      answer: answer || "응답을 생성할 수 없습니다.",
      references: references.map((ref: any) => ({
        source: ref.source || "",
        title: ref.title || "",
        year: ref.year || "",
        page: ref.page || 0,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Chat API 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
