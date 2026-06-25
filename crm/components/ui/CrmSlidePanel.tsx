"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CrmSlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  closeDisabled?: boolean;
  widthClassName?: string;
}

export default function CrmSlidePanel({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  closeDisabled = false,
  widthClassName = "max-w-md",
}: CrmSlidePanelProps) {
  const [mounted, setMounted] = useState(isOpen);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }
    setVisible(false);
    const timer = setTimeout(() => setMounted(false), 300);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted || closeDisabled) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mounted, closeDisabled, onClose]);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div className="crm-theme fixed inset-0 z-200">
      <button
        type="button"
        aria-label="Close panel"
        className={cn(
          "absolute inset-0 bg-black/40 transition-opacity duration-300",
          visible ? "opacity-100" : "opacity-0"
        )}
        onClick={closeDisabled ? undefined : onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "crm-slide-panel-title" : undefined}
        className={cn(
          "absolute inset-y-0 right-0 flex h-dvh max-h-dvh w-full flex-col border-l border-(--color-tc-20) bg-white shadow-2xl transition-transform duration-300 ease-out",
          widthClassName,
          visible ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-(--color-tc-20) px-6 py-5">
          <div className="min-w-0">
            {title && (
              <h2 id="crm-slide-panel-title" className="text-lg font-semibold text-(--color-tc-40)">
                {title}
              </h2>
            )}
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

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-(--color-tc-20) bg-(--color-nc-10)/40 px-6 py-4">
            {footer}
          </div>
        )}
      </aside>
    </div>,
    document.body
  );
}
