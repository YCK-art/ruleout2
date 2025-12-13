"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronLeft, User, Settings as SettingsIcon, Bell, ChevronDown, X, Globe } from "lucide-react";
import Image from "next/image";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading, updateUserProfile } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<"account" | "preferences" | "notifications">("account");
  const [showNameModal, setShowNameModal] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [showPreferredLanguageDropdown, setShowPreferredLanguageDropdown] = useState(false);
  const [showImageGenDropdown, setShowImageGenDropdown] = useState(false);

  // Store the selection type, not the translated text
  const [selectedThemeType, setSelectedThemeType] = useState<"dark" | "light" | "system">("dark");
  const [selectedPreferredLanguageType, setSelectedPreferredLanguageType] = useState<"auto" | "en" | "ko" | "ja">("auto");
  const [selectedImageGenType, setSelectedImageGenType] = useState<"default" | "dalle3" | "stable">("default");

  // Debug logging
  useEffect(() => {
    console.log("Settings page - loading:", loading, "user:", user ? "exists" : "null");
  }, [loading, user]);

  // Redirect to home if not authenticated (after loading completes)
  useEffect(() => {
    if (!loading && !user) {
      console.log("Redirecting to home - no user");
      router.push('/');
    }
  }, [loading, user, router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showLanguageDropdown && !target.closest('.language-selector')) {
        setShowLanguageDropdown(false);
      }
      if (showThemeDropdown && !target.closest('.theme-selector')) {
        setShowThemeDropdown(false);
      }
      if (showPreferredLanguageDropdown && !target.closest('.preferred-language-selector')) {
        setShowPreferredLanguageDropdown(false);
      }
      if (showImageGenDropdown && !target.closest('.image-gen-selector')) {
        setShowImageGenDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLanguageDropdown, showThemeDropdown, showPreferredLanguageDropdown, showImageGenDropdown]);

  // Show loading state while checking auth
  if (loading) {
    console.log("Showing loading screen");
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  // Don't render anything if no user (will redirect via useEffect)
  if (!user) {
    console.log("No user, returning null");
    return null;
  }

  console.log("Rendering settings page for user:", user.email);

  const content = {
    English: {
      sidebar: {
        back: "Back",
        settings: "Settings"
      },
      tabs: {
        account: "Account",
        preferences: "Preferences",
        notifications: "Notifications"
      },
      account: {
        title: "Account",
        profile: "Profile",
        fullName: "Full Name",
        username: "Username",
        email: "Email",
        changeName: "Change Name",
        changeUsername: "Change Username",
        notSet: "Not set",
        permissions: {
          title: "Permissions",
          proFeatures: "Pro Features Access",
          proDescription: "Unlock advanced features with a Pro subscription",
          upgradeNow: "Upgrade Now",
          learnMore: "Learn More"
        },
        occupation: {
          title: "Occupation",
          label: "Occupation *",
          selectPlaceholder: "Select your occupation",
          veterinarian: "Veterinarian",
          student: "Veterinary Student",
          nurse: "Veterinary Nurse",
          technician: "Veterinary Technician",
          researcher: "Researcher",
          other: "Other",
          credentials: "Veterinary Credentials",
          credentialsDescription: "Ruleout is free for verified veterinary professionals and students. Provisional access will be granted for 48 hours, and expanded access will be granted after verification.",
          school: "School *",
          schoolPlaceholder: "Enter your school name",
          graduationYear: "Graduation Year *",
          month: "Month *",
          verificationNote: "A verification document is already on record.",
          uploadNew: "Click here",
          uploadNewSuffix: "to upload a new file."
        }
      },
      preferences: {
        title: "Preferences",
        theme: {
          label: "Theme",
          description: "Choose how Ruleout looks to you",
          dark: "Dark",
          light: "Light",
          system: "System"
        },
        language: {
          label: "Language",
          description: "Language used in the interface"
        },
        preferredLanguage: {
          label: "Preferred Language",
          description: "Language used by AI",
          autoDetect: "Auto (detect)"
        },
        autoSave: {
          label: "Auto-save",
          description: "Automatically save all responses to chat history"
        },
        homepageWidget: {
          label: "Homepage Widget",
          description: "Show widget on the homepage"
        },
        advanced: {
          title: "Advanced",
          model: "Model",
          openInNewTab: "Open in New Tab",
          imageGeneration: "Image Generation Model",
          default: "Default",
          aiDataUsage: "AI Data Usage",
          aiDataDescription: "Allow Ruleout to use conversations to improve AI models. You can opt out anytime in settings."
        }
      },
      notifications: {
        title: "Notifications",
        email: {
          label: "Email Notifications",
          description: "Receive notifications via email"
        },
        push: {
          label: "Push Notifications",
          description: "Receive push notifications on this device"
        },
        newFeatures: {
          label: "New Features",
          description: "Get notified about new features and updates"
        },
        systemUpdates: {
          label: "System Updates",
          description: "Important system notifications and updates"
        },
        tips: {
          label: "Tips & Suggestions",
          description: "Helpful tips to get the most out of the platform"
        }
      },
      modals: {
        changeName: {
          title: "Change Name",
          label: "Full Name",
          placeholder: "Enter your full name",
          cancel: "Cancel",
          confirm: "Confirm",
          saving: "Saving..."
        },
        changeUsername: {
          title: "Change Username",
          label: "Username",
          placeholder: "Enter your username",
          cancel: "Cancel",
          confirm: "Confirm",
          saving: "Saving..."
        }
      },
      months: {
        january: "January",
        february: "February",
        march: "March",
        april: "April",
        may: "May",
        june: "June",
        july: "July",
        august: "August",
        september: "September",
        october: "October",
        november: "November",
        december: "December"
      }
    },
    한국어: {
      sidebar: {
        back: "뒤로",
        settings: "설정"
      },
      tabs: {
        account: "계정",
        preferences: "환경설정",
        notifications: "알림"
      },
      account: {
        title: "계정",
        profile: "프로필",
        fullName: "전체 이름",
        username: "사용자 이름",
        email: "이메일",
        changeName: "이름 변경",
        changeUsername: "사용자 이름 변경",
        notSet: "설정되지 않음",
        permissions: {
          title: "권한",
          proFeatures: "프로 기능 액세스",
          proDescription: "프로 구독으로 고급 기능 잠금 해제",
          upgradeNow: "지금 업그레이드",
          learnMore: "자세히 알아보기"
        },
        occupation: {
          title: "직업",
          label: "직업 *",
          selectPlaceholder: "직업을 선택하세요",
          veterinarian: "수의사",
          student: "수의학과 학생",
          nurse: "동물 간호사",
          technician: "수의 기술자",
          researcher: "연구원",
          other: "기타",
          credentials: "수의학 자격증명",
          credentialsDescription: "Ruleout은 검증된 수의학 전문가 및 학생에게 무료로 제공됩니다. 48시간 동안 임시 액세스가 부여되며, 검증 후 확장 액세스가 부여됩니다.",
          school: "학교 *",
          schoolPlaceholder: "학교 이름을 입력하세요",
          graduationYear: "졸업 연도 *",
          month: "월 *",
          verificationNote: "검증 문서가 이미 기록되어 있습니다.",
          uploadNew: "여기를 클릭",
          uploadNewSuffix: "하여 새 파일을 업로드하세요."
        }
      },
      preferences: {
        title: "환경설정",
        theme: {
          label: "테마",
          description: "Ruleout의 표시 방식을 선택하세요",
          dark: "다크",
          light: "라이트",
          system: "시스템"
        },
        language: {
          label: "언어",
          description: "인터페이스에 사용되는 언어"
        },
        preferredLanguage: {
          label: "선호 언어",
          description: "AI가 사용하는 언어",
          autoDetect: "자동 (감지)"
        },
        autoSave: {
          label: "자동 저장",
          description: "모든 응답을 채팅 기록에 자동으로 저장"
        },
        homepageWidget: {
          label: "홈페이지 위젯",
          description: "홈페이지에 위젯 표시"
        },
        advanced: {
          title: "고급",
          model: "모델",
          openInNewTab: "새 탭에서 열기",
          imageGeneration: "이미지 생성 모델",
          default: "기본값",
          aiDataUsage: "AI 데이터 사용",
          aiDataDescription: "Ruleout이 대화를 사용하여 AI 모델을 개선하도록 허용합니다. 언제든지 설정에서 거부할 수 있습니다."
        }
      },
      notifications: {
        title: "알림",
        email: {
          label: "이메일 알림",
          description: "이메일로 알림 받기"
        },
        push: {
          label: "푸시 알림",
          description: "이 기기에서 푸시 알림 받기"
        },
        newFeatures: {
          label: "새로운 기능",
          description: "새로운 기능 및 업데이트에 대한 알림 받기"
        },
        systemUpdates: {
          label: "시스템 업데이트",
          description: "중요한 시스템 알림 및 업데이트"
        },
        tips: {
          label: "팁 및 제안",
          description: "플랫폼을 최대한 활용하기 위한 유용한 팁"
        }
      },
      modals: {
        changeName: {
          title: "이름 변경",
          label: "전체 이름",
          placeholder: "전체 이름을 입력하세요",
          cancel: "취소",
          confirm: "확인",
          saving: "저장 중..."
        },
        changeUsername: {
          title: "사용자 이름 변경",
          label: "사용자 이름",
          placeholder: "사용자 이름을 입력하세요",
          cancel: "취소",
          confirm: "확인",
          saving: "저장 중..."
        }
      },
      months: {
        january: "1월",
        february: "2월",
        march: "3월",
        april: "4월",
        may: "5월",
        june: "6월",
        july: "7월",
        august: "8월",
        september: "9월",
        october: "10월",
        november: "11월",
        december: "12월"
      }
    },
    日本語: {
      sidebar: {
        back: "戻る",
        settings: "設定"
      },
      tabs: {
        account: "アカウント",
        preferences: "環境設定",
        notifications: "通知"
      },
      account: {
        title: "アカウント",
        profile: "プロフィール",
        fullName: "氏名",
        username: "ユーザー名",
        email: "メール",
        changeName: "名前を変更",
        changeUsername: "ユーザー名を変更",
        notSet: "未設定",
        permissions: {
          title: "権限",
          proFeatures: "プロ機能アクセス",
          proDescription: "プロサブスクリプションで高度な機能をアンロック",
          upgradeNow: "今すぐアップグレード",
          learnMore: "詳細を見る"
        },
        occupation: {
          title: "職業",
          label: "職業 *",
          selectPlaceholder: "職業を選択してください",
          veterinarian: "獣医師",
          student: "獣医学生",
          nurse: "動物看護師",
          technician: "獣医技術者",
          researcher: "研究者",
          other: "その他",
          credentials: "獣医学資格情報",
          credentialsDescription: "Ruleoutは、認定された獣医学専門家と学生に無料で提供されます。48時間の仮アクセスが付与され、検証後に拡張アクセスが付与されます。",
          school: "学校 *",
          schoolPlaceholder: "学校名を入力してください",
          graduationYear: "卒業年 *",
          month: "月 *",
          verificationNote: "検証文書がすでに記録されています。",
          uploadNew: "ここをクリック",
          uploadNewSuffix: "して新しいファイルをアップロードします。"
        }
      },
      preferences: {
        title: "環境設定",
        theme: {
          label: "テーマ",
          description: "Ruleoutの表示方法を選択",
          dark: "ダーク",
          light: "ライト",
          system: "システム"
        },
        language: {
          label: "言語",
          description: "インターフェースで使用される言語"
        },
        preferredLanguage: {
          label: "優先言語",
          description: "AIが使用する言語",
          autoDetect: "自動 (検出)"
        },
        autoSave: {
          label: "自動保存",
          description: "すべての応答をチャット履歴に自動保存"
        },
        homepageWidget: {
          label: "ホームページウィジェット",
          description: "ホームページにウィジェットを表示"
        },
        advanced: {
          title: "詳細設定",
          model: "モデル",
          openInNewTab: "新しいタブで開く",
          imageGeneration: "画像生成モデル",
          default: "デフォルト",
          aiDataUsage: "AIデータ使用",
          aiDataDescription: "Ruleoutが会話を使用してAIモデルを改善することを許可します。いつでも設定でオプトアウトできます。"
        }
      },
      notifications: {
        title: "通知",
        email: {
          label: "メール通知",
          description: "メールで通知を受け取る"
        },
        push: {
          label: "プッシュ通知",
          description: "このデバイスでプッシュ通知を受け取る"
        },
        newFeatures: {
          label: "新機能",
          description: "新機能とアップデートの通知を受け取る"
        },
        systemUpdates: {
          label: "システムアップデート",
          description: "重要なシステム通知とアップデート"
        },
        tips: {
          label: "ヒントと提案",
          description: "プラットフォームを最大限に活用するための役立つヒント"
        }
      },
      modals: {
        changeName: {
          title: "名前を変更",
          label: "氏名",
          placeholder: "氏名を入力してください",
          cancel: "キャンセル",
          confirm: "確認",
          saving: "保存中..."
        },
        changeUsername: {
          title: "ユーザー名を変更",
          label: "ユーザー名",
          placeholder: "ユーザー名を入力してください",
          cancel: "キャンセル",
          confirm: "確認",
          saving: "保存中..."
        }
      },
      months: {
        january: "1月",
        february: "2月",
        march: "3月",
        april: "4月",
        may: "5月",
        june: "6月",
        july: "7月",
        august: "8月",
        september: "9月",
        october: "10月",
        november: "11月",
        december: "12月"
      }
    }
  };

  const currentContent = content[language as keyof typeof content];

  // Helper functions to get display text based on selected type
  const getThemeDisplayText = () => {
    switch (selectedThemeType) {
      case "dark":
        return currentContent.preferences.theme.dark;
      case "light":
        return currentContent.preferences.theme.light;
      case "system":
        return currentContent.preferences.theme.system;
    }
  };

  const getPreferredLanguageDisplayText = () => {
    switch (selectedPreferredLanguageType) {
      case "auto":
        return currentContent.preferences.preferredLanguage.autoDetect;
      case "en":
        return "English";
      case "ko":
        return "한국어";
      case "ja":
        return "日本語";
    }
  };

  const getImageGenDisplayText = () => {
    switch (selectedImageGenType) {
      case "default":
        return currentContent.preferences.advanced.default;
      case "dalle3":
        return "DALL-E 3";
      case "stable":
        return "Stable Diffusion";
    }
  };

  const tabs = [
    { id: "account" as const, label: currentContent.tabs.account, icon: User },
    { id: "preferences" as const, label: currentContent.tabs.preferences, icon: SettingsIcon },
    { id: "notifications" as const, label: currentContent.tabs.notifications, icon: Bell },
  ];

  const handleChangeName = async () => {
    if (!newName.trim() || !user) return;

    setIsSaving(true);
    try {
      // Update Firebase Auth profile
      await updateUserProfile(newName.trim());

      // Also update Firestore if user document exists
      if (user.uid) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          displayName: newName.trim(),
          updatedAt: new Date().toISOString(),
        });
      }

      setShowNameModal(false);
      setNewName("");
    } catch (error) {
      console.error("Error updating name:", error);
      alert("Failed to update name. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeUsername = async () => {
    if (!newUsername.trim() || !user) return;

    setIsSaving(true);
    try {
      // Update username in Firestore
      if (user.uid) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          username: newUsername.trim(),
          updatedAt: new Date().toISOString(),
        });
      }

      setShowUsernameModal(false);
      setNewUsername("");

      // Reload to reflect changes
      window.location.reload();
    } catch (error) {
      console.error("Error updating username:", error);
      alert("Failed to update username. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* 모바일 상단 툴바 */}
      <div className="md:hidden sticky top-0 z-10 bg-[#1a1a1a] border-b border-gray-800 px-4 py-3">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-base">{currentContent.sidebar.back}</span>
        </button>
      </div>

      <div className="flex">
        {/* Sidebar - 데스크톱만 */}
        <div className="hidden md:block w-64 min-h-screen bg-[#1a1a1a] border-r border-gray-800">
          {/* Back button */}
          <div className="p-4 border-b border-gray-800">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">{currentContent.sidebar.back}</span>
            </button>
          </div>

          {/* Settings title */}
          <div className="p-4">
            <h2 className="text-sm text-gray-500 mb-4">{currentContent.sidebar.settings}</h2>

            {/* Navigation tabs */}
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 md:p-8 md:pl-16 md:pt-12">
          <div className="max-w-3xl mx-auto">
            {/* 모바일: 모든 섹션 표시 */}
            <div className="md:hidden space-y-8">
              {/* Account Section */}
              <div>
                <h1 className="text-2xl font-semibold mb-12">{currentContent.account.title}</h1>

                {/* Profile section */}
                <div className="space-y-0">
                  {/* Profile picture */}
                  <div className="flex items-center py-4 border-b border-gray-800">
                    <div className="flex items-center space-x-4">
                      {user.photoURL ? (
                        <Image
                          src={user.photoURL}
                          alt="Profile"
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold" style={{ backgroundColor: '#20808D' }}>
                          {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div>
                        <h3 className="text-base font-medium text-gray-200">{user.displayName || 'User'}</h3>
                        <p className="text-sm text-gray-500">{user.email?.split('@')[0] || ''}</p>
                      </div>
                    </div>
                  </div>

                  {/* Full name */}
                  <div className="flex items-center justify-between py-4 border-b border-gray-800">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        {currentContent.account.fullName}
                      </label>
                      <p className="text-sm text-gray-500">{user.displayName || currentContent.account.notSet}</p>
                    </div>
                    <button
                      onClick={() => {
                        setNewName(user.displayName || '');
                        setShowNameModal(true);
                      }}
                      className="px-4 py-2 text-sm border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      {currentContent.account.changeName}
                    </button>
                  </div>

                  {/* Username */}
                  <div className="flex items-center justify-between py-4 border-b border-gray-800">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        {currentContent.account.username}
                      </label>
                      <p className="text-sm text-gray-500">{user.email?.split('@')[0] || currentContent.account.notSet}</p>
                    </div>
                    <button
                      onClick={() => {
                        setNewUsername(user.email?.split('@')[0] || '');
                        setShowUsernameModal(true);
                      }}
                      className="px-4 py-2 text-sm border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      {currentContent.account.changeUsername}
                    </button>
                  </div>

                  {/* Email */}
                  <div className="py-4 border-b border-gray-800">
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      {currentContent.account.email}
                    </label>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>

                {/* Permissions section */}
                <div className="mt-12">
                  <h2 className="text-lg font-semibold mb-6">{currentContent.account.permissions.title}</h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-[#2a2a2a] border border-gray-700 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-200 mb-2">
                        {currentContent.account.permissions.proFeatures}
                      </h3>
                      <p className="text-xs text-gray-500 mb-4">
                        {currentContent.account.permissions.proDescription}
                      </p>
                      <div className="flex items-center space-x-3">
                        <button className="px-4 py-2 text-sm rounded-lg transition-colors" style={{ backgroundColor: '#20808D', color: 'white' }}>
                          {currentContent.account.permissions.upgradeNow}
                        </button>
                        <button className="px-4 py-2 text-sm border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors">
                          {currentContent.account.permissions.learnMore}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Occupation section */}
                <div className="mt-8">
                  <h2 className="text-lg font-semibold mb-6">{currentContent.account.occupation.title}</h2>
                  <div className="p-6 bg-[#2a2a2a] border border-gray-700 rounded-lg">
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {currentContent.account.occupation.label}
                      </label>
                      <div className="relative">
                        <select className="appearance-none w-full px-4 py-2.5 pr-10 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-gray-600 cursor-pointer">
                          <option>{currentContent.account.occupation.selectPlaceholder}</option>
                          <option>{currentContent.account.occupation.veterinarian}</option>
                          <option>{currentContent.account.occupation.student}</option>
                          <option>{currentContent.account.occupation.nurse}</option>
                          <option>{currentContent.account.occupation.technician}</option>
                          <option>{currentContent.account.occupation.researcher}</option>
                          <option>{currentContent.account.occupation.other}</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="p-4 bg-[#1a1a1a] border border-gray-700 rounded-lg">
                      <h3 className="text-center text-base font-semibold text-gray-200 mb-3">
                        {currentContent.account.occupation.credentials}
                      </h3>
                      <p className="text-xs text-gray-400 text-center mb-6">
                        {currentContent.account.occupation.credentialsDescription}
                      </p>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-2">
                            {currentContent.account.occupation.school}
                          </label>
                          <input
                            type="text"
                            placeholder={currentContent.account.occupation.schoolPlaceholder}
                            className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-gray-600"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-2">
                              {currentContent.account.occupation.graduationYear}
                            </label>
                            <div className="relative">
                              <select className="appearance-none w-full px-4 py-2.5 pr-10 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-gray-600 cursor-pointer">
                                <option>2024</option>
                                <option>2025</option>
                                <option>2026</option>
                                <option>2027</option>
                                <option>2028</option>
                                <option>2029</option>
                                <option>2030</option>
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-2">
                              {currentContent.account.occupation.month}
                            </label>
                            <div className="relative">
                              <select className="appearance-none w-full px-4 py-2.5 pr-10 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-gray-600 cursor-pointer">
                                <option>{currentContent.months.january}</option>
                                <option>{currentContent.months.february}</option>
                                <option>{currentContent.months.march}</option>
                                <option>{currentContent.months.april}</option>
                                <option>{currentContent.months.may}</option>
                                <option>{currentContent.months.june}</option>
                                <option>{currentContent.months.july}</option>
                                <option>{currentContent.months.august}</option>
                                <option>{currentContent.months.september}</option>
                                <option>{currentContent.months.october}</option>
                                <option>{currentContent.months.november}</option>
                                <option>{currentContent.months.december}</option>
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                          </div>
                        </div>

                        <div className="pt-2">
                          <p className="text-xs text-gray-400">
                            {currentContent.account.occupation.verificationNote}{' '}
                            <button className="text-[#20808D] hover:underline">
                              {currentContent.account.occupation.uploadNew}
                            </button>{' '}
                            {currentContent.account.occupation.uploadNewSuffix}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferences Section (Mobile) */}
              <div>
                <h1 className="text-2xl font-semibold mb-6">{currentContent.preferences.title}</h1>

                <div className="space-y-8">
                  {/* General Section */}
                  <div className="space-y-0">
                    {/* Theme */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-800">
                      <div>
                        <h3 className="text-sm font-medium text-gray-300">{currentContent.preferences.theme.label}</h3>
                        <p className="text-xs text-gray-500 mt-1">{currentContent.preferences.theme.description}</p>
                      </div>
                      <div className="relative theme-selector">
                        <button
                          onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                          className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors min-w-[120px]"
                        >
                          <span className="text-sm flex-1 text-left">{getThemeDisplayText()}</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${showThemeDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showThemeDropdown && (
                          <div className="absolute right-0 top-full mt-2 bg-[#2a2a2a] border border-gray-700 rounded-lg shadow-lg overflow-hidden min-w-[120px] z-10">
                            <button onClick={() => { setSelectedThemeType("dark"); setShowThemeDropdown(false); }} className={`w-full text-left px-4 py-2 text-sm ${selectedThemeType === "dark" ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-900"} transition-colors`}>{currentContent.preferences.theme.dark}</button>
                            <button onClick={() => { setSelectedThemeType("light"); setShowThemeDropdown(false); }} className={`w-full text-left px-4 py-2 text-sm ${selectedThemeType === "light" ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-900"} transition-colors`}>{currentContent.preferences.theme.light}</button>
                            <button onClick={() => { setSelectedThemeType("system"); setShowThemeDropdown(false); }} className={`w-full text-left px-4 py-2 text-sm ${selectedThemeType === "system" ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-900"} transition-colors`}>{currentContent.preferences.theme.system}</button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Language */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-800">
                      <div>
                        <h3 className="text-sm font-medium text-gray-300">{currentContent.preferences.language.label}</h3>
                        <p className="text-xs text-gray-500 mt-1">{currentContent.preferences.language.description}</p>
                      </div>
                      <div className="relative language-selector">
                        <button onClick={() => setShowLanguageDropdown(!showLanguageDropdown)} className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors min-w-[140px]">
                          <Globe className="w-4 h-4" />
                          <span className="text-sm flex-1 text-left">{language}</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showLanguageDropdown && (
                          <div className="absolute right-0 top-full mt-2 bg-[#2a2a2a] border border-gray-700 rounded-lg shadow-lg overflow-hidden min-w-[140px] z-10">
                            <button onClick={() => { setLanguage("English"); setShowLanguageDropdown(false); }} className={`w-full text-left px-4 py-2 text-sm ${language === "English" ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-900"} transition-colors`}>English</button>
                            <button onClick={() => { setLanguage("한국어"); setShowLanguageDropdown(false); }} className={`w-full text-left px-4 py-2 text-sm ${language === "한국어" ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-900"} transition-colors`}>한국어</button>
                            <button onClick={() => { setLanguage("日本語"); setShowLanguageDropdown(false); }} className={`w-full text-left px-4 py-2 text-sm ${language === "日本語" ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-900"} transition-colors`}>日本語</button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Auto-save */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-800">
                      <div>
                        <h3 className="text-sm font-medium text-gray-300">{currentContent.preferences.autoSave.label}</h3>
                        <p className="text-xs text-gray-500 mt-1">{currentContent.preferences.autoSave.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#20808D]"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notifications Section (Mobile) */}
              <div>
                <h1 className="text-2xl font-semibold mb-6">{currentContent.notifications.title}</h1>
                <div className="space-y-0">
                  {/* Email notifications */}
                  <div className="flex items-center justify-between py-4 border-b border-gray-800">
                    <div>
                      <h3 className="text-sm font-medium text-gray-300">{currentContent.notifications.email.label}</h3>
                      <p className="text-xs text-gray-500 mt-1">{currentContent.notifications.email.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#20808D]"></div>
                    </label>
                  </div>

                  {/* Push notifications */}
                  <div className="flex items-center justify-between py-4 border-b border-gray-800">
                    <div>
                      <h3 className="text-sm font-medium text-gray-300">{currentContent.notifications.push.label}</h3>
                      <p className="text-xs text-gray-500 mt-1">{currentContent.notifications.push.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#20808D]"></div>
                    </label>
                  </div>

                  {/* New features */}
                  <div className="flex items-center justify-between py-4 border-b border-gray-800">
                    <div>
                      <h3 className="text-sm font-medium text-gray-300">{currentContent.notifications.newFeatures.label}</h3>
                      <p className="text-xs text-gray-500 mt-1">{currentContent.notifications.newFeatures.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#20808D]"></div>
                    </label>
                  </div>

                  {/* System updates */}
                  <div className="flex items-center justify-between py-4 border-b border-gray-800">
                    <div>
                      <h3 className="text-sm font-medium text-gray-300">{currentContent.notifications.systemUpdates.label}</h3>
                      <p className="text-xs text-gray-500 mt-1">{currentContent.notifications.systemUpdates.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#20808D]"></div>
                    </label>
                  </div>

                  {/* Tips and suggestions */}
                  <div className="flex items-center justify-between py-4 border-b border-gray-800">
                    <div>
                      <h3 className="text-sm font-medium text-gray-300">{currentContent.notifications.tips.label}</h3>
                      <p className="text-xs text-gray-500 mt-1">{currentContent.notifications.tips.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#20808D]"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 데스크톱: 탭 방식 */}
            <div className="hidden md:block">
            {/* Account Tab */}
            {activeTab === "account" && (
              <div>
                <h1 className="text-2xl font-semibold mb-12">{currentContent.preferences.title}</h1>

                <div className="space-y-8">
                  {/* General Section */}
                  <div className="space-y-0">
                    {/* Theme */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-800">
                      <div>
                        <h3 className="text-sm font-medium text-gray-300">{currentContent.preferences.theme.label}</h3>
                        <p className="text-xs text-gray-500 mt-1">{currentContent.preferences.theme.description}</p>
                      </div>
                      <div className="relative theme-selector">
                        <button
                          onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                          className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors min-w-[120px]"
                        >
                          <span className="text-sm flex-1 text-left">{getThemeDisplayText()}</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${showThemeDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Theme Dropdown */}
                        {showThemeDropdown && (
                          <div className="absolute right-0 top-full mt-2 bg-[#2a2a2a] border border-gray-700 rounded-lg shadow-lg overflow-hidden min-w-[120px] z-10">
                            <button
                              onClick={() => {
                                setSelectedThemeType("dark");
                                setShowThemeDropdown(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm ${
                                selectedThemeType === "dark"
                                  ? "bg-gray-800 text-white"
                                  : "text-gray-400 hover:bg-gray-900"
                              } transition-colors`}
                            >
                              {currentContent.preferences.theme.dark}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedThemeType("light");
                                setShowThemeDropdown(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm ${
                                selectedThemeType === "light"
                                  ? "bg-gray-800 text-white"
                                  : "text-gray-400 hover:bg-gray-900"
                              } transition-colors`}
                            >
                              {currentContent.preferences.theme.light}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedThemeType("system");
                                setShowThemeDropdown(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm ${
                                selectedThemeType === "system"
                                  ? "bg-gray-800 text-white"
                                  : "text-gray-400 hover:bg-gray-900"
                              } transition-colors`}
                            >
                              {currentContent.preferences.theme.system}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Language */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-800">
                      <div>
                        <h3 className="text-sm font-medium text-gray-300">{currentContent.preferences.language.label}</h3>
                        <p className="text-xs text-gray-500 mt-1">{currentContent.preferences.language.description}</p>
                      </div>
                      <div className="relative language-selector">
                        <button
                          onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                          className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors min-w-[140px]"
                        >
                          <Globe className="w-4 h-4" />
                          <span className="text-sm flex-1 text-left">{language}</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Language Dropdown */}
                        {showLanguageDropdown && (
                          <div className="absolute right-0 top-full mt-2 bg-[#2a2a2a] border border-gray-700 rounded-lg shadow-lg overflow-hidden min-w-[140px] z-10">
                            <button
                              onClick={() => {
                                setLanguage("English");
                                setShowLanguageDropdown(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm ${
                                language === "English"
                                  ? "bg-gray-800 text-white"
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
                                  ? "bg-gray-800 text-white"
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
                                  ? "bg-gray-800 text-white"
                                  : "text-gray-400 hover:bg-gray-900"
                              } transition-colors`}
                            >
                              日本語
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Preferred Language */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-800">
                      <div>
                        <h3 className="text-sm font-medium text-gray-300">{currentContent.preferences.preferredLanguage.label}</h3>
                        <p className="text-xs text-gray-500 mt-1">{currentContent.preferences.preferredLanguage.description}</p>
                      </div>
                      <div className="relative preferred-language-selector">
                        <button
                          onClick={() => setShowPreferredLanguageDropdown(!showPreferredLanguageDropdown)}
                          className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors min-w-[160px]"
                        >
                          <span className="text-sm flex-1 text-left">{getPreferredLanguageDisplayText()}</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${showPreferredLanguageDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Preferred Language Dropdown */}
                        {showPreferredLanguageDropdown && (
                          <div className="absolute right-0 top-full mt-2 bg-[#2a2a2a] border border-gray-700 rounded-lg shadow-lg overflow-hidden min-w-[160px] z-10">
                            <button
                              onClick={() => {
                                setSelectedPreferredLanguageType("auto");
                                setShowPreferredLanguageDropdown(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm ${
                                selectedPreferredLanguageType === "auto"
                                  ? "bg-gray-800 text-white"
                                  : "text-gray-400 hover:bg-gray-900"
                              } transition-colors`}
                            >
                              {currentContent.preferences.preferredLanguage.autoDetect}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPreferredLanguageType("en");
                                setShowPreferredLanguageDropdown(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm ${
                                selectedPreferredLanguageType === "en"
                                  ? "bg-gray-800 text-white"
                                  : "text-gray-400 hover:bg-gray-900"
                              } transition-colors`}
                            >
                              English
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPreferredLanguageType("ko");
                                setShowPreferredLanguageDropdown(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm ${
                                selectedPreferredLanguageType === "ko"
                                  ? "bg-gray-800 text-white"
                                  : "text-gray-400 hover:bg-gray-900"
                              } transition-colors`}
                            >
                              한국어
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPreferredLanguageType("ja");
                                setShowPreferredLanguageDropdown(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm ${
                                selectedPreferredLanguageType === "ja"
                                  ? "bg-gray-800 text-white"
                                  : "text-gray-400 hover:bg-gray-900"
                              } transition-colors`}
                            >
                              日本語
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Auto-save */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-800">
                      <div>
                        <h3 className="text-sm font-medium text-gray-300">{currentContent.preferences.autoSave.label}</h3>
                        <p className="text-xs text-gray-500 mt-1">{currentContent.preferences.autoSave.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#20808D]"></div>
                      </label>
                    </div>

                    {/* Homepage Widget */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-800">
                      <div>
                        <h3 className="text-sm font-medium text-gray-300">{currentContent.preferences.homepageWidget.label}</h3>
                        <p className="text-xs text-gray-500 mt-1">{currentContent.preferences.homepageWidget.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#20808D]"></div>
                      </label>
                    </div>
                  </div>

                  {/* Advanced Section */}
                  <div>
                    <h2 className="text-lg font-semibold mb-4">{currentContent.preferences.advanced.title}</h2>

                    <div className="space-y-0">
                      {/* Model */}
                      <div className="flex items-center justify-between py-4 border-b border-gray-800">
                        <div>
                          <h3 className="text-sm font-medium text-gray-300">{currentContent.preferences.advanced.model}</h3>
                        </div>
                        <button className="px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white text-sm hover:bg-gray-800 transition-colors min-w-[120px] text-left flex items-center justify-between">
                          <span>{currentContent.preferences.advanced.openInNewTab}</span>
                        </button>
                      </div>

                      {/* Image Generation Model */}
                      <div className="flex items-center justify-between py-4 border-b border-gray-800">
                        <div>
                          <h3 className="text-sm font-medium text-gray-300">{currentContent.preferences.advanced.imageGeneration}</h3>
                        </div>
                        <div className="relative image-gen-selector">
                          <button
                            onClick={() => setShowImageGenDropdown(!showImageGenDropdown)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors min-w-[140px]"
                          >
                            <span className="text-sm flex-1 text-left">{getImageGenDisplayText()}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${showImageGenDropdown ? 'rotate-180' : ''}`} />
                          </button>

                          {/* Image Generation Dropdown */}
                          {showImageGenDropdown && (
                            <div className="absolute right-0 top-full mt-2 bg-[#2a2a2a] border border-gray-700 rounded-lg shadow-lg overflow-hidden min-w-[140px] z-10">
                              <button
                                onClick={() => {
                                  setSelectedImageGenType("default");
                                  setShowImageGenDropdown(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm ${
                                  selectedImageGenType === "default"
                                    ? "bg-gray-800 text-white"
                                    : "text-gray-400 hover:bg-gray-900"
                                } transition-colors`}
                              >
                                {currentContent.preferences.advanced.default}
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedImageGenType("dalle3");
                                  setShowImageGenDropdown(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm ${
                                  selectedImageGenType === "dalle3"
                                    ? "bg-gray-800 text-white"
                                    : "text-gray-400 hover:bg-gray-900"
                                } transition-colors`}
                              >
                                DALL-E 3
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedImageGenType("stable");
                                  setShowImageGenDropdown(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm ${
                                  selectedImageGenType === "stable"
                                    ? "bg-gray-800 text-white"
                                    : "text-gray-400 hover:bg-gray-900"
                                } transition-colors`}
                              >
                                Stable Diffusion
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* AI Data Usage */}
                      <div className="flex items-center justify-between py-4 border-b border-gray-800">
                        <div className="flex-1 max-w-xl">
                          <h3 className="text-sm font-medium text-gray-300">{currentContent.preferences.advanced.aiDataUsage}</h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {currentContent.preferences.advanced.aiDataDescription}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#20808D]"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div>
                <h1 className="text-2xl font-semibold mb-12">{currentContent.notifications.title}</h1>

                <div className="space-y-0">
                  {/* Email notifications */}
                  <div className="flex items-center justify-between py-4 border-b border-gray-800">
                    <div>
                      <h3 className="text-sm font-medium text-gray-300">{currentContent.notifications.email.label}</h3>
                      <p className="text-xs text-gray-500 mt-1">{currentContent.notifications.email.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#20808D]"></div>
                    </label>
                  </div>

                  {/* Push notifications */}
                  <div className="flex items-center justify-between py-4 border-b border-gray-800">
                    <div>
                      <h3 className="text-sm font-medium text-gray-300">{currentContent.notifications.push.label}</h3>
                      <p className="text-xs text-gray-500 mt-1">{currentContent.notifications.push.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#20808D]"></div>
                    </label>
                  </div>

                  {/* New features */}
                  <div className="flex items-center justify-between py-4 border-b border-gray-800">
                    <div>
                      <h3 className="text-sm font-medium text-gray-300">{currentContent.notifications.newFeatures.label}</h3>
                      <p className="text-xs text-gray-500 mt-1">{currentContent.notifications.newFeatures.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#20808D]"></div>
                    </label>
                  </div>

                  {/* System updates */}
                  <div className="flex items-center justify-between py-4 border-b border-gray-800">
                    <div>
                      <h3 className="text-sm font-medium text-gray-300">{currentContent.notifications.systemUpdates.label}</h3>
                      <p className="text-xs text-gray-500 mt-1">{currentContent.notifications.systemUpdates.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#20808D]"></div>
                    </label>
                  </div>

                  {/* Tips and suggestions */}
                  <div className="flex items-center justify-between py-4 border-b border-gray-800">
                    <div>
                      <h3 className="text-sm font-medium text-gray-300">{currentContent.notifications.tips.label}</h3>
                      <p className="text-xs text-gray-500 mt-1">{currentContent.notifications.tips.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#20808D]"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Change Name Modal */}
      {showNameModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#2a2a2a] rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">{currentContent.modals.changeName.title}</h2>
              <button
                onClick={() => setShowNameModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {currentContent.modals.changeName.label}
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-gray-600"
                placeholder={currentContent.modals.changeName.placeholder}
                autoFocus
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowNameModal(false)}
                className="flex-1 px-4 py-2.5 text-sm border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
              >
                {currentContent.modals.changeName.cancel}
              </button>
              <button
                onClick={handleChangeName}
                disabled={!newName.trim() || isSaving}
                className="flex-1 px-4 py-2.5 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#20808D', color: 'white' }}
              >
                {isSaving ? currentContent.modals.changeName.saving : currentContent.modals.changeName.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Username Modal */}
      {showUsernameModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#2a2a2a] rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">{currentContent.modals.changeUsername.title}</h2>
              <button
                onClick={() => setShowUsernameModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {currentContent.modals.changeUsername.label}
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-gray-600"
                placeholder={currentContent.modals.changeUsername.placeholder}
                autoFocus
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowUsernameModal(false)}
                className="flex-1 px-4 py-2.5 text-sm border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
              >
                {currentContent.modals.changeUsername.cancel}
              </button>
              <button
                onClick={handleChangeUsername}
                disabled={!newUsername.trim() || isSaving}
                className="flex-1 px-4 py-2.5 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#20808D', color: 'white' }}
              >
                {isSaving ? currentContent.modals.changeUsername.saving : currentContent.modals.changeUsername.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
