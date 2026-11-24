"use client";

import type { ReactNode } from "react";
import type { AttributionClick, AttributionTouch, AttributionVisit, LeadDetail } from "@/crm/types";
import { cn } from "@/lib/utils";
import { noJourneyText } from "@/crm/components/LeadAttributionPanel";
import { channelLabel, formatJourneyTime, urlHost, urlPath } from "@/crm/lib/attribution";

function siteOrigin(landingUrl: string): string {
  try {
    return new URL(landingUrl).origin;
  } catch {
    return "";
  }
}

function journeyTime(iso: string | null | undefined): string | undefined {
  if (!iso || Number.isNaN(Date.parse(iso))) return undefined;
  return formatJourneyTime(iso);
}

/** Older enquiries have no visit list and are one visit. An empty list is a repeat form with no new pages. */
function visitRecords(touch: AttributionTouch): AttributionVisit[] {
  if (Array.isArray(touch.visits)) return touch.visits;
  return [{
    channel: touch.channel,
    channelDetail: touch.channelDetail,
    referrer: touch.referrer,
    landingUrl: touch.landingUrl,
    startedAt: touch.firstSeenAt,
    utm: touch.utm,
    pages: touch.pages ?? [],
  }];
}

function Step({ title, time, children, accent = false }: {
  title: ReactNode;
  time?: string;
  children?: ReactNode;
  accent?: boolean;
}) {
  return (
    <li className="relative pl-6">
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-1.5 size-2.5 rounded-full border-2 border-white ring-1",
          accent ? "bg-brand ring-brand" : "bg-line ring-line"
        )}
      />
      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 text-sm font-medium text-ink">{title}</p>
        {time ? <span className="shrink-0 text-xs text-ink-muted">{time}</span> : null}
      </div>
      {children ? <div className="mt-0.5 text-xs text-ink-muted">{children}</div> : null}
    </li>
  );
}

function PageLink({ origin, path }: { origin: string; path: string }) {
  return (
    <a
      href={`${origin}${path}`}
      target="_blank"
      rel="noopener noreferrer"
      className="break-all hover:text-brand hover:underline"
    >
      {path}
    </a>
  );
}

type JourneyEvent =
  | { type: "page"; page: AttributionVisit["pages"][number]; first: boolean }
  | { type: "click"; click: AttributionClick };

/** Pages and clicks in the order they happened. A page with no time stays where it is. */
function journeyEvents(pages: AttributionVisit["pages"], clicks: AttributionClick[]): JourneyEvent[] {
  const events: JourneyEvent[] = pages.map((page, i) => ({ type: "page", page, first: i === 0 }));
  for (const click of clicks) {
    const at = Date.parse(click.at);
    let index = events.length;
    for (let i = 0; i < events.length; i += 1) {
      const event = events[i];
      const eventAt = Date.parse(event.type === "page" ? event.page.at : event.click.at);
      if (Number.isFinite(eventAt) && Number.isFinite(at) && eventAt > at) {
        index = i;
        break;
      }
    }
    events.splice(index, 0, { type: "click", click });
  }
  return events;
}

function clickTitle(click: AttributionClick): string {
  if (click.kind === "call") return `Pressed phone number “${click.label}”`;
  if (click.kind === "email") return `Pressed email “${click.label}”`;
  if (click.kind === "button") return `Pressed “${click.label}”`;
  if (click.href && !click.href.startsWith("/")) return `Clicked “${click.label}” to ${urlHost(click.href)}`;
  return `Clicked “${click.label}”`;
}

function secondsText(seconds: number): string {
  const s = Math.max(0, seconds);
  if (s < 60) return `${s} second${s === 1 ? "" : "s"}`;
  const m = Math.round(s / 60);
  return `${m} minute${m === 1 ? "" : "s"}`;
}

function VisitBlock({
  visit,
  form,
  call,
  solo,
}: {
  visit: AttributionVisit;
  form?: AttributionTouch["form"];
  call?: AttributionTouch["call"];
  solo: boolean;
}) {
  const origin = siteOrigin(visit.landingUrl);
  const campaign = [visit.utm?.source, visit.utm?.medium, visit.utm?.campaign].filter(Boolean).join(" / ");
  const pages = visit.pages.length > 0 ? visit.pages : [{ path: urlPath(visit.landingUrl), title: "", at: "" }];
  const headingTime = solo ? journeyTime(form?.submittedAt) : journeyTime(visit.startedAt);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-medium text-ink">{channelLabel(visit.channel, visit.channelDetail)}</h3>
        {headingTime ? <span className="text-xs text-ink-muted">{headingTime}</span> : null}
      </div>
      <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[4px] before:top-2 before:w-px before:bg-line">
        <Step
          accent
          title={
            visit.referrer ? (
              <>
                Came from{" "}
                <a
                  href={visit.referrer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand hover:underline"
                >
                  {urlHost(visit.referrer)}
                </a>
              </>
            ) : (
              "Arrived with no referring site"
            )
          }
          time={journeyTime(visit.startedAt)}
        >
          {campaign ? `Campaign: ${campaign}` : null}
        </Step>
        {journeyEvents(pages, visit.clicks ?? []).map((event, i) =>
          event.type === "page" ? (
            <Step
              key={`page-${event.page.path}-${i}`}
              title={event.first ? "Landed on" : "Viewed"}
              time={journeyTime(event.page.at)}
            >
              <PageLink origin={origin} path={event.page.path} />
              {event.page.title ? <span className="block text-ink-muted">{event.page.title}</span> : null}
            </Step>
          ) : (
            <Step
              key={`click-${event.click.at}-${i}`}
              title={<span className="font-normal">{clickTitle(event.click)}</span>}
              time={journeyTime(event.click.at)}
            >
              {event.click.section ? `${event.click.section} · ` : ""}
              {event.click.path}
            </Step>
          )
        )}
        {form ? (
          <Step
            accent
            title={call ? "Phoned us" : `Submitted ${form.name}`}
            time={journeyTime(call?.startedAt ?? form.submittedAt)}
          >
            {call ? (
              <>
                {secondsText(call.secondsAfterClick)} after pressing “{form.trigger?.label ?? "the phone number"}” on{" "}
                <PageLink origin={origin} path={form.path} /> (matched by time)
              </>
            ) : (
              <>
                on <PageLink origin={origin} path={form.path} />
                {form.trigger ? <span className="block">after clicking “{form.trigger.label}”</span> : null}
              </>
            )}
          </Step>
        ) : null}
      </ol>
    </div>
  );
}

export default function LeadJourney({ lead, className }: { lead: LeadDetail; className?: string }) {
  const touches = lead.attribution?.touches ?? [];

  return (
    <div className={cn("min-h-0 overflow-y-auto p-4 sm:p-5", className)}>
      {touches.length === 0 ? (
        <p className="text-sm text-ink-muted">{noJourneyText(lead.source)}</p>
      ) : (
        <div className="space-y-8">
          {touches.map((touch, index) => {
            const visits = visitRecords(touch);
            const solo = touches.length === 1 && visits.length === 1;
            return (
              <section key={touch.receivedAt} className="space-y-6">
                {touches.length > 1 ? (
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-base font-medium text-ink">Enquiry {index + 1}</h3>
                    {journeyTime(touch.form.submittedAt) ? (
                      <span className="text-xs text-ink-muted">{journeyTime(touch.form.submittedAt)}</span>
                    ) : null}
                  </div>
                ) : null}
                {visits.length === 0 ? (
                  <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[4px] before:top-2 before:w-px before:bg-line">
                    <Step accent title={`Submitted ${touch.form.name}`} time={journeyTime(touch.form.submittedAt)}>
                      on <PageLink origin="" path={touch.form.path} />
                    </Step>
                  </ol>
                ) : (
                  visits.map((visit, visitIndex) => (
                    <VisitBlock
                      key={`${visit.startedAt ?? ""}-${visit.landingUrl}-${visitIndex}`}
                      visit={visit}
                      solo={solo}
                      form={visitIndex === visits.length - 1 ? touch.form : undefined}
                      call={visitIndex === visits.length - 1 ? touch.call : undefined}
                    />
                  ))
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
