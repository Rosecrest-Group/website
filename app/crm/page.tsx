import CrmDashboard from "@/crm/components/CrmDashboard";
import { canReadLeads } from "@/crm/lib/rbac";
import { getServerCrmUser, serverCrmFetch } from "@/crm/lib/serverCrmApi";
import type { DashboardMyTasks, DashboardSales, Job, Paginated } from "@/crm/types";

export default async function CrmPage() {
  const me = await getServerCrmUser();
  const readsLeads = me ? canReadLeads(me.role) : false;

  const [dashboard, tasks, jobs] = await Promise.all([
    readsLeads
      ? serverCrmFetch<DashboardSales>("/dashboards/sales?period=this_month")
      : Promise.resolve(null),
    serverCrmFetch<DashboardMyTasks>("/tasks/mine"),
    !readsLeads
      ? serverCrmFetch<Paginated<Job>>("/jobs?limit=8&page=1")
      : Promise.resolve(null),
  ]);

  return (
    <CrmDashboard
      initialMe={me}
      initialDashboard={dashboard}
      initialTasks={tasks}
      initialJobs={jobs?.items ?? null}
    />
  );
}
