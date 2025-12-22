import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Conversation, Message, ChatListItem } from "@/types/chat";
import { v4 as uuidv4 } from "uuid";

// 새 대화 생성
export const createConversation = async (userId: string): Promise<string> => {
  const conversationId = uuidv4();
  const conversationRef = doc(db, "chats", conversationId);

  try {
    await setDoc(conversationRef, {
      id: conversationId,
      userId,
      title: "새 대화",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      messages: [],
      isFavorite: false,
    });

    return conversationId;
  } catch (error) {
    console.error("대화 생성 오류:", error);
    throw error;
  }
};

// 메시지 추가 (Firestore에 저장)
export const addMessageToConversation = async (
  conversationId: string,
  message: Message
): Promise<void> => {
  const conversationRef = doc(db, "chats", conversationId);

  try {
    const conversationDoc = await getDoc(conversationRef);
    if (!conversationDoc.exists()) {
      throw new Error("대화를 찾을 수 없습니다");
    }

    const conversation = conversationDoc.data() as Conversation;
    const updatedMessages = [...conversation.messages, message];

    await updateDoc(conversationRef, {
      messages: updatedMessages,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("메시지 추가 오류:", error);
    throw error;
  }
};

// 대화 제목 업데이트
export const updateConversationTitle = async (
  conversationId: string,
  title: string
): Promise<void> => {
  const conversationRef = doc(db, "chats", conversationId);

  try {
    await updateDoc(conversationRef, {
      title,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("제목 업데이트 오류:", error);
    throw error;
  }
};

// 특정 대화 불러오기
export const getConversation = async (
  conversationId: string
): Promise<Conversation | null> => {
  const conversationRef = doc(db, "chats", conversationId);

  try {
    const conversationDoc = await getDoc(conversationRef);
    if (!conversationDoc.exists()) {
      return null;
    }

    return conversationDoc.data() as Conversation;
  } catch (error) {
    console.error("대화 불러오기 오류:", error);
    throw error;
  }
};

// 사용자의 모든 대화 목록 불러오기
export const getUserConversations = async (
  userId: string,
  limitCount: number = 20
): Promise<ChatListItem[]> => {
  console.log("=== getUserConversations called ===");
  console.log("Requesting conversations for userId:", userId);

  try {
    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("userId", "==", userId),
      orderBy("updatedAt", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const conversations: ChatListItem[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log("Document data:", {
        docId: doc.id,
        dataId: data.id,
        title: data.title,
        userId: data.userId,  // 중요: 실제 userId 확인
        isFavorite: data.isFavorite || false,
      });

      conversations.push({
        id: data.id,
        title: data.title,
        updatedAt: data.updatedAt,
        isFavorite: data.isFavorite || false,
      });
    });

    console.log("getUserConversations: Loaded", conversations.length, "conversations for user", userId);
    return conversations;
  } catch (error: any) {
    console.error("대화 목록 불러오기 오류:", error);
    // 인덱스가 없을 경우 fallback: 모든 대화 가져오기 (정렬 없이)
    try {
      const chatsRef = collection(db, "chats");
      const q = query(
        chatsRef,
        where("userId", "==", userId),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      const conversations: ChatListItem[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        conversations.push({
          id: data.id,
          title: data.title,
          updatedAt: data.updatedAt,
          isFavorite: data.isFavorite || false,
        });
      });

      // 클라이언트 측에서 정렬
      console.log("getUserConversations fallback: Loaded", conversations.length, "conversations");
      return conversations.sort((a, b) => {
        const aTime = a.updatedAt instanceof Timestamp ? a.updatedAt.toMillis() : 0;
        const bTime = b.updatedAt instanceof Timestamp ? b.updatedAt.toMillis() : 0;
        return bTime - aTime;
      });
    } catch (fallbackError) {
      console.error("Fallback 대화 목록 불러오기 오류:", fallbackError);
      return [];
    }
  }
};

// 채팅 제목 생성 API 호출
export const generateChatTitle = async (
  firstMessage: string
): Promise<string> => {
  try {
    const response = await fetch("/api/generate-title", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ firstMessage }),
    });

    if (!response.ok) {
      throw new Error("제목 생성 실패");
    }

    const data = await response.json();
    return data.title || firstMessage.slice(0, 100);
  } catch (error) {
    console.error("제목 생성 오류:", error);
    // 오류 시 첫 메시지의 앞 100자를 제목으로 사용
    return firstMessage.slice(0, 100);
  }
};

// 대화 삭제
export const deleteConversation = async (
  conversationId: string
): Promise<void> => {
  const conversationRef = doc(db, "chats", conversationId);

  try {
    await deleteDoc(conversationRef);
  } catch (error) {
    console.error("대화 삭제 오류:", error);
    throw error;
  }
};

// Toggle favorite status
export const toggleFavorite = async (
  conversationId: string,
  isFavorite: boolean
): Promise<void> => {
  const conversationRef = doc(db, "chats", conversationId);

  try {
    await updateDoc(conversationRef, {
      isFavorite: !isFavorite,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to toggle favorite:", error);
    throw error;
  }
};

// Get favorite conversations
export const getFavoriteConversations = async (
  userId: string,
  limitCount: number = 20
): Promise<ChatListItem[]> => {
  try {
    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("userId", "==", userId),
      where("isFavorite", "==", true),
      orderBy("updatedAt", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const conversations: ChatListItem[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      conversations.push({
        id: data.id,
        title: data.title,
        updatedAt: data.updatedAt,
        isFavorite: data.isFavorite,
      });
    });

    console.log("getFavoriteConversations: Found", conversations.length, "favorites");
    return conversations;
  } catch (error: any) {
    console.error("Failed to load favorite conversations:", error);

    // Fallback: Load all conversations and filter on client side
    try {
      console.log("Trying fallback: loading all user conversations");
      const chatsRef = collection(db, "chats");
      const q = query(
        chatsRef,
        where("userId", "==", userId),
        limit(100)
      );

      const querySnapshot = await getDocs(q);
      const conversations: ChatListItem[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.isFavorite === true) {
          conversations.push({
            id: data.id,
            title: data.title,
            updatedAt: data.updatedAt,
            isFavorite: data.isFavorite,
          });
        }
      });

      // Sort by updatedAt on client side
      conversations.sort((a, b) => {
        const aTime = a.updatedAt instanceof Timestamp ? a.updatedAt.toMillis() : 0;
        const bTime = b.updatedAt instanceof Timestamp ? b.updatedAt.toMillis() : 0;
        return bTime - aTime;
      });

      console.log("Fallback getFavoriteConversations: Found", conversations.length, "favorites");
      return conversations.slice(0, limitCount);
    } catch (fallbackError) {
      console.error("Fallback failed:", fallbackError);
      return [];
    }
  }
};

// 메시지 업데이트 (피드백 등)
export const updateMessage = async (
  conversationId: string,
  messageIndex: number,
  updatedMessage: Partial<Message>
): Promise<void> => {
  const conversationRef = doc(db, "chats", conversationId);

  try {
    const conversationDoc = await getDoc(conversationRef);
    if (!conversationDoc.exists()) {
      throw new Error("대화를 찾을 수 없습니다");
    }

    const conversation = conversationDoc.data() as Conversation;
    const updatedMessages = [...conversation.messages];
    updatedMessages[messageIndex] = {
      ...updatedMessages[messageIndex],
      ...updatedMessage,
    };

    await updateDoc(conversationRef, {
      messages: updatedMessages,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("메시지 업데이트 오류:", error);
    throw error;
  }
};

// 상대 시간 계산 (예: "2시간 전", "어제")
export const getRelativeTime = (timestamp: Timestamp | Date): string => {
  const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay === 1) return "어제";
  if (diffDay < 7) return `${diffDay}일 전`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}주 전`;
  if (diffDay < 365) return `${Math.floor(diffDay / 30)}개월 전`;
  return `${Math.floor(diffDay / 365)}년 전`;
};
