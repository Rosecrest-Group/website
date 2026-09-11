"use client";

import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import CrmPanel from "@/crm/components/ui/CrmPanel";

export default function ProspectingPlaceholder({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <CrmPageContent>
      <CrmPageHeader title={title} subtitle={subtitle} />
      <CrmPanel title="In build">
        <p className="text-sm text-ink-muted">
          This is part of the B2B prospecting module. The page is wired into the CRM
          shell; data lands as each pipeline phase ships.
        </p>
      </CrmPanel>
    </CrmPageContent>
  );
}
