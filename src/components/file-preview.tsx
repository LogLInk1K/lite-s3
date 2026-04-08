"use client";

import { useEffect, useState } from "react";
import { useFileStore, FileItem } from "@/store/file-store";
import { useFileLink } from "@/hooks/use-files";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { isImageFile, isVideoFile, isAudioFile, isCodeFile, isMarkdownFile, isTextFile, getFileExtension } from "@/lib/utils";
import { Loader2, Download } from "lucide-react";
import { Button } from "./ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { getCachedUrl, fetchThumbnailUrl } from "@/hooks/use-thumbnail";

function registerLanguages() {
  const ext = ["javascript", "typescript", "python", "go", "rust", "java", "cpp", "c", "csharp", "ruby", "php", "swift", "kotlin", "sql", "bash", "json", "yaml", "xml", "html", "css", "scss", "markdown"];
  return ext;
}

export function FilePreview() {
  const { previewItem, setPreviewItem } = useFileStore();
  const linkMutation = useFileLink();
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

  return (
    <Dialog open={!!previewItem} onOpenChange={(open) => !open && setPreviewItem(null)}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="truncate">{fileItem.name}</span>
            <Button variant="ghost" size="icon" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isImageFile(fileItem.name) ? (
            <ImagePreview fileKey={fileItem.key} />
          ) : isVideoFile(fileItem.name) ? (
            <MediaPreview fileKey={fileItem.key} type="video" />
          ) : isAudioFile(fileItem.name) ? (
            <MediaPreview fileKey={fileItem.key} type="audio" />
          ) : isMarkdownFile(fileItem.name) && content ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          ) : (isCodeFile(fileItem.name) || isTextFile(fileItem.name)) && content ? (
            <SyntaxHighlighter
              language={ext || "text"}
              style={atomOneDark}
              customStyle={{ borderRadius: "0.5rem", fontSize: "0.875rem" }}
              showLineNumbers
            >
              {content}
            </SyntaxHighlighter>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              此文件类型暂不支持预览
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ImagePreview({ fileKey }: { fileKey: string }) {
  const [url, setUrl] = useState<string | null>(() => getCachedUrl(fileKey));

  useEffect(() => {
    if (url) return;
    fetchThumbnailUrl(fileKey).then((result) => {
      if (result) setUrl(result);
    });
  }, [fileKey, url]);

  if (!url) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <img src={url} alt={fileKey} className="max-w-full max-h-[70vh] object-contain rounded-lg" />
    </div>
  );
}

function MediaPreview({ fileKey, type }: { fileKey: string; type: "video" | "audio" }) {
  const [url, setUrl] = useState<string | null>(() => getCachedUrl(fileKey));
  const linkMutation = useFileLink();

  useEffect(() => {
    if (url) return;
    fetchThumbnailUrl(fileKey).then((result) => {
      if (result) setUrl(result);
    }).catch(() => {
      linkMutation.mutateAsync({ key: fileKey }).then((result) => {
        if (result.url) setUrl(result.url);
      });
    });
  }, [fileKey, url]);

  if (!url) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (type === "video") {
    return (
      <div className="flex items-center justify-center">
        <video src={url} controls className="max-w-full max-h-[70vh] rounded-lg" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">
      <audio src={url} controls className="w-full max-w-lg" />
    </div>
  );
}
