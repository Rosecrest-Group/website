import type { AttributionChannel, ChannelFunnelRow } from "@/crm/types";

export const ATTRIBUTION_CHANNEL_LABELS: Record<ChannelFunnelRow["channel"], string> = {
  AI_ASSISTANT: "AI assistant",
  ORGANIC_SEARCH: "Organic search",
  PAID_SEARCH: "Paid search",
  ORGANIC_SOCIAL: "Organic social",
  PAID_SOCIAL: "Paid social",
  EMAIL: "Email",
  REFERRAL: "Referral",
  OTHER_CAMPAIGN: "Other campaign",
  DIRECT: "Direct",
  LEAD_PROVIDER: "Lead providers",
  NOT_TRACKED: "Not tracked",
};

/** Leads-list filter options. "NONE" is leads with no recorded website journey. */
export const ATTRIBUTION_CHANNEL_FILTER_OPTIONS: { value: AttributionChannel | "NONE"; label: string }[] = [
  { value: "AI_ASSISTANT", label: "AI assistant" },
  { value: "ORGANIC_SEARCH", label: "Organic search" },
  { value: "PAID_SEARCH", label: "Paid search" },
  { value: "ORGANIC_SOCIAL", label: "Organic social" },
  { value: "PAID_SOCIAL", label: "Paid social" },
  { value: "EMAIL", label: "Email" },
  { value: "REFERRAL", label: "Referral" },
  { value: "OTHER_CAMPAIGN", label: "Other campaign" },
  { value: "DIRECT", label: "Direct" },
  { value: "NONE", label: "No website journey" },
];

/** "AI assistant · ChatGPT", "Organic search · Google", "Direct". */
export function channelLabel(channel: ChannelFunnelRow["channel"], detail: string | null | undefined): string {
  const label = ATTRIBUTION_CHANNEL_LABELS[channel] ?? channel;
  return detail ? `${label} · ${detail}` : label;
}

/** Path and query of a site URL, or the input unchanged when it isn't a URL. */
export function urlPath(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
}

export function urlHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function formatJourneyTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
