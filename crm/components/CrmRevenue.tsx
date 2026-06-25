"use client";

import { useEffect, useState } from "react";
import { api } from "@/crm/lib/api";
import type { DashboardFinance } from "@/crm/types";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import StatsCard from "@/crm/components/admin/StatsCard";
import ExportCsvButton from "@/crm/components/ExportCsvButton";
import CurvedContainer from "@/crm/components/ui/CurvedContainer";
import { Wallet, Clock, CreditCard, AlertCircle } from "lucide-react";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";

export default function CrmRevenue() {
  const [data, setData] = useState<DashboardFinance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getDashboardFinance()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
        title="Revenue"
        subtitle="Last 30 days"
        actions={<ExportCsvButton type="payments" label="Export payments" />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Collected"
          value={data ? `£${data.totalRevenue.toLocaleString()}` : "—"}
          icon={<Wallet />}
          iconTint="success"
        />
        <StatsCard 
          title="Outstanding" 
          value={data ? `£${data.outstanding.toLocaleString()}` : "—"} 
          icon={<Clock />} 
          iconTint="info" 
        />
        <StatsCard 
          title="Payments" 
          value={data?.paymentCount ?? 0} 
          icon={<CreditCard />} 
          iconTint="primary" 
        />
        <StatsCard 
          title="Unpaid jobs" 
          value={data?.unpaidJobCount ?? 0} 
          icon={<AlertCircle />} 
          iconTint="warning" 
        />
      </div>

      {data?.revenueByType && data.revenueByType.length > 0 && (
        <CurvedContainer>
          <div className="border-b border-(--color-tc-20) px-6 py-4">
            <h2 className="text-lg font-semibold text-(--color-tc-40)">Revenue by job type</h2>
          </div>
          <div className="space-y-2 px-6 py-4">
            {data.revenueByType.map((r) => (
              <div key={r.jobType} className="flex justify-between text-sm">
                <span className="text-(--color-tc-30)">{r.jobType.replace(/_/g, " ")}</span>
                <span className="font-medium text-(--color-tc-40)">£{r.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </CurvedContainer>
      )}

      {data?.recentPayments && data.recentPayments.length > 0 && (
        <CurvedContainer>
          <div className="border-b border-(--color-tc-20) px-6 py-4">
            <h2 className="text-lg font-semibold text-(--color-tc-40)">Recent payments</h2>
          </div>
          <div className="space-y-0 px-6 py-4">
            {data.recentPayments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between border-b border-(--color-tc-20) py-3 text-sm last:border-0"
              >
                <span className="text-(--color-tc-40)">
                  {p.jobNumber} · {p.jobType?.replace(/_/g, " ")}
                </span>
                <span className="font-medium">£{p.amount}</span>
              </div>
            ))}
          </div>
        </CurvedContainer>
      )}
    </CrmPageContent>
  );
}
