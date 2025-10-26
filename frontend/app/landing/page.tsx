"use client";

import { useState } from "react";
import { ChevronDown, ArrowRight, BookText, Pill, Stethoscope, ArrowUpRight, Heart, Activity, Microscope, Beaker, Pill as PillIcon, Brain } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signInWithGoogle } from "@/lib/auth";

export default function LandingPage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLogin = () => {
    // 로그인 모달 열기
    setShowLoginModal(true);
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      // 로그인 성공 시 홈으로 이동
      setShowLoginModal(false);
      router.push("/");
    } catch (error) {
      console.error("로그인 실패:", error);
      // 에러 처리 (필요시 사용자에게 알림)
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    // 질문과 함께 홈으로 이동
    router.push("/");
  };

  const handleQuestionClick = (q: string) => {
    // 질문 클릭 시 홈으로 이동
    router.push("/");
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
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Toolbar */}
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* 로고 */}
            <div className="flex items-center space-x-1">
              <Image
                src="/image/medical2.png"
                alt="Medical Logo"
                width={36}
                height={36}
                className="object-contain"
              />
              <span className="text-xl font-semibold">Medical</span>
            </div>

            {/* 네비게이션 메뉴 */}
            <div className="hidden md:flex items-center space-x-8">
              <button className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors">
                <span>플랫폼</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <button className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors">
                <span>솔루션</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <button className="text-gray-300 hover:text-white transition-colors">
                <span>플랜</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors">
                <span>자료</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* 우측 버튼들 */}
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 text-gray-300 hover:text-white transition-colors border border-gray-700 rounded-lg hover:border-gray-600">
                영업 문의
              </button>
              <button
                onClick={handleLogin}
                className="px-4 py-2 bg-white text-black rounded-lg hover:bg-orange-500 hover:text-white transition-colors font-medium"
              >
                Medical 시작하기
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* 왼쪽: 텍스트 및 입력 */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-6xl font-bold leading-tight">
                당신의 의료 파트너를
                <br />
                만나보세요
              </h1>
              <p className="text-xl text-gray-400">
                Medical과 함께 복잡한 임상 문제를 해결하세요.
              </p>
            </div>

            {/* 검색 입력창 */}
            <form onSubmit={handleSubmit} className="w-full mb-6">
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
            <div className="w-full">
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
                        onClick={() => handleQuestionClick(q)}
                        className="w-full group flex items-center justify-between px-5 py-4 bg-[#2a2a2a] border border-gray-700 rounded-lg hover:border-gray-600 transition-all text-left"
                      >
                        <span className="text-sm text-gray-200 pr-4">{q}</span>
                        <ArrowUpRight className="w-4 h-4 flex-shrink-0 text-gray-500 group-hover:text-primary transition-colors" />
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽: 일러스트레이션 영역 */}
          <div className="relative h-96 flex items-center justify-center bg-[#1a1a1a] rounded-lg">
            <Image
              src="/image/brain-Photoroom.png"
              alt="Brain Animation"
              width={400}
              height={400}
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* Partners Section */}
      <div className="bg-[#212121] py-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* 헤더 */}
          <div className="text-center mb-16">
            <p className="text-orange-400 text-2xl font-semibold mb-4" style={{ fontFamily: 'Pretendard' }}>Partners</p>
            <h2 className="text-3xl font-bold mb-4">
              Medical은 다양한 파트너사들과 함께
            </h2>
            <h2 className="text-3xl font-bold text-gray-400">
              새로운 가능성을 만들어 나가고 있습니다.
            </h2>
          </div>

          {/* 파트너 로고 그리드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 items-center">
            {/* 첫 번째 줄 */}
            <div className="flex items-center justify-center h-24 bg-[#2a2a2a] rounded-lg p-4">
              <Image
                src="/image/stmary.png"
                alt="St. Mary's Hospital"
                width={150}
                height={60}
                className="object-contain"
              />
            </div>
            <div className="flex items-center justify-center h-24 bg-[#2a2a2a] rounded-lg p-4">
              <Image
                src="/image/samsung.webp"
                alt="Samsung Medical Center"
                width={150}
                height={60}
                className="object-contain"
              />
            </div>
            <div className="flex items-center justify-center h-24 bg-[#2a2a2a] rounded-lg p-4">
              <Image
                src="/image/asan.svg"
                alt="Asan Medical Center"
                width={150}
                height={60}
                className="object-contain"
              />
            </div>
            <div className="flex items-center justify-center h-24 bg-[#2a2a2a] rounded-lg p-4">
              <Image
                src="/image/severance.svg"
                alt="Severance Hospital"
                width={150}
                height={60}
                className="object-contain"
              />
            </div>

            {/* 두 번째 줄 */}
            <div className="flex items-center justify-center h-24 bg-[#2a2a2a] rounded-lg">
              <span className="text-gray-500 text-sm">Partner Logo 5</span>
            </div>
            <div className="flex items-center justify-center h-24 bg-[#2a2a2a] rounded-lg">
              <span className="text-gray-500 text-sm">Partner Logo 6</span>
            </div>
            <div className="flex items-center justify-center h-24 bg-[#2a2a2a] rounded-lg">
              <span className="text-gray-500 text-sm">Partner Logo 7</span>
            </div>
            <div className="flex items-center justify-center h-24 bg-[#2a2a2a] rounded-lg">
              <span className="text-gray-500 text-sm">Partner Logo 8</span>
            </div>
          </div>
        </div>
      </div>

      {/* 로그인 모달 */}
      {showLoginModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className="bg-[#1a1a1a] rounded-2xl p-8 w-full max-w-md mx-4 relative border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 닫기 버튼 */}
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
            >
              ✕
            </button>

            {/* 로고 및 타이틀 */}
            <div className="flex flex-col items-center mb-8">
              <div className="flex items-center space-x-1 mb-6">
                <Image
                  src="/image/medical2.png"
                  alt="Medical Logo"
                  width={36}
                  height={36}
                  className="object-contain"
                />
                <span className="text-2xl font-bold text-white">Medical</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                로그인 또는 회원가입
              </h2>
              <p className="text-gray-400">
                업무용 이메일을 선택하세요. <a href="#" className="text-orange-400 hover:underline">왜 필요한가요?</a>
              </p>
            </div>

            {/* 로그인 옵션들 */}
            <div className="space-y-3">
              {/* Google 로그인 */}
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center px-6 py-4 border-2 border-gray-700 rounded-lg hover:border-gray-600 transition-colors bg-[#2a2a2a]"
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-white font-medium">Google로 계속하기</span>
                </div>
              </button>

              {/* 카카오톡 로그인 */}
              <button
                onClick={() => {/* 카카오 로그인 구현 예정 */}}
                className="w-full flex items-center justify-center px-6 py-4 border-2 border-gray-700 rounded-lg hover:border-gray-600 transition-colors bg-[#2a2a2a]"
              >
                <div className="flex items-center space-x-3">
                  <Image
                    src="/image/kakao.svg"
                    alt="Kakao Logo"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                  <span className="text-white font-medium">카카오톡으로 계속하기</span>
                </div>
              </button>

              {/* 구분선 */}
              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-gray-700"></div>
                <span className="px-4 text-gray-400">또는</span>
                <div className="flex-1 border-t border-gray-700"></div>
              </div>

              {/* 이메일 로그인 */}
              <button
                onClick={() => {/* 이메일 로그인 구현 예정 */}}
                className="w-full px-6 py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                이메일로 계속하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
