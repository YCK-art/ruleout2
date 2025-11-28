"use client";

import Image from "next/image";
import { signInWithGoogle } from "@/lib/auth";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      onClose();
    } catch (error) {
      console.error("로그인 실패:", error);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1a1a] rounded-2xl p-8 w-full max-w-md mx-4 relative border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
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
            <span className="text-2xl font-bold text-white">Ruleout</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Log in or Sign up
          </h2>
          <p className="text-gray-400">
            Choose your work email. <a href="#" className="text-[#20808D] hover:underline">Why is this needed?</a>
          </p>
        </div>

        {/* Login Options */}
        <div className="space-y-3">
          {/* Google Login */}
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

          {/* Microsoft Login */}
          <button
            onClick={() => {/* Microsoft 로그인 구현 예정 */}}
            className="w-full flex items-center justify-center px-6 py-4 border-2 border-gray-700 rounded-lg hover:border-gray-600 transition-colors bg-[#2a2a2a]"
          >
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

          {/* Apple Login */}
          <button
            onClick={() => {/* Apple 로그인 구현 예정 */}}
            className="w-full flex items-center justify-center px-6 py-4 border-2 border-gray-700 rounded-lg hover:border-gray-600 transition-colors bg-[#2a2a2a]"
          >
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span className="text-white font-medium">Continue with Apple</span>
            </div>
          </button>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-gray-700"></div>
            <span className="px-4 text-gray-400">or</span>
            <div className="flex-1 border-t border-gray-700"></div>
          </div>

          {/* Email Login */}
          <button
            onClick={() => {/* 이메일 로그인 구현 예정 */}}
            className="w-full px-6 py-4 bg-[#20808D] text-white rounded-lg hover:bg-[#1a6a78] transition-colors font-medium"
          >
            Continue with Email
          </button>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center mt-4">
            By continuing, you agree to Ruleout's{" "}
            <a href="#" className="text-[#20808D] hover:underline">Terms of Service</a>
            {" "}and{" "}
            <a href="#" className="text-[#20808D] hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
