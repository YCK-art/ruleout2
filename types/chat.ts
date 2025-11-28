import { Timestamp } from "firebase/firestore";

export interface Reference {
  source: string;
  title: string;
  year: string;
  page: number;
  text: string;
  authors?: string;
  journal?: string;
  doi?: string;
  feedback?: 'like' | 'dislike' | null;
  url?: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Timestamp | Date;
  references?: Reference[];
  followupQuestions?: string[];
  isStreaming?: boolean;
  feedback?: 'like' | 'dislike' | null;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  messages: Message[];
  isFavorite?: boolean;
}

export interface ChatListItem {
  id: string;
  title: string;
  updatedAt: Timestamp | Date;
  isFavorite?: boolean;
}
