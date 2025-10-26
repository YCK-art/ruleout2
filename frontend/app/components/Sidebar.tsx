"use client";

import { useState, useEffect, useRef } from "react";
import { PanelLeft, MessageSquare, Clock, FolderOpen, User, ArrowUpCircle, Bell, Settings, HelpCircle, LogOut, ChevronRight, Plus, MoreVertical, Star, Edit2, FolderPlus, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserConversations, deleteConversation } from "@/lib/chatService";
import { ChatListItem } from "@/types/chat";
import { signOut as firebaseSignOut } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentConversationId: string | null;
  onNewChat: () => void;
  onSelectChat: (conversationId: string) => void;
  refreshKey?: number;
}

export default function Sidebar({ isOpen, onToggle, currentConversationId, onNewChat, onSelectChat, refreshKey }: SidebarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [hoveredConversation, setHoveredConversation] = useState<string | null>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const dropdownRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatListItem[]>([]);
  const router = useRouter();

  // 사용자 대화 목록 불러오기
  useEffect(() => {
    const loadConversations = async () => {
      if (user) {
        try {
          const userConversations = await getUserConversations(user.uid);
          setConversations(userConversations);
        } catch (error: any) {
          // Firestore 인덱스가 생성 중일 때는 조용히 처리
          if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
            console.log("Firestore 인덱스 생성 대기 중...");
            setConversations([]);
          } else {
            console.error("대화 목록 불러오기 실패:", error);
          }
        }
      } else {
        setConversations([]);
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

      // 대화 드롭다운 닫기
      if (activeDropdown) {
        const dropdownRef = dropdownRefs.current[activeDropdown];
        if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
          setActiveDropdown(null);
        }
      }
    };

    if (showProfileMenu || activeDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu, activeDropdown]);

  const handleLogout = async () => {
    try {
      await firebaseSignOut();
      setShowProfileMenu(false);
      router.push("/landing");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
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

  // 프로필 이니셜 아바타 표시
  const renderProfileAvatar = () => {
    if (!user) {
      return <User className="w-4 h-4 flex-shrink-0" />;
    }

    // 이름의 첫 글자로 아바타 생성
    const initial = user.displayName?.[0] || user.email?.[0] || "U";
    return (
      <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
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
      <div className="flex flex-col h-full p-4">
        {/* 상단 메뉴 항목들 */}
        <nav className="flex flex-col space-y-2 mb-4">
          {/* 토글 버튼 */}
          <button
            onClick={onToggle}
            className={`flex items-center ${isOpen ? 'space-x-3 px-3' : 'justify-center'} py-2 rounded-lg hover:bg-gray-700 transition-colors`}
          >
            <PanelLeft className="w-4 h-4 flex-shrink-0" />
          </button>

          {/* 새 대화 버튼 */}
          <button
            onClick={onNewChat}
            className={`flex items-center ${isOpen ? 'space-x-3 px-3' : 'justify-center'} py-2 rounded-lg hover:bg-gray-700 transition-colors text-left`}
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            <span className={`whitespace-nowrap text-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>새 대화</span>
          </button>

          <button className={`flex items-center ${isOpen ? 'space-x-3 px-3' : 'justify-center'} py-2 rounded-lg hover:bg-gray-700 transition-colors text-left`}>
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span className={`whitespace-nowrap text-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>히스토리</span>
          </button>

          <button className={`flex items-center ${isOpen ? 'space-x-3 px-3' : 'justify-center'} py-2 rounded-lg hover:bg-gray-700 transition-colors text-left`}>
            <FolderOpen className="w-4 h-4 flex-shrink-0" />
            <span className={`whitespace-nowrap text-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>컬렉션</span>
          </button>
        </nav>

        {isOpen && (
          <>
            {/* 최근 대화 섹션 */}
            <div className="flex-1 overflow-y-auto mb-4">
              <h3 className="text-sm text-gray-400 mb-2 px-3">최근 대화</h3>
              <div className="space-y-1">
                {user && conversations.length === 0 ? (
                  <div className="px-3 py-4 text-sm text-gray-500 text-center">
                    대화 내역이 없습니다
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className="relative group"
                      onMouseEnter={() => setHoveredConversation(conversation.id)}
                      onMouseLeave={() => setHoveredConversation(null)}
                    >
                      <div className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors ${
                          currentConversationId === conversation.id ? 'bg-gray-700' : ''
                        } flex items-center justify-between`}
                      >
                        <button
                          onClick={() => onSelectChat(conversation.id)}
                          className="flex-1 min-w-0 pr-2 text-left"
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
                                // TODO: 즐겨찾기 기능 구현
                                setActiveDropdown(null);
                              }}
                              className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-700 transition-colors text-left"
                            >
                              <Star className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-200">즐겨찾기</span>
                            </button>

                            {/* 이름 변경 */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: 이름 변경 기능 구현
                                setActiveDropdown(null);
                              }}
                              className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-700 transition-colors text-left"
                            >
                              <Edit2 className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-200">이름 변경</span>
                            </button>

                            {/* 프로젝트에 추가 */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: 프로젝트 추가 기능 구현
                                setActiveDropdown(null);
                              }}
                              className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-700 transition-colors text-left"
                            >
                              <FolderPlus className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-200">프로젝트에 추가</span>
                            </button>

                            {/* 구분선 */}
                            <div className="border-t border-gray-700 my-1"></div>

                            {/* 삭제 */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteConversation(conversation.id);
                              }}
                              className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-700 transition-colors text-left"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                              <span className="text-sm text-red-400">삭제</span>
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
          {/* 알람 버튼 */}
          <button className={`flex items-center ${isOpen ? 'space-x-3 px-3' : 'justify-center'} py-2 rounded-lg hover:bg-gray-700 transition-colors text-left w-full`}>
            <Bell className="w-4 h-4 flex-shrink-0" />
            <span className={`whitespace-nowrap text-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>알람</span>
          </button>

          {/* 업그레이드 버튼 */}
          <button className={`flex items-center ${isOpen ? 'space-x-3 px-3' : 'justify-center'} py-2 rounded-lg hover:bg-gray-700 transition-colors text-left w-full`}>
            <ArrowUpCircle className="w-4 h-4 flex-shrink-0" />
            <span className={`whitespace-nowrap text-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>업그레이드</span>
          </button>

          {/* 프로필 버튼 */}
          <div className="relative" ref={profileMenuRef}>
            {/* 프로필 드롭다운 메뉴 (위쪽으로 나타남) */}
            {showProfileMenu && (
              <div className={`absolute bottom-full mb-2 bg-[#2a2a2a] rounded-lg border border-gray-700 shadow-lg overflow-hidden z-50 ${
                isOpen ? 'left-0 right-0' : 'left-0 w-56'
              }`}>
                <div className="py-2">
                  {/* Settings */}
                  <button className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-700 transition-colors text-left">
                    <span className="text-sm text-gray-200">설정</span>
                    <Settings className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                  </button>

                  {/* Get help */}
                  <button className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-700 transition-colors text-left">
                    <span className="text-sm text-gray-200">도움말</span>
                  </button>

                  {/* 구분선 */}
                  <div className="border-t border-gray-700 my-2"></div>

                  {/* Upgrade plan */}
                  <button className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-700 transition-colors text-left">
                    <span className="text-sm text-gray-200">업그레이드 플랜</span>
                  </button>

                  {/* Learn more */}
                  <button className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-700 transition-colors text-left">
                    <span className="text-sm text-gray-200">더 알아보기</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                  </button>

                  {/* 구분선 */}
                  <div className="border-t border-gray-700 my-2"></div>

                  {/* Log out */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-700 transition-colors text-left"
                  >
                    <span className="text-sm text-gray-200">로그아웃</span>
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`flex items-center ${isOpen ? 'space-x-3 px-3' : 'justify-center'} py-2 rounded-lg hover:bg-gray-700 transition-colors text-left w-full`}
            >
              {renderProfileAvatar()}
              <span className={`whitespace-nowrap text-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                {user ? (user.displayName || user.email) : '프로필'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
