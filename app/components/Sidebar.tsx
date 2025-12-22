"use client";

import { useState, useEffect, useRef } from "react";
import { PanelLeft, MessageSquare, Clock, FolderOpen, User, ArrowUpCircle, Bell, Settings, HelpCircle, LogOut, ChevronRight, SquarePen, MoreVertical, Star, Edit2, FolderPlus, Trash2, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getUserConversations, deleteConversation, updateConversationTitle, toggleFavorite, getFavoriteConversations } from "@/lib/chatService";
import { ChatListItem } from "@/types/chat";
import { signOut as firebaseSignOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import MoveToProjectModal from "./MoveToProjectModal";
import RenameChatModal from "./RenameChatModal";
import Toast from "./Toast";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentConversationId: string | null;
  currentView: "home" | "chat" | "history" | "collections" | "projectDetail";
  onNewChat: () => void;
  onSelectChat: (conversationId: string) => void;
  onShowHistory: () => void;
  onShowCollections: () => void;
  refreshKey?: number;
  onShowLoginModal: () => void;
}

export default function Sidebar({ isOpen, onToggle, currentConversationId, currentView, onNewChat, onSelectChat, onShowHistory, onShowCollections, refreshKey, onShowLoginModal }: SidebarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showLearnMoreSubmenu, setShowLearnMoreSubmenu] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [hoveredConversation, setHoveredConversation] = useState<string | null>(null);
  const [moveModalConversationId, setMoveModalConversationId] = useState<string | null>(null);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [conversationToRename, setConversationToRename] = useState<{ id: string; title: string } | null>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);
  const learnMoreRef = useRef<HTMLDivElement>(null);
  const learnMoreTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  const { user } = useAuth();
  const { language } = useLanguage();
  const [conversations, setConversations] = useState<ChatListItem[]>([]);
  const [favoriteConversations, setFavoriteConversations] = useState<ChatListItem[]>([]);
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{[key: string]: 'top' | 'bottom'}>({});

  // Multilingual content
  const content = {
    English: {
      newChat: "New Chat",
      history: "History",
      collections: "Collections",
      favorites: "Favorites",
      noFavorites: "No favorites yet",
      recentChats: "Recent Chats",
      noHistory: "No chat history",
      removeFromFavorites: "Remove From Favorites",
      rename: "Rename",
      addToProject: "Add to Project",
      delete: "Delete",
      favorite: "Favorite",
      notifications: "Notifications",
      noNotifications: "Your notifications will appear here.",
      upgrade: "Upgrade",
      settings: "Settings",
      help: "Help",
      upgradePlan: "Upgrade Plan",
      learnMore: "Learn More",
      aboutRuleout: "About Ruleout",
      termsOfUse: "Terms of Use",
      privacyPolicy: "Privacy Policy",
      logOut: "Log Out",
      logIn: "Log In",
      profile: "Profile",
      addedToProject: "Added to project"
    },
    한국어: {
      newChat: "새 채팅",
      history: "기록",
      collections: "컬렉션",
      favorites: "즐겨찾기",
      noFavorites: "즐겨찾기가 없습니다",
      recentChats: "최근 채팅",
      noHistory: "채팅 기록이 없습니다",
      removeFromFavorites: "즐겨찾기에서 제거",
      rename: "이름 변경",
      addToProject: "프로젝트에 추가",
      delete: "삭제",
      favorite: "즐겨찾기",
      notifications: "알림",
      noNotifications: "알림이 여기에 표시됩니다.",
      upgrade: "업그레이드",
      settings: "설정",
      help: "도움말",
      upgradePlan: "플랜 업그레이드",
      learnMore: "더 알아보기",
      aboutRuleout: "Ruleout 소개",
      termsOfUse: "이용약관",
      privacyPolicy: "개인정보처리방침",
      logOut: "로그아웃",
      logIn: "로그인",
      profile: "프로필",
      addedToProject: "프로젝트에 추가됨"
    },
    日本語: {
      newChat: "新しいチャット",
      history: "履歴",
      collections: "コレクション",
      favorites: "お気に入り",
      noFavorites: "お気に入りはまだありません",
      recentChats: "最近のチャット",
      noHistory: "チャット履歴がありません",
      removeFromFavorites: "お気に入りから削除",
      rename: "名前を変更",
      addToProject: "プロジェクトに追加",
      delete: "削除",
      favorite: "お気に入り",
      notifications: "通知",
      noNotifications: "通知はここに表示されます。",
      upgrade: "アップグレード",
      settings: "設定",
      help: "ヘルプ",
      upgradePlan: "プランをアップグレード",
      learnMore: "詳しく見る",
      aboutRuleout: "Ruleoutについて",
      termsOfUse: "利用規約",
      privacyPolicy: "プライバシーポリシー",
      logOut: "ログアウト",
      logIn: "ログイン",
      profile: "プロフィール",
      addedToProject: "プロジェクトに追加されました"
    }
  };

  const currentContent = content[language as keyof typeof content];

  // 사용자 대화 목록 불러오기
  useEffect(() => {
    const loadConversations = async () => {
      if (user) {
        console.log("=== LOADING CONVERSATIONS FOR USER ===");
        console.log("Current user email:", user.email);
        console.log("Current user uid:", user.uid);
        try {
          const userConversations = await getUserConversations(user.uid, 1000);
          console.log("Loaded conversations:", userConversations);
          console.log("Number of conversations:", userConversations.length);

          // 각 대화의 userId를 확인
          userConversations.forEach((conv, index) => {
            console.log(`Conversation ${index}:`, {
              id: conv.id,
              title: conv.title,
              // userId는 ChatListItem에 없지만 확인 필요
            });
          });

          setConversations(userConversations);

          // Load favorite conversations
          const favorites = await getFavoriteConversations(user.uid);
          console.log("Loaded favorites:", favorites);
          setFavoriteConversations(favorites);
        } catch (error: any) {
          // Firestore 인덱스가 생성 중일 때는 조용히 처리
          if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
            console.log("Firestore 인덱스 생성 대기 중...");
            setConversations([]);
            setFavoriteConversations([]);
          } else {
            console.error("대화 목록 불러오기 실패:", error);
          }
        }
      } else {
        console.log("No user logged in, clearing conversations");
        setConversations([]);
        setFavoriteConversations([]);
      }
    };

    loadConversations();
  }, [user, currentConversationId, refreshKey]);

  // 드롭다운 밖 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }

      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target as Node)) {
        setShowNotificationMenu(false);
      }

      // 대화 드롭다운 닫기 - 3개점 버튼 클릭은 제외
      if (activeDropdown) {
        const dropdownRef = dropdownRefs.current[activeDropdown];
        const target = event.target as HTMLElement;

        // 3개점 버튼이나 그 자식 요소를 클릭한 경우 무시
        const isMoreButton = target.closest('button')?.querySelector('.lucide-more-vertical');

        if (dropdownRef && !dropdownRef.contains(target) && !isMoreButton) {
          setActiveDropdown(null);
        }
      }
    };

    if (showProfileMenu || showNotificationMenu || activeDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu, showNotificationMenu, activeDropdown]);

  // Learn More 타이머 정리
  useEffect(() => {
    return () => {
      if (learnMoreTimerRef.current) {
        clearTimeout(learnMoreTimerRef.current);
      }
    };
  }, []);

  const handleLogout = async () => {
    try {
      await firebaseSignOut();
      setShowProfileMenu(false);
      router.push("/landing");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  const handleLogin = () => {
    setShowProfileMenu(false);
    onShowLoginModal();
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId);
      // 대화 목록 새로고침
      setConversations(conversations.filter(c => c.id !== conversationId));
      setActiveDropdown(null);

      // 삭제한 대화가 현재 열려있다면 홈으로 이동
      if (currentConversationId === conversationId) {
        onNewChat();
      }
    } catch (error) {
      console.error("대화 삭제 실패:", error);
    }
  };

  const handleRenameClick = (conversationId: string, currentTitle: string) => {
    setConversationToRename({ id: conversationId, title: currentTitle });
    setRenameModalOpen(true);
    setActiveDropdown(null);
  };

  const handleRename = async (newTitle: string) => {
    if (!conversationToRename) return;

    try {
      await updateConversationTitle(conversationToRename.id, newTitle);
      // 목록 업데이트
      setConversations(conversations.map(conv =>
        conv.id === conversationToRename.id
          ? { ...conv, title: newTitle }
          : conv
      ));
      setFavoriteConversations(favoriteConversations.map(conv =>
        conv.id === conversationToRename.id
          ? { ...conv, title: newTitle }
          : conv
      ));
    } catch (error) {
      console.error("채팅 제목 변경 오류:", error);
    }
  };

  const handleToggleFavorite = async (conversationId: string, isFavorite: boolean = false) => {
    try {
      console.log("Sidebar: Toggling favorite for", conversationId, "from", isFavorite, "to", !isFavorite);
      await toggleFavorite(conversationId, isFavorite);

      // Reload both lists
      if (user) {
        const userConversations = await getUserConversations(user.uid);
        setConversations(userConversations);
        console.log("Sidebar: Conversations updated:", userConversations.length);

        const favorites = await getFavoriteConversations(user.uid);
        setFavoriteConversations(favorites);
        console.log("Sidebar: Favorites updated:", favorites.length, favorites);
      }

      setActiveDropdown(null);
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  // 프로필 이니셜 아바타 표시
  const renderProfileAvatar = () => {
    if (!user) {
      return <User className="w-4 h-4 flex-shrink-0" />;
    }

    // 이름의 첫 글자로 아바타 생성
    const initial = user.displayName?.[0] || user.email?.[0] || "U";
    return (
      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#20808D' }}>
        <span className="text-[8px] font-bold text-white">{initial.toUpperCase()}</span>
      </div>
    );
  };

  return (
    <>
      {/* 모바일 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* 사이드바 */}
      <div
        className={`${
          isOpen ? "w-64" : "w-12"
        } transition-[width] duration-300 ease-in-out bg-[#1a1a1a] border-r border-gray-700 flex flex-col overflow-hidden
        md:relative fixed inset-y-0 left-0 z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        md:${isOpen ? "w-64" : "w-12"}`}
      >
      <div className="flex flex-col h-full p-2">
        {/* 상단 메뉴 항목들 */}
        <nav className="flex flex-col space-y-2 mb-4">
          {/* 토글 버튼 */}
          <button
            onClick={onToggle}
            className="group relative flex items-center justify-start px-2 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <PanelLeft className="w-4 h-4 flex-shrink-0 group-hover:text-[#4DB8C4] transition-colors" />
          </button>

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className="group relative flex items-center justify-start px-2 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <SquarePen className="w-4 h-4 flex-shrink-0 group-hover:text-[#4DB8C4] transition-colors" />
            <span className={`absolute left-10 whitespace-nowrap text-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              {currentContent.newChat}
            </span>
          </button>

          <button
            onClick={onShowHistory}
            className={`group relative flex items-center justify-start px-2 py-2 rounded-lg transition-colors ${
              currentView === 'history' ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
          >
            <Clock className="w-4 h-4 flex-shrink-0 group-hover:text-[#4DB8C4] transition-colors" />
            <span className={`absolute left-10 whitespace-nowrap text-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              {currentContent.history}
            </span>
          </button>

          <button
            onClick={onShowCollections}
            className={`group relative flex items-center justify-start px-2 py-2 rounded-lg transition-colors ${
              currentView === 'collections' || currentView === 'projectDetail' ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
          >
            <FolderOpen className="w-4 h-4 flex-shrink-0 group-hover:text-[#4DB8C4] transition-colors" />
            <span className={`absolute left-10 whitespace-nowrap text-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              {currentContent.collections}
            </span>
          </button>
        </nav>

        {isOpen && (
          <>
            {/* Favorites Section */}
            <div className="mb-6 animate-fadeIn flex-shrink-0 max-h-[30vh] overflow-y-auto">
              <h3 className="text-sm text-gray-400 mb-2 px-1">{currentContent.favorites}</h3>
              <div className="space-y-0">
                {favoriteConversations.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-gray-600 text-center">
                    {currentContent.noFavorites}
                  </div>
                ) : (
                  favoriteConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className="relative"
                      onMouseEnter={() => setHoveredConversation(conversation.id)}
                      onMouseLeave={() => setHoveredConversation(null)}
                    >
                      <div className="flex items-center justify-between px-2 py-1 rounded-lg">
                        <button
                          onClick={() => onSelectChat(conversation.id)}
                          className={`flex-1 min-w-0 pr-2 text-left rounded-lg px-2 py-1.5 -ml-2 hover:bg-gray-700 transition-colors ${
                            currentConversationId === conversation.id && currentView === 'chat' ? 'bg-gray-700' : ''
                          }`}
                        >
                          <div className="text-sm text-gray-300 truncate whitespace-nowrap overflow-hidden">
                            {conversation.title}
                          </div>
                        </button>

                        {/* 3점 메뉴 버튼 - hover 시에만 표시 */}
                        {hoveredConversation === conversation.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const newDropdownState = activeDropdown === conversation.id ? null : conversation.id;
                              setActiveDropdown(newDropdownState);

                              // 드롭다운 위치 계산
                              if (newDropdownState) {
                                const buttonRect = e.currentTarget.getBoundingClientRect();
                                const viewportHeight = window.innerHeight;
                                const buttonMiddle = buttonRect.top + buttonRect.height / 2;

                                // 버튼이 화면 하단 40%에 있으면 위로 펼침
                                const isInLowerPortion = buttonMiddle > (viewportHeight * 0.6);

                                setDropdownPosition(prev => ({
                                  ...prev,
                                  [conversation.id]: isInLowerPortion ? 'top' : 'bottom'
                                }));
                              }
                            }}
                            className="p-1 hover:bg-gray-600 rounded transition-colors flex-shrink-0"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                        )}
                      </div>

                      {/* 드롭다운 메뉴 - Favorites용 */}
                      {activeDropdown === conversation.id && (
                        <div
                          ref={(el) => { dropdownRefs.current[conversation.id] = el; }}
                          className={`absolute right-2 bg-[#2a2a2a] rounded-lg border border-gray-700 shadow-lg z-50 min-w-[200px] ${
                            dropdownPosition[conversation.id] === 'top'
                              ? 'bottom-full mb-1'
                              : 'top-full mt-1'
                          }`}
                        >
                          <div className="py-1">
                            {/* Remove From Favorites */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFavorite(conversation.id, conversation.isFavorite);
                              }}
                              className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-700 transition-colors text-left"
                            >
                              <Star className="w-4 h-4" style={{ color: '#20808D' }} />
                              <span className="text-sm text-gray-200">{currentContent.removeFromFavorites}</span>
                            </button>

                            {/* Rename */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRenameClick(conversation.id, conversation.title);
                              }}
                              className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-700 transition-colors text-left"
                            >
                              <Edit2 className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-200">{currentContent.rename}</span>
                            </button>

                            {/* Add to Project */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setMoveModalConversationId(conversation.id);
                                setActiveDropdown(null);
                              }}
                              className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-700 transition-colors text-left"
                            >
                              <FolderPlus className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-200">{currentContent.addToProject}</span>
                            </button>

                            {/* Divider */}
                            <div className="border-t border-gray-700 my-1"></div>

                            {/* Delete */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteConversation(conversation.id);
                              }}
                              className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-700 transition-colors text-left"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                              <span className="text-sm text-red-400">{currentContent.delete}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Chats Section */}
            <div className="flex-1 overflow-y-auto mb-4 animate-fadeIn min-h-0">
              <h3 className="text-sm text-gray-400 mb-2 px-1">{currentContent.recentChats}</h3>
              <div className="space-y-0">
                {user && conversations.filter(conv => !conv.isFavorite).length === 0 ? (
                  <div className="px-3 py-4 text-sm text-gray-500 text-center">
                    {currentContent.noHistory}
                  </div>
                ) : (
                  conversations.filter(conv => {
                    const shouldShow = !conv.isFavorite;
                    if (conv.isFavorite) {
                      console.log("Filtering out favorited chat from Recent:", conv.id, conv.title);
                    }
                    return shouldShow;
                  }).map((conversation) => (
                    <div
                      key={conversation.id}
                      className="relative"
                      onMouseEnter={() => setHoveredConversation(conversation.id)}
                      onMouseLeave={() => setHoveredConversation(null)}
                    >
                      <div className="flex items-center justify-between px-2 py-1 rounded-lg">
                        <button
                          onClick={() => onSelectChat(conversation.id)}
                          className={`flex-1 min-w-0 pr-2 text-left rounded-lg px-2 py-1.5 -ml-2 hover:bg-gray-700 transition-colors ${
                            currentConversationId === conversation.id && currentView === 'chat' ? 'bg-gray-700' : ''
                          }`}
                        >
                          <div className="text-sm text-gray-300 truncate whitespace-nowrap overflow-hidden">
                            {conversation.title}
                          </div>
                        </button>

                        {/* 3점 메뉴 버튼 - hover 시에만 표시 */}
                        {hoveredConversation === conversation.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const newDropdownState = activeDropdown === conversation.id ? null : conversation.id;
                              setActiveDropdown(newDropdownState);

                              // 드롭다운 위치 계산
                              if (newDropdownState) {
                                const buttonRect = e.currentTarget.getBoundingClientRect();
                                const viewportHeight = window.innerHeight;
                                const buttonMiddle = buttonRect.top + buttonRect.height / 2;

                                // 버튼이 화면 하단 40%에 있으면 위로 펼침
                                const isInLowerPortion = buttonMiddle > (viewportHeight * 0.6);

                                setDropdownPosition(prev => ({
                                  ...prev,
                                  [conversation.id]: isInLowerPortion ? 'top' : 'bottom'
                                }));
                              }
                            }}
                            className="p-1 hover:bg-gray-600 rounded transition-colors flex-shrink-0"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                        )}
                      </div>

                      {/* 드롭다운 메뉴 */}
                      {activeDropdown === conversation.id && (
                        <div
                          ref={(el) => { dropdownRefs.current[conversation.id] = el; }}
                          className={`absolute right-2 bg-[#2a2a2a] rounded-lg border border-gray-700 shadow-lg z-50 min-w-[180px] ${
                            dropdownPosition[conversation.id] === 'top'
                              ? 'bottom-full mb-1'
                              : 'top-full mt-1'
                          }`}
                        >
                          <div className="py-1">
                            {/* 즐겨찾기 */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFavorite(conversation.id, conversation.isFavorite);
                              }}
                              className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-700 transition-colors text-left"
                            >
                              <Star className="w-4 h-4" style={{ color: conversation.isFavorite ? '#20808D' : '#9ca3af' }} />
                              <span className="text-sm text-gray-200">{currentContent.favorite}</span>
                            </button>

                            {/* Rename */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRenameClick(conversation.id, conversation.title);
                              }}
                              className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-700 transition-colors text-left"
                            >
                              <Edit2 className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-200">{currentContent.rename}</span>
                            </button>

                            {/* Add to Project */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setMoveModalConversationId(conversation.id);
                                setActiveDropdown(null);
                              }}
                              className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-700 transition-colors text-left"
                            >
                              <FolderPlus className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-200">{currentContent.addToProject}</span>
                            </button>

                            {/* Divider */}
                            <div className="border-t border-gray-700 my-1"></div>

                            {/* Delete */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteConversation(conversation.id);
                              }}
                              className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-700 transition-colors text-left"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                              <span className="text-sm text-red-400">{currentContent.delete}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* flex-1로 공간 확보하여 하단 버튼들을 아래로 밀어냄 */}
        {!isOpen && <div className="flex-1" />}

        {/* 하단 버튼들 - 항상 아래에 고정 */}
        <div className="border-t border-gray-700 pt-4 space-y-2 mt-auto">
          {/* 알람 버튼 - 로그인한 경우에만 표시 */}
          {user && (
            <div className="relative" ref={notificationMenuRef}>
              {/* 알림 드롭다운 메뉴 (위쪽으로 나타남) */}
              {showNotificationMenu && (
                <div
                  className="fixed bg-[#2a2a2a] rounded-lg border border-gray-700 shadow-lg overflow-hidden w-56"
                  style={{
                    left: notificationMenuRef.current ? `${notificationMenuRef.current.getBoundingClientRect().left}px` : 'auto',
                    bottom: notificationMenuRef.current ? `${window.innerHeight - notificationMenuRef.current.getBoundingClientRect().top + 8}px` : 'auto',
                    zIndex: 9999
                  }}
                >
                  <div className="p-4">
                    <h3 className="text-base font-semibold mb-3">{currentContent.notifications}</h3>
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mb-3">
                        <Bell className="w-6 h-6 text-gray-500" />
                      </div>
                      <p className="text-gray-400 text-center text-sm">
                        {currentContent.noNotifications}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowNotificationMenu(!showNotificationMenu)}
                className="group relative flex items-center justify-start w-full px-2 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Bell className="w-4 h-4 flex-shrink-0 group-hover:text-[#4DB8C4] transition-colors" />
                <span className={`absolute left-10 whitespace-nowrap text-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  {currentContent.notifications}
                </span>
              </button>
            </div>
          )}

          {/* Upgrade Button */}
          <button
            onClick={() => router.push('/upgrade')}
            className="group relative flex items-center justify-start w-full px-2 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowUpCircle className="w-4 h-4 flex-shrink-0 group-hover:text-[#4DB8C4] transition-colors" />
            <span className={`absolute left-10 whitespace-nowrap text-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              {currentContent.upgrade}
            </span>
          </button>

          {/* 프로필 버튼 */}
          <div className="relative" ref={profileMenuRef}>
            {/* 프로필 드롭다운 메뉴 (위쪽으로 나타남) */}
            {showProfileMenu && (
              <div
                className="fixed bg-[#2a2a2a] rounded-lg border border-gray-700 shadow-lg overflow-hidden w-56"
                style={{
                  left: profileMenuRef.current ? `${profileMenuRef.current.getBoundingClientRect().left}px` : 'auto',
                  bottom: profileMenuRef.current ? `${window.innerHeight - profileMenuRef.current.getBoundingClientRect().top + 8}px` : 'auto',
                  zIndex: 9999
                }}
              >
                <div className="py-2">
                  {/* Settings - 로그인한 경우에만 표시 */}
                  {user && (
                    <>
                      <button
                        onClick={() => {
                          router.push('/settings');
                          setShowProfileMenu(false);
                        }}
                        className="group w-full flex items-center justify-between px-4 py-1.5 hover:bg-gray-700 transition-colors text-left"
                      >
                        <span className="text-sm text-gray-200">{currentContent.settings}</span>
                        <Settings className="w-4 h-4 text-gray-400 group-hover:text-[#4DB8C4] transition-colors" strokeWidth={1.5} />
                      </button>

                      {/* Get help */}
                      <button className="w-full flex items-center justify-between px-4 py-1.5 hover:bg-gray-700 transition-colors text-left">
                        <span className="text-sm text-gray-200">{currentContent.help}</span>
                      </button>

                      {/* Divider */}
                      <div className="border-t border-gray-700 my-1"></div>
                    </>
                  )}

                  {/* Upgrade plan */}
                  <button
                    onClick={() => {
                      router.push('/upgrade');
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-1.5 hover:bg-gray-700 transition-colors text-left"
                  >
                    <span className="text-sm text-gray-200">{currentContent.upgradePlan}</span>
                  </button>

                  {/* Learn more */}
                  <div className="relative" ref={learnMoreRef}>
                    <button
                      onMouseEnter={() => {
                        if (learnMoreTimerRef.current) {
                          clearTimeout(learnMoreTimerRef.current);
                        }
                        setShowLearnMoreSubmenu(true);
                      }}
                      onMouseLeave={() => {
                        learnMoreTimerRef.current = setTimeout(() => {
                          setShowLearnMoreSubmenu(false);
                        }, 150);
                      }}
                      className="group w-full flex items-center justify-between px-4 py-1.5 hover:bg-gray-700 transition-colors text-left"
                    >
                      <span className="text-sm text-gray-200">{currentContent.learnMore}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#4DB8C4] transition-colors" strokeWidth={1.5} />
                    </button>

                    {/* Learn More Submenu */}
                    {showLearnMoreSubmenu && (
                      <div
                        onMouseEnter={() => {
                          if (learnMoreTimerRef.current) {
                            clearTimeout(learnMoreTimerRef.current);
                          }
                          setShowLearnMoreSubmenu(true);
                        }}
                        onMouseLeave={() => {
                          learnMoreTimerRef.current = setTimeout(() => {
                            setShowLearnMoreSubmenu(false);
                          }, 150);
                        }}
                        className="fixed bg-[#2a2a2a] rounded-lg border border-gray-700 shadow-lg min-w-[180px] z-[100]"
                        style={{
                          left: learnMoreRef.current ? `${learnMoreRef.current.getBoundingClientRect().right}px` : 'auto',
                          bottom: learnMoreRef.current ? `${window.innerHeight - learnMoreRef.current.getBoundingClientRect().bottom}px` : 'auto'
                        }}
                      >
                        <div className="py-1">
                          {/* About Ruleout */}
                          <button
                            onClick={() => {
                              // TODO: About Ruleout 페이지로 이동
                              setShowProfileMenu(false);
                              setShowLearnMoreSubmenu(false);
                            }}
                            className="w-full px-3 py-1.5 hover:bg-gray-700 transition-colors text-left flex items-center justify-between"
                          >
                            <span className="text-sm text-gray-200">{currentContent.aboutRuleout}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                          </button>

                          {/* Divider */}
                          <div className="border-t border-gray-700 my-1"></div>

                          {/* Terms of Use */}
                          <button
                            onClick={() => {
                              // TODO: Terms of Use 페이지로 이동
                              setShowProfileMenu(false);
                              setShowLearnMoreSubmenu(false);
                            }}
                            className="w-full px-3 py-1.5 hover:bg-gray-700 transition-colors text-left flex items-center justify-between"
                          >
                            <span className="text-sm text-gray-200">{currentContent.termsOfUse}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                          </button>

                          {/* Privacy Policy */}
                          <button
                            onClick={() => {
                              // TODO: Privacy Policy 페이지로 이동
                              setShowProfileMenu(false);
                              setShowLearnMoreSubmenu(false);
                            }}
                            className="w-full px-3 py-1.5 hover:bg-gray-700 transition-colors text-left flex items-center justify-between"
                          >
                            <span className="text-sm text-gray-200">{currentContent.privacyPolicy}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-700 my-1"></div>

                  {/* Log out / Log in */}
                  {user ? (
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between px-4 py-1.5 hover:bg-gray-700 transition-colors text-left"
                    >
                      <span className="text-sm text-gray-200">{currentContent.logOut}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleLogin}
                      className="w-full flex items-center justify-between px-4 py-1.5 hover:bg-gray-700 transition-colors text-left"
                    >
                      <span className="text-sm text-gray-200">{currentContent.logIn}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="group relative flex items-center justify-start w-full px-2 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <div className="group-hover:ring-2 group-hover:ring-[#4DB8C4] rounded-full transition-all">
                {renderProfileAvatar()}
              </div>
              <span className={`absolute left-10 whitespace-nowrap text-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                {user ? (user.displayName || user.email) : currentContent.profile}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 프로젝트로 이동 모달 */}
      <MoveToProjectModal
        conversationId={moveModalConversationId || ""}
        isOpen={!!moveModalConversationId}
        onClose={() => setMoveModalConversationId(null)}
        onSuccess={() => setShowToast(true)}
      />

      {/* Rename Chat Modal */}
      <RenameChatModal
        isOpen={renameModalOpen}
        currentTitle={conversationToRename?.title || ""}
        onClose={() => {
          setRenameModalOpen(false);
          setConversationToRename(null);
        }}
        onRename={handleRename}
      />

      {/* Toast 알림 */}
      <Toast
        message={currentContent.addedToProject}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
    </>
  );
}
