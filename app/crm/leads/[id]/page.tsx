import LeadDetail from "@/crm/components/LeadDetail";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LeadDetail id={id} />;
}
