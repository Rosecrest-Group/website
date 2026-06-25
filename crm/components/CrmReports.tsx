"use client";

import { api } from "@/crm/lib/api";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import CurvedContainer from "@/crm/components/ui/CurvedContainer";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";

const EXPORTS = [
  { type: "leads", label: "Leads export", desc: "All leads with customer and property details" },
  { type: "jobs", label: "Jobs export", desc: "Jobs with payment and report status" },
  { type: "payments", label: "Payments export", desc: "Payment records linked to jobs" },
];

export default function CrmReports() {
  return (
    <CrmPageContent>
      <CrmPageHeader title="Reports" subtitle="CSV exports for finance and ops" />

      <div className="grid gap-4 lg:grid-cols-3">
        {EXPORTS.map((e) => (
          <CurvedContainer key={e.type}>
            <div className="space-y-3 p-6">
              <h2 className="text-base font-semibold text-(--color-tc-40)">{e.label}</h2>
              <p className="text-sm text-(--color-tc-30)">{e.desc}</p>
              <SecondaryButton type="button" onClick={() => api.downloadExport(e.type)}>
                Download CSV
              </SecondaryButton>
            </div>
          </CurvedContainer>
        ))}
      </div>
    </CrmPageContent>
  );
}
