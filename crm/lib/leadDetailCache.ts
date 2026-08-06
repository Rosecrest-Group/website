import { api } from "@/crm/lib/api";
import type { LeadDetail } from "@/crm/types";

const cache = new Map<string, LeadDetail>();
const inflight = new Map<string, Promise<LeadDetail>>();

export function getCachedLead(id: string): LeadDetail | null {
  return cache.get(id) ?? null;
}

export function setCachedLead(id: string, lead: LeadDetail) {
  cache.set(id, lead);
}

export function clearCachedLead(id: string) {
  cache.delete(id);
  inflight.delete(id);
}

export function prefetchLead(id: string): Promise<LeadDetail | null> {
  const cached = cache.get(id);
  if (cached) return Promise.resolve(cached);

  const existing = inflight.get(id);
  if (existing) return existing.catch(() => null);

  const promise = api
    .getLead(id)
    .then((lead) => {
      cache.set(id, lead);
      return lead;
    })
    .finally(() => {
      inflight.delete(id);
    });

  inflight.set(id, promise);
  return promise.catch(() => null);
}
