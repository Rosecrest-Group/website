import type { InternalConversationSummary } from "@/crm/types";

let cachedList: InternalConversationSummary[] | null = null;
let cachedAt = 0;
let cachedUser: { id: string; fullName: string } | null = null;

const CACHE_TTL_MS = 5 * 60 * 1000;

export function getCachedConversationList(): InternalConversationSummary[] | null {
  if (!cachedList) return null;
  if (Date.now() - cachedAt > CACHE_TTL_MS) {
    cachedList = null;
    return null;
  }
  return cachedList;
}

export function setCachedConversationList(list: InternalConversationSummary[]) {
  cachedList = list;
  cachedAt = Date.now();
}

export function getCachedCurrentUser(): { id: string; fullName: string } | null {
  return cachedUser;
}

export function setCachedCurrentUser(user: { id: string; fullName: string }) {
  cachedUser = user;
}
