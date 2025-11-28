"use client";

import { useState, useEffect, useRef } from "react";
import { PanelLeft, MessageSquare, Clock, FolderOpen, User, ArrowUpCircle, Bell, Settings, HelpCircle, LogOut, ChevronRight, Plus, MoreVertical, Star, Edit2, FolderPlus, Trash2, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserConversations, deleteConversation, updateConversationTitle, toggleFavorite, getFavoriteConversations } from "@/lib/chatService";
import { ChatListItem } from "@/types/chat";
import { signOut as firebaseSignOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import MoveToProjectModal from "./MoveToProjectModal";
import RenameChatModal from "./RenameChatModal";
import LoginModal from "./LoginModal";
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
}

export default function Sidebar({ isOpen, onToggle, currentConversationId, currentView, onNewChat, onSelectChat, onShowHistory, onShowCollections, refreshKey }: SidebarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showLearnMoreSubmenu, setShowLearnMoreSubmenu] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [hoveredConversation, setHoveredConversation] = useState<string | null>(null);
  const [moveModalConversationId, setMoveModalConversationId] = useState<string | null>(null);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [conversationToRename, setConversationToRename] = useState<{ id: string; title: string } | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);
  const learnMoreRef = useRef<HTMLDivElement>(null);
  const learnMoreTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatListItem[]>([]);
  const [favoriteConversations, setFavoriteConversations] = useState<ChatListItem[]>([]);
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);

  // 사용자 대화 목록 불러오기
  useEffect(() => {
    const loadConversations = async () => {
      if (user) {
        console.log("=== LOADING CONVERSATIONS FOR USER ===");
        console.log("Current user email:", user.email);
        console.log("Current user uid:", user.uid);
        try {
          const userConversations = await getUserConversations(user.uid);
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

      // 대화 드롭다운 닫기
      if (activeDropdown) {
        const dropdownRef = dropdownRefs.current[activeDropdown];
        if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
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
    setShowLoginModal(true);
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
    <div
      className={`${
        isOpen ? "w-64" : "w-12"
      } transition-[width] duration-300 ease-in-out bg-[#1a1a1a] border-r border-gray-700 flex flex-col overflow-hidden`}
    >
      <div className={`flex flex-col h-full ${isOpen ? 'p-4' : 'px-2 py-4'}`}>
        {/* 상단 메뉴 항목들 */}
        <nav className="flex flex-col space-y-2 mb-4">
          {/* 토글 버튼 */}
          <button
            onClick={onToggle}
            className={`group flex items-center ${isOpen ? 'space-x-3 px-3' : 'justify-center px-2'} py-2 rounded-lg hover:bg-gray-700 transition-colors`}
          >
            <PanelLeft className="w-4 h-4 flex-shrink-0 group-hover:text-[#4DB8C4] transition-colors" />
          </button>

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className={`group flex items-center ${isOpen ? 'space-x-3 px-3' : 'justify-center px-2'} py-2 rounded-lg hover:bg-gray-700 transition-colors text-left`}
          >
            <Plus className="w-4 h-4 flex-shrink-0 group-hover:text-[#4DB8C4] transition-colors" />
            <span className={`whitespace-nowrap text-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>New Chat</span>
          </button>

          <button
            onClick={onShowHistory}
            className={`group flex items-center ${isOpen ? 'space-x-3 px-3' : 'justify-center px-2'} py-2 rounded-lg transition-colors text-left ${
              currentView === 'history' ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
          >
            <Clock className="w-4 h-4 flex-shrink-0 group-hover:text-[#4DB8C4] transition-colors" />
            <span className={`whitespace-nowrap text-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>History</span>
          </button>

          <button
            onClick={onShowCollections}
            className={`group flex items-center ${isOpen ? 'space-x-3 px-3' : 'justify-center px-2'} py-2 rounded-lg transition-colors text-left ${
              currentView === 'collections' || currentView === 'projectDetail' ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
          >
            <FolderOpen className="w-4 h-4 flex-shrink-0 group-hover:text-[#4DB8C4] transition-colors" />
            <span className={`whitespace-nowrap text-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Collections</span>
          </button>
        </nav>

        {isOpen && (
          <>
            {/* Favorites Section */}
            <div className="mb-6">
              <h3 className="text-sm text-gray-400 mb-2 px-1">Favorites</h3>
              <div className="space-y-0">
                {favoriteConversations.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-gray-600 text-center">
                    No favorites yet
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
                          <div className="text-sm text-gray-300 truncate">
                            {conversation.title}
                          </div>
                        </button>

                        {/* 3점 메뉴 버튼 - hover 시에만 표시 */}
                        {hoveredConversation === conversation.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === conversation.id ? null : conversation.id);
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
                          className="absolute right-2 top-full mt-1 bg-[#2a2a2a] rounded-lg border border-gray-700 shadow-lg z-50 min-w-[200px]"
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
                              <span className="text-sm text-gray-200">Remove From Favorites</span>
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
                              <span className="text-sm text-gray-200">Rename</span>
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
                              <span className="text-sm text-gray-200">Add to Project</span>
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
                              <span className="text-sm text-red-400">Delete</span>
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
            <div className="flex-1 overflow-y-auto mb-4">
              <h3 className="text-sm text-gray-400 mb-2 px-1">Recent Chats</h3>
              <div className="space-y-0">
                {user && conversations.filter(conv => !conv.isFavorite).length === 0 ? (
                  <div className="px-3 py-4 text-sm text-gray-500 text-center">
                    No chat history
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
                          <div className="text-sm text-gray-300 truncate">
                            {conversation.title}
                          </div>
                        </button>

                        {/* 3점 메뉴 버튼 - hover 시에만 표시 */}
                        {hoveredConversation === conversation.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === conversation.id ? null : conversation.id);
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
                          className="absolute right-2 top-full mt-1 bg-[#2a2a2a] rounded-lg border border-gray-700 shadow-lg z-50 min-w-[180px]"
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
                              <span className="text-sm text-gray-200">Favorite</span>
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
                              <span className="text-sm text-gray-200">Rename</span>
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
                              <span className="text-sm text-gray-200">Add to Project</span>
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
                              <span className="text-sm text-red-400">Delete</span>
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
                <div className={`absolute bottom-full mb-2 bg-[#2a2a2a] rounded-lg border border-gray-700 shadow-lg overflow-hidden z-50 ${
                  isOpen ? 'left-0 w-56' : 'left-12 w-56'
                }`}>
                  <div className="p-4">
                    <h3 className="text-base font-semibold mb-3">Notifications</h3>
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mb-3">
                        <Bell className="w-6 h-6 text-gray-500" />
                      </div>
                      <p className="text-gray-400 text-center text-sm">
                        Your notifications will appear here.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowNotificationMenu(!showNotificationMenu)}
                className={`group flex items-center ${isOpen ? 'space-x-3 px-3 w-full' : 'justify-center px-2'} py-2 rounded-lg hover:bg-gray-700 transition-colors text-left`}
              >
                <Bell className="w-4 h-4 flex-shrink-0 group-hover:text-[#4DB8C4] transition-colors" />
                <span className={`whitespace-nowrap text-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Notifications</span>
              </button>
            </div>
          )}

          {/* Upgrade Button */}
          <button
            onClick={() => router.push('/upgrade')}
            className={`group flex items-center ${isOpen ? 'space-x-3 px-3 w-full' : 'justify-center px-2'} py-2 rounded-lg hover:bg-gray-700 transition-colors text-left`}
          >
            <ArrowUpCircle className="w-4 h-4 flex-shrink-0 group-hover:text-[#4DB8C4] transition-colors" />
            <span className={`whitespace-nowrap text-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Upgrade</span>
          </button>

          {/* 프로필 버튼 */}
          <div className="relative" ref={profileMenuRef}>
            {/* 프로필 드롭다운 메뉴 (위쪽으로 나타남) */}
            {showProfileMenu && (
              <div className={`absolute bottom-full mb-2 bg-[#2a2a2a] rounded-lg border border-gray-700 shadow-lg overflow-hidden z-50 ${
                isOpen ? 'left-0 right-0' : 'left-12 w-56'
              }`}>
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
                        <span className="text-sm text-gray-200">Settings</span>
                        <Settings className="w-4 h-4 text-gray-400 group-hover:text-[#4DB8C4] transition-colors" strokeWidth={1.5} />
                      </button>

                      {/* Get help */}
                      <button className="w-full flex items-center justify-between px-4 py-1.5 hover:bg-gray-700 transition-colors text-left">
                        <span className="text-sm text-gray-200">Help</span>
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
                    <span className="text-sm text-gray-200">Upgrade Plan</span>
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
                      <span className="text-sm text-gray-200">Learn More</span>
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
                            <span className="text-sm text-gray-200">About Ruleout</span>
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
                            <span className="text-sm text-gray-200">Terms of Use</span>
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
                            <span className="text-sm text-gray-200">Privacy Policy</span>
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
                      <span className="text-sm text-gray-200">Log Out</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleLogin}
                      className="w-full flex items-center justify-between px-4 py-1.5 hover:bg-gray-700 transition-colors text-left"
                    >
                      <span className="text-sm text-gray-200">Log In</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`group flex items-center ${isOpen ? 'space-x-3 px-3 w-full' : 'justify-center px-2'} py-2 rounded-lg hover:bg-gray-700 transition-colors text-left`}
            >
              <div className="group-hover:ring-2 group-hover:ring-[#4DB8C4] rounded-full transition-all">
                {renderProfileAvatar()}
              </div>
              <span className={`whitespace-nowrap text-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                {user ? (user.displayName || user.email) : 'Profile'}
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

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Toast 알림 */}
      <Toast
        message="Added to project"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
