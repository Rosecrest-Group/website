import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyPageView,
  JOURNEY_MAX_AGE_MS,
  MAX_PAGES,
  setCurrentPageTitle,
  type AttributionVisit,
  type PageEvent,
} from "./attribution-session";

const site = "https://www.rosecrestgroupltd.co.uk";
const monday = "2026-10-19T10:00:00.000Z";

function view(overrides: Partial<PageEvent> & Pick<PageEvent, "now" | "path">): PageEvent {
  return {
    title: overrides.path,
    href: `${site}${overrides.path}`,
    referrer: "",
    freshDocument: false,
    ...overrides,
  };
}

describe("applyPageView", () => {
  it("keeps Monday's pages on one visit and starts a new visit on Friday", () => {
    let visits = applyPageView([], view({
      now: monday,
      path: "/services/damp-mould",
      href: `${site}/services/damp-mould`,
      referrer: "https://www.google.co.uk/",
      freshDocument: true,
    }));
    visits = applyPageView(visits, view({
      now: "2026-10-19T10:05:00.000Z",
      path: "/about",
      href: `${site}/about`,
      referrer: "https://www.google.co.uk/",
      freshDocument: false,
    }));

    assert.equal(visits.length, 1);
    assert.equal(visits[0].referrer, "https://www.google.co.uk/");
    assert.deepEqual(visits[0].pages.map((page) => page.path), ["/services/damp-mould", "/about"]);

    visits = applyPageView(visits, view({
      now: "2026-10-23T15:00:00.000Z",
      path: "/contact",
      href: `${site}/contact`,
      referrer: "https://www.google.co.uk/",
      freshDocument: false,
    }));

    assert.equal(visits.length, 2);
    assert.equal(visits[0].referrer, "https://www.google.co.uk/");
    assert.equal(visits[1].referrer, null);
    assert.equal(visits[1].landingUrl, `${site}/contact`);
  });

  it("attributes a later arrival when they come back from another site", () => {
    const first = applyPageView([], view({
      now: monday,
      path: "/",
      href: `${site}/`,
      referrer: "https://chatgpt.com/",
      freshDocument: true,
    }));
    const next = applyPageView(first, view({
      now: "2026-10-23T15:00:00.000Z",
      path: "/contact",
      href: `${site}/contact`,
      referrer: "https://www.google.co.uk/",
      freshDocument: true,
    }));

    assert.equal(next.length, 2);
    assert.equal(next[1].referrer, "https://www.google.co.uk/");
  });

  it("continues the visit on a same-site load and splits a different referrer", () => {
    const first = applyPageView([], view({
      now: monday,
      path: "/",
      href: `${site}/`,
      referrer: "https://chatgpt.com/",
      freshDocument: true,
    }));
    const sameSite = applyPageView(first, view({
      now: "2026-10-19T10:10:00.000Z",
      path: "/contact",
      href: `${site}/contact`,
      referrer: "https://rosecrestgroupltd.co.uk/",
      freshDocument: true,
    }));
    assert.equal(sameSite.length, 1);
    assert.deepEqual(sameSite[0].pages.map((page) => page.path), ["/", "/contact"]);

    const otherSite = applyPageView(first, view({
      now: "2026-10-19T10:10:00.000Z",
      path: "/guides",
      href: `${site}/guides`,
      referrer: "https://www.bing.com/",
      freshDocument: true,
    }));
    assert.equal(otherSite.length, 2);
    assert.equal(otherSite[1].referrer, "https://www.bing.com/");
  });

  it("starts a visit when a fresh load brings a new campaign", () => {
    const first = applyPageView([], view({
      now: monday,
      path: "/",
      href: `${site}/?utm_campaign=spring`,
      referrer: "https://www.google.co.uk/",
      freshDocument: true,
    }));
    const next = applyPageView(first, view({
      now: "2026-10-19T10:10:00.000Z",
      path: "/",
      href: `${site}/?utm_campaign=autumn`,
      referrer: "https://www.google.co.uk/",
      freshDocument: true,
    }));
    assert.equal(next.length, 2);
    assert.equal(next[1].landingUrl, `${site}/?utm_campaign=autumn`);
  });

  it("does not record the same page twice in a row", () => {
    const first = applyPageView([], view({
      now: monday,
      path: "/contact",
      freshDocument: true,
    }));
    const again = applyPageView(first, view({
      now: "2026-10-19T10:01:00.000Z",
      path: "/contact",
      freshDocument: true,
    }));
    assert.equal(again[0].pages.length, 1);
  });

  it("drops visits older than 180 days", () => {
    const now = "2026-10-23T00:00:00.000Z";
    const old = new Date(Date.parse(now) - JOURNEY_MAX_AGE_MS - 60_000).toISOString();
    const stored: AttributionVisit[] = [{
      referrer: "https://www.google.co.uk/",
      landingUrl: `${site}/old`,
      startedAt: old,
      pages: [{ path: "/old", title: "Old", at: old }],
    }];
    const next = applyPageView(stored, view({ now, path: "/contact", freshDocument: true }));
    assert.equal(next.length, 1);
    assert.equal(next[0].landingUrl, `${site}/contact`);
  });

  it("keeps the earliest visit when the history is longer than 20", () => {
    let visits: AttributionVisit[] = [];
    for (let i = 0; i < 21; i++) {
      const now = new Date(Date.parse(monday) + i * 60 * 60 * 1000).toISOString();
      visits = applyPageView(visits, view({
        now,
        path: `/p/${i}`,
        href: `${site}/p/${i}`,
        referrer: i === 0 ? "https://www.google.co.uk/" : "",
        freshDocument: true,
      }));
    }
    assert.equal(visits.length, 20);
    assert.equal(visits[0].referrer, "https://www.google.co.uk/");
    assert.equal(visits[0].pages[0].path, "/p/0");
    assert.equal(visits.at(-1)?.pages[0].path, "/p/20");
  });

  it("keeps the first landing page and the most recent pages", () => {
    let visits: AttributionVisit[] = [];
    for (let i = 0; i < MAX_PAGES + 1; i++) {
      visits = applyPageView(visits, view({
        now: new Date(Date.parse(monday) + i * 1000).toISOString(),
        path: `/p/${i}`,
        freshDocument: false,
      }));
    }
    assert.equal(visits.length, 1);
    assert.equal(visits[0].pages.length, MAX_PAGES);
    assert.equal(visits[0].pages[0].path, "/p/0");
    assert.equal(visits[0].pages.at(-1)?.path, `/p/${MAX_PAGES}`);
    assert.equal(visits[0].pages.some((page) => page.path === "/p/1"), false);
  });

  it("does not treat a stale referrer as a new arrival when the history is empty", () => {
    const visits = applyPageView([], view({
      now: monday,
      path: "/contact",
      href: `${site}/contact`,
      referrer: "https://www.google.co.uk/",
      freshDocument: false,
    }));
    assert.equal(visits.length, 1);
    assert.equal(visits[0].referrer, null);
  });

  it("fills the title of the current page", () => {
    const visits = applyPageView([], view({ now: monday, path: "/about", title: "", freshDocument: true }));
    const titled = setCurrentPageTitle(visits, "/about", "About us");
    assert.equal(titled[0].pages[0].title, "About us");
    assert.equal(setCurrentPageTitle(titled, "/other", "Nope"), titled);
  });
});
