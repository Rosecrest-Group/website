import JobDetail from "@/crm/components/JobDetail";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <JobDetail id={id} />;
}
