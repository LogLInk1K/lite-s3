"use client";

import { cn, formatBytes, formatDate } from "@/lib/utils";
import { FileOrFolder, useFileStore } from "@/store/file-store";
import { FileIcon, FolderIcon } from "./file-icon";
import { Thumbnail } from "./thumbnail";
import { isThumbnailable } from "@/hooks/use-thumbnail";

interface FileListItemProps {
  item: FileOrFolder;
}

export function FileListItem({ item }: FileListItemProps) {
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
        "flex items-center gap-3 px-3 py-2 rounded-md transition-[background-color] duration-150 hover:bg-accent cursor-pointer",
        isSelected && "bg-accent ring-1 ring-primary/20"
      )}
      style={{ contentVisibility: "auto", containIntrinsicSize: "auto 40px" }}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <div onClick={handleSelect}>
        <div
          className={cn(
            "h-4 w-4 rounded border transition-colors shrink-0",
            isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
          )}
        >
          {isSelected && (
            <svg className="h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>

      {isFolder ? (
        <FolderIcon className="h-5 w-5 text-blue-500 shrink-0" />
      ) : hasThumbnail ? (
        <Thumbnail name={item.name} itemKey={item.key} size="list" />
      ) : (
        <FileIcon name={item.name} className="h-5 w-5 text-muted-foreground shrink-0" />
      )}

      <span className="flex-1 text-sm truncate">{item.name}</span>

      {!isFolder && "size" in item && (
        <span className="text-xs text-muted-foreground w-20 text-right shrink-0">
          {formatBytes(item.size)}
        </span>
      )}

      {!isFolder && "lastModified" in item && (
        <span className="text-xs text-muted-foreground w-36 text-right shrink-0">
          {formatDate(item.lastModified)}
        </span>
      )}
    </div>
  );
}
