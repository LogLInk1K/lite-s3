"use client";

import { useThumbnail, isThumbnailable } from "@/hooks/use-thumbnail";
import { isVideoFile } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ThumbnailProps {
  name: string;
  itemKey: string;
  size?: "card" | "list";
  className?: string;
}

export function Thumbnail({ name, itemKey, size = "card", className }: ThumbnailProps) {
  const enabled = isThumbnailable(name);
  const { url, loading, ref } = useThumbnail(enabled ? itemKey : null, enabled);
  const isVideo = isVideoFile(name);

  if (!enabled) return null;

  const sizeClasses = size === "card"
    ? "h-20 w-20 object-cover rounded"
    : "h-8 w-8 object-cover rounded flex-shrink-0";

  return (
    <div ref={ref} className={cn("relative overflow-hidden", size === "card" ? "h-20 w-20" : "h-8 w-8 shrink-0", className)}>
      {loading && (
        <div className={cn("flex items-center justify-center bg-muted rounded", sizeClasses)}>
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
      {!loading && url && (
        isVideo ? (
          <div className="relative">
            <img
              src={url}
              alt=""
              className={cn(sizeClasses, "bg-muted will-change-transform")}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-5 w-5 rounded-full bg-black/60 flex items-center justify-center">
                <svg className="h-3 w-3 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <img
            src={url}
            alt=""
            className={cn(sizeClasses, "bg-muted will-change-transform")}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
          />
        )
      )}
      {!loading && !url && (
        <div className={cn("flex items-center justify-center bg-muted rounded", sizeClasses)}>
          <span className="text-[8px] text-muted-foreground uppercase">
            {name.split(".").pop()}
          </span>
        </div>
      )}
    </div>
  );
}
