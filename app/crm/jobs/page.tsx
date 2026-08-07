import CrmJobsList from "@/crm/components/CrmJobsList";
import { serverCrmFetch } from "@/crm/lib/serverCrmApi";
import type { Job, Paginated } from "@/crm/types";

export default async function JobsPage() {
  const initialData = await serverCrmFetch<Paginated<Job>>("/jobs?page=1&limit=50");

  return <CrmJobsList initialData={initialData} />;
}
