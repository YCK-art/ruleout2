"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Toolbar from "@/app/components/Toolbar";
import Footer from '@/app/components/Footer';
import { signInWithGoogle } from "@/lib/auth";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from '@/contexts/LanguageContext';

export default function CareersPage() {
  const router = useRouter();
  const { effectiveTheme } = useTheme();
  const { language } = useLanguage();
  const [showLoginModal, setShowLoginModal] = useState(false);

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

  const content = {
    English: {
      openRoles: "Open roles",
      heroTitle: "Help us transform veterinary medicine.",
      heroSubtitle: "Your work here will save lives.",
      categories: {
        engineering: "ENGINEERING",
        marketing: "MARKETING",
        clinical: "CLINICAL & RESEARCH"
      },
      jobs: {
        fullStack: {
          title: "Founding Full Stack Engineer",
          type: "Full time",
          location: "Seoul, South Korea",
          workType: "Hybrid"
        },
        contentCreator: {
          title: "Content Creator",
          type: "Full time",
          location: "Remote",
          workType: "Remote"
        },
        clinicalAdvisor: {
          title: "Veterinary Clinical Advisor",
          type: "Part time",
          location: "Remote",
          workType: "Remote"
        }
      },
      applyNow: "Apply now",
      loginTitle: "Log in or Sign up",
      loginSubtitle: "Choose your work email.",
      whyNeeded: "Why is this needed?",
      continueGoogle: "Continue with Google",
      continueMicrosoft: "Continue with Microsoft",
      continueApple: "Continue with Apple",
      continueEmail: "Continue with Email",
      or: "or"
    },
    한국어: {
      openRoles: "채용 공고",
      heroTitle: "수의학을 혁신할 팀에 합류하세요.",
      heroSubtitle: "당신의 일이 생명을 구합니다.",
      categories: {
        engineering: "엔지니어링",
        marketing: "마케팅",
        clinical: "임상 및 연구"
      },
      jobs: {
        fullStack: {
          title: "창업 멤버 풀스택 엔지니어",
          type: "정규직",
          location: "서울, 대한민국",
          workType: "하이브리드"
        },
        contentCreator: {
          title: "콘텐츠 크리에이터",
          type: "정규직",
          location: "원격 근무",
          workType: "원격"
        },
        clinicalAdvisor: {
          title: "수의학 임상 자문위원",
          type: "파트타임",
          location: "원격 근무",
          workType: "원격"
        }
      },
      applyNow: "지원하기",
      loginTitle: "로그인 또는 회원가입",
      loginSubtitle: "업무용 이메일을 선택하세요.",
      whyNeeded: "왜 필요한가요?",
      continueGoogle: "Google로 계속하기",
      continueMicrosoft: "Microsoft로 계속하기",
      continueApple: "Apple로 계속하기",
      continueEmail: "이메일로 계속하기",
      or: "또는"
    },
    日本語: {
      openRoles: "募集職種",
      heroTitle: "獣医学の変革に参加しませんか。",
      heroSubtitle: "あなたの仕事が命を救います。",
      categories: {
        engineering: "エンジニアリング",
        marketing: "マーケティング",
        clinical: "臨床・研究"
      },
      jobs: {
        fullStack: {
          title: "創業メンバー フルスタックエンジニア",
          type: "正社員",
          location: "ソウル、韓国",
          workType: "ハイブリッド"
        },
        contentCreator: {
          title: "コンテンツクリエイター",
          type: "正社員",
          location: "リモート",
          workType: "リモート"
        },
        clinicalAdvisor: {
          title: "獣医臨床アドバイザー",
          type: "パートタイム",
          location: "リモート",
          workType: "リモート"
        }
      },
      applyNow: "応募する",
      loginTitle: "ログインまたはサインアップ",
      loginSubtitle: "業務用メールアドレスを選択してください。",
      whyNeeded: "なぜ必要ですか？",
      continueGoogle: "Googleで続ける",
      continueMicrosoft: "Microsoftで続ける",
      continueApple: "Appleで続ける",
      continueEmail: "メールアドレスで続ける",
      or: "または"
    }
  };

  const t = content[language];

  const jobListings = [
    {
      category: t.categories.engineering,
      positions: [
        {
          title: t.jobs.fullStack.title,
          type: t.jobs.fullStack.type,
          location: t.jobs.fullStack.location,
          workType: t.jobs.fullStack.workType,
          slug: "founding-full-stack-engineer",
        },
      ],
    },
    {
      category: t.categories.marketing,
      positions: [
        {
          title: t.jobs.contentCreator.title,
          type: t.jobs.contentCreator.type,
          location: t.jobs.contentCreator.location,
          workType: t.jobs.contentCreator.workType,
          slug: "content-creator",
        },
      ],
    },
    {
      category: t.categories.clinical,
      positions: [
        {
          title: t.jobs.clinicalAdvisor.title,
          type: t.jobs.clinicalAdvisor.type,
          location: t.jobs.clinicalAdvisor.location,
          workType: t.jobs.clinicalAdvisor.workType,
          slug: "veterinary-clinical-advisor",
        },
      ],
    },
  ];

  return (
    <div className={`min-h-screen ${effectiveTheme === 'dark' ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'}`}>
      {/* Toolbar */}
      <Toolbar onLoginClick={handleLogin} />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-24 pt-32">
        {/* Header Section */}
        <div className="mb-16">
          <p className="text-[#4DB8C4] text-xl font-medium mb-6" style={{ fontFamily: "'TikTok Sans', sans-serif" }}>{t.openRoles}</p>
          <h1 className={`text-4xl md:text-5xl font-bold leading-tight mb-4 ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
            {t.heroTitle}
            <br />
            {t.heroSubtitle}
          </h1>
        </div>

        {/* Job Listings */}
        <div className="space-y-12">
          {jobListings.map((section) => (
            <div key={section.category}>
              {/* Category Header */}
              <h2 className={`text-sm font-semibold uppercase tracking-wider mb-6 pb-4 ${effectiveTheme === 'dark' ? 'text-gray-400 border-b border-gray-800' : 'text-gray-600 border-b border-gray-200'}`}>
                {section.category}
              </h2>

              {/* Positions */}
              <div className="space-y-4">
                {section.positions.map((job, index) => (
                  <div
                    key={index}
                    onClick={() => router.push(`/careers/${job.slug}`)}
                    className={`flex items-center justify-between p-6 rounded-xl transition-all group cursor-pointer ${effectiveTheme === 'dark' ? 'bg-[#1a1a1a] hover:bg-[#252525]' : 'bg-gray-50 hover:bg-gray-100'}`}
                  >
                    <div className="flex-1">
                      {/* Job Title and Badge */}
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className={`text-lg md:text-xl font-semibold group-hover:text-[#4DB8C4] transition-colors ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {job.title}
                        </h3>
                        {/* Badge - Hidden on mobile */}
                        <span className="hidden md:inline-block px-3 py-1 bg-[#20808D]/20 text-[#4DB8C4] text-xs font-medium rounded-full border border-[#20808D]/30">
                          {job.type}
                        </span>
                      </div>

                      {/* Location and Compensation - Hidden on mobile */}
                      <div className={`hidden md:flex items-center gap-4 text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇰🇷</span>
                          <span>{job.location}</span>
                        </div>
                        <span>•</span>
                        <span>{job.workType}</span>
                      </div>
                    </div>

                    {/* Apply Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/careers/${job.slug}`);
                      }}
                      className={`px-4 md:px-5 py-2 text-sm md:text-base font-medium rounded-lg hover:scale-105 transition-all ml-4 md:ml-6 ${effectiveTheme === 'dark' ? 'bg-white text-black hover:bg-gray-300' : 'bg-gray-900 text-white hover:bg-gray-700'}`}
                    >
                      {t.applyNow}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
            className={`rounded-2xl p-8 w-full max-w-md mx-4 relative ${effectiveTheme === 'dark' ? 'bg-[#1a1a1a] border border-gray-700' : 'bg-white border border-gray-200'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLoginModal(false)}
              className={`absolute top-4 right-4 ${effectiveTheme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
            >
              ✕
            </button>

            <div className="flex flex-col items-center mb-8">
              <div className="flex items-center space-x-1 mb-6">
                <Image
                  src="/image/clinical4-Photoroom.png"
                  alt="Ruleout Logo"
                  width={36}
                  height={36}
                  className="object-contain"
                />
                <span className={`text-2xl font-bold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Ruleout</span>
              </div>
              <h2 className={`text-3xl font-bold mb-2 ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t.loginTitle}
              </h2>
              <p className={effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                {t.loginSubtitle} <a href="#" className="text-[#20808D] hover:underline">{t.whyNeeded}</a>
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleGoogleLogin}
                className={`w-full flex items-center justify-center px-6 py-4 border-2 rounded-lg transition-colors ${effectiveTheme === 'dark' ? 'border-gray-700 hover:border-gray-600 bg-[#2a2a2a]' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}`}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className={`font-medium ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t.continueGoogle}</span>
                </div>
              </button>

              <button className={`w-full flex items-center justify-center px-6 py-4 border-2 rounded-lg transition-colors ${effectiveTheme === 'dark' ? 'border-gray-700 hover:border-gray-600 bg-[#2a2a2a]' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}`}>
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6" viewBox="0 0 23 23">
                    <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                    <path fill="#f35325" d="M1 1h10v10H1z"/>
                    <path fill="#81bc06" d="M12 1h10v10H12z"/>
                    <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                    <path fill="#ffba08" d="M12 12h10v10H12z"/>
                  </svg>
                  <span className={`font-medium ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t.continueMicrosoft}</span>
                </div>
              </button>

              <button className={`w-full flex items-center justify-center px-6 py-4 border-2 rounded-lg transition-colors ${effectiveTheme === 'dark' ? 'border-gray-700 hover:border-gray-600 bg-[#2a2a2a]' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}`}>
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill={effectiveTheme === 'dark' ? 'white' : 'black'}>
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <span className={`font-medium ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t.continueApple}</span>
                </div>
              </button>

              <div className="flex items-center my-4">
                <div className={`flex-1 border-t ${effectiveTheme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}></div>
                <span className={`px-4 ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t.or}</span>
                <div className={`flex-1 border-t ${effectiveTheme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}></div>
              </div>

              <button className="w-full px-6 py-4 bg-[#20808D] text-white rounded-lg hover:bg-[#1a6a78] transition-colors font-medium">
                {t.continueEmail}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
