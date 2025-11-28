"use client";

import { X } from "lucide-react";

interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectTitle: string;
}

export default function DeleteProjectModal({ isOpen, onClose, onConfirm, projectTitle }: DeleteProjectModalProps) {
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
          Delete project?
        </h2>

        {/* 설명 */}
        <p className="text-gray-300 mb-6 leading-relaxed">
          All project files and chats will be permanently deleted. Before proceeding with deletion, please move them to the settings list or another project.
        </p>

        {/* 버튼 */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-300 hover:text-white bg-transparent border border-gray-600 hover:border-gray-500 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-6 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
