"use client";

import { useEffect, useCallback, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  compact?: boolean;
}

function Modal({ open, onClose, title, description, children, size = "md", compact = false }: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, handleEscape]);

  if (!open) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
    full: "max-w-[calc(100vw-32px)] max-h-[calc(100vh-32px)]",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          compact
            ? cn("relative w-full overflow-visible bg-transparent shadow-none")
            : cn("relative w-full overflow-hidden border border-border/80 bg-surface-container-high shadow-modal"),
          "animate-slide-up",
          sizes[size],
          // ensure content doesn't overflow viewport for full mode
          size === "full" ? "overflow-hidden" : "overflow-visible"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {!compact ? (
          <>
            <div className="flex items-start justify-between border-b border-border/70 px-5 py-4 sm:px-6">
              <div>
                {title && (
                  <h2 id="modal-title" className="text-lg font-semibold tracking-tight text-text-primary">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="mt-1 text-sm text-text-muted">{description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="ml-4 rounded-md border border-border/70 p-1.5 text-text-muted transition-colors hover:border-border hover:bg-white/[0.03] hover:text-text-primary"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-5 sm:px-6">{children}</div>
          </>
        ) : (
          <>
            <button
              onClick={onClose}
              className="absolute left-3 top-3 z-50 rounded-md border border-border/70 p-1.5 text-text-muted transition-colors hover:border-border hover:bg-white/[0.03] hover:text-text-primary"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
            <div className="p-0">{children}</div>
          </>
        )}
      </div>
    </div>
  );
}

export { Modal };
