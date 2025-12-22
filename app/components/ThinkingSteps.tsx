"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Languages, Network, Search, Sparkles, RefreshCw } from "lucide-react";
import type { ThinkingStep } from "@/types/chat";

interface ThinkingStepsProps {
  steps: ThinkingStep[];
  finishedText: string;
  isDark: boolean;
}

// Lucide 아이콘 매핑
const IconMap: { [key: string]: any } = {
  RefreshCw,
  Languages,
  Network,
  Search,
  Sparkles,
};

export default function ThinkingSteps({ steps, finishedText, isDark }: ThinkingStepsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!steps || steps.length === 0) return null;

  return (
    <div className="mb-4">
      {/* 헤더 (클릭 가능) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-2 flex items-center space-x-2 hover:opacity-80 transition-opacity"
      >
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" style={{ color: isDark ? "#9ca3af" : "#6b7280" }} />
        ) : (
          <ChevronDown className="w-4 h-4" style={{ color: isDark ? "#9ca3af" : "#6b7280" }} />
        )}
        <span
          className="text-sm"
          style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
        >
          {finishedText}
        </span>
      </button>

      {/* 타임라인 (확장 시) - 부드러운 슬라이드 애니메이션 */}
      <div
        className={`overflow-hidden transition-all duration-500 ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        <div className="pl-6 py-2 space-y-3">
          {steps.map((step, index) => {
            const Icon = IconMap[step.icon] || Sparkles;
            const isLast = index === steps.length - 1;

            return (
              <div key={index} className="flex items-start space-x-3">
                {/* 아이콘 영역 */}
                <div className="flex flex-col items-center">
                  <div
                    className="rounded-full p-1.5"
                    style={{
                      backgroundColor: "#4DB8C4",
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: "#1a1a1a" }} />
                  </div>
                  {/* 연결선 */}
                  {!isLast && (
                    <div
                      className="w-0.5 h-6 mt-1"
                      style={{
                        backgroundColor: isDark ? "#374151" : "#e5e7eb",
                      }}
                    />
                  )}
                </div>

                {/* 텍스트 영역 */}
                <div className="flex-1 pt-0.5">
                  <span
                    className="text-sm"
                    style={{ color: isDark ? "#d1d5db" : "#374151" }}
                  >
                    {step.text}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
