import { api } from "@/crm/lib/api";
import type { InternalConversationSummary } from "@/crm/types";
import {
  cacheRecordThread,
  getCachedRecordThread,
  prefetchRecordThread,
} from "@/crm/lib/prefetchRecordThread";

/** Get or create the lead/job RECORD_THREAD and return its summary. */
export async function ensureRecordThread(params: {
  leadId?: string;
  jobId?: string;
}): Promise<InternalConversationSummary> {
  const cached = getCachedRecordThread(params);
  if (cached) return cached;

  const listed = await prefetchRecordThread(params);
  if (listed) return listed;

  const thread = await api.createConversation({
    kind: "RECORD_THREAD",
    leadId: params.leadId,
    jobId: params.jobId,
  });
  cacheRecordThread(params, thread);
  return thread;
}

export function peekRecordThread(params: { leadId?: string; jobId?: string }) {
  return getCachedRecordThread(params);
}

export { cacheRecordThread };
