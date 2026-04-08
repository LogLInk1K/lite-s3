"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  side?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ children, content, side = "top" }: TooltipProps) {
  const [show, setShow] = React.useState(false);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });

  const handleEnter = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const gap = 8;
    let x = rect.left + rect.width / 2;
    let y = rect.top;

    if (side === "bottom") y = rect.bottom + gap;
    else if (side === "top") y = rect.top - gap;
    else if (side === "left") x = rect.left - gap;
    else if (side === "right") x = rect.right + gap;

    setPos({ x, y });
    setShow(true);
  };

  const transforms = {
    top: "-translate-x-1/2 -translate-y-full",
    bottom: "-translate-x-1/2",
    left: "-translate-x-full -translate-y-1/2",
    right: "-translate-y-1/2",
  };

  return (
    <div ref={triggerRef} className="relative inline-flex" onMouseEnter={handleEnter} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div
          className={cn(
            "fixed z-50 px-3 py-1.5 text-xs rounded-md bg-popover text-popover-foreground border shadow-md animate-in fade-in-0 zoom-in-95 whitespace-nowrap pointer-events-none",
            transforms[side]
          )}
          style={{ left: pos.x, top: pos.y }}
        >
          {content}
        </div>
      )}
    </div>
  );
}
