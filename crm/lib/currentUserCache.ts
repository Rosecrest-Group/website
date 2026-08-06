import { api } from "@/crm/lib/api";
import type { UserRole } from "@/crm/types";

export type CachedCurrentUser = { id: string; fullName: string; role: UserRole };

let cached: CachedCurrentUser | null = null;
let inflight: Promise<CachedCurrentUser> | null = null;

export function getCachedCurrentUser(): CachedCurrentUser | null {
  return cached;
}

export function prefetchCurrentUser(): Promise<CachedCurrentUser | null> {
  if (cached) return Promise.resolve(cached);
  if (inflight) return inflight.catch(() => null);

  inflight = api
    .getMe()
    .then((me) => {
      cached = { id: me.id, fullName: me.fullName, role: me.role };
      return cached;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight.catch(() => null);
}

export function clearCurrentUserCache() {
  cached = null;
  inflight = null;
}
