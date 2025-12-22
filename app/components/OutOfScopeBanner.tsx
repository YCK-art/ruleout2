"use client";

import { X } from "lucide-react";

interface OutOfScopeBannerProps {
  onClose: () => void;
  isDark?: boolean;
}

export default function OutOfScopeBanner({ onClose, isDark = true }: OutOfScopeBannerProps) {
  return (
    <div
      className="relative rounded-lg p-4 mb-4 max-w-2xl mx-auto"
      style={{
        backgroundColor: "#1f1f1f",
      }}
    >
      {/* X 버튼 */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-1 rounded hover:bg-gray-700 transition-colors"
        aria-label="Close banner"
      >
        <X className="w-4 h-4" style={{ color: "#4DB8C4" }} />
      </button>

      {/* 제목 */}
      <h3
        className="text-base font-semibold mb-2 pr-6"
        style={{ color: "#4DB8C4" }}
      >
        The question is outside the scope of Ruleout.
      </h3>

      {/* 설명 */}
      <p
        className="text-xs leading-relaxed"
        style={{ color: "#4DB8C4" }}
      >
        If you believe this is an error, please help us improve Ruleout and let us know at{" "}
        <a
          href="mailto:help@ruleout.co"
          className="underline hover:opacity-80"
          style={{ color: "#4DB8C4" }}
        >
          help@ruleout.co
        </a>
        .
      </p>
    </div>
  );
}
