"use client";

import { useCallback } from "react";
import { api } from "@/crm/lib/api";
import type { ProspectProcurementRow } from "@/crm/types/prospecting";
import ProspectingListClient from "@/crm/components/prospecting/ProspectingListClient";
import type { Column } from "@/crm/components/ui/Table";

const columns: Column<ProspectProcurementRow>[] = [
  { key: "title", header: "Notice" },
  { key: "ocid", header: "OCID" },
  { key: "currentNoticeType", header: "Notice type" },
  { key: "status", header: "Status" },
  { key: "lotCount", header: "Lots" },
  { key: "supplierCount", header: "Suppliers" },
  { key: "contactEmail", header: "Contact" },
  { key: "totalValueExVat", header: "Value ex VAT" },
  { key: "endsOn", header: "Ends" },
];

export default function ProspectingLiveContractsPage() {
  const load = useCallback(async (_search: string, page: number) => api.listProspectingProcurements({ page }), []);
  return (
    <ProspectingListClient
      title="Live Contracts"
      subtitle="Open tenders on the bid workflow — current notice, lots, suppliers and published contact."
      columns={columns}
      load={load}
      emptyMessage="No open procurements yet. Daily procurement checks land here."
      onRowHref={(row) => (row.opportunityId ? `/crm/prospecting/review/${row.opportunityId}` : null)}
    />
  );
}
