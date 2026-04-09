"use client";

import { useEffect, useState } from "react";
import { useFileStore, FileItem } from "@/store/file-store";
import { useFileLink, useDeleteFile } from "@/hooks/use-files";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { isImageFile, isVideoFile, isAudioFile, isCodeFile, isMarkdownFile, isTextFile, getFileExtension } from "@/lib/utils";
import { Loader2, Download, Link, Pencil, Move, Copy, Trash2, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { cn } from "@/lib/utils";

export function FilePreview() {
  const { previewItem, setPreviewItem } = useFileStore();
  const linkMutation = useFileLink();
  const deleteMutation = useDeleteFile();
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isFile = previewItem?.type === "file";
  const fileItem = isFile ? (previewItem as FileItem) : null;

  useEffect(() => {
    if (!fileItem) return;

    const shouldFetchContent = isCodeFile(fileItem.name) || isMarkdownFile(fileItem.name) || isTextFile(fileItem.name);

    if (shouldFetchContent) {
      setLoading(true);
      linkMutation.mutateAsync({ key: fileItem.key }).then((result) => {
        if (result.url) {
          fetch(result.url)
            .then((res) => res.text())
            .then((text) => {
              setContent(text);
              setLoading(false);
            })
            .catch(() => setLoading(false));
        }
      });
    }

    return () => {
      setContent(null);
    };
  }, [fileItem?.key]);

  if (!previewItem || !isFile || !fileItem) return null;

  const ext = getFileExtension(fileItem.name);

  const handleDownload = async () => {
    const result = await linkMutation.mutateAsync({ key: fileItem.key });
    if (result.url) {
      window.open(result.url, "_blank");
    }
  };

  const handleCopyLink = async () => {
    const result = await linkMutation.mutateAsync({ key: fileItem.key });
    if (result.url) {
      await navigator.clipboard.writeText(result.url);
      alert("链接已复制到剪贴板");
    }
  };

  const handleDelete = () => {
    if (confirm(`确定要删除 ${fileItem.name} 吗？`)) {
      deleteMutation.mutate(fileItem.key);
      setPreviewItem(null);
    }
  };

  const handleRename = () => {
    const newName = prompt("请输入新名称", fileItem.name);
    if (newName && newName !== fileItem.name) {
      alert("重命名功能开发中");
    }
  };

  const handleMove = () => {
    alert("移动功能开发中");
  };

  const handleCopy = () => {
    alert("复制功能开发中");
  };

  return (
    <Dialog open={!!previewItem} onOpenChange={(open) => !open && setPreviewItem(null)}>
      <DialogContent className="w-[900px] h-[650px] max-w-[90vw] max-h-[85vh] flex flex-col overflow-hidden p-0">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <div className="flex items-center gap-3 min-w-0">
            <DialogTitle className="truncate">
              {fileItem.name}
            </DialogTitle>
          </div>
          <div className="flex items-center gap-0.5">
            <ActionButton onClick={handleDownload} title="下载">
              <Download className="h-4 w-4" />
            </ActionButton>
            <ActionButton onClick={handleCopyLink} title="复制链接">
              <Link className="h-4 w-4" />
            </ActionButton>
            <ActionButton onClick={handleRename} title="重命名">
              <Pencil className="h-4 w-4" />
            </ActionButton>
            <ActionButton onClick={handleMove} title="移动">
              <Move className="h-4 w-4" />
            </ActionButton>
            <ActionButton onClick={handleCopy} title="复制">
              <Copy className="h-4 w-4" />
            </ActionButton>
            <ActionButton onClick={handleDelete} title="删除" destructive>
              <Trash2 className="h-4 w-4" />
            </ActionButton>
            <div className="w-px h-4 bg-border-subtle mx-1" />
            <ActionButton onClick={() => setPreviewItem(null)} title="关闭">
              <X className="h-4 w-4" />
            </ActionButton>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-text-tertiary" />
            </div>
          ) : isImageFile(fileItem.name) ? (
            <ImagePreview fileKey={fileItem.key} />
          ) : isVideoFile(fileItem.name) ? (
            <MediaPreview fileKey={fileItem.key} type="video" />
          ) : isAudioFile(fileItem.name) ? (
            <MediaPreview fileKey={fileItem.key} type="audio" />
          ) : isMarkdownFile(fileItem.name) && content ? (
            <div className="p-6 prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          ) : (isCodeFile(fileItem.name) || isTextFile(fileItem.name)) && content ? (
            <div className="p-4">
              <SyntaxHighlighter
                language={ext || "text"}
                style={atomOneDark}
                customStyle={{ 
                  borderRadius: "0.5rem", 
                  fontSize: "0.8125rem",
                  background: "var(--color-surface-base)",
                  padding: "1rem"
                }}
                showLineNumbers
              >
                {content}
              </SyntaxHighlighter>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-text-tertiary text-sm">
              此文件类型暂不支持预览
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ActionButton({ 
  children, 
  onClick, 
  title, 
  destructive 
}: { 
  children: React.ReactNode; 
  onClick: () => void; 
  title: string;
  destructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "inline-flex items-center justify-center h-7 w-7 rounded-md transition-colors",
        "text-text-secondary hover:text-text-primary",
        "hover:bg-hover-bg",
        destructive && "text-destructive hover:text-destructive hover:bg-destructive/10"
      )}
    >
      {children}
    </button>
  );
}

function ImagePreview({ fileKey }: { fileKey: string }) {
  const linkMutation = useFileLink();
  const [url, setUrl] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    linkMutation.mutateAsync({ key: fileKey }).then((result) => {
      if (result.url) setUrl(result.url);
    });
  }, [fileKey]);

  return (
    <div className="flex items-center justify-center h-full p-6 bg-surface-base">
      {!loaded && (
        <Loader2 className="h-6 w-6 animate-spin text-text-tertiary" />
      )}
      {url && (
        <img
          src={url}
          alt={fileKey}
          className="max-w-full max-h-full object-contain rounded-lg transition-opacity duration-300"
          style={{ opacity: loaded ? 1 : 0 }}
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
}

function MediaPreview({ fileKey, type }: { fileKey: string; type: "video" | "audio" }) {
  const linkMutation = useFileLink();
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    linkMutation.mutateAsync({ key: fileKey }).then((result) => {
      if (result.url) setUrl(result.url);
    });
  }, [fileKey]);

  if (!url) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-text-tertiary" />
      </div>
    );
  }

  if (type === "video") {
    return (
      <div className="flex items-center justify-center h-full p-6 bg-surface-base">
        <video src={url} controls className="max-w-full max-h-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full p-6 bg-surface-base">
      <audio src={url} controls className="w-full max-w-lg" />
    </div>
  );
}
