"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, Users, X } from "lucide-react";
import { api } from "@/crm/lib/api";
import { LEAD_SOURCES, LEAD_STAGE_LABELS } from "@/crm/lib/constants";
import type { CampaignSelection } from "@/crm/types/campaigns";
import type { Lead } from "@/crm/types";
import { cn } from "@/lib/utils";

const STAGES = Object.entries(LEAD_STAGE_LABELS);

const LISTS: { list: "active" | "all"; label: string; description: string }[] = [
  { list: "active", label: "Active leads", description: "Open pipeline, not won or lost" },
  { list: "all", label: "All leads", description: "Every lead, including won and lost" },
];

export function selectionKey(selection: CampaignSelection): string {
  if (selection.kind === "list") return `list:${selection.list}`;
  if (selection.kind === "stage") return `stage:${selection.stage}`;
  if (selection.kind === "source") return `source:${selection.source}`;
  if (selection.kind === "email") return `email:${selection.email}`;
  return `lead:${selection.id}`;
}

export function selectionLabel(selection: CampaignSelection): string {
  if (selection.kind === "list") return selection.list === "all" ? "All leads" : "Active leads";
  if (selection.kind === "stage") return LEAD_STAGE_LABELS[selection.stage] ?? selection.stage;
  if (selection.kind === "source") {
    return LEAD_SOURCES.find((row) => row.value === selection.source)?.label ?? selection.source;
  }
  if (selection.kind === "email") return selection.email;
  return selection.label;
}

const PILL_COLORS = [
  "border-sky-200 bg-sky-100 text-sky-800",
  "border-emerald-200 bg-emerald-100 text-emerald-800",
  "border-amber-200 bg-amber-100 text-amber-900",
  "border-rose-200 bg-rose-100 text-rose-800",
  "border-indigo-200 bg-indigo-100 text-indigo-800",
  "border-teal-200 bg-teal-100 text-teal-800",
  "border-orange-200 bg-orange-100 text-orange-900",
  "border-fuchsia-200 bg-fuchsia-100 text-fuchsia-800",
] as const;

function pillColor(selection: CampaignSelection): string {
  const key = selectionKey(selection);
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  return PILL_COLORS[Math.abs(hash) % PILL_COLORS.length];
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emailTokens(raw: string): string[] {
  return raw
    .split(/[\s,;]+/)
    .map((part) => part.trim().toLowerCase())
    .filter((part) => EMAIL_PATTERN.test(part));
}

function selectionTotal(
  selection: CampaignSelection,
  counts: {
    active: number;
    all: number;
    stages: Record<string, number>;
    sources: Record<string, number>;
  } | null,
): number | null {
  if (!counts) return null;
  if (selection.kind === "list") return selection.list === "all" ? counts.all : counts.active;
  if (selection.kind === "stage") return counts.stages[selection.stage] ?? 0;
  if (selection.kind === "source") return counts.sources[selection.source] ?? 0;
  return 1;
}

function leadLabel(lead: Lead): string {
  const name =
    lead.customerName ??
    (lead.customer ? `${lead.customer.firstName} ${lead.customer.lastName}`.trim() : "Lead");
  return lead.customer?.email ? `${name} · ${lead.customer.email}` : name;
}

function OptionButton({
  selected,
  title,
  description,
  onClick,
}: {
  selected: boolean;
  title: string;
  description?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "flex w-full items-start justify-between gap-3 rounded-md border px-3 py-2 text-left",
        selected ? "border-line bg-brand-muted text-ink" : "border-transparent text-ink hover:border-line",
      )}
    >
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{title}</span>
        {description ? <span className="block text-xs text-ink-muted">{description}</span> : null}
      </span>
    </button>
  );
}

export default function CampaignLeadPicker({
  value,
  disabled,
  onChange,
}: {
  value: CampaignSelection[];
  disabled: boolean;
  onChange: (next: CampaignSelection[]) => void;
}) {
  const searchId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState<{
    active: number;
    all: number;
    stages: Record<string, number>;
    sources: Record<string, number>;
  } | null>(null);

  function closeList() {
    setOpen(false);
    setQuery("");
  }

  useEffect(() => {
    let cancelled = false;
    api
      .getLeadCounts()
      .then((row) => {
        if (!cancelled) setCounts(row);
      })
      .catch(() => {
        if (!cancelled) setCounts(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) closeList();
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeList();
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const search = query.trim();
    if (!search) {
      setLeads([]);
      setLoading(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setLoading(true);
      api
        .listLeads({ search, stage: "ALL", limit: "8" })
        .then((res) => setLeads(res.items))
        .catch(() => setLeads([]))
        .finally(() => setLoading(false));
    }, 150);
    return () => window.clearTimeout(timer);
  }, [open, query]);

  const selectedKeys = useMemo(() => new Set(value.map(selectionKey)), [value]);
  const normalized = query.trim().toLowerCase();

  const lists = LISTS.filter((row) => !normalized || row.label.toLowerCase().includes(normalized));
  const stages = STAGES.filter(([, label]) => !normalized || label.toLowerCase().includes(normalized));
  const sources = LEAD_SOURCES.filter((row) => !normalized || row.label.toLowerCase().includes(normalized));
  const people = leads.filter((lead) => !selectedKeys.has(`lead:${lead.id}`));

  function toggle(selection: CampaignSelection) {
    const key = selectionKey(selection);
    if (selectedKeys.has(key)) {
      onChange(value.filter((row) => selectionKey(row) !== key));
      return;
    }
    onChange([...value, selection]);
    setQuery("");
    inputRef.current?.focus();
  }

  function addEmails(raw: string) {
    const tokens = emailTokens(raw);
    if (tokens.length === 0) return false;
    const existing = new Set(value.map(selectionKey));
    const next = [...value];
    for (const email of tokens) {
      const selection: CampaignSelection = { kind: "email", email };
      if (existing.has(selectionKey(selection))) continue;
      existing.add(selectionKey(selection));
      next.push(selection);
    }
    if (next.length !== value.length) onChange(next);
    setQuery("");
    setOpen(false);
    return true;
  }

  function remove(selection: CampaignSelection) {
    const key = selectionKey(selection);
    onChange(value.filter((row) => selectionKey(row) !== key));
  }

  const noMatches = lists.length === 0 && stages.length === 0 && sources.length === 0 && people.length === 0 && !loading;

  return (
    <div ref={rootRef}>
      <div
        role="combobox"
        aria-expanded={open}
        aria-controls={open ? `${searchId}-panel` : undefined}
        aria-haspopup="listbox"
        onClick={() => {
          if (disabled) return;
          setOpen(true);
          inputRef.current?.focus();
        }}
        className={cn(
          "w-full cursor-text rounded-md border border-line bg-surface text-left text-sm text-ink hover:border-ink-muted",
          open && "border-ink",
          disabled && "cursor-default opacity-60",
        )}
      >
        <div className="flex flex-wrap items-center gap-1.5 px-3 py-2.5">
          <Users className="h-4 w-4 shrink-0 text-ink-subtle" aria-hidden />
          {value.map((selection) => {
            const label = selectionLabel(selection);
            const total = selectionTotal(selection, counts);
            const shown = total == null ? label : `${label} (${total})`;
            return (
              <span
                key={selectionKey(selection)}
                className={cn(
                  "inline-flex max-w-full items-center gap-1 rounded-full border py-0.5 pl-2.5 pr-0.5 text-xs font-medium",
                  pillColor(selection),
                )}
              >
                <span className="min-w-0 truncate">{shown}</span>
                {disabled ? null : (
                  <button
                    type="button"
                    aria-label={`Remove ${shown}`}
                    className="inline-flex size-5 items-center justify-center rounded-full hover:bg-white/70"
                    onClick={(event) => {
                      event.stopPropagation();
                      remove(selection);
                    }}
                  >
                    <X className="size-3" />
                  </button>
                )}
              </span>
            );
          })}
          {disabled ? null : (
            <input
              ref={inputRef}
              id={searchId}
              value={query}
              aria-label="Search audiences"
              placeholder={value.length === 0 ? "Choose audiences or type an email" : "Add another"}
              className="min-w-28 flex-1 border-0 bg-transparent p-1 text-sm text-ink outline-none placeholder:text-ink-subtle"
              onChange={(event) => {
                const next = event.target.value;
                if (/[,\s;]/.test(next) && emailTokens(next).length > 0) {
                  addEmails(next);
                  return;
                }
                setQuery(next);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => {
                if (emailTokens(query).length > 0) addEmails(query);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") closeList();
                if ((event.key === "Enter" || event.key === "," || event.key === " ") && emailTokens(query).length > 0) {
                  event.preventDefault();
                  addEmails(query);
                  return;
                }
                if (event.key === "Backspace" && !query && value.length > 0) {
                  event.preventDefault();
                  const last = value[value.length - 1];
                  if (last) remove(last);
                }
              }}
            />
          )}
          <ChevronDown className={cn("ml-auto h-4 w-4 shrink-0 text-ink-muted", open && "rotate-180")} />
        </div>
      </div>

      <div className={cn("grid", open && !disabled ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div id={`${searchId}-panel`} role="listbox" className="overflow-hidden">
          <div className="mt-2 max-h-80 space-y-3 overflow-y-auto rounded-md border border-line bg-surface p-2">
            {lists.length > 0 ? (
              <div>
                <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wide text-ink-subtle">Lists</p>
                <div className="space-y-1">
                  {lists.map((row) => (
                    <OptionButton
                      key={row.list}
                      selected={selectedKeys.has(`list:${row.list}`)}
                      title={row.label}
                      description={row.description}
                      onClick={() => toggle({ kind: "list", list: row.list })}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {stages.length > 0 ? (
              <div>
                <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wide text-ink-subtle">Stages</p>
                <div className="space-y-1">
                  {stages.map(([stage, label]) => (
                    <OptionButton
                      key={stage}
                      selected={selectedKeys.has(`stage:${stage}`)}
                      title={label}
                      onClick={() => toggle({ kind: "stage", stage })}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {sources.length > 0 ? (
              <div>
                <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wide text-ink-subtle">Sources</p>
                <div className="space-y-1">
                  {sources.map((source) => (
                    <OptionButton
                      key={source.value}
                      selected={selectedKeys.has(`source:${source.value}`)}
                      title={source.label}
                      onClick={() => toggle({ kind: "source", source: source.value })}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {normalized ? (
              <div>
                <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wide text-ink-subtle">Leads</p>
                {loading && people.length === 0 ? (
                  <p className="px-2 py-2 text-sm text-ink-muted">Searching…</p>
                ) : people.length === 0 ? (
                  <p className="px-2 py-2 text-sm text-ink-muted">No leads match that search.</p>
                ) : (
                  <div className="space-y-1">
                    {people.map((lead) => (
                      <OptionButton
                        key={lead.id}
                        selected={false}
                        title={leadLabel(lead)}
                        onClick={() => toggle({ kind: "lead", id: lead.id, label: leadLabel(lead) })}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {noMatches && !normalized ? null : noMatches ? (
              <p className="px-2 py-3 text-sm text-ink-muted">No audiences match that search.</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
