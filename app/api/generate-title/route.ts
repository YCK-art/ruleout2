import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  // Initialize OpenAI client only when the function is called
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  let firstMessage = "";

  try {
    const body = await request.json();
    firstMessage = body.firstMessage;

    if (!firstMessage || !firstMessage.trim()) {
      return NextResponse.json({ title: "새 대화" });
    }

    // 질문 언어 감지 (간단한 방법: 한글이 포함되어 있는지 확인)
    const isKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(firstMessage);

    console.log(`🎯 제목 생성 시작 (언어: ${isKorean ? '한국어' : 'English'}):`, firstMessage.slice(0, 50));

    // GPT를 사용하여 대화 제목 생성 (질문 언어로)
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: isKorean
            ? "당신은 수의학 관련 대화의 제목을 생성하는 AI입니다. 사용자의 질문을 보고 명확한 제목을 한국어로 생성하세요. 제목은 100자 이내로 작성하고, 핵심 키워드를 포함해야 합니다. **중요: 따옴표 없이 제목만 반환하세요.**"
            : "You are an AI that generates titles for veterinary medicine conversations. Generate a clear and descriptive title in English based on the user's question. Keep it under 150 characters and include key keywords. **IMPORTANT: Return ONLY the title without any quotation marks.**"
        },
        {
          role: "user",
          content: isKorean
            ? `다음 질문에 대한 명확한 제목을 생성해주세요 (100자 이내, 따옴표 없이):\n\n${firstMessage}`
            : `Generate a clear and descriptive title for the following question (under 150 characters, without quotation marks):\n\n${firstMessage}`
        }
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    // 생성된 제목에서 따옴표 제거 (앞뒤의 따옴표만 제거)
    let title = response.choices[0]?.message?.content?.trim() || firstMessage.slice(0, 100);
    title = title.replace(/^["']|["']$/g, ''); // 시작과 끝의 따옴표 제거

    console.log(`✅ 제목 생성 완료:`, title);

    return NextResponse.json({ title });
  } catch (error) {
    console.error("Title generation API 오류:", error);
    // 오류 시 firstMessage 변수 사용 (이미 파싱된 값)
    const fallbackTitle = firstMessage
      ? firstMessage.slice(0, 100) + (firstMessage.length > 100 ? "..." : "")
      : "새 대화";

    console.log(`⚠️  Fallback 제목 사용:`, fallbackTitle);
    return NextResponse.json({ title: fallbackTitle });
  }
}
