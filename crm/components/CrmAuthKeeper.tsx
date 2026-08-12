"use client";

import { useEffect } from "react";
import { refreshSession } from "@/crm/lib/api";

/** Periodically refreshes the HttpOnly API session cookie. */
export default function CrmAuthKeeper() {
  useEffect(() => {
    // Don't compete with the first page's data fetch — the session is still fresh
    // after login, and a refresh on every shell mount was adding a Supabase round-trip
    // before the dashboard could paint.
    const timeout = window.setTimeout(() => {
      void refreshSession();
    }, 12_000);

    const interval = window.setInterval(() => {
      void refreshSession();
    }, 10 * 60 * 1000);

    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, []);

  return null;
}
