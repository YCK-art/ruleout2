"use client";

import { useState } from "react";
import Image from "next/image";
import Toolbar from "@/app/components/Toolbar";
import Footer from "@/app/components/Footer";
import LoginModal from "@/app/components/LoginModal";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowUpRight } from "lucide-react";

export default function FeaturesPage() {
  const { effectiveTheme } = useTheme();
  const { language } = useLanguage();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const content = {
    English: {
      hero: {
        title: "Built to make you extraordinarily productive,",
        subtitle: "Ruleout is the best way to search medical guidelines with AI.",
        button: "Get Started"
      },
      trusted: "Trusted every day by millions of professional veterinarians.",
      cards: [
        {
          title: "AI-Powered Search",
          description: "Advanced natural language understanding finds exactly what you need in medical guidelines."
        },
        {
          title: "Multi-Model Access",
          description: "Choose from the latest AI models including GPT-4, Claude, and specialized medical models."
        },
        {
          title: "Real-time Updates",
          description: "Stay current with automatically updated clinical guidelines and research findings."
        }
      ],
      features: [
        {
          description: "Find relevant clinical guidelines instantly with our advanced AI that understands veterinary medical context and terminology.",
          link: "Learn about AI Search",
          imageRight: true
        },
        {
          description: "Access comprehensive treatment protocols backed by peer-reviewed research and expert consensus from leading veterinary organizations.",
          link: "Learn about Evidence",
          imageRight: false
        },
        {
          description: "Stay updated with the latest veterinary research and clinical best practices from trusted medical institutions worldwide.",
          link: "Learn about Updates",
          imageRight: true
        }
      ]
    },
    한국어: {
      hero: {
        title: "당신을 월등히 생산적으로 만들기 위해 제작되었습니다,",
        subtitle: "Ruleout은 AI로 의료 가이드라인을 검색하는 최고의 방법입니다.",
        button: "시작하기"
      },
      trusted: "수백만 명의 전문 수의사들이 매일 신뢰하고 있습니다.",
      cards: [
        {
          title: "AI 기반 검색",
          description: "고급 자연어 이해로 의료 가이드라인에서 필요한 정보를 정확하게 찾아냅니다."
        },
        {
          title: "다중 모델 액세스",
          description: "GPT-4, Claude 및 전문 의료 모델을 포함한 최신 AI 모델 중에서 선택하세요."
        },
        {
          title: "실시간 업데이트",
          description: "자동으로 업데이트되는 임상 가이드라인 및 연구 결과로 최신 정보를 유지하세요."
        }
      ],
      features: [
        {
          description: "수의학적 맥락과 용어를 이해하는 고급 AI로 관련 임상 가이드라인을 즉시 찾아보세요.",
          link: "AI 검색에 대해 알아보기",
          imageRight: true
        },
        {
          description: "주요 수의학 기관의 전문가 합의와 동료 검토 연구로 뒷받침되는 포괄적인 치료 프로토콜에 액세스하세요.",
          link: "증거에 대해 알아보기",
          imageRight: false
        },
        {
          description: "전 세계 신뢰할 수 있는 의료 기관의 최신 수의학 연구 및 임상 모범 사례로 최신 정보를 유지하세요.",
          link: "업데이트에 대해 알아보기",
          imageRight: true
        }
      ]
    },
    日本語: {
      hero: {
        title: "非常に生産的になるために作られました、",
        subtitle: "RuleoutはAIで医療ガイドラインを検索する最良の方法です。",
        button: "始める"
      },
      trusted: "何百万人もの専門獣医師が毎日信頼しています。",
      cards: [
        {
          title: "AI駆動検索",
          description: "高度な自然言語理解により、医療ガイドラインで必要な情報を正確に見つけます。"
        },
        {
          title: "マルチモデルアクセス",
          description: "GPT-4、Claude、専門医療モデルを含む最新のAIモデルから選択できます。"
        },
        {
          title: "リアルタイム更新",
          description: "自動更新される臨床ガイドラインと研究結果で最新情報を維持します。"
        }
      ],
      features: [
        {
          description: "獣医学的な文脈と用語を理解する高度なAIで、関連する臨床ガイドラインを即座に見つけます。",
          link: "AI検索について学ぶ",
          imageRight: true
        },
        {
          description: "主要な獣医学組織からの専門家のコンセンサスと査読済み研究に裏打ちされた包括的な治療プロトコルにアクセスします。",
          link: "エビデンスについて学ぶ",
          imageRight: false
        },
        {
          description: "世界中の信頼できる医療機関からの最新の獣医学研究と臨床ベストプラクティスで最新情報を入手してください。",
          link: "アップデートについて学ぶ",
          imageRight: true
        }
      ]
    }
  };

  const currentContent = content[language as keyof typeof content];

  const handleLogin = () => {
    setShowLoginModal(true);
  };

  return (
    <div className={`min-h-screen ${effectiveTheme === "light" ? "bg-white text-gray-900" : "bg-[#1a1a1a] text-white"}`}>
      {/* Toolbar */}
      <Toolbar onLoginClick={handleLogin} />

      {/* Hero Section */}
      <div className={`${effectiveTheme === "light" ? "bg-white" : "bg-[#1a1a1a]"} pt-32 pb-16`}>
        <div className="max-w-7xl mx-auto px-6">
          {/* Title and Button */}
          <div className="mb-12">
            <h1 className={`text-xl md:text-2xl font-bold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"} mb-2`} style={{ fontFamily: "Pretendard, sans-serif" }}>
              {currentContent.hero.title}
            </h1>
            <h2 className={`text-xl md:text-2xl font-bold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"} mb-6`} style={{ fontFamily: "Pretendard, sans-serif" }}>
              {currentContent.hero.subtitle}
            </h2>

            <button className={`group flex items-center gap-2 px-5 py-2.5 bg-white text-black border border-gray-300 rounded-full text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl ${effectiveTheme === "light" ? "hover:bg-[#20808D]" : "hover:bg-[#4DB8C4]"} hover:text-white hover:border-transparent`}>
              <span>{currentContent.hero.button}</span>
              <ArrowUpRight className="w-4 h-4 transition-colors" />
            </button>
          </div>

          {/* Product Screenshot */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <div className={`aspect-[16/9] ${effectiveTheme === "light" ? "bg-gray-200" : "bg-[#0a0a0a]"} flex items-center justify-center`}>
              {/* Placeholder for product screenshot - Replace with actual image */}
              <div className={`w-full h-full flex items-center justify-center ${effectiveTheme === "light" ? "bg-gradient-to-br from-gray-100 to-gray-200" : "bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]"}`}>
                <p className={`text-lg ${effectiveTheme === "light" ? "text-gray-500" : "text-gray-600"}`}>Product Screenshot</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trusted By Section */}
      <div className={`${effectiveTheme === "light" ? "bg-gray-50" : "bg-[#0a0a0a]"} py-16`}>
        <div className="max-w-7xl mx-auto px-6">
          <p className={`text-center ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"} mb-12`}>
            {currentContent.trusted}
          </p>

          {/* Company Logos */}
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16">
            {/* Placeholder logos - Replace with actual company logos */}
            {["stripe", "OpenAI", "Linear", "DATADOG", "RIPPLING", "Figma", "ramp", "Adobe"].map((company, index) => (
              <div key={index} className={`${effectiveTheme === "light" ? "text-gray-400" : "text-gray-600"} text-xl font-semibold`}>
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Sections */}
      {currentContent.features.slice(0, 1).map((feature, index) => (
        <div key={index} className={`${effectiveTheme === "light" ? "bg-white" : "bg-[#1a1a1a]"} py-16`}>
          <div className="max-w-7xl mx-auto px-6">
            <div className={`${effectiveTheme === "light" ? "bg-gray-50" : "bg-[#0a0a0a]"} rounded-3xl p-8 md:p-12`}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {feature.imageRight ? (
                  <>
                    {/* Left: Text Content (3 columns) */}
                    <div className="lg:col-span-3 space-y-4">
                      <p className={`text-base ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"} leading-relaxed`} style={{ fontFamily: "Pretendard, sans-serif" }}>
                        {feature.description}
                      </p>
                      <button className={`group flex items-center gap-2 ${effectiveTheme === "light" ? "text-[#20808D] hover:text-[#1a6b77]" : "text-[#4DB8C4] hover:text-[#6dccd7]"} font-medium transition-colors`}>
                        <span>{feature.link}</span>
                        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </button>
                    </div>

                    {/* Right: Image Placeholder (9 columns) */}
                    <div className="lg:col-span-9">
                      <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                        <div className={`aspect-[16/10] ${effectiveTheme === "light" ? "bg-gray-200" : "bg-[#1a1a1a]"} flex items-center justify-center`}>
                          <div className={`w-full h-full flex items-center justify-center ${effectiveTheme === "light" ? "bg-gradient-to-br from-gray-100 to-gray-200" : "bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]"}`}>
                            <p className={`text-lg ${effectiveTheme === "light" ? "text-gray-500" : "text-gray-600"}`}>Feature Image</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Left: Image Placeholder (9 columns) */}
                    <div className="lg:col-span-9">
                      <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                        <div className={`aspect-[16/10] ${effectiveTheme === "light" ? "bg-gray-200" : "bg-[#1a1a1a]"} flex items-center justify-center`}>
                          <div className={`w-full h-full flex items-center justify-center ${effectiveTheme === "light" ? "bg-gradient-to-br from-gray-100 to-gray-200" : "bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]"}`}>
                            <p className={`text-lg ${effectiveTheme === "light" ? "text-gray-500" : "text-gray-600"}`}>Feature Image</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Text Content (3 columns) */}
                    <div className="lg:col-span-3 space-y-4">
                      <p className={`text-base ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"} leading-relaxed`} style={{ fontFamily: "Pretendard, sans-serif" }}>
                        {feature.description}
                      </p>
                      <button className={`group flex items-center gap-2 ${effectiveTheme === "light" ? "text-[#20808D] hover:text-[#1a6b77]" : "text-[#4DB8C4] hover:text-[#6dccd7]"} font-medium transition-colors`}>
                        <span>{feature.link}</span>
                        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Three Column Cards Section */}
      <div className={`${effectiveTheme === "light" ? "bg-white" : "bg-[#1a1a1a]"} py-8`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentContent.cards.map((card, index) => (
              <div key={index} className={`${effectiveTheme === "light" ? "bg-gray-50" : "bg-[#0a0a0a]"} rounded-2xl p-6`}>
                <h3 className={`text-lg font-semibold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"} mb-3`} style={{ fontFamily: "Pretendard, sans-serif" }}>
                  {card.title}
                </h3>
                <p className={`text-sm ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"} mb-6`} style={{ fontFamily: "Pretendard, sans-serif" }}>
                  {card.description}
                </p>
                <div className={`aspect-[4/3] ${effectiveTheme === "light" ? "bg-gray-200" : "bg-[#1a1a1a]"} rounded-xl flex items-center justify-center`}>
                  <div className={`w-full h-full flex items-center justify-center ${effectiveTheme === "light" ? "bg-gradient-to-br from-gray-100 to-gray-200" : "bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]"}`}>
                    <p className={`text-sm ${effectiveTheme === "light" ? "text-gray-500" : "text-gray-600"}`}>Image</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Remaining Feature Sections */}
      {currentContent.features.slice(1).map((feature, index) => (
        <div key={index} className={`${effectiveTheme === "light" ? "bg-white" : "bg-[#1a1a1a]"} py-24`}>
          <div className="max-w-7xl mx-auto px-6">
            <div className={`${effectiveTheme === "light" ? "bg-gray-50" : "bg-[#0a0a0a]"} rounded-3xl p-8 md:p-12`}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {feature.imageRight ? (
                  <>
                    {/* Left: Text Content (3 columns) */}
                    <div className="lg:col-span-3 space-y-4">
                      <p className={`text-base ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"} leading-relaxed`} style={{ fontFamily: "Pretendard, sans-serif" }}>
                        {feature.description}
                      </p>
                      <button className={`group flex items-center gap-2 ${effectiveTheme === "light" ? "text-[#20808D] hover:text-[#1a6b77]" : "text-[#4DB8C4] hover:text-[#6dccd7]"} font-medium transition-colors`}>
                        <span>{feature.link}</span>
                        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </button>
                    </div>

                    {/* Right: Image Placeholder (9 columns) */}
                    <div className="lg:col-span-9">
                      <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                        <div className={`aspect-[16/10] ${effectiveTheme === "light" ? "bg-gray-200" : "bg-[#1a1a1a]"} flex items-center justify-center`}>
                          <div className={`w-full h-full flex items-center justify-center ${effectiveTheme === "light" ? "bg-gradient-to-br from-gray-100 to-gray-200" : "bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]"}`}>
                            <p className={`text-lg ${effectiveTheme === "light" ? "text-gray-500" : "text-gray-600"}`}>Feature Image</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Left: Image Placeholder (9 columns) */}
                    <div className="lg:col-span-9">
                      <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                        <div className={`aspect-[16/10] ${effectiveTheme === "light" ? "bg-gray-200" : "bg-[#1a1a1a]"} flex items-center justify-center`}>
                          <div className={`w-full h-full flex items-center justify-center ${effectiveTheme === "light" ? "bg-gradient-to-br from-gray-100 to-gray-200" : "bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]"}`}>
                            <p className={`text-lg ${effectiveTheme === "light" ? "text-gray-500" : "text-gray-600"}`}>Feature Image</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Text Content (3 columns) */}
                    <div className="lg:col-span-3 space-y-4">
                      <p className={`text-base ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"} leading-relaxed`} style={{ fontFamily: "Pretendard, sans-serif" }}>
                        {feature.description}
                      </p>
                      <button className={`group flex items-center gap-2 ${effectiveTheme === "light" ? "text-[#20808D] hover:text-[#1a6b77]" : "text-[#4DB8C4] hover:text-[#6dccd7]"} font-medium transition-colors`}>
                        <span>{feature.link}</span>
                        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Footer */}
      <Footer />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}
