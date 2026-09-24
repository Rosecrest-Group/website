import CampaignEditor from "@/crm/components/email-campaigns/CampaignEditor";

export default async function CampaignEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CampaignEditor id={id} />;
}
