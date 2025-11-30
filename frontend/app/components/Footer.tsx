"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sun, Moon, Globe, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const { themeMode, setThemeMode, effectiveTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showLanguageDropdown && !target.closest('.language-selector')) {
        setShowLanguageDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLanguageDropdown]);

  const content = {
    English: {
      company: {
        title: "Company",
        mission: "Mission",
        careers: "Careers",
        blog: "Blog"
      },
      legal: {
        title: "Legal",
        terms: "Terms of Service",
        privacy: "Privacy Policy",
        security: "Security"
      },
      product: {
        title: "Product",
        pricing: "Pricing",
        features: "Features",
        updates: "Updates"
      },
      copyright: "2024 Ruleout. All rights reserved."
    },
    한국어: {
      company: {
        title: "회사",
        mission: "미션",
        careers: "채용",
        blog: "블로그"
      },
      legal: {
        title: "법률",
        terms: "이용약관",
        privacy: "개인정보처리방침",
        security: "보안"
      },
      product: {
        title: "제품",
        pricing: "요금제",
        features: "기능",
        updates: "업데이트"
      },
      copyright: "2024 Ruleout. All rights reserved."
    },
    日本語: {
      company: {
        title: "会社",
        mission: "ミッション",
        careers: "採用",
        blog: "ブログ"
      },
      legal: {
        title: "法務",
        terms: "利用規約",
        privacy: "プライバシーポリシー",
        security: "セキュリティ"
      },
      product: {
        title: "製品",
        pricing: "料金",
        features: "機能",
        updates: "更新情報"
      },
      copyright: "2024 Ruleout. All rights reserved."
    }
  };

  const currentContent = content[language as keyof typeof content];

  return (
    <footer className={`${effectiveTheme === "light" ? "bg-gray-50 border-gray-200" : "bg-[#0a0a0a] border-gray-800"} border-t`}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Footer content grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company */}
          <div>
            <h3 className={`font-semibold mb-4 ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>
              {currentContent.company.title}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/mission" className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-gray-900" : "text-gray-400 hover:text-white"} transition-colors`}>
                  {currentContent.company.mission}
                </Link>
              </li>
              <li>
                <Link href="/careers" className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-gray-900" : "text-gray-400 hover:text-white"} transition-colors`}>
                  {currentContent.company.careers}
                </Link>
              </li>
              <li>
                <Link href="/blog" className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-gray-900" : "text-gray-400 hover:text-white"} transition-colors`}>
                  {currentContent.company.blog}
                </Link>
              </li>
            </ul>
          </div>

          {/* Product */}
          <div>
            <h3 className={`font-semibold mb-4 ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>
              {currentContent.product.title}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/pricing" className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-gray-900" : "text-gray-400 hover:text-white"} transition-colors`}>
                  {currentContent.product.pricing}
                </Link>
              </li>
              <li>
                <Link href="/features" className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-gray-900" : "text-gray-400 hover:text-white"} transition-colors`}>
                  {currentContent.product.features}
                </Link>
              </li>
              <li>
                <Link href="/updates" className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-gray-900" : "text-gray-400 hover:text-white"} transition-colors`}>
                  {currentContent.product.updates}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className={`font-semibold mb-4 ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>
              {currentContent.legal.title}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/terms" className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-gray-900" : "text-gray-400 hover:text-white"} transition-colors`}>
                  {currentContent.legal.terms}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-gray-900" : "text-gray-400 hover:text-white"} transition-colors`}>
                  {currentContent.legal.privacy}
                </Link>
              </li>
              <li>
                <Link href="/security" className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-gray-900" : "text-gray-400 hover:text-white"} transition-colors`}>
                  {currentContent.legal.security}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section with controls */}
        <div className={`pt-8 border-t ${effectiveTheme === "light" ? "border-gray-200" : "border-gray-800"} flex flex-col md:flex-row justify-between items-center gap-4`}>
          <p className={`text-sm ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"}`}>
            {currentContent.copyright}
          </p>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <div className={`flex items-center ${effectiveTheme === "light" ? "bg-gray-100 border-gray-200" : "bg-[#1a1a1a] border-gray-800"} rounded-lg p-1 border`}>
              <button
                onClick={() => setThemeMode("light")}
                className={`p-2 rounded-md transition-colors ${
                  themeMode === "light"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                onClick={() => setThemeMode("dark")}
                className={`p-2 rounded-md transition-colors ${
                  themeMode === "dark"
                    ? "bg-gray-800 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Moon className="w-4 h-4" />
              </button>
            </div>

            {/* Language Selector */}
            <div className="relative language-selector">
              <button
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className={`flex items-center gap-2 px-3 py-2 ${
                  effectiveTheme === "light"
                    ? "bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-900"
                    : "bg-[#1a1a1a] border-gray-800 text-gray-400 hover:text-white"
                } rounded-lg border transition-colors`}
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm">{language}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Language Dropdown */}
              {showLanguageDropdown && (
                <div className={`absolute bottom-full right-0 mb-2 ${
                  effectiveTheme === "light"
                    ? "bg-white border-gray-200"
                    : "bg-[#1a1a1a] border-gray-800"
                } border rounded-lg shadow-lg overflow-hidden min-w-[140px]`}>
                  <button
                    onClick={() => {
                      setLanguage("English");
                      setShowLanguageDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm ${
                      language === "English"
                        ? effectiveTheme === "light"
                          ? "bg-gray-100 text-gray-900"
                          : "bg-gray-800 text-white"
                        : effectiveTheme === "light"
                        ? "text-gray-600 hover:bg-gray-50"
                        : "text-gray-400 hover:bg-gray-900"
                    } transition-colors`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => {
                      setLanguage("한국어");
                      setShowLanguageDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm ${
                      language === "한국어"
                        ? effectiveTheme === "light"
                          ? "bg-gray-100 text-gray-900"
                          : "bg-gray-800 text-white"
                        : effectiveTheme === "light"
                        ? "text-gray-600 hover:bg-gray-50"
                        : "text-gray-400 hover:bg-gray-900"
                    } transition-colors`}
                  >
                    한국어
                  </button>
                  <button
                    onClick={() => {
                      setLanguage("日本語");
                      setShowLanguageDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm ${
                      language === "日本語"
                        ? effectiveTheme === "light"
                          ? "bg-gray-100 text-gray-900"
                          : "bg-gray-800 text-white"
                        : effectiveTheme === "light"
                        ? "text-gray-600 hover:bg-gray-50"
                        : "text-gray-400 hover:bg-gray-900"
                    } transition-colors`}
                  >
                    日本語
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
