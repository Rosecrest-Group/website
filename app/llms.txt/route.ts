import { EMAIL, PHONE } from "@/lib/constants";
import { london, m25Areas } from "@/lib/coverage";
import { guides } from "@/lib/guides";
import { markdownPath, pageMetadata, siteConfig } from "@/lib/page-metadata";
import { sectors, services, type CatalogService } from "@/lib/services-catalog";
import { getBlogPosts } from "@/lib/site-index";

export const revalidate = 3600;

function md(path: string): string {
  return `${siteConfig.url}${markdownPath(path)}`;
}

function serviceLine(service: CatalogService): string {
  const price = service.price ? ` ${service.price.note}` : "";
  return `- [${service.name}](${md(service.path)}): ${service.summary}${price}`;
}

function pageLine(path: string): string {
  const meta = pageMetadata[path];
  return `- [${meta.name}](${md(path)}): ${meta.description}`;
}

export async function GET() {
  const posts = await getBlogPosts();
  const surveys = services.filter((service) => service.category === "survey");
  const trades = services.filter((service) => service.category === "trade");

  const lines = [
    "# Rosecrest Group Ltd",
    "",
    `> Rosecrest Group Ltd is a RICS-regulated property surveying and consultancy firm covering all 33 London boroughs and areas within or close to the M25. It provides RICS Level 1, 2 and 3 home surveys, damp and mould inspections, party wall surveying, housing disrepair and HHSRS assessments, CPR 35 expert witness reports, stock condition surveys, EPCs, environmental and thermographic surveys, plus trade and maintenance services.`,
    "",
    "Rosecrest works for homebuyers, homeowners, landlords, tenants, solicitors, councils and housing providers. Fees for many surveys are fixed, and prices are confirmed before an appointment is booked.",
    "",
    "Every public page has a Markdown twin at the same URL with `.md` appended (the homepage is `/index.md`). Prefer those when ingesting this site.",
    "",
    "## Surveys and reports",
    "",
    ...surveys.map(serviceLine),
    "",
    "## Trade and maintenance services",
    "",
    ...trades.map(serviceLine),
    "",
    "## Who we work with",
    "",
    ...sectors.map((sector) => `- [${pageMetadata[sector.path].name}](${md(sector.path)}): ${sector.audience}`),
    "",
    "## Guides: which survey do I need?",
    "",
    ...guides.map((guide) => `- [${guide.name}](${md(`/guides/${guide.slug}`)}): ${guide.description}`),
    "",
    "## Areas covered",
    "",
    `- [Areas we cover](${md("/areas-we-cover")}): ${london.description}`,
    `- Also covered within or close to the M25: ${m25Areas.map((area) => area.name).join(", ")}.`,
    `- London boroughs: ${london.boroughs.join(", ")}.`,
    `- Check a postcode: ${siteConfig.url}/api/ai?postcode=SW9%208LB`,
    "",
    "## Booking and contact",
    "",
    pageLine("/request-inspection"),
    pageLine("/contact"),
    `- Phone: ${PHONE}`,
    `- Email: ${EMAIL}`,
    "",
    "## Company",
    "",
    pageLine("/about"),
    pageLine("/faqs"),
    pageLine("/complaints-procedure"),
    "",
    ...(posts.length
      ? [
          "## Articles",
          "",
          ...posts.map((post) => `- [${post.title}](${md(`/blog/${post.slug}`)})${post.excerpt ? `: ${post.excerpt}` : ""}`),
          "",
        ]
      : []),
    "## Machine-readable",
    "",
    `- Service catalog (JSON, filter with ?q=, ?category=, ?audience=, ?postcode=): ${siteConfig.url}/api/ai`,
    `- Sitemap: ${siteConfig.url}/sitemap.xml`,
    "",
    "## Optional",
    "",
    pageLine("/privacy-policy"),
    pageLine("/cookie-policy"),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
