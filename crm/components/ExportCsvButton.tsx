"use client";

import { api } from "@/crm/lib/api";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";

export default function ExportCsvButton({
  type,
  label = "Export CSV",
}: {
  type: string;
  label?: string;
}) {
  return (
    <SecondaryButton
      className="w-auto"
      onClick={() => api.downloadExport(type).catch(console.error)}
    >
      {label}
    </SecondaryButton>
  );
}
