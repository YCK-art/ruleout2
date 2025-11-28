"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Plus, ChevronDown, MoreVertical, Star, Edit2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProjects, createProject, updateProjectDescription, deleteProject } from "@/lib/projectService";
import { Project } from "@/types/project";
import CreateProjectModal from "./CreateProjectModal";
import DeleteProjectModal from "./DeleteProjectModal";

interface CollectionsViewProps {
  onNewChat: () => void;
  onSelectProject: (projectId: string) => void;
}

export default function CollectionsView({ onNewChat, onSelectProject }: CollectionsViewProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("activity");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; title: string } | null>(null);
  const dropdownRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  // 프로젝트 목록 로드
  useEffect(() => {
    const loadProjects = async () => {
      if (user) {
        const userProjects = await getUserProjects(user.uid);
        setProjects(userProjects);
      }
    };
    loadProjects();
  }, [user]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown) {
        const dropdownEl = dropdownRefs.current[activeDropdown];
        if (dropdownEl && !dropdownEl.contains(event.target as Node)) {
          setActiveDropdown(null);
          setHoveredProject(null);
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

  // 필터링 및 정렬
  const filteredAndSortedProjects = projects
    .filter((project) =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.title.localeCompare(b.title);
        case "created":
          const aCreated = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
          const bCreated = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
          return bCreated - aCreated; // 최신순
        case "activity":
        default:
          const aUpdated = a.updatedAt?.toDate ? a.updatedAt.toDate().getTime() : 0;
          const bUpdated = b.updatedAt?.toDate ? b.updatedAt.toDate().getTime() : 0;
          return bUpdated - aUpdated; // 최신순
      }
    });

  const handleCreateProject = async (title: string, description: string) => {
    if (!user) {
      console.error("User information not available");
      return;
    }

    try {
      console.log("Creating project:", title, description);
      const projectId = await createProject(user.uid, title);
      console.log("Project created:", projectId);

      if (description) {
        await updateProjectDescription(projectId, description);
        console.log("Description updated");
      }

      const userProjects = await getUserProjects(user.uid);
      console.log("Projects loaded:", userProjects);
      setProjects(userProjects);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Project creation error:", error);
    }
  };

  const handleDeleteClick = (projectId: string, projectTitle: string) => {
    console.log("Delete clicked for project:", projectId, projectTitle);
    setProjectToDelete({ id: projectId, title: projectTitle });
    setDeleteModalOpen(true);
    setActiveDropdown(null);
    console.log("Delete modal state set to true");
  };

  const handleConfirmDelete = async () => {
    if (!user || !projectToDelete) return;

    try {
      await deleteProject(projectToDelete.id);
      const userProjects = await getUserProjects(user.uid);
      setProjects(userProjects);
      setProjectToDelete(null);
    } catch (error) {
      console.error("Project deletion error:", error);
    }
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
        <div className="flex items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-1">
            <Image src="/image/clinical4-Photoroom.png" alt="Ruleout AI" width={32} height={32} />
            <span className="text-lg font-semibold">Ruleout AI</span>
          </div>
        </div>
      </div>

      {/* 페이지 헤더 */}
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-semibold text-gray-200">Projects</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-100 text-black rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">New Project</span>
            </button>
          </div>

          {/* 검색 바 */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-600"
            />
          </div>

          {/* 정렬 옵션 */}
          <div className="flex items-center justify-end mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Sort by</span>
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-[#2a2a2a] border border-gray-700 rounded-lg hover:bg-[#333333] transition-colors"
                >
                  <span className="text-sm text-gray-300">
                    {sortBy === "activity" ? "Activity" : sortBy === "name" ? "Name" : "Created"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {showSortDropdown && (
                  <div className="absolute right-0 top-full mt-1 bg-[#2a2a2a] border border-gray-700 rounded-lg shadow-lg z-10 min-w-[120px]">
                    <button
                      onClick={() => {
                        setSortBy("activity");
                        setShowSortDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors text-left"
                    >
                      Activity
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("name");
                        setShowSortDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors text-left"
                    >
                      Name
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("created");
                        setShowSortDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors text-left"
                    >
                      Created
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 프로젝트 그리드 */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {filteredAndSortedProjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchQuery ? "No search results" : "No projects"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAndSortedProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => onSelectProject(project.id)}
                  className="relative bg-[#2a2a2a] hover:bg-[#333333] border border-gray-700 rounded-lg p-6 transition-colors cursor-pointer group"
                  onMouseEnter={() => setHoveredProject(project.id)}
                  onMouseLeave={() => {
                    // 드롭다운이 열려있지 않을 때만 hover 상태 제거
                    if (activeDropdown !== project.id) {
                      setHoveredProject(null);
                    }
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base font-medium text-gray-200">
                      {project.title}
                    </h3>

                    {/* 3점 메뉴 */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === project.id ? null : project.id);
                        }}
                        className={`p-1 hover:bg-gray-600 rounded transition-all ${
                          hoveredProject === project.id ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>

                      {activeDropdown === project.id && (
                        <div
                          ref={(el) => { dropdownRefs.current[project.id] = el; }}
                          className="absolute right-0 top-full mt-1 bg-[#2a2a2a] border border-gray-700 rounded-lg shadow-lg z-10 min-w-[180px]"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("Favorite clicked");
                              // TODO: Favorite feature
                              setActiveDropdown(null);
                              setHoveredProject(null);
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 transition-colors text-left"
                          >
                            <Star className="w-4 h-4" />
                            <span>Favorite</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("Edit clicked");
                              // TODO: Edit details feature
                              setActiveDropdown(null);
                              setHoveredProject(null);
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 transition-colors text-left"
                          >
                            <Edit2 className="w-4 h-4" />
                            <span>Edit Details</span>
                          </button>
                          <div className="border-t border-gray-700 my-1"></div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("Delete button clicked!");
                              handleDeleteClick(project.id, project.title);
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-400 hover:bg-gray-700 transition-colors text-left"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                      {project.description}
                    </p>
                  )}

                  <p className="text-xs text-gray-500">
                    Updated {formatTime(project.updatedAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 프로젝트 생성 모달 */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateProject}
      />

      {/* 프로젝트 삭제 확인 모달 */}
      {console.log("Rendering DeleteProjectModal, isOpen:", deleteModalOpen, "projectToDelete:", projectToDelete)}
      <DeleteProjectModal
        isOpen={deleteModalOpen}
        onClose={() => {
          console.log("Modal close clicked");
          setDeleteModalOpen(false);
          setProjectToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        projectTitle={projectToDelete?.title || ""}
      />
    </div>
  );
}
