"use client";

import { useCallback } from "react";
import { api } from "@/crm/lib/api";
import type { ProspectOpportunityRow } from "@/crm/types/prospecting";
import ProspectingListClient, { cameInColumn } from "@/crm/components/prospecting/ProspectingListClient";
import type { Column } from "@/crm/components/ui/Table";

const columns: Column<ProspectOpportunityRow>[] = [
  { key: "legalName", header: "Organisation" },
  {
    key: "contactName",
    header: "Contact",
    render: (_value, row) => row.contactName || row.contactEmail || "—",
  },
  {
    key: "workflow",
    header: "Type",
    render: (value) => (value === "bid" ? "Public contract" : "Firm"),
  },
  { key: "ownerName", header: "Owner", render: (value) => (value ? String(value) : "—") },
  { key: "dueAt", header: "Due", render: (value) => (value ? new Date(String(value)).toLocaleDateString("en-GB") : "—") },
  cameInColumn<ProspectOpportunityRow>("createdAt"),
];

export default function SalesFunnelPage() {
  const load = useCallback(async (search: string, page: number) => {
    return api.listProspectingOpportunities({ search: search || undefined, page, status: "routed" });
  }, []);

  return (
    <ProspectingListClient
      title="Sales Funnel"
      subtitle="Approved prospects. Open a row to call, email and keep notes on the contact card."
      columns={columns}
      load={load}
      onRowHref={(row) => (row.leadId ? `/crm/leads/${row.leadId}` : `/crm/prospecting/review/${row.id}`)}
      emptyMessage="Nothing approved yet."
    />
  );
}
