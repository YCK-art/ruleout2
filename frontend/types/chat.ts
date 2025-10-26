import { Timestamp } from "firebase/firestore";

export interface Reference {
  source: string;
  title: string;
  year: string;
  page: number;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Timestamp | Date;
  references?: Reference[];
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  messages: Message[];
}

export interface ChatListItem {
  id: string;
  title: string;
  updatedAt: Timestamp | Date;
}
