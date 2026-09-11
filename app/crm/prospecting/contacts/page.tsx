"use client";

import { useCallback } from "react";
import { api } from "@/crm/lib/api";
import type { ProspectContactRow } from "@/crm/types/prospecting";
import ProspectingListClient from "@/crm/components/prospecting/ProspectingListClient";
import type { Column } from "@/crm/components/ui/Table";

const columns: Column<ProspectContactRow>[] = [
  { key: "legalName", header: "Organisation" },
  { key: "personName", header: "Name" },
  { key: "roleTitle", header: "Role" },
  { key: "email", header: "Email" },
  { key: "confidence", header: "Confidence" },
  { key: "sourceScope", header: "Scope" },
];

export default function ProspectingContactsPage() {
  const load = useCallback(async (_search: string, page: number) => api.listProspectingContacts({ page }), []);
  return (
    <ProspectingListClient
      title="Buyers"
      subtitle="Organisation-first contacts. Mailboxes are stored only as published."
      columns={columns}
      load={load}
    />
  );
}
