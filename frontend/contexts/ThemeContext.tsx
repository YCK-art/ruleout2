"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type ThemeMode = "system" | "light" | "dark";

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  effectiveTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>("dark");
  const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">("dark");

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("themeMode") as ThemeMode | null;
    if (savedTheme) {
      setThemeModeState(savedTheme);
    }
  }, []);

  // Update effective theme based on themeMode and system preference
  useEffect(() => {
    const updateEffectiveTheme = () => {
      if (themeMode === "system") {
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setEffectiveTheme(systemPrefersDark ? "dark" : "light");
      } else {
        setEffectiveTheme(themeMode);
      }
    };

    updateEffectiveTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (themeMode === "system") {
        updateEffectiveTheme();
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [themeMode]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem("themeMode", mode);
  };

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
