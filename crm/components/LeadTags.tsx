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

export interface LeadTagsProps {
  leadId: string;
  tags: LeadTag[];
  onChange: (tags: LeadTag[]) => void;
}

export default function LeadTags({ leadId, tags, onChange }: LeadTagsProps) {
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LeadTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [saving, setSaving] = useState(false);

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

  async function applyTag(payload: { tagId?: string; name?: string }) {
    setSaving(true);
    try {
      const updated = await api.addLeadTag(leadId, payload);
      onChange(updated.tags ?? []);
      setQuery("");
      setOpen(false);
      setAdding(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to add tag");
    } finally {
      setSaving(false);
    }
  }

  async function removeTag(tagId: string) {
    setSaving(true);
    try {
      const updated = await api.removeLeadTag(leadId, tagId);
      onChange(updated.tags ?? []);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to remove tag");
    } finally {
      setSaving(false);
    }
  }

  function selectOption(option: LeadTag) {
    if (option.id === "__create__") {
      void applyTag({ name: option.name });
      return;
    }
    void applyTag({ tagId: option.id });
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
    if (e.key === "Enter") {
      e.preventDefault();
      if (options.length > 0) {
        selectOption(options[highlight]);
      } else if (canCreate) {
        void applyTag({ name: trimmedQuery });
      }
    }
  }

  return (
    <CrmPanel title="Tags">
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
                  disabled={saving}
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
          <p className="text-sm text-(--color-tc-30)">No tags yet</p>
        )}

        {adding ? (
          <div ref={containerRef} className="relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              disabled={saving}
              placeholder="Search or create a tag…"
              className="h-10 w-full rounded-xl border border-(--color-tc-20) bg-white px-3 text-sm text-(--color-tc-40) outline-none placeholder:text-(--color-tc-30) focus:ring-2 focus:ring-(--color-primary)/20"
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
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
                className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-(--color-tc-20) bg-white py-1 shadow-lg"
              >
                {loading && options.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-(--color-tc-30)">Loading…</li>
                ) : (
                  options.map((option, i) => (
                    <li key={option.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={i === highlight}
                        className={cn(
                          "flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-(--color-tc-40) hover:bg-(--color-nc-10)",
                          i === highlight && "bg-(--color-nc-10)"
                        )}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectOption(option)}
                      >
                        {option.id === "__create__" ? (
                          <>
                            <Plus className="size-3.5 text-(--color-primary)" />
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
            disabled={saving}
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
