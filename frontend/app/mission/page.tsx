"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Toolbar from "@/app/components/Toolbar";
import Footer from '@/app/components/Footer';
import { signInWithGoogle } from "@/lib/auth";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from '@/contexts/LanguageContext';

export default function MissionPage() {
  const router = useRouter();
  const { effectiveTheme } = useTheme();
  const { language } = useLanguage();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [displayedText, setDisplayedText] = useState("");

  const content = {
    English: {
      heroText: "For the Animals We Love",
      futureTitle: "The Future of Care is Compassionate",
      futureSubtitle: "We're building a world where animals live healthier lives, supported by veterinarians empowered with instant, evidence-based knowledge.",
      learnMore: "Learn More",
      loginTitle: "Log in or Sign up",
      loginSubtitle: "Choose your work email.",
      whyNeeded: "Why is this needed?",
      continueGoogle: "Continue with Google",
      continueMicrosoft: "Continue with Microsoft",
      continueApple: "Continue with Apple",
      continueEmail: "Continue with Email",
      or: "or",
      missionParagraph1: "Essential veterinary knowledge is expanding at an overwhelming pace. Hundreds of thousands of research papers, guidelines, and clinical documents are published across the world, yet most of this information remains fragmented, difficult to search, and inaccessible at the moment of real clinical need. Veterinarians are expected to keep up with all of it while managing demanding caseloads and making life-critical decisions under pressure. And the animals receiving care cannot explain their symptoms or advocate for themselves when something goes wrong.",
      missionParagraph2: "Ruleout was created to confront this challenge.",
      missionParagraph2Sub: "By bringing trusted research, global guidelines, and real clinical evidence into one intelligent platform, we make it possible for veterinarians to access the best knowledge instantly and apply it with confidence. No searching across dozens of sources. No guessing. Just clear, reliable information that supports better outcomes.",
      missionParagraph3: "We believe that when veterinarians have the tools they need, animals live healthier and safer lives. Families gain more time with the companions they love. Communities become more compassionate. And the world we share grows stronger for every species that lives on this planet with us.",
      missionParagraph4: "Ruleout exists for people who understand that protecting animals is not only a medical responsibility but a shared human commitment. We support the veterinarians who carry this responsibility every day and the caregivers who want the best for their companions.",
      missionParagraph5: "If you believe in a future where science is accessible to every clinic, where compassionate care is strengthened by technology, and where animals receive the quality of life they deserve, we invite you to join us. Together, we can elevate veterinary medicine, improve countless lives, and help build a healthier planet for every living being that calls it ",
      missionParagraph5Bold: "home."
    },
    한국어: {
      heroText: "우리가 사랑하는 동물들을 위하여",
      futureTitle: "미래의 치료는 공감입니다",
      futureSubtitle: "우리는 수의사들이 즉각적이고 증거 기반의 지식으로 역량을 강화받아 동물들이 더 건강한 삶을 살 수 있는 세상을 만들고 있습니다.",
      learnMore: "자세히 알아보기",
      loginTitle: "로그인 또는 회원가입",
      loginSubtitle: "업무용 이메일을 선택하세요.",
      whyNeeded: "왜 필요한가요?",
      continueGoogle: "Google로 계속하기",
      continueMicrosoft: "Microsoft로 계속하기",
      continueApple: "Apple로 계속하기",
      continueEmail: "이메일로 계속하기",
      or: "또는",
      missionParagraph1: "필수적인 수의학 지식은 압도적인 속도로 확장되고 있습니다. 전 세계적으로 수십만 개의 연구 논문, 가이드라인 및 임상 문서가 출판되지만, 이러한 정보의 대부분은 단편화되어 있고, 검색하기 어려우며, 실제 임상 필요 시점에 접근하기 어렵습니다. 수의사들은 까다로운 진료 일정을 관리하고 압박 속에서 생명에 중요한 결정을 내리면서도 모든 정보를 따라잡아야 합니다. 그리고 진료를 받는 동물들은 자신의 증상을 설명하거나 문제가 발생했을 때 스스로를 옹호할 수 없습니다.",
      missionParagraph2: "Ruleout은 이러한 과제에 맞서기 위해 만들어졌습니다.",
      missionParagraph2Sub: "신뢰할 수 있는 연구, 글로벌 가이드라인, 실제 임상 증거를 하나의 지능형 플랫폼으로 통합함으로써 수의사들이 최고의 지식에 즉시 접근하고 자신 있게 적용할 수 있도록 합니다. 수십 개의 출처를 검색할 필요가 없습니다. 추측할 필요도 없습니다. 더 나은 결과를 지원하는 명확하고 신뢰할 수 있는 정보만 있을 뿐입니다.",
      missionParagraph3: "우리는 수의사들이 필요한 도구를 갖추면 동물들이 더 건강하고 안전한 삶을 살 수 있다고 믿습니다. 가족들은 사랑하는 반려동물과 더 많은 시간을 갖게 됩니다. 지역사회는 더 공감하게 됩니다. 그리고 우리가 공유하는 세상은 이 행성에 사는 모든 종을 위해 더 강해집니다.",
      missionParagraph4: "Ruleout은 동물 보호가 의학적 책임일 뿐만 아니라 공유된 인간의 헌신임을 이해하는 사람들을 위해 존재합니다. 우리는 매일 이러한 책임을 지는 수의사들과 반려동물에게 최선을 원하는 보호자들을 지원합니다.",
      missionParagraph5: "모든 클리닉에서 과학에 접근할 수 있고, 기술로 공감적 치료가 강화되며, 동물들이 마땅히 받아야 할 삶의 질을 받을 수 있는 미래를 믿는다면, 우리와 함께하시기 바랍니다. 함께 수의학을 발전시키고, 수많은 생명을 개선하며, 이곳을 ",
      missionParagraph5Bold: "집"
    },
    日本語: {
      heroText: "私たちが愛する動物たちのために",
      futureTitle: "未来のケアは思いやりです",
      futureSubtitle: "私たちは、即座にアクセス可能なエビデンスに基づく知識によって力を得た獣医師に支えられ、動物たちがより健康な生活を送る世界を構築しています。",
      learnMore: "詳しく見る",
      loginTitle: "ログインまたはサインアップ",
      loginSubtitle: "業務用メールアドレスを選択してください。",
      whyNeeded: "なぜ必要ですか？",
      continueGoogle: "Googleで続ける",
      continueMicrosoft: "Microsoftで続ける",
      continueApple: "Appleで続ける",
      continueEmail: "メールアドレスで続ける",
      or: "または",
      missionParagraph1: "重要な獣医学の知識は圧倒的なペースで拡大しています。世界中で何十万もの研究論文、ガイドライン、臨床文書が発表されていますが、これらの情報のほとんどは断片化され、検索が困難で、実際の臨床ニーズの瞬間にアクセスできません。獣医師は、要求の厳しい症例を管理し、プレッシャーの下で生命に関わる決定を下しながら、すべてに対応することが期待されています。そして、ケアを受けている動物は自分の症状を説明したり、何かがうまくいかないときに自分自身を擁護したりすることができません。",
      missionParagraph2: "Ruleoutはこの課題に立ち向かうために作られました。",
      missionParagraph2Sub: "信頼できる研究、グローバルガイドライン、実際の臨床エビデンスを1つのインテリジェントなプラットフォームに統合することで、獣医師が最高の知識に即座にアクセスし、自信を持って適用できるようにします。数十のソースを検索する必要はありません。推測する必要もありません。より良い結果をサポートする明確で信頼できる情報だけです。",
      missionParagraph3: "私たちは、獣医師が必要なツールを持っているとき、動物たちはより健康で安全な生活を送ることができると信じています。家族は愛する仲間とより多くの時間を過ごすことができます。コミュニティはより思いやりのあるものになります。そして、私たちが共有する世界は、この惑星に住むすべての種のためにより強くなります。",
      missionParagraph4: "Ruleoutは、動物の保護が医学的責任であるだけでなく、共有された人間の責務であることを理解している人々のために存在します。私たちは、この責任を毎日担う獣医師と、仲間に最善を尽くしたいケアギバーをサポートします。",
      missionParagraph5: "すべてのクリニックで科学にアクセスでき、思いやりのあるケアが技術によって強化され、動物たちが当然受けるべき生活の質を受けられる未来を信じるなら、私たちと一緒に参加してください。一緒に獣医学を向上させ、無数の命を改善し、ここを呼ぶすべての生き物のためにより健康な惑星を構築しましょう ",
      missionParagraph5Bold: "ホーム。"
    }
  };

  const t = content[language];
  const fullText = t.heroText;

  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100); // 100ms마다 한 글자씩

    return () => clearInterval(typingInterval);
  }, []);

  const handleLogin = () => {
    setShowLoginModal(true);
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      setShowLoginModal(false);
      router.push("/");
    } catch (error) {
      console.error("로그인 실패:", error);
    }
  };

  return (
    <div className={`min-h-screen ${effectiveTheme === "light" ? "bg-white text-gray-900" : "bg-[#1a1a1a] text-white"}`}>
      {/* Toolbar */}
      <Toolbar onLoginClick={handleLogin} />

      {/* Hero Section with Full-width Image */}
      <div className="relative w-full h-[75vh] mt-16">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/image/safari3.jpg"
            alt="Safari background"
            fill
            className="object-cover"
            priority
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Overlay Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-6">
            <h1
              className="text-5xl md:text-6xl font-bold text-white"
              style={{
                fontFamily: "'Reddit Sans', sans-serif",
                textShadow: "0 0 30px rgba(0, 0, 0, 0.8), 0 0 60px rgba(0, 0, 0, 0.6), 0 4px 20px rgba(0, 0, 0, 0.9)"
              }}
            >
              {displayedText}
              <span className="animate-pulse">|</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Second Section - Mission Content */}
      <div className={effectiveTheme === "light" ? "bg-white" : "bg-white"}>
        <div className="max-w-7xl mx-auto px-6 py-20">
          {/* Text Content */}
          <div className="mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold ${effectiveTheme === "light" ? "text-gray-900" : "text-black"} mb-6`} style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
              {t.futureTitle}
            </h2>
            <p className={`text-xl ${effectiveTheme === "light" ? "text-gray-900" : "text-black"} leading-relaxed max-w-4xl`}>
              {t.futureSubtitle}
            </p>
          </div>

          {/* Image */}
          <div className="relative w-full h-[700px] rounded-2xl overflow-hidden">
            <Image
              src="/image/animals.jpg"
              alt="Animals"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* Third Section - Our Mission */}
      <div className={effectiveTheme === "light" ? "bg-white" : "bg-white"}>
        <div className="max-w-7xl mx-auto px-6 pt-8 pb-20">
          <div className="max-w-4xl">
            <p className={`text-xl ${effectiveTheme === "light" ? "text-gray-900" : "text-black"} leading-relaxed mb-8`} style={{ fontFamily: "'Pretendard', sans-serif" }}>
              {t.missionParagraph1}
            </p>

            <p className={`text-xl ${effectiveTheme === "light" ? "text-gray-900" : "text-black"} leading-relaxed mb-8`} style={{ fontFamily: "'Pretendard', sans-serif" }}>
              <strong>{t.missionParagraph2}</strong>
              <br />
              {t.missionParagraph2Sub}
            </p>

            <p className={`text-xl ${effectiveTheme === "light" ? "text-gray-900" : "text-black"} leading-relaxed mb-8`} style={{ fontFamily: "'Pretendard', sans-serif" }}>
              {t.missionParagraph3}
            </p>

            <p className={`text-xl ${effectiveTheme === "light" ? "text-gray-900" : "text-black"} leading-relaxed mb-8`} style={{ fontFamily: "'Pretendard', sans-serif" }}>
              {t.missionParagraph4}
            </p>

            <p className={`text-xl ${effectiveTheme === "light" ? "text-gray-900" : "text-black"} leading-relaxed mb-8`} style={{ fontFamily: "'Pretendard', sans-serif" }}>
              {t.missionParagraph5}<em><strong>{t.missionParagraph5Bold}</strong></em>
            </p>

            {/* Learn More Button */}
            <button className={`px-8 py-3 ${effectiveTheme === "light" ? "bg-gray-900 hover:bg-gray-800" : "bg-black hover:bg-gray-800"} text-white rounded-full transition-colors font-medium`}>
              {t.learnMore}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Login Modal */}
      {showLoginModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className={`${effectiveTheme === "light" ? "bg-white border-gray-200" : "bg-[#1a1a1a] border-gray-700"} rounded-2xl p-8 w-full max-w-md mx-4 relative border`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 닫기 버튼 */}
            <button
              onClick={() => setShowLoginModal(false)}
              className={`absolute top-4 right-4 ${effectiveTheme === "light" ? "text-gray-500 hover:text-gray-700" : "text-gray-400 hover:text-gray-200"}`}
            >
              ✕
            </button>

            {/* Logo and Title */}
            <div className="flex flex-col items-center mb-8">
              <div className="flex items-center space-x-1 mb-6">
                <Image
                  src="/image/clinical4-Photoroom.png"
                  alt="Ruleout Logo"
                  width={36}
                  height={36}
                  className="object-contain"
                />
                <span className={`text-2xl font-bold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>Ruleout</span>
              </div>
              <h2 className={`text-3xl font-bold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"} mb-2`}>
                {t.loginTitle}
              </h2>
              <p className={`${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                {t.loginSubtitle} <a href="#" className="text-[#20808D] hover:underline">{t.whyNeeded}</a>
              </p>
            </div>

            {/* Login Options */}
            <div className="space-y-3">
              {/* Google Login */}
              <button
                onClick={handleGoogleLogin}
                className={`w-full flex items-center justify-center px-6 py-4 border-2 ${effectiveTheme === "light" ? "border-gray-300 hover:border-gray-400 bg-gray-50" : "border-gray-700 hover:border-gray-600 bg-[#2a2a2a]"} rounded-lg transition-colors`}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className={`font-medium ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>{t.continueGoogle}</span>
                </div>
              </button>

              {/* Microsoft Login */}
              <button
                onClick={() => {/* Microsoft 로그인 구현 예정 */}}
                className={`w-full flex items-center justify-center px-6 py-4 border-2 ${effectiveTheme === "light" ? "border-gray-300 hover:border-gray-400 bg-gray-50" : "border-gray-700 hover:border-gray-600 bg-[#2a2a2a]"} rounded-lg transition-colors`}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6" viewBox="0 0 23 23">
                    <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                    <path fill="#f35325" d="M1 1h10v10H1z"/>
                    <path fill="#81bc06" d="M12 1h10v10H12z"/>
                    <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                    <path fill="#ffba08" d="M12 12h10v10H12z"/>
                  </svg>
                  <span className={`font-medium ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>{t.continueMicrosoft}</span>
                </div>
              </button>

              {/* Apple Login */}
              <button
                onClick={() => {/* Apple 로그인 구현 예정 */}}
                className={`w-full flex items-center justify-center px-6 py-4 border-2 ${effectiveTheme === "light" ? "border-gray-300 hover:border-gray-400 bg-gray-50" : "border-gray-700 hover:border-gray-600 bg-[#2a2a2a]"} rounded-lg transition-colors`}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill={effectiveTheme === "light" ? "black" : "white"}>
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <span className={`font-medium ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>{t.continueApple}</span>
                </div>
              </button>

              {/* Divider */}
              <div className="flex items-center my-4">
                <div className={`flex-1 border-t ${effectiveTheme === "light" ? "border-gray-300" : "border-gray-700"}`}></div>
                <span className={`px-4 ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"}`}>{t.or}</span>
                <div className={`flex-1 border-t ${effectiveTheme === "light" ? "border-gray-300" : "border-gray-700"}`}></div>
              </div>

              {/* Email Login */}
              <button
                onClick={() => {/* 이메일 로그인 구현 예정 */}}
                className="w-full px-6 py-4 bg-[#20808D] text-white rounded-lg hover:bg-[#1a6a78] transition-colors font-medium"
              >
                {t.continueEmail}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
