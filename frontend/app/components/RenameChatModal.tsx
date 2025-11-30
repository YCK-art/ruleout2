"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface RenameChatModalProps {
  isOpen: boolean;
  currentTitle: string;
  onClose: () => void;
  onRename: (newTitle: string) => void;
}

export default function RenameChatModal({ isOpen, currentTitle, onClose, onRename }: RenameChatModalProps) {
  const { language } = useLanguage();
  const [title, setTitle] = useState(currentTitle);

  // Multilingual content
  const content = {
    English: {
      title: "Rename chat",
      cancel: "Cancel",
      save: "Save"
    },
    한국어: {
      title: "채팅 이름 변경",
      cancel: "취소",
      save: "저장"
    },
    日本語: {
      title: "チャット名を変更",
      cancel: "キャンセル",
      save: "保存"
    }
  };

  const currentContent = content[language as keyof typeof content];

  useEffect(() => {
    setTitle(currentTitle);
  }, [currentTitle, isOpen]);

  const handleSave = () => {
    if (!title.trim()) return;
    onRename(title.trim());
    onClose();
  };

  const handleCancel = () => {
    setTitle(currentTitle);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#2a2a2a] rounded-lg w-full max-w-2xl mx-4 p-8">
        {/* 제목 */}
        <h2 className="text-3xl font-semibold text-gray-200 mb-8">{currentContent.title}</h2>

        {/* 입력 필드 */}
        <div className="mb-8">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#1a1a1a] border-2 border-blue-500 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-blue-400"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSave();
              } else if (e.key === 'Escape') {
                handleCancel();
              }
            }}
          />
        </div>

        {/* 버튼 */}
        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={handleCancel}
            className="px-6 py-3 bg-transparent border border-gray-600 hover:bg-gray-700 text-gray-200 rounded-lg transition-colors"
          >
            {currentContent.cancel}
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-6 py-3 bg-white hover:bg-gray-100 text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentContent.save}
          </button>
        </div>
      </div>
    </div>
  );
}
