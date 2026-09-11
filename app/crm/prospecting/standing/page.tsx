"use client";

import { useCallback } from "react";
import { api } from "@/crm/lib/api";
import type { ProspectAccountRow } from "@/crm/types/prospecting";
import ProspectingListClient, { standingVariant } from "@/crm/components/prospecting/ProspectingListClient";
import StatusPill from "@/crm/components/ui/StatusPill";
import type { Column } from "@/crm/components/ui/Table";

const columns: Column<ProspectAccountRow>[] = [
  { key: "legalName", header: "Organisation" },
  { key: "companyNumber", header: "Company no." },
  { key: "lane", header: "Lane" },
  {
    key: "standingGrade",
    header: "Standing",
    render: (value) => (
      <StatusPill variant={standingVariant(String(value ?? "unknown"))} label={String(value ?? "unknown")} />
    ),
  },
  { key: "status", header: "Status" },
];

export default function ProspectingStandingPage() {
  const load = useCallback(async (search: string, page: number) => {
    return api.listProspectingAccounts({ search: search || undefined, page });
  }, []);
  return (
    <ProspectingListClient
      title="Public Standing"
      subtitle="Gazette, HSE and regulator checks. Green requires all three to have run clear."
      columns={columns}
      load={load}
    />
  );
}
