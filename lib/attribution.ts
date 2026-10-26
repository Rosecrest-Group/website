import {
  applyPageView,
  setCurrentPageTitle,
  JOURNEY_OPT_OUT_KEY,
  JOURNEY_STORAGE_KEY,
  type AttributionPage,
  type AttributionVisit,
} from "@/lib/attribution-session";

export type { AttributionPage, AttributionVisit };

export type AttributionPayload = {
  visits: AttributionVisit[];
  /** Earliest visit, so an API that still expects one visit keeps the original source. */
  referrer: string | null;
  landingUrl: string;
  firstSeenAt: string;
  pages: AttributionPage[];
  form: { name: string; path: string; submittedAt: string };
};

let booted = false;
let storageBroken = false;
let memoryVisits: AttributionVisit[] = [];
let epoch = 0;

function currentPath(): string {
  return `${window.location.pathname}${window.location.search}`;
}

function isVisit(value: unknown): value is AttributionVisit {
  if (!value || typeof value !== "object") return false;
  const visit = value as AttributionVisit;
  return typeof visit.landingUrl === "string" && typeof visit.startedAt === "string" && Array.isArray(visit.pages);
}

const OPT_OUT_EVENT = "rc-journey-opt-out";

/** True when the visitor has asked us not to remember their visits on this browser. */
export function isJourneyOptedOut(): boolean {
  try {
    return localStorage.getItem(JOURNEY_OPT_OUT_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Opting out deletes the stored history and keeps only the current visit in memory.
 * The opt-out flag itself is stored so the choice is respected on later visits.
 */
export function setJourneyOptOut(optedOut: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (optedOut) {
      memoryVisits = read();
      localStorage.setItem(JOURNEY_OPT_OUT_KEY, "1");
      localStorage.removeItem(JOURNEY_STORAGE_KEY);
    } else {
      localStorage.removeItem(JOURNEY_OPT_OUT_KEY);
    }
  } catch {
    storageBroken = true;
  }
  window.dispatchEvent(new Event(OPT_OUT_EVENT));
}

export function subscribeJourneyOptOut(onChange: () => void): () => void {
  window.addEventListener(OPT_OUT_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(OPT_OUT_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function read(): AttributionVisit[] {
  if (storageBroken || isJourneyOptedOut()) return memoryVisits;
  try {
    const raw = localStorage.getItem(JOURNEY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { visits?: unknown };
    if (!Array.isArray(parsed?.visits)) return [];
    return parsed.visits.filter(isVisit).map((visit) => ({
      referrer: typeof visit.referrer === "string" ? visit.referrer : null,
      landingUrl: visit.landingUrl,
      startedAt: visit.startedAt,
      pages: visit.pages.filter(
        (page) => page && typeof page.path === "string" && typeof page.at === "string"
      ).map((page) => ({
        path: page.path,
        title: typeof page.title === "string" ? page.title : "",
        at: page.at,
      })),
    }));
  } catch {
    try {
      localStorage.removeItem(JOURNEY_STORAGE_KEY);
    } catch {
      storageBroken = true;
    }
    return memoryVisits;
  }
}

function write(visits: AttributionVisit[]): void {
  if (storageBroken || isJourneyOptedOut()) {
    memoryVisits = visits;
    return;
  }
  try {
    const serialized = JSON.stringify({ visits });
    if (localStorage.getItem(JOURNEY_STORAGE_KEY) === serialized) return;
    localStorage.setItem(JOURNEY_STORAGE_KEY, serialized);
  } catch {
    storageBroken = true;
    memoryVisits = visits;
  }
}

export function recordPageView(): void {
  if (typeof window === "undefined") return;
  const freshDocument = !booted;
  booted = true;
  const scheduledEpoch = epoch;
  const at = new Date().toISOString();
  const path = currentPath();
  write(applyPageView(read(), {
    now: at,
    path,
    title: document.title,
    href: window.location.href,
    referrer: document.referrer || "",
    freshDocument,
  }));

  // The App Router swaps the document title after the route renders.
  window.setTimeout(() => {
    if (scheduledEpoch !== epoch || currentPath() !== path) return;
    write(setCurrentPageTitle(read(), path, document.title));
  }, 500);
}

/** Every stored visit, sent with a form submission. */
export function getAttribution(formName: string): AttributionPayload | undefined {
  if (typeof window === "undefined") return undefined;
  recordPageView();
  const visits = read();
  const first = visits[0];
  if (!first) return undefined;
  return {
    visits: visits.map((visit) => ({ ...visit, pages: visit.pages.map((page) => ({ ...page })) })),
    referrer: first.referrer,
    landingUrl: first.landingUrl,
    firstSeenAt: first.startedAt,
    pages: visits.flatMap((visit) => visit.pages.map((page) => ({ ...page }))),
    form: {
      name: formName,
      path: currentPath(),
      submittedAt: new Date().toISOString(),
    },
  };
}

/** Drops the stored history after the enquiry has been accepted. */
export function clearAttribution(): void {
  if (typeof window === "undefined") return;
  epoch += 1;
  memoryVisits = [];
  storageBroken = false;
  try {
    localStorage.removeItem(JOURNEY_STORAGE_KEY);
  } catch {
    storageBroken = true;
  }
}
