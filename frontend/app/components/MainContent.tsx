"use client";

import { useState } from "react";
import { ArrowRight, ChevronDown, BookText, Pill, Stethoscope, Sparkles, ArrowUpRight } from "lucide-react";
import Image from "next/image";

interface MainContentProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onQuestionSubmit: (question: string) => void;
}

export default function MainContent({ isSidebarOpen, onToggleSidebar, onQuestionSubmit }: MainContentProps) {
  const [question, setQuestion] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    onQuestionSubmit(question);
  };

  const suggestions = [
    {
      icon: BookText,
      text: "가이드라인 문의",
      questions: [
        "결장암 3기 환자의 NCCN 가이드라인에 따른 표준 치료는 무엇인가요?",
        "당뇨병 환자에서 메트포르민 사용에 대한 최신 가이드라인은 무엇인가요?",
        "고혈압 초기 치료에 대한 대한고혈압학회 권고사항은 무엇인가요?"
      ]
    },
    {
      icon: Pill,
      text: "약물 투여 문의",
      questions: [
        "신부전 환자에서 항생제 용량 조절은 어떻게 해야 하나요?",
        "와파린과 상호작용이 있는 주요 약물들은 무엇인가요?",
        "임신 중 안전하게 사용할 수 있는 진통제는 무엇인가요?"
      ]
    },
    {
      icon: Stethoscope,
      text: "치료법 대안 문의",
      questions: [
        "페니실린 알레르기 환자에서 대체 가능한 항생제는 무엇인가요?",
        "ACE 억제제 부작용 시 대안이 될 수 있는 약물은 무엇인가요?",
        "스타틴 불내성 환자의 이상지질혈증 치료 대안은 무엇인가요?"
      ]
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      {/* 상단 배너 */}
      <div className="bg-primary px-6 py-3 flex items-center justify-center space-x-2 text-sm">
        <Sparkles className="w-4 h-4" />
        <span className="font-medium">임상 진단 보조 AI, 초기 베타 테스터 50% 할인</span>
        <ArrowRight className="w-4 h-4" />
      </div>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 flex flex-col items-center px-8 overflow-y-auto pt-48">
        {/* 로고 */}
        <div className="mb-8 flex items-center space-x-3">
          <Image
            src="/image/medical2.png"
            alt="Medical Pro Logo"
            width={80}
            height={80}
            className="object-contain translate-y-1"
          />
          <h1 className="text-5xl font-bold">
            <span className="text-white">Medical </span>
            <span className="text-primary">Pro</span>
          </h1>
        </div>

        {/* 검색 입력창 */}
        <form onSubmit={handleSubmit} className="w-full max-w-3xl mb-6">
          <div className="flex items-center bg-[#2a2a2a] rounded-2xl border border-gray-700 px-6 pr-2 py-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="의학 관련 질문을 입력하세요..."
              className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
            />
            <button
              type="submit"
              className="w-10 h-10 flex items-center justify-center bg-primary rounded-full transition-all duration-200 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:brightness-110"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* 제안 버튼들 */}
        <div className="w-full max-w-3xl">
          <div className="flex flex-wrap gap-3 mb-4">
            {suggestions.map((suggestion, index) => {
              const Icon = suggestion.icon;
              const isExpanded = expandedCategory === suggestion.text;
              return (
                <button
                  key={index}
                  onClick={() => setExpandedCategory(isExpanded ? null : suggestion.text)}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{suggestion.text}</span>
                </button>
              );
            })}
          </div>

          {/* 확장된 질문 목록 */}
          {expandedCategory && (
            <div className="space-y-2 animate-slideDown">
              {suggestions
                .find((s) => s.text === expandedCategory)
                ?.questions.map((q, qIndex) => (
                  <button
                    key={qIndex}
                    onClick={() => onQuestionSubmit(q)}
                    className="w-full group flex items-center justify-between px-5 py-4 bg-[#2a2a2a] border border-gray-700 rounded-lg hover:border-gray-600 transition-all text-left"
                  >
                    <span className="text-sm text-gray-200 pr-4">{q}</span>
                    <ArrowUpRight className="w-4 h-4 flex-shrink-0 text-gray-500 group-hover:text-primary transition-colors" />
                  </button>
                ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
