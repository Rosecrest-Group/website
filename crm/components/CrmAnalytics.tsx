"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/crm/lib/api";
import type { DashboardPeriod, DashboardSales } from "@/crm/types";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import StatsCard from "@/crm/components/admin/StatsCard";
import ExportCsvButton from "@/crm/components/ExportCsvButton";
import FilterDropdown from "@/crm/components/ui/FilterDropdown";
import Table, { type Column } from "@/crm/components/ui/Table";
import TrendChart from "@/crm/components/ui/TrendChart";
import FunnelChart from "@/crm/components/ui/FunnelChart";
import {
  UserMinus,
  CheckCircle,
  TrendingUp,
  Tag,
  Users,
  PoundSterling,
  Repeat,
  CalendarRange,
  Clock,
  Globe,
  MapPin,
  Banknote,
  Layers,
  Target,
  Send,
  Percent,
  MousePointerClick,
  Wallet,
} from "lucide-react";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import {
  BEDROOM_BAND_LABELS,
  DASHBOARD_PERIODS,
  JOB_TYPE_LABELS,
  LEAD_SOURCES,
  LOST_REASON_OPTIONS,
  SURVEY_LEVEL_LABELS,
  vsPeriodTrend,
} from "@/crm/lib/constants";
import { cn } from "@/lib/utils";

function sourceLabel(source: string) {
  return LEAD_SOURCES.find((item) => item.value === source)?.label ?? source.replace(/_/g, " ");
}

function lostReasonLabel(reason: string) {
  return (
    LOST_REASON_OPTIONS.find((item) => item.value === reason)?.label ??
    reason.replace(/_/g, " ").toLowerCase()
  );
}

function SourceIcon({ source }: { source?: string }) {
  const key = (source ?? "").toLowerCase();
  const cls = "h-3.5 w-3.5";
  if (key.includes("web")) return <Globe className={cls} aria-hidden />;
  if (key.includes("pin") || key.includes("local") || key.includes("really") || key.includes("map")) {
    return <MapPin className={cls} aria-hidden />;
  }
  return <Tag className={cls} aria-hidden />;
}

function pounds(value: number, digits = 0) {
  return `£${value.toFixed(digits)}`;
}

function mixLabel(kind: "jobType" | "surveyLevel" | "bedroomBand", key: string) {
  if (key === "UNSET") return "Not set";
  if (kind === "jobType") return JOB_TYPE_LABELS[key] ?? key.replace(/_/g, " ");
  if (kind === "surveyLevel") return SURVEY_LEVEL_LABELS[key] ?? key.replace(/_/g, " ");
  return BEDROOM_BAND_LABELS[key] ?? key.replace(/_/g, " ");
}

function mixColumns(kind: "jobType" | "surveyLevel" | "bedroomBand"): Column<Record<string, unknown>>[] {
  return [
    {
      key: "key",
      header: kind === "jobType" ? "Type" : kind === "surveyLevel" ? "Level" : "Beds",
      render: (value) => (
        <span className="text-sm font-medium text-ink">{mixLabel(kind, String(value))}</span>
      ),
    },
    {
      key: "leads",
      header: "Leads",
      align: "right",
      render: (value) => (
        <span className="text-sm font-medium text-ink tabular-nums">{value as number}</span>
      ),
    },
    {
      key: "quoteRate",
      header: "Quote %",
      align: "right",
      render: (value) => (
        <span className="text-sm font-medium text-ink tabular-nums">{value as number}%</span>
      ),
    },
    {
      key: "winRate",
      header: "Win %",
      align: "right",
      render: (value) => (
        <span className="text-sm font-medium text-ink tabular-nums">{value as number}%</span>
      ),
    },
    {
      key: "revenue",
      header: "Won £",
      align: "right",
      render: (value) => (
        <span className="text-sm font-medium text-ink tabular-nums">{pounds(value as number)}</span>
      ),
    },
    {
      key: "avgWonValue",
      header: "Avg",
      align: "right",
      render: (value, row) => (
        <span className="text-sm font-medium text-ink tabular-nums">
          {Number(row.won) > 0 ? pounds(value as number) : "—"}
        </span>
      ),
    },
  ];
}

export default function CrmAnalytics() {
  const router = useRouter();
  const [period, setPeriod] = useState<DashboardPeriod>("30d");
  const [sales, setSales] = useState<DashboardSales | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fetchGeneration = useRef(0);
  const hasLoadedSales = useRef(false);

  useEffect(() => {
    const generation = ++fetchGeneration.current;
    if (hasLoadedSales.current) setIsRefreshing(true);

    api
      .getDashboard(period)
      .then((salesDash) => {
        if (generation !== fetchGeneration.current) return;
        hasLoadedSales.current = true;
        setSales(salesDash);
      })
      .catch(console.error)
      .finally(() => {
        if (generation !== fetchGeneration.current) return;
        setLoading(false);
        setIsRefreshing(false);
      });
  }, [period]);

  const periodShort =
    DASHBOARD_PERIODS.find((item) => item.value === period)?.short ?? "30d";
  const comparisonLabel = sales?.comparison?.label;
  const deltas = sales?.comparison?.deltas;

  const funnelRows = (sales?.funnelBySource ?? []).map((row) => ({
    ...row,
  }));

  const funnelColumns: Column<(typeof funnelRows)[number]>[] = [
    {
      key: "source",
      header: "Source",
      render: (value) => (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink">
          <SourceIcon source={value as string} />
          {sourceLabel(String(value))}
        </span>
      ),
    },
    {
      key: "leads",
      header: "Leads",
      align: "right",
      render: (value) => (
        <span className="text-sm font-medium text-ink tabular-nums">{value as number}</span>
      ),
    },
    {
      key: "converted",
      header: "Won",
      align: "right",
      render: (value) => (
        <span className="text-sm font-medium text-ink tabular-nums">{value as number}</span>
      ),
    },
    {
      key: "wonRevenue",
      header: "Won £",
      align: "right",
      render: (value) => (
        <span className="text-sm font-medium text-ink tabular-nums">
          {pounds(value as number)}
        </span>
      ),
    },
    {
      key: "conversionRate",
      header: "Conv %",
      align: "right",
      render: (value) => (
        <span className="text-sm font-medium text-ink tabular-nums">{value as number}%</span>
      ),
    },
    {
      key: "acquisitionCost",
      header: "Cost £",
      align: "right",
      render: (value) => (
        <span className="text-sm font-medium text-ink tabular-nums">
          {pounds(value as number)}
        </span>
      ),
    },
    {
      key: "quotedPipeline",
      header: "Pipeline £",
      align: "right",
      render: (value) => (
        <span className="text-sm font-medium text-ink tabular-nums">
          {pounds(value as number)}
        </span>
      ),
    },
    {
      key: "roi",
      header: "ROI",
      align: "right",
      render: (value) => (
        <span className="text-sm font-medium text-ink tabular-nums">
          {value == null ? "—" : `${Number(value).toFixed(2)}x`}
        </span>
      ),
    },
  ];

  const lostTotal = sales?.lostLast30d ?? 0;
  const lostRows = (sales?.lostByReason ?? []).map((row) => ({
    ...row,
    share: lostTotal > 0 ? Math.round((row.count / lostTotal) * 1000) / 10 : 0,
  }));

  const lostColumns: Column<(typeof lostRows)[number]>[] = [
    {
      key: "reason",
      header: "Reason",
      render: (value) => (
        <span className="text-sm text-ink">{lostReasonLabel(String(value))}</span>
      ),
    },
    {
      key: "count",
      header: "Lost",
      align: "right",
      render: (value) => (
        <span className="text-sm font-medium text-ink tabular-nums">{value as number}</span>
      ),
    },
    {
      key: "value",
      header: "Lost £",
      align: "right",
      render: (value) => (
        <span className="text-sm font-medium text-ink tabular-nums">
          {pounds(Number(value ?? 0))}
        </span>
      ),
    },
    {
      key: "share",
      header: "%",
      align: "right",
      render: (value) => (
        <span className="text-sm font-medium text-ink tabular-nums">{value as number}%</span>
      ),
    },
  ];

  if (loading) {
    return (
      <CrmPageContent>
        <LoadingSpinner />
      </CrmPageContent>
    );
  }

  const leads = sales?.leadsLast30d ?? 0;
  const won = sales?.convertedLast30d ?? 0;
  const lost = sales?.lostLast30d ?? 0;
  const cost = sales?.totalAcquisitionCost30d ?? 0;
  const costPerLead = sales?.costPerLead30d ?? 0;
  const costPerWin = sales?.costPerConversion30d ?? 0;
  const follow = sales?.quoteFollowThrough ?? {
    quotedCount: 0,
    clickedCount: 0,
    clickRate: 0,
    wonFromClicked: 0,
    clickToPayRate: 0,
    avgDaysQuoteToClick: 0,
    avgDaysClickToPay: 0,
    clickedUnpaidCount: 0,
    clickedUnpaidValue: 0,
    quotedUnclickedCount: 0,
    quotedUnclickedValue: 0,
  };

  return (
    <CrmPageContent>
      <CrmPageHeader
        title="Analytics"
        subtitle="Where money is won, lost, and still sitting in the pipeline"
        actions={
          <>
            <FilterDropdown
              aria-label="Period"
              value={period}
              options={DASHBOARD_PERIODS.map((item) => ({ value: item.value, label: item.label }))}
              onChange={setPeriod}
            />
            <ExportCsvButton type="jobs" label="Export jobs" />
          </>
        }
      />

      <div
        aria-busy={isRefreshing}
        className={cn(
          "space-y-6 transition-opacity duration-150",
          isRefreshing && "pointer-events-none opacity-55",
        )}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title={`Leads · ${periodShort}`}
            value={leads}
            icon={<Users />}
            iconTint="primary"
            trend={vsPeriodTrend(deltas?.leads, comparisonLabel)}
            action={{ label: "View leads", href: "/crm/leads" }}
          />
          <StatsCard
            title={`Conversion · ${periodShort}`}
            value={sales ? `${sales.conversionRate30d}%` : "0%"}
            icon={<CheckCircle />}
            iconTint="success"
            subtitle={`${won} won`}
            trend={vsPeriodTrend(deltas?.conversionRate, comparisonLabel)}
          />
          <StatsCard
            title={`Revenue · ${periodShort}`}
            value={pounds(sales?.revenueLast30d ?? 0)}
            icon={<PoundSterling />}
            iconTint="success"
            subtitle={`${won} won`}
            trend={vsPeriodTrend(deltas?.revenue, comparisonLabel)}
            action={{ label: "View won", href: "/crm/leads?stage=CONVERTED" }}
          />
          <StatsCard
            title={`Lost · ${periodShort}`}
            value={lost}
            icon={<UserMinus />}
            iconTint="danger"
            subtitle={`${sales?.lostRate30d ?? 0}% of leads`}
            trend={vsPeriodTrend(deltas?.lost, comparisonLabel, true)}
            action={{ label: "View lost", href: "/crm/leads?stage=LOST" }}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="MRR"
            value={pounds(sales?.mrr ?? 0)}
            icon={<Repeat />}
            iconTint="success"
            subtitle={`Run-rate from ${periodShort}`}
            trend={vsPeriodTrend(deltas?.mrr, comparisonLabel)}
          />
          <StatsCard
            title="ARR"
            value={pounds(sales?.arr ?? 0)}
            icon={<CalendarRange />}
            iconTint="success"
            subtitle="MRR × 12"
            trend={vsPeriodTrend(deltas?.arr, comparisonLabel)}
          />
          <StatsCard
            title={`Avg won · ${periodShort}`}
            value={won > 0 ? pounds(sales?.avgWonValue ?? 0) : "—"}
            icon={<Banknote />}
            iconTint="success"
            subtitle={won > 0 ? `${won} won` : "No wins in period"}
            trend={vsPeriodTrend(deltas?.avgWonValue, comparisonLabel)}
          />
          <StatsCard
            title={`Pipeline · ${periodShort}`}
            value={pounds(sales?.opportunityValue ?? 0)}
            icon={<Layers />}
            iconTint="info"
            subtitle={`${sales?.activeLeads ?? 0} open`}
            trend={vsPeriodTrend(deltas?.opportunity, comparisonLabel)}
            action={{ label: "View leads", href: "/crm/leads" }}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title={`Forecast · ${periodShort}`}
            value={pounds(sales?.forecast ?? 0)}
            icon={<Target />}
            iconTint="info"
            subtitle="Expected value of open pipeline"
            trend={vsPeriodTrend(deltas?.forecast, comparisonLabel)}
          />
          <StatsCard
            title={`Quote rate · ${periodShort}`}
            value={`${sales?.quoteRate ?? 0}%`}
            icon={<Send />}
            iconTint="primary"
            subtitle={`${sales?.quotedCount ?? 0} quoted`}
            trend={vsPeriodTrend(deltas?.quoteRate, comparisonLabel)}
          />
          <StatsCard
            title={`Quote to win · ${periodShort}`}
            value={`${sales?.quoteToWinRate ?? 0}%`}
            icon={<Percent />}
            iconTint="success"
            subtitle={`${won} won / ${sales?.quotedCount ?? 0} quoted`}
            trend={vsPeriodTrend(deltas?.quoteToWinRate, comparisonLabel)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title={`Lead cost · ${periodShort}`}
            value={pounds(cost)}
            icon={<Tag />}
            iconTint="warning"
            subtitle={`${leads} lead${leads === 1 ? "" : "s"}`}
            trend={vsPeriodTrend(deltas?.acquisitionCost, comparisonLabel, true)}
          />
          <StatsCard
            title={`Cost per lead · ${periodShort}`}
            value={pounds(costPerLead, 2)}
            icon={<Tag />}
            iconTint="warning"
            trend={vsPeriodTrend(deltas?.costPerLead, comparisonLabel, true)}
          />
          <StatsCard
            title={`Cost per win · ${periodShort}`}
            value={won > 0 ? pounds(costPerWin, 2) : "—"}
            icon={<Tag />}
            iconTint="warning"
            subtitle={won > 0 ? `${won} won` : "No wins in period"}
            trend={vsPeriodTrend(deltas?.costPerConversion, comparisonLabel, true)}
          />
          <StatsCard
            title={`ROI · ${periodShort}`}
            value={sales?.roi30d != null ? `${sales.roi30d.toFixed(2)}x` : "—"}
            icon={<TrendingUp />}
            iconTint="success"
            subtitle="Revenue / lead spend"
            trend={vsPeriodTrend(deltas?.roi, comparisonLabel)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title={`Time to quote · ${periodShort}`}
            value={`${sales?.avgTimeToQuoteDays ?? 0}d`}
            icon={<Clock />}
            iconTint="info"
            subtitle="Created to quoted"
          />
          <StatsCard
            title={`Time to win · ${periodShort}`}
            value={`${sales?.avgTimeToWinDays ?? 0}d`}
            icon={<Clock />}
            iconTint="info"
            subtitle="Created to won"
          />
          <StatsCard
            title={`Time to pay · ${periodShort}`}
            value={`${sales?.avgTimeToPayDays ?? 0}d`}
            icon={<TrendingUp />}
            iconTint="info"
            subtitle="From paid jobs"
          />
        </div>

        <TrendChart
          title={`Revenue and conversion · ${periodShort}`}
          points={sales?.timeseries?.points ?? []}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <FunnelChart
            title={`Stage funnel · ${periodShort}`}
            steps={sales?.funnelSteps ?? []}
          />
          <Table
            title={`Lost reasons · ${periodShort}`}
            columns={lostColumns}
            data={lostRows}
            getRowKey={(row) => String(row.reason)}
            emptyMessage="No lost leads in this period"
          />
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-medium text-ink">Quote follow-through</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title={`Click rate · ${periodShort}`}
              value={`${follow.clickRate}%`}
              icon={<MousePointerClick />}
              iconTint="primary"
              subtitle={`${follow.clickedCount} clicked / ${follow.quotedCount} quoted`}
            />
            <StatsCard
              title={`Click to pay · ${periodShort}`}
              value={`${follow.clickToPayRate}%`}
              icon={<Percent />}
              iconTint="success"
              subtitle={`${follow.wonFromClicked} paid · ${follow.avgDaysClickToPay}d after click`}
            />
            <StatsCard
              title="Clicked, unpaid"
              value={pounds(follow.clickedUnpaidValue)}
              icon={<Wallet />}
              iconTint="warning"
              subtitle={`${follow.clickedUnpaidCount} open · money on the table`}
              action={{ label: "Chase now", href: "/crm/pipeline?slice=clicked_unpaid" }}
            />
            <StatsCard
              title="Quoted, not clicked"
              value={pounds(follow.quotedUnclickedValue)}
              icon={<Send />}
              iconTint="info"
              subtitle={`${follow.quotedUnclickedCount} open · ${follow.avgDaysQuoteToClick}d quote to click`}
              action={{ label: "View pipeline", href: "/crm/pipeline" }}
            />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-medium text-ink">Product and pricing mix</h2>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Table
              title={`Survey level · ${periodShort}`}
              columns={mixColumns("surveyLevel")}
              data={(sales?.productMix?.bySurveyLevel ?? []).map((row) => ({ ...row }))}
              getRowKey={(row) => `level:${row.key}`}
              compact
              emptyMessage="No leads in this period"
            />
            <Table
              title={`Job type · ${periodShort}`}
              columns={mixColumns("jobType")}
              data={(sales?.productMix?.byJobType ?? []).map((row) => ({ ...row }))}
              getRowKey={(row) => `type:${row.key}`}
              compact
              emptyMessage="No leads in this period"
            />
            <Table
              title={`Bedroom band · ${periodShort}`}
              columns={mixColumns("bedroomBand")}
              data={(sales?.productMix?.byBedroomBand ?? []).map((row) => ({ ...row }))}
              getRowKey={(row) => `beds:${row.key}`}
              compact
              emptyMessage="No leads in this period"
            />
          </div>
        </div>

        <Table
          title={`Funnel by source · ${periodShort}`}
          columns={funnelColumns}
          data={funnelRows}
          getRowKey={(row) => String(row.source)}
          onRowClick={(row) =>
            router.push(`/crm/leads?source=${encodeURIComponent(String(row.source))}`)
          }
          emptyMessage="No leads in this period"
        />

        <Table
          title={`Speed to first touch · ${periodShort}`}
          columns={[
            { key: "cohort", header: "Cohort" },
            {
              key: "leads",
              header: "Leads",
              align: "right",
              render: (value) => (
                <span className="text-sm font-medium text-ink tabular-nums">{value as number}</span>
              ),
            },
            {
              key: "converted",
              header: "Won",
              align: "right",
              render: (value) => (
                <span className="text-sm font-medium text-ink tabular-nums">{value as number}</span>
              ),
            },
            {
              key: "conversionRate",
              header: "Conv %",
              align: "right",
              render: (value) => (
                <span className="text-sm font-medium text-ink tabular-nums">{value as number}%</span>
              ),
            },
          ]}
          data={sales?.speedToLead ?? []}
          getRowKey={(row) => String(row.cohort)}
          emptyMessage="No resolved leads in this period"
        />
      </div>
    </CrmPageContent>
  );
}
