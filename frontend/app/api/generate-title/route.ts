import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstMessage } = body;

    // GPT를 사용하여 대화 제목 생성
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "당신은 의료 관련 대화의 제목을 생성하는 AI입니다. 사용자의 질문을 보고 간결하고 명확한 제목을 한국어로 생성하세요. 제목은 20자 이내로 작성하고, 핵심 키워드를 포함해야 합니다."
        },
        {
          role: "user",
          content: `다음 질문에 대한 간결한 제목을 생성해주세요 (20자 이내):\n\n${firstMessage}`
        }
      ],
      temperature: 0.7,
      max_tokens: 50,
    });

    const title = response.choices[0]?.message?.content?.trim() || firstMessage.slice(0, 20);

    return NextResponse.json({ title });
  } catch (error) {
    console.error("Title generation API 오류:", error);
    // 오류 시 첫 메시지의 앞 20자를 제목으로 사용
    const body = await request.json();
    const fallbackTitle = body.firstMessage.slice(0, 20) + (body.firstMessage.length > 20 ? "..." : "");
    return NextResponse.json({ title: fallbackTitle });
  }
}
