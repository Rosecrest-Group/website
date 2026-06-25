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
  xl: "max-w-6xl",
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
        "fixed inset-0 z-200 flex items-center justify-center bg-black/40",
        fitScreen ? "p-3 sm:p-4" : "p-4"
      )}
      onClick={closeDisabled ? undefined : onClose}
    >
      <div
        className={cn(
          "flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-xl",
          sizeClass[size],
          fitScreen ? "h-[calc(100dvh-1.5rem)] max-h-[calc(100dvh-1.5rem)] sm:h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-2rem)]" : "max-h-[min(90vh,720px)]"
        )}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="crm-modal-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-(--color-tc-20) px-6 py-5">
          <div className="min-w-0">
            <h2 id="crm-modal-title" className="text-lg font-semibold text-(--color-tc-40)">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-(--color-tc-30)">{description}</p>}
          </div>
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] text-(--color-tc-30) transition hover:bg-(--color-nc-10) hover:text-(--color-tc-40) disabled:opacity-50"
            onClick={onClose}
            disabled={closeDisabled}
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <div
          className={cn(
            "flex-1 px-6 py-5",
            fitScreen ? "flex min-h-0 flex-col overflow-hidden" : "overflow-y-auto"
          )}
        >
          {children}
        </div>

        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-(--color-tc-20) bg-(--color-nc-10)/40 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
