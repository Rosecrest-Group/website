"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { api } from "@/crm/lib/api";
import type {
  DashboardMyTasks,
  DashboardPeriod,
  DashboardSales,
  Job,
  Lead,
  Task,
  TaskStatus,
  UserRole,
} from "@/crm/types";
import { CRM_BASE_PATH, LEAD_STAGE_LABELS, TASK_STATUS_LABELS } from "@/crm/lib/constants";
import { canReadLeads } from "@/crm/lib/rbac";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import FilterDropdown from "@/crm/components/ui/FilterDropdown";
import StatsCard from "@/crm/components/admin/StatsCard";
import Table, { type Column } from "@/crm/components/ui/Table";
import StatusPill, { leadStageToPillVariant } from "@/crm/components/ui/StatusPill";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";

import { useRouter } from "next/navigation";
import { Users, CheckCircle, TrendingUp, Globe, MapPin, Tag } from "lucide-react";

/* ------------------------------------------------------------------ */
/* helpers                                                            */
/* ------------------------------------------------------------------ */

function taskStatusToPillVariant(status: TaskStatus): "completed" | "pending" {
  return status === "DONE" ? "completed" : "pending";
}

function formatDueDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type DashboardTaskRow = Task & { involvement: string };

function mergeMyTasks(assigned: Task[], created: Task[]): DashboardTaskRow[] {
  const map = new Map<string, { task: Task; assigned: boolean; created: boolean }>();

  for (const task of assigned) {
    map.set(task.id, { task, assigned: true, created: false });
  }
  for (const task of created) {
    const existing = map.get(task.id);
    if (existing) {
      existing.created = true;
    } else {
      map.set(task.id, { task, assigned: false, created: true });
    }
  }

  return Array.from(map.values())
    .map(({ task, assigned, created }) => ({
      ...task,
      involvement:
        assigned && created
          ? "Assigned · Created"
          : assigned
            ? "Assigned to me"
            : "Created by me",
    }))
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "OPEN" ? -1 : 1;
      const aDue = a.dueAt ? new Date(a.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
      const bDue = b.dueAt ? new Date(b.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
      if (aDue !== bDue) return aDue - bDue;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function prettifySource(raw?: string): string {
  if (!raw) return "—";
  const s = raw.replace(/_/g, " ").toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatTimeAgo(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function SourceIcon({ source }: { source?: string }) {
  const k = (source ?? "").toLowerCase();
  const cls = "h-3.5 w-3.5";
  if (k.includes("web")) return <Globe className={cls} aria-hidden />;
  if (k.includes("pin") || k.includes("local") || k.includes("map"))
    return <MapPin className={cls} aria-hidden />;
  return <Tag className={cls} aria-hidden />;
}

const DASHBOARD_PERIODS: { value: DashboardPeriod; label: string; short: string }[] = [
  { value: "today", label: "Today", short: "today" },
  { value: "7d", label: "Last 7 days", short: "7d" },
  { value: "30d", label: "Last 30 days", short: "30d" },
  { value: "this_month", label: "This month", short: "this month" },
  { value: "90d", label: "Last 90 days", short: "90d" },
];

type PeriodCacheEntry = { data: DashboardSales; recentLeads: Lead[] };

type DashboardSnapshot = {
  role: UserRole;
  period: DashboardPeriod;
  data: DashboardSales | null;
  recentLeads: Lead[];
  myJobs: Job[];
  assignedTasks: Task[];
  createdTasks: Task[];
};

let memorySnapshot: DashboardSnapshot | null = null;

function rememberSnapshot(snapshot: DashboardSnapshot) {
  memorySnapshot = snapshot;
}

/* ------------------------------------------------------------------ */
/* page                                                               */
/* ------------------------------------------------------------------ */

export default function CrmDashboard({
  initialMe = null,
  initialDashboard = null,
  initialTasks = null,
  initialJobs = null,
}: {
  initialMe?: { role: UserRole } | null;
  initialDashboard?: DashboardSales | null;
  initialTasks?: DashboardMyTasks | null;
  initialJobs?: Job[] | null;
}) {
  const router = useRouter();
  const snapshot = memorySnapshot;
  const [role, setRole] = useState<UserRole | null>(
    () => initialMe?.role ?? snapshot?.role ?? null,
  );
  const [period, setPeriod] = useState<DashboardPeriod>(
    () => snapshot?.period ?? "this_month",
  );
  const [data, setData] = useState<DashboardSales | null>(
    () => initialDashboard ?? snapshot?.data ?? null,
  );
  const [recentLeads, setRecentLeads] = useState<Lead[]>(
    () => initialDashboard?.recentLeads ?? snapshot?.recentLeads ?? [],
  );
  const [myJobs, setMyJobs] = useState<Job[]>(() => initialJobs ?? snapshot?.myJobs ?? []);
  const [assignedTasks, setAssignedTasks] = useState<Task[]>(
    () => initialTasks?.assignedToMe ?? snapshot?.assignedTasks ?? [],
  );
  const [createdTasks, setCreatedTasks] = useState<Task[]>(
    () => initialTasks?.createdByMe ?? snapshot?.createdTasks ?? [],
  );
  const [error, setError] = useState("");
  const seeded = Boolean(
    (initialMe &&
      initialTasks &&
      (canReadLeads(initialMe.role) ? initialDashboard : initialJobs)) ||
      snapshot,
  );
  const [isLoading, setIsLoading] = useState(() => !seeded);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [, startTransition] = useTransition();
  const periodCache = useRef(
    new Map<DashboardPeriod, PeriodCacheEntry>(
      initialDashboard
        ? [
            [
              "this_month",
              {
                data: initialDashboard,
                recentLeads: initialDashboard.recentLeads ?? [],
              },
            ],
          ]
        : snapshot?.data
          ? [
              [
                snapshot.period,
                { data: snapshot.data, recentLeads: snapshot.recentLeads },
              ],
            ]
          : [],
    ),
  );
  const fetchGeneration = useRef(0);

  function applyDashboard(entry: PeriodCacheEntry) {
    setData(entry.data);
    setRecentLeads(entry.recentLeads);
  }

  async function fetchPeriod(nextPeriod: DashboardPeriod): Promise<PeriodCacheEntry> {
    const dashboard = await api.getDashboard(nextPeriod);
    const entry: PeriodCacheEntry = {
      data: dashboard,
      recentLeads: dashboard.recentLeads ?? [],
    };
    periodCache.current.set(nextPeriod, entry);
    return entry;
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await api.getMe();
        if (cancelled) return;
        setRole(me.role);

        if (canReadLeads(me.role)) {
          const [entry, tasksRes] = await Promise.all([
            fetchPeriod(period),
            api.getMyTasks(),
          ]);
          if (cancelled) return;
          applyDashboard(entry);
          setAssignedTasks(tasksRes.assignedToMe);
          setCreatedTasks(tasksRes.createdByMe);
          rememberSnapshot({
            role: me.role,
            period,
            data: entry.data,
            recentLeads: entry.recentLeads,
            myJobs: [],
            assignedTasks: tasksRes.assignedToMe,
            createdTasks: tasksRes.createdByMe,
          });
        } else {
          const [jobsRes, tasksRes] = await Promise.all([
            api.listJobs({ limit: "8", page: "1" }),
            api.getMyTasks(),
          ]);
          if (cancelled) return;
          setMyJobs(jobsRes.items);
          setAssignedTasks(tasksRes.assignedToMe);
          setCreatedTasks(tasksRes.createdByMe);
          rememberSnapshot({
            role: me.role,
            period,
            data: null,
            recentLeads: [],
            myJobs: jobsRes.items,
            assignedTasks: tasksRes.assignedToMe,
            createdTasks: tasksRes.createdByMe,
          });
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePeriodChange(nextPeriod: DashboardPeriod) {
    if (nextPeriod === period) return;
    const generation = ++fetchGeneration.current;
    startTransition(() => setPeriod(nextPeriod));

    const cached = periodCache.current.get(nextPeriod);
    if (cached) {
      applyDashboard(cached);
      setIsRefreshing(false);
      return;
    }

    setIsRefreshing(true);
    void fetchPeriod(nextPeriod)
      .then((entry) => {
        if (generation !== fetchGeneration.current) return;
        applyDashboard(entry);
      })
      .catch((e) => {
        if (generation !== fetchGeneration.current) return;
        setError(e instanceof Error ? e.message : "Failed to load");
      })
      .finally(() => {
        if (generation === fetchGeneration.current) setIsRefreshing(false);
      });
  }

  const showOpsDashboard = role ? canReadLeads(role) : true;
  const periodShort =
    DASHBOARD_PERIODS.find((p) => p.value === period)?.short ?? "this month";

  const periodFilter = (
    <FilterDropdown
      aria-label="Period"
      value={period}
      options={DASHBOARD_PERIODS.map((p) => ({ value: p.value, label: p.label }))}
      onChange={handlePeriodChange}
    />
  );

  const stageColumns: Column<{ stage: string; count: number }>[] = [
    {
      key: "stage",
      header: "Stage",
      render: (value) => (
        <StatusPill
          variant={leadStageToPillVariant(value as string)}
          label={LEAD_STAGE_LABELS[value as string] ?? (value as string)}
        />
      ),
    },
    {
      key: "count",
      header: "Leads",
      render: (value) => (
        <span className="font-semibold tabular-nums">{value as number}</span>
      ),
    },
  ];

  const leadColumns: Column<Lead>[] = [
    {
      key: "customerName",
      header: "Customer",
      render: (_, row) => {
        const name =
          row.customerName ||
          (row.customer
            ? `${row.customer.firstName} ${row.customer.lastName}`.trim()
            : "—");
        return (
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--color-primary)/10 text-[11px] font-semibold text-(--color-primary)">
              {getInitials(name)}
            </span>
            <div className="min-w-0">
              <Link
                href={`/crm/leads/${row.id}`}
                onClick={(e) => e.stopPropagation()}
                className="block truncate font-medium text-(--color-primary) hover:underline"
              >
                {name}
              </Link>
              {row.createdAt && (
                <span className="text-xs text-(--color-tc-30)">
                  {formatDate(row.createdAt as unknown as string)}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "propertyAddress",
      header: "Property",
      render: (value) => (
        <span
          title={(value as string) || undefined}
          className="block max-w-[220px] truncate text-[#5C5C56]"
        >
          {(value as string) || "—"}
        </span>
      ),
    },
    {
      key: "source",
      header: "Source",
      render: (value) => (
        <span className="inline-flex items-center gap-1.5 text-(--color-tc-30)">
          <SourceIcon source={value as string} />
          {prettifySource(value as string)}
        </span>
      ),
    },
    {
      key: "stage",
      header: "Stage",
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <StatusPill
            variant={leadStageToPillVariant(row.stage)}
            label={LEAD_STAGE_LABELS[row.stage] ?? row.stage}
          />
          <span className="shrink-0 text-xs text-(--color-tc-30) tabular-nums">
            {formatTimeAgo(row.createdAt)}
          </span>
        </div>
      ),
    },
  ];

  const taskColumns: Column<DashboardTaskRow & Record<string, unknown>>[] = [
    {
      key: "title",
      header: "Task",
      render: (_, row) => (
        <Link
          href={`/crm/tasks?taskId=${row.id}`}
          onClick={(e) => e.stopPropagation()}
          className={`font-medium hover:underline ${
            row.status === "DONE" ? "text-(--color-tc-30) line-through" : "text-(--color-primary)"
          }`}
        >
          {row.title}
        </Link>
      ),
    },
    {
      key: "involvement",
      header: "Your role",
      render: (value) => (
        <span className="text-(--color-tc-30)">{value as string}</span>
      ),
    },
    {
      key: "assignee",
      header: "Assignee",
      render: (_, row) => (
        <span className="text-(--color-tc-30)">{row.assignee?.fullName ?? "Unassigned"}</span>
      ),
    },
    {
      key: "dueAt",
      header: "Due",
      render: (value) => (
        <span className="text-(--color-tc-30)">{formatDueDate(value as string | null)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value) => (
        <StatusPill
          variant={taskStatusToPillVariant(value as TaskStatus)}
          label={TASK_STATUS_LABELS[value as string] ?? (value as string)}
        />
      ),
    },
  ];

  const myTasks = useMemo(
    () => mergeMyTasks(assignedTasks, createdTasks),
    [assignedTasks, createdTasks]
  );

  if (error) {
    return (
      <CrmPageContent>
        <p className="text-red-600">{error}</p>
        <p className="mt-2 text-sm text-(--color-tc-30)">
          Ensure NEXT_PUBLIC_CRM_API_URL points to your Railway API and Supabase
          is configured.
        </p>
      </CrmPageContent>
    );
  }

  if (isLoading) {
    return (
      <CrmPageContent>
        <LoadingSpinner />
      </CrmPageContent>
    );
  }

  const stageRows =
    data?.leadsByStage?.map((row) => ({
      stage: row.stage,
      count: row._count.id,
    })) ?? [];

  if (!showOpsDashboard) {
    return (
      <CrmPageContent>
        <CrmPageHeader
          title="Dashboard"
          subtitle="Your assigned work"
          actions={
            <PrimaryButton href={`${CRM_BASE_PATH}/jobs`}>View jobs</PrimaryButton>
          }
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <StatsCard
            title="Assigned jobs"
            value={myJobs.length}
            icon={<CheckCircle />}
            iconTint="primary"
            action={{ label: "View all", href: `${CRM_BASE_PATH}/jobs` }}
          />
          <StatsCard
            title="Open tasks"
            value={myTasks.filter((t) => t.status !== "DONE").length}
            icon={<Users />}
            iconTint="info"
            action={{ label: "View all", href: `${CRM_BASE_PATH}/tasks` }}
          />
        </div>

        <section>
          <Table
            title="Your jobs"
            columns={[
              {
                key: "jobNumber",
                header: "Job",
                render: (_, row) => (
                  <Link
                    href={`${CRM_BASE_PATH}/jobs/${(row as Job).id}`}
                    className="font-medium text-brand hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {(row as Job).jobNumber}
                  </Link>
                ),
              },
              {
                key: "propertyAddress",
                header: "Property",
                render: (value) => (
                  <span className="block max-w-[240px] truncate text-ink-muted">
                    {(value as string) || "—"}
                  </span>
                ),
              },
              {
                key: "stage",
                header: "Stage",
                render: (value) => (
                  <span className="text-sm text-ink">
                    {String(value).replace(/_/g, " ")}
                  </span>
                ),
              },
            ]}
            data={myJobs as (Job & Record<string, unknown>)[]}
            getRowKey={(row) => (row as Job).id}
            onRowClick={(row) => router.push(`${CRM_BASE_PATH}/jobs/${(row as Job).id}`)}
            emptyMessage="No jobs assigned to you"
            toolbarExtra={
              <Link
                href={`${CRM_BASE_PATH}/jobs`}
                className="text-sm font-medium text-brand hover:underline"
              >
                View all →
              </Link>
            }
          />
        </section>

        <section className="w-full max-w-2xl">
          <Table
            title="My tasks"
            columns={taskColumns}
            data={myTasks as (DashboardTaskRow & Record<string, unknown>)[]}
            getRowKey={(row) => row.id}
            onRowClick={(row) => router.push(`/crm/tasks?taskId=${row.id}`)}
            hideHeader
            compact
            emptyMessage="No tasks assigned to or created by you"
            toolbarExtra={
              <Link
                href="/crm/tasks"
                className="text-sm font-medium text-brand hover:underline"
              >
                View all →
              </Link>
            }
          />
        </section>
      </CrmPageContent>
    );
  }

  return (
    <CrmPageContent>
      <CrmPageHeader
        title="Dashboard"
        subtitle="Sales & operations overview"
        actions={
          <>
            {periodFilter}
            <PrimaryButton href="/crm/leads/new" className="h-10 px-5 py-2.5">
              New lead
            </PrimaryButton>
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Active leads"
          value={data?.activeLeads ?? 0}
          icon={<Users />}
          iconTint="primary"
          subtitle={data ? `+${data.leadsLast30d} ${periodShort}` : undefined}
          action={{ label: "View all", href: "/crm/leads" }}
        />
        <StatsCard
          title={`Conversion · ${periodShort}`}
          value={data ? `${data.conversionRate30d}%` : "0%"}
          icon={<CheckCircle />}
          iconTint="success"
          subtitle={data ? `${data.convertedLast30d} converted` : undefined}
        />
        <StatsCard
          title="Avg time to pay"
          value={data ? `${data.avgTimeToPayDays}d` : "—"}
          icon={<TrendingUp />}
          iconTint="info"
          subtitle="From paid jobs"
        />
        {data?.totalAcquisitionCost30d !== undefined && (
          <StatsCard
            title={`Lead cost · ${periodShort}`}
            value={`£${data.totalAcquisitionCost30d.toFixed(0)}`}
            icon={<Tag />}
            iconTint="warning"
            subtitle={
              data.costPerConversion30d
                ? `£${data.costPerConversion30d} per conversion`
                : undefined
            }
          />
        )}
        {data?.revenueLast30d !== undefined && (
          <StatsCard
            title={`Revenue · ${periodShort}`}
            value={`£${data.revenueLast30d.toFixed(0)}`}
            icon={<TrendingUp />}
            iconTint="success"
            subtitle={data.roi30d ? `${data.roi30d}× on lead spend` : undefined}
          />
        )}
      </div>

      <Table
        title={`Funnel by source · ${periodShort}`}
        columns={[
          {
            key: "source",
            header: "Source",
            render: (v) => (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink">
                <SourceIcon source={v as string} />
                {prettifySource(v as string)}
              </span>
            ),
          },
          {
            key: "leads",
            header: "Leads",
            align: "right",
            render: (v) => (
              <span className="text-sm font-medium text-ink tabular-nums">{v as number}</span>
            ),
          },
          {
            key: "converted",
            header: "Won",
            align: "right",
            render: (v) => (
              <span className="text-sm font-medium text-ink tabular-nums">{v as number}</span>
            ),
          },
          {
            key: "conversionRate",
            header: "Conv %",
            align: "right",
            render: (v) => (
              <span className="text-sm font-medium text-ink tabular-nums">{v as number}%</span>
            ),
          },
          {
            key: "acquisitionCost",
            header: "Lead cost",
            align: "right",
            render: (v) => (
              <span className="text-sm font-medium text-ink tabular-nums">
                £{(v as number).toFixed(0)}
              </span>
            ),
          },
        ]}
        data={(data?.funnelBySource ?? []) as unknown as Record<string, unknown>[]}
        emptyMessage="No leads in this period"
      />

      <Table
        title={`Job touchpoints (RICS) · ${periodShort}`}
        columns={[
          {
            key: "stage",
            header: "Stage",
            render: (v) => (
              <span className="text-sm text-ink">{(v as string).replace(/_/g, " ")}</span>
            ),
          },
          {
            key: "count",
            header: "Jobs",
            align: "right",
            render: (v) => (
              <span className="text-sm font-medium text-ink tabular-nums">{v as number}</span>
            ),
          },
        ]}
        data={(data?.jobsByStage ?? []).map((row) => ({
          stage: row.stage,
          count: row._count.id,
        }))}
        emptyMessage="No jobs in this period"
      />

      <Table
        title={`Leads by stage · ${periodShort}`}
        columns={stageColumns}
        data={stageRows}
        getRowKey={(row) => row.stage}
        emptyMessage="No leads in this period"
      />

      <section>
        <Table<Lead & Record<string, unknown>>
          title={`Recent leads · ${periodShort}`}
          columns={leadColumns}
          data={recentLeads as (Lead & Record<string, unknown>)[]}
          getRowKey={(row) => row.id}
          onRowClick={(row) => router.push(`/crm/leads/${row.id}`)}
          emptyMessage="No leads in this period"
          toolbarExtra={
            <Link
              href="/crm/leads"
              className="text-sm font-medium text-brand hover:underline"
            >
              View all →
            </Link>
          }
        />
      </section>

      <section className="w-full max-w-2xl">
        {myTasks.length > 0 ? (
          <Table
            title="My tasks"
            columns={taskColumns}
            data={myTasks as (DashboardTaskRow & Record<string, unknown>)[]}
            getRowKey={(row) => row.id}
            onRowClick={(row) => router.push(`/crm/tasks?taskId=${row.id}`)}
            hideHeader
            compact
            toolbarExtra={
              <Link
                href="/crm/tasks"
                className="text-sm font-medium text-brand hover:underline"
              >
                View all →
              </Link>
            }
          />
        ) : (
          <Table
            title="My tasks"
            columns={taskColumns}
            data={[]}
            hideHeader
            compact
            emptyMessage="No tasks assigned to or created by you"
            toolbarExtra={
              <Link
                href="/crm/tasks"
                className="text-sm font-medium text-brand hover:underline"
              >
                View all →
              </Link>
            }
          />
        )}
      </section>
      </div>
    </CrmPageContent>
  );
}
