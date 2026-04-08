"use client";

import {
  Folder,
  File,
  Image,
  FileCode,
  FileText,
  Film,
  Music,
  FileArchive,
} from "lucide-react";
import { isImageFile, isVideoFile, isAudioFile, isCodeFile, isMarkdownFile, isTextFile, getFileExtension } from "@/lib/utils";

const archiveExts = ["zip", "rar", "7z", "tar", "gz", "bz2", "xz"];

export function FileIcon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  const ext = getFileExtension(name);

  if (isImageFile(name)) return <Image className={className} />;
  if (isVideoFile(name)) return <Film className={className} />;
  if (isAudioFile(name)) return <Music className={className} />;
  if (isCodeFile(name)) return <FileCode className={className} />;
  if (isMarkdownFile(name)) return <FileText className={className} />;
  if (isTextFile(name)) return <FileText className={className} />;
  if (archiveExts.includes(ext)) return <FileArchive className={className} />;

  return <File className={className} />;
}

export function FolderIcon({ className = "h-5 w-5" }: { className?: string }) {
  return <Folder className={className} />;
}
