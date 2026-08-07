"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { api } from "@/crm/lib/api";
import { CRM_BASE_PATH } from "@/crm/lib/constants";

const POLL_AWAY_MS = 15_000;
const POLL_ON_PAGE_MS = 8_000;

let unreadCount = 0;
const listeners = new Set<() => void>();
let subscriberCount = 0;
let intervalId: number | null = null;
let pollMs = POLL_AWAY_MS;
let inflight: Promise<void> | null = null;

function emit() {
  listeners.forEach((listener) => listener());
}

async function refresh() {
  if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const { unreadCount: count } = await api.getTeamChatUnreadCount();
      if (count !== unreadCount) {
        unreadCount = count;
        emit();
      }
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
  if (subscriberCount === 0) return;
  intervalId = window.setInterval(() => {
    void refresh();
  }, pollMs);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  subscriberCount += 1;
  if (subscriberCount === 1) {
    void refresh();
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

function onVisibility() {
  if (document.visibilityState === "visible") void refresh();
}

function getSnapshot() {
  return unreadCount;
}

function getServerSnapshot() {
  return 0;
}

export function useTeamChatUnreadCount() {
  const pathname = usePathname();
  const onTeamChatPage = pathname.startsWith(`${CRM_BASE_PATH}/conversations`);
  const count = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const next = onTeamChatPage ? POLL_ON_PAGE_MS : POLL_AWAY_MS;
    if (next === pollMs) return;
    pollMs = next;
    restartInterval();
  }, [onTeamChatPage]);

  return count;
}
