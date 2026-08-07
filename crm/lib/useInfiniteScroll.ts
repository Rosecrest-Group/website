"use client";

import { useEffect, type RefObject } from "react";

/** Fires `onLoadMore` when `sentinelRef` intersects inside `rootRef` (scroll container). */
export function useInfiniteScroll({
  rootRef,
  sentinelRef,
  enabled,
  onLoadMore,
}: {
  rootRef: RefObject<HTMLElement | null>;
  sentinelRef: RefObject<HTMLElement | null>;
  enabled: boolean;
  onLoadMore: () => void;
}) {
  useEffect(() => {
    const root = rootRef.current;
    const sentinel = sentinelRef.current;
    if (!enabled || !root || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoadMore();
      },
      { root, rootMargin: "120px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [enabled, onLoadMore, rootRef, sentinelRef]);
}
