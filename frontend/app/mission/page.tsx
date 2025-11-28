"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Monitor, Sun, Moon, Globe, ChevronDown } from "lucide-react";
import Toolbar from "@/app/components/Toolbar";
import { signInWithGoogle } from "@/lib/auth";
import { useTheme } from "@/contexts/ThemeContext";

export default function MissionPage() {
  const router = useRouter();
  const { themeMode, setThemeMode, effectiveTheme } = useTheme();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const fullText = "For the Animals We Love";
  const [language, setLanguage] = useState("English");

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
              The Future of Care is Compassionate
            </h2>
            <p className={`text-xl ${effectiveTheme === "light" ? "text-gray-900" : "text-black"} leading-relaxed max-w-4xl`}>
              We're building a world where animals live healthier lives, supported by veterinarians empowered with instant, evidence-based knowledge.
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
              Essential veterinary knowledge is expanding at an overwhelming pace. Hundreds of thousands of research papers, guidelines, and clinical documents are published across the world, yet most of this information remains fragmented, difficult to search, and inaccessible at the moment of real clinical need. Veterinarians are expected to keep up with all of it while managing demanding caseloads and making life-critical decisions under pressure. And the animals receiving care cannot explain their symptoms or advocate for themselves when something goes wrong.
            </p>

            <p className={`text-xl ${effectiveTheme === "light" ? "text-gray-900" : "text-black"} leading-relaxed mb-8`} style={{ fontFamily: "'Pretendard', sans-serif" }}>
              <strong>Ruleout was created to confront this challenge.</strong>
              <br />
              By bringing trusted research, global guidelines, and real clinical evidence into one intelligent platform, we make it possible for veterinarians to access the best knowledge instantly and apply it with confidence. No searching across dozens of sources. No guessing. Just clear, reliable information that supports better outcomes.
            </p>

            <p className={`text-xl ${effectiveTheme === "light" ? "text-gray-900" : "text-black"} leading-relaxed mb-8`} style={{ fontFamily: "'Pretendard', sans-serif" }}>
              We believe that when veterinarians have the tools they need, animals live healthier and safer lives. Families gain more time with the companions they love. Communities become more compassionate. And the world we share grows stronger for every species that lives on this planet with us.
            </p>

            <p className={`text-xl ${effectiveTheme === "light" ? "text-gray-900" : "text-black"} leading-relaxed mb-8`} style={{ fontFamily: "'Pretendard', sans-serif" }}>
              Ruleout exists for people who understand that protecting animals is not only a medical responsibility but a shared human commitment. We support the veterinarians who carry this responsibility every day and the caregivers who want the best for their companions.
            </p>

            <p className={`text-xl ${effectiveTheme === "light" ? "text-gray-900" : "text-black"} leading-relaxed mb-8`} style={{ fontFamily: "'Pretendard', sans-serif" }}>
              If you believe in a future where science is accessible to every clinic, where compassionate care is strengthened by technology, and where animals receive the quality of life they deserve, we invite you to join us. Together, we can elevate veterinary medicine, improve countless lives, and help build a healthier planet for every living being that calls it <em><strong>home.</strong></em>
            </p>

            {/* Learn More Button */}
            <button className={`px-8 py-3 ${effectiveTheme === "light" ? "bg-gray-900 hover:bg-gray-800" : "bg-black hover:bg-gray-800"} text-white rounded-full transition-colors font-medium`}>
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={`relative ${effectiveTheme === "light" ? "bg-white" : "bg-[#0a0a0a]"}`}>
        {/* Gradient transition */}
        <div className={`absolute top-0 left-0 right-0 h-32 ${effectiveTheme === "light" ? "bg-gradient-to-b from-white to-white" : "bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]"} pointer-events-none`} />
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
