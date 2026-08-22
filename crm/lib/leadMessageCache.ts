import type { Activity, InternalMessageItem, Message } from "@/crm/types";

const MAX_CACHED_THREADS = 40;

/**
 * Size of the first page a thread loads. Prefetch and the thread's own load must agree
 * on this or they can't share an in-flight request.
 */
export const MESSAGE_FIRST_PAGE_SIZE = 20;

export type CachedLeadThread = {
  messages: Message[];
  notes: InternalMessageItem[];
  conversationId: string | null;
  activities: Activity[];
  page: number;
  hasMore: boolean;
  notesLoaded: boolean;
  fetchedAt: number;
};

const cache = new Map<string, CachedLeadThread>();
const inflight = new Map<string, Promise<CachedLeadThread>>();

export function getCachedLeadThread(leadId: string): CachedLeadThread | null {
  return cache.get(leadId) ?? null;
}

export function setCachedLeadThread(leadId: string, patch: Partial<CachedLeadThread>) {
  const existing = cache.get(leadId);
  const next: CachedLeadThread = {
    messages: patch.messages ?? existing?.messages ?? [],
    notes: patch.notes ?? existing?.notes ?? [],
    conversationId:
      patch.conversationId !== undefined
        ? patch.conversationId
        : (existing?.conversationId ?? null),
    activities: patch.activities ?? existing?.activities ?? [],
    page: patch.page ?? existing?.page ?? 1,
    hasMore: patch.hasMore ?? existing?.hasMore ?? false,
    notesLoaded:
      patch.notesLoaded !== undefined
        ? patch.notesLoaded
        : patch.notes !== undefined
          ? true
          : (existing?.notesLoaded ?? false),
    fetchedAt: Date.now(),
  };
  cache.set(leadId, next);

  if (cache.size > MAX_CACHED_THREADS) {
    let oldestId: string | null = null;
    let oldestAt = Infinity;
    for (const [id, entry] of cache) {
      if (entry.fetchedAt < oldestAt) {
        oldestAt = entry.fetchedAt;
        oldestId = id;
      }
    }
    if (oldestId) cache.delete(oldestId);
  }

  return next;
}

export function clearCachedLeadThread(leadId: string) {
  cache.delete(leadId);
  inflight.delete(leadId);
}

/** Prefetch / dedupe loads so hover + click share one request. */
export function prefetchLeadThread(
  leadId: string,
  loader: () => Promise<{
    messages: Message[];
    notes?: InternalMessageItem[];
    conversationId?: string | null;
    activities?: Activity[];
    page: number;
    hasMore: boolean;
  }>,
  opts?: { force?: boolean }
): Promise<CachedLeadThread> {
  const cached = cache.get(leadId);
  if (!opts?.force && cached?.notesLoaded) return Promise.resolve(cached);

  const existing = inflight.get(leadId);
  if (existing) return existing;

  const promise = loader()
    .then((result) =>
      setCachedLeadThread(leadId, {
        messages: result.messages,
        notes: result.notes ?? [],
        conversationId: result.conversationId ?? null,
        activities: result.activities ?? [],
        page: result.page,
        hasMore: result.hasMore,
        notesLoaded: true,
      })
    )
    .finally(() => {
      inflight.delete(leadId);
    });

  inflight.set(leadId, promise);
  return promise;
}
