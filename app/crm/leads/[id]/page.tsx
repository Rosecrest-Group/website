import LeadDetail from "@/crm/components/LeadDetail";
import type { ThreadPane } from "@/crm/components/ui/SlidingPaneTabs";

function parsePane(value: string | string[] | undefined): ThreadPane | undefined {
  const pane = Array.isArray(value) ? value[0] : value;
  if (pane === "internal" || pane === "activity" || pane === "messages") return pane;
  return undefined;
}

export default async function LeadDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pane?: string | string[] }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  return <LeadDetail id={id} initialPane={parsePane(query.pane)} />;
}
