"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { commitEmailChips } from "@/crm/lib/emailCompose";
import { cn } from "@/lib/utils";

const CHIP_COLORS = [
  "bg-sky-100 text-sky-800",
  "bg-emerald-100 text-emerald-800",
  "bg-amber-100 text-amber-900",
  "bg-rose-100 text-rose-800",
  "bg-indigo-100 text-indigo-800",
  "bg-teal-100 text-teal-800",
  "bg-orange-100 text-orange-900",
  "bg-fuchsia-100 text-fuchsia-800",
] as const;

function chipColorFor(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = (hash * 31 + email.charCodeAt(i)) | 0;
  }
  return CHIP_COLORS[Math.abs(hash) % CHIP_COLORS.length];
}

export type EmailChipInputProps = {
  id?: string;
  label?: string;
  value: string[];
  onChange: (addresses: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export default function EmailChipInput({
  id,
  label = "Cc",
  value,
  onChange,
  placeholder = "Type an email and press Enter",
  className,
  disabled = false,
}: EmailChipInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState("");

  function commitDraft(raw = draft) {
    const next = commitEmailChips(value, raw);
    if (next.length !== value.length) onChange(next);
    setDraft("");
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
    inputRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === "," || event.key === ";" || event.key === " ") {
      if (!draft.trim()) return;
      event.preventDefault();
      commitDraft();
      return;
    }
    if (event.key === "Backspace" && !draft && value.length > 0) {
      event.preventDefault();
      removeAt(value.length - 1);
    }
  }

  return (
    <div className={cn("flex items-start gap-3", className)}>
      {label ? (
        <label htmlFor={inputId} className="shrink-0 pt-2 text-sm font-medium text-ink">
          {label}
        </label>
      ) : null}
      <div
        className={cn(
          "flex min-h-9 min-w-0 flex-1 flex-wrap items-center gap-1.5 rounded-lg border border-line bg-surface px-2 py-1.5 transition-colors focus-within:border-brand-light focus-within:ring-2 focus-within:ring-brand-muted",
          disabled && "opacity-60"
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((address, index) => (
          <span
            key={address}
            className={cn(
              "inline-flex max-w-full items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              chipColorFor(address)
            )}
          >
            <span className="truncate">{address}</span>
            <button
              type="button"
              disabled={disabled}
              className="shrink-0 rounded-full p-0.5 opacity-70 transition hover:bg-black/10 hover:opacity-100"
              aria-label={`Remove ${address}`}
              onClick={(e) => {
                e.stopPropagation();
                removeAt(index);
              }}
            >
              <X className="size-3" aria-hidden />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          id={inputId}
          type="email"
          value={draft}
          disabled={disabled}
          autoComplete="off"
          placeholder={value.length === 0 ? placeholder : "Add another…"}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (draft.trim()) commitDraft();
          }}
          className="min-w-40 flex-1 border-0 bg-transparent py-0.5 text-sm text-ink outline-none placeholder:text-ink-faint"
        />
      </div>
    </div>
  );
}
