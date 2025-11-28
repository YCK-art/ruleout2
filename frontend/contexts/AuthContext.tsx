"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  updateUserProfile: (displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  updateUserProfile: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateUserProfile = async (displayName: string) => {
    if (!auth.currentUser) {
      throw new Error("No user is currently signed in");
    }

    try {
      await updateProfile(auth.currentUser, { displayName });
      // Force a refresh of the user object
      setUser({ ...auth.currentUser });
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
