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
    <div className="fixed inset-0 z-200">
      <button
        type="button"
        aria-label="Close panel"
        className={cn(
          "absolute inset-0 bg-white/25 backdrop-blur-sm transition-[opacity,backdrop-filter] duration-300 ease-out",
          visible ? "opacity-100" : "opacity-0",
        )}
        onClick={closeDisabled ? undefined : onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "crm-slide-panel-title" : undefined}
        className={cn(
          "crm-theme absolute inset-y-0 right-0 flex h-dvh max-h-dvh w-full flex-col border-l border-(--color-line) bg-(--color-surface) shadow-[0_0_48px_rgba(63,63,80,0.12)] transition-transform duration-300 ease-[var(--ease-out-expo)] will-change-transform",
          widthClassName,
          visible ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-(--color-line) px-5 py-4">
          <div className="min-w-0">
            {title && (
              <h2
                id="crm-slide-panel-title"
                className="text-lg font-medium tracking-[-0.02em] text-(--color-ink)"
              >
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-(--color-ink-muted)">{description}</p>
            )}
          </div>
          <button
            type="button"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-(--color-ink-subtle) transition-colors hover:bg-(--color-nc-20) hover:text-(--color-ink) disabled:opacity-50"
            onClick={onClose}
            disabled={closeDisabled}
            aria-label="Close"
          >
            <X className="size-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-(--color-line) bg-(--color-nc-20)/40 px-5 py-4">
            {footer}
          </div>
        )}
      </aside>
    </div>,
    document.body
  );
}
