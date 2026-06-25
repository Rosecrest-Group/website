"use client";

import { api } from "@/crm/lib/api";
import { Button } from "@/components/ui/button";

export default function ExportCsvButton({
  type,
  label = "Export CSV",
}: {
  type: string;
  label?: string;
}) {
  return (
    <Button
      type="button"
      variant="crmSecondary"
      className="w-auto"
      onClick={() => api.downloadExport(type).catch(console.error)}
    >
      {label}
    </Button>
  );
}
