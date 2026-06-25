import WorkflowBuilder from "@/crm/components/WorkflowBuilder";

export default async function WorkflowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WorkflowBuilder id={id} />;
}
