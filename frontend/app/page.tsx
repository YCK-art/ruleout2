"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import ChatView from "./components/ChatView";
import HistoryView from "./components/HistoryView";
import CollectionsView from "./components/CollectionsView";
import ProjectDetailView from "./components/ProjectDetailView";
import FloatingLoginWidget from "./components/FloatingLoginWidget";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { addConversationToProject } from "@/lib/projectService";
import { getGuestQueriesRemaining } from "@/lib/guestLimit";

function HomeContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<"home" | "chat" | "history" | "collections" | "projectDetail">("home");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [showFloatingWidget, setShowFloatingWidget] = useState(true);
  const [guestQueriesRemaining, setGuestQueriesRemaining] = useState(5);

  // Guest 모드에서 남은 쿼리 수 업데이트
  useEffect(() => {
    if (isGuestMode) {
      setGuestQueriesRemaining(getGuestQueriesRemaining());
    }
  }, [isGuestMode]);

  // URL 파라미터 확인 및 게스트 모드 처리
  useEffect(() => {
    const question = searchParams.get("q");
    const guestParam = searchParams.get("guest");

    if (guestParam === "true" && question) {
      // Guest 모드로 채팅 시작
      setIsGuestMode(true);
      setCurrentQuestion(question);
      setCurrentView("chat");
      setCurrentConversationId(null);
      setIsInitialized(true);
      return;
    }

    // 일반 모드: 페이지 상태 복원
    const savedView = localStorage.getItem("currentView");
    const savedConversationId = localStorage.getItem("currentConversationId");
    const savedProjectId = localStorage.getItem("currentProjectId");

    if (savedView) {
      setCurrentView(savedView as any);
    }
    if (savedConversationId && savedConversationId !== "null") {
      setCurrentConversationId(savedConversationId);
    }
    if (savedProjectId && savedProjectId !== "null") {
      setCurrentProjectId(savedProjectId);
    }
    setIsInitialized(true);
  }, [searchParams]);

  // 페이지 상태 저장
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("currentView", currentView);
      localStorage.setItem("currentConversationId", currentConversationId || "null");
      localStorage.setItem("currentProjectId", currentProjectId || "null");
    }
  }, [currentView, currentConversationId, currentProjectId, isInitialized]);

  const handleQuestionSubmit = (question: string, projectId?: string | null) => {
    setCurrentQuestion(question);
    setCurrentConversationId(null); // 새 대화 시작
    if (projectId) {
      // 프로젝트 ID를 유지하면서 채팅방으로 이동
      setCurrentProjectId(projectId);
    }
    setCurrentView("chat");
  };

  const handleNewChat = () => {
    setCurrentView("home");
    setCurrentQuestion("");
    setCurrentConversationId(null);
  };

  const handleSelectChat = (conversationId: string) => {
    setCurrentConversationId(conversationId);
    setCurrentQuestion(""); // 기존 대화 불러올 때는 빈 문자열
    setCurrentView("chat");
  };

  const handleTitleUpdated = () => {
    // 제목이 업데이트되면 사이드바 새로고침
    setSidebarRefreshKey(prev => prev + 1);
  };

  const handleConversationDeleted = () => {
    // 대화가 삭제되면 사이드바 새로고침
    setSidebarRefreshKey(prev => prev + 1);
  };

  const handleConversationCreated = async (conversationId: string) => {
    setCurrentConversationId(conversationId);

    // 프로젝트 컨텍스트에서 생성된 경우 자동으로 프로젝트에 추가
    if (currentProjectId) {
      try {
        await addConversationToProject(currentProjectId, conversationId);
        console.log(`Conversation ${conversationId} added to project ${currentProjectId}`);
      } catch (error) {
        console.error("Failed to add conversation to project:", error);
      }
    }
  };

  const handleShowHistory = () => {
    setCurrentView("history");
  };

  const handleShowCollections = () => {
    setCurrentView("collections");
  };

  const handleShowProjectDetail = (projectId: string) => {
    setCurrentProjectId(projectId);
    setCurrentView("projectDetail");
  };

  const handleBackToCollections = () => {
    setCurrentView("collections");
    setCurrentProjectId(null);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* 사이드바 항상 표시 (Guest 모드에서도 표시, 프로필만 없음) */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        currentConversationId={currentConversationId}
        currentView={currentView}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onShowHistory={handleShowHistory}
        onShowCollections={handleShowCollections}
        refreshKey={sidebarRefreshKey}
      />
      {currentView === "home" ? (
        <MainContent
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onQuestionSubmit={handleQuestionSubmit}
        />
      ) : currentView === "history" ? (
        <HistoryView
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onConversationDeleted={handleConversationDeleted}
        />
      ) : currentView === "collections" ? (
        <CollectionsView
          onNewChat={handleNewChat}
          onSelectProject={handleShowProjectDetail}
        />
      ) : currentView === "projectDetail" && currentProjectId ? (
        <ProjectDetailView
          projectId={currentProjectId}
          onBack={handleBackToCollections}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onQuestionSubmit={(question) => handleQuestionSubmit(question, currentProjectId)}
          onConversationDeleted={handleConversationDeleted}
        />
      ) : (
        <ChatView
          initialQuestion={currentQuestion}
          conversationId={currentConversationId}
          onNewQuestion={handleNewChat}
          onConversationCreated={handleConversationCreated}
          onTitleUpdated={handleTitleUpdated}
          isGuestMode={isGuestMode}
          onGuestQueryUpdate={(remaining) => setGuestQueriesRemaining(remaining)}
        />
      )}

      {/* Floating 로그인 위젯 - Guest 모드이고, 로그인 안 했고, 쿼리가 남아있고, 위젯을 닫지 않았을 때 */}
      {isGuestMode && !user && guestQueriesRemaining > 0 && showFloatingWidget && (
        <FloatingLoginWidget onClose={() => setShowFloatingWidget(false)} />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <HomeContent />
    </AuthProvider>
  );
}
