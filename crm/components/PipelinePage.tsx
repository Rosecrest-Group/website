"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { api } from "@/crm/lib/api";
import { CRM_BASE_PATH, LEAD_SOURCES } from "@/crm/lib/constants";
import {
  getCachedLeadBoard,
  setCachedLeadBoard,
} from "@/crm/lib/pipelineBoardCache";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import SearchInput from "@/crm/components/admin/SearchInput";
import SelectField from "@/crm/components/ui/SelectField";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import PipelineBoard from "@/crm/components/PipelineBoard";
import { formatPounds } from "@/crm/components/PipelineCard";
import type { PipelineBoardColumn, PipelineBoardResponse, PipelineCard, PipelineSlice } from "@/crm/types";
import { cn } from "@/lib/utils";

const SPRING = { type: "spring", stiffness: 420, damping: 34, mass: 0.7 } as const;

function cardMatchesQuery(card: PipelineCard, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const digits = needle.replace(/\D/g, "");
  const haystack = [
    card.customerName,
    card.customerEmail,
    card.customerPhone,
    card.propertyPostcode,
    card.propertyAddress,
    card.assignedTo?.fullName,
    card.reason,
    card.quotedAmount != null ? String(Math.round(card.quotedAmount)) : "",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (haystack.includes(needle)) return true;
  if (digits.length >= 3) {
    return (card.customerPhone ?? "").replace(/\D/g, "").includes(digits);
  }
  return false;
}

function filterBoardColumns(columns: PipelineBoardColumn[], query: string): PipelineBoardColumn[] {
  if (!query.trim()) return columns;
  return columns.map((column) => {
    const cards = column.cards.filter((card) => cardMatchesQuery(card, query));
    return {
      ...column,
      cards,
      count: cards.length,
      quotedAmount: cards.reduce((sum, card) => sum + (card.quotedAmount ?? 0), 0),
      rottingCount: cards.filter((card) => card.rotting).length,
      hasMore: false,
    };
  });
}

const SLICES: { value: PipelineSlice; label: string }[] = [
  { value: "all", label: "All open" },
  { value: "waiting_on_us", label: "Waiting on us" },
  { value: "clicked_unpaid", label: "Clicked unpaid" },
  { value: "new_untouched", label: "New untouched" },
  { value: "stale", label: "Stale" },
];

export default function PipelinePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const assignedTo = searchParams.get("assignedTo") || "all";
  const source = searchParams.get("source") || "";
  const slice = ((searchParams.get("slice") as PipelineSlice | null) ?? "all") as PipelineSlice;

  const query = useMemo(() => {
    const params: Record<string, string> = {};
    if (assignedTo !== "all") params.assignedTo = assignedTo;
    if (source) params.source = source;
    if (slice !== "all") params.slice = slice;
    return params;
  }, [assignedTo, source, slice]);

  const [board, setBoard] = useState<PipelineBoardResponse | null>(() => getCachedLeadBoard(query));
  const [loading, setLoading] = useState(() => !getCachedLeadBoard(query));
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    const cached = getCachedLeadBoard(query);
    if (cached) {
      setBoard(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }
    try {
      const data = await api.getLeadBoard(query);
      setCachedLeadBoard(query, data);
      setBoard(data);
      setError("");
    } catch (err) {
      if (!cached) setError(err instanceof Error ? err.message : "Could not load pipeline");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void load();
  }, [load]);

  function setParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("view");
    for (const [key, value] of Object.entries(next)) {
      if (!value || value === "all") params.delete(key);
      else params.set(key, value);
    }
    const qs = params.toString();
    router.replace(qs ? `${CRM_BASE_PATH}/pipeline?${qs}` : `${CRM_BASE_PATH}/pipeline`);
  }

  const totals = board?.totals;
  const columns = useMemo(
    () => (board ? filterBoardColumns(board.columns, search) : []),
    [board, search],
  );
  const matchCount = useMemo(
    () => columns.reduce((sum, column) => sum + column.cards.length, 0),
    [columns],
  );

  return (
    <CrmPageContent className="space-y-4 py-3 sm:py-4">
      <CrmPageHeader
        compact
        title="Pipeline"
        subtitle={
          totals ? (
            <span className="font-bold tabular-nums text-brand">
              {totals.count} open · {formatPounds(totals.quotedAmount)}
            </span>
          ) : (
            "Open deals"
          )
        }
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <SelectField variant="filter" value={assignedTo} onChange={(e) => setParams({ assignedTo: e.target.value })}>
              <option value="all">Everyone</option>
              <option value="me">Assigned to me</option>
              <option value="unassigned">Unassigned</option>
            </SelectField>
            <SelectField variant="filter" value={source} onChange={(e) => setParams({ source: e.target.value })}>
              <option value="">All sources</option>
              {LEAD_SOURCES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </SelectField>
            <SearchInput
              className="w-52 sm:w-64"
              placeholder="Search name, phone, postcode…"
              value={search}
              onChange={setSearch}
            />
          </div>
        }
      />

      <LayoutGroup id="pipeline-slices">
        <div className="flex flex-wrap items-center gap-1.5">
          {SLICES.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setParams({ slice: item.value })}
              className={cn(
                "relative rounded-full border px-3 py-1 text-xs",
                slice === item.value
                  ? "border-brand text-brand"
                  : "border-line bg-surface text-ink-muted hover:text-ink",
              )}
            >
              {slice === item.value ? (
                <motion.span
                  layoutId="pipeline-slice-pill"
                  className="absolute inset-0 rounded-full bg-brand-muted"
                  transition={reduceMotion ? { duration: 0 } : SPRING}
                />
              ) : null}
              <span className="relative z-10">{item.label}</span>
            </button>
          ))}
          {search.trim() ? (
            <span className="ml-auto text-xs tabular-nums text-ink-muted">
              {matchCount} matching
            </span>
          ) : null}
        </div>
      </LayoutGroup>

      {error ? <p className="text-sm text-orange-700">{error}</p> : null}
      {loading && !board ? <LoadingSpinner /> : null}
      {board ? (
        <motion.div
          key={`${assignedTo}-${source}-${slice}`}
          initial={false}
          animate={{ opacity: loading ? 0.55 : 1 }}
          transition={SPRING}
        >
          <PipelineBoard columns={columns} onMoved={() => void load()} />
        </motion.div>
      ) : null}
    </CrmPageContent>
  );
}
