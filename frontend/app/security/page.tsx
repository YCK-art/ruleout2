"use client";

import { useState } from "react";
import { Shield, Lock, Cloud, Search, Smartphone, FileText, Award, AlertTriangle, Monitor, Sun, Moon, Globe, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Toolbar from "@/app/components/Toolbar";
import { signInWithGoogle } from "@/lib/auth";

export default function SecurityPage() {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [themeMode, setThemeMode] = useState<"system" | "light" | "dark">("dark");
  const [language, setLanguage] = useState("English");

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

  const securityFeatures = [
    {
      icon: Lock,
      title: "Encryption of sensitive data",
      description: "We encrypt your data using AES-256, the gold standard in encryption technology and safeguard passwords using secure cryptographic hash (SHA-256).",
    },
    {
      icon: Cloud,
      title: "Trusted cloud security",
      description: "We leverage industry-leading cloud providers to ensure your data is safe. This means global accessibility with enterprise-grade protection.",
    },
    {
      icon: Search,
      title: "Penetration testing and scanning",
      description: "We conduct annual third-party penetration tests and share results via our Trust center. Weekly scans keep our product resilient against vulnerabilities.",
    },
    {
      icon: Smartphone,
      title: "Endpoint security",
      description: "We ensure our devices run the latest OS and app versions within a month of release, with security updates applied as soon as available.",
    },
  ];

  const complianceItems = [
    { name: "SOC 2", type: "TYPE I" },
    { name: "SOC 2", type: "TYPE II" },
    { name: "PRIVACY", type: "LAW" },
  ];

  const securityThreatItems = [
    {
      icon: FileText,
      title: "Responsible vulnerability disclosure",
      description: "Our policy encourages ethical reporting of vulnerabilities. We assess and respond quickly—security concerns are our top priority.",
    },
    {
      icon: Award,
      title: "Reward eligibility",
      description: "Qualifying vulnerabilities may earn you a place in our bug bounty program. We recognize discoveries that enhance our security.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Toolbar */}
      <Toolbar onLoginClick={handleLogin} />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-24 pt-32">
        {/* Hero Section */}
        <div className="mb-20 flex items-center justify-between">
          <div className="flex-1 max-w-2xl">
            <p className="text-[#4DB8C4] text-xl font-medium mb-6" style={{ fontFamily: "'TikTok Sans', sans-serif" }}>SECURITY</p>
            <h1 className="text-5xl font-bold text-white leading-tight mb-6" style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
              Security is at the <span className="italic">heart</span>
              <br />
              of everything we do
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed mb-8" style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
              Security is a core principle of Ruleout—from our tech to our culture. We're SOC 2 Type I & II and Privacy Law compliant.
            </p>
            <div className="flex items-center gap-4">
              <button className="px-6 py-3 bg-[#20808D] text-white font-medium rounded-lg hover:bg-[#1a6b77] transition-colors">
                Visit the trust center
              </button>
              <button className="px-6 py-3 text-gray-300 hover:text-white transition-colors">
                Vulnerability Disclosure Policy
              </button>
            </div>
          </div>

          {/* Compliance Badges */}
          <div className="hidden lg:flex items-center gap-6">
            {complianceItems.map((item, index) => (
              <div
                key={index}
                className="relative w-40 h-40 rounded-full flex flex-col items-center justify-center hover:scale-105 transition-transform"
                style={{
                  background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
                  boxShadow: '12px 12px 24px #0f0f0f, -12px -12px 24px #353535',
                  transform: `rotate(${index * 15 - 15}deg) translateY(${index * 10}px)`,
                }}
              >
                {/* Inner highlight for 3D effect */}
                <div
                  className="absolute inset-2 rounded-full"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.05), transparent)',
                  }}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="flex items-center mb-1">
                    {[...Array(item.type ? 3 : 5)].map((_, i) => (
                      <span key={i} className="text-yellow-500 text-xs">★</span>
                    ))}
                  </div>
                  <p className="text-gray-200 text-2xl font-bold">{item.name}</p>
                  {item.type && (
                    <p className="text-gray-400 text-xs uppercase tracking-wider">{item.type}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How we think about security */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-white mb-12" style={{ fontFamily: "'TikTok Sans', sans-serif" }}>How we think about security</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {securityFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-8 bg-[#252525] rounded-2xl hover:bg-[#2a2a2a] transition-all group relative overflow-hidden"
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#20808D]/20 to-[#4DB8C4]/10 flex items-center justify-center mb-6 relative">
                    <Icon className="w-10 h-10 text-[#4DB8C4]" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3 relative">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed relative">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Found a security threat */}
        <div className="mb-20">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-3">Found a security threat?</h2>
              <p className="text-gray-400 text-lg">We reward those who help us stay secure.</p>
            </div>
            <AlertTriangle className="w-12 h-12 text-[#4DB8C4]" />
          </div>

          <button className="text-[#4DB8C4] font-medium flex items-center gap-2 mb-8 hover:gap-4 transition-all">
            Report security threat
            <span>→</span>
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {securityThreatItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="p-6 bg-[#252525] rounded-xl hover:bg-[#2a2a2a] transition-all group relative overflow-hidden"
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                  <div className="flex items-center gap-3 mb-4 relative">
                    <div className="w-10 h-10 rounded-lg bg-[#20808D]/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#4DB8C4]" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed relative">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional Security Information */}
        <div className="p-12 bg-gradient-to-br from-[#20808D]/10 to-[#4DB8C4]/10 rounded-2xl border border-[#20808D]/20">
          <div className="flex items-center gap-4 mb-6">
            <Shield className="w-12 h-12 text-[#4DB8C4]" />
            <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "'TikTok Sans', sans-serif" }}>Veterinary Medical Data Protection</h2>
          </div>
          <p className="text-gray-300 text-lg leading-relaxed mb-6" style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
            Ruleout protects all veterinary clinical data including patient records, test results, and prescriptions with the highest security standards. Our platform gives veterinarians peace of mind when searching clinical guidelines.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#1a1a1a]/50 rounded-lg">
              <p className="text-[#4DB8C4] font-bold text-2xl mb-1">256-bit</p>
              <p className="text-gray-400 text-sm">AES Encryption</p>
            </div>
            <div className="p-4 bg-[#1a1a1a]/50 rounded-lg">
              <p className="text-[#4DB8C4] font-bold text-2xl mb-1">24/7</p>
              <p className="text-gray-400 text-sm">Security Monitoring</p>
            </div>
            <div className="p-4 bg-[#1a1a1a]/50 rounded-lg">
              <p className="text-[#4DB8C4] font-bold text-2xl mb-1">100%</p>
              <p className="text-gray-400 text-sm">Compliance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative bg-[#0a0a0a]">
        {/* Gradient transition */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 py-16 relative">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-12">
            {/* Product Column */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-[#4DB8C4] transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <button onClick={() => router.push('/pricing')} className="text-gray-400 hover:text-[#4DB8C4] transition-colors">
                    Pricing
                  </button>
                </li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-[#4DB8C4] transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <button onClick={() => router.push('/blog')} className="text-gray-400 hover:text-[#4DB8C4] transition-colors">
                    Blog
                  </button>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-[#4DB8C4] transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-3">
                <li>
                  <button onClick={() => router.push('/mission')} className="text-gray-400 hover:text-[#4DB8C4] transition-colors">
                    Mission
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/careers')} className="text-gray-400 hover:text-[#4DB8C4] transition-colors">
                    Careers
                  </button>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-[#4DB8C4] transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-3">
                <li>
                  <button onClick={() => router.push('/terms')} className="text-gray-400 hover:text-[#4DB8C4] transition-colors">
                    Terms of Use
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/privacy')} className="text-gray-400 hover:text-[#4DB8C4] transition-colors">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/security')} className="text-gray-400 hover:text-[#4DB8C4] transition-colors">
                    Security
                  </button>
                </li>
              </ul>
            </div>

            {/* Connect Column */}
            <div>
              <h3 className="text-white font-semibold mb-4">Connect</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-[#4DB8C4] transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-[#4DB8C4] transition-colors">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-[#4DB8C4] transition-colors">
                    YouTube
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left: Copyright */}
            <p className="text-gray-500 text-sm">
              © 2025 Ruleout. All rights reserved.
            </p>

            {/* Right: Theme Selector & Language */}
            <div className="flex items-center gap-4">
              {/* Theme Selector */}
              <div className="flex items-center bg-[#1a1a1a] rounded-lg p-1 border border-gray-800">
                <button
                  onClick={() => setThemeMode("system")}
                  className={`p-2 rounded transition-colors ${
                    themeMode === "system"
                      ? "bg-gray-700 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                  title="System"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setThemeMode("light")}
                  className={`p-2 rounded transition-colors ${
                    themeMode === "light"
                      ? "bg-gray-700 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                  title="Light"
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setThemeMode("dark")}
                  className={`p-2 rounded transition-colors ${
                    themeMode === "dark"
                      ? "bg-gray-700 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                  title="Dark"
                >
                  <Moon className="w-4 h-4" />
                </button>
              </div>

              {/* Language Selector */}
              <div className="relative">
                <button className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] rounded-lg border border-gray-800 text-gray-400 hover:text-white transition-colors">
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
            className="bg-[#1a1a1a] rounded-2xl p-8 w-full max-w-md mx-4 relative border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
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
                <span className="text-2xl font-bold text-white">Ruleout</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Log in or Sign up
              </h2>
              <p className="text-gray-400">
                Choose your work email. <a href="#" className="text-[#20808D] hover:underline">Why is this needed?</a>
              </p>
            </div>

            <div className="space-y-3">
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
                  <span className="text-white font-medium">Continue with Google</span>
                </div>
              </button>

              <button className="w-full flex items-center justify-center px-6 py-4 border-2 border-gray-700 rounded-lg hover:border-gray-600 transition-colors bg-[#2a2a2a]">
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6" viewBox="0 0 23 23">
                    <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                    <path fill="#f35325" d="M1 1h10v10H1z"/>
                    <path fill="#81bc06" d="M12 1h10v10H12z"/>
                    <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                    <path fill="#ffba08" d="M12 12h10v10H12z"/>
                  </svg>
                  <span className="text-white font-medium">Continue with Microsoft</span>
                </div>
              </button>

              <button className="w-full flex items-center justify-center px-6 py-4 border-2 border-gray-700 rounded-lg hover:border-gray-600 transition-colors bg-[#2a2a2a]">
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <span className="text-white font-medium">Continue with Apple</span>
                </div>
              </button>

              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-gray-700"></div>
                <span className="px-4 text-gray-400">or</span>
                <div className="flex-1 border-t border-gray-700"></div>
              </div>

              <button className="w-full px-6 py-4 bg-[#20808D] text-white rounded-lg hover:bg-[#1a6a78] transition-colors font-medium">
                Continue with Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
