"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/crm/lib/api";
import type { UserNotificationItem } from "@/crm/types";

const POLL_MS = 5000;
const PREVIEW_LIMIT = 8;

export function useNotificationCount() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<UserNotificationItem[]>([]);

  const refresh = useCallback(async () => {
    if (document.visibilityState !== "visible") return;
    try {
      const r = await api.listNotifications(true);
      setUnreadCount(r.unreadCount);
      setItems(r.items.slice(0, PREVIEW_LIMIT));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (cancelled) return;
      await refresh();
    };

    void run();
    const interval = window.setInterval(run, POLL_MS);
    document.addEventListener("visibilitychange", run);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", run);
    };
  }, [refresh]);

  return { unreadCount, items, setItems, refresh };
}
