import { Timestamp } from "firebase/firestore";

export interface Project {
  id: string;
  title: string;
  description?: string;
  userId: string;
  conversationIds: string[]; // 이 프로젝트에 속한 대화 ID들
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
