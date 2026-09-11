"use client";

import { useCallback } from "react";
import { api } from "@/crm/lib/api";
import type { ProspectResultRow } from "@/crm/types/prospecting";
import ProspectingListClient from "@/crm/components/prospecting/ProspectingListClient";
import type { Column } from "@/crm/components/ui/Table";

const columns: Column<ProspectResultRow>[] = [
  { key: "legalName", header: "Organisation" },
  { key: "status", header: "Status" },
  { key: "jobNumber", header: "Job" },
  { key: "paid", header: "Paid", render: (value) => (value ? "Yes" : "No") },
  { key: "amount", header: "Amount" },
];

export default function ProspectingResultsPage() {
  const load = useCallback(async () => {
    const data = await api.listProspectingResults();
    return { items: data.items, total: data.total };
  }, []);
  return (
    <ProspectingListClient
      title="Results & Revenue"
      subtitle="Source to opportunity to job to payment attribution."
      columns={columns}
      load={load}
      onRowHref={(row) => `/crm/prospecting/review/${row.id}`}
    />
  );
}
