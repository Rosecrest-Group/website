import { api } from "@/crm/lib/api";
import {
  MESSAGE_FIRST_PAGE_SIZE,
  prefetchLeadThread,
  type CachedLeadThread,
} from "@/crm/lib/leadMessageCache";
import { setCachedConversationThread } from "@/crm/lib/conversationMessageCache";

function rememberNotesConversation(
  conversationId: string | null,
  notes: CachedLeadThread["notes"]
) {
  if (!conversationId) return;
  setCachedConversationThread(conversationId, {
    messages: notes,
    pinned: [],
    page: 1,
    hasMore: false,
  });
}

/** Messages + inline notes + thread activities for lead/inbox. */
export async function fetchLeadThreadPage(
  leadId: string,
  limit = MESSAGE_FIRST_PAGE_SIZE
) {
  const page = await api.getLeadThread(leadId, { limit });
  rememberNotesConversation(page.conversationId, page.notes);
  return {
    pageResult: {
      items: page.items,
      page: page.page,
      limit: page.limit,
      total: page.total,
      hasMore: page.hasMore,
    },
    messages: page.items,
    notes: page.notes,
    conversationId: page.conversationId,
    page: page.page,
    hasMore: page.hasMore,
    activities: page.activities,
  };
}

/** Shared prefetch used by inbox hover/open and LeadMessageThread cold load. */
export function prefetchLeadThreadWithActivities(
  leadId: string,
  limit = MESSAGE_FIRST_PAGE_SIZE,
  opts?: { force?: boolean }
): Promise<CachedLeadThread> {
  return prefetchLeadThread(leadId, () => fetchLeadThreadPage(leadId, limit), opts);
}
