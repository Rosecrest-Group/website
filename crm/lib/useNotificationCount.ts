"use client";

import { useEffect, useState } from "react";
import { api } from "@/crm/lib/api";

const POLL_MS = 5000;

export function useNotificationCount() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const { unreadCount: count } = await api.getUnreadNotificationCount();
        if (!cancelled) setUnreadCount(count);
      } catch {
        // ignore
      }
    };

    void refresh();
    const interval = window.setInterval(refresh, POLL_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  return unreadCount;
}
