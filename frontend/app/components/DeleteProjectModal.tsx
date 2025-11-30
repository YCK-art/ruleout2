"use client";

import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectTitle: string;
}

export default function DeleteProjectModal({ isOpen, onClose, onConfirm, projectTitle }: DeleteProjectModalProps) {
  const { language } = useLanguage();

  // Multilingual content
  const content = {
    English: {
      title: "Delete project?",
      description: "All project files and chats will be permanently deleted. Before proceeding with deletion, please move them to the settings list or another project.",
      cancel: "Cancel",
      delete: "Delete"
    },
    한국어: {
      title: "프로젝트를 삭제하시겠습니까?",
      description: "모든 프로젝트 파일과 채팅이 영구적으로 삭제됩니다. 삭제하기 전에 설정 목록이나 다른 프로젝트로 이동하세요.",
      cancel: "취소",
      delete: "삭제"
    },
    日本語: {
      title: "プロジェクトを削除しますか？",
      description: "すべてのプロジェクトファイルとチャットが完全に削除されます。削除する前に、設定リストまたは別のプロジェクトに移動してください。",
      cancel: "キャンセル",
      delete: "削除"
    }
  };

  const currentContent = content[language as keyof typeof content];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
      onClick={onClose}
    >
      <div
        className="bg-[#2a2a2a] rounded-2xl p-8 w-full max-w-md mx-4 relative border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 제목 */}
        <h2 className="text-2xl font-bold text-white mb-4">
          {currentContent.title}
        </h2>

        {/* 설명 */}
        <p className="text-gray-300 mb-6 leading-relaxed">
          {currentContent.description}
        </p>

        {/* 버튼 */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-300 hover:text-white bg-transparent border border-gray-600 hover:border-gray-500 rounded-lg transition-colors font-medium"
          >
            {currentContent.cancel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-6 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium"
          >
            {currentContent.delete}
          </button>
        </div>
      </div>
    </div>
  );
}
