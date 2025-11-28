import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { db } from "./firebase";
import { Project } from "@/types/project";

// 새 프로젝트 생성
export const createProject = async (userId: string, title: string = "새 프로젝트"): Promise<string> => {
  const projectRef = doc(collection(db, "projects"));
  const projectId = projectRef.id;

  const newProject = {
    id: projectId,
    title,
    description: "",
    userId,
    conversationIds: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await setDoc(projectRef, newProject);
  return projectId;
};

// 단일 프로젝트 가져오기
export const getProject = async (projectId: string): Promise<Project | null> => {
  try {
    const projectRef = doc(db, "projects", projectId);
    const projectSnap = await getDoc(projectRef);

    if (projectSnap.exists()) {
      return projectSnap.data() as Project;
    }
    return null;
  } catch (error) {
    console.error("프로젝트 불러오기 오류:", error);
    return null;
  }
};

// 프로젝트 목록 가져오기
export const getUserProjects = async (userId: string): Promise<Project[]> => {
  try {
    const projectsRef = collection(db, "projects");
    const q = query(
      projectsRef,
      where("userId", "==", userId),
      orderBy("updatedAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const projects: Project[] = [];

    querySnapshot.forEach((doc) => {
      projects.push(doc.data() as Project);
    });

    return projects;
  } catch (error: any) {
    console.error("프로젝트 목록 불러오기 오류:", error);

    // 인덱스가 없을 경우 fallback
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      try {
        console.log("Fallback: orderBy 없이 쿼리 시도");
        const projectsRef = collection(db, "projects");
        const q = query(projectsRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        const projects: Project[] = [];

        querySnapshot.forEach((doc) => {
          projects.push(doc.data() as Project);
        });

        // 클라이언트 측 정렬
        return projects.sort((a, b) => {
          const aTime = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
          const bTime = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
          return bTime - aTime;
        });
      } catch (fallbackError) {
        console.error("Fallback 쿼리도 실패:", fallbackError);
        return [];
      }
    }

    return [];
  }
};

// 프로젝트에 대화 추가
export const addConversationToProject = async (projectId: string, conversationId: string): Promise<void> => {
  const projectRef = doc(db, "projects", projectId);

  await updateDoc(projectRef, {
    conversationIds: arrayUnion(conversationId),
    updatedAt: Timestamp.now(),
  });
};

// 프로젝트에서 대화 제거
export const removeConversationFromProject = async (projectId: string, conversationId: string): Promise<void> => {
  const projectRef = doc(db, "projects", projectId);

  await updateDoc(projectRef, {
    conversationIds: arrayRemove(conversationId),
    updatedAt: Timestamp.now(),
  });
};

// 프로젝트 삭제
export const deleteProject = async (projectId: string): Promise<void> => {
  const projectRef = doc(db, "projects", projectId);
  await deleteDoc(projectRef);
};

// 프로젝트 제목 수정
export const updateProjectTitle = async (projectId: string, title: string): Promise<void> => {
  const projectRef = doc(db, "projects", projectId);

  await updateDoc(projectRef, {
    title,
    updatedAt: Timestamp.now(),
  });
};

// 프로젝트 설명 수정
export const updateProjectDescription = async (projectId: string, description: string): Promise<void> => {
  const projectRef = doc(db, "projects", projectId);

  await updateDoc(projectRef, {
    description,
    updatedAt: Timestamp.now(),
  });
};
