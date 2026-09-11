"use client";

import { useCallback } from "react";
import { api } from "@/crm/lib/api";
import type { ProspectOpportunityRow } from "@/crm/types/prospecting";
import ProspectingListClient from "@/crm/components/prospecting/ProspectingListClient";
import type { Column } from "@/crm/components/ui/Table";

const columns: Column<ProspectOpportunityRow>[] = [
  { key: "legalName", header: "Organisation" },
  { key: "workflow", header: "Workflow" },
  { key: "lane", header: "Lane" },
  { key: "status", header: "Status" },
  { key: "decision", header: "Decision" },
];

export default function ProspectingFunnelsPage() {
  const load = useCallback(async (search: string, page: number) => {
    return api.listProspectingOpportunities({ search: search || undefined, page, status: "routed" });
  }, []);
  return (
    <ProspectingListClient
      title="Sales Funnels"
      subtitle="Approved opportunities routed onto a dated task and owner."
      columns={columns}
      load={load}
      onRowHref={(row) => `/crm/prospecting/review/${row.id}`}
    />
  );
}
