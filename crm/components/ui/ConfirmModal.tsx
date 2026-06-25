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
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/40 p-4"
      onClick={loading ? undefined : onCancel}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <h2 id="confirm-modal-title" className="text-lg font-semibold text-(--color-tc-40)">
          {title}
        </h2>
        {description && <p className="mt-2 text-sm text-(--color-tc-30)">{description}</p>}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <SecondaryButton type="button" className="w-auto" disabled={loading} onClick={onCancel}>
            {cancelLabel}
          </SecondaryButton>
          <PrimaryButton
            type="button"
            className={`w-auto px-6 ${danger ? "bg-red-600 hover:bg-red-700" : ""}`}
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
