"use client";

import { useCallback, useRef, useState, useEffect } from "react";

interface SelectionBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface UseSelectionBoxOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  itemSelectors: string;
  onSelectionChange: (selectedKeys: Set<string>) => void;
  enabled?: boolean;
}

export function useSelectionBox({
  containerRef,
  itemSelectors,
  onSelectionChange,
  enabled = true,
}: UseSelectionBoxOptions) {
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const isSelecting = useRef(false);
  const startPoint = useRef({ x: 0, y: 0 });
  const selectedDuringDrag = useRef<Set<string>>(new Set());
  const hasMoved = useRef(false);
  const initialContainerRect = useRef<DOMRect | null>(null);
  const initialItemRects = useRef<Map<string, DOMRect>>(new Map());

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (!enabled || !containerRef.current) return;

      const target = e.target as HTMLElement;
      if (
        target.closest("button") ||
        target.closest("input") ||
        target.closest("a") ||
        target.closest("[data-key]")
      ) {
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      isSelecting.current = true;
      hasMoved.current = false;
      startPoint.current = { x, y };
      selectedDuringDrag.current = new Set();
      initialContainerRect.current = rect;
      initialItemRects.current.clear();

      const items = containerRef.current.querySelectorAll(itemSelectors);
      items.forEach((item) => {
        const key = (item as HTMLElement).dataset.key;
        if (key) {
          initialItemRects.current.set(key, item.getBoundingClientRect());
        }
      });

      setSelectionBox({
        startX: x,
        startY: y,
        endX: x,
        endY: y,
      });
    },
    [enabled, containerRef, itemSelectors]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isSelecting.current || !containerRef.current || !initialContainerRect.current) return;

      const containerRect = initialContainerRect.current;
      const x = e.clientX - containerRect.left;
      const y = e.clientY - containerRect.top;

      const dx = Math.abs(x - startPoint.current.x);
      const dy = Math.abs(y - startPoint.current.y);
      
      if (dx > 3 || dy > 3) {
        hasMoved.current = true;
      }

      setSelectionBox({
        startX: startPoint.current.x,
        startY: startPoint.current.y,
        endX: x,
        endY: y,
      });

      const box = {
        left: Math.min(startPoint.current.x, x),
        right: Math.max(startPoint.current.x, x),
        top: Math.min(startPoint.current.y, y),
        bottom: Math.max(startPoint.current.y, y),
      };

      const newSelected = new Set<string>();

      initialItemRects.current.forEach((itemRect, key) => {
        const itemLeft = itemRect.left - containerRect.left;
        const itemRight = itemRect.right - containerRect.left;
        const itemTop = itemRect.top - containerRect.top;
        const itemBottom = itemRect.bottom - containerRect.top;

        const overlaps = !(
          box.right < itemLeft ||
          box.left > itemRight ||
          box.bottom < itemTop ||
          box.top > itemBottom
        );

        if (overlaps) {
          newSelected.add(key);
        }
      });

      selectedDuringDrag.current = newSelected;
      onSelectionChange(newSelected);
    },
    [containerRef, onSelectionChange]
  );

  const handleMouseUp = useCallback(() => {
    if (isSelecting.current && !hasMoved.current) {
      onSelectionChange(new Set<string>());
    }
    isSelecting.current = false;
    hasMoved.current = false;
    setSelectionBox(null);
    initialContainerRect.current = null;
    initialItemRects.current.clear();
  }, [onSelectionChange]);

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [enabled, handleMouseDown, handleMouseMove, handleMouseUp, containerRef]);

  return {
    selectionBox,
    isSelecting: isSelecting.current,
  };
}
