"use client";

import { useState, useEffect } from "react";
import { X, Search, FolderOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getUserProjects, addConversationToProject } from "@/lib/projectService";
import { Project } from "@/types/project";

interface MoveToProjectModalProps {
  conversationId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function MoveToProjectModal({ conversationId, isOpen, onClose, onSuccess }: MoveToProjectModalProps) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);

  // Multilingual content
  const content = {
    English: {
      title: "Move Conversation",
      description: "Select a project to move this conversation to.",
      searchPlaceholder: "Search or create project...",
      noResults: "No search results",
      noProjects: "No projects",
      createFirst: "Create a project first",
      conversation: "conversation",
      conversations: "conversations"
    },
    한국어: {
      title: "대화 이동",
      description: "이 대화를 이동할 프로젝트를 선택하세요.",
      searchPlaceholder: "프로젝트 검색 또는 생성...",
      noResults: "검색 결과 없음",
      noProjects: "프로젝트 없음",
      createFirst: "먼저 프로젝트를 생성하세요",
      conversation: "대화",
      conversations: "대화"
    },
    日本語: {
      title: "会話を移動",
      description: "この会話を移動するプロジェクトを選択してください。",
      searchPlaceholder: "プロジェクトを検索または作成...",
      noResults: "検索結果なし",
      noProjects: "プロジェクトなし",
      createFirst: "最初にプロジェクトを作成してください",
      conversation: "会話",
      conversations: "会話"
    }
  };

  const currentContent = content[language as keyof typeof content];

  // 프로젝트 목록 로드
  useEffect(() => {
    const loadProjects = async () => {
      if (user && isOpen) {
        const userProjects = await getUserProjects(user.uid);
        setProjects(userProjects);
        setFilteredProjects(userProjects);
      }
    };
    loadProjects();
  }, [user, isOpen]);

  // 검색 필터링
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter((project) =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProjects(filtered);
    }
  }, [searchQuery, projects]);

  const handleMoveToProject = async (projectId: string) => {
    try {
      console.log("=== Adding conversation to project:", projectId);
      await addConversationToProject(projectId, conversationId);
      console.log("=== Successfully added to project");

      // 성공 콜백을 먼저 호출 (Toast 표시)
      if (onSuccess) {
        console.log("=== Calling onSuccess callback");
        onSuccess();
      } else {
        console.log("=== No onSuccess callback provided!");
      }

      // 그 다음 모달 닫기
      console.log("=== Closing modal");
      onClose();
    } catch (error) {
      console.error("Failed to move to project:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#2a2a2a] rounded-lg w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-200 mb-1">{currentContent.title}</h2>
            <p className="text-sm text-gray-400">{currentContent.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* 검색 바 */}
        <div className="px-6 pb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={currentContent.searchPlaceholder}
              className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-600"
              autoFocus
            />
          </div>
        </div>

        {/* 프로젝트 목록 */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchQuery ? currentContent.noResults : currentContent.noProjects}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {currentContent.createFirst}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleMoveToProject(project.id)}
                  className="w-full flex items-center space-x-3 p-4 bg-[#1a1a1a] hover:bg-[#333333] border border-gray-700 rounded-lg transition-colors text-left"
                >
                  <FolderOpen className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-200 truncate">
                      {project.title}
                    </h3>
                    {project.conversationIds && project.conversationIds.length > 0 && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {project.conversationIds.length} {project.conversationIds.length !== 1 ? currentContent.conversations : currentContent.conversation}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
