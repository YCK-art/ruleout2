"use client";

import { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, isVisible, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    console.log("=== Toast component - isVisible:", isVisible);
    if (isVisible) {
      console.log("=== Toast visible, setting timer for", duration, "ms");
      const timer = setTimeout(() => {
        console.log("=== Toast timer expired, closing");
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  console.log("=== Toast render - isVisible:", isVisible);
  if (!isVisible) {
    console.log("=== Toast not visible, returning null");
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-slide-in-right">
      <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg shadow-lg px-4 py-3 flex items-center space-x-3 min-w-[300px]">
        <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: '#5AC8D8' }} />
        <span className="text-sm text-gray-200 flex-1">{message}</span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-300 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
