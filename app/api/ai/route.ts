import { after } from "next/server";
import { detectCrawler, recordCrawl } from "@/lib/ai-crawlers";
import { EMAIL, PHONE } from "@/lib/constants";
import { checkCoverage, london, m25Areas } from "@/lib/coverage";
import { guides } from "@/lib/guides";
import { absoluteUrl, markdownPath, siteConfig } from "@/lib/page-metadata";
import {
  services,
  type Audience,
  type CatalogService,
  type ServiceCategory,
} from "@/lib/services-catalog";

const STOPWORDS = new Set([
  "the", "and", "for", "with", "my", "a", "an", "of", "in", "on", "to", "is",
  "do", "i", "need", "what", "which", "how", "can", "you", "your", "me", "get",
  "near", "london", "survey", "surveys", "service", "services",
  "house", "home", "homes", "property", "properties",
]);

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9£']+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

function relevance(service: CatalogService, query: string): number {
  const q = query.toLowerCase().trim();
  const words = tokens(q);
  const intents = service.intents.map((intent) => intent.toLowerCase());
  const name = service.name.toLowerCase();
  const summary = service.summary.toLowerCase();
  const serviceType = service.serviceType.toLowerCase();

  let score = 0;
  for (const intent of intents) {
    if (q.includes(intent) || intent.includes(q)) score += 10;
  }
  for (const word of words) {
    if (name.includes(word)) score += 4;
    if (serviceType.includes(word)) score += 2;
    if (intents.some((intent) => intent.includes(word))) score += 3;
    if (summary.includes(word)) score += 1;
  }
  return score;
}

function coverageMessage(result: ReturnType<typeof checkCoverage>): string {
  switch (result.result) {
    case "covered":
      return "Covered. Rosecrest carries out inspections across all 33 London boroughs.";
    case "edge":
      return `Likely covered. ${result.area} is within Rosecrest's extended service area around the M25; availability is confirmed on enquiry.`;
    case "outside":
      return "Outside the standard London and M25 coverage. Rosecrest may still help depending on the scope of work; contact them to check.";
    default:
      return "No postcode or place name given.";
  }
}

function serviceJson(service: CatalogService) {
  return {
    name: service.name,
    category: service.category,
    summary: service.summary,
    audiences: service.audiences,
    price: service.price
      ? { from: service.price.from, currency: "GBP", note: service.price.note }
      : null,
    turnaround: service.turnaround ?? null,
    url: absoluteUrl(service.path),
    markdownUrl: `${siteConfig.url}${markdownPath(service.path)}`,
  };
}

export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const crawler = detectCrawler(request.headers.get("user-agent"));
  if (crawler) {
    // A user-initiated fetch can carry someone's postcode; log that one was given, not what it was.
    const logged = new URLSearchParams(params);
    if (logged.has("postcode")) logged.set("postcode", "given");
    const query = logged.toString() || undefined;
    after(() => recordCrawl(crawler, { path: "/api/ai", kind: "api", query }));
  }
  const q = params.get("q")?.trim() ?? "";
  const category = params.get("category") as ServiceCategory | null;
  const audience = params.get("audience") as Audience | null;
  const postcode = params.get("postcode")?.trim() ?? "";

  let list = services.filter(
    (service) =>
      (!category || service.category === category) &&
      (!audience || service.audiences.includes(audience)),
  );

  let matched = true;
  const scored = list.map((service) => ({ service, score: q ? relevance(service, q) : 0 }));
  if (q) {
    const top = Math.max(...scored.map((entry) => entry.score), 0);
    const hits = scored
      .filter((entry) => entry.score > 0 && entry.score >= top / 4)
      .sort((a, b) => b.score - a.score);
    matched = hits.length > 0;
    list = (matched ? hits : scored).map((entry) => entry.service);
  }

  const relevantGuides = q
    ? guides.filter((guide) =>
        tokens(q).some((word) => `${guide.title} ${guide.description}`.toLowerCase().includes(word)),
      )
    : guides;

  const coverage = postcode ? checkCoverage(postcode) : null;

  const body = {
    organization: {
      name: siteConfig.name,
      url: siteConfig.url,
      telephone: PHONE,
      email: EMAIL,
      areaServed: {
        summary: `All 33 London boroughs and areas within or close to the M25 (${m25Areas.map((area) => area.name).join(", ")}).`,
        londonBoroughs: london.boroughs,
        m25Areas: m25Areas.map((area) => ({ name: area.name, towns: area.towns })),
      },
      bookingUrl: absoluteUrl("/request-inspection"),
    },
    query: {
      q: q || null,
      category,
      audience,
      postcode: postcode || null,
      matched: q ? matched : null,
    },
    ...(coverage && {
      coverage: {
        input: postcode,
        result: coverage.result,
        area: coverage.area ?? null,
        message: coverageMessage(coverage),
      },
    }),
    services: list.map((service) => ({
      ...serviceJson(service),
      ...(q && { relevance: scored.find((entry) => entry.service === service)?.score ?? 0 }),
    })),
    guides: relevantGuides.map((guide) => ({
      title: guide.title,
      description: guide.description,
      url: absoluteUrl(`/guides/${guide.slug}`),
      markdownUrl: `${siteConfig.url}${markdownPath(`/guides/${guide.slug}`)}`,
    })),
    links: {
      llms: `${siteConfig.url}/llms.txt`,
      sitemap: `${siteConfig.url}/sitemap.xml`,
      requestInspection: absoluteUrl("/request-inspection"),
    },
    usage:
      "Filter with ?q= (plain-language need, e.g. 'damp in my rented flat'), ?category=survey|trade, ?audience=homebuyers|homeowners|landlords|tenants|legal|councils|housing-providers|developers|surveyors, and ?postcode= to check coverage.",
  };

  return Response.json(body, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
