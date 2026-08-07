import type { ApiUser, UserRole } from "@/crm/types";

export type CachedCurrentUser = { id: string; fullName: string; role: UserRole };

let cached: ApiUser | null = null;
let inflight: Promise<ApiUser> | null = null;

function toCached(user: ApiUser): CachedCurrentUser {
  return { id: user.id, fullName: user.fullName, role: user.role };
}

/** Seed from SSR so the CRM shell skips a client /auth/me round-trip. */
export function seedCurrentUser(user: ApiUser) {
  cached = user;
}

export function getCachedApiUser(): ApiUser | null {
  return cached;
}

export function getCachedCurrentUser(): CachedCurrentUser | null {
  return cached ? toCached(cached) : null;
}

export function getOrFetchCurrentUser(
  fetcher: () => Promise<ApiUser>,
  force = false,
): Promise<ApiUser> {
  if (!force && cached) return Promise.resolve(cached);
  if (!force && inflight) return inflight;

  inflight = fetcher()
    .then((me) => {
      cached = me;
      return me;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

export function setCachedCurrentUser(user: ApiUser) {
  cached = user;
}

export function prefetchCurrentUser(): Promise<CachedCurrentUser | null> {
  if (cached) return Promise.resolve(toCached(cached));
  if (inflight) return inflight.then(toCached).catch(() => null);

  return import("@/crm/lib/api")
    .then(({ api }) => api.getMe())
    .then((me) => toCached(me))
    .catch(() => null);
}

export function clearCurrentUserCache() {
  cached = null;
  inflight = null;
}
