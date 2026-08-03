"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/crm/lib/api";
import type { Job } from "@/crm/types";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import Table, { type Column } from "@/crm/components/ui/Table";
import StatusPill from "@/crm/components/ui/StatusPill";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";

export default function CrmJobsList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listJobs()
      .then((res) => setJobs(res.items))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search.trim()
    ? jobs.filter((job) => {
        const q = search.toLowerCase();
        return (
          job.jobNumber?.toLowerCase().includes(q) ||
          job.propertyPostcode?.toLowerCase().includes(q) ||
          job.stage?.toLowerCase().includes(q) ||
          job.paymentStatus?.toLowerCase().includes(q)
        );
      })
    : jobs;

  const columns: Column<Job & Record<string, unknown>>[] = [
    {
      key: "jobNumber",
      header: "Job #",
      render: (value, row) => (
        <Link
          href={`/crm/jobs/${row.id}`}
          className="text-sm font-medium text-ink tabular-nums hover:text-brand"
        >
          {value as string}
        </Link>
      ),
    },
    {
      key: "propertyPostcode",
      header: "Property",
      render: (value) => (
        <span className="text-sm text-ink-muted">{(value as string) || "—"}</span>
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
      key: "paymentStatus",
      header: "Payment",
      render: (value) => (
        <span className="text-sm text-ink-muted">{(value as string) || "—"}</span>
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
          emptyMessage="No jobs yet — convert a lead to create one"
          totalCount={filtered.length}
        />
      )}
    </CrmPageContent>
  );
}
