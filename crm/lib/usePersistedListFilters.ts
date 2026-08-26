"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCachedCurrentUser, prefetchCurrentUser } from "@/crm/lib/currentUserCache";
import {
  listFiltersAreExplicit,
  listFiltersFromSearchParams,
  listFiltersHref,
  readLastUserId,
  readListFilters,
  resolveListFilterUserId,
  writeLastUserId,
  writeListFilters,
  type ListFilterAllow,
  type ListFilterValues,
} from "@/crm/lib/listFilters";

export type UsePersistedListFiltersOptions<T extends ListFilterValues> = {
  pageKey: string;
  pathname: string;
  keys: readonly (keyof T & string)[];
  defaults: T;
  allow?: ListFilterAllow<T>;
};

/**
 * URL is the live view. Last-used prefs fill in when the URL has no filter params.
 * Dropdown changes write storage; opening a shared link does not.
 */
export function usePersistedListFilters<T extends ListFilterValues>(
  options: UsePersistedListFiltersOptions<T>,
) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const routerRef = useRef(router);
  routerRef.current = router;
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const urlFilters = listFiltersFromSearchParams(
    searchParams,
    options.keys,
    options.defaults,
    options.allow,
  );
  const urlIsExplicit = listFiltersAreExplicit(urlFilters);
  const urlSignature = options.keys.map((key) => searchParams.get(key) ?? "").join("\0");

  const landedWithExplicitUrl = useRef(urlIsExplicit);
  const pendingWriteRef = useRef<T | null>(null);
  const filtersRef = useRef<T>(urlFilters);

  const [filters, setFiltersState] = useState<T>(urlFilters);
  const [filtersReady, setFiltersReady] = useState(urlIsExplicit);

  const applyFilters = useCallback((next: T) => {
    filtersRef.current = next;
    setFiltersState(next);
  }, []);

  const replaceUrl = useCallback((next: T) => {
    const { pathname } = optionsRef.current;
    const href = listFiltersHref(pathname, next);
    const qs = searchParamsRef.current.toString();
    const current = qs ? `${pathname}?${qs}` : pathname;
    if (href === current) return;
    routerRef.current.replace(href, { scroll: false });
  }, []);

  const persist = useCallback((next: T) => {
    const { pageKey, keys } = optionsRef.current;
    const userId = resolveListFilterUserId(getCachedCurrentUser()?.id);
    if (!userId) {
      pendingWriteRef.current = next;
      return;
    }
    pendingWriteRef.current = null;
    writeListFilters(pageKey, userId, keys, next);
  }, []);

  useEffect(() => {
    const { pageKey, keys, defaults, allow } = optionsRef.current;
    const fromUrl = listFiltersFromSearchParams(
      searchParamsRef.current,
      keys,
      defaults,
      allow,
    );

    if (listFiltersAreExplicit(fromUrl)) {
      applyFilters(fromUrl);
      setFiltersReady(true);
      return;
    }

    const userId = resolveListFilterUserId(getCachedCurrentUser()?.id);
    if (userId) writeLastUserId(userId);
    const stored = userId
      ? readListFilters(pageKey, userId, keys, defaults, allow)
      : { ...defaults };
    applyFilters(stored);
    setFiltersReady(true);
    replaceUrl(stored);
  }, [applyFilters, replaceUrl, urlSignature]);

  useEffect(() => {
    let cancelled = false;
    void prefetchCurrentUser().then((user) => {
      if (cancelled || !user) return;

      const { pageKey, keys, defaults, allow } = optionsRef.current;
      const previousLast = readLastUserId();
      writeLastUserId(user.id);

      if (pendingWriteRef.current) {
        writeListFilters(pageKey, user.id, keys, pendingWriteRef.current);
        pendingWriteRef.current = null;
        return;
      }

      if (landedWithExplicitUrl.current) return;
      if (previousLast === user.id) return;

      const theirs = readListFilters(pageKey, user.id, keys, defaults, allow);
      applyFilters(theirs);
      replaceUrl(theirs);
    });
    return () => {
      cancelled = true;
    };
  }, [applyFilters, replaceUrl]);

  const setFilters = useCallback(
    (patch: Partial<T>) => {
      const next = { ...filtersRef.current, ...patch };
      applyFilters(next);
      persist(next);
      replaceUrl(next);
    },
    [applyFilters, persist, replaceUrl],
  );

  const setFilter = useCallback(
    (key: keyof T & string, value: string) => {
      setFilters({ [key]: value } as Partial<T>);
    },
    [setFilters],
  );

  return { filters, setFilter, setFilters, filtersReady };
}
