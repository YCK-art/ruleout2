"use client";

import { useState } from "react";
import { signInWithEmail, signUpWithEmail, resetPassword } from "@/lib/auth";
import { useLanguage } from "@/contexts/LanguageContext";

interface EmailAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailAuthModal({ isOpen, onClose }: EmailAuthModalProps) {
  const { language } = useLanguage();
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const content = {
    English: {
      signin: {
        title: "Sign in with Email",
        email: "Email",
        password: "Password",
        button: "Sign in",
        switchToSignup: "Don't have an account? Sign up",
        forgotPassword: "Forgot password?"
      },
      signup: {
        title: "Sign up with Email",
        name: "Name (Optional)",
        email: "Email",
        password: "Password",
        confirmPassword: "Confirm Password",
        button: "Sign up",
        switchToSignin: "Already have an account? Sign in"
      },
      reset: {
        title: "Reset Password",
        email: "Email",
        button: "Send Reset Email",
        backToSignin: "Back to Sign in",
        success: "Password reset email sent! Please check your inbox."
      },
      errors: {
        emailRequired: "Email is required",
        passwordRequired: "Password is required",
        passwordMismatch: "Passwords do not match",
        passwordTooShort: "Password must be at least 6 characters",
        invalidEmail: "Invalid email address",
        emailInUse: "This email is already in use",
        wrongPassword: "Wrong password",
        userNotFound: "User not found",
        networkError: "Network error. Please try again."
      }
    },
    한국어: {
      signin: {
        title: "이메일로 로그인",
        email: "이메일",
        password: "비밀번호",
        button: "로그인",
        switchToSignup: "계정이 없으신가요? 회원가입",
        forgotPassword: "비밀번호를 잊으셨나요?"
      },
      signup: {
        title: "이메일로 회원가입",
        name: "이름 (선택사항)",
        email: "이메일",
        password: "비밀번호",
        confirmPassword: "비밀번호 확인",
        button: "회원가입",
        switchToSignin: "이미 계정이 있으신가요? 로그인"
      },
      reset: {
        title: "비밀번호 재설정",
        email: "이메일",
        button: "재설정 이메일 보내기",
        backToSignin: "로그인으로 돌아가기",
        success: "비밀번호 재설정 이메일이 전송되었습니다! 이메일을 확인해주세요."
      },
      errors: {
        emailRequired: "이메일을 입력해주세요",
        passwordRequired: "비밀번호를 입력해주세요",
        passwordMismatch: "비밀번호가 일치하지 않습니다",
        passwordTooShort: "비밀번호는 최소 6자 이상이어야 합니다",
        invalidEmail: "유효하지 않은 이메일 주소입니다",
        emailInUse: "이미 사용 중인 이메일입니다",
        wrongPassword: "잘못된 비밀번호입니다",
        userNotFound: "사용자를 찾을 수 없습니다",
        networkError: "네트워크 오류가 발생했습니다. 다시 시도해주세요."
      }
    },
    日本語: {
      signin: {
        title: "メールでログイン",
        email: "メール",
        password: "パスワード",
        button: "ログイン",
        switchToSignup: "アカウントをお持ちでないですか？サインアップ",
        forgotPassword: "パスワードをお忘れですか？"
      },
      signup: {
        title: "メールでサインアップ",
        name: "名前（オプション）",
        email: "メール",
        password: "パスワード",
        confirmPassword: "パスワード確認",
        button: "サインアップ",
        switchToSignin: "既にアカウントをお持ちですか？ログイン"
      },
      reset: {
        title: "パスワードリセット",
        email: "メール",
        button: "リセットメールを送信",
        backToSignin: "ログインに戻る",
        success: "パスワードリセットメールが送信されました！受信トレイを確認してください。"
      },
      errors: {
        emailRequired: "メールを入力してください",
        passwordRequired: "パスワードを入力してください",
        passwordMismatch: "パスワードが一致しません",
        passwordTooShort: "パスワードは6文字以上である必要があります",
        invalidEmail: "無効なメールアドレスです",
        emailInUse: "このメールは既に使用されています",
        wrongPassword: "パスワードが間違っています",
        userNotFound: "ユーザーが見つかりません",
        networkError: "ネットワークエラーが発生しました。もう一度お試しください。"
      }
    }
  };

  const currentContent = content[language as keyof typeof content];

  if (!isOpen) return null;

  const handleError = (error: any) => {
    const errorCode = error.code;
    switch (errorCode) {
      case "auth/invalid-email":
        setError(currentContent.errors.invalidEmail);
        break;
      case "auth/email-already-in-use":
        setError(currentContent.errors.emailInUse);
        break;
      case "auth/wrong-password":
        setError(currentContent.errors.wrongPassword);
        break;
      case "auth/user-not-found":
        setError(currentContent.errors.userNotFound);
        break;
      case "auth/network-request-failed":
        setError(currentContent.errors.networkError);
        break;
      default:
        setError(error.message);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError(currentContent.errors.emailRequired);
      return;
    }
    if (!password) {
      setError(currentContent.errors.passwordRequired);
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(email, password);
      onClose();
    } catch (error: any) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError(currentContent.errors.emailRequired);
      return;
    }
    if (!password) {
      setError(currentContent.errors.passwordRequired);
      return;
    }
    if (password.length < 6) {
      setError(currentContent.errors.passwordTooShort);
      return;
    }
    if (password !== confirmPassword) {
      setError(currentContent.errors.passwordMismatch);
      return;
    }

    setLoading(true);
    try {
      await signUpWithEmail(email, password, displayName);
      onClose();
    } catch (error: any) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError(currentContent.errors.emailRequired);
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess(currentContent.reset.success);
    } catch (error: any) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
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

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-6">
          {mode === "signin" && currentContent.signin.title}
          {mode === "signup" && currentContent.signup.title}
          {mode === "reset" && currentContent.reset.title}
        </h2>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-500 text-sm">
            {success}
          </div>
        )}

        {/* Sign In Form */}
        {mode === "signin" && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {currentContent.signin.email}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#20808D]"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {currentContent.signin.password}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#20808D]"
                disabled={loading}
              />
            </div>
            <button
              type="button"
              onClick={() => setMode("reset")}
              className="text-sm text-[#20808D] hover:underline"
            >
              {currentContent.signin.forgotPassword}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#20808D] text-white rounded-lg hover:bg-[#1a6a78] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "..." : currentContent.signin.button}
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="w-full text-sm text-gray-400 hover:text-gray-200"
            >
              {currentContent.signin.switchToSignup}
            </button>
          </form>
        )}

        {/* Sign Up Form */}
        {mode === "signup" && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {currentContent.signup.name}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#20808D]"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {currentContent.signup.email}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#20808D]"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {currentContent.signup.password}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#20808D]"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {currentContent.signup.confirmPassword}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#20808D]"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#20808D] text-white rounded-lg hover:bg-[#1a6a78] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "..." : currentContent.signup.button}
            </button>
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="w-full text-sm text-gray-400 hover:text-gray-200"
            >
              {currentContent.signup.switchToSignin}
            </button>
          </form>
        )}

        {/* Reset Password Form */}
        {mode === "reset" && (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {currentContent.reset.email}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#20808D]"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#20808D] text-white rounded-lg hover:bg-[#1a6a78] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "..." : currentContent.reset.button}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setSuccess("");
              }}
              className="w-full text-sm text-gray-400 hover:text-gray-200"
            >
              {currentContent.reset.backToSignin}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
