"use client";

import { useCallback, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { api } from "@/crm/lib/api";
import { notificationHref, notificationTag } from "@/crm/lib/notificationLinks";
import type { UserNotificationItem } from "@/crm/types";

const POLL_VISIBLE_MS = 20_000;
/**
 * Backgrounded tabs keep polling — slower, but enough that a browser notification still
 * fires when web push isn't configured or the subscription has lapsed.
 */
const POLL_HIDDEN_MS = 60_000;
const PREVIEW_LIMIT = 8;

type Snapshot = {
  unreadCount: number;
  items: UserNotificationItem[];
};

let snapshot: Snapshot = { unreadCount: 0, items: [] };
const listeners = new Set<() => void>();
let subscriberCount = 0;
let intervalId: number | null = null;
let pollMs = POLL_VISIBLE_MS;
let inflight: Promise<void> | null = null;
/** id -> createdAt, so a notification that gets refreshed in place announces again. */
const announced = new Map<string, string>();
let announcementsPrimed = false;

function emit() {
  listeners.forEach((listener) => listener());
}

function setSnapshot(next: Snapshot) {
  snapshot = next;
  emit();
}

async function showBrowserNotification(item: UserNotificationItem) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const options = {
    body: item.body,
    tag: notificationTag(item),
    data: { url: notificationHref(item) },
    icon: "/favicon.ico",
  };

  try {
    const registration = await navigator.serviceWorker?.getRegistration();
    if (registration) {
      await registration.showNotification(item.title, options);
      return;
    }
    new Notification(item.title, options);
  } catch {
    // notifications are a nicety; never break the poll loop over them
  }
}

function announce(items: UserNotificationItem[]) {
  const fresh = items.filter((item) => announced.get(item.id) !== item.createdAt);
  for (const item of items) announced.set(item.id, item.createdAt);

  // First load just records what's already waiting — the badge covers the backlog.
  if (!announcementsPrimed) {
    announcementsPrimed = true;
    return;
  }
  if (fresh.length === 0) return;

  const visible = typeof document !== "undefined" && document.visibilityState === "visible";
  for (const item of fresh) {
    if (visible) {
      toast(item.title, {
        description: item.body,
        action: {
          label: "Open",
          onClick: () => window.location.assign(notificationHref(item)),
        },
      });
    } else {
      void showBrowserNotification(item);
    }
  }
}

/**
 * One request serves both the badge and the previews. Counting alone would miss a repeat
 * message on a thread that's already unread, which is exactly when an alert is useful.
 */
async function refreshPreview() {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const r = await api.listNotifications(true, PREVIEW_LIMIT);
      announce(r.items);
      setSnapshot({ unreadCount: r.unreadCount, items: r.items });
    } catch {
      // ignore transient errors
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

function restartInterval() {
  if (intervalId != null) window.clearInterval(intervalId);
  intervalId = null;
  if (subscriberCount === 0) return;
  intervalId = window.setInterval(() => {
    void refreshPreview();
  }, pollMs);
}

function onVisibility() {
  pollMs = document.visibilityState === "visible" ? POLL_VISIBLE_MS : POLL_HIDDEN_MS;
  restartInterval();
  if (document.visibilityState === "visible") void refreshPreview();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  subscriberCount += 1;
  if (subscriberCount === 1) {
    void refreshPreview();
    restartInterval();
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
