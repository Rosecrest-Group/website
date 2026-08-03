"use client";

import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  danger?: boolean;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  danger = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-(--color-ink)/20 p-4 backdrop-blur-[1px]"
      onClick={loading ? undefined : onCancel}
    >
      <div
        className="w-full max-w-md rounded-xl border border-(--color-line) bg-(--color-surface) p-5 shadow-(--shadow-elevated)"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <h2
          id="confirm-modal-title"
          className="text-lg font-medium tracking-[-0.02em] text-(--color-ink)"
        >
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm text-(--color-ink-muted)">{description}</p>
        )}
        {error && <p className="mt-2 text-sm text-orange-700">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <SecondaryButton type="button" className="w-auto" disabled={loading} onClick={onCancel}>
            {cancelLabel}
          </SecondaryButton>
          <PrimaryButton
            type="button"
            className={`w-auto px-6 ${danger ? "bg-orange-600 hover:bg-orange-700" : ""}`}
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? "Working…" : confirmLabel}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
