"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/crm/lib/api";
import type { Job } from "@/crm/types";
import { BEDROOM_BAND_LABELS } from "@/crm/lib/constants";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import Table, { type Column } from "@/crm/components/ui/Table";
import StatusPill from "@/crm/components/ui/StatusPill";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";

export default function CrmJobsList() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listJobs()
      .then((res) => setJobs(res.items))
      .finally(() => setLoading(false));
  }, []);

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
        <StatusPill variant="in-review" label={(value as string).replace(/_/g, " ")} />
      ),
    },
    {
      key: "agreedAmount",
      header: "Amount",
      align: "right",
      render: (value) => (
        <span className="text-sm font-medium text-ink tabular-nums">
          £{value as number}
        </span>
      ),
    },
  ];

  return (
    <CrmPageContent>
      <CrmPageHeader title="Jobs" subtitle="Fulfilment pipeline" />

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
