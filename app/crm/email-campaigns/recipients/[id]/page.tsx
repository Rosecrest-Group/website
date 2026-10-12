import RecipientConversation from "@/crm/components/email-campaigns/RecipientConversation";

export default async function CampaignRecipientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RecipientConversation recipientId={id} />;
}
