"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, ArrowUp, Edit2, FolderMinus, Trash2, MoreVertical } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { getProject, removeConversationFromProject } from "@/lib/projectService";
import { getConversation, updateConversationTitle, deleteConversation } from "@/lib/chatService";
import { Project } from "@/types/project";
import RenameChatModal from "./RenameChatModal";

interface ProjectDetailViewProps {
  projectId: string;
  onBack: () => void;
  onSelectChat: (conversationId: string) => void;
  onNewChat: () => void;
  onQuestionSubmit: (question: string) => void;
  onConversationDeleted?: () => void;
}

interface ConversationItem {
  id: string;
  title: string;
  updatedAt: any;
  isFavorite?: boolean;
}

export default function ProjectDetailView({ projectId, onBack, onSelectChat, onNewChat, onQuestionSubmit, onConversationDeleted }: ProjectDetailViewProps) {
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [input, setInput] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [conversationToRename, setConversationToRename] = useState<{ id: string; title: string } | null>(null);
  const dropdownRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  useEffect(() => {
    const loadProjectDetails = async () => {
      if (!user) return;

      try {
        // 프로젝트 정보 로드
        const projectData = await getProject(projectId);
        setProject(projectData);

        // 프로젝트 내 대화 목록 로드
        if (projectData && projectData.conversationIds.length > 0) {
          const conversationPromises = projectData.conversationIds.map(async (convId) => {
            try {
              const conv = await getConversation(convId);
              return {
                id: convId,
                title: conv?.title || "Untitled",
                updatedAt: conv?.updatedAt,
                isFavorite: conv?.isFavorite || false,
              };
            } catch (error) {
              console.error(`Failed to load conversation ${convId}:`, error);
              return null;
            }
          });

          const convs = await Promise.all(conversationPromises);
          setConversations(convs.filter((c) => c !== null) as ConversationItem[]);
        }
      } catch (error) {
        console.error("Failed to load project details:", error);
      }
    };

    loadProjectDetails();
  }, [projectId, user]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown) {
        const dropdownEl = dropdownRefs.current[activeDropdown];
        if (dropdownEl && !dropdownEl.contains(event.target as Node)) {
          setActiveDropdown(null);
        }
      }
    };

    if (activeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}. ${month}. ${day}.`;
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";

    const now = new Date();
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 질문을 전달하고 채팅방으로 이동
    onQuestionSubmit(input);
    setInput("");
  };

  const handleRemoveFromProject = async (conversationId: string) => {
    console.log("=== handleRemoveFromProject START ===");
    console.log("Removing conversation from project:", conversationId);
    console.log("Project ID:", projectId);
    console.log("Current conversations count:", conversations.length);

    try {
      // 프로젝트에서만 제거 (채팅 자체는 삭제하지 않음)
      await removeConversationFromProject(projectId, conversationId);
      console.log("✓ Successfully removed from Firebase project");

      // 목록에서 제거
      const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
      console.log("✓ Filtered conversations, new count:", updatedConversations.length);

      setConversations(updatedConversations);
      console.log("✓ State updated");

      setActiveDropdown(null);
      console.log("=== handleRemoveFromProject SUCCESS ===");
    } catch (error) {
      console.error("=== handleRemoveFromProject ERROR ===");
      console.error("Failed to remove chat from project:", error);
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
    } catch (error) {
      console.error("Failed to update chat title:", error);
    }
  };


  const handleDelete = async (conversationId: string) => {
    console.log("=== handleDelete START ===");
    console.log("Deleting conversation:", conversationId);
    console.log("Project ID:", projectId);
    console.log("Current conversations count:", conversations.length);

    try {
      // Delete conversation from Firebase (이렇게 하면 채팅 히스토리에서도 삭제됨)
      await deleteConversation(conversationId);
      console.log("✓ Successfully deleted conversation from Firebase");

      // Remove from project
      await removeConversationFromProject(projectId, conversationId);
      console.log("✓ Successfully removed from project");

      // Remove from local state
      const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
      console.log("✓ Filtered conversations, new count:", updatedConversations.length);

      setConversations(updatedConversations);
      console.log("✓ State updated");

      setActiveDropdown(null);

      // 사이드바 및 다른 컴포넌트 새로고침
      if (onConversationDeleted) {
        onConversationDeleted();
      }

      console.log("=== handleDelete SUCCESS ===");
    } catch (error) {
      console.error("=== handleDelete ERROR ===");
      console.error("Failed to delete conversation:", error);
      console.error("Error details:", error);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#1a1a1a]">
      {/* Ruleout AI 헤더 */}
      <div className="sticky top-0 z-10 border-b border-gray-700 p-4 bg-[rgba(26,26,26,0.7)] backdrop-blur-md">
        <div className="flex items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-1">
            <Image src="/image/clinical4-Photoroom.png" alt="Ruleout AI" width={32} height={32} />
            <span className="text-lg font-semibold">Ruleout AI</span>
          </div>
        </div>
      </div>

      {/* 프로젝트 헤더 */}
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-400 hover:text-gray-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>All projects</span>
          </button>

          <div>
            <h1 className="text-4xl font-semibold text-gray-200 mb-4">
              {project?.title || "Loading..."}
            </h1>
            {project?.description && (
              <p className="text-gray-400 text-lg">{project.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* 입력 영역 */}
      <div className="p-4 mb-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center bg-[#2a2a2a] rounded-2xl border border-gray-700 px-6 pr-2 py-2.5 hover:border-gray-600 transition-colors">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a new question for this project"
                className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-12 h-12 flex items-center justify-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
                style={{ backgroundColor: '#20808D' }}
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 대화 목록 - 테이블 형식 */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {conversations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No conversations saved in this project</p>
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
              {conversations.map((conversation) => (
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

                  {/* 3점 메뉴 */}
                  <div className="relative flex items-center justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("Three-dot menu clicked for conversation:", conversation.id);
                        console.log("Current activeDropdown:", activeDropdown);
                        setActiveDropdown(activeDropdown === conversation.id ? null : conversation.id);
                      }}
                      className="p-1 hover:bg-gray-600 rounded transition-colors"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>

                    {activeDropdown === conversation.id && (
                      <div
                        ref={(el) => { dropdownRefs.current[conversation.id] = el; }}
                        className="absolute right-0 top-full mt-1 bg-[#2a2a2a] border border-gray-700 rounded-lg shadow-lg z-50 min-w-[200px]"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log("Rename button clicked");
                            handleRenameClick(conversation.id, conversation.title);
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span>Rename</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log("Remove from Project button clicked");
                            handleRemoveFromProject(conversation.id);
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                        >
                          <FolderMinus className="w-4 h-4" />
                          <span>Remove from Project</span>
                        </button>
                        <div className="border-t border-gray-700 my-1"></div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log("Delete button clicked");
                            handleDelete(conversation.id);
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-400 hover:bg-gray-700 transition-colors"
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
    </div>
  );
}
