"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { api } from "@/crm/lib/api";
import {
  contactDisplayName,
  DataDumpStatusBanner,
  DetailField,
  scopeHint,
  useDataDumpConfigured,
} from "@/crm/components/data-dump/shared";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import SearchInput from "@/crm/components/admin/SearchInput";
import CurvedContainer from "@/crm/components/ui/CurvedContainer";
import CrmSlidePanel from "@/crm/components/ui/CrmSlidePanel";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import Pagination from "@/crm/components/ui/Pagination";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SelectField from "@/crm/components/ui/SelectField";
import Table, { type Column } from "@/crm/components/ui/Table";
import type {
  DumpOpportunitySyncResult,
  DumpOpportunitySyncStatus,
  SalesIgniterOpportunity,
  SalesIgniterPipelineStage,
} from "@/crm/types";

const PAGE_SIZE = 50;

type OpportunityRow = SalesIgniterOpportunity & Record<string, unknown>;

function formatMoney(value?: number) {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);
}

function formatSyncTime(value?: string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleString("en-GB");
}

function matchesSearch(opp: SalesIgniterOpportunity, query: string): boolean {
  const haystack = [
    opp.name,
    opp.contactId,
    opp.source,
    opp.status,
    opp.pipelineStageName,
    opp.pipelineStageId,
    opp.contact ? contactDisplayName(opp.contact) : "",
    opp.contact?.email,
    opp.contact?.phone,
    ...(opp.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export default function DataDumpOpportunitiesView() {
  const configured = useDataDumpConfigured();
  const autoSyncStarted = useRef(false);

  const [allOpportunities, setAllOpportunities] = useState<SalesIgniterOpportunity[]>([]);
  const [pipelineStages, setPipelineStages] = useState<SalesIgniterPipelineStage[]>([]);
  const [totalFetched, setTotalFetched] = useState(0);
  const [syncStatus, setSyncStatus] = useState<DumpOpportunitySyncStatus | null>(null);
  const [lastSyncResult, setLastSyncResult] = useState<DumpOpportunitySyncResult | null>(null);
  const [syncProgress, setSyncProgress] = useState<{ checked: number; total: number } | null>(null);

  const [search, setSearch] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [page, setPage] = useState(1);

  const [listLoading, setListLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SalesIgniterOpportunity | null>(null);

  const loadLocalOpportunities = useCallback(async () => {
    const [pipelineResult, localResult] = await Promise.all([
      api.listSalesIgniterPipelines(),
      api.listDumpOpportunities(),
    ]);

    setPipelineStages(pipelineResult.pipelines.flatMap((pipeline) => pipeline.stages ?? []));
    setAllOpportunities(localResult.opportunities);
    setTotalFetched(localResult.total);
    setSyncStatus(localResult.sync);
  }, []);

  const runSync = useCallback(
    async (options?: { reloadOnly?: boolean }) => {
      if (!configured) return;

      setSyncError(null);

      if (!options?.reloadOnly) {
        setSyncLoading(true);
        setSyncProgress(null);

        try {
          let startAfterId: string | undefined;
          let startAfter: number | undefined;
          let isFirstChunk = true;
          let totalInserted = 0;
          let totalUpdated = 0;
          let totalSkipped = 0;
          let totalChecked = 0;
          let pagesFetched = 0;
          let remoteTotal = 0;
          let lastSyncedAt = new Date().toISOString();
          let dbTotal = 0;

          while (true) {
            const chunk = await api.syncDumpOpportunities({
              startAfterId,
              startAfter,
              reset: isFirstChunk,
            });

            isFirstChunk = false;
            pagesFetched += 1;
            totalInserted += chunk.inserted;
            totalUpdated += chunk.updated;
            totalSkipped += chunk.skipped;
            totalChecked += chunk.checked;
            remoteTotal = chunk.remoteTotal;
            dbTotal = chunk.dbTotal;
            if (chunk.lastSyncedAt) lastSyncedAt = chunk.lastSyncedAt;

            setSyncProgress({ checked: totalChecked, total: remoteTotal });

            if (chunk.done) {
              setLastSyncResult({
                remoteTotal,
                dbTotal,
                inserted: totalInserted,
                updated: totalUpdated,
                skipped: totalSkipped,
                pagesFetched,
                lastSyncedAt,
              });
              break;
            }

            const nextId = chunk.startAfterId ?? undefined;
            const nextAfter = chunk.startAfter ?? undefined;
            if (!nextId) break;

            startAfterId = nextId;
            startAfter = nextAfter;
          }
        } catch (e) {
          setSyncError(e instanceof Error ? e.message : "Failed to sync opportunities");
          throw e;
        } finally {
          setSyncLoading(false);
          setSyncProgress(null);
        }
      }

      await loadLocalOpportunities();
    },
    [configured, loadLocalOpportunities]
  );

  const initializePage = useCallback(async () => {
    if (!configured) return;

    setListLoading(true);
    setListError(null);

    try {
      await loadLocalOpportunities();
    } catch (e) {
      setAllOpportunities([]);
      setPipelineStages([]);
      setTotalFetched(0);
      setListError(e instanceof Error ? e.message : "Failed to load opportunities");
    } finally {
      setListLoading(false);
    }

    void runSync().catch(() => {
      // syncError is set inside runSync
    });
  }, [configured, loadLocalOpportunities, runSync]);

  useEffect(() => {
    if (!configured) {
      setListLoading(false);
      return;
    }

    if (autoSyncStarted.current) return;
    autoSyncStarted.current = true;
    void initializePage();
  }, [configured, initializePage]);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    for (const opp of allOpportunities) {
      for (const tag of opp.tags ?? []) {
        if (tag.trim()) tags.add(tag);
      }
    }
    return [...tags].sort((a, b) => a.localeCompare(b));
  }, [allOpportunities]);

  const filteredOpportunities = useMemo(() => {
    const query = activeQuery.trim().toLowerCase();

    return allOpportunities.filter((opp) => {
      if (tagFilter && !(opp.tags ?? []).includes(tagFilter)) return false;
      if (stageFilter && opp.pipelineStageId !== stageFilter) return false;
      if (query && !matchesSearch(opp, query)) return false;
      return true;
    });
  }, [allOpportunities, activeQuery, tagFilter, stageFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOpportunities.length / PAGE_SIZE));

  const pageOpportunities = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredOpportunities.slice(start, start + PAGE_SIZE);
  }, [filteredOpportunities, page]);

  useEffect(() => {
    setPage(1);
  }, [activeQuery, tagFilter, stageFilter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handleSearch = useCallback((value: string) => {
    setActiveQuery(value.trim());
  }, []);

  const handleManualSync = useCallback(async () => {
    try {
      await runSync();
    } catch {
      // syncError is set inside runSync
    }
  }, [runSync]);

  const opportunityColumns: Column<OpportunityRow>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Opportunity",
        render: (v) => <span className="font-medium text-(--color-primary)">{String(v || "—")}</span>,
      },
      {
        key: "contact",
        header: "Contact",
        render: (_, row) => {
          const contact = row.contact;
          return contact ? contactDisplayName(contact) : row.contactId ?? "—";
        },
      },
      {
        key: "status",
        header: "Status",
        render: (v) => (v ? String(v) : "—"),
      },
      {
        key: "monetaryValue",
        header: "Value",
        width: "120px",
        render: (v) => formatMoney(typeof v === "number" ? v : Number(v)),
      },
      {
        key: "pipelineStageName",
        header: "Stage",
        render: (v, row) => {
          const name = v ? String(v) : null;
          const id = row.pipelineStageId;
          if (name) return name;
          return id ? String(id) : "—";
        },
      },
      {
        key: "tags",
        header: "Tags",
        render: (v) => {
          const tags = Array.isArray(v) ? v : [];
          return tags.length > 0 ? (
            <span className="line-clamp-1 text-xs text-(--color-tc-30)">{tags.join(", ")}</span>
          ) : (
            "—"
          );
        },
      },
      {
        key: "dateAdded",
        header: "Added",
        width: "160px",
        render: (v) => (v ? new Date(String(v)).toLocaleDateString("en-GB") : "—"),
      },
    ],
    []
  );

  const activeFilterCount = [tagFilter, stageFilter, activeQuery].filter(Boolean).length;

  return (
    <CrmPageContent>
      <CrmPageHeader
        title="Opportunities"
        subtitle="Syncs from Sales Igniter into the local dump table, then filters locally."
        actions={
          configured ? (
            <PrimaryButton
              type="button"
              className="w-auto gap-2"
              disabled={syncLoading || listLoading}
              onClick={() => void handleManualSync()}
            >
              <RefreshCw className={`size-4 ${syncLoading ? "animate-spin" : ""}`} aria-hidden />
              {syncLoading ? "Syncing…" : "Sync now"}
            </PrimaryButton>
          ) : null
        }
      />

      <DataDumpStatusBanner />

      {configured ? (
        <CurvedContainer>
          <div className="space-y-3 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-3">
              <SearchInput
                className="min-w-[200px] flex-1"
                placeholder="Search opportunities…"
                value={search}
                onChange={setSearch}
                onSearch={handleSearch}
                debounceMs={400}
              />

              <div className="w-full min-w-[140px] sm:w-[160px]">
                <SelectField
                  aria-label="Filter by tag"
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                >
                  <option value="">All tags</option>
                  {availableTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </SelectField>
              </div>

              <div className="w-full min-w-[160px] sm:w-[200px]">
                <SelectField
                  aria-label="Filter by follow-up stage"
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                >
                  <option value="">All stages</option>
                  {pipelineStages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </SelectField>
              </div>

              {activeFilterCount > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setTagFilter("");
                    setStageFilter("");
                    setSearch("");
                    setActiveQuery("");
                  }}
                  className="h-12 shrink-0 rounded-xl border border-(--color-tc-20) px-4 text-sm text-(--color-tc-40) hover:bg-slate-50"
                >
                  Clear filters
                </button>
              ) : null}
            </div>

            {syncStatus || lastSyncResult || syncLoading ? (
              <p className="text-xs text-(--color-tc-30)">
                {syncStatus ? (
                  <>
                    <span className="font-medium text-(--color-tc-40)">
                      {totalFetched.toLocaleString()} in database
                    </span>
                    {syncStatus.lastSyncedAt
                      ? ` · Last synced ${formatSyncTime(syncStatus.lastSyncedAt)}`
                      : ""}
                  </>
                ) : null}
                {lastSyncResult ? (
                  <>
                    {syncStatus ? " · " : ""}
                    Latest sync: {lastSyncResult.inserted.toLocaleString()} new,{" "}
                    {lastSyncResult.updated.toLocaleString()} updated,{" "}
                    {lastSyncResult.skipped.toLocaleString()} already stored
                    {lastSyncResult.remoteTotal
                      ? ` · ${lastSyncResult.remoteTotal.toLocaleString()} checked in Sales Igniter`
                      : ""}
                  </>
                ) : null}
                {syncLoading && syncProgress
                  ? ` · Syncing… ${syncProgress.checked.toLocaleString()} of ${syncProgress.total.toLocaleString()} checked`
                  : syncLoading
                    ? " · Checking for new opportunities…"
                    : ""}
              </p>
            ) : null}
          </div>
        </CurvedContainer>
      ) : null}

      {syncError ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {syncError}
          {scopeHint(syncError)}
        </div>
      ) : null}

      {listError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {listError}
          {scopeHint(listError)}
        </div>
      ) : null}

      {configured ? (
        <>
          <p className="text-sm text-(--color-tc-30)">
            {listLoading
              ? "Loading opportunities from database…"
              : `${filteredOpportunities.length.toLocaleString()} of ${totalFetched.toLocaleString()} opportunit${totalFetched === 1 ? "y" : "ies"} shown`}
            {activeFilterCount > 0 ? ` · ${activeFilterCount} filter${activeFilterCount === 1 ? "" : "s"} active` : ""}
          </p>

          {listLoading ? (
            <LoadingSpinner />
          ) : pageOpportunities.length === 0 ? (
            <CurvedContainer>
              <p className="p-6 text-center text-sm text-(--color-tc-30)">No opportunities found.</p>
            </CurvedContainer>
          ) : (
            <>
              <Table
                columns={opportunityColumns}
                data={pageOpportunities as OpportunityRow[]}
                getRowKey={(row) => row.id}
                onRowClick={(row) => setSelected(row)}
                rowClassName={() => "cursor-pointer hover:bg-slate-50"}
                compact
              />
              {totalPages > 1 ? (
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              ) : null}
            </>
          )}
        </>
      ) : null}

      <CrmSlidePanel
        isOpen={selected != null}
        onClose={() => setSelected(null)}
        title={selected?.name ?? "Opportunity"}
        description={selected?.id}
        widthClassName="max-w-xl"
      >
        {selected ? (
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailField label="Status" value={selected.status} />
            <DetailField label="Value" value={formatMoney(selected.monetaryValue)} />
            <DetailField label="Pipeline" value={selected.pipelineId} />
            <DetailField
              label="Stage"
              value={selected.pipelineStageName ?? selected.pipelineStageId}
            />
            <DetailField label="Stage ID" value={selected.pipelineStageId} />
            <DetailField
              label="Win probability"
              value={
                selected.effectiveProbability != null
                  ? `${selected.effectiveProbability}%`
                  : undefined
              }
            />
            <DetailField label="Source" value={selected.source} />
            <DetailField label="Assigned to" value={selected.assignedTo} />
            <DetailField label="Tags" value={selected.tags?.join(", ")} />
            <DetailField
              label="Contact"
              value={
                selected.contact
                  ? contactDisplayName(selected.contact)
                  : selected.contactId ?? undefined
              }
            />
            <DetailField label="Contact email" value={selected.contact?.email ?? undefined} />
            <DetailField label="Contact phone" value={selected.contact?.phone ?? undefined} />
            <DetailField
              label="Added"
              value={
                selected.dateAdded
                  ? new Date(selected.dateAdded).toLocaleString("en-GB")
                  : undefined
              }
            />
            <DetailField
              label="Updated"
              value={
                selected.dateUpdated
                  ? new Date(selected.dateUpdated).toLocaleString("en-GB")
                  : undefined
              }
            />
          </dl>
        ) : null}
      </CrmSlidePanel>
    </CrmPageContent>
  );
}
