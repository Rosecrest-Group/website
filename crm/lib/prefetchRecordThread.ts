import { api } from "@/crm/lib/api";
import type { InternalConversationSummary } from "@/crm/types";
import { prefetchCurrentUser } from "@/crm/lib/currentUserCache";
import { prefetchConversationThread } from "@/crm/lib/prefetchConversationThread";

const recordThreadCache = new Map<string, InternalConversationSummary>();
const inflight = new Map<string, Promise<InternalConversationSummary | null>>();

function recordThreadKey(params: { leadId?: string; jobId?: string }) {
  return params.leadId ? `lead:${params.leadId}` : params.jobId ? `job:${params.jobId}` : "";
}

export function getCachedRecordThread(params: {
  leadId?: string;
  jobId?: string;
}): InternalConversationSummary | null {
  const key = recordThreadKey(params);
  return key ? (recordThreadCache.get(key) ?? null) : null;
}

export function cacheRecordThread(
  params: { leadId?: string; jobId?: string },
  thread: InternalConversationSummary
) {
  const key = recordThreadKey(params);
  if (key) recordThreadCache.set(key, thread);
}

export function prefetchRecordThread(params: { leadId?: string; jobId?: string }) {
  const key = recordThreadKey(params);
  if (!key) return Promise.resolve(null);
  
  const cached = recordThreadCache.get(key);
  if (cached) return Promise.resolve(cached);
  
  if (inflight.has(key)) return inflight.get(key)!;

  void prefetchCurrentUser();

  const promise = api
    .listConversations({
      ...(params.leadId ? { leadId: params.leadId } : {}),
      ...(params.jobId ? { jobId: params.jobId } : {}),
      kind: "RECORD_THREAD",
    })
    .then((list) => {
      const thread = list.items[0] ?? null;
      if (thread) {
        recordThreadCache.set(key, thread);
        prefetchConversationThread(thread.id);
      }
      return thread;
    })
    .catch(() => null)
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}

export function getInflightRecordThread(params: {
  leadId?: string;
  jobId?: string;
}): Promise<InternalConversationSummary | null> | null {
  const key = recordThreadKey(params);
  return key ? (inflight.get(key) ?? null) : null;
}
