"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Toolbar from "@/app/components/Toolbar";
import Footer from "@/app/components/Footer";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function EnterprisePage() {
  const router = useRouter();
  const { effectiveTheme } = useTheme();
  const { language } = useLanguage();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const content = {
    English: {
      hero: {
        subtitle: "FOR ENTERPRISES",
        title: "Accelerate clinical decisions",
        description: "Equip your hospital, lab, or faculty with evidence-based AI that streamlines workflows, unifies knowledge, and elevates veterinary care without added burden.",
        button: "Talk to our team"
      },
      features: {
        title: "Build prototypes and production-ready apps fast",
        description: "Turn ideas into clickable prototypes in minutes to speed up alignment, or build production-ready apps that fit your internal workflows.",
        slides: [
          {
            title: "Ship real apps fast",
            description: "Our batteries-included platform provides auth, email, connectors, and hosting so you can go from prototype to production in days."
          },
          {
            title: "Enterprise-grade security",
            description: "Built with SOC 2 Type II compliance, SSO, audit logs, and granular permissions to meet your security requirements."
          },
          {
            title: "Team collaboration built-in",
            description: "Work together with version control, comments, and real-time collaboration features designed for teams."
          }
        ]
      },
      cta: {
        title: "Ready to transform your workflow?",
        description: "Join leading veterinary institutions already using Ruleout to accelerate their clinical decisions.",
        demo: "Schedule a demo",
        sales: "Contact sales"
      }
    },
    한국어: {
      hero: {
        subtitle: "기업용",
        title: "임상 의사결정 가속화",
        description: "증거 기반 AI로 병원, 연구실 또는 교수진의 워크플로를 간소화하고 지식을 통합하여 추가 부담 없이 수의학 치료를 향상시킵니다.",
        button: "팀에게 문의하기"
      },
      features: {
        title: "프로토타입과 프로덕션 앱을 빠르게 구축",
        description: "아이디어를 몇 분 안에 클릭 가능한 프로토타입으로 전환하여 정렬 속도를 높이거나 내부 워크플로에 맞는 프로덕션 앱을 구축하세요.",
        slides: [
          {
            title: "실제 앱을 빠르게 제공",
            description: "인증, 이메일, 커넥터 및 호스팅이 포함된 플랫폼으로 프로토타입에서 프로덕션까지 며칠 만에 이동할 수 있습니다."
          },
          {
            title: "엔터프라이즈급 보안",
            description: "SOC 2 Type II 규정 준수, SSO, 감사 로그 및 세분화된 권한으로 보안 요구 사항을 충족합니다."
          },
          {
            title: "팀 협업 기능 내장",
            description: "버전 관리, 주석 및 팀을 위해 설계된 실시간 협업 기능으로 함께 작업하세요."
          }
        ]
      },
      cta: {
        title: "워크플로우를 혁신할 준비가 되셨나요?",
        description: "Ruleout으로 임상 의사결정을 가속화 중인 주요 수의학 기관에 합류하세요.",
        demo: "데모 예약",
        sales: "영업팀 문의"
      }
    },
    日本語: {
      hero: {
        subtitle: "エンタープライズ向け",
        title: "臨床意思決定を加速",
        description: "エビデンスに基づくAIで病院、研究室、または教員のワークフローを効率化し、知識を統合して、追加の負担なく獣医学ケアを向上させます。",
        button: "チームに相談"
      },
      features: {
        title: "プロトタイプと本番対応アプリを迅速に構築",
        description: "アイデアを数分でクリック可能なプロトタイプに変換して調整を加速するか、内部ワークフローに適合する本番対応アプリを構築します。",
        slides: [
          {
            title: "実際のアプリを迅速に提供",
            description: "認証、メール、コネクタ、ホスティングを含むプラットフォームで、プロトタイプから本番環境まで数日で移行できます。"
          },
          {
            title: "エンタープライズグレードのセキュリティ",
            description: "SOC 2 Type II準拠、SSO、監査ログ、きめ細かなアクセス許可でセキュリティ要件を満たします。"
          },
          {
            title: "チームコラボレーション機能を内蔵",
            description: "バージョン管理、コメント、チーム向けに設計されたリアルタイムコラボレーション機能で一緒に作業します。"
          }
        ]
      },
      cta: {
        title: "ワークフローを変革する準備はできていますか？",
        description: "すでにRuleoutを使用して臨床意思決定を加速している主要な獣医学機関に参加してください。",
        demo: "デモを予約",
        sales: "営業に問い合わせ"
      }
    }
  };

  const currentContent = content[language as keyof typeof content];

  const handleLogin = () => {
    setShowLoginModal(true);
  };

  // Auto-rotate slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`min-h-screen ${effectiveTheme === "light" ? "bg-white" : "bg-[#1a1a1a]"}`}>
      {/* Toolbar */}
      <Toolbar onLoginClick={handleLogin} />

      {/* Hero Section with Gradient */}
      <div className="relative min-h-[600px] flex items-center justify-center pt-20">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a6a78] via-[#20808D] via-40% to-[#4DB8C4] to-90%" />

        {/* Blur effects for depth */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#20808D] rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-[#4DB8C4] rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-[#6dccd7] rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000" />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <p className="text-white/90 text-lg font-medium mb-4 tracking-wide">{currentContent.hero.subtitle}</p>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6" style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
            {currentContent.hero.title}
          </h1>
          <p className="text-white/90 text-lg md:text-xl mb-10 max-w-3xl mx-auto leading-relaxed">
            {currentContent.hero.description}
          </p>
          <button
            onClick={() => window.open('https://calendly.com/d/ctf4-n6s-3yp/ruleout-enterprise', '_blank')}
            className="group relative px-8 py-4 bg-black text-white text-lg font-semibold rounded-lg overflow-hidden shadow-2xl"
          >
            <span className="relative z-10">{currentContent.hero.button}</span>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </button>
        </div>
      </div>

      {/* Partners Section */}
      <div className={`${effectiveTheme === "light" ? "bg-[#2a2a2a]" : "bg-[#0a0a0a]"} py-16`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-16">
            {/* Partner Logos - Using grayscale filter for professional look */}
            <div className="opacity-60 hover:opacity-100 transition-opacity duration-300">
              <Image
                src="/image/snuh.svg"
                alt="Seoul National University Hospital"
                width={140}
                height={50}
                className="object-contain filter grayscale brightness-0 invert"
              />
            </div>
            <div className="opacity-60 hover:opacity-100 transition-opacity duration-300">
              <Image
                src="/image/asan.svg"
                alt="Asan Medical Center"
                width={140}
                height={50}
                className="object-contain filter grayscale brightness-0 invert"
              />
            </div>
            <div className="opacity-60 hover:opacity-100 transition-opacity duration-300">
              <Image
                src="/image/severance.svg"
                alt="Severance Hospital"
                width={140}
                height={50}
                className="object-contain filter grayscale brightness-0 invert"
              />
            </div>
            <div className="opacity-60 hover:opacity-100 transition-opacity duration-300">
              <Image
                src="/image/hanyang.svg"
                alt="Hanyang University Hospital"
                width={140}
                height={50}
                className="object-contain filter grayscale brightness-0 invert"
              />
            </div>
            <div className="opacity-60 hover:opacity-100 transition-opacity duration-300">
              <Image
                src="/image/korea.svg"
                alt="Korea University Hospital"
                width={140}
                height={50}
                className="object-contain filter grayscale brightness-0 invert"
              />
            </div>
            <div className="opacity-60 hover:opacity-100 transition-opacity duration-300">
              <Image
                src="/image/ajou.svg"
                alt="Ajou University Hospital"
                width={140}
                height={50}
                className="object-contain filter grayscale brightness-0 invert"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className={`${effectiveTheme === "light" ? "bg-white" : "bg-[#1a1a1a]"} py-32`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-16">
            {/* Title and Description - Left Aligned */}
            <div className="max-w-3xl">
              <h2 className={`text-3xl md:text-4xl font-bold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"} mb-6`} style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
                {currentContent.features.title}
              </h2>
              <p className={`text-lg ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"} leading-relaxed`}>
                {currentContent.features.description}
              </p>
            </div>

            {/* Content Card Container */}
            <div className={`rounded-2xl border ${effectiveTheme === "light" ? "bg-gray-50 border-gray-200" : "bg-[#0d0d0d] border-gray-800"} shadow-xl p-6 md:p-8`}>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
                {/* Left: Description Text */}
                <div className="lg:col-span-2 space-y-6 pt-4">
                  <div className="min-h-[100px]">
                    <h3 className={`text-xl font-semibold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"} mb-3 transition-opacity duration-500`}>
                      {currentContent.features.slides[currentSlide].title}
                    </h3>
                    <p className={`text-sm ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"} leading-relaxed mb-4 transition-opacity duration-500`}>
                      {currentContent.features.slides[currentSlide].description}
                    </p>
                  </div>

                  {/* Slide Indicators */}
                  <div className="flex gap-2">
                    {[0, 1, 2].map((index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          currentSlide === index
                            ? 'w-8 bg-[#20808D]'
                            : `w-1.5 ${effectiveTheme === "light" ? "bg-gray-300" : "bg-gray-700"}`
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Right: Image Carousel */}
                <div className="lg:col-span-3 relative">
                  <div className={`rounded-xl overflow-hidden border ${effectiveTheme === "light" ? "border-gray-200 bg-gray-100" : "border-gray-800 bg-[#0d1117]"} shadow-2xl`}>
                    <div className="aspect-[16/9] relative">
                      {/* Slide 1 */}
                      <div className={`absolute inset-0 transition-opacity duration-500 ${currentSlide === 0 ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="w-full h-full bg-gradient-to-br from-[#20808D]/10 to-[#4DB8C4]/10 flex items-center justify-center">
                          <span className={`text-8xl font-bold ${effectiveTheme === "light" ? "text-gray-300" : "text-gray-800"}`}>
                            1
                          </span>
                        </div>
                      </div>

                      {/* Slide 2 */}
                      <div className={`absolute inset-0 transition-opacity duration-500 ${currentSlide === 1 ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="w-full h-full bg-gradient-to-br from-[#4DB8C4]/10 to-[#6dccd7]/10 flex items-center justify-center">
                          <span className={`text-8xl font-bold ${effectiveTheme === "light" ? "text-gray-300" : "text-gray-800"}`}>
                            2
                          </span>
                        </div>
                      </div>

                      {/* Slide 3 */}
                      <div className={`absolute inset-0 transition-opacity duration-500 ${currentSlide === 2 ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="w-full h-full bg-gradient-to-br from-[#6dccd7]/10 to-[#20808D]/10 flex items-center justify-center">
                          <span className={`text-8xl font-bold ${effectiveTheme === "light" ? "text-gray-300" : "text-gray-800"}`}>
                            3
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Arrows */}
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev - 1 + 3) % 3)}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full ${effectiveTheme === "light" ? "bg-white border-gray-200" : "bg-[#2a2a2a] border-gray-700"} border shadow-lg flex items-center justify-center hover:scale-110 transition-transform`}
                  >
                    <svg className={`w-5 h-5 ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % 3)}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full ${effectiveTheme === "light" ? "bg-white border-gray-200" : "bg-[#2a2a2a] border-gray-700"} border shadow-lg flex items-center justify-center hover:scale-110 transition-transform`}
                  >
                    <svg className={`w-5 h-5 ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className={`${effectiveTheme === "light" ? "bg-gray-50" : "bg-[#0a0a0a]"} py-32`}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className={`text-3xl md:text-5xl font-bold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"} mb-8`} style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
            {currentContent.cta.title}
          </h2>
          <p className={`text-xl ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"} mb-12 max-w-2xl mx-auto`}>
            {currentContent.cta.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.open('https://calendly.com/d/ctf4-n6s-3yp/ruleout-enterprise', '_blank')}
              className="px-6 py-3 bg-[#20808D] text-white text-base font-semibold rounded-lg hover:bg-[#1a6b77] transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {currentContent.cta.demo}
            </button>
            <button
              onClick={() => window.open('https://calendly.com/d/ctf4-n6s-3yp/ruleout-enterprise', '_blank')}
              className={`px-6 py-3 border-2 text-base font-semibold rounded-lg transition-all duration-200 ${
                effectiveTheme === "light"
                  ? "border-gray-300 text-gray-900 hover:border-gray-400 hover:bg-gray-50"
                  : "border-gray-700 text-white hover:border-gray-600 hover:bg-[#2a2a2a]"
              }`}
            >
              {currentContent.cta.sales}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
