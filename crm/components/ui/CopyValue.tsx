"use client";

import { useState } from "react";
import { Check, Copy, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export function EditValueButton({
  onClick,
  label = "Edit",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-md p-1 text-ink-muted hover:bg-sidebar hover:text-ink"
      aria-label={label}
      title="Edit"
    >
      <Pencil className="size-3.5" />
    </button>
  );
}

export default function CopyValue({
  value,
  className,
  onEdit,
}: {
  value: string;
  className?: string;
  onEdit?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <span className="mt-0.5 inline-flex min-w-0 items-center gap-1.5">
      <span className={cn(className, !value && "text-ink-muted")} title={value || undefined}>
        {value || "—"}
      </span>
      {value ? (
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-md p-1 text-ink-muted hover:bg-sidebar hover:text-ink"
          aria-label={`Copy ${value}`}
          title="Copy"
        >
          {copied ? <Check className="size-3.5 text-brand" /> : <Copy className="size-3.5" />}
        </button>
      ) : null}
      {onEdit ? <EditValueButton onClick={onEdit} label={value ? `Edit ${value}` : "Edit"} /> : null}
    </span>
  );
}
