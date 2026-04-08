"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const thumbnailCache = new Map<string, { url: string; expiresAt: number }>();
const pendingRequests = new Map<string, Promise<string | null>>();
const observerMap = new Map<Element, () => void>();
let observer: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver {
  if (observer) return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const cb = observerMap.get(entry.target);
          if (cb) {
            cb();
            observerMap.delete(entry.target);
            observer!.unobserve(entry.target);
          }
        }
      }
    },
    { rootMargin: "200px 0px", threshold: 0 }
  );
  return observer;
}

async function fetchThumbnailUrl(key: string): Promise<string | null> {
  const cached = thumbnailCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }

  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)!;
  }

  const promise = (async () => {
    try {
      const res = await fetch(`/api/files/thumbnail?key=${encodeURIComponent(key)}`);
      if (!res.ok) return null;
      const data = await res.json();
      if (data.url) {
        thumbnailCache.set(key, { url: data.url, expiresAt: Date.now() + 50 * 60 * 1000 });
        return data.url;
      }
      return null;
    } catch {
      return null;
    } finally {
      pendingRequests.delete(key);
    }
  })();

  pendingRequests.set(key, promise);
  return promise;
}

export function useThumbnail(key: string | null, enabled: boolean = true) {
  const [url, setUrl] = useState<string | null>(() => {
    if (!key || !enabled) return null;
    const cached = thumbnailCache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.url;
    return null;
  });
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const fetchedRef = useRef(false);

  const loadThumbnail = useCallback(async () => {
    if (!key || !enabled || fetchedRef.current) return;
    fetchedRef.current = true;
    setLoading(true);
    const result = await fetchThumbnailUrl(key);
    setUrl(result);
    setLoading(false);
  }, [key, enabled]);

  useEffect(() => {
    if (!key || !enabled) return;

    const cached = thumbnailCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      setUrl(cached.url);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const obs = getObserver();
    observerMap.set(el, loadThumbnail);
    obs.observe(el);

    return () => {
      observerMap.delete(el);
      obs.unobserve(el);
    };
  }, [key, enabled, loadThumbnail]);

  return { url, loading, ref };
}

export function getCachedUrl(key: string): string | null {
  const cached = thumbnailCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.url;
  return null;
}

export { fetchThumbnailUrl };

export function isThumbnailable(name: string): boolean {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  return [
    "jpg", "jpeg", "png", "gif", "webp", "svg", "bmp",
    "mp4", "webm", "mov",
  ].includes(ext);
}
