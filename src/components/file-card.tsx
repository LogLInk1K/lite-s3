"use client";

import { cn, formatBytes } from "@/lib/utils";
import { FileOrFolder, useFileStore } from "@/store/file-store";
import { FileIcon, FolderIcon } from "./file-icon";
import { Thumbnail } from "./thumbnail";
import { isThumbnailable } from "@/hooks/use-thumbnail";
import { Check } from "lucide-react";

interface FileCardProps {
  item: FileOrFolder;
}

export function FileCard({ item }: FileCardProps) {
  const { navigateToFolder, setPreviewItem, selectedItems, toggleSelect, openContextMenu } = useFileStore();
  const isSelected = selectedItems.has(item.key);
  const isFolder = item.type === "folder";
  const hasThumbnail = !isFolder && isThumbnailable(item.name);

  const handleClick = () => {
    if (isFolder) {
      navigateToFolder(item.key);
    } else {
      setPreviewItem(item);
    }
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSelect(item.key);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openContextMenu(item, e.clientX, e.clientY);
  };

  return (
    <div
      className={cn(
        "group relative rounded-lg p-4 cursor-pointer transition-all duration-150",
        "bg-surface-elevated border border-transparent",
        !isSelected && "hover:bg-hover-bg hover:border-border-subtle",
        isSelected && "bg-accent-violet/10 border-accent-violet/50"
      )}
      style={{ 
        contentVisibility: "auto", 
        containIntrinsicSize: "auto 160px"
      }}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <div 
        className="absolute top-3 right-3 z-10" 
        onClick={handleSelect}
      >
        <div
          className={cn(
            "h-4 w-4 rounded transition-all duration-150 flex items-center justify-center",
            isSelected 
              ? "bg-accent-violet border border-accent-violet" 
              : "border border-border-subtle opacity-0 group-hover:opacity-100 hover:border-border-standard"
          )}
        >
          {isSelected && (
            <Check className="h-3 w-3 text-white" strokeWidth={3} />
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center justify-center h-20">
          {isFolder ? (
            <FolderIcon className="h-12 w-12 text-brand-indigo" />
          ) : hasThumbnail ? (
            <Thumbnail name={item.name} itemKey={item.key} size="card" />
          ) : (
            <FileIcon name={item.name} className="h-12 w-12 text-text-tertiary" />
          )}
        </div>

        <span 
          className="text-sm text-center truncate w-full text-text-primary"
          style={{ 
            fontFamily: "'Inter Variable', 'Inter', sans-serif",
            fontFeatureSettings: '"cv01", "ss03"',
            fontWeight: 510,
            fontSize: '14px'
          }}
        >
          {item.name}
        </span>
      </div>
    </div>
  );
}

export function FileCardSkeleton() {
  return (
    <div className="rounded-lg p-4 animate-pulse bg-surface-elevated border border-transparent">
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center justify-center h-20">
          <div className="h-12 w-12 rounded-lg bg-hover-bg" />
        </div>
        <div className="h-4 rounded w-3/4 bg-hover-bg" />
      </div>
    </div>
  );
}
