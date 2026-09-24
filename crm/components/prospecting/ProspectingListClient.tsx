"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import Table, { type Column } from "@/crm/components/ui/Table";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import StatusPill from "@/crm/components/ui/StatusPill";
import type { ProspectingRunKind, ProspectingRunStatus, ProspectingRunSummary } from "@/crm/types/prospecting";

function standingVariant(grade: string): "completed" | "failed" | "in-review" | "pending" {
  if (grade === "green" || grade === "green_amber") return "completed";
  if (grade === "red" || grade === "amber_red") return "failed";
  if (grade === "amber") return "in-review";
  return "pending";
}

export default function ProspectingListClient<T extends Record<string, unknown> & { id?: string }>({
  title,
  subtitle,
  columns,
  load,
  onRowHref,
  emptyMessage,
}: {
  title: string;
  subtitle: string;
  columns: Column<T>[];
  load: (search: string, page: number) => Promise<{ items: T[]; total: number }>;
  onRowHref?: (row: T) => string | null;
  emptyMessage?: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void load(search, page)
      .then((data) => {
        if (cancelled) return;
        setRows(data.items);
        setTotal(data.total);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Could not load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [search, page, load]);

  return (
    <CrmPageContent>
      <CrmPageHeader title={title} subtitle={subtitle} />
      {error ? <p className="text-sm text-ink-muted">{error}</p> : null}
      {loading && !rows.length ? <LoadingSpinner /> : (
        <Table
          columns={columns}
          data={rows}
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          page={page}
          pageSize={25}
          totalCount={total}
          onPageChange={setPage}
          emptyMessage={emptyMessage ?? "Nothing in this list yet. Queue a Find Firms run to populate it."}
          loading={loading}
          getRowKey={(row, index) => String(row.id ?? index)}
          onRowClick={
            onRowHref
              ? (row) => {
                  const href = onRowHref(row);
                  if (href) router.push(href);
                }
              : undefined
          }
        />
      )}
    </CrmPageContent>
  );
}

export function formatCameIn(value: unknown): string {
  if (value == null || value === "") return "—";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function cameInColumn<T extends Record<string, unknown>>(key: keyof T & string): Column<T> {
  return {
    key,
    header: "Came in",
    render: (value) => formatCameIn(value),
  };
}

const RUN_KIND_LABEL: Record<ProspectingRunKind, string> = {
  weekly: "weekly search for firms",
  daily_procurement: "daily look at live contracts",
  refetch: "refresh of existing firms",
  manual: "search you queued",
};

const RUN_STATUS_LABEL: Record<ProspectingRunStatus, string> = {
  queued: "waiting to start",
  running: "in progress",
  paused: "paused",
  completed: "finished",
  failed: "failed",
};

export function describeProspectingRun(run: Pick<ProspectingRunSummary, "kind" | "status" | "finishedAt" | "startedAt" | "createdAt">): string {
  const kind = RUN_KIND_LABEL[run.kind] ?? run.kind.replaceAll("_", " ");
  const status = RUN_STATUS_LABEL[run.status] ?? run.status;
  const when = formatCameIn(run.finishedAt ?? run.startedAt ?? run.createdAt);
  return when === "—" ? `Last activity: ${kind} · ${status}` : `Last activity: ${kind} · ${status} ${when}`;
}

export { standingVariant };
