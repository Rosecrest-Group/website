"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/crm/lib/api";
import type { ProspectOpportunityRow, ProspectingRunSummary } from "@/crm/types/prospecting";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import CurvedContainer from "@/crm/components/ui/CurvedContainer";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import TextField from "@/crm/components/ui/TextField";
import SelectField from "@/crm/components/ui/SelectField";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import Table, { type Column } from "@/crm/components/ui/Table";
import StatusPill from "@/crm/components/ui/StatusPill";
import { cameInColumn, describeProspectingRun } from "@/crm/components/prospecting/ProspectingListClient";
import { formatProspectLane, PROSPECT_LANE_OPTIONS } from "../review/[id]/salesCardView";

const LANES = [{ id: "", label: "Choose a lane" }, ...PROSPECT_LANE_OPTIONS];
const FOLD_EASE = "duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";
const POLL_MS = 3000;
const STALE_RUN_MS = 2 * 60 * 60 * 1000;
const PAGE_SIZE = 25;

type RunProgress = { step?: string; saved?: number; done?: number; total?: number };

function isActiveRun(run: ProspectingRunSummary): boolean {
  if (run.status !== "queued" && run.status !== "running") return false;
  return Date.now() - new Date(run.startedAt ?? run.createdAt).getTime() < STALE_RUN_MS;
}

function runProgress(report: unknown): RunProgress | null {
  if (!report || typeof report !== "object") return null;
  const progress = (report as { progress?: RunProgress }).progress;
  return progress && typeof progress === "object" ? progress : null;
}

function runError(report: unknown): string | null {
  if (!report || typeof report !== "object") return null;
  const error = (report as { error?: unknown }).error;
  return typeof error === "string" && error ? error : null;
}

function formatElapsed(ms: number): string {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(seconds / 60);
  return minutes ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
}

function progressLine(run: ProspectingRunSummary): string {
  const progress = runProgress(run.report);
  if (run.status === "queued" || !progress?.step) return "Waiting to start";
  const parts = [progress.step];
  if (typeof progress.done === "number" && typeof progress.total === "number" && progress.total > 0) {
    parts.push(`${progress.done} of ${progress.total}`);
  }
  if (typeof progress.saved === "number") {
    parts.push(`${progress.saved} firm${progress.saved === 1 ? "" : "s"} saved`);
  }
  return parts.join(" · ");
}

function SearchProgress({ run, now }: { run: ProspectingRunSummary; now: number }) {
  const started = new Date(run.startedAt ?? run.createdAt).getTime();
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-start gap-3 rounded-xl border border-line bg-brand-muted px-4 py-3"
    >
      <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-brand" aria-hidden />
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-sm font-medium text-ink">{progressLine(run)}</p>
        <p className="text-sm text-ink-muted">
          {formatElapsed(now - started)} so far. Searches can take several minutes. Firms appear below as
          they are found, and you can leave this page: we&apos;ll notify you when it&apos;s done.
        </p>
      </div>
    </div>
  );
}

function opportunityStatusPill(status: unknown) {
  const key = typeof status === "string" ? status : "";
  if (key === "draft") return <StatusPill variant="new" label="Draft" />;
  if (key === "in_review") return <StatusPill variant="in-review" label="In review" />;
  if (key === "routed") return <StatusPill variant="completed" label="Routed" />;
  if (key === "rejected") return <StatusPill variant="failed" label="Rejected" />;
  const label = key
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase())
    .trim();
  return <StatusPill variant="pending" label={label || "—"} />;
}

function reportLine(report: unknown): string | null {
  if (!report || typeof report !== "object") return null;
  const discovery = (report as { discovery?: Record<string, unknown> }).discovery;
  if (!discovery) return null;
  const accounts = typeof discovery.accounts === "number" ? discovery.accounts : null;
  const sra = discovery.sra as { skipped?: string | null } | undefined;
  const warnings = Array.isArray(discovery.warnings)
    ? discovery.warnings.filter((w): w is string => typeof w === "string")
    : [];
  const parts = [accounts != null ? `Done: ${accounts} firm${accounts === 1 ? "" : "s"} found` : null];
  if (sra?.skipped) parts.push(sra.skipped);
  parts.push(...warnings);
  const error = (report as { error?: string }).error;
  if (error) parts.push(error);
  return parts.filter(Boolean).join(" · ") || null;
}

export default function FindFirmsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [lane, setLane] = useState("");
  const [area, setArea] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [runNote, setRunNote] = useState<string | null>(null);
  const [rows, setRows] = useState<ProspectOpportunityRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(true);
  const [activeRun, setActiveRun] = useState<ProspectingRunSummary | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const searchPanelId = useId();
  const activeRunId = activeRun?.id ?? null;

  const load = useCallback(async () => {
    const listed = await api.listProspectingOpportunities({
      search: query || undefined,
      workflow: "sales",
      lane: lane || undefined,
      status: "draft,in_review,routed",
      page,
    });
    setRows(listed.items);
    setTotal(listed.total);
  }, [query, lane, page]);

  useEffect(() => {
    setLoading(true);
    void load()
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load firms"))
      .finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    void api
      .listProspectingRuns({ limit: 10 })
      .then((listed) => {
        const running = listed.items.find((run) => run.kind === "manual" && isActiveRun(run));
        if (running) setActiveRun((current) => current ?? running);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!activeRunId) return;
    let cancelled = false;
    let timer: number | undefined;
    const tick = async () => {
      try {
        const run = await api.getProspectingRun(activeRunId);
        if (cancelled) return;
        await load();
        if (cancelled) return;
        if (isActiveRun(run)) {
          setActiveRun(run);
        } else {
          setActiveRun(null);
          if (run.status === "failed") {
            setError(runError(run.report) ?? "The search failed.");
            setRunNote(null);
          } else if (run.status === "queued" || run.status === "running") {
            setError("The search stopped responding. Run it again.");
            setRunNote(null);
          } else {
            setRunNote(reportLine(run.report) ?? describeProspectingRun(run));
          }
          return;
        }
      } catch {
        if (cancelled) return;
      }
      timer = window.setTimeout(() => void tick(), POLL_MS);
    };
    void tick();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [activeRunId, load]);

  useEffect(() => {
    if (!activeRunId) return;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [activeRunId]);

  async function startRun() {
    if (!query.trim() && !lane) {
      setError("Choose a lane, or type a company name.");
      return;
    }
    setStarting(true);
    setError(null);
    setRunNote(null);
    try {
      const run = await api.startProspectingRun("manual", {
        query: query.trim() || undefined,
        lane: lane || undefined,
        area: area.trim() || undefined,
      });
      setActiveRun(run);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not search");
    } finally {
      setStarting(false);
    }
  }

  const searching = starting || Boolean(activeRun);

  const columns: Column<ProspectOpportunityRow>[] = [
    { key: "legalName", header: "Organisation" },
    { key: "lane", header: "Lane", render: (value) => formatProspectLane(value) },
    { key: "contactEmail", header: "Email", render: (value) => (value ? String(value) : "—") },
    { key: "status", header: "Status", render: (value) => opportunityStatusPill(value) },
    cameInColumn<ProspectOpportunityRow>("createdAt"),
  ];

  return (
    <CrmPageContent>
      <CrmPageHeader
        title="Find Firms"
        subtitle="Search by lane and area, or by a company name. Legal firms are read from the SRA as well as Companies House."
      />
      {error ? <p className="text-sm text-ink-muted">{error}</p> : null}
      <CurvedContainer>
        <button
          type="button"
          aria-expanded={searchOpen}
          aria-controls={searchPanelId}
          onClick={() => setSearchOpen((open) => !open)}
          className={cn(
            "flex w-full cursor-pointer items-center gap-2 px-5 py-4 text-left sm:px-6",
            searchOpen && "border-b border-line",
          )}
        >
          <span className="min-w-0 flex-1 text-base font-medium text-ink">Search</span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-ink-muted transition-transform",
              FOLD_EASE,
              !searchOpen && "-rotate-90",
            )}
            strokeWidth={2}
          />
        </button>
        <div
          id={searchPanelId}
          className={cn(
            "grid transition-[grid-template-rows]",
            FOLD_EASE,
            searchOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              className={cn(
                "p-5 transition-[opacity,transform] sm:p-6",
                FOLD_EASE,
                searchOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0",
              )}
            >
              <div className="grid gap-4 sm:grid-cols-3">
                <SelectField
                  label="Lane"
                  value={lane}
                  onChange={(e) => {
                    setLane(e.target.value);
                    setPage(1);
                  }}
                >
                  {LANES.map((item) => (
                    <option key={item.id || "any"} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </SelectField>
                <TextField
                  label="Area"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. London, Croydon or CR7"
                />
                <TextField
                  label="Name (optional)"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="e.g. Montas Solicitors"
                />
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
                {runNote ? <p className="mr-auto text-sm text-ink-muted">{runNote}</p> : null}
                <PrimaryButton
                  type="button"
                  className="min-w-44"
                  onClick={() => void startRun()}
                  disabled={searching}
                >
                  {searching ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                  {searching ? "Searching…" : "Search"}
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      </CurvedContainer>
      {activeRun ? <SearchProgress run={activeRun} now={now} /> : null}
      {loading && !rows.length ? <LoadingSpinner /> : (
        <Table
          title="Firms"
          columns={columns}
          data={rows}
          totalCount={total}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          loading={loading}
          emptyMessage="No firms yet. Choose a lane and search."
          getRowKey={(row) => row.id}
          onRowClick={(row) => router.push(`/crm/prospecting/review/${row.id}`)}
        />
      )}
    </CrmPageContent>
  );
}