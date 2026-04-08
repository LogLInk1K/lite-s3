"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { flushSync } from "react-dom";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored === "light" || stored === "dark") {
      setThemeState(stored);
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      setThemeState("light");
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  const setTheme = useCallback((newTheme: Theme) => {
    const root = document.documentElement;

    if (document.startViewTransition) {
      const transition = document.startViewTransition(() => {
        flushSync(() => {
          root.classList.remove("light", "dark");
          root.classList.add(newTheme);
          localStorage.setItem("theme", newTheme);
          setThemeState(newTheme);
        });
      });
      transition.ready.then(() => {
        root.classList.add("theme-vt-active");
        setTimeout(() => root.classList.remove("theme-vt-active"), 400);
      });
    } else {
      root.classList.add("theme-transition");
      setThemeState(newTheme);
      setTimeout(() => {
        root.classList.remove("theme-transition");
      }, 300);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
