"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/crm/lib/api";
import { canViewJobMoney } from "@/crm/lib/rbac";
import type { Job, UserRole } from "@/crm/types";
import { BEDROOM_BAND_LABELS } from "@/crm/lib/constants";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import Table, { type Column } from "@/crm/components/ui/Table";
import StatusPill, { jobStageToPillVariant } from "@/crm/components/ui/StatusPill";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";

export default function CrmJobsList({
  initialData = null,
}: {
  initialData?: { items: Job[] } | null;
}) {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>(() => initialData?.items ?? []);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(() => !initialData);
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    api.getMe().then((me) => setRole(me.role)).catch(() => setRole(null));
    if (initialData) return;
    api
      .listJobs({ limit: "50", page: "1" })
      .then((res) => setJobs(res.items))
      .finally(() => setLoading(false));
  }, [initialData]);

  const leadName = (job: Job) =>
    job.customer
      ? `${job.customer.firstName} ${job.customer.lastName}`.trim()
      : "";

  const filtered = search.trim()
    ? jobs.filter((job) => {
        const q = search.toLowerCase();
        const rooms = job.bedroomBand
          ? (BEDROOM_BAND_LABELS[job.bedroomBand] ?? job.bedroomBand).toLowerCase()
          : "";
        return (
          job.jobNumber?.toLowerCase().includes(q) ||
          leadName(job).toLowerCase().includes(q) ||
          job.propertyAddress?.toLowerCase().includes(q) ||
          job.propertyPostcode?.toLowerCase().includes(q) ||
          rooms.includes(q) ||
          job.stage?.toLowerCase().includes(q)
        );
      })
    : jobs;

  const showMoney = role ? canViewJobMoney(role) : false;

  const columns: Column<Job & Record<string, unknown>>[] = [
    {
      key: "jobNumber",
      header: "Job #",
      render: (value) => (
        <span className="text-sm font-medium text-ink tabular-nums">{value as string}</span>
      ),
    },
    {
      key: "customer",
      header: "Lead",
      render: (_, row) => (
        <span className="text-sm font-medium text-ink">{leadName(row) || "—"}</span>
      ),
    },
    {
      key: "propertyAddress",
      header: "Property",
      render: (value) => (
        <span className="block max-w-[240px] truncate text-sm text-ink-muted">
          {(value as string) || "—"}
        </span>
      ),
    },
    {
      key: "bedroomBand",
      header: "Rooms",
      render: (value) => (
        <span className="text-sm text-ink-muted">
          {value ? BEDROOM_BAND_LABELS[value as string] ?? (value as string) : "—"}
        </span>
      ),
    },
    {
      key: "stage",
      header: "Stage",
      render: (value) => (
        <StatusPill
          variant={jobStageToPillVariant(value as string)}
          label={(value as string).replace(/_/g, " ")}
        />
      ),
    },
    ...(showMoney
      ? [
          {
            key: "agreedAmount",
            header: "Amount",
            align: "right" as const,
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
