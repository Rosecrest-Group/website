"use client";

import { useEffect } from "react";

const GTM_ID = "GTM-KWX4BX6S";

export default function GoogleTagManager() {
  useEffect(() => {
    const w = window as Window & { dataLayer?: Record<string, unknown>[] };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({
      "gtm.start": Date.now(),
      event: "gtm.js",
    });

    const firstScript = document.getElementsByTagName("script")[0];
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
    firstScript?.parentNode?.insertBefore(script, firstScript);
  }, []);

  return null;
}
