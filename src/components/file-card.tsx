"use client";

import { cn, formatBytes } from "@/lib/utils";
import { FileOrFolder, useFileStore } from "@/store/file-store";
import { FileIcon, FolderIcon } from "./file-icon";
import { Thumbnail } from "./thumbnail";
import { isThumbnailable } from "@/hooks/use-thumbnail";

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
        "group relative rounded-lg border bg-card p-3 transition-[border-color] duration-150 hover:border-primary/50 cursor-pointer",
        isSelected && "border-primary ring-2 ring-primary/20"
      )}
      style={{ contentVisibility: "auto", containIntrinsicSize: "auto 140px" }}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <div className="absolute top-2 right-2 z-10" onClick={handleSelect}>
        <div
          className={cn(
            "h-4 w-4 rounded border transition-colors",
            isSelected ? "bg-primary border-primary" : "border-muted-foreground/30 opacity-0 group-hover:opacity-100"
          )}
        >
          {isSelected && (
            <svg className="h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 py-4">
        {isFolder ? (
          <FolderIcon className="h-10 w-10 text-blue-500" />
        ) : hasThumbnail ? (
          <Thumbnail name={item.name} itemKey={item.key} size="card" />
        ) : (
          <FileIcon name={item.name} className="h-10 w-10 text-muted-foreground" />
        )}
        <span className="text-sm font-medium text-center truncate w-full px-1">
          {item.name}
        </span>
        {!isFolder && "size" in item && (
          <span className="text-xs text-muted-foreground">
            {formatBytes(item.size)}
          </span>
        )}
      </div>
    </div>
  );
}
