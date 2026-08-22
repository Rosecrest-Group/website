"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/crm/lib/api";
import { prefetchLead } from "@/crm/lib/leadDetailCache";
import { prefetchLeadThreadWithActivities } from "@/crm/lib/loadLeadThread";
import { getListPageCache, setListPageCache } from "@/crm/lib/listPageCache";
import { usePersistedListFilters } from "@/crm/lib/usePersistedListFilters";
import type { Lead, LeadStage, Paginated } from "@/crm/types";
import {
  BEDROOM_BAND_LABELS,
  CRM_BASE_PATH,
  LEAD_SOURCES,
  LEAD_STAGE_LABELS,
  SURVEY_LEVEL_LABELS,
  formatPropertyValueLabel,
} from "@/crm/lib/constants";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SelectField from "@/crm/components/ui/SelectField";
import Table, { type Column } from "@/crm/components/ui/Table";
import StatusPill, { leadStageToPillVariant } from "@/crm/components/ui/StatusPill";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";

const STAGES: LeadStage[] = [
  "NEW",
  "QUOTE_SENT",
  "FOLLOWING_UP",
  "AWAITING_PAYMENT",
  "PAUSED",
  "CONVERTED",
  "LOST",
];

const PAGE_SIZE = 10;

type LeadListFilters = { stage: string; source: string };

const LEAD_LIST_FILTER_DEFAULTS: LeadListFilters = { stage: "", source: "" };
const LEAD_LIST_FILTER_KEYS = ["stage", "source"] as const;
const LEAD_LIST_FILTER_ALLOW = {
  stage: STAGES,
  source: LEAD_SOURCES.map((s) => s.value),
};

function formatTimeAgo(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export type LeadsListInitialData = Paginated<Lead> & {
  stageLabels?: Record<string, string>;
};

export default function LeadsList({
  initialData,
}: {
  initialData?: LeadsListInitialData | null;
}) {
  const router = useRouter();
  const { filters, setFilter, filtersReady } = usePersistedListFilters<LeadListFilters>({
    pageKey: "leads",
    pathname: `${CRM_BASE_PATH}/leads`,
    keys: LEAD_LIST_FILTER_KEYS,
    defaults: LEAD_LIST_FILTER_DEFAULTS,
    allow: LEAD_LIST_FILTER_ALLOW,
  });
  const { stage, source } = filters;
  const initialDataRef = useRef(initialData);
  initialDataRef.current = initialData;
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const prefetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filterSlice = `${stage}|${source}`;
  const prevFilterSliceRef = useRef(filterSlice);

  useEffect(() => {
    if (prevFilterSliceRef.current === filterSlice) return;
    prevFilterSliceRef.current = filterSlice;
    setPage(1);
  }, [filterSlice]);

  useEffect(() => {
    if (!filtersReady) return;

    if (!search && !stage && !source && page === 1) {
      const cached =
        getListPageCache<LeadsListInitialData>("leads:default") ?? initialDataRef.current;
      if (cached) {
        initialDataRef.current = null;
        setLeads(cached.items);
        setTotal(cached.total);
        setLoading(false);
        const ids = cached.items.slice(0, 3).map((l) => l.id);
        if (ids.length === 0) return;
        const warm = window.setTimeout(() => {
          for (const id of ids) {
            void prefetchLead(id);
            void prefetchLeadThreadWithActivities(id);
          }
        }, 400);
        return () => window.clearTimeout(warm);
      }
    }

    setLoading(true);
    const params: Record<string, string> = {
      page: String(page),
      limit: String(PAGE_SIZE),
    };
    if (search) params.search = search;
    if (stage) params.stage = stage;
    if (source) params.source = source;
    const timer = setTimeout(() => {
      api
        .listLeads(params)
        .then((res) => {
          setLeads(res.items);
          setTotal(res.total);
          setError("");
          if (!search && !stage && !source && page === 1) {
            setListPageCache("leads:default", res);
          }
        })
        .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
        .finally(() => setLoading(false));
    }, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [filtersReady, search, stage, source, page]);

  useEffect(() => {
    return () => {
      if (prefetchTimerRef.current) clearTimeout(prefetchTimerRef.current);
    };
  }, []);

  function handleSearchChange(value: string) {
    setLoading(true);
    setSearch(value);
    setPage(1);
  }

  function handleStageChange(value: string) {
    setLoading(true);
    setPage(1);
    setFilter("stage", value);
  }

  function handleSourceChange(value: string) {
    setLoading(true);
    setPage(1);
    setFilter("source", value);
  }

  function warmLead(leadId: string) {
    router.prefetch(`/crm/leads/${leadId}`);
    if (prefetchTimerRef.current) clearTimeout(prefetchTimerRef.current);
    prefetchTimerRef.current = setTimeout(() => {
      void prefetchLead(leadId);
      void prefetchLeadThreadWithActivities(leadId);
      prefetchTimerRef.current = null;
    }, 80);
  }

  const columns: Column<Lead & Record<string, unknown>>[] = [
    {
      key: "customerName",
      header: "Customer",
      render: (_, row) => (
        <div>
          <span className="text-sm font-medium text-ink">
            {row.customerName ??
              (row.customer
                ? `${row.customer.firstName} ${row.customer.lastName}`
                : "—")}
          </span>
          {row.customer?.email ? (
            <p className="mt-0.5 text-xs text-ink-subtle">{row.customer.email}</p>
          ) : null}
        </div>
      ),
    },
    {
      key: "stage",
      header: "Stage",
      render: (value) => (
        <StatusPill
          variant={leadStageToPillVariant(value as string)}
          label={LEAD_STAGE_LABELS[value as string] ?? (value as string)}
        />
      ),
    },
    {
      key: "surveyLevel",
      header: "Survey",
      render: (value) => (
        <span className="text-sm text-ink">
          {value ? SURVEY_LEVEL_LABELS[value as string] ?? (value as string) : "—"}
        </span>
      ),
    },
    {
      key: "bedroomBand",
      header: "Bedrooms",
      render: (value) => (
        <span className="text-sm text-ink-muted">
          {value ? BEDROOM_BAND_LABELS[value as string] ?? (value as string) : "—"}
        </span>
      ),
    },
    {
      key: "propertyValue",
      header: "Value",
      render: (_value, row) => (
        <span className="text-sm text-ink-muted">{formatPropertyValueLabel(row)}</span>
      ),
    },
    {
      key: "source",
      header: "Source",
      render: (value) => (
        <span className="text-sm text-ink-muted">{(value as string) || "—"}</span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (value) => (
        <span className="text-sm text-ink-muted tabular-nums">
          {formatTimeAgo(value as string)}
        </span>
      ),
    },
  ];

  return (
    <CrmPageContent className="space-y-4 py-3 sm:py-4 lg:py-4">
      <CrmPageHeader
        compact
        title="Leads"
        subtitle={`${total} total`}
        actions={<PrimaryButton href="/crm/leads/new">Add new lead</PrimaryButton>}
      />

      {error ? <p className="text-sm text-orange-700">{error}</p> : null}

      {(!filtersReady || loading) && leads.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <Table
          title="All leads"
          search={search}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search name, email, address…"
          toolbarExtra={
            <div className="flex flex-wrap items-center gap-2">
              <SelectField
                variant="filter"
                value={source}
                onChange={(e) => handleSourceChange(e.target.value)}
              >
                <option value="">All sources</option>
                {LEAD_SOURCES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </SelectField>
              <SelectField
                variant="filter"
                value={stage}
                onChange={(e) => handleStageChange(e.target.value)}
              >
                <option value="">Active leads</option>
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {LEAD_STAGE_LABELS[s]}
                  </option>
                ))}
              </SelectField>
            </div>
          }
          columns={columns}
          data={leads as (Lead & Record<string, unknown>)[]}
          getRowKey={(r) => r.id}
          onRowClick={(row) => router.push(`/crm/leads/${row.id}`)}
          onRowMouseEnter={(row) => warmLead(row.id)}
          emptyMessage="No leads found"
          totalCount={total}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={(next) => {
            setLoading(true);
            setPage(next);
          }}
          loading={loading}
        />
      )}
    </CrmPageContent>
  );
}
