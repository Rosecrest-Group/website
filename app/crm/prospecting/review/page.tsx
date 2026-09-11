"use client";

import { useCallback } from "react";
import { api } from "@/crm/lib/api";
import type { ProspectOpportunityRow } from "@/crm/types/prospecting";
import ProspectingListClient, { standingVariant } from "@/crm/components/prospecting/ProspectingListClient";
import StatusPill from "@/crm/components/ui/StatusPill";
import type { Column } from "@/crm/components/ui/Table";

const columns: Column<ProspectOpportunityRow>[] = [
  { key: "legalName", header: "Organisation" },
  { key: "lane", header: "Lane" },
  { key: "workflow", header: "Workflow" },
  { key: "status", header: "Status" },
  { key: "decision", header: "Decision" },
  { key: "scoreBand", header: "Score" },
  {
    key: "standingGrade",
    header: "Standing",
    render: (value) => (
      <StatusPill variant={standingVariant(String(value ?? "unknown"))} label={String(value ?? "unknown")} />
    ),
  },
];

function newestFirst(items: ProspectOpportunityRow[]): ProspectOpportunityRow[] {
  return [...items].sort((a, b) => {
    if (a.createdAt && b.createdAt && a.createdAt !== b.createdAt) {
      return b.createdAt.localeCompare(a.createdAt);
    }
    return b.id.localeCompare(a.id);
  });
}

export default function ProspectingReviewPage() {
  const load = useCallback(async (search: string, page: number) => {
    const data = await api.listProspectingOpportunities({ search: search || undefined, page });
    return { ...data, items: newestFirst(data.items) };
  }, []);

  return (
    <ProspectingListClient
      title="Prospect Review"
      subtitle="Evidence-backed cards for approval, edit, rejection or escalation."
      columns={columns}
      load={load}
      onRowHref={(row) => `/crm/prospecting/review/${row.id}`}
    />
  );
}
