"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/crm/lib/api";
import type { DashboardSla } from "@/crm/types";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import StatsCard from "@/crm/components/admin/StatsCard";
import ExportCsvButton from "@/crm/components/ExportCsvButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import CurvedContainer from "@/crm/components/ui/CurvedContainer";
import { AlertTriangle, Clock, AlertOctagon } from "lucide-react";
import StatusPill from "@/crm/components/ui/StatusPill";

export default function SlasDashboard() {
  const [data, setData] = useState<DashboardSla | null>(null);

  function load() {
    api.getDashboardSla().then(setData).catch(console.error);
  }

  useEffect(() => {
    load();
  }, []);

  async function runMonitor() {
    await api.runSlaMonitor();
    load();
  }

  return (
    <CrmPageContent>
      <CrmPageHeader
        title="SLAs"
        subtitle="Report delivery deadlines and breaches"
        actions={
          <>
            <ExportCsvButton type="jobs" label="Export jobs" />
            <SecondaryButton type="button" onClick={runMonitor}>
              Run SLA check
            </SecondaryButton>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard 
          title="At risk" 
          value={data?.atRisk.length ?? 0} 
          icon={<AlertTriangle />} 
          iconTint="warning" 
        />
        <StatsCard 
          title="Late (internal)" 
          value={data?.late ?? 0} 
          icon={<Clock />} 
          iconTint="warning" 
        />
        <StatsCard 
          title="Overdue (client)" 
          value={data?.overdue ?? 0} 
          icon={<AlertOctagon />} 
          iconTint="danger" 
        />
      </div>

      <CurvedContainer>
        <div className="border-b border-(--color-tc-20) px-6 py-4">
          <h2 className="text-lg font-semibold text-(--color-tc-40)">Jobs approaching deadline</h2>
        </div>
        <div className="space-y-0 px-6 py-4">
          {(data?.atRisk ?? []).length === 0 ? (
            <p className="text-sm text-(--color-tc-30)">No jobs at risk</p>
          ) : (
            data!.atRisk.map((j) => (
              <div
                key={j.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-(--color-tc-20) py-3 text-sm last:border-0"
              >
                <div>
                  <Link
                    href={`/crm/jobs/${j.id}`}
                    className="font-medium text-(--color-primary) hover:underline"
                  >
                    {j.jobNumber}
                  </Link>
                  <span className="ml-2 text-(--color-tc-30)">
                    {j.customer} · {j.propertyAddress}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill variant="in-review" label={j.reportStatus ?? "—"} />
                  <span className="text-xs text-(--color-tc-30)">
                    Client:{" "}
                    {j.reportClientDeadline
                      ? new Date(j.reportClientDeadline).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CurvedContainer>
    </CrmPageContent>
  );
}
