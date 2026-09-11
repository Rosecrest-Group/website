"use client";

import { useCallback } from "react";
import { api } from "@/crm/lib/api";
import type { ProspectProcurementRow } from "@/crm/types/prospecting";
import ProspectingListClient from "@/crm/components/prospecting/ProspectingListClient";
import type { Column } from "@/crm/components/ui/Table";

const columns: Column<ProspectProcurementRow>[] = [
  { key: "title", header: "Framework" },
  { key: "ocid", header: "OCID" },
  { key: "currentNoticeType", header: "Notice type" },
  { key: "commercialTool", header: "Tool" },
  { key: "lotCount", header: "Lots" },
  { key: "supplierCount", header: "Suppliers" },
  { key: "contactEmail", header: "Contact" },
  { key: "status", header: "Status" },
];

export default function ProspectingFrameworksPage() {
  const load = useCallback(
    async (_search: string, page: number) => api.listProspectingProcurements({ page, frameworks: true }),
    [],
  );
  return (
    <ProspectingListClient
      title="Frameworks"
      subtitle="Appointed-supplier frameworks and commercial tools."
      columns={columns}
      load={load}
      onRowHref={(row) => (row.opportunityId ? `/crm/prospecting/review/${row.opportunityId}` : null)}
    />
  );
}
