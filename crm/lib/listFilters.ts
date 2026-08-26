export type ListFilterValues = Record<string, string>;

export type ListFilterAllow<T extends ListFilterValues> = {
  [K in keyof T]?: readonly string[];
};

const LAST_USER_KEY = "crm.list-filters.lastUserId";
const SCHEMA_VERSION = 1;

function pageUserKey(pageKey: string, userId: string) {
  return `crm.list-filters.${pageKey}:${userId}`;
}

function readRaw(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeRaw(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode / quota */
  }
}

export function readLastUserId(): string | null {
  const id = readRaw(LAST_USER_KEY);
  return id || null;
}

export function writeLastUserId(userId: string) {
  if (!userId) return;
  writeRaw(LAST_USER_KEY, userId);
}

export function sanitizeListFilters<T extends ListFilterValues>(
  raw: unknown,
  keys: readonly (keyof T & string)[],
  defaults: T,
  allow?: ListFilterAllow<T>,
): T {
  const out = { ...defaults };
  if (!raw || typeof raw !== "object") return out;
  const record = raw as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value !== "string") continue;
    if (value === "") {
      out[key] = "" as T[typeof key];
      continue;
    }
    const allowed = allow?.[key];
    if (allowed && !allowed.includes(value)) continue;
    out[key] = value as T[typeof key];
  }
  return out;
}

export function readListFilters<T extends ListFilterValues>(
  pageKey: string,
  userId: string,
  keys: readonly (keyof T & string)[],
  defaults: T,
  allow?: ListFilterAllow<T>,
): T {
  const raw = readRaw(pageUserKey(pageKey, userId));
  if (!raw) return { ...defaults };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || (parsed as { v?: unknown }).v !== SCHEMA_VERSION) {
      return { ...defaults };
    }
    return sanitizeListFilters(parsed, keys, defaults, allow);
  } catch {
    return { ...defaults };
  }
}

export function writeListFilters<T extends ListFilterValues>(
  pageKey: string,
  userId: string,
  keys: readonly (keyof T & string)[],
  filters: T,
) {
  if (!userId) return;
  const blob: Record<string, string | number> = { v: SCHEMA_VERSION };
  for (const key of keys) blob[key] = filters[key] ?? "";
  writeRaw(pageUserKey(pageKey, userId), JSON.stringify(blob));
  writeLastUserId(userId);
}

export function listFiltersFromSearchParams<T extends ListFilterValues>(
  searchParams: { get: (key: string) => string | null },
  keys: readonly (keyof T & string)[],
  defaults: T,
  allow?: ListFilterAllow<T>,
): T {
  const raw: Record<string, string> = {};
  for (const key of keys) raw[key] = searchParams.get(key) ?? "";
  return sanitizeListFilters(raw, keys, defaults, allow);
}

export function listFiltersAreExplicit<T extends ListFilterValues>(filters: T): boolean {
  return Object.values(filters).some(Boolean);
}

export function listFiltersHref<T extends ListFilterValues>(pathname: string, filters: T): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export function storedListFiltersHref<T extends ListFilterValues>(
  pageKey: string,
  pathname: string,
  keys: readonly (keyof T & string)[],
  defaults: T,
  allow?: ListFilterAllow<T>,
): string {
  const userId = resolveListFilterUserId(null);
  const stored = userId
    ? readListFilters(pageKey, userId, keys, defaults, allow)
    : { ...defaults };
  return listFiltersHref(pathname, stored);
}

export function resolveListFilterUserId(cachedUserId: string | null | undefined): string | null {
  return cachedUserId || readLastUserId();
}
