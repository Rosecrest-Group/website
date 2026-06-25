"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { api } from "@/crm/lib/api";
import { CRM_BASE_PATH } from "@/crm/lib/constants";

const POLL_AWAY_MS = 5000;
const POLL_ON_PAGE_MS = 3000;

export function useTeamChatUnreadCount() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const onTeamChatPage = pathname.startsWith(`${CRM_BASE_PATH}/conversations`);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const { unreadCount: count } = await api.getTeamChatUnreadCount();
        if (!cancelled) setUnreadCount(count);
      } catch {
        // ignore transient errors
      }
    };

    void refresh();
    const interval = window.setInterval(
      refresh,
      onTeamChatPage ? POLL_ON_PAGE_MS : POLL_AWAY_MS
    );

    const onVisible = () => void refresh();
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [onTeamChatPage]);

  return unreadCount;
}
