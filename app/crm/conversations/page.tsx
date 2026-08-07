import ConversationsView from "@/crm/components/ConversationsView";
import { serverCrmFetch } from "@/crm/lib/serverCrmApi";
import type { InternalConversationSummary } from "@/crm/types";

export default async function ConversationsPage() {
  const initial = await serverCrmFetch<{ items: InternalConversationSummary[] }>(
    "/conversations",
  );

  return <ConversationsView initialThreads={initial?.items ?? null} />;
}
