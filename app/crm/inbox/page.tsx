import InboxView from "@/crm/components/InboxView";
import { serverCrmFetch } from "@/crm/lib/serverCrmApi";
import type { InboxThread } from "@/crm/types";

export default async function InboxPage() {
  const initial = await serverCrmFetch<{
    items: InboxThread[];
    hasMore: boolean;
    nextCursor: string | null;
  }>("/messages/inbox?limit=10");

  return (
    <InboxView
      initialThreads={initial?.items ?? null}
      initialHasMore={initial?.hasMore ?? false}
      initialCursor={initial?.nextCursor ?? null}
    />
  );
}
