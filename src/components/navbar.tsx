"use client";

import { useFileStore } from "@/store/file-store";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, UploadCloud, Moon, Sun, LogOut } from "lucide-react";
import { useTheme } from "./theme-provider";
import { useRef } from "react";
import { signOut } from "next-auth/react";
import { Tooltip } from "./ui/tooltip";

export function Navbar() {
  const { searchQuery, setSearchQuery } = useFileStore();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">R2</span>
        </div>
        <h1 className="text-lg font-semibold hidden sm:block">Files</h1>
      </div>

      <div className="flex-1 max-w-md mx-auto relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索文件..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      <div className="flex items-center gap-1">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            // Handled by DropZone
          }}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud className="h-4 w-4" />
        </Button>
        <Tooltip content="切换主题" side="bottom">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </Tooltip>
        <Tooltip content="退出登录" side="bottom">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </Tooltip>
      </div>
    </header>
  );
}
