import { api } from "@/crm/lib/api";
import { getListPageCache, setListPageCache } from "@/crm/lib/listPageCache";
import type { PipelineBoardResponse } from "@/crm/types";

function cacheKey(query: Record<string, string> = {}) {
  return `pipeline-board:${query.assignedTo ?? "all"}:${query.source ?? ""}:${query.slice ?? "all"}`;
}

export function getCachedLeadBoard(query: Record<string, string> = {}) {
  return getListPageCache<PipelineBoardResponse>(cacheKey(query));
}

export function setCachedLeadBoard(query: Record<string, string>, data: PipelineBoardResponse) {
  setListPageCache(cacheKey(query), data);
}

export function prefetchLeadBoard(query: Record<string, string> = {}) {
  const cached = getCachedLeadBoard(query);
  if (cached) return Promise.resolve(cached);
  return api.getLeadBoard(query).then((data) => {
    setCachedLeadBoard(query, data);
    return data;
  });
}
