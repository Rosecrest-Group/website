"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { recordClick, recordPageView } from "@/lib/attribution";
import { describeClick, type DescribedClick } from "@/lib/click-tracking";

/**
 * Hands the click to Google Tag Manager, so a GA4 tag can report it. `phone_call_click` is
 * separate so it can be marked as a GA4 key event.
 */
function pushToDataLayer(click: DescribedClick) {
  const w = window as Window & { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({
    event: click.kind === "call" ? "phone_call_click" : "site_click",
    click_kind: click.kind,
    click_label: click.label,
    click_section: click.section ?? undefined,
    click_url: click.kind === "call" || click.kind === "email" ? undefined : click.href ?? undefined,
    page_path: window.location.pathname,
  });
}

export default function AttributionTracker() {
  const pathname = usePathname();

  useEffect(() => {
    recordPageView();
  }, [pathname]);

  useEffect(() => {
    // Capture phase, so the click is recorded before the link navigates or a menu closes.
    const onClick = (event: MouseEvent) => {
      const click = describeClick(event.target);
      if (!click) return;
      recordClick(click);
      pushToDataLayer(click);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
