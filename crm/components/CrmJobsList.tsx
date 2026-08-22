"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/crm/lib/api";
import { getCachedCurrentUser } from "@/crm/lib/currentUserCache";
import { getListPageCache, setListPageCache } from "@/crm/lib/listPageCache";
import { canViewJobMoney } from "@/crm/lib/rbac";
import type { Job, UserRole } from "@/crm/types";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import Table, { type Column } from "@/crm/components/ui/Table";
import StatusPill, { jobStageToPillVariant } from "@/crm/components/ui/StatusPill";
import { formatJobStageLabel } from "@/crm/lib/jobStages";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";

export default function CrmJobsList({
  initialData = null,
}: {
  initialData?: { items: Job[] } | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stage = searchParams.get("stage") ?? "";
  const seed =
    !stage ? (initialData ?? getListPageCache<{ items: Job[] }>("jobs:default")) : null;
  const [jobs, setJobs] = useState<Job[]>(() => seed?.items ?? []);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(() => !seed);
  const [role, setRole] = useState<UserRole | null>(
    () => getCachedCurrentUser()?.role ?? null,
  );

  useEffect(() => {
    api.getMe().then((me) => setRole(me.role)).catch(() => setRole(null));
    if (seed && !stage) return;
    setLoading(true);
    const params: Record<string, string> = { limit: "50", page: "1" };
    if (stage) params.stage = stage;
    api
      .listJobs(params)
      .then((res) => {
        setJobs(res.items);
        if (!stage) setListPageCache("jobs:default", res);
      })
      .finally(() => setLoading(false));
  }, [seed, stage]);

  const leadName = (job: Job) =>
    job.customer
      ? `${job.customer.firstName} ${job.customer.lastName}`.trim()
      : "";

  const filtered = search.trim()
    ? jobs.filter((job) => {
        const q = search.toLowerCase();
        return (
          job.jobNumber?.toLowerCase().includes(q) ||
          leadName(job).toLowerCase().includes(q) ||
          job.assignedTo?.fullName?.toLowerCase().includes(q) ||
          job.propertyAddress?.toLowerCase().includes(q) ||
          job.propertyPostcode?.toLowerCase().includes(q) ||
          job.stage?.toLowerCase().includes(q)
        );
      })
    : jobs;

  const showMoney = role ? canViewJobMoney(role) : false;

  const columns: Column<Job & Record<string, unknown>>[] = [
    {
      key: "jobNumber",
      header: "Job #",
      width: "9.5rem",
      render: (value) => (
        <span className="text-sm font-medium text-ink tabular-nums">{value as string}</span>
      ),
    },
    {
      key: "customer",
      header: "Lead",
      className: "min-w-0 overflow-hidden",
      render: (_, row) => (
        <span className="block truncate text-sm font-medium text-ink">
          {leadName(row) || "—"}
        </span>
      ),
    },
    {
      key: "assignedTo",
      header: "Assigned to",
      className: "min-w-0 overflow-hidden",
      width: "11rem",
      render: (_, row) => (
        <span className="block truncate text-sm text-ink-muted">
          {row.assignedTo?.fullName ?? "Unassigned"}
        </span>
      ),
    },
    {
      key: "propertyAddress",
      header: "Property",
      className: "min-w-0 overflow-hidden",
      render: (value) => (
        <span
          title={(value as string) || undefined}
          className="block truncate text-sm text-ink-muted"
        >
          {(value as string) || "—"}
        </span>
      ),
    },
    {
      key: "stage",
      header: "Stage",
      width: "12rem",
      render: (value, row) => (
        <StatusPill
          variant={jobStageToPillVariant(value as string)}
          label={formatJobStageLabel(value as string, row.jobType)}
        />
      ),
    },
    ...(showMoney
      ? [
          {
            key: "agreedAmount",
            header: "Amount",
            align: "right" as const,
            width: "6.5rem",
            render: (value: unknown) => (
              <span className="text-sm font-medium text-ink tabular-nums">
                £{value as number}
              </span>
            ),
          } satisfies Column<Job & Record<string, unknown>>,
        ]
      : []),
  ];

  return (
    <CrmPageContent className="space-y-4 py-3 sm:py-4 lg:py-4">
      <CrmPageHeader compact title="Jobs" subtitle="Fulfilment pipeline" />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <Table
          title="All jobs"
          fixedLayout
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search jobs…"
          columns={columns}
          data={filtered as (Job & Record<string, unknown>)[]}
          getRowKey={(r) => r.id}
          onRowClick={(row) => router.push(`/crm/jobs/${row.id}`)}
          emptyMessage="No jobs yet — convert a lead to create one"
          totalCount={filtered.length}
        />
      )}
    </CrmPageContent>
  );
}
