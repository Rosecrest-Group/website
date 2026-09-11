"use client";

import { useCallback } from "react";
import { api } from "@/crm/lib/api";
import type { ProspectNetworkRow } from "@/crm/types/prospecting";
import ProspectingListClient from "@/crm/components/prospecting/ProspectingListClient";
import type { Column } from "@/crm/components/ui/Table";

const columns: Column<ProspectNetworkRow>[] = [
  { key: "name", header: "Network" },
  { key: "networkType", header: "Type" },
  { key: "memberCount", header: "Members" },
  { key: "reachNote", header: "Reach" },
];

export default function ProspectingNetworksPage() {
  const load = useCallback(async (_search: string, page: number) => api.listProspectingNetworks({ page }), []);
  return (
    <ProspectingListClient
      title="Networks & Groups"
      subtitle="AR networks, group structures and membership reach."
      columns={columns}
      load={load}
    />
  );
}
