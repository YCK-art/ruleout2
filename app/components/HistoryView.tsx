"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Plus, MoreVertical, Edit2, FolderPlus, Trash2, Menu, SquarePen } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getUserConversations, deleteConversation, updateConversationTitle, toggleFavorite } from "@/lib/chatService";
import { ChatListItem } from "@/types/chat";
import RenameChatModal from "./RenameChatModal";
import MoveToProjectModal from "./MoveToProjectModal";
import Toast from "./Toast";

interface HistoryViewProps {
  onSelectChat: (conversationId: string) => void;
  onNewChat: () => void;
  onConversationDeleted?: () => void;
  onToggleSidebar?: () => void;
}

export default function HistoryView({ onSelectChat, onNewChat, onConversationDeleted, onToggleSidebar }: HistoryViewProps) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [conversations, setConversations] = useState<ChatListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredConversations, setFilteredConversations] = useState<ChatListItem[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [moveToProjectModalOpen, setMoveToProjectModalOpen] = useState(false);
  const [conversationToRename, setConversationToRename] = useState<{ id: string; title: string } | null>(null);
  const [conversationToMove, setConversationToMove] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showToast, setShowToast] = useState(false);

  // Multilingual content
  const content = {
    English: {
      title: "Chat History",
      newChat: "New Chat",
      searchPlaceholder: "Search conversations...",
      conversation: "conversation",
      conversations: "conversations",
      viewAll: "View All",
      noResults: "No search results",
      noHistory: "No conversation history",
      date: "Date",
      question: "Question",
      rename: "Rename",
      addToProject: "Add to Project",
      delete: "Delete",
      addedToProject: "Added to project",
      timeAgo: {
        minutesAgo: "m ago",
        hoursAgo: "h ago",
        daysAgo: "d ago"
      }
    },
    한국어: {
      title: "채팅 기록",
      newChat: "새 채팅",
      searchPlaceholder: "대화 검색...",
      conversation: "대화",
      conversations: "대화",
      viewAll: "전체 보기",
      noResults: "검색 결과 없음",
      noHistory: "채팅 기록이 없습니다",
      date: "날짜",
      question: "질문",
      rename: "이름 변경",
      addToProject: "프로젝트에 추가",
      delete: "삭제",
      addedToProject: "프로젝트에 추가됨",
      timeAgo: {
        minutesAgo: "분 전",
        hoursAgo: "시간 전",
        daysAgo: "일 전"
      }
    },
    日本語: {
      title: "チャット履歴",
      newChat: "新しいチャット",
      searchPlaceholder: "会話を検索...",
      conversation: "会話",
      conversations: "会話",
      viewAll: "すべて表示",
      noResults: "検索結果なし",
      noHistory: "チャット履歴がありません",
      date: "日付",
      question: "質問",
      rename: "名前を変更",
      addToProject: "プロジェクトに追加",
      delete: "削除",
      addedToProject: "プロジェクトに追加されました",
      timeAgo: {
        minutesAgo: "分前",
        hoursAgo: "時間前",
        daysAgo: "日前"
      }
    }
  };

  const currentContent = content[language as keyof typeof content];

  // Toast 상태 변경 디버깅
  useEffect(() => {
    console.log("=== Toast visibility changed:", showToast);
  }, [showToast]);

  // 대화 목록 불러오기
  useEffect(() => {
    const loadConversations = async () => {
      if (user) {
        try {
          const userConversations = await getUserConversations(user.uid, 100);
          setConversations(userConversations);
          setFilteredConversations(userConversations);
        } catch (error) {
          console.error("Failed to load conversations:", error);
        }
      }
    };

    loadConversations();
  }, [user]);

  // 검색 필터링
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter((conv) =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConversations(filtered);
    }
  }, [searchQuery, conversations]);

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    if (activeDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdown]);

  // 핸들러 함수들
  const handleRenameClick = (conversationId: string, currentTitle: string) => {
    setConversationToRename({ id: conversationId, title: currentTitle });
    setRenameModalOpen(true);
    setActiveDropdown(null);
  };

  const handleRename = async (newTitle: string) => {
    if (!conversationToRename) return;
    try {
      await updateConversationTitle(conversationToRename.id, newTitle);
      setConversations(conversations.map(conv =>
        conv.id === conversationToRename.id ? { ...conv, title: newTitle } : conv
      ));
      setFilteredConversations(filteredConversations.map(conv =>
        conv.id === conversationToRename.id ? { ...conv, title: newTitle } : conv
      ));
    } catch (error) {
      console.error("Chat title update error:", error);
    }
  };

  const handleMoveToProjectClick = (conversationId: string) => {
    setConversationToMove(conversationId);
    setMoveToProjectModalOpen(true);
    setActiveDropdown(null);
  };

  const handleDelete = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId);
      setConversations(conversations.filter(conv => conv.id !== conversationId));
      setFilteredConversations(filteredConversations.filter(conv => conv.id !== conversationId));
      setActiveDropdown(null);

      // 사이드바 새로고침
      if (onConversationDeleted) {
        onConversationDeleted();
      }
    } catch (error) {
      console.error("Conversation deletion error:", error);
    }
  };

  const handleToggleFavorite = async (conversationId: string, isFavorite: boolean = false) => {
    try {
      await toggleFavorite(conversationId, isFavorite);

      // Reload conversations
      if (user) {
        const userConversations = await getUserConversations(user.uid, 100);
        setConversations(userConversations);
        setFilteredConversations(userConversations);
      }
      setActiveDropdown(null);
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  // 날짜 포맷팅
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}. ${month}. ${day}.`;
  };

  // 시간 포맷팅
  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}${currentContent.timeAgo.minutesAgo}`;
    } else if (diffHours < 24) {
      return `${diffHours}${currentContent.timeAgo.hoursAgo}`;
    } else {
      return `${diffDays}${currentContent.timeAgo.daysAgo}`;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#1a1a1a]">
      {/* 모바일 상단 툴바 */}
      <div className="md:hidden sticky top-0 z-10 border-b border-gray-700 px-3 py-2 bg-[rgba(26,26,26,0.9)] backdrop-blur-md">
        <div className="flex items-center justify-between">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5 text-gray-300" />
          </button>
          <button
            onClick={onNewChat}
            className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="New chat"
          >
            <SquarePen className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>

      {/* 데스크톱 헤더 */}
      <div className="hidden md:block sticky top-0 z-10 border-b border-gray-700 p-4 bg-[rgba(26,26,26,0.7)] backdrop-blur-md">
        <div className="flex items-center max-w-5xl mx-auto">
          <div className="flex items-center space-x-1">
            <Image src="/image/clinical4-Photoroom.png" alt="Ruleout AI" width={32} height={32} />
            <span className="text-lg font-semibold">Ruleout AI</span>
          </div>
        </div>
      </div>

      {/* 페이지 헤더 */}
      <div className="p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-200">{currentContent.title}</h1>
            <button
              onClick={onNewChat}
              className="hidden md:flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-100 text-black rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">{currentContent.newChat}</span>
            </button>
          </div>

          {/* 검색 바 */}
          <div className="relative mb-4 md:mb-6">
            <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={currentContent.searchPlaceholder}
              className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg pl-10 md:pl-12 pr-4 py-2.5 md:py-3 text-sm md:text-base text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-600"
            />
          </div>

          {/* 대화 개수 */}
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <p className="text-xs md:text-sm text-gray-400">
              {filteredConversations.length} {filteredConversations.length !== 1 ? currentContent.conversations : currentContent.conversation}
            </p>
            {filteredConversations.length !== conversations.length && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs md:text-sm text-blue-400 hover:text-blue-300"
              >
                {currentContent.viewAll}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 대화 목록 */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchQuery ? currentContent.noResults : currentContent.noHistory}
              </p>
            </div>
          ) : (
            <>
              {/* 데스크톱: 테이블 형식 */}
              <div className="hidden md:block border-t border-gray-800">
                {/* 테이블 헤더 */}
                <div className="grid grid-cols-[200px_1fr_auto] gap-4 px-6 py-4 border-b border-gray-800">
                  <div className="text-sm font-medium text-gray-400">{currentContent.date}</div>
                  <div className="text-sm font-medium text-gray-400">{currentContent.question}</div>
                  <div className="w-8"></div>
                </div>

                {/* 테이블 바디 */}
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="grid grid-cols-[200px_1fr_auto] gap-4 px-6 py-6 border-b border-gray-800 hover:bg-[#2a2a2a] transition-colors group relative"
                  >
                    {/* Date 컬럼 */}
                    <div className="text-sm text-gray-400">
                      {formatDate(conversation.updatedAt)}
                    </div>

                    {/* Question 컬럼 */}
                    <button
                      onClick={() => onSelectChat(conversation.id)}
                      className="text-left transition-colors hover:brightness-110"
                      style={{ color: '#5AC8D8' }}
                    >
                      {conversation.title}
                    </button>

                    {/* 3개점 메뉴 */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === conversation.id ? null : conversation.id);
                        }}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </button>

                      {/* 드롭다운 메뉴 */}
                      {activeDropdown === conversation.id && (
                        <div
                          ref={dropdownRef}
                          className="absolute right-0 top-full mt-1 w-48 bg-[#2a2a2a] border border-gray-700 rounded-lg shadow-lg z-50 py-1"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRenameClick(conversation.id, conversation.title);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700 transition-colors flex items-center space-x-2"
                          >
                            <Edit2 className="w-4 h-4" />
                            <span>{currentContent.rename}</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveToProjectClick(conversation.id);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700 transition-colors flex items-center space-x-2"
                          >
                            <FolderPlus className="w-4 h-4" />
                            <span>{currentContent.addToProject}</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(conversation.id);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 transition-colors flex items-center space-x-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>{currentContent.delete}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* 모바일: 리스트 카드 형식 */}
              <div className="md:hidden space-y-0">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="border-b border-gray-800 hover:bg-[#2a2a2a] transition-colors relative"
                  >
                    <div className="flex items-start justify-between py-4 px-1">
                      {/* 왼쪽: 제목과 날짜 */}
                      <button
                        onClick={() => onSelectChat(conversation.id)}
                        className="flex-1 text-left pr-2"
                      >
                        <div className="text-base font-normal text-white mb-1 line-clamp-2">
                          {conversation.title}
                        </div>
                        <div className="text-sm text-gray-400">
                          {formatDate(conversation.updatedAt)}
                        </div>
                        {conversation.followupCount && conversation.followupCount > 0 && (
                          <div className="text-sm text-gray-500 mt-1">
                            + {conversation.followupCount} follow-up{conversation.followupCount > 1 ? 's' : ''}
                          </div>
                        )}
                      </button>

                      {/* 오른쪽: 3개점 메뉴 */}
                      <div className="relative flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdown(activeDropdown === conversation.id ? null : conversation.id);
                          }}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-400" />
                        </button>

                        {/* 드롭다운 메뉴 */}
                        {activeDropdown === conversation.id && (
                          <div
                            ref={dropdownRef}
                            className="absolute right-0 top-full mt-1 w-48 bg-[#2a2a2a] border border-gray-700 rounded-lg shadow-lg z-50 py-1"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRenameClick(conversation.id, conversation.title);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700 transition-colors flex items-center space-x-2"
                            >
                              <Edit2 className="w-4 h-4" />
                              <span>{currentContent.rename}</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveToProjectClick(conversation.id);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700 transition-colors flex items-center space-x-2"
                            >
                              <FolderPlus className="w-4 h-4" />
                              <span>{currentContent.addToProject}</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(conversation.id);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 transition-colors flex items-center space-x-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>{currentContent.delete}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 이름 변경 모달 */}
      <RenameChatModal
        isOpen={renameModalOpen}
        currentTitle={conversationToRename?.title || ""}
        onClose={() => {
          setRenameModalOpen(false);
          setConversationToRename(null);
        }}
        onRename={handleRename}
      />

      {/* 프로젝트에 추가 모달 */}
      <MoveToProjectModal
        isOpen={moveToProjectModalOpen}
        conversationId={conversationToMove || ""}
        onClose={() => {
          setMoveToProjectModalOpen(false);
          setConversationToMove(null);
        }}
        onSuccess={() => {
          console.log("=== onSuccess called, showing toast ===");
          setShowToast(true);
        }}
      />

      {/* Toast 알림 */}
      <Toast
        message={currentContent.addedToProject}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
