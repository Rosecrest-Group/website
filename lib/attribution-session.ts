export type AttributionPage = { path: string; title: string; at: string };

export type AttributionVisit = {
  referrer: string | null;
  landingUrl: string;
  startedAt: string;
  pages: AttributionPage[];
};

export const JOURNEY_STORAGE_KEY = "rc_journey";
export const JOURNEY_OPT_OUT_KEY = "rc_journey_opt_out";
export const JOURNEY_MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;
export const SESSION_GAP_MS = 30 * 60 * 1000;
export const MAX_VISITS = 20;
export const MAX_PAGES = 50;

const CAMPAIGN_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "gbraid",
  "wbraid",
  "msclkid",
  "fbclid",
  "ttclid",
  "li_fat_id",
];

export type PageEvent = {
  now: string;
  path: string;
  title: string;
  href: string;
  referrer: string;
  /** True for the first page view of this document. Client-side navigations are false. */
  freshDocument: boolean;
};

function clip(value: string, max: number): string {
  return value.length > max ? value.slice(0, max) : value;
}

function hostname(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

function isSameSite(referrer: string, pageHref: string): boolean {
  const referrerHost = hostname(referrer);
  const pageHost = hostname(pageHref);
  return referrerHost !== null && referrerHost === pageHost;
}

function externalReferrer(referrer: string, pageHref: string): string | null {
  if (!referrer || isSameSite(referrer, pageHref)) return null;
  return clip(referrer, 2048);
}

function campaignKey(url: string): string {
  try {
    const params = new URL(url).searchParams;
    return CAMPAIGN_PARAMS.map((key) => params.get(key) ?? "").join("\n");
  } catch {
    return "";
  }
}

function hasCampaign(url: string): boolean {
  return campaignKey(url).replace(/\n/g, "") !== "";
}

function pageCount(visits: AttributionVisit[]): number {
  return visits.reduce((total, visit) => total + visit.pages.length, 0);
}

function pruneOld(visits: AttributionVisit[], now: number): AttributionVisit[] {
  return visits.filter((visit) => {
    const started = Date.parse(visit.startedAt);
    return Number.isFinite(started) && now - started <= JOURNEY_MAX_AGE_MS;
  });
}

function limitVisits(visits: AttributionVisit[]): AttributionVisit[] {
  if (visits.length <= MAX_VISITS) return visits;
  return [visits[0], ...visits.slice(-(MAX_VISITS - 1))];
}

/** Keeps every visit's first page, then the most recent pages, up to MAX_PAGES. */
function limitPages(visits: AttributionVisit[]): AttributionVisit[] {
  const next = visits.map((visit) => ({ ...visit, pages: [...visit.pages] }));
  while (pageCount(next) > MAX_PAGES) {
    const index = next.findIndex((visit) => visit.pages.length > 1);
    if (index === -1) break;
    const pages = next[index].pages;
    next[index] = { ...next[index], pages: [pages[0], ...pages.slice(2)] };
  }
  return next;
}

function shouldStartVisit(last: AttributionVisit, event: PageEvent, now: number): "gap" | "source" | false {
  const lastAt = Date.parse(last.pages.at(-1)?.at ?? last.startedAt);
  const gap = Number.isFinite(lastAt) ? now - lastAt : SESSION_GAP_MS + 1;
  if (gap > SESSION_GAP_MS) return "gap";
  if (!event.freshDocument) return false;
  const incoming = externalReferrer(event.referrer, event.href);
  if (!incoming) return false;
  if (incoming !== (last.referrer ?? null)) return "source";
  if (hasCampaign(event.href) && campaignKey(event.href) !== campaignKey(last.landingUrl)) return "source";
  return false;
}

/**
 * Appends a page view. A later day, or a new arrival from another site, becomes its own visit.
 * The earliest visit is kept when the history is trimmed.
 */
export function applyPageView(visits: AttributionVisit[], event: PageEvent): AttributionVisit[] {
  const now = Date.parse(event.now);
  let next = pruneOld(visits, Number.isFinite(now) ? now : Date.now());
  const last = next.at(-1);
  if (!last) {
    // A referrer only counts when this document actually loaded from it. After the history
    // is cleared, further pages in the same tab are not a new arrival.
    const referrer = event.freshDocument ? externalReferrer(event.referrer, event.href) : null;
    next = [newVisit(event, referrer)];
  } else {
    const reason = shouldStartVisit(last, event, Number.isFinite(now) ? now : Date.now());
    if (reason) {
      const referrer =
        reason === "gap" && !event.freshDocument ? null : externalReferrer(event.referrer, event.href);
      next = limitVisits([...next, newVisit(event, referrer)]);
    }
  }

  const path = clip(event.path, 2048);
  const current = next.at(-1);
  if (!current) return next;
  if (current.pages.at(-1)?.path === path) return limitPages(next);

  const pages = [
    ...current.pages,
    { path, title: clip(event.title, 300), at: event.now },
  ];
  next = next.slice(0, -1).concat({ ...current, pages });
  return limitPages(next);
}

function newVisit(event: PageEvent, referrer: string | null): AttributionVisit {
  return {
    referrer,
    landingUrl: clip(event.href, 2048),
    startedAt: event.now,
    pages: [],
  };
}

/** Updates the title of the page just recorded, once the document title has settled. */
export function setCurrentPageTitle(visits: AttributionVisit[], path: string, title: string): AttributionVisit[] {
  const visit = visits.at(-1);
  const page = visit?.pages.at(-1);
  const nextTitle = clip(title, 300);
  if (!visit || !page || page.path !== path || page.title === nextTitle) return visits;
  const pages = visit.pages.slice(0, -1).concat({ ...page, title: nextTitle });
  return visits.slice(0, -1).concat({ ...visit, pages });
}
