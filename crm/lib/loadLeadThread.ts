import { api } from "@/crm/lib/api";
import { prefetchLead } from "@/crm/lib/leadDetailCache";
import {
  MESSAGE_FIRST_PAGE_SIZE,
  prefetchLeadThread,
  type CachedLeadThread,
} from "@/crm/lib/leadMessageCache";
import { fetchLeadThreadNotes } from "@/crm/lib/recordThread";
import { filterLeadThreadActivities } from "@/crm/lib/threadActivities";

/** Messages + inline notes + thread activities for lead/inbox. */
export async function fetchLeadThreadPage(
  leadId: string,
  limit = MESSAGE_FIRST_PAGE_SIZE
) {
  const [page, lead, notesResult] = await Promise.all([
    api.listMessages({ leadId, limit: String(limit), page: "1" }),
    prefetchLead(leadId),
    fetchLeadThreadNotes(leadId).catch(() => ({
      conversationId: null as string | null,
      notes: [],
    })),
  ]);
  const hasMore = page.hasMore ?? page.page * page.limit < page.total;
  return {
    pageResult: page,
    messages: page.items,
    notes: notesResult.notes,
    conversationId: notesResult.conversationId,
    page: page.page,
    hasMore,
    activities: lead ? filterLeadThreadActivities(lead.activities) : [],
  };
}

/** Shared prefetch used by inbox hover/open and LeadMessageThread cold load. */
export function prefetchLeadThreadWithActivities(
  leadId: string,
  limit = MESSAGE_FIRST_PAGE_SIZE
): Promise<CachedLeadThread> {
  return prefetchLeadThread(leadId, () => fetchLeadThreadPage(leadId, limit));
}
