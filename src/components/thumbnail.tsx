"use client";

import { isThumbnailable } from "@/hooks/use-thumbnail";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

interface ThumbnailProps {
  name: string;
  itemKey: string;
  bucketId?: string | null;
  size?: "card" | "list";
  className?: string;
}

export function Thumbnail({ name, itemKey, bucketId, size = "card", className }: ThumbnailProps) {
  const enabled = isThumbnailable(name);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px", threshold: 0 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [enabled]);

  if (!enabled) return null;

  const sizeClasses = size === "card"
    ? "max-h-20 max-w-full object-contain rounded-lg"
    : "h-8 w-8 object-cover rounded shrink-0";

  const thumbSize = size === "card" ? 200 : 64;
  const bucketParam = bucketId ? `&bucketId=${encodeURIComponent(bucketId)}` : "";
  const src = visible ? `/api/files/thumbnail?key=${encodeURIComponent(itemKey)}&size=${thumbSize}${bucketParam}` : undefined;

  return (
    <div ref={ref} className={cn("relative overflow-hidden flex items-center justify-center", size === "card" ? "h-20 w-full" : "h-8 w-8 shrink-0", className)}>
      {visible && !error ? (
        <img
          src={src}
          alt=""
          className={cn(sizeClasses, "bg-surface-elevated")}
          loading="lazy"
          decoding="async"
          onError={() => setError(true)}
        />
      ) : (
        <div className={cn("flex items-center justify-center rounded-lg", size === "card" ? "h-12 w-12" : "h-8 w-8", "bg-hover-bg")}>
          <span className="text-[10px] text-text-tertiary uppercase font-medium">
            {name.split(".").pop()}
          </span>
        </div>
      )}
    </div>
  );
}
