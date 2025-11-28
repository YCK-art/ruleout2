"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Plus, MoreVertical, Edit2, FolderPlus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { getUserConversations, deleteConversation, updateConversationTitle, toggleFavorite } from "@/lib/chatService";
import { ChatListItem } from "@/types/chat";
import RenameChatModal from "./RenameChatModal";
import MoveToProjectModal from "./MoveToProjectModal";
import Toast from "./Toast";

interface HistoryViewProps {
  onSelectChat: (conversationId: string) => void;
  onNewChat: () => void;
  onConversationDeleted?: () => void;
}

export default function HistoryView({ onSelectChat, onNewChat, onConversationDeleted }: HistoryViewProps) {
  const { user } = useAuth();
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
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#1a1a1a]">
      {/* Ruleout AI 헤더 */}
      <div className="sticky top-0 z-10 border-b border-gray-700 p-4 bg-[rgba(26,26,26,0.7)] backdrop-blur-md">
        <div className="flex items-center max-w-5xl mx-auto">
          <div className="flex items-center space-x-1">
            <Image src="/image/clinical4-Photoroom.png" alt="Ruleout AI" width={32} height={32} />
            <span className="text-lg font-semibold">Ruleout AI</span>
          </div>
        </div>
      </div>

      {/* 페이지 헤더 */}
      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-semibold text-gray-200">Chat History</h1>
            <button
              onClick={onNewChat}
              className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-100 text-black rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">New Chat</span>
            </button>
          </div>

          {/* 검색 바 */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-600"
            />
          </div>

          {/* 대화 개수 */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-400">
              {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
            </p>
            {filteredConversations.length !== conversations.length && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                View All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 대화 목록 - 테이블 형식 */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchQuery ? "No search results" : "No conversation history"}
              </p>
            </div>
          ) : (
            <div className="border-t border-gray-800">
              {/* 테이블 헤더 */}
              <div className="grid grid-cols-[200px_1fr_auto] gap-4 px-6 py-4 border-b border-gray-800">
                <div className="text-sm font-medium text-gray-400">Date</div>
                <div className="text-sm font-medium text-gray-400">Question</div>
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
                          <span>Rename</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveToProjectClick(conversation.id);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700 transition-colors flex items-center space-x-2"
                        >
                          <FolderPlus className="w-4 h-4" />
                          <span>Add to Project</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(conversation.id);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 transition-colors flex items-center space-x-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
        message="Added to project"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
