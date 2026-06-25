"use client";

import { useEffect } from "react";
import { refreshSession } from "@/crm/lib/api";

/** Periodically refreshes the HttpOnly API session cookie. */
export default function CrmAuthKeeper() {
  useEffect(() => {
    void refreshSession();

    const interval = window.setInterval(() => {
      void refreshSession();
    }, 10 * 60 * 1000);

    return () => window.clearInterval(interval);
  }, []);

  return null;
}
