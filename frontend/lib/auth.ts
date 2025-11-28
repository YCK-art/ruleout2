import { signInWithPopup, User } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "./firebase";

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // 로그인 시 이전 사용자의 로컬 스토리지 데이터 초기화
    localStorage.removeItem("currentView");
    localStorage.removeItem("currentConversationId");
    localStorage.removeItem("currentProjectId");
    console.log("Cleared localStorage on login");

    // Firestore에 사용자 정보 저장/업데이트
    await saveUserToFirestore(user);

    return user;
  } catch (error) {
    console.error("Google 로그인 오류:", error);
    throw error;
  }
};

const saveUserToFirestore = async (user: User) => {
  const userRef = doc(db, "users", user.uid);

  try {
    // 기존 사용자 문서 확인
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      // 기존 사용자: 로그인 횟수 증가 및 마지막 로그인 시간 업데이트
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp(),
        loginCount: increment(1),
        email: user.email, // 이메일이 변경될 수 있으므로 업데이트
      });
    } else {
      // 신규 사용자: 새 문서 생성
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        loginCount: 1,
      });
    }
  } catch (error) {
    console.error("Firestore 사용자 저장 오류:", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    // 로그아웃 시 로컬 스토리지 초기화
    localStorage.removeItem("currentView");
    localStorage.removeItem("currentConversationId");
    localStorage.removeItem("currentProjectId");
    console.log("Cleared localStorage on logout");

    await auth.signOut();
  } catch (error) {
    console.error("로그아웃 오류:", error);
    throw error;
  }
};
