"use client";

import { useState } from "react";
import { ChevronDown, BookOpen, Shield, Briefcase, HelpCircle, Target } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";

interface ToolbarProps {
  onLoginClick: () => void;
  onMenuClick?: (menu: string) => void;
}

export default function Toolbar({ onLoginClick, onMenuClick }: ToolbarProps) {
  const router = useRouter();
  const { effectiveTheme } = useTheme();
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);

  const resourceItems = [
    { icon: BookOpen, label: "Blog", description: "Latest news and updates", column: 1 },
    { icon: Briefcase, label: "Careers", description: "Join our team", column: 1 },
    { icon: Shield, label: "Security", description: "Trust and compliance", column: 2 },
    { icon: HelpCircle, label: "Support", description: "Get help anytime", column: 2 },
    { icon: Target, label: "Mission", description: "Our purpose and values", column: 3 },
  ];

  const handleMouseEnter = () => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
    setIsResourcesOpen(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsResourcesOpen(false);
    }, 200);
    setCloseTimeout(timeout);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 border-b backdrop-blur-md z-50 ${
        effectiveTheme === 'light'
          ? 'border-gray-200 bg-white/80'
          : 'border-gray-800 bg-[#1a1a1a]/80'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* 로고 */}
            <div
              className="flex items-center space-x-1 cursor-pointer"
              onClick={() => router.push('/landing')}
            >
              <Image
                src="/image/clinical4-Photoroom.png"
                alt="Ruleout Logo"
                width={36}
                height={36}
                className="object-contain"
              />
              <span className={`text-xl font-semibold ${
                effectiveTheme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>Ruleout</span>
            </div>

            {/* Navigation Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <button className={`transition-colors ${
                effectiveTheme === 'light'
                  ? 'text-gray-900 hover:text-[#20808D]'
                  : 'text-gray-300 hover:text-[#4DB8C4]'
              }`}>
                <span>Features</span>
              </button>
              <button
                onClick={() => router.push('/enterprise')}
                className={`transition-colors ${
                  effectiveTheme === 'light'
                    ? 'text-gray-900 hover:text-[#20808D]'
                    : 'text-gray-300 hover:text-[#4DB8C4]'
                }`}
              >
                <span>Enterprise</span>
              </button>
              <button
                onClick={() => router.push('/pricing')}
                className={`transition-colors ${
                  effectiveTheme === 'light'
                    ? 'text-gray-900 hover:text-[#20808D]'
                    : 'text-gray-300 hover:text-[#4DB8C4]'
                }`}
              >
                <span>Pricing</span>
              </button>
              <div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="relative"
              >
                <button className={`flex items-center space-x-1 transition-colors ${
                  effectiveTheme === 'light'
                    ? 'text-gray-900 hover:text-[#20808D]'
                    : 'text-gray-300 hover:text-[#4DB8C4]'
                }`}>
                  <span>Resources</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {/* 드롭다운과 버튼 사이의 gap을 채우는 보이지 않는 영역 */}
                {isResourcesOpen && (
                  <div className="absolute left-0 right-0 h-4" style={{ top: '100%' }} />
                )}
              </div>
            </div>

            {/* Right Buttons */}
            <div className="flex items-center space-x-4">
              <button className={`px-4 py-2 transition-colors border rounded-lg ${
                effectiveTheme === 'light'
                  ? 'text-gray-700 hover:text-gray-900 border-gray-300 hover:border-gray-400'
                  : 'text-gray-300 hover:text-white border-gray-700 hover:border-gray-600'
              }`}>
                Contact Sales
              </button>
              <button
                onClick={onLoginClick}
                className="px-4 py-2 bg-[#20808D] text-white rounded-lg hover:bg-[#1a6b77] transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dropdown Menu - 툴바 외부에서 렌더링 */}
      {isResourcesOpen && (
        <div
          className="fixed left-0 right-0 z-40 animate-fadeIn"
          style={{ top: '57px' }}
        >
          <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`border-t shadow-2xl ${
              effectiveTheme === 'light'
                ? 'bg-white border-gray-200'
                : 'bg-[#1a1a1a] border-gray-800'
            }`}
          >
            <div className="max-w-7xl mx-auto px-6 py-10">
              <div className="flex gap-x-4 justify-center max-w-4xl mx-auto">
                {/* Column 1: Blog, Careers */}
                <div className="flex flex-col gap-y-3 flex-1">
                  {resourceItems.filter(item => item.column === 1).map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (item.label === "Blog") {
                            router.push('/blog');
                          } else if (item.label === "Careers") {
                            router.push('/careers');
                          }
                        }}
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-colors text-left group ${
                          effectiveTheme === 'light'
                            ? 'hover:bg-gray-100'
                            : 'hover:bg-[#252525]'
                        }`}
                      >
                        <div className="flex-shrink-0 w-12 h-12 bg-[#20808D]/10 rounded-lg flex items-center justify-center group-hover:bg-[#20808D]/20 transition-colors">
                          <Icon className="w-5 h-5 text-[#20808D]" />
                        </div>
                        <div>
                          <h3 className={`font-semibold text-sm mb-0.5 transition-colors ${
                            effectiveTheme === 'light'
                              ? 'text-gray-900 group-hover:text-[#20808D]'
                              : 'text-white group-hover:text-[#4DB8C4]'
                          }`}>
                            {item.label}
                          </h3>
                          <p className={`text-sm ${
                            effectiveTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {item.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Column 2: Security, Support */}
                <div className="flex flex-col gap-y-3 flex-1">
                  {resourceItems.filter(item => item.column === 2).map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (item.label === "Security") {
                            router.push('/security');
                          }
                        }}
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-colors text-left group ${
                          effectiveTheme === 'light'
                            ? 'hover:bg-gray-100'
                            : 'hover:bg-[#252525]'
                        }`}
                      >
                        <div className="flex-shrink-0 w-12 h-12 bg-[#20808D]/10 rounded-lg flex items-center justify-center group-hover:bg-[#20808D]/20 transition-colors">
                          <Icon className="w-5 h-5 text-[#20808D]" />
                        </div>
                        <div>
                          <h3 className={`font-semibold text-sm mb-0.5 transition-colors ${
                            effectiveTheme === 'light'
                              ? 'text-gray-900 group-hover:text-[#20808D]'
                              : 'text-white group-hover:text-[#4DB8C4]'
                          }`}>
                            {item.label}
                          </h3>
                          <p className={`text-sm ${
                            effectiveTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {item.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Column 3: Mission */}
                <div className="flex flex-col gap-y-3 flex-1">
                  {resourceItems.filter(item => item.column === 3).map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (item.label === "Mission") {
                            router.push('/mission');
                          }
                        }}
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-colors text-left group ${
                          effectiveTheme === 'light'
                            ? 'hover:bg-gray-100'
                            : 'hover:bg-[#252525]'
                        }`}
                      >
                        <div className="flex-shrink-0 w-12 h-12 bg-[#20808D]/10 rounded-lg flex items-center justify-center group-hover:bg-[#20808D]/20 transition-colors">
                          <Icon className="w-5 h-5 text-[#20808D]" />
                        </div>
                        <div>
                          <h3 className={`font-semibold text-sm mb-0.5 transition-colors ${
                            effectiveTheme === 'light'
                              ? 'text-gray-900 group-hover:text-[#20808D]'
                              : 'text-white group-hover:text-[#4DB8C4]'
                          }`}>
                            {item.label}
                          </h3>
                          <p className={`text-sm ${
                            effectiveTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {item.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
