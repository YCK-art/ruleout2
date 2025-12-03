"use client";

import { useState } from "react";
import { ArrowRight, ChevronDown, BookText, Pill, Stethoscope, Sparkles, ArrowUpRight, Activity } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

interface MainContentProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onQuestionSubmit: (question: string) => void;
}

export default function MainContent({ isSidebarOpen, onToggleSidebar, onQuestionSubmit }: MainContentProps) {
  const { language } = useLanguage();
  const [question, setQuestion] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    onQuestionSubmit(question);
  };

  // Multilingual content
  const content = {
    English: {
      placeholder: "Ask a medical question...",
      banner: "Clinical Diagnostic AI, 50% off for early beta testers",
      suggestions: [
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
        }
      ]
    },
    한국어: {
      placeholder: "의학 질문을 입력하세요...",
      banner: "임상 진단 AI, 얼리 베타 테스터 50% 할인",
      suggestions: [
        {
          icon: BookText,
          text: "가이드라인",
          questions: [
            "WSAVA 개 백신 접종 프로토콜 가이드라인은 무엇인가요?",
            "고양이 당뇨병 관리의 표준 프로토콜은 무엇인가요?",
            "수술 후 개의 통증 관리 가이드라인은 무엇인가요?"
          ]
        },
        {
          icon: Pill,
          text: "약물 투여",
          questions: [
            "골관절염이 있는 15kg 개에게 멜록시캄의 안전한 용량은?",
            "심장 질환이 있는 고양이에게 아세프로마진을 투여할 수 있나요?",
            "신장 기능 부전이 있는 개의 항생제 용량을 어떻게 조정해야 하나요?"
          ]
        },
        {
          icon: Stethoscope,
          text: "치료 대안",
          questions: [
            "페니실린 알레르기가 있는 개를 위한 대체 항생제는?",
            "고양이가 멜록시캄을 견디지 못할 경우 사용할 수 있는 NSAID는?",
            "스테로이드 외에 개 아토피 피부염의 치료 대안은?"
          ]
        },
        {
          icon: Activity,
          text: "진단 프로토콜",
          questions: [
            "고양이 갑상선 기능 항진증이 의심될 때 권장되는 진단 검사는?",
            "개 쿠싱 증후군 진단 프로토콜은 무엇인가요?",
            "췌장염이 의심되는 개에게 어떻게 접근해야 하나요?"
          ]
        }
      ]
    },
    日本語: {
      placeholder: "医学的な質問を入力してください...",
      banner: "臨床診断AI、早期ベータテスター向け50%オフ",
      suggestions: [
        {
          icon: BookText,
          text: "ガイドライン",
          questions: [
            "犬のワクチン接種プロトコルに関するWSAVAガイドラインは何ですか？",
            "猫の糖尿病管理の標準プロトコルは何ですか？",
            "術後の犬の疼痛管理ガイドラインは何ですか？"
          ]
        },
        {
          icon: Pill,
          text: "薬物投与",
          questions: [
            "骨関節炎のある15kgの犬に対するメロキシカムの安全な投与量は？",
            "心臓病のある猫にアセプロマジンを投与できますか？",
            "腎機能不全のある犬の抗生物質投与量をどのように調整すべきですか？"
          ]
        },
        {
          icon: Stethoscope,
          text: "治療の代替案",
          questions: [
            "ペニシリンアレルギーのある犬の代替抗生物質は何ですか？",
            "猫がメロキシカムを許容できない場合、どのNSAIDを使用できますか？",
            "ステロイド以外の犬のアトピー性皮膚炎の治療代替案は何ですか？"
          ]
        },
        {
          icon: Activity,
          text: "診断プロトコル",
          questions: [
            "猫の甲状腺機能亢進症が疑われる場合、推奨される診断検査は何ですか？",
            "犬のクッシング病の診断プロトコルは何ですか？",
            "膵炎が疑われる犬にどのようにアプローチすべきですか？"
          ]
        }
      ]
    }
  };

  const suggestions = content[language].suggestions;

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      {/* 상단 배너 */}
      <div className="px-6 py-3 flex items-center justify-center space-x-2 text-sm" style={{ backgroundColor: '#20808D' }}>
        <Sparkles className="w-4 h-4" />
        <span className="font-medium">{content[language].banner}</span>
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
              placeholder={content[language].placeholder}
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
