"use client";

import { useEffect, useState } from "react";
import { api } from "@/crm/lib/api";
import type { DashboardOps } from "@/crm/types";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import StatsCard from "@/crm/components/admin/StatsCard";
import ExportCsvButton from "@/crm/components/ExportCsvButton";
import Table, { type Column } from "@/crm/components/ui/Table";
import { ClipboardCheck, FileEdit, Wrench, UserMinus } from "lucide-react";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";

export default function CrmAnalytics() {
  const [data, setData] = useState<DashboardOps | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getDashboardOps()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stageRows =
    data?.jobsByStage?.map((row) => ({
      stage: row.stage.replace(/_/g, " "),
      count: row._count.id,
    })) ?? [];

  const stageColumns: Column<{ stage: string; count: number }>[] = [
    { key: "stage", header: "Stage" },
    {
      key: "count",
      header: "Jobs",
      render: (value) => <span className="font-semibold">{value as number}</span>,
    },
  ];

  if (loading) {
    return (
      <CrmPageContent>
        <LoadingSpinner />
      </CrmPageContent>
    );
  }

  return (
    <CrmPageContent>
      <CrmPageHeader
        title="Analytics"
        subtitle="Operations metrics"
        actions={<ExportCsvButton type="jobs" label="Export jobs" />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Inspections this week" 
          value={data?.inspectionsThisWeek ?? 0} 
          icon={<ClipboardCheck />} 
          iconTint="primary" 
        />
        <StatsCard 
          title="Reports in QC / drafting" 
          value={data?.reportsInQc ?? 0} 
          icon={<FileEdit />} 
          iconTint="info" 
        />
        <StatsCard 
          title="Trade jobs active" 
          value={data?.tradeInProgress ?? 0} 
          icon={<Wrench />} 
          iconTint="warning" 
        />
        <StatsCard 
          title="Unassigned jobs" 
          value={data?.unassignedJobs ?? 0} 
          icon={<UserMinus />} 
          iconTint="danger" 
        />
      </div>

      {stageRows.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-(--color-tc-40)">Jobs by stage</h2>
          <Table columns={stageColumns} data={stageRows} />
        </section>
      )}
    </CrmPageContent>
  );
}
