"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Toolbar from "@/app/components/Toolbar";
import { useTheme } from "@/contexts/ThemeContext";

export default function EnterprisePage() {
  const router = useRouter();
  const { effectiveTheme } = useTheme();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
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
  ];

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
        <div className="absolute inset-0 bg-gradient-to-br from-[#20808D] via-[#4DB8C4] to-[#6dccd7] opacity-90" />

        {/* Blur effects for depth */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#20808D] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-[#4DB8C4] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-[#6dccd7] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <p className="text-white/90 text-lg font-medium mb-4 tracking-wide">FOR ENTERPRISES</p>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6" style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
            Ship faster
          </h1>
          <p className="text-white/90 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Prototype faster, validate early, and ship internal tools and production apps without waiting on engineering.
          </p>
          <button className="px-8 py-4 bg-black text-white text-lg font-semibold rounded-lg hover:bg-gray-900 transition-all duration-200 shadow-2xl hover:shadow-3xl hover:scale-105">
            Book a walkthrough
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
                Build prototypes and production-ready apps fast
              </h2>
              <p className={`text-lg ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"} leading-relaxed`}>
                Turn ideas into clickable prototypes in minutes to speed up alignment, or build production-ready apps that fit your internal workflows.
              </p>
            </div>

            {/* Content Card Container */}
            <div className={`rounded-2xl border ${effectiveTheme === "light" ? "bg-gray-50 border-gray-200" : "bg-[#0d0d0d] border-gray-800"} shadow-xl p-6 md:p-8`}>
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
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className={`${effectiveTheme === "light" ? "bg-gray-50" : "bg-[#0a0a0a]"} py-32`}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className={`text-4xl md:text-6xl font-bold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"} mb-8`} style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
            Ready to transform your workflow?
          </h2>
          <p className={`text-xl ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"} mb-12 max-w-2xl mx-auto`}>
            Join leading veterinary institutions already using Ruleout to accelerate their clinical decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-[#20808D] text-white text-lg font-semibold rounded-lg hover:bg-[#1a6b77] transition-all duration-200 shadow-lg hover:shadow-xl">
              Schedule a demo
            </button>
            <button className={`px-8 py-4 border-2 text-lg font-semibold rounded-lg transition-all duration-200 ${
              effectiveTheme === "light"
                ? "border-gray-300 text-gray-900 hover:border-gray-400 hover:bg-gray-50"
                : "border-gray-700 text-white hover:border-gray-600 hover:bg-[#2a2a2a]"
            }`}>
              Contact sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
