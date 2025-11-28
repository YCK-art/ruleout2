"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowUp, BookOpen, Copy, Check, Share2, RotateCcw, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, Loader2, MoreHorizontal, Bookmark, List } from "lucide-react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import jsPDF from "jspdf";
import { Timestamp } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import {
  createConversation,
  addMessageToConversation,
  updateConversationTitle,
  generateChatTitle,
  getConversation,
  toggleFavorite,
  updateMessage,
} from "@/lib/chatService";
import {
  canGuestQuery,
  incrementGuestQueryCount,
  getGuestQueriesRemaining,
  resetGuestQueryCount,
} from "@/lib/guestLimit";
import LoginModal from "./LoginModal";
import type { Message as BaseMessage, Reference } from "@/types/chat";

// ChatView에서 사용하는 Message 타입 (timestamp를 optional로 확장)
interface Message extends Omit<BaseMessage, 'timestamp'> {
  timestamp?: Date | Timestamp;
  isStreaming?: boolean;
}

interface ChatViewProps {
  initialQuestion: string;
  conversationId: string | null;
  onNewQuestion: () => void;
  onConversationCreated?: (conversationId: string) => void;
  onTitleUpdated?: () => void;
  isGuestMode?: boolean;
  onGuestQueryUpdate?: (remaining: number) => void;
}

export default function ChatView({ initialQuestion, conversationId, onNewQuestion, onConversationCreated, onTitleUpdated, isGuestMode = false, onGuestQueryUpdate }: ChatViewProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [referencesCollapsed, setReferencesCollapsed] = useState<{[key: number]: boolean}>({});
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const hasCalledAPI = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isLoadingConversation = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [guestQueriesRemaining, setGuestQueriesRemaining] = useState(5);

  // Guest 모드에서 남은 쿼리 수 업데이트
  useEffect(() => {
    if (isGuestMode) {
      const remaining = getGuestQueriesRemaining();
      setGuestQueriesRemaining(remaining);
      if (onGuestQueryUpdate) {
        onGuestQueryUpdate(remaining);
      }
    }
  }, [isGuestMode, onGuestQueryUpdate]);

  // 로그인 시 guest 쿼리 카운트 리셋
  useEffect(() => {
    if (user && isGuestMode) {
      resetGuestQueryCount();
      setGuestQueriesRemaining(5);
    }
  }, [user, isGuestMode]);

  // 스크롤을 맨 아래로 - 타이핑 중일 때만 스크롤
  useEffect(() => {
    // 대화 로드 시 즉시 스크롤 (애니메이션 없음)
    if (isLoadingConversation.current) {
      // 즉시 맨 아래로 점프
      messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
      isLoadingConversation.current = false;
    } else if (isStreaming) {
      // 타이핑 중일 때만 부드럽게 스크롤
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    // Reference나 Related Questions 추가 시에는 스크롤하지 않음
  }, [messages, isStreaming]);

  // 기존 대화 불러오기 또는 새 대화 시작
  useEffect(() => {
    const loadConversation = async () => {
      if (conversationId) {
        // 기존 대화 불러오기 (conversationId가 변경될 때마다 실행)
        // 단, 현재 conversationId와 동일하면 스킵 (불필요한 리로드 방지)
        if (conversationId === currentConversationId) {
          return;
        }

        try {
          const conversation = await getConversation(conversationId);
          if (conversation && conversation.messages) {
            isLoadingConversation.current = true; // setMessages 직전에 플래그 설정
            setMessages(conversation.messages);
            setCurrentConversationId(conversationId);
            setIsFavorite(conversation.isFavorite || false);
          }
          // 대화 불러오기 완료 후 hasCalledAPI 리셋
          hasCalledAPI.current = false;
        } catch (error) {
          console.error("대화 불러오기 실패:", error);
          isLoadingConversation.current = false;
        }
      } else if (initialQuestion && !hasCalledAPI.current) {
        // Guest 모드에서 쿼리 카운트 증가
        if (isGuestMode && !user) {
          incrementGuestQueryCount();
          const remaining = getGuestQueriesRemaining();
          setGuestQueriesRemaining(remaining);
          if (onGuestQueryUpdate) {
            onGuestQueryUpdate(remaining);
          }
        }

        // 새 대화 시작
        hasCalledAPI.current = true;
        queryAPI(initialQuestion, true);
      }
    };

    loadConversation();
  }, [initialQuestion, conversationId]);

  // API 호출
  const queryAPI = async (question: string, isFirstMessage: boolean = false, skipUserMessage: boolean = false) => {
    // Rewrite가 아닌 경우에만 사용자 메시지 추가
    const userMessage: Message = {
      role: "user",
      content: question,
      timestamp: new Date(),
    };

    if (!skipUserMessage) {
      setMessages((prev) => [...prev, userMessage]);
    }

    setIsStreaming(true);

    // Firebase에 사용자 메시지 저장 (Rewrite가 아닌 경우에만)
    if (user && currentConversationId && !skipUserMessage) {
      try {
        await addMessageToConversation(currentConversationId, userMessage);
      } catch (error) {
        console.error("사용자 메시지 저장 실패:", error);
      }
    }

    try {
      // AbortController 생성
      abortControllerRef.current = new AbortController();

      // 대화 히스토리 준비 (현재 messages에서 assistant 메시지만)
      const conversationHistory = messages
        .filter(msg => msg.role === "assistant")
        .slice(-3) // 최근 3개 assistant 답변만
        .flatMap((msg, idx) => {
          // 각 assistant 답변에 대응하는 user 질문 찾기
          const userMsg = messages[messages.indexOf(msg) - 1];
          return userMsg ? [
            { role: "user", content: userMsg.content },
            { role: "assistant", content: msg.content }
          ] : [{ role: "assistant", content: msg.content }];
        });

      // 백엔드 SSE 스트리밍 호출 (대화 히스토리 포함)
      const response = await fetch("http://localhost:8000/query-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
          conversation_history: conversationHistory,
        }),
        signal: abortControllerRef.current.signal, // AbortController 시그널 추가
      });

      if (!response.ok) {
        throw new Error("응답 실패");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("스트림을 읽을 수 없습니다");
      }

      let buffer = "";
      let finalAnswer = "";
      let finalReferences: Reference[] = [];
      let finalFollowupQuestions: string[] = [];
      let hasError = false;
      let errorMessage = "";

      // SSE 스트림 읽기
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.status === "done") {
                finalAnswer = data.answer || "";
                finalReferences = data.references || [];
                finalFollowupQuestions = data.followup_questions || [];
                console.log("📊 Received follow-up questions:", finalFollowupQuestions);
                console.log("🔗 Received references:", finalReferences);
                console.log("🔗 Reference URLs:", finalReferences.map(r => ({ title: r.title, url: r.url })));
              } else if (data.status === "error") {
                hasError = true;
                errorMessage = data.message || "관련 정보를 찾을 수 없습니다.";
              }
            } catch (e) {
              console.error("SSE 파싱 오류:", e);
            }
          }
        }
      }

      // 에러 처리
      if (hasError) {
        const errorMsg: Message = {
          role: "assistant",
          content: errorMessage,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
        return;
      }

      // 타이핑 애니메이션으로 답변 표시
      if (finalAnswer) {
        console.log("💬 Creating message with followup questions:", finalFollowupQuestions);
        const assistantMessage: Message = {
          role: "assistant",
          content: "",
          references: finalReferences,
          followupQuestions: finalFollowupQuestions,
          isStreaming: true,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        const typingSpeed = 4; // milliseconds between chunks (faster interval)
        const charsPerChunk = 8; // Show 8 characters at a time for much faster speed
        for (let i = 0; i <= finalAnswer.length; i += charsPerChunk) {
          await new Promise((resolve) => setTimeout(resolve, typingSpeed));
          const displayText = finalAnswer.slice(0, Math.min(i + charsPerChunk, finalAnswer.length));
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg && lastMsg.role === "assistant") {
              lastMsg.content = displayText;
              lastMsg.isStreaming = displayText.length < finalAnswer.length;
            }
            return newMessages;
          });
        }

        // 타이핑 완료 후 Firebase에 AI 메시지 저장
        const completedAssistantMessage: Message = {
          role: "assistant",
          content: finalAnswer,
          references: finalReferences,
          followupQuestions: finalFollowupQuestions,
          timestamp: new Date(),
        };

        if (user) {
          try {
            // 첫 메시지인 경우 대화 생성
            if (isFirstMessage && !currentConversationId) {
              const newConvId = await createConversation(user.uid);
              setCurrentConversationId(newConvId);
              if (onConversationCreated) {
                onConversationCreated(newConvId);
              }

              // 사용자 메시지와 AI 메시지 모두 저장
              await addMessageToConversation(newConvId, userMessage);
              await addMessageToConversation(newConvId, completedAssistantMessage);

              // 제목 생성 및 업데이트
              const title = await generateChatTitle(question);
              await updateConversationTitle(newConvId, title);

              // Firebase 저장 완료 대기 (약간의 지연)
              await new Promise(resolve => setTimeout(resolve, 100));

              // 제목 업데이트 알림
              if (onTitleUpdated) {
                onTitleUpdated();
              }
            } else if (currentConversationId) {
              // 기존 대화에 AI 메시지만 추가
              await addMessageToConversation(currentConversationId, completedAssistantMessage);
            }
          } catch (error) {
            console.error("Firebase 저장 실패:", error);
          }
        }
      }
    } catch (error: any) {
      // 사용자가 취소한 경우 에러 메시지 표시하지 않음
      if (error.name === 'AbortError') {
        console.log("Request cancelled by user");
        const cancelMessage: Message = {
          role: "assistant",
          content: "_Request cancelled._",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, cancelMessage]);
      } else {
        console.error("API error:", error);
        const errorMessage: Message = {
          role: "assistant",
          content: "Sorry, an error occurred while generating the response.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Stop 버튼 핸들러
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  // 후속 질문 클릭 핸들러 - 질문을 즉시 전송
  const handleFollowupQuestionClick = async (question: string) => {
    if (isStreaming) return;

    // Guest 모드에서 제한 확인
    if (isGuestMode && !user && !canGuestQuery()) {
      setShowLoginModal(true); // 중앙 모달 표시
      return;
    }

    // Related Questions 섹션을 제거하기 위해 마지막 assistant 메시지의 followupQuestions를 제거
    setMessages((prev) => {
      const newMessages = [...prev];
      // 마지막 assistant 메시지 찾기
      for (let i = newMessages.length - 1; i >= 0; i--) {
        if (newMessages[i].role === "assistant") {
          newMessages[i] = {
            ...newMessages[i],
            followupQuestions: undefined,
          };
          break;
        }
      }
      return newMessages;
    });

    // Guest 모드에서 쿼리 카운트 증가
    if (isGuestMode && !user) {
      incrementGuestQueryCount();
      const remaining = getGuestQueriesRemaining();
      setGuestQueriesRemaining(remaining);
      if (onGuestQueryUpdate) {
        onGuestQueryUpdate(remaining);
      }
    }

    // 약간의 딜레이 후 질문 전송 (UI 업데이트를 위해)
    setTimeout(async () => {
      await queryAPI(question, false);
    }, 50);
  };

  // Toggle favorite
  const handleToggleFavorite = async () => {
    if (!currentConversationId) {
      console.log("No conversation ID");
      return;
    }

    try {
      console.log("Toggling favorite:", currentConversationId, "from", isFavorite, "to", !isFavorite);
      await toggleFavorite(currentConversationId, isFavorite);
      setIsFavorite(!isFavorite);
      console.log("Favorite toggled successfully");
      if (onTitleUpdated) {
        onTitleUpdated();
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  // 메시지 피드백 핸들러
  const handleMessageFeedback = async (messageIndex: number, feedbackType: 'like' | 'dislike') => {
    if (!currentConversationId) return;

    const currentFeedback = messages[messageIndex].feedback;
    const newFeedback = currentFeedback === feedbackType ? null : feedbackType;

    // UI 즉시 업데이트
    setMessages((prev) => {
      const newMessages = [...prev];
      newMessages[messageIndex] = {
        ...newMessages[messageIndex],
        feedback: newFeedback,
      };
      return newMessages;
    });

    // Firestore 업데이트
    try {
      await updateMessage(currentConversationId, messageIndex, { feedback: newFeedback });
    } catch (error) {
      console.error("Failed to update message feedback:", error);
    }
  };

  // Reference 피드백 핸들러
  const handleReferenceFeedback = async (messageIndex: number, referenceIndex: number, feedbackType: 'like' | 'dislike') => {
    if (!currentConversationId) return;

    const message = messages[messageIndex];
    if (!message.references) return;

    const currentFeedback = message.references[referenceIndex].feedback;
    const newFeedback = currentFeedback === feedbackType ? null : feedbackType;

    // UI 즉시 업데이트
    setMessages((prev) => {
      const newMessages = [...prev];
      const newReferences = [...(newMessages[messageIndex].references || [])];
      newReferences[referenceIndex] = {
        ...newReferences[referenceIndex],
        feedback: newFeedback,
      };
      newMessages[messageIndex] = {
        ...newMessages[messageIndex],
        references: newReferences,
      };
      return newMessages;
    });

    // Firestore 업데이트
    try {
      const updatedReferences = [...message.references];
      updatedReferences[referenceIndex] = {
        ...updatedReferences[referenceIndex],
        feedback: newFeedback,
      };
      await updateMessage(currentConversationId, messageIndex, { references: updatedReferences });
    } catch (error) {
      console.error("Failed to update reference feedback:", error);
    }
  };

  // Rewrite 핸들러 - 답변 재생성
  const handleRewrite = async (messageIndex: number) => {
    if (isStreaming || messageIndex < 1) return;

    // 이전 사용자 메시지 찾기
    const userMessage = messages[messageIndex - 1];
    if (!userMessage || userMessage.role !== "user") return;

    const userQuestion = userMessage.content;

    // 현재 assistant 메시지부터 끝까지 제거 (해당 답변과 그 이후 모든 메시지)
    setMessages((prev) => prev.slice(0, messageIndex));

    // Firestore에서도 메시지 제거 (나중에 새로운 답변으로 업데이트됨)
    // 여기서는 UI만 업데이트하고, 새 답변이 저장될 때 자동으로 덮어써집니다

    // 약간의 딜레이 후 질문 재전송 (skipUserMessage=true로 사용자 메시지 추가 안 함)
    setTimeout(async () => {
      await queryAPI(userQuestion, false, true);
    }, 100);
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    // Guest 모드에서 제한 확인
    if (isGuestMode && !user && !canGuestQuery()) {
      setShowLoginModal(true); // 중앙 모달 표시
      return;
    }

    const question = input.trim();
    setInput("");

    // Guest 모드에서 쿼리 카운트 증가
    if (isGuestMode && !user) {
      incrementGuestQueryCount();
      const remaining = getGuestQueriesRemaining();
      setGuestQueriesRemaining(remaining);
      if (onGuestQueryUpdate) {
        onGuestQueryUpdate(remaining);
      }
    }

    await queryAPI(question, false); // 후속 질문
  };

  // 답변 복사
  const handleCopyAnswer = async (message: Message, index: number) => {
    let textToCopy = message.content;

    if (message.references && message.references.length > 0) {
      textToCopy += "\n\nReferences:\n";
      message.references.forEach((ref, idx) => {
        textToCopy += `${idx + 1}. ${ref.title}\n   ${ref.source}\n   ${ref.year}\n\n`;
      });
    }

    await navigator.clipboard.writeText(textToCopy);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // PDF 내보내기 - HTML을 이용한 방식
  const handleExportToPDF = (userMessage: string, assistantMessage: Message) => {
    // 새 창에서 프린트 가능한 HTML 생성
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Popup blocked. Please allow popups for this site.');
      return;
    }

    // 마크다운 제거
    const plainText = assistantMessage.content
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`{1,3}[^\n]*`{1,3}/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const date = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // References HTML 생성
    let referencesHTML = '';
    if (assistantMessage.references && assistantMessage.references.length > 0) {
      const referencesList = assistantMessage.references
        .map((ref, index) => `
          <div class="reference-item">
            <span class="reference-number">[${index + 1}]</span>
            <div class="reference-content">
              <div class="reference-title">${ref.title}</div>
              <div class="reference-details">
                ${ref.source} (${ref.year})
              </div>
            </div>
          </div>
        `)
        .join('');

      referencesHTML = `
        <div class="section">
          <div class="section-title">References</div>
          <div class="references-list">
            ${referencesList}
          </div>
        </div>
      `;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ruleout AI - Medical Answer</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Malgun Gothic', '맑은 고딕', sans-serif;
            line-height: 1.6;
            color: #333;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }

          .header {
            border-bottom: 3px solid #20808D;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }

          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #20808D;
            margin-bottom: 8px;
          }

          .date {
            font-size: 14px;
            color: #666;
          }

          .section {
            margin-bottom: 30px;
          }

          .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #20808D;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e0e0e0;
          }

          .section-content {
            font-size: 14px;
            white-space: pre-wrap;
            word-wrap: break-word;
            color: #444;
          }

          .references-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .reference-item {
            display: flex;
            gap: 12px;
            padding: 12px;
            background-color: #f8f9fa;
            border-radius: 6px;
            border-left: 3px solid #20808D;
          }

          .reference-number {
            font-weight: 600;
            color: #20808D;
            font-size: 14px;
            flex-shrink: 0;
          }

          .reference-content {
            flex: 1;
          }

          .reference-title {
            font-weight: 500;
            font-size: 14px;
            color: #333;
            margin-bottom: 4px;
          }

          .reference-details {
            font-size: 12px;
            color: #666;
          }

          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            text-align: center;
            font-size: 12px;
            color: #999;
          }

          @media print {
            body {
              padding: 20px;
            }

            .no-print {
              display: none;
            }

            .reference-item {
              break-inside: avoid;
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Ruleout AI</div>
          <div class="date">${date}</div>
        </div>

        <div class="section">
          <div class="section-title">Question</div>
          <div class="section-content">${userMessage}</div>
        </div>

        <div class="section">
          <div class="section-title">Answer</div>
          <div class="section-content">${plainText}</div>
        </div>

        ${referencesHTML}

        <div class="footer">
          Generated by Ruleout AI © ${new Date().getFullYear()}
        </div>

        <script>
          // 페이지 로드 후 자동으로 인쇄 대화상자 열기
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Citation 문자열에서 모든 참고문헌 번호 추출
  const parseCitationNumbers = (citation: string): number[] => {
    const numbers: number[] = [];
    // [1], [1-5], [1,3,5] 같은 형태에서 [] 제거
    const content = citation.replace(/[\[\]]/g, '');

    // 쉼표로 분리
    const parts = content.split(',').map(p => p.trim());

    parts.forEach(part => {
      if (part.includes('-')) {
        // 범위: "1-5" -> [1,2,3,4,5]
        const [start, end] = part.split('-').map(n => parseInt(n.trim()));
        for (let i = start; i <= end; i++) {
          numbers.push(i);
        }
      } else {
        // 단일 숫자: "3" -> [3]
        numbers.push(parseInt(part));
      }
    });

    return numbers;
  };

  // 각주 클릭 시 스크롤 및 하이라이트
  const scrollToReference = (citation: string, messageIndex: number) => {
    const refNumbers = parseCitationNumbers(citation);

    // 첫 번째 참고문헌으로 스크롤
    if (refNumbers.length > 0) {
      const firstRefElement = document.getElementById(`ref-${messageIndex}-${refNumbers[0]}`);
      if (firstRefElement) {
        firstRefElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    // 모든 해당 참고문헌 하이라이트
    refNumbers.forEach(num => {
      const refElement = document.getElementById(`ref-${messageIndex}-${num}`);
      if (refElement) {
        refElement.classList.add('bg-orange-900/30');
        setTimeout(() => refElement.classList.remove('bg-orange-900/30'), 2000);
      }
    });
  };

  // Citation 처리 함수 (messageIndex를 파라미터로 받음)
  const processCitations = (text: string, messageIndex: number) => {
    const parts = text.split(/(\[\d+(?:-\d+)?(?:,\s*\d+(?:-\d+)?)*\])/g);
    return parts.map((part: string, index: number) => {
      if (/^\[\d+(?:-\d+)?(?:,\s*\d+(?:-\d+)?)*\]$/.test(part)) {
        return (
          <sup
            key={index}
            onClick={() => scrollToReference(part, messageIndex)}
            className="text-[0.65em] font-medium ml-0.5 cursor-pointer transition-colors"
            style={{ color: '#5AC8D8' }}
          >
            {part}
          </sup>
        );
      }
      return part;
    });
  };

  // 재귀적으로 children 처리 (messageIndex를 파라미터로 받음)
  const processChildrenWithCitations = (children: any, messageIndex: number): any => {
    if (typeof children === 'string') {
      return processCitations(children, messageIndex);
    }
    if (Array.isArray(children)) {
      return children.map((child, idx) => {
        if (typeof child === 'string') {
          return <span key={idx}>{processCitations(child, messageIndex)}</span>;
        }
        return child;
      });
    }
    return children;
  };

  // Markdown 렌더링 시 citation 처리 (messageIndex를 받는 함수로 변경)
  const createComponents = (messageIndex: number) => ({
    p: ({ children, ...props }: any) => {
      return <p {...props}>{processChildrenWithCitations(children, messageIndex)}</p>;
    },
    h2: ({ children, ...props }: any) => (
      <h2 className="text-xl font-bold mt-6 mb-3 text-white" {...props}>{children}</h2>
    ),
    h3: ({ children, ...props }: any) => (
      <h3 className="text-lg font-semibold mt-4 mb-2 text-white" {...props}>{children}</h3>
    ),
    ul: ({ children, ...props }: any) => (
      <ul className="list-disc list-outside space-y-2 my-3 ml-6 pl-0" {...props}>{children}</ul>
    ),
    ol: ({ children, ...props }: any) => (
      <ol className="list-decimal list-outside space-y-2 my-3 ml-6 pl-0" {...props}>{children}</ol>
    ),
    li: ({ children, ...props }: any) => (
      <li className="text-gray-200 leading-relaxed pl-2" {...props}>
        {processChildrenWithCitations(children, messageIndex)}
      </li>
    ),
    table: ({ children, ...props }: any) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border border-gray-600" {...props}>{children}</table>
      </div>
    ),
    thead: ({ children, ...props }: any) => (
      <thead className="bg-gray-700" {...props}>{children}</thead>
    ),
    th: ({ children, ...props }: any) => (
      <th className="border border-gray-600 px-4 py-2 text-left font-semibold" {...props}>{processChildrenWithCitations(children, messageIndex)}</th>
    ),
    td: ({ children, ...props }: any) => (
      <td className="border border-gray-600 px-4 py-2" {...props}>{processChildrenWithCitations(children, messageIndex)}</td>
    ),
  });

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#1a1a1a]">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 border-b border-gray-700 p-4 bg-[rgba(26,26,26,0.7)] backdrop-blur-md">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-1">
            <Image src="/image/clinical4-Photoroom.png" alt="Ruleout AI" width={32} height={32} />
            <span className="text-lg font-semibold">Ruleout AI</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="More"
            >
              <MoreHorizontal className="w-5 h-5 text-gray-400" />
            </button>
            <button
              onClick={handleToggleFavorite}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="Bookmark"
            >
              <Bookmark
                className="w-5 h-5"
                style={{ color: isFavorite ? '#20808D' : '#9ca3af' }}
                fill={isFavorite ? '#20808D' : 'none'}
              />
            </button>
            <button
              className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {messages.map((message, index) => (
            <div key={index}>
              {message.role === "user" ? (
                // 사용자 메시지
                <div className="flex justify-end mb-4">
                  <div className="bg-[#2a2a2a] rounded-2xl px-6 py-4 max-w-2xl">
                    <p className="text-white whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ) : (
                // AI 메시지
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Image
                      src="/image/clinical4-Photoroom.png"
                      alt="Ruleout AI"
                      width={32}
                      height={32}
                      className="rounded-full flex-shrink-0 mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      {/* AI 답변 */}
                      <div className="text-gray-200 prose prose-invert max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={createComponents(index)}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>

                      {/* 액션 버튼들 */}
                      {!message.isStreaming && (
                        <div className="flex items-center justify-between mt-4">
                          {/* 왼쪽: 텍스트가 있는 버튼들 */}
                          <div className="flex items-center space-x-2">
                            <button className="flex items-center space-x-2 px-3 py-1.5 hover:bg-gray-700 rounded-lg transition-colors">
                              <Share2 className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-400">Share</span>
                            </button>
                            <button
                              onClick={() => handleExportToPDF(messages[index - 1]?.content || "", message)}
                              className="flex items-center space-x-2 px-3 py-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-sm text-gray-400">Export</span>
                            </button>
                            <button
                              onClick={() => handleRewrite(index)}
                              className="flex items-center space-x-2 px-3 py-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                              disabled={isStreaming}
                            >
                              <RotateCcw className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-400">Rewrite</span>
                            </button>
                          </div>

                          {/* 오른쪽: 아이콘만 있는 버튼들 */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleCopyAnswer(message, index)}
                              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                              title="Copy"
                            >
                              {copiedIndex === index ? (
                                <Check className="w-4 h-4" style={{ color: '#20808D' }} />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                            <button
                              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                              title="Like"
                              onClick={() => handleMessageFeedback(index, 'like')}
                            >
                              <ThumbsUp
                                className="w-4 h-4 transition-colors"
                                fill="none"
                                stroke={message.feedback === 'like' ? '#20808D' : '#9ca3af'}
                                strokeWidth={message.feedback === 'like' ? 2.5 : 2}
                              />
                            </button>
                            <button
                              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                              title="Dislike"
                              onClick={() => handleMessageFeedback(index, 'dislike')}
                            >
                              <ThumbsDown
                                className="w-4 h-4 transition-colors"
                                fill="none"
                                stroke={message.feedback === 'dislike' ? '#20808D' : '#9ca3af'}
                                strokeWidth={message.feedback === 'dislike' ? 2.5 : 2}
                              />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 참고문헌 */}
                      {message.references && message.references.length > 0 && !message.isStreaming && (
                        <div className="mt-6 pt-6 border-t border-gray-700">
                          <button
                            onClick={() => setReferencesCollapsed({
                              ...referencesCollapsed,
                              [index]: !referencesCollapsed[index]
                            })}
                            className="flex items-center space-x-2 hover:text-white transition-colors mb-4"
                          >
                            <BookOpen className="w-5 h-5 text-gray-400" />
                            <h3 className="text-base font-medium text-gray-300">
                              References ({message.references.length})
                            </h3>
                            {referencesCollapsed[index] ? (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            )}
                          </button>

                          <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                              referencesCollapsed[index] ? 'max-h-0' : 'max-h-[2000px]'
                            }`}
                          >
                            <div className="space-y-3">
                              {message.references.map((ref, refIdx) => (
                                <div
                                  key={refIdx}
                                  id={`ref-${index}-${refIdx + 1}`}
                                  className="flex items-start justify-between py-3 transition-colors duration-500"
                                >
                                  <div className="flex items-start space-x-3 flex-1">
                                    <span className="font-medium text-base text-white">{refIdx + 1}.</span>
                                    <div className="flex-1 space-y-1.5">
                                      {ref.url ? (
                                        <a
                                          href={ref.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-base font-medium hover:underline cursor-pointer"
                                          style={{ color: '#5AC8D8' }}
                                        >
                                          {ref.title}
                                        </a>
                                      ) : (
                                        <h4 className="text-base font-medium" style={{ color: '#5AC8D8' }}>{ref.title}</h4>
                                      )}
                                      {ref.authors && ref.authors !== 'Unknown' && (
                                        <p className="text-sm text-white">{ref.authors}</p>
                                      )}
                                      {(ref.journal || ref.year) && (
                                        <p className="text-sm text-gray-300">
                                          {ref.journal && ref.journal !== 'Unknown' && `${ref.journal}. `}
                                          {ref.year && ref.year !== 'Unknown' && ref.year}
                                        </p>
                                      )}
                                      {ref.doi && ref.doi !== 'Unknown' && (
                                        <p className="text-sm text-gray-300">
                                          doi: {ref.doi}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-1 ml-4">
                                    <button
                                      className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                                      title="Like"
                                      onClick={() => handleReferenceFeedback(index, refIdx, 'like')}
                                    >
                                      <ThumbsUp
                                        className="w-3.5 h-3.5 transition-colors"
                                        fill="none"
                                        stroke={ref.feedback === 'like' ? '#20808D' : '#9ca3af'}
                                        strokeWidth={ref.feedback === 'like' ? 2.5 : 2}
                                      />
                                    </button>
                                    <button
                                      className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                                      title="Dislike"
                                      onClick={() => handleReferenceFeedback(index, refIdx, 'dislike')}
                                    >
                                      <ThumbsDown
                                        className="w-3.5 h-3.5 transition-colors"
                                        fill="none"
                                        stroke={ref.feedback === 'dislike' ? '#20808D' : '#9ca3af'}
                                        strokeWidth={ref.feedback === 'dislike' ? 2.5 : 2}
                                      />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 후속 질문 섹션 - 타이핑 완료 후에만 표시 */}
                      {!message.isStreaming && message.followupQuestions && message.followupQuestions.length > 0 && (
                        <div className="mt-10">
                          <div className="rounded-xl border border-gray-700 bg-gray-800/30 p-5">
                            <h3 className="text-lg font-medium text-gray-300 mb-4 flex items-center gap-2">
                              <List className="w-5 h-5" />
                              Related Questions
                            </h3>
                            <div className="divide-y divide-gray-700">
                              {message.followupQuestions.map((question, qIdx) => (
                                <button
                                  key={qIdx}
                                  onClick={() => handleFollowupQuestionClick(question)}
                                  className="w-full text-left py-3 px-3 transition-all duration-200 text-base text-gray-300 hover:text-[#5AC8D8] flex items-start group"
                                >
                                  <span className="mr-2 flex-shrink-0">↳</span>
                                  <span className="flex-1">{question}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* 로딩 표시 */}
          {isStreaming && messages[messages.length - 1]?.role === "user" && (
            <div className="flex flex-col items-center space-y-6">
              <div className="flex items-start space-x-3 w-full">
                <Image
                  src="/image/clinical4-Photoroom.png"
                  alt="Ruleout AI"
                  width={32}
                  height={32}
                  className="rounded-full flex-shrink-0"
                />
                <div className="flex items-center space-x-2 text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <div>Generating answer...</div>
                </div>
              </div>

              {/* Stop 버튼 */}
              <button
                onClick={handleStopGeneration}
                className="px-4 py-1.5 rounded-md border transition-all hover:brightness-110 text-xs"
                style={{
                  borderColor: '#20808D',
                  color: '#20808D',
                  backgroundColor: 'transparent'
                }}
              >
                Stop
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 입력 영역 */}
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          {/* Guest 모드 쿼리 카운터 */}
          {isGuestMode && !user && (
            <div className="mb-3 text-center">
              <p className="text-sm text-gray-400">
                {guestQueriesRemaining > 0 ? (
                  <>Free queries remaining: <span className="text-[#20808D] font-semibold">{guestQueriesRemaining}/5</span></>
                ) : (
                  <span className="text-orange-400">Query limit reached. Please log in to continue.</span>
                )}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex items-center bg-[#2a2a2a] rounded-2xl border border-gray-700 px-6 pr-2 py-2.5 hover:border-gray-600 transition-colors">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a follow-up question..."
                className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
                disabled={isStreaming}
              />
              <button
                type="submit"
                disabled={isStreaming || !input.trim()}
                className="w-12 h-12 flex items-center justify-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
                style={{ backgroundColor: '#20808D' }}
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 로그인 모달 - 쿼리 제한 도달 시 */}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  );
}
