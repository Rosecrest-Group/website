"use client";

import { useEffect, useState } from "react";
import { api } from "@/crm/lib/api";
import type { DashboardOps, DashboardSales } from "@/crm/types";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import StatsCard from "@/crm/components/admin/StatsCard";
import ExportCsvButton from "@/crm/components/ExportCsvButton";
import Table, { type Column } from "@/crm/components/ui/Table";
import { ClipboardCheck, FileEdit, Wrench, UserMinus, CheckCircle, TrendingUp, Tag } from "lucide-react";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import { formatJobStageLabel } from "@/crm/lib/jobStages";

export default function CrmAnalytics() {
  const [data, setData] = useState<DashboardOps | null>(null);
  const [sales, setSales] = useState<DashboardSales | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getDashboardOps(), api.getDashboard("this_month")])
      .then(([ops, salesDash]) => {
        setData(ops);
        setSales(salesDash);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stageRows =
    data?.jobsByStage?.map((row) => ({
      stage: formatJobStageLabel(row.stage),
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
        subtitle="Conversion, cost, and operations metrics"
        actions={<ExportCsvButton type="jobs" label="Export jobs" />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Conversion · this month"
          value={sales ? `${sales.conversionRate30d}%` : "0%"}
          icon={<CheckCircle />}
          iconTint="success"
          subtitle={sales ? `${sales.convertedLast30d} converted` : undefined}
        />
        <StatsCard
          title="Avg time to pay"
          value={sales ? `${sales.avgTimeToPayDays}d` : "—"}
          icon={<TrendingUp />}
          iconTint="info"
          subtitle="From paid jobs"
        />
        {sales?.totalAcquisitionCost30d !== undefined && (
          <StatsCard
            title="Lead cost · this month"
            value={`£${sales.totalAcquisitionCost30d.toFixed(0)}`}
            icon={<Tag />}
            iconTint="warning"
            subtitle={
              sales.costPerConversion30d
                ? `£${sales.costPerConversion30d} per conversion`
                : undefined
            }
          />
        )}
      </div>

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
