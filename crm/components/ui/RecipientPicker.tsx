"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { api } from "@/crm/lib/api";
import type { MentionSuggestion } from "@/crm/types";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";

export type RecipientSelection =
  | { type: "user"; id: string; label: string }
  | { type: "broadcast"; label: string };

export interface RecipientPickerProps {
  selected: RecipientSelection[];
  onChange: (selected: RecipientSelection[]) => void;
  onConfirm: (selected: RecipientSelection[]) => void;
  onCancel?: () => void;
  excludeUserIds?: string[];
  autoFocus?: boolean;
  className?: string;
}

const EVERYONE: RecipientSelection = { type: "broadcast", label: "Everyone" };

function matchesEveryone(query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  return "everyone".startsWith(q) || "team".startsWith(q) || q === "all";
}

export default function RecipientPicker({
  selected,
  onChange,
  onConfirm,
  onCancel,
  excludeUserIds = [],
  autoFocus = true,
  className = "",
}: RecipientPickerProps) {
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<MentionSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const selectedUserIds = new Set(
    selected.filter((r): r is RecipientSelection & { type: "user" } => r.type === "user").map((r) => r.id)
  );
  const hasBroadcast = selected.some((r) => r.type === "broadcast");

  const filteredUsers =
    suggestions?.users.filter((u) => !excludeUserIds.includes(u.id) && !selectedUserIds.has(u.id)) ?? [];

  const showEveryone = matchesEveryone(query) && !hasBroadcast;

  const options: Array<
    | { kind: "user"; user: MentionSuggestion["users"][number] }
    | { kind: "broadcast"; item: RecipientSelection }
  > = [
    ...(showEveryone ? [{ kind: "broadcast" as const, item: EVERYONE }] : []),
    ...filteredUsers.map((user) => ({ kind: "user" as const, user })),
  ];

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await api.getMentionSuggestions(query.trim() || undefined);
        if (!cancelled) setSuggestions(result);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, open]);

  useEffect(() => {
    setHighlight(0);
  }, [options.length, query]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const addRecipient = useCallback(
    (recipient: RecipientSelection) => {
      if (recipient.type === "broadcast") {
        onChange([EVERYONE]);
        onConfirm([EVERYONE]);
        return;
      }

      if (selected.some((r) => r.type === "user" && r.id === recipient.id)) return;
      const next = [...selected.filter((r) => r.type !== "broadcast"), recipient];
      onChange(next);
      setQuery("");
      setOpen(true);
      inputRef.current?.focus();
    },
    [onChange, onConfirm, selected]
  );

  const removeRecipient = useCallback(
    (index: number) => {
      onChange(selected.filter((_, i) => i !== index));
      setOpen(true);
      inputRef.current?.focus();
    },
    [onChange, selected]
  );

  function selectHighlighted() {
    const option = options[highlight];
    if (!option) return;
    if (option.kind === "broadcast") addRecipient(option.item);
    else addRecipient({ type: "user", id: option.user.id, label: option.user.fullName });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, Math.max(options.length - 1, 0)));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (query.trim() && open && options.length > 0) {
        selectHighlighted();
        return;
      }
      if (selected.length > 0) onConfirm(selected);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      onCancel?.();
      return;
    }
    if (event.key === "Backspace" && !query && selected.length > 0) {
      removeRecipient(selected.length - 1);
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex items-start gap-3 border-b border-(--color-tc-20) bg-white px-4 py-3">
        <span className="pt-2 text-sm font-medium text-(--color-tc-30)">To:</span>
        <div className="flex min-h-10 min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {selected.map((recipient, index) => (
            <span
              key={recipient.type === "user" ? recipient.id : "broadcast"}
              className="inline-flex max-w-full items-center gap-1 rounded-md bg-(--color-nc-10) px-2 py-1 text-sm text-(--color-tc-40)"
            >
              <span className="truncate">{recipient.label}</span>
              <button
                type="button"
                className="rounded p-0.5 text-(--color-tc-30) hover:bg-white hover:text-(--color-tc-40)"
                aria-label={`Remove ${recipient.label}`}
                onClick={() => removeRecipient(index)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
          {!hasBroadcast && (
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={selected.length === 0 ? "Search people…" : "Add another person…"}
              className="min-w-[8rem] flex-1 border-0 bg-transparent py-2 text-sm text-(--color-tc-40) outline-none placeholder:text-(--color-tc-30)"
              role="combobox"
              aria-expanded={open}
              aria-controls={listboxId}
              aria-autocomplete="list"
            />
          )}
        </div>
        {selected.length > 0 && (
          <PrimaryButton
            type="button"
            className="shrink-0 px-4 py-1.5"
            onClick={() => onConfirm(selected)}
          >
            Start chat
          </PrimaryButton>
        )}
        {onCancel && (
          <button
            type="button"
            className="rounded-lg p-2 text-(--color-tc-30) hover:bg-(--color-nc-10) hover:text-(--color-tc-40)"
            aria-label="Cancel"
            onClick={onCancel}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {open && !hasBroadcast && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 max-h-64 overflow-y-auto border border-t-0 border-(--color-tc-20) bg-white shadow-lg"
        >
          {loading && options.length === 0 ? (
            <p className="px-4 py-3 text-sm text-(--color-tc-30)">Searching…</p>
          ) : options.length === 0 ? (
            <p className="px-4 py-3 text-sm text-(--color-tc-30)">No matches</p>
          ) : (
            options.map((option, index) => {
              const isActive = index === highlight;
              if (option.kind === "broadcast") {
                return (
                  <button
                    key="broadcast"
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm ${
                      isActive ? "bg-(--color-nc-10)" : "hover:bg-(--color-nc-10)"
                    }`}
                    onMouseEnter={() => setHighlight(index)}
                    onClick={() => addRecipient(option.item)}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-(--color-primary) text-xs font-semibold text-white">
                      @
                    </span>
                    <span>
                      <span className="font-medium text-(--color-tc-40)">Everyone</span>
                      <span className="mt-0.5 block text-xs text-(--color-tc-30)">Message the whole team</span>
                    </span>
                  </button>
                );
              }

              const initials = option.user.fullName
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <button
                  key={option.user.id}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm ${
                    isActive ? "bg-(--color-nc-10)" : "hover:bg-(--color-nc-10)"
                  }`}
                  onMouseEnter={() => setHighlight(index)}
                  onClick={() =>
                    addRecipient({ type: "user", id: option.user.id, label: option.user.fullName })
                  }
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-(--color-nc-10) text-xs font-semibold text-(--color-tc-40)">
                    {initials}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-(--color-tc-40)">{option.user.fullName}</span>
                    <span className="block truncate text-xs text-(--color-tc-30)">{option.user.email}</span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
