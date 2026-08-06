import LeadsList from "@/crm/components/LeadsList";
import { serverCrmFetch } from "@/crm/lib/serverCrmApi";
import type { Lead, Paginated } from "@/crm/types";

export default async function LeadsPage() {
  const initialData = await serverCrmFetch<
    Paginated<Lead> & { stageLabels?: Record<string, string> }
  >("/leads?page=1&limit=10");

  return <LeadsList initialData={initialData} />;
}
