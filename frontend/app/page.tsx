"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import ChatView from "./components/ChatView";
import { AuthProvider } from "@/contexts/AuthContext";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<"home" | "chat">("home");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);

  const handleQuestionSubmit = (question: string) => {
    setCurrentQuestion(question);
    setCurrentConversationId(null); // 새 대화 시작
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

  return (
    <AuthProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          currentConversationId={currentConversationId}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          refreshKey={sidebarRefreshKey}
        />
        {currentView === "home" ? (
          <MainContent
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            onQuestionSubmit={handleQuestionSubmit}
          />
        ) : (
          <ChatView
            initialQuestion={currentQuestion}
            conversationId={currentConversationId}
            onNewQuestion={handleNewChat}
            onConversationCreated={setCurrentConversationId}
            onTitleUpdated={handleTitleUpdated}
          />
        )}
      </div>
    </AuthProvider>
  );
}
