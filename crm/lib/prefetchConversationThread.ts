import { fetchLatestConversationMessages } from "@/crm/lib/conversationMessages";
import {
  getCachedConversationThread,
  setCachedConversationThread,
} from "@/crm/lib/conversationMessageCache";

const inflight = new Map<string, Promise<void>>();

export function prefetchConversationThread(conversationId: string) {
  if (getCachedConversationThread(conversationId)) return;
  if (inflight.has(conversationId)) return;

  const promise = fetchLatestConversationMessages(conversationId)
    .then((r) => {
      if (getCachedConversationThread(conversationId)) return;
      setCachedConversationThread(conversationId, {
        messages: r.items,
        pinned: [],
        page: r.lastPage,
        hasMore: r.hasOlder,
      });
    })
    .catch(() => {})
    .finally(() => {
      inflight.delete(conversationId);
    });

  inflight.set(conversationId, promise);
}
