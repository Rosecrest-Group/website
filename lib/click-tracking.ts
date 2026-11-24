import type { AttributionClick, ClickKind } from "@/lib/attribution-session";

export type DescribedClick = Omit<AttributionClick, "at" | "path">;

const CLICKABLE = "a[href], button, [role='button'], summary";
/** Address suggestions and other lists can hold what the visitor typed, so they are never recorded. */
const IGNORED = "[data-track-ignore], [role='listbox'], [role='option'], form";
const LANDMARK_NAMES: Record<string, string> = {
  header: "Site header",
  footer: "Footer",
  nav: "Navigation",
  aside: "Sidebar",
  dialog: "Pop-up",
};

function squash(text: string | null | undefined): string {
  return (text ?? "").replace(/\s+/g, " ").trim();
}

function labelOf(el: Element): string {
  const explicit = squash(el.getAttribute("data-track-label")) || squash(el.getAttribute("aria-label"));
  if (explicit) return explicit;
  const text = squash(el.textContent);
  if (text) return text;
  const image = el.querySelector("img[alt]");
  return squash(image?.getAttribute("alt")) || squash(el.getAttribute("title")) || "(no label)";
}

function sectionOf(el: Element): string | null {
  const tagged = el.closest("[data-track-section]");
  if (tagged) return squash(tagged.getAttribute("data-track-section")) || null;

  const region = el.closest("header, footer, nav, aside, dialog, [role='dialog'], section");
  if (!region) return null;
  const named = squash(region.getAttribute("aria-label"));
  if (named) return named;
  const tag = region.getAttribute("role") === "dialog" ? "dialog" : region.tagName.toLowerCase();
  if (tag !== "section") return LANDMARK_NAMES[tag] ?? null;
  const heading = region.querySelector("h1, h2, h3");
  return squash(heading?.textContent) || null;
}

function hrefOf(el: Element): { href: string | null; kind: ClickKind } {
  const raw = el.tagName === "A" ? el.getAttribute("href") : null;
  if (!raw) return { href: null, kind: "button" };
  if (/^tel:/i.test(raw)) return { href: raw.replace(/\s+/g, ""), kind: "call" };
  if (/^mailto:/i.test(raw)) return { href: raw.split("?")[0], kind: "email" };
  try {
    const url = new URL(raw, window.location.href);
    if (url.origin === window.location.origin) {
      return { href: `${url.pathname}${url.search}${url.hash}`, kind: "link" };
    }
    return { href: `${url.origin}${url.pathname}`, kind: "link" };
  } catch {
    return { href: null, kind: "link" };
  }
}

/** What a click was on, or null when it wasn't a link or button worth recording. */
export function describeClick(target: EventTarget | null): DescribedClick | null {
  if (!(target instanceof Element)) return null;
  const el = target.closest(CLICKABLE);
  if (!el) return null;
  const { href, kind } = hrefOf(el);
  // A phone number is always recorded, even inside a form, because the call can only be matched this way.
  if (kind === "call" ? el.closest("[data-track-ignore]") : el.closest(IGNORED)) return null;
  return { label: labelOf(el), section: sectionOf(el), href, kind };
}
