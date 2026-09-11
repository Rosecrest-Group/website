"use client";

import { useCallback } from "react";
import { api } from "@/crm/lib/api";
import type { ProspectOpportunityRow } from "@/crm/types/prospecting";
import ProspectingListClient from "@/crm/components/prospecting/ProspectingListClient";
import type { Column } from "@/crm/components/ui/Table";

const columns: Column<ProspectOpportunityRow>[] = [
  { key: "legalName", header: "Organisation" },
  { key: "lane", header: "Lane" },
  { key: "decision", header: "Decision" },
  { key: "status", header: "Status" },
  { key: "scoreBand", header: "Score" },
];

export default function ProspectingMonitoredPage() {
  const load = useCallback(async (search: string, page: number) => {
    return api.listProspectingOpportunities({ search: search || undefined, page, decision: "monitor" });
  }, []);
  return (
    <ProspectingListClient
      title="Monitored"
      subtitle="Opportunities parked for a future reopening or stronger evidence."
      columns={columns}
      load={load}
      onRowHref={(row) => `/crm/prospecting/review/${row.id}`}
    />
  );
}
