"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ArrowRight, BookText, Pill, Stethoscope, ArrowUpRight, Heart, Activity, Microscope, Beaker, Pill as PillIcon, Brain, Monitor, Sun, Moon, Globe } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signInWithGoogle } from "@/lib/auth";
import Toolbar from "@/app/components/Toolbar";
import { getAllBlogPosts, BlogPost } from "@/lib/blogService";
import { useTheme } from "@/contexts/ThemeContext";

// FAQ Item Component
function FAQItem({ question, answer, theme }: { question: string; answer: string; theme: "light" | "dark" }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`border-b ${theme === "light" ? "border-gray-200" : "border-gray-800"}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left hover:text-[#4DB8C4] transition-colors group"
      >
        <span className={`text-lg md:text-xl font-medium ${theme === "light" ? "text-gray-900" : "text-white"} group-hover:text-[#4DB8C4] transition-colors`}>
          {question}
        </span>
        <ChevronDown
          className={`w-6 h-6 ${theme === "light" ? "text-gray-500" : "text-gray-400"} transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96 pb-6" : "max-h-0"
        }`}
      >
        <p className={`${theme === "light" ? "text-gray-600" : "text-gray-400"} leading-relaxed max-w-3xl`}>{answer}</p>
      </div>
    </div>
  );
}

// Carousel Content Component
function CarouselContent({ effectiveTheme }: { effectiveTheme: "light" | "dark" }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Comprehensive guideline database",
      description: "Access thousands of peer-reviewed clinical guidelines updated regularly with the latest veterinary research."
    },
    {
      title: "Evidence-based decision support",
      description: "Make confident clinical decisions with AI-powered recommendations backed by the latest medical literature."
    },
    {
      title: "Instant reference lookup",
      description: "Find relevant treatment protocols and diagnostic criteria in seconds, streamlining your clinical workflow."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
      {/* Left: Description Text */}
      <div className="lg:col-span-2 space-y-6 pt-4">
        <div className="min-h-[100px]">
          <h3 className={`text-xl font-semibold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"} mb-3 transition-opacity duration-500`}>
            {slides[currentSlide].title}
          </h3>
          <p className={`text-sm ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"} leading-relaxed mb-4 transition-opacity duration-500`}>
            {slides[currentSlide].description}
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
  );
}

export default function LandingPage() {
  const router = useRouter();
  const { themeMode, setThemeMode, effectiveTheme } = useTheme();
  const [question, setQuestion] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [language, setLanguage] = useState("English");
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(true);

  // Fetch blog posts on mount
  useEffect(() => {
    const fetchBlogPosts = async () => {
      setIsLoadingBlogs(true);
      const posts = await getAllBlogPosts();
      setBlogPosts(posts.slice(0, 4)); // Get only first 4 posts
      setIsLoadingBlogs(false);
    };
    fetchBlogPosts();
  }, []);

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
    // 질문과 함께 메인 앱으로 이동 (guest 모드)
    router.push(`/?q=${encodeURIComponent(question)}&guest=true`);
  };

  const handleQuestionClick = (q: string) => {
    // 질문 클릭 시 메인 앱으로 이동 (guest 모드)
    router.push(`/?q=${encodeURIComponent(q)}&guest=true`);
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
    <div className={`min-h-screen ${effectiveTheme === "light" ? "bg-white text-gray-900" : "bg-[#1a1a1a] text-white"}`}>
      {/* Toolbar */}
      <Toolbar onLoginClick={handleLogin} />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-24 pt-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* 왼쪽: 텍스트 및 입력 */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`} style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
                Science Behind Every
                <br />
                Animal Diagnosis
              </h1>
              <p className={`text-base sm:text-lg md:text-xl ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"}`} style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
                Empower veterinarians to make faster, smarter decisions
              </p>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSubmit} className="w-full max-w-2xl mb-6">
              <div className={`flex items-center ${effectiveTheme === "light" ? "bg-gray-50 border-gray-300" : "bg-[#2a2a2a] border-gray-700"} rounded-2xl border px-6 pr-2 py-3`}>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a medical question..."
                  className={`flex-1 bg-transparent outline-none ${effectiveTheme === "light" ? "text-gray-900 placeholder-gray-400" : "text-white placeholder-gray-500"}`}
                />
                <button
                  type="submit"
                  className="w-10 h-10 flex items-center justify-center bg-[#20808D] rounded-full transition-all duration-200 hover:shadow-[0_0_20px_rgba(32,128,141,0.4)] hover:brightness-110"
                >
                  <ArrowRight className="w-5 h-5 text-white" />
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
                      className={`flex items-center space-x-2 px-4 py-2 ${effectiveTheme === "light" ? "bg-gray-50 border-gray-300 hover:border-gray-400" : "bg-[#2a2a2a] border-gray-700 hover:border-gray-600"} border rounded-lg transition-colors`}
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
                        className={`w-full group flex items-center justify-between px-5 py-4 ${effectiveTheme === "light" ? "bg-gray-50 border-gray-300 hover:border-gray-400" : "bg-[#2a2a2a] border-gray-700 hover:border-gray-600"} border rounded-lg transition-all text-left`}
                      >
                        <span className={`text-sm ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-200"} pr-4`}>{q}</span>
                        <ArrowUpRight className="w-4 h-4 flex-shrink-0 text-gray-500 group-hover:text-[#20808D] transition-colors" />
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽: 일러스트레이션 영역 */}
          <div className={`relative h-96 flex items-center justify-center ${effectiveTheme === "light" ? "bg-gray-100" : "bg-[#1a1a1a]"} rounded-lg pt-24`}>
            <Image
              src="/image/cat.png"
              alt="Cat"
              width={300}
              height={300}
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* Partners Section */}
      <div className={`${effectiveTheme === "light" ? "bg-gray-50" : "bg-[#212121]"} py-20`}>
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-[#20808D] text-2xl font-semibold mb-4" style={{ fontFamily: "'TikTok Sans', sans-serif" }}>Partners</p>
            <h2 className={`text-3xl font-bold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"} mb-6`} style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
              Ruleout is a leading veterinary medicine platform
            </h2>
          </div>

          {/* 파트너 로고 그리드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 items-center">
            {/* 첫 번째 줄 */}
            <div className={`flex items-center justify-center h-24 ${effectiveTheme === "light" ? "bg-white border border-gray-200" : "bg-[#2a2a2a]"} rounded-lg p-4`}>
              <Image
                src="/image/stmary.png"
                alt="St. Mary's Hospital"
                width={150}
                height={60}
                className="object-contain"
              />
            </div>
            <div className={`flex items-center justify-center h-24 ${effectiveTheme === "light" ? "bg-white border border-gray-200" : "bg-[#2a2a2a]"} rounded-lg p-4`}>
              <Image
                src="/image/asan.svg"
                alt="Asan Medical Center"
                width={150}
                height={60}
                className="object-contain"
              />
            </div>
            <div className={`flex items-center justify-center h-24 ${effectiveTheme === "light" ? "bg-white border border-gray-200" : "bg-[#2a2a2a]"} rounded-lg p-4`}>
              <Image
                src="/image/severance.svg"
                alt="Severance Hospital"
                width={150}
                height={60}
                className="object-contain"
              />
            </div>
            <div className={`flex items-center justify-center h-24 ${effectiveTheme === "light" ? "bg-white border border-gray-200" : "bg-[#2a2a2a]"} rounded-lg p-4`}>
              <Image
                src="/image/hanyang.svg"
                alt="Hanyang University Hospital"
                width={150}
                height={60}
                className="object-contain"
              />
            </div>

            {/* 두 번째 줄 */}
            <div className={`flex items-center justify-center h-24 ${effectiveTheme === "light" ? "bg-white border border-gray-200" : "bg-[#2a2a2a]"} rounded-lg p-4`}>
              <Image
                src="/image/snuh.svg"
                alt="Seoul National University Hospital"
                width={150}
                height={60}
                className="object-contain"
              />
            </div>
            <div className={`flex items-center justify-center h-24 ${effectiveTheme === "light" ? "bg-white border border-gray-200" : "bg-[#2a2a2a]"} rounded-lg p-4`}>
              <Image
                src="/image/knuh.svg"
                alt="Kyungpook National University Hospital"
                width={150}
                height={60}
                className="object-contain"
              />
            </div>
            <div className={`flex items-center justify-center h-24 ${effectiveTheme === "light" ? "bg-white border border-gray-200" : "bg-[#2a2a2a]"} rounded-lg p-4`}>
              <Image
                src="/image/ajou.svg"
                alt="Ajou University Hospital"
                width={150}
                height={60}
                className="object-contain"
              />
            </div>
            <div className={`flex items-center justify-center h-24 ${effectiveTheme === "light" ? "bg-white border border-gray-200" : "bg-[#2a2a2a]"} rounded-lg p-4`}>
              <Image
                src="/image/korea.svg"
                alt="Korea University Hospital"
                width={150}
                height={60}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className={`${effectiveTheme === "light" ? "bg-white" : "bg-[#1a1a1a]"} py-20`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* 왼쪽: 비디오 */}
            <div className={`relative rounded-2xl overflow-hidden ${effectiveTheme === "light" ? "bg-gray-50 border-gray-200" : "bg-[#0d1117] border-gray-800"} border shadow-2xl`}>
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto"
              >
                <source src="/image/features.mp4" type="video/mp4" />
              </video>
            </div>

            {/* 오른쪽: 텍스트 */}
            <div className="space-y-6">
              <h2 className={`text-3xl font-bold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`} style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
                Clinically intelligent, Instantly responsive.
              </h2>
              <p className={`text-xl ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"} leading-relaxed`} style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
                Our model delivers veterinary answers with remarkable speed and medical precision.
              </p>
              <button className="flex items-center space-x-2 text-[#20808D] hover:text-[#2a9fad] transition-colors group">
                <span className="text-lg font-medium">Learn about Features</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* New Carousel Section */}
      <div className={`${effectiveTheme === "light" ? "bg-gray-50" : "bg-[#0a0a0a]"} py-32`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-16">
            {/* Title and Description - Left Aligned */}
            <div className="max-w-3xl">
              <h2 className={`text-3xl font-bold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"} mb-6`} style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
                Advanced clinical insights at your fingertips
              </h2>
              <p className={`text-lg ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"} leading-relaxed`}>
                Access evidence-based guidelines and treatment protocols instantly, helping you make confident clinical decisions with comprehensive reference support.
              </p>
            </div>

            {/* Content Card Container */}
            <div className={`rounded-2xl border ${effectiveTheme === "light" ? "bg-white border-gray-200" : "bg-[#1a1a1a] border-gray-800"} shadow-xl p-6 md:p-8`}>
              <CarouselContent effectiveTheme={effectiveTheme} />
            </div>
          </div>
        </div>
      </div>

      {/* Features2 Section */}
      <div className={`${effectiveTheme === "light" ? "bg-white" : "bg-[#1a1a1a]"} py-20`}>
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <h2 className={`text-3xl font-semibold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`} style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
              Built for veterinary excellence
            </h2>
          </div>

          {/* 3 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className={`${effectiveTheme === "light" ? "bg-white border-gray-200 hover:border-gray-300" : "bg-[#1a1a1a] border-gray-800 hover:border-gray-700"} rounded-xl p-6 border transition-colors flex flex-col`}>
              <div className="flex-1">
                <h3 className={`text-base ${effectiveTheme === "light" ? "text-gray-900" : "text-white"} mb-3`}>
                  Trained on Leading veterinary journals
                </h3>
                <p className={`text-base ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"} leading-relaxed mb-4`}>
                  Our AI is built on extensive clinical research, providing expert insight you can trust.
                </p>
                <button className="flex items-center space-x-2 text-[#4DB8C4] hover:text-[#6dccd7] transition-colors group">
                  <span className="text-sm font-medium">Explore knowledge</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>

              {/* Image */}
              <div className={`mt-6 w-full h-64 rounded-lg overflow-hidden border ${effectiveTheme === "light" ? "border-gray-200" : "border-gray-800"}`}>
                <Image
                  src="/image/paper.png"
                  alt="Veterinary Research Papers"
                  width={400}
                  height={256}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Card 2 */}
            <div className={`${effectiveTheme === "light" ? "bg-white border-gray-200 hover:border-gray-300" : "bg-[#1a1a1a] border-gray-800 hover:border-gray-700"} rounded-xl p-6 border transition-colors flex flex-col`}>
              <div className="flex-1">
                <h3 className={`text-base ${effectiveTheme === "light" ? "text-gray-900" : "text-white"} mb-3`}>
                  Made for vets to use
                </h3>
                <p className={`text-base ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"} leading-relaxed mb-4`}>
                  Built for real clinical work, our AI delivers fast and precise understanding.
                </p>
                <button className="flex items-center space-x-2 text-[#4DB8C4] hover:text-[#6dccd7] transition-colors group">
                  <span className="text-sm font-medium">Learn more</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>

              {/* Image */}
              <div className={`mt-6 w-full h-64 rounded-lg overflow-hidden border ${effectiveTheme === "light" ? "border-gray-200" : "border-gray-800"}`}>
                <Image
                  src="/image/vets.jpeg"
                  alt="Veterinarians at work"
                  width={400}
                  height={256}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Card 3 */}
            <div className={`${effectiveTheme === "light" ? "bg-white border-gray-200 hover:border-gray-300" : "bg-[#1a1a1a] border-gray-800 hover:border-gray-700"} rounded-xl p-6 border transition-colors flex flex-col`}>
              <div className="flex-1">
                <h3 className={`text-base ${effectiveTheme === "light" ? "text-gray-900" : "text-white"} mb-3`}>
                  For every animal&apos;s health and dignity
                </h3>
                <p className={`text-base ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"} leading-relaxed mb-4`}>
                  Empowering better care and advancing animal welfare through intelligent medicine.
                </p>
                <button
                  onClick={() => router.push('/mission')}
                  className="flex items-center space-x-2 text-[#4DB8C4] hover:text-[#6dccd7] transition-colors group"
                >
                  <span className="text-sm font-medium">See our mission</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>

              {/* Image */}
              <div className={`mt-6 w-full h-64 rounded-lg overflow-hidden border ${effectiveTheme === "light" ? "border-gray-200" : "border-gray-800"}`}>
                <Image
                  src="/image/welfare.webp"
                  alt="Animal Welfare"
                  width={400}
                  height={256}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Section */}
      <div className={`${effectiveTheme === "light" ? "bg-white" : "bg-[#0a0a0a]"} py-20`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left: Header */}
            <div className="lg:col-span-3">
              <h2 className={`text-3xl font-semibold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"} sticky top-8`} style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
                Recent highlights
              </h2>
            </div>

            {/* Right: Blog Posts */}
            <div className="lg:col-span-9">
              <div className="space-y-4">
                {isLoadingBlogs ? (
                  // Loading state
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`${effectiveTheme === "light" ? "bg-gray-50 border-gray-200" : "bg-[#0d0d0d] border-gray-800"} rounded-xl p-6 border animate-pulse`}>
                        <div className={`h-6 ${effectiveTheme === "light" ? "bg-gray-200" : "bg-gray-800"} rounded w-3/4 mb-2`}></div>
                        <div className={`h-4 ${effectiveTheme === "light" ? "bg-gray-200" : "bg-gray-800"} rounded w-full mb-1`}></div>
                        <div className={`h-4 ${effectiveTheme === "light" ? "bg-gray-200" : "bg-gray-800"} rounded w-2/3 mb-3`}></div>
                        <div className={`h-3 ${effectiveTheme === "light" ? "bg-gray-200" : "bg-gray-800"} rounded w-1/4`}></div>
                      </div>
                    ))}
                  </div>
                ) : blogPosts.length > 0 ? (
                  // Display actual blog posts
                  blogPosts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => router.push(`/blog/${post.slug}`)}
                      className={`group cursor-pointer ${effectiveTheme === "light" ? "bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300" : "bg-[#0d0d0d] hover:bg-[#151515] border-gray-800 hover:border-gray-700"} rounded-xl p-6 border transition-all duration-200`}
                    >
                      <h3 className={`text-lg font-semibold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"} mb-2 group-hover:text-[#4DB8C4] transition-colors`}>
                        {post.title}
                      </h3>
                      {post.subtitle && (
                        <p className={`${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"} mb-3 leading-relaxed text-sm`}>
                          {post.subtitle}
                        </p>
                      )}
                      <p className={`text-xs ${effectiveTheme === "light" ? "text-gray-500" : "text-gray-500"}`}>
                        {post.category} · {post.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  ))
                ) : (
                  // No posts found
                  <div className={`${effectiveTheme === "light" ? "bg-gray-50 border-gray-200" : "bg-[#0d0d0d] border-gray-800"} rounded-xl p-6 border text-center`}>
                    <p className={`${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"}`}>No blog posts available yet.</p>
                  </div>
                )}
              </div>

              {/* View More Link */}
              <div className="mt-10">
                <button
                  onClick={() => router.push('/blog')}
                  className="flex items-center space-x-2 text-[#4DB8C4] hover:text-[#6dccd7] transition-colors group"
                >
                  <span className="text-base font-medium">View more posts</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className={`${effectiveTheme === "light" ? "bg-gray-50" : "bg-[#1a1a1a]"} py-24`}>
        <div className="max-w-5xl mx-auto px-6">
          <h2 className={`text-3xl md:text-4xl font-bold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"} mb-12`} style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
            Frequently asked questions
          </h2>

          <div className="space-y-4">
            {[
              {
                question: "What veterinary guidelines are included in Ruleout?",
                answer: "Ruleout includes comprehensive clinical guidelines from major veterinary associations worldwide, covering companion animals, exotic species, and emergency medicine. Our database is continuously updated with the latest evidence-based recommendations."
              },
              {
                question: "Who is Ruleout for?",
                answer: "Ruleout is designed for veterinarians, veterinary technicians, and veterinary students who need quick, reliable access to clinical guidelines during patient care. It's perfect for busy practices, emergency clinics, and educational settings."
              },
              {
                question: "Is Ruleout free?",
                answer: "Ruleout offers a free tier with access to essential guidelines. Premium plans provide unlimited searches, advanced filtering, and access to our complete guideline library with regular updates."
              },
              {
                question: "How accurate are the clinical guidelines?",
                answer: "All guidelines in Ruleout are sourced directly from official veterinary medical associations and peer-reviewed publications. We maintain strict quality control and update our database regularly to ensure clinical accuracy."
              },
              {
                question: "What search capabilities does Ruleout offer?",
                answer: "Ruleout uses advanced AI to understand your clinical queries in natural language. You can search by symptoms, diagnosis, species, or treatment protocols, and get instant, relevant guideline recommendations with citations."
              },
              {
                question: "Can I access Ruleout on mobile devices?",
                answer: "Yes! Ruleout is fully responsive and works seamlessly on smartphones, tablets, and desktop computers. Access critical guidelines anywhere in your clinic or on the go."
              }
            ].map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} theme={effectiveTheme} />
            ))}
          </div>
        </div>
      </div>

      {/* Banner Section */}
      <div className={`${effectiveTheme === "light" ? "bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50" : "bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]"} py-32`}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className={`text-7xl md:text-8xl font-bold mb-16 ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`} style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
            Try Ruleout Now
          </h2>
          <button className="group relative px-8 py-3 bg-white text-black text-base font-semibold rounded-full hover:bg-[#4DB8C4] hover:text-white transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-[#4DB8C4]/20 overflow-hidden">
            <span className="relative z-10 flex items-center justify-center space-x-2">
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className={`relative ${effectiveTheme === "light" ? "bg-white" : "bg-[#0a0a0a]"}`}>
        {/* Gradient transition */}
        <div className={`absolute top-0 left-0 right-0 h-32 ${effectiveTheme === "light" ? "bg-gradient-to-b from-gray-100 to-white" : "bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]"} pointer-events-none`} />
        <div className="max-w-7xl mx-auto px-6 py-16 relative">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-12">
            {/* Product Column */}
            <div>
              <h3 className={`${effectiveTheme === "light" ? "text-gray-900" : "text-white"} font-semibold mb-4`}>Product</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-[#4DB8C4]" : "text-gray-400 hover:text-[#4DB8C4]"} transition-colors`}>
                    Features
                  </a>
                </li>
                <li>
                  <button onClick={() => router.push('/pricing')} className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-[#4DB8C4]" : "text-gray-400 hover:text-[#4DB8C4]"} transition-colors`}>
                    Pricing
                  </button>
                </li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h3 className={`${effectiveTheme === "light" ? "text-gray-900" : "text-white"} font-semibold mb-4`}>Resources</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-[#4DB8C4]" : "text-gray-400 hover:text-[#4DB8C4]"} transition-colors`}>
                    Documentation
                  </a>
                </li>
                <li>
                  <button onClick={() => router.push('/blog')} className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-[#4DB8C4]" : "text-gray-400 hover:text-[#4DB8C4]"} transition-colors`}>
                    Blog
                  </button>
                </li>
                <li>
                  <a href="#" className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-[#4DB8C4]" : "text-gray-400 hover:text-[#4DB8C4]"} transition-colors`}>
                    Support
                  </a>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className={`${effectiveTheme === "light" ? "text-gray-900" : "text-white"} font-semibold mb-4`}>Company</h3>
              <ul className="space-y-3">
                <li>
                  <button onClick={() => router.push('/mission')} className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-[#4DB8C4]" : "text-gray-400 hover:text-[#4DB8C4]"} transition-colors`}>
                    Mission
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/careers')} className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-[#4DB8C4]" : "text-gray-400 hover:text-[#4DB8C4]"} transition-colors`}>
                    Careers
                  </button>
                </li>
                <li>
                  <a href="#" className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-[#4DB8C4]" : "text-gray-400 hover:text-[#4DB8C4]"} transition-colors`}>
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h3 className={`${effectiveTheme === "light" ? "text-gray-900" : "text-white"} font-semibold mb-4`}>Legal</h3>
              <ul className="space-y-3">
                <li>
                  <button onClick={() => router.push('/terms')} className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-[#4DB8C4]" : "text-gray-400 hover:text-[#4DB8C4]"} transition-colors`}>
                    Terms of Use
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/privacy')} className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-[#4DB8C4]" : "text-gray-400 hover:text-[#4DB8C4]"} transition-colors`}>
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/security')} className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-[#4DB8C4]" : "text-gray-400 hover:text-[#4DB8C4]"} transition-colors`}>
                    Security
                  </button>
                </li>
              </ul>
            </div>

            {/* Connect Column */}
            <div>
              <h3 className={`${effectiveTheme === "light" ? "text-gray-900" : "text-white"} font-semibold mb-4`}>Connect</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-[#4DB8C4]" : "text-gray-400 hover:text-[#4DB8C4]"} transition-colors`}>
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-[#4DB8C4]" : "text-gray-400 hover:text-[#4DB8C4]"} transition-colors`}>
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="#" className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-[#4DB8C4]" : "text-gray-400 hover:text-[#4DB8C4]"} transition-colors`}>
                    YouTube
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className={`pt-8 border-t ${effectiveTheme === "light" ? "border-gray-200" : "border-gray-800"} flex flex-col md:flex-row items-center justify-between gap-4`}>
            {/* Left: Copyright */}
            <p className={`${effectiveTheme === "light" ? "text-gray-500" : "text-gray-500"} text-sm`}>
              © 2025 Ruleout. All rights reserved.
            </p>

            {/* Right: Theme Selector & Language */}
            <div className="flex items-center gap-4">
              {/* Theme Selector */}
              <div className={`flex items-center ${effectiveTheme === "light" ? "bg-gray-100 border-gray-200" : "bg-[#1a1a1a] border-gray-800"} rounded-lg p-1 border`}>
                <button
                  onClick={() => setThemeMode("system")}
                  className={`p-2 rounded transition-colors ${
                    themeMode === "system"
                      ? effectiveTheme === "light" ? "bg-white text-gray-900 shadow-sm" : "bg-gray-700 text-white"
                      : effectiveTheme === "light" ? "text-gray-500 hover:text-gray-900" : "text-gray-400 hover:text-white"
                  }`}
                  title="System"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setThemeMode("light")}
                  className={`p-2 rounded transition-colors ${
                    themeMode === "light"
                      ? effectiveTheme === "light" ? "bg-white text-gray-900 shadow-sm" : "bg-gray-700 text-white"
                      : effectiveTheme === "light" ? "text-gray-500 hover:text-gray-900" : "text-gray-400 hover:text-white"
                  }`}
                  title="Light"
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setThemeMode("dark")}
                  className={`p-2 rounded transition-colors ${
                    themeMode === "dark"
                      ? effectiveTheme === "light" ? "bg-white text-gray-900 shadow-sm" : "bg-gray-700 text-white"
                      : effectiveTheme === "light" ? "text-gray-500 hover:text-gray-900" : "text-gray-400 hover:text-white"
                  }`}
                  title="Dark"
                >
                  <Moon className="w-4 h-4" />
                </button>
              </div>

              {/* Language Selector */}
              <div className="relative">
                <button className={`flex items-center gap-2 px-3 py-2 ${effectiveTheme === "light" ? "bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-900" : "bg-[#1a1a1a] border-gray-800 text-gray-400 hover:text-white"} rounded-lg border transition-colors`}>
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">{language}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* 로그인 모달 */}
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
                Log in or Sign up
              </h2>
              <p className={`${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                Choose your work email. <a href="#" className="text-[#20808D] hover:underline">Why is this needed?</a>
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
                  <span className={`font-medium ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>Continue with Google</span>
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
                  <span className={`font-medium ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>Continue with Microsoft</span>
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
                  <span className={`font-medium ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>Continue with Apple</span>
                </div>
              </button>

              {/* Divider */}
              <div className="flex items-center my-4">
                <div className={`flex-1 border-t ${effectiveTheme === "light" ? "border-gray-300" : "border-gray-700"}`}></div>
                <span className={`px-4 ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"}`}>or</span>
                <div className={`flex-1 border-t ${effectiveTheme === "light" ? "border-gray-300" : "border-gray-700"}`}></div>
              </div>

              {/* Email Login */}
              <button
                onClick={() => {/* 이메일 로그인 구현 예정 */}}
                className="w-full px-6 py-4 bg-[#20808D] text-white rounded-lg hover:bg-[#1a6a78] transition-colors font-medium"
              >
                Continue with Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
