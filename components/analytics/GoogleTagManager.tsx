"use client";

import { useEffect } from "react";

const GTM_ID = "GTM-KWX4BX6S";

const AI_SOURCES: { name: string; pattern: RegExp }[] = [
  { name: "chatgpt", pattern: /(^|\.)(chatgpt\.com|chat\.openai\.com)$/ },
  { name: "perplexity", pattern: /(^|\.)perplexity\.ai$/ },
  { name: "copilot", pattern: /(^|\.)copilot\.microsoft\.com$/ },
  { name: "gemini", pattern: /(^|\.)gemini\.google\.com$/ },
  { name: "claude", pattern: /(^|\.)claude\.ai$/ },
  { name: "deepseek", pattern: /(^|\.)deepseek\.com$/ },
  { name: "grok", pattern: /(^|\.)grok\.com$/ },
  { name: "meta-ai", pattern: /(^|\.)meta\.ai$/ },
];

function aiReferral(): { ai_source: string; ai_referrer: string } | null {
  let referrerHost = "";
  try {
    referrerHost = document.referrer ? new URL(document.referrer).hostname.toLowerCase() : "";
  } catch {}
  const utmSource = (new URLSearchParams(window.location.search).get("utm_source") ?? "").toLowerCase();

  for (const candidate of [referrerHost, utmSource]) {
    const match = candidate && AI_SOURCES.find(({ pattern }) => pattern.test(candidate));
    if (match) return { ai_source: match.name, ai_referrer: candidate };
  }
  return null;
}

export default function GoogleTagManager() {
  useEffect(() => {
    const w = window as Window & { dataLayer?: Record<string, unknown>[] };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({
      "gtm.start": Date.now(),
      event: "gtm.js",
    });

    const referral = aiReferral();
    if (referral) {
      w.dataLayer.push({ event: "ai_referral", ...referral, landing_page: window.location.pathname });
    }

    const firstScript = document.getElementsByTagName("script")[0];
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
    firstScript?.parentNode?.insertBefore(script, firstScript);
  }, []);

  return null;
}
