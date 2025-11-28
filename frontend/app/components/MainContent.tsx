"use client";

import { useState } from "react";
import { ArrowRight, ChevronDown, BookText, Pill, Stethoscope, Sparkles, ArrowUpRight, Activity } from "lucide-react";
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
      text: "Guidelines",
      questions: [
        "What are the WSAVA guidelines for canine vaccination protocols?",
        "What is the standard protocol for feline diabetes management?",
        "What are the pain management guidelines for post-operative dogs?"
      ]
    },
    {
      icon: Pill,
      text: "Drug Administration",
      questions: [
        "What is the safe dosage of meloxicam for a 15kg dog with osteoarthritis?",
        "Can I administer acepromazine to a cat with heart disease?",
        "How should antibiotic doses be adjusted for dogs with renal insufficiency?"
      ]
    },
    {
      icon: Stethoscope,
      text: "Treatment Alternatives",
      questions: [
        "What are alternative antibiotics for dogs allergic to penicillin?",
        "What NSAIDs can be used if a cat cannot tolerate meloxicam?",
        "What are treatment alternatives for canine atopic dermatitis besides steroids?"
      ]
    },
    {
      icon: Activity,
      text: "Diagnostic Protocols",
      questions: [
        "What diagnostic tests are recommended for suspected feline hyperthyroidism?",
        "What is the protocol for diagnosing canine Cushing's disease?",
        "How should I approach a dog with suspected pancreatitis?"
      ]
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      {/* 상단 배너 */}
      <div className="px-6 py-3 flex items-center justify-center space-x-2 text-sm" style={{ backgroundColor: '#20808D' }}>
        <Sparkles className="w-4 h-4" />
        <span className="font-medium">Clinical Diagnostic AI, 50% off for early beta testers</span>
        <ArrowRight className="w-4 h-4" />
      </div>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 flex flex-col items-center px-8 overflow-y-auto pt-48">
        {/* 로고 */}
        <div className="mb-8 flex items-center space-x-1">
          <Image
            src="/image/clinical4-Photoroom.png"
            alt="Ruleout Pro Logo"
            width={80}
            height={80}
            className="object-contain translate-y-1"
          />
          <h1 className="text-5xl font-bold">
            <span className="text-white">Ruleout </span>
            <span style={{ color: '#20808D' }}>Pro</span>
          </h1>
        </div>

        {/* 검색 입력창 */}
        <form onSubmit={handleSubmit} className="w-full max-w-3xl mb-6">
          <div className="flex items-center bg-[#2a2a2a] rounded-2xl border border-gray-700 px-6 pr-2 py-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a medical question..."
              className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
            />
            <button
              type="submit"
              className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 hover:brightness-110"
              style={{ backgroundColor: '#20808D' }}
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
                    <ArrowUpRight className="w-4 h-4 flex-shrink-0 text-gray-500 group-hover:text-[#20808D] transition-colors" />
                  </button>
                ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
