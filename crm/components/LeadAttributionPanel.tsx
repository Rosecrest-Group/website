"use client";

import type { ReactNode } from "react";
import type { LeadDetail } from "@/crm/types";
import CrmPanel from "@/crm/components/ui/CrmPanel";
import { LEAD_SOURCES } from "@/crm/lib/constants";
import { channelLabel, urlHost, urlPath } from "@/crm/lib/attribution";

const LEAD_PROVIDER_SOURCES = new Set(["PINLOCAL", "COMPARE_MY_MOVE", "REALLYMOVING", "GET_A_SURVEYOR", "THIRD_PARTY"]);
const WEBSITE_SOURCES = new Set(["WEBSITE", "WEBSITE_CONTACT_FORM", "PARTY_WALL_TOOL"]);

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="shrink-0 text-ink-muted">{label}</span>
      <span className="min-w-0 truncate text-right font-medium text-ink">{children}</span>
    </div>
  );
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" title={href} className="hover:text-brand hover:underline">
      {children}
    </a>
  );
}

export function noJourneyText(source: string): string {
  const sourceLabel = LEAD_SOURCES.find((item) => item.value === source)?.label ?? source;
  if (LEAD_PROVIDER_SOURCES.has(source)) {
    return `Came through a lead provider (${sourceLabel}), so there is no website journey.`;
  }
  if (WEBSITE_SOURCES.has(source)) return "No website journey was recorded for this enquiry.";
  return "This lead didn't come through a website form, so there is no website journey.";
}

export default function LeadAttributionPanel({
  lead,
  received,
  onViewJourney,
}: {
  lead: LeadDetail;
  received: string;
  onViewJourney?: () => void;
}) {
  const attribution = lead.attribution;
  const sourceLabel = LEAD_SOURCES.find((item) => item.value === lead.source)?.label ?? lead.source;
  const campaign = attribution
    ? [attribution.utm.source, attribution.utm.medium, attribution.utm.campaign].filter(Boolean).join(" / ")
    : "";
  const adClicks = attribution ? Object.keys(attribution.clickIds) : [];

  return (
    <CrmPanel title="How they found us">
      <div className="space-y-4 text-sm">
        {attribution ? (
          <div className="space-y-2">
            <p className="text-base font-medium text-ink">
              {channelLabel(attribution.channel, attribution.channelDetail)}
            </p>
            <Row label="Came from">
              {attribution.referrer ? (
                <ExternalLink href={attribution.referrer}>{urlHost(attribution.referrer)}</ExternalLink>
              ) : (
                "No referring site"
              )}
            </Row>
            {attribution.landingUrl ? (
              <Row label="Landed on">
                <ExternalLink href={attribution.landingUrl}>{urlPath(attribution.landingUrl)}</ExternalLink>
              </Row>
            ) : null}
            {attribution.formName ? (
              <Row label="Enquired via">
                {attribution.formPath ? `${attribution.formName} on ${attribution.formPath}` : attribution.formName}
              </Row>
            ) : null}
            <Row label="Pages viewed">{attribution.pageViews}</Row>
            {attribution.visitCount != null && attribution.visitCount > attribution.touchCount ? (
              <Row label="Visits">{attribution.visitCount}</Row>
            ) : null}
            {attribution.latestChannel &&
            (attribution.latestChannel !== attribution.channel ||
              (attribution.latestChannelDetail ?? null) !== (attribution.channelDetail ?? null)) ? (
              <Row label="Latest visit">
                {channelLabel(attribution.latestChannel, attribution.latestChannelDetail)}
              </Row>
            ) : null}
            {campaign ? <Row label="Campaign">{campaign}</Row> : null}
            {adClicks.length > 0 ? <Row label="Ad click">{adClicks.join(", ")}</Row> : null}
            {attribution.touchCount > 1 ? <Row label="Enquiries">{attribution.touchCount}</Row> : null}
          </div>
        ) : (
          <p className="text-ink-muted">{noJourneyText(lead.source)}</p>
        )}

        <div className="space-y-2 border-t border-line pt-4">
          <Row label="Source">{sourceLabel}</Row>
          <Row label="Source ref">{lead.sourceRef ?? "—"}</Row>
          <Row label="Received">{received}</Row>
        </div>

        {attribution && onViewJourney ? (
          <button
            type="button"
            onClick={onViewJourney}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-brand transition-colors hover:bg-brand-muted"
          >
            View full journey
          </button>
        ) : null}
      </div>
    </CrmPanel>
  );
}
