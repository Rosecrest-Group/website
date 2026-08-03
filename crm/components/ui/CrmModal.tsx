"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface CrmModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  closeDisabled?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  fitScreen?: boolean;
}

const sizeClass = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export default function CrmModal({
  isOpen,
  title,
  description,
  onClose,
  children,
  footer,
  closeDisabled = false,
  size = "md",
  fitScreen = false,
}: CrmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-200 flex items-center justify-center bg-(--color-ink)/20 backdrop-blur-[1px]",
        fitScreen ? "p-3 sm:p-4" : "p-4"
      )}
      onClick={closeDisabled ? undefined : onClose}
    >
      <div
        className={cn(
          "flex w-full flex-col overflow-hidden rounded-xl border border-(--color-line) bg-(--color-surface) shadow-(--shadow-elevated)",
          sizeClass[size],
          fitScreen
            ? "h-[calc(100dvh-1.5rem)] max-h-[calc(100dvh-1.5rem)] sm:h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-2rem)]"
            : "max-h-[min(90vh,720px)]"
        )}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="crm-modal-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-(--color-line) bg-linear-to-b from-(--color-brand-muted)/20 via-(--color-surface) to-(--color-surface) px-5 py-4 sm:px-5">
          <div className="min-w-0">
            <h2
              id="crm-modal-title"
              className="text-lg font-medium tracking-[-0.02em] text-(--color-ink)"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-(--color-ink-muted)">{description}</p>
            )}
          </div>
          <button
            type="button"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-(--color-ink-subtle) transition-colors hover:border-(--color-line) hover:bg-(--color-nc-20) hover:text-(--color-ink) disabled:opacity-50"
            onClick={onClose}
            disabled={closeDisabled}
            aria-label="Close"
          >
            <X className="size-4" strokeWidth={1.75} />
          </button>
        </div>

        <div
          className={cn(
            "flex-1 px-5 py-4",
            fitScreen ? "flex min-h-0 flex-col overflow-hidden" : "overflow-y-auto"
          )}
        >
          {children}
        </div>

        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-(--color-line) bg-(--color-nc-20)/40 px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
