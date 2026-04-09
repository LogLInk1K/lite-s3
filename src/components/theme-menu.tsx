"use client";

import { useState, useRef, useEffect } from "react";
import { Moon, Sun, MoreHorizontal } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeMenu() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-hover-bg transition-colors"
      >
        <MoreHorizontal className="h-4 w-4 text-text-tertiary" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-surface-elevated rounded-lg border border-border-subtle shadow-lg z-50">
          <div className="p-1">
            <button
              onClick={handleThemeToggle}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-hover-bg rounded-md transition-colors"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-4 h-4 text-text-tertiary" />
                  <span className="text-text-secondary">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-text-tertiary" />
                  <span className="text-text-secondary">Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
