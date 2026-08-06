"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/crm/lib/api";
import type { LeadTag } from "@/crm/types";
import CrmPanel from "@/crm/components/ui/CrmPanel";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";

const TAG_COLOR_CLASSES: Record<string, string> = {
  gray: "bg-(--color-nc-10) text-(--color-tc-40) border-(--color-tc-20)",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  purple: "bg-violet-50 text-violet-700 border-violet-200",
  amber: "bg-amber-50 text-amber-800 border-amber-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
};

function tagClassName(color: string) {
  return TAG_COLOR_CLASSES[color] ?? TAG_COLOR_CLASSES.gray;
}

function mergeServerTags(previous: LeadTag[], serverTags: LeadTag[]) {
  const serverNames = new Set(serverTags.map((t) => t.name.toLowerCase()));
  const pending = previous.filter(
    (t) => t.id.startsWith("temp-") && !serverNames.has(t.name.toLowerCase())
  );
  return [...serverTags, ...pending];
}

export interface LeadTagsProps {
  leadId: string;
  tags: LeadTag[];
  onChange: (tags: LeadTag[]) => void;
}

export default function LeadTags({ leadId, tags, onChange }: LeadTagsProps) {
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tagsRef = useRef(tags);

  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LeadTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  tagsRef.current = tags;

  const appliedTagIds = new Set(tags.map((t) => t.id));
  const trimmedQuery = query.trim();
  const canCreate =
    trimmedQuery.length > 0 &&
    !suggestions.some((t) => t.name.toLowerCase() === trimmedQuery.toLowerCase()) &&
    !tags.some((t) => t.name.toLowerCase() === trimmedQuery.toLowerCase());

  const options = [
    ...suggestions.filter((t) => !appliedTagIds.has(t.id)),
    ...(canCreate ? [{ id: "__create__", name: trimmedQuery, color: "gray" as const }] : []),
  ];

  const loadSuggestions = useCallback(async (search: string) => {
    setLoading(true);
    try {
      const result = await api.listTags(search || undefined);
      setSuggestions(result.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!adding || !open) return;
    const timer = setTimeout(() => {
      void loadSuggestions(trimmedQuery);
    }, 150);
    return () => clearTimeout(timer);
  }, [adding, open, trimmedQuery, loadSuggestions]);

  useEffect(() => {
    if (!adding) return;
    function onPointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setAdding(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [adding]);

  useEffect(() => {
    setHighlight(0);
  }, [options.length, query]);

  async function applyTag(
    payload: { tagId?: string; name?: string },
    preview: Pick<LeadTag, "name" | "color"> & { id?: string }
  ) {
    const name = preview.name.trim();
    if (!name) return;

    const current = tagsRef.current;
    if (current.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
      setQuery("");
      setOpen(true);
      return;
    }

    const optimistic: LeadTag = {
      id: preview.id ?? `temp-${crypto.randomUUID()}`,
      name,
      color: preview.color,
    };

    const next = [...current, optimistic];
    tagsRef.current = next;
    onChange(next);
    setQuery("");
    setOpen(true);
    setAdding(true);
    requestAnimationFrame(() => inputRef.current?.focus());

    try {
      const updated = await api.addLeadTag(leadId, payload);
      const merged = mergeServerTags(tagsRef.current, updated.tags ?? []);
      tagsRef.current = merged;
      onChange(merged);
    } catch (e) {
      const rolledBack = tagsRef.current.filter((t) => t.id !== optimistic.id);
      tagsRef.current = rolledBack;
      onChange(rolledBack);
      alert(e instanceof Error ? e.message : "Failed to add tag");
    }
  }

  async function removeTag(tagId: string) {
    if (tagId.startsWith("temp-")) return;

    const previous = tagsRef.current;
    const next = previous.filter((t) => t.id !== tagId);
    tagsRef.current = next;
    onChange(next);

    try {
      const updated = await api.removeLeadTag(leadId, tagId);
      const merged = mergeServerTags(tagsRef.current, updated.tags ?? []);
      tagsRef.current = merged;
      onChange(merged);
    } catch (e) {
      tagsRef.current = previous;
      onChange(previous);
      alert(e instanceof Error ? e.message : "Failed to remove tag");
    }
  }

  function commitQueryAsTag() {
    if (!trimmedQuery) return;

    const existing = suggestions.find(
      (t) => t.name.toLowerCase() === trimmedQuery.toLowerCase() && !appliedTagIds.has(t.id)
    );
    if (existing) {
      void applyTag({ tagId: existing.id }, existing);
      return;
    }

    void applyTag({ name: trimmedQuery }, { name: trimmedQuery, color: "gray" });
  }

  function selectOption(option: LeadTag) {
    if (option.id === "__create__") {
      void applyTag({ name: option.name }, { name: option.name, color: "gray" });
      return;
    }
    void applyTag({ tagId: option.id }, option);
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      setAdding(false);
      setQuery("");
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, Math.max(options.length - 1, 0)));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
      return;
    }
    if (e.key === "," || e.key === " ") {
      if (trimmedQuery.length > 0) {
        e.preventDefault();
        commitQueryAsTag();
      }
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (options.length > 0) {
        selectOption(options[highlight]);
      } else if (canCreate) {
        commitQueryAsTag();
      }
    }
  }

  function onInputChange(value: string) {
    if (/[,\s]/.test(value)) {
      const parts = value.split(/[,\s]+/);
      const remainder = /[,\s]$/.test(value) ? "" : parts.pop() ?? "";
      for (const part of parts) {
        const name = part.trim();
        if (!name) continue;
        const existing = suggestions.find(
          (t) => t.name.toLowerCase() === name.toLowerCase() && !appliedTagIds.has(t.id)
        );
        if (existing) {
          void applyTag({ tagId: existing.id }, existing);
        } else if (!tagsRef.current.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
          void applyTag({ name }, { name, color: "gray" });
        }
      }
      setQuery(remainder);
      setOpen(true);
      return;
    }

    setQuery(value);
    setOpen(true);
  }

  return (
    <CrmPanel title="Tags" className="overflow-visible">
      <div className="space-y-3">
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
                  tagClassName(tag.color)
                )}
              >
                {tag.name}
                <button
                  type="button"
                  disabled={tag.id.startsWith("temp-")}
                  className="rounded-full p-0.5 hover:bg-black/5 disabled:opacity-50"
                  aria-label={`Remove ${tag.name}`}
                  onClick={() => removeTag(tag.id)}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-muted">No tags yet</p>
        )}

        {adding ? (
          <div ref={containerRef} className="space-y-1">
            <input
              ref={inputRef}
              type="text"
              value={query}
              placeholder="Type a tag, then space or comma…"
              className="h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink outline-none placeholder:text-ink-subtle focus:border-brand-light focus:ring-2 focus:ring-brand-muted"
              onChange={(e) => onInputChange(e.target.value)}
              onFocus={() => setOpen(true)}
              onKeyDown={onInputKeyDown}
              autoComplete="off"
              role="combobox"
              aria-expanded={open}
              aria-controls={listboxId}
            />
            {open && (options.length > 0 || loading) && (
              <ul
                id={listboxId}
                role="listbox"
                className="max-h-48 w-full overflow-auto rounded-lg border border-line bg-surface py-1"
              >
                {loading && options.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-ink-muted">Loading…</li>
                ) : (
                  options.map((option, i) => (
                    <li key={option.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={i === highlight}
                        className={cn(
                          "flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-sidebar",
                          i === highlight && "bg-sidebar"
                        )}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectOption(option)}
                      >
                        {option.id === "__create__" ? (
                          <>
                            <Plus className="size-3.5 text-brand" />
                            <span>
                              Create tag &ldquo;{option.name}&rdquo;
                            </span>
                          </>
                        ) : (
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-xs font-medium",
                              tagClassName(option.color)
                            )}
                          >
                            {option.name}
                          </span>
                        )}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        ) : (
          <SecondaryButton
            type="button"
            size="small"
            className="w-full justify-start gap-1"
            icon={<Plus className="size-4" />}
            onClick={() => {
              setAdding(true);
              setOpen(true);
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
          >
            Add tag
          </SecondaryButton>
        )}
      </div>
    </CrmPanel>
  );
}
