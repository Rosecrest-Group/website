import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyClick,
  findFormTrigger,
  MAX_CLICKS,
  type AttributionClick,
  type AttributionVisit,
} from "./attribution-session";

const visit: AttributionVisit = {
  referrer: "https://www.google.com/",
  landingUrl: "https://www.rosecrestgroupltd.co.uk/services/thermographic-surveys",
  startedAt: "2026-11-11T10:00:00.000Z",
  pages: [{ path: "/services/thermographic-surveys", title: "Thermographic surveys", at: "2026-11-11T10:00:00.000Z" }],
};

function click(overrides: Partial<AttributionClick> = {}): AttributionClick {
  return {
    at: "2026-11-11T10:01:00.000Z",
    path: "/services/thermographic-surveys",
    label: "Request an inspection",
    section: "Thermographic surveys",
    href: "/request-inspection",
    kind: "link",
    ...overrides,
  };
}

describe("applyClick", () => {
  it("adds the click to the current visit", () => {
    const [next] = applyClick([visit], click());
    assert.equal(next.clicks?.length, 1);
    assert.equal(next.clicks?.[0].label, "Request an inspection");
  });

  it("does nothing when there is no visit yet", () => {
    assert.deepEqual(applyClick([], click()), []);
  });

  it("ignores a double-click on the same thing", () => {
    const once = applyClick([visit], click());
    const twice = applyClick(once, click({ at: "2026-11-11T10:01:00.400Z" }));
    assert.equal(twice, once);
    const later = applyClick(once, click({ at: "2026-11-11T10:01:05.000Z" }));
    assert.equal(later[0].clicks?.length, 2);
  });

  it("drops the oldest clicks past the limit", () => {
    let visits = [visit];
    for (let i = 0; i < MAX_CLICKS + 5; i += 1) {
      visits = applyClick(visits, click({ label: `Link ${i}`, at: new Date(Date.UTC(2026, 10, 11, 10, i)).toISOString() }));
    }
    assert.equal(visits[0].clicks?.length, MAX_CLICKS);
    assert.equal(visits[0].clicks?.[0].label, "Link 5");
  });

  it("clips long labels", () => {
    const [next] = applyClick([visit], click({ label: "x".repeat(500) }));
    assert.equal(next.clicks?.[0].label.length, 120);
  });
});

describe("findFormTrigger", () => {
  it("is the latest link to the form page", () => {
    let visits = applyClick([visit], click({ label: "Hero button", at: "2026-11-11T10:01:00.000Z" }));
    visits = applyClick(visits, click({ label: "Pricing button", at: "2026-11-11T10:02:00.000Z" }));
    visits = applyClick(visits, click({ label: "FAQ", href: "/faqs", at: "2026-11-11T10:03:00.000Z" }));
    assert.equal(findFormTrigger(visits, "/request-inspection?ref=1")?.label, "Pricing button");
  });

  it("falls back to a button on the form's own page, for pop-up forms", () => {
    const visits = applyClick([visit], click({ label: "Book now", kind: "button", href: null }));
    assert.equal(findFormTrigger(visits, "/services/thermographic-surveys")?.label, "Book now");
  });

  it("is null when nothing led to the form", () => {
    assert.equal(findFormTrigger([visit], "/request-inspection"), null);
  });
});
