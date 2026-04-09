"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const DialogContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>({ open: false, onOpenChange: () => {} });

export function Dialog({ open: controlledOpen, onOpenChange, children }: DialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen ?? internalOpen;
  const onOpenChangeFn = onOpenChange ?? setInternalOpen;

  return (
    <DialogContext.Provider value={{ open, onOpenChange: onOpenChangeFn }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
  const { onOpenChange } = React.useContext(DialogContext);
  return (
    <div className={className} onClick={() => onOpenChange(true)}>
      {children}
    </div>
  );
}

export function DialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open, onOpenChange } = React.useContext(DialogContext);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-overlay-primary backdrop-blur-sm transition-opacity" 
        onClick={() => onOpenChange(false)} 
      />
      <div
        className={cn(
          "relative z-50 w-full border border-border-subtle bg-surface-elevated shadow-2xl rounded-xl animate-in fade-in-0 zoom-in-95 duration-200",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5", className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 
      className={cn(
        "text-base font-medium leading-tight tracking-tight text-text-primary",
        className
      )} 
      {...props} 
    />
  );
}

export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p 
      className={cn(
        "text-sm text-text-secondary",
        className
      )} 
      {...props} 
    />
  );
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        "flex items-center justify-end gap-2 pt-4",
        className
      )} 
      {...props} 
    />
  );
}

export function DialogClose({ children, className }: { children: React.ReactNode; className?: string }) {
  const { onOpenChange } = React.useContext(DialogContext);
  return (
    <div className={className} onClick={() => onOpenChange(false)}>
      {children}
    </div>
  );
}
