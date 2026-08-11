import { api } from "@/crm/lib/api";
import type { InternalConversationSummary, InternalMessageItem } from "@/crm/types";
import {
  getCachedConversationThread,
  setCachedConversationThread,
} from "@/crm/lib/conversationMessageCache";
import { fetchLatestConversationMessages } from "@/crm/lib/conversationMessages";

const threadCache = new Map<string, InternalConversationSummary>();

function cacheKey(leadId?: string, jobId?: string) {
  return leadId ? `lead:${leadId}` : jobId ? `job:${jobId}` : "";
}

/** Get or create the lead/job RECORD_THREAD and return its summary. */
export async function ensureRecordThread(params: {
  leadId?: string;
  jobId?: string;
}): Promise<InternalConversationSummary> {
  const key = cacheKey(params.leadId, params.jobId);
  const cached = key ? threadCache.get(key) : undefined;
  if (cached) return cached;

  const list = await api.listConversations({
    ...(params.leadId ? { leadId: params.leadId } : {}),
    ...(params.jobId ? { jobId: params.jobId } : {}),
    kind: "RECORD_THREAD",
  });

  let thread = list.items[0] ?? null;
  if (!thread) {
    thread = await api.createConversation({
      kind: "RECORD_THREAD",
      leadId: params.leadId,
      jobId: params.jobId,
    });
  }

  if (key) threadCache.set(key, thread);
  return thread;
}

export function peekRecordThread(params: { leadId?: string; jobId?: string }) {
  const key = cacheKey(params.leadId, params.jobId);
  return key ? threadCache.get(key) ?? null : null;
}

export function cacheRecordThread(
  params: { leadId?: string; jobId?: string },
  thread: InternalConversationSummary
) {
  const key = cacheKey(params.leadId, params.jobId);
  if (key) threadCache.set(key, thread);
}

/** Load latest internal notes for a lead RECORD_THREAD (creates thread if needed). */
export async function fetchLeadThreadNotes(leadId: string): Promise<{
  conversationId: string;
  notes: InternalMessageItem[];
}> {
  const thread = await ensureRecordThread({ leadId });
  const cached = getCachedConversationThread(thread.id);
  if (cached?.messages?.length) {
    return { conversationId: thread.id, notes: cached.messages };
  }

  const page = await fetchLatestConversationMessages(thread.id);
  setCachedConversationThread(thread.id, {
    messages: page.items,
    pinned: [],
    page: page.lastPage,
    hasMore: page.hasOlder,
  });
  return { conversationId: thread.id, notes: page.items };
}
