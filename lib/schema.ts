import { siteConfig } from "@/lib/page-metadata";
import type { FAQItem } from "@/lib/faqs";

// ─────────────────────────────────────────────────────────────
// Core organisation/contact data — single source of truth.
// Update phone, address etc. here, propagates everywhere.
// ─────────────────────────────────────────────────────────────
const ORG_DATA = {
  name: "Rosecrest Group Ltd",
  url: siteConfig.url,
  telephone: "020 4576 5317",
  areaServed: "London, M25",
  // Add real social URLs as they come available
  sameAs: [] as string[],
};

// ─────────────────────────────────────────────────────────────
// Sitewide schemas (rendered in root layout)
// ─────────────────────────────────────────────────────────────

export function buildOrganization() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ORG_DATA.name,
    url: ORG_DATA.url,
    telephone: ORG_DATA.telephone,
    areaServed: ORG_DATA.areaServed,
    sameAs: ORG_DATA.sameAs,
  };
}

export function buildWebSite() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: ORG_DATA.name,
    url: ORG_DATA.url,
  };
}

// ─────────────────────────────────────────────────────────────
// Per-page schemas
// ─────────────────────────────────────────────────────────────

export function buildLocalBusiness() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: ORG_DATA.name,
    url: ORG_DATA.url,
    telephone: ORG_DATA.telephone,
    areaServed: ORG_DATA.areaServed,
  };
}

export function buildContactPage(path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    url: `${siteConfig.url}${path}`,
    name: "Contact Rosecrest Group Ltd",
  };
}

export function buildWebPage(path: string, name: string, description?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: `${siteConfig.url}${path}`,
    name,
    ...(description && { description }),
  };
}

export function buildService(opts: {
  name: string;
  description: string;
  path: string;
  serviceType?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    description: opts.description,
    url: `${siteConfig.url}${opts.path}`,
    provider: {
      "@type": "Organization",
      name: ORG_DATA.name,
      url: ORG_DATA.url,
    },
    areaServed: ORG_DATA.areaServed,
    ...(opts.serviceType && { serviceType: opts.serviceType }),
  };
}

export function buildItemList(opts: {
  path: string;
  name: string;
  items: { name: string; url: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: opts.name,
    url: `${siteConfig.url}${opts.path}`,
    itemListElement: opts.items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: item.url.startsWith("http") ? item.url : `${siteConfig.url}${item.url}`,
    })),
  };
}

// ─────────────────────────────────────────────────────────────
// FAQPage — generated directly from the same FAQItem[] used to
// render the visible FAQ component, guaranteeing schema/UI parity.
// ─────────────────────────────────────────────────────────────

export function buildFAQPage(items: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

// ─────────────────────────────────────────────────────────────
// BlogPosting + BreadcrumbList (for blog detail pages)
// ─────────────────────────────────────────────────────────────

export function buildBlogPosting(opts: {
  title: string;
  slug: string;
  datePublished: string;
  dateModified?: string;
  imageUrl?: string;
  description?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: opts.title,
    url: `${siteConfig.url}/blog/${opts.slug}`,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    ...(opts.imageUrl && { image: opts.imageUrl }),
    ...(opts.description && { description: opts.description }),
    author: {
      "@type": "Organization",
      name: ORG_DATA.name,
    },
    publisher: {
      "@type": "Organization",
      name: ORG_DATA.name,
      url: ORG_DATA.url,
    },
  };
}

export function buildBreadcrumbList(
  items: { name: string; path: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteConfig.url}${item.path}`,
    })),
  };
}