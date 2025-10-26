"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowUp, BookOpen, Copy, Check, Share2, RotateCcw, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import jsPDF from "jspdf";
import { useAuth } from "@/contexts/AuthContext";
import {
  createConversation,
  addMessageToConversation,
  updateConversationTitle,
  generateChatTitle,
  getConversation,
} from "@/lib/chatService";

interface Reference {
  source: string;
  title: string;
  year: string;
  page: number;
  text: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  references?: Reference[];
  isStreaming?: boolean;
  timestamp?: Date;
}

interface ChatViewProps {
  initialQuestion: string;
  conversationId: string | null;
  onNewQuestion: () => void;
  onConversationCreated?: (conversationId: string) => void;
  onTitleUpdated?: () => void;
}

export default function ChatView({ initialQuestion, conversationId, onNewQuestion, onConversationCreated, onTitleUpdated }: ChatViewProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [referencesCollapsed, setReferencesCollapsed] = useState<{[key: number]: boolean}>({});
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const hasCalledAPI = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 스크롤을 맨 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 기존 대화 불러오기 또는 새 대화 시작
  useEffect(() => {
    const loadConversation = async () => {
      if (conversationId && !hasCalledAPI.current) {
        // 기존 대화 불러오기
        try {
          const conversation = await getConversation(conversationId);
          if (conversation && conversation.messages) {
            setMessages(conversation.messages);
            setCurrentConversationId(conversationId);
          }
        } catch (error) {
          console.error("대화 불러오기 실패:", error);
        }
      } else if (initialQuestion && !hasCalledAPI.current) {
        // 새 대화 시작
        hasCalledAPI.current = true;
        queryAPI(initialQuestion, true);
      }
    };

    loadConversation();
  }, [initialQuestion, conversationId]);

  // API 호출
  const queryAPI = async (question: string, isFirstMessage: boolean = false) => {
    // 사용자 메시지 추가
    const userMessage: Message = {
      role: "user",
      content: question,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);

    // Firebase에 사용자 메시지 저장
    if (user && currentConversationId) {
      try {
        await addMessageToConversation(currentConversationId, userMessage);
      } catch (error) {
        console.error("사용자 메시지 저장 실패:", error);
      }
    }

    try {
      // 백엔드 SSE 스트리밍 호출
      const response = await fetch("http://localhost:8000/query-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
        }),
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
              }
            } catch (e) {
              console.error("SSE 파싱 오류:", e);
            }
          }
        }
      }

      // 타이핑 애니메이션으로 답변 표시
      if (finalAnswer) {
        const assistantMessage: Message = {
          role: "assistant",
          content: "",
          references: finalReferences,
          isStreaming: true,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        const typingSpeed = 12; // milliseconds per character
        for (let i = 0; i <= finalAnswer.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, typingSpeed));
          const displayText = finalAnswer.slice(0, i);
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg && lastMsg.role === "assistant") {
              lastMsg.content = displayText;
              lastMsg.isStreaming = i < finalAnswer.length;
            }
            return newMessages;
          });
        }

        // 타이핑 완료 후 Firebase에 AI 메시지 저장
        const completedAssistantMessage: Message = {
          role: "assistant",
          content: finalAnswer,
          references: finalReferences,
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

              // 제목 생성
              const title = await generateChatTitle(question);
              await updateConversationTitle(newConvId, title);

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
    } catch (error) {
      console.error("API 오류:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "죄송합니다. 응답을 생성하는 중 오류가 발생했습니다.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsStreaming(false);
    }
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const question = input.trim();
    setInput("");
    await queryAPI(question, false); // 후속 질문
  };

  // 답변 복사
  const handleCopyAnswer = async (message: Message, index: number) => {
    let textToCopy = message.content;

    if (message.references && message.references.length > 0) {
      textToCopy += "\n\n참고문헌:\n";
      message.references.forEach((ref, idx) => {
        textToCopy += `${idx + 1}. ${ref.title}\n   ${ref.source}\n   ${ref.year}; 페이지 ${ref.page}\n\n`;
      });
    }

    await navigator.clipboard.writeText(textToCopy);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // PDF 내보내기
  const handleExportToPDF = (userMessage: string, assistantMessage: Message) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    doc.setFontSize(18);
    doc.text("Medical Pro", margin, yPos);
    yPos += 15;

    doc.setFontSize(10);
    const date = new Date().toLocaleDateString('ko-KR');
    doc.text(date, margin, yPos);
    yPos += 15;

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text("질문:", margin, yPos);
    yPos += 7;

    doc.setFont(undefined, 'normal');
    const questionLines = doc.splitTextToSize(userMessage, pageWidth - 2 * margin);
    doc.text(questionLines, margin, yPos);
    yPos += questionLines.length * 7 + 10;

    doc.setFont(undefined, 'bold');
    doc.text("답변:", margin, yPos);
    yPos += 7;

    doc.setFont(undefined, 'normal');
    const answerLines = doc.splitTextToSize(assistantMessage.content, pageWidth - 2 * margin);
    doc.text(answerLines, margin, yPos);

    doc.save(`medical-answer-${Date.now()}.pdf`);
  };

  // 각주 클릭 시 스크롤
  const scrollToReference = (refNumber: number, messageIndex: number) => {
    const refElement = document.getElementById(`ref-${messageIndex}-${refNumber}`);
    if (refElement) {
      refElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      refElement.classList.add('bg-orange-900/30');
      setTimeout(() => refElement.classList.remove('bg-orange-900/30'), 2000);
    }
  };

  // Markdown 렌더링 시 citation 처리
  const components = {
    p: ({ children, ...props }: any) => {
      if (typeof children === 'string') {
        const parts = children.split(/(\[\d+(?:-\d+)?(?:,\s*\d+(?:-\d+)?)*\])/g);
        const processed = parts.map((part: string, index: number) => {
          if (/^\[\d+(?:-\d+)?(?:,\s*\d+(?:-\d+)?)*\]$/.test(part)) {
            const refNumber = parseInt(part.match(/\d+/)?.[0] || "0");
            return (
              <sup
                key={index}
                onClick={() => scrollToReference(refNumber, messages.length - 1)}
                className="text-orange-400 text-[0.65em] font-medium ml-0.5 cursor-pointer hover:text-orange-300 transition-colors"
              >
                {part}
              </sup>
            );
          }
          return part;
        });
        return <p {...props}>{processed}</p>;
      }
      return <p {...props}>{children}</p>;
    },
    h2: ({ children, ...props }: any) => (
      <h2 className="text-xl font-bold mt-6 mb-3 text-white" {...props}>{children}</h2>
    ),
    h3: ({ children, ...props }: any) => (
      <h3 className="text-lg font-semibold mt-4 mb-2 text-white" {...props}>{children}</h3>
    ),
    ul: ({ children, ...props }: any) => (
      <ul className="list-disc list-inside space-y-1 my-3" {...props}>{children}</ul>
    ),
    ol: ({ children, ...props }: any) => (
      <ol className="list-decimal list-inside space-y-1 my-3" {...props}>{children}</ol>
    ),
    li: ({ children, ...props }: any) => (
      <li className="text-gray-200" {...props}>{children}</li>
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
      <th className="border border-gray-600 px-4 py-2 text-left font-semibold" {...props}>{children}</th>
    ),
    td: ({ children, ...props }: any) => (
      <td className="border border-gray-600 px-4 py-2" {...props}>{children}</td>
    ),
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#1a1a1a]">
      {/* 헤더 */}
      <div className="border-b border-gray-700 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-2">
            <Image src="/image/medical2.png" alt="Medical Pro" width={32} height={32} />
            <span className="text-lg font-semibold">Medical Pro</span>
          </div>
          <button
            onClick={onNewQuestion}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            새 대화
          </button>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
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
                      src="/image/medical2.png"
                      alt="Medical Pro"
                      width={32}
                      height={32}
                      className="rounded-full flex-shrink-0 mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      {/* AI 답변 */}
                      <div className="text-gray-200 prose prose-invert max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={components}
                        >
                          {message.content}
                        </ReactMarkdown>
                        {message.isStreaming && (
                          <span className="inline-block w-2 h-4 bg-orange-400 ml-1 animate-pulse" />
                        )}
                      </div>

                      {/* 액션 버튼들 */}
                      {!message.isStreaming && (
                        <div className="flex items-center space-x-2 mt-4">
                          <button
                            onClick={() => handleCopyAnswer(message, index)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            title="복사"
                          >
                            {copiedIndex === index ? (
                              <Check className="w-4 h-4 text-orange-400" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors" title="공유">
                            <Share2 className="w-4 h-4 text-gray-400" />
                          </button>
                          <button
                            onClick={() => handleExportToPDF(messages[index - 1]?.content || "", message)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            title="PDF 내보내기"
                          >
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors" title="다시 쓰기">
                            <RotateCcw className="w-4 h-4 text-gray-400" />
                          </button>
                          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors" title="좋아요">
                            <ThumbsUp className="w-4 h-4 text-gray-400" />
                          </button>
                          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors" title="싫어요">
                            <ThumbsDown className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      )}

                      {/* 참고문헌 */}
                      {message.references && message.references.length > 0 && !message.isStreaming && (
                        <div className="mt-6 pt-6 border-t border-gray-700">
                          <div className="flex items-center justify-between mb-4">
                            <button
                              onClick={() => setReferencesCollapsed({
                                ...referencesCollapsed,
                                [index]: !referencesCollapsed[index]
                              })}
                              className="flex items-center space-x-2 hover:text-white transition-colors"
                            >
                              <BookOpen className="w-5 h-5 text-gray-400" />
                              <h3 className="text-base font-medium text-gray-300">
                                참고문헌 ({message.references.length})
                              </h3>
                              {referencesCollapsed[index] ? (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronUp className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          </div>

                          {!referencesCollapsed[index] && (
                            <div className="space-y-3">
                              {message.references.map((ref, refIdx) => (
                                <div
                                  key={refIdx}
                                  id={`ref-${index}-${refIdx + 1}`}
                                  className="flex items-start justify-between py-3 border-l-2 border-gray-600 pl-4 transition-colors duration-500"
                                >
                                  <div className="flex items-start space-x-3 flex-1">
                                    <span className="text-orange-400 font-medium text-sm">[{refIdx + 1}]</span>
                                    <div className="flex-1 space-y-1">
                                      <h4 className="text-sm font-medium text-gray-200">{ref.title}</h4>
                                      <p className="text-xs text-gray-400">{ref.source}</p>
                                      <p className="text-xs text-gray-500">
                                        {ref.year} · 페이지 {ref.page}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-1 ml-4">
                                    <button className="p-1.5 hover:bg-gray-700 rounded transition-colors" title="좋아요">
                                      <ThumbsUp className="w-3.5 h-3.5 text-gray-400" />
                                    </button>
                                    <button className="p-1.5 hover:bg-gray-700 rounded transition-colors" title="싫어요">
                                      <ThumbsDown className="w-3.5 h-3.5 text-gray-400" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
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
            <div className="flex items-start space-x-3">
              <Image
                src="/image/medical2.png"
                alt="Medical Pro"
                width={32}
                height={32}
                className="rounded-full flex-shrink-0"
              />
              <div className="flex items-center space-x-2 text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <div>답변 생성 중...</div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 입력 영역 */}
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center bg-[#2a2a2a] rounded-2xl border border-gray-700 px-6 pr-2 py-2.5 hover:border-gray-600 transition-colors">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="후속 질문을 입력하세요..."
                className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
                disabled={isStreaming}
              />
              <button
                type="submit"
                disabled={isStreaming || !input.trim()}
                className="w-12 h-12 flex items-center justify-center bg-primary hover:bg-primary-dark rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
