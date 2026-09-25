"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { flushSync } from "react-dom";
import { ChevronDown, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/crm/lib/api";
import { canAccessProspectingAdmin } from "@/crm/lib/rbac";
import type { ProspectingRunSummary, ProspectOpportunityRow, TenderFilter } from "@/crm/types/prospecting";
import type { ApiUser } from "@/crm/types";
import ProspectingListClient, { cameInColumn } from "@/crm/components/prospecting/ProspectingListClient";
import CurvedContainer from "@/crm/components/ui/CurvedContainer";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import SelectField from "@/crm/components/ui/SelectField";
import TextField from "@/crm/components/ui/TextField";
import Toggle from "@/crm/components/ui/Toggle";
import type { Column } from "@/crm/components/ui/Table";

const CHECK_POLL_MS = 3000;

function isRunActive(run: ProspectingRunSummary): boolean {
  return run.status === "queued" || run.status === "running";
}

function reportRecord(report: unknown): Record<string, unknown> {
  return report && typeof report === "object" ? (report as Record<string, unknown>) : {};
}

function checkProgressLine(run: ProspectingRunSummary): string {
  const progress = reportRecord(reportRecord(run.report).progress);
  const step = typeof progress.step === "string" ? progress.step : null;
  if (run.status === "queued" || !step) return "Tender check waiting to start…";
  const count =
    typeof progress.done === "number" && typeof progress.total === "number" && progress.total > 0
      ? ` · ${progress.done} of ${progress.total}`
      : "";
  return `${step}${count}…`;
}

function checkResultLine(run: ProspectingRunSummary): string {
  const report = reportRecord(run.report);
  if (run.status === "failed") {
    return typeof report.error === "string" && report.error ? `Tender check failed: ${report.error}` : "Tender check failed.";
  }
  const ingested = (key: string) => {
    const value = reportRecord(report[key]).ingested;
    return typeof value === "number" ? value : 0;
  };
  const read = ingested("procurements") + ingested("contractsFinder");
  return read
    ? `Tender check finished: ${read} matching tender${read === 1 ? "" : "s"} read. Open ones with a deadline ahead are listed below.`
    : "Tender check finished: nothing new matched the feed.";
}

const STATUS_OPTIONS = [
  { id: "draft,in_review", label: "Awaiting review" },
  { id: "rejected", label: "Rejected" },
  { id: "", label: "All" },
];

function money(value: unknown): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return `£${value.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`;
}

function closes(value: unknown): string {
  if (value == null || value === "") return "—";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const columns: Column<ProspectOpportunityRow>[] = [
  { key: "legalName", header: "Buyer" },
  {
    key: "tenderTitle",
    header: "Tender",
    render: (value, row) => (
      <div className="max-w-md">
        <p>{value ? String(value) : "—"}</p>
        {row.tenderDescription ? (
          <p className="mt-1 line-clamp-4 whitespace-pre-line text-xs text-ink-muted">{row.tenderDescription}</p>
        ) : null}
      </div>
    ),
  },
  { key: "totalValueExVat", header: "Value", render: (value) => money(value) },
  { key: "endsOn", header: "Closes", render: (value) => closes(value) },
  cameInColumn<ProspectOpportunityRow>("createdAt"),
];

export default function PublicContractsPage() {
  const [status, setStatus] = useState("draft,in_review");
  const [refreshKey, setRefreshKey] = useState(0);
  const load = useCallback(
    async (search: string, page: number) => {
      void refreshKey;
      return api.listProspectingOpportunities({
        search: search || undefined,
        page,
        workflow: "bid",
        status: status || undefined,
      });
    },
    [status, refreshKey],
  );
  const refresh = useCallback(() => setRefreshKey((key) => key + 1), []);

  return (
    <ProspectingListClient
      title="Public Contracts"
      subtitle="Tenders from Find a Tender and Contracts Finder."
      columns={columns}
      load={load}
      onRowHref={(row) => `/crm/prospecting/review/${row.id}`}
      emptyMessage="No contracts in this list."
      toolbar={<FeedFilter onCheckFinished={refresh} />}
      toolbarExtra={
        <SelectField
          variant="filter"
          aria-label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {STATUS_OPTIONS.map((item) => (
            <option key={item.label} value={item.id}>
              {item.label}
            </option>
          ))}
        </SelectField>
      }
    />
  );
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

function pillColor(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) | 0;
  return PILL_COLORS[Math.abs(hash) % PILL_COLORS.length];
}

function keywordsFromText(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function mergeKeywords(current: string[], raw: string): string[] {
  const next = [...current];
  for (const word of keywordsFromText(raw)) {
    if (next.some((item) => item.toLowerCase() === word.toLowerCase())) continue;
    next.push(word);
  }
  return next;
}

function KeywordField({
  label,
  keywords,
  onChange,
  placeholder,
  disabled = false,
}: {
  label: string;
  keywords: string[];
  onChange: (keywords: string[]) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState("");

  function commit(raw = draft) {
    const next = mergeKeywords(keywords, raw);
    if (next.length !== keywords.length) {
      flushSync(() => onChange(next));
    }
    setDraft("");
  }

  function removeAt(index: number) {
    onChange(keywords.filter((_, i) => i !== index));
    inputRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      if (!draft.trim()) return;
      event.preventDefault();
      commit();
      return;
    }
    if (event.key === "Backspace" && !draft && keywords.length > 0) {
      event.preventDefault();
      removeAt(keywords.length - 1);
    }
  }

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <label htmlFor={inputId} className="shrink-0 text-sm font-medium text-ink">
        {label}
      </label>
      <div
        className={cn(
          "flex min-h-10 min-w-0 flex-1 flex-wrap items-center gap-1.5 rounded-lg border border-line bg-surface px-2 py-1.5 transition-colors focus-within:border-brand-light focus-within:ring-2 focus-within:ring-brand-muted",
          disabled && "opacity-60",
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {keywords.map((keyword, index) => (
          <span
            key={`${keyword}-${index}`}
            className={cn(
              "inline-flex max-w-full items-center gap-1 rounded-full border py-0.5 pl-2.5 pr-0.5 text-xs font-medium",
              pillColor(keyword),
            )}
          >
            <span className="min-w-0 truncate">{keyword}</span>
            <button
              type="button"
              disabled={disabled}
              aria-label={`Remove ${keyword}`}
              className="inline-flex size-5 items-center justify-center rounded-full hover:bg-white/70"
              onClick={(event) => {
                event.stopPropagation();
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
          value={draft}
          disabled={disabled}
          placeholder={keywords.length === 0 ? placeholder : "Add another…"}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (draft.trim()) commit();
          }}
          className="min-w-28 flex-1 border-0 bg-transparent py-0.5 text-sm text-ink outline-none placeholder:text-ink-faint"
        />
      </div>
    </div>
  );
}

function FeedFilter({ onCheckFinished }: { onCheckFinished: () => void }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [checkRun, setCheckRun] = useState<ProspectingRunSummary | null>(null);
  const [startingCheck, setStartingCheck] = useState(false);
  const checkRunId = checkRun?.id ?? null;
  const [filter, setFilter] = useState<TenderFilter | null>(null);
  const [includeKeywords, setIncludeKeywords] = useState<string[]>([]);
  const [excludeKeywords, setExcludeKeywords] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    api.getMe().then(setUser).catch(() => setUser(null));
  }, []);

  const isAdmin = user ? canAccessProspectingAdmin(user.role) : false;

  useEffect(() => {
    if (!isAdmin) return;
    void api.getTenderFilter().then((saved) => {
      setFilter(saved);
      setIncludeKeywords(saved.includeKeywords);
      setExcludeKeywords(saved.excludeKeywords);
    }).catch(() => setNote("Could not load the feed filter."));
    void api
      .listProspectingRuns({ limit: 10 })
      .then((listed) => {
        const running = listed.items.find((run) => run.kind === "daily_procurement" && isRunActive(run));
        if (running) setCheckRun((current) => current ?? running);
      })
      .catch(() => undefined);
  }, [isAdmin]);

  useEffect(() => {
    if (!checkRunId) return;
    let cancelled = false;
    let timer: number | undefined;
    const tick = async () => {
      try {
        const run = await api.getProspectingRun(checkRunId);
        if (cancelled) return;
        if (!isRunActive(run)) {
          setCheckRun(null);
          setNote(checkResultLine(run));
          onCheckFinished();
          return;
        }
        setCheckRun(run);
      } catch {
        if (cancelled) return;
      }
      timer = window.setTimeout(() => void tick(), CHECK_POLL_MS);
    };
    timer = window.setTimeout(() => void tick(), CHECK_POLL_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [checkRunId, onCheckFinished]);

  async function checkNow() {
    setStartingCheck(true);
    setNote(null);
    try {
      setCheckRun(await api.startProspectingRun("daily_procurement"));
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Could not start the tender check.");
    } finally {
      setStartingCheck(false);
    }
  }

  if (!isAdmin) return null;
  if (!filter) {
    return note ? <p className="text-sm text-ink-muted">{note}</p> : null;
  }

  function close() {
    if (!filter) return;
    setIncludeKeywords(filter.includeKeywords);
    setExcludeKeywords(filter.excludeKeywords);
    setEditing(false);
  }

  async function save() {
    if (!filter) return;
    setBusy(true);
    setNote(null);
    try {
      const saved = await api.saveTenderFilter({
        ...filter,
        includeKeywords,
        excludeKeywords,
      });
      setFilter(saved);
      setIncludeKeywords(saved.includeKeywords);
      setExcludeKeywords(saved.excludeKeywords);
      setEditing(false);
      setNote(
        saved.filteredOut
          ? `Saved. ${saved.filteredOut} waiting contract${saved.filteredOut === 1 ? "" : "s"} moved out of the list.`
          : "Saved. Tomorrow's run uses this filter.",
      );
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Could not save the filter.");
    } finally {
      setBusy(false);
    }
  }

  const shown = filter.includeKeywords.slice(0, 4);
  const hidden = filter.includeKeywords.length - shown.length;

  return (
    <CurvedContainer className="px-4 py-3 sm:px-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="text-sm font-medium text-ink">Feed</p>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {shown.length ? (
            shown.map((keyword) => (
              <span
                  key={keyword}
                  className={cn(
                    "inline-flex max-w-full items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                    pillColor(keyword),
                  )}
                >
                  {keyword}
                </span>
            ))
          ) : (
            <span className="text-sm text-ink-muted">Any wording</span>
          )}
          {hidden > 0 ? <span className="text-xs text-ink-muted">+{hidden}</span> : null}
          {filter.excludeKeywords.length ? (
            <span className="text-xs text-ink-muted">
              Drop {filter.excludeKeywords.length}
            </span>
          ) : null}
          <span className="text-xs text-ink-muted">
            Min £{filter.minValueGbp.toLocaleString("en-GB")}
            {filter.englandOnly ? " · England" : ""}
          </span>
        </div>
        <SecondaryButton
          type="button"
          size="small"
          disabled={startingCheck || Boolean(checkRun)}
          icon={startingCheck || checkRun ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : undefined}
          onClick={() => void checkNow()}
        >
          {startingCheck || checkRun ? "Checking…" : "Check tenders now"}
        </SecondaryButton>
        <SecondaryButton
          type="button"
          size="small"
          aria-expanded={editing}
          onClick={() => (editing ? close() : setEditing(true))}
        >
          {editing ? "Close" : "Edit"}
          <ChevronDown
            className={`size-3.5 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${editing ? "rotate-180" : ""}`}
            strokeWidth={2}
            aria-hidden
          />
        </SecondaryButton>
      </div>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${editing ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="min-h-0 overflow-hidden" inert={editing ? undefined : true}>
          <div
            className={`mt-3 border-t border-line pt-3 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${editing ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"}`}
          >
            <div className="flex flex-col gap-3">
              <KeywordField
                label="Keep"
                keywords={includeKeywords}
                onChange={setIncludeKeywords}
                placeholder="carpentry, tiling"
                disabled={busy}
              />
              <KeywordField
                label="Drop"
                keywords={excludeKeywords}
                onChange={setExcludeKeywords}
                placeholder="Add a word to drop"
                disabled={busy}
              />
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  <TextField
                    inline
                    label="Min £"
                    type="number"
                    min={0}
                    value={String(filter.minValueGbp)}
                    onChange={(e) => setFilter({ ...filter, minValueGbp: Number(e.target.value) || 0 })}
                    className="w-28"
                  />
                  <label className="flex h-9 items-center gap-2 text-sm text-ink">
                    <Toggle
                      aria-label="England only"
                      checked={filter.englandOnly}
                      onCheckedChange={(checked) => setFilter({ ...filter, englandOnly: checked })}
                    />
                    England only
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <SecondaryButton type="button" size="small" className="h-9" disabled={busy} onClick={close}>
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton type="button" className="h-9 px-4 py-0" disabled={busy} onClick={() => void save()}>
                    {busy ? "Saving…" : "Save"}
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {checkRun ? (
        <p role="status" aria-live="polite" className="mt-2 text-sm text-ink-muted">
          {checkProgressLine(checkRun)} This takes a few minutes; you can leave the page.
        </p>
      ) : note ? (
        <p className="mt-2 text-sm text-ink-muted">{note}</p>
      ) : null}
    </CurvedContainer>
  );
}
