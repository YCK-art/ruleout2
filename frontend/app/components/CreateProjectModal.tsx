"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, description: string) => void;
}

export default function CreateProjectModal({ isOpen, onClose, onCreate }: CreateProjectModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = () => {
    if (!title.trim()) return;
    onCreate(title.trim(), description.trim());
    setTitle("");
    setDescription("");
  };

  const handleCancel = () => {
    setTitle("");
    setDescription("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#2a2a2a] rounded-lg w-full max-w-2xl mx-4 p-8 relative">
        {/* X 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* 제목 */}
        <h2 className="text-3xl font-semibold text-gray-200 mb-8">Create Project</h2>

        {/* 프로젝트 이름 */}
        <div className="mb-6">
          <label className="block text-base text-gray-300 mb-3">
            What are you working on?
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter project name"
            className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-600"
            autoFocus
          />
        </div>

        {/* 프로젝트 설명 */}
        <div className="mb-8">
          <label className="block text-base text-gray-300 mb-3">
            What are you trying to achieve?
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your project, goals, topics, etc..."
            rows={5}
            className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-600 resize-none"
          />
        </div>

        {/* 버튼 */}
        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={handleCancel}
            className="px-6 py-3 bg-transparent border border-gray-600 hover:bg-gray-700 text-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!title.trim()}
            className="px-6 py-3 bg-white hover:bg-gray-100 text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
}
