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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listJobs()
      .then((res) => setJobs(res.items))
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<Job & Record<string, unknown>>[] = [
    {
      key: "jobNumber",
      header: "Job #",
      render: (value, row) => (
        <Link
          href={`/crm/jobs/${row.id}`}
          className="font-mono text-sm text-(--color-primary) hover:underline"
        >
          {value as string}
        </Link>
      ),
    },
    { key: "propertyPostcode", header: "Property" },
    {
      key: "stage",
      header: "Stage",
      render: (value) => (
        <StatusPill variant="in-review" label={(value as string).replace(/_/g, " ")} />
      ),
    },
    { key: "paymentStatus", header: "Payment" },
    {
      key: "agreedAmount",
      header: "Amount",
      render: (value) => `£${value as number}`,
    },
  ];

  return (
    <CrmPageContent>
      <CrmPageHeader title="Jobs" subtitle="Fulfilment pipeline" />

      {loading ? (
        <LoadingSpinner />
      ) : jobs.length === 0 ? (
        <p className="text-center text-(--color-tc-30)">No jobs yet — convert a lead to create one</p>
      ) : (
        <Table columns={columns} data={jobs as (Job & Record<string, unknown>)[]} getRowKey={(r) => r.id} />
      )}
    </CrmPageContent>
  );
}
