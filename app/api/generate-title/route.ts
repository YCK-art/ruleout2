import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  // Initialize OpenAI client only when the function is called
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  try {
    const body = await request.json();
    const { firstMessage } = body;

    // 질문 언어 감지 (간단한 방법: 한글이 포함되어 있는지 확인)
    const isKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(firstMessage);

    // GPT를 사용하여 대화 제목 생성 (질문 언어로)
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: isKorean
            ? "당신은 수의학 관련 대화의 제목을 생성하는 AI입니다. 사용자의 질문을 보고 간결하고 명확한 제목을 한국어로 생성하세요. 제목은 20자 이내로 작성하고, 핵심 키워드를 포함해야 합니다. **중요: 따옴표 없이 제목만 반환하세요.**"
            : "You are an AI that generates titles for veterinary medicine conversations. Generate a concise and clear title in English based on the user's question. Keep it under 50 characters and include key keywords. **IMPORTANT: Return ONLY the title without any quotation marks.**"
        },
        {
          role: "user",
          content: isKorean
            ? `다음 질문에 대한 간결한 제목을 생성해주세요 (20자 이내, 따옴표 없이):\n\n${firstMessage}`
            : `Generate a concise title for the following question (under 50 characters, without quotation marks):\n\n${firstMessage}`
        }
      ],
      temperature: 0.7,
      max_tokens: 50,
    });

    // 생성된 제목에서 따옴표 제거 (앞뒤의 따옴표만 제거)
    let title = response.choices[0]?.message?.content?.trim() || firstMessage.slice(0, 20);
    title = title.replace(/^["']|["']$/g, ''); // 시작과 끝의 따옴표 제거

    return NextResponse.json({ title });
  } catch (error) {
    console.error("Title generation API 오류:", error);
    // 오류 시 첫 메시지의 앞 20자를 제목으로 사용
    const body = await request.json();
    const fallbackTitle = body.firstMessage.slice(0, 20) + (body.firstMessage.length > 20 ? "..." : "");
    return NextResponse.json({ title: fallbackTitle });
  }
}
