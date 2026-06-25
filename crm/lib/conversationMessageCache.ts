import type { InternalMessageItem } from "@/crm/types";

const MAX_CACHED_THREADS = 30;

export type CachedConversationThread = {
  messages: InternalMessageItem[];
  pinned: InternalMessageItem[];
  page: number;
  hasMore: boolean;
  fetchedAt: number;
};

const cache = new Map<string, CachedConversationThread>();

export function getCachedConversationThread(
  conversationId: string
): CachedConversationThread | null {
  return cache.get(conversationId) ?? null;
}

export function setCachedConversationThread(
  conversationId: string,
  patch: Partial<CachedConversationThread>
) {
  const existing = cache.get(conversationId);
  const next: CachedConversationThread = {
    messages: patch.messages ?? existing?.messages ?? [],
    pinned: patch.pinned ?? existing?.pinned ?? [],
    page: patch.page ?? existing?.page ?? 1,
    hasMore: patch.hasMore ?? existing?.hasMore ?? false,
    fetchedAt: Date.now(),
  };
  cache.set(conversationId, next);

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
}

export function clearCachedConversationThread(conversationId: string) {
  cache.delete(conversationId);
}
