import type { SalesIgniterMessage, SalesIgniterOpportunity } from "@/crm/types";

export function isOpportunityActivityMessage(message: SalesIgniterMessage): boolean {
  const type = String(message.messageType ?? message.type ?? "").toUpperCase();
  return type.includes("ACTIVITY_OPPORTUNITY");
}

export function extractOpportunityIdFromMessage(message: SalesIgniterMessage): string | undefined {
  const meta = message.meta;
  if (!meta) return undefined;

  const opportunity = meta.opportunity;
  const candidates = [
    meta.opportunityId,
    meta.opportunity_id,
    typeof opportunity === "object" && opportunity ? opportunity.id : undefined,
    typeof opportunity === "object" && opportunity ? opportunity.opportunityId : undefined,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return undefined;
}

export function pickOpportunityForMessage(
  opportunities: SalesIgniterOpportunity[],
  messageDate?: string
): SalesIgniterOpportunity | null {
  if (opportunities.length === 0) return null;
  if (opportunities.length === 1) return opportunities[0];

  if (!messageDate) {
    return [...opportunities].sort((a, b) => {
      const aTime = new Date(a.dateUpdated ?? a.dateAdded ?? 0).getTime();
      const bTime = new Date(b.dateUpdated ?? b.dateAdded ?? 0).getTime();
      return bTime - aTime;
    })[0];
  }

  const target = new Date(messageDate).getTime();
  return opportunities.reduce((best, opp) => {
    const oppTime = new Date(opp.dateUpdated ?? opp.dateAdded ?? 0).getTime();
    const bestTime = new Date(best.dateUpdated ?? best.dateAdded ?? 0).getTime();
    return Math.abs(oppTime - target) < Math.abs(bestTime - target) ? opp : best;
  });
}

export function formatOpportunityMoney(value?: number) {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);
}
