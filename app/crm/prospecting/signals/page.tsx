"use client";

import { useCallback } from "react";
import { api } from "@/crm/lib/api";
import type { ProspectSignalRow } from "@/crm/types/prospecting";
import ProspectingListClient from "@/crm/components/prospecting/ProspectingListClient";
import type { Column } from "@/crm/components/ui/Table";

const columns: Column<ProspectSignalRow>[] = [
  { key: "legalName", header: "Organisation" },
  { key: "family", header: "Family" },
  { key: "summary", header: "Summary" },
  { key: "urgency", header: "Urgency" },
  { key: "confidence", header: "Confidence" },
];

export default function ProspectingSignalsPage() {
  const load = useCallback(async (_search: string, page: number) => api.listProspectingSignals({ page }), []);
  return (
    <ProspectingListClient
      title="Need Signals"
      subtitle="New and changed buying signals by urgency, service and account."
      columns={columns}
      load={load}
    />
  );
}
