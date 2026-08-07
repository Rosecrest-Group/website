"use client";

import { useCallback, useSyncExternalStore } from "react";
import { api } from "@/crm/lib/api";
import type { UserNotificationItem } from "@/crm/types";

const POLL_MS = 20_000;
const PREVIEW_LIMIT = 8;

type Snapshot = {
  unreadCount: number;
  items: UserNotificationItem[];
};

let snapshot: Snapshot = { unreadCount: 0, items: [] };
const listeners = new Set<() => void>();
let subscriberCount = 0;
let intervalId: number | null = null;
let inflight: Promise<void> | null = null;

function emit() {
  listeners.forEach((listener) => listener());
}

function setSnapshot(next: Snapshot) {
  snapshot = next;
  emit();
}

async function pollUnreadCount() {
  if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const r = await api.getUnreadNotificationCount();
      if (r.unreadCount !== snapshot.unreadCount) {
        setSnapshot({ ...snapshot, unreadCount: r.unreadCount });
      }
    } catch {
      // ignore transient errors
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

async function refreshPreview() {
  if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
  try {
    const r = await api.listNotifications(true);
    setSnapshot({
      unreadCount: r.unreadCount,
      items: r.items.slice(0, PREVIEW_LIMIT),
    });
  } catch {
    // ignore
  }
}

function onVisibility() {
  if (document.visibilityState === "visible") void pollUnreadCount();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  subscriberCount += 1;
  if (subscriberCount === 1) {
    void pollUnreadCount();
    intervalId = window.setInterval(() => {
      void pollUnreadCount();
    }, POLL_MS);
    document.addEventListener("visibilitychange", onVisibility);
  }
  return () => {
    listeners.delete(listener);
    subscriberCount -= 1;
    if (subscriberCount === 0) {
      if (intervalId != null) window.clearInterval(intervalId);
      intervalId = null;
      document.removeEventListener("visibilitychange", onVisibility);
    }
  };
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot(): Snapshot {
  return { unreadCount: 0, items: [] };
}

export function useNotificationCount() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setItems = useCallback(
    (updater: UserNotificationItem[] | ((prev: UserNotificationItem[]) => UserNotificationItem[])) => {
      const prev = snapshot.items;
      const nextItems = typeof updater === "function" ? updater(prev) : updater;
      const removed = Math.max(0, prev.length - nextItems.length);
      setSnapshot({
        unreadCount: Math.max(0, snapshot.unreadCount - removed),
        items: nextItems,
      });
    },
    [],
  );

  const refresh = useCallback(async () => {
    await refreshPreview();
  }, []);

  return {
    unreadCount: state.unreadCount,
    items: state.items,
    setItems,
    refresh,
  };
}
