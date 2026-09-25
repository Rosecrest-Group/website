"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
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

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
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
  const parts = [accounts != null ? `${accounts} firm${accounts === 1 ? "" : "s"} found` : null];
  if (sra?.skipped) parts.push(sra.skipped);
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
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(true);
  const searchPanelId = useId();

  const load = useCallback(async () => {
    const listed = await api.listProspectingOpportunities({
      search: query || undefined,
      workflow: "sales",
      lane: lane || undefined,
      status: "draft,in_review,routed",
    });
    setRows(listed.items);
    setTotal(listed.total);
  }, [query, lane]);

  useEffect(() => {
    setLoading(true);
    void load()
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load firms"))
      .finally(() => setLoading(false));
  }, [load]);

  async function startRun() {
    if (!query.trim() && !lane) {
      setError("Choose a lane, or type a company name.");
      return;
    }
    setStarting(true);
    setError(null);
    setRunNote("Searching…");
    try {
      const run = await api.startProspectingRun("manual", {
        query: query.trim() || undefined,
        lane: lane || undefined,
        area: area.trim() || undefined,
      });
      const finished = await waitForRun(run.id);
      setRunNote(reportLine(finished.report) ?? describeProspectingRun(finished));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not search");
      setRunNote(null);
    } finally {
      setStarting(false);
    }
  }

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
                <SelectField label="Lane" value={lane} onChange={(e) => setLane(e.target.value)}>
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
                  placeholder="e.g. London"
                />
                <TextField
                  label="Name (optional)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Montas Solicitors"
                />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <PrimaryButton type="button" onClick={() => void startRun()} disabled={starting}>
                  {starting ? "Searching…" : "Search"}
                </PrimaryButton>
                {runNote ? <p className="text-sm text-ink-muted">{runNote}</p> : null}
              </div>
            </div>
          </div>
        </div>
      </CurvedContainer>
      {loading && !rows.length ? <LoadingSpinner /> : (
        <Table
          title="Firms"
          columns={columns}
          data={rows}
          totalCount={total}
          emptyMessage="No firms yet. Choose a lane and search."
          getRowKey={(row) => row.id}
          onRowClick={(row) => router.push(`/crm/prospecting/review/${row.id}`)}
        />
      )}
    </CrmPageContent>
  );
}

async function waitForRun(id: string): Promise<ProspectingRunSummary> {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const listed = await api.listProspectingRuns({ limit: 10 });
    const run = listed.items.find((item) => item.id === id);
    if (run && (run.status === "completed" || run.status === "failed")) return run;
    await sleep(3000);
  }
  throw new Error("The search is still running. Refresh this page in a minute.");
}
