import { absoluteUrl, pageMetadata, siteConfig } from "@/lib/page-metadata";
import { getFAQsForRoute, type FAQItem } from "@/lib/faqs";
import { EMAIL, PHONE, PROFILE_LINKS, SOCIAL_LINKS } from "@/lib/constants";
import { london, m25Areas } from "@/lib/coverage";
import {
  getService,
  services,
  type Audience,
  type CatalogService,
} from "@/lib/services-catalog";

// ─────────────────────────────────────────────────────────────
// Core organisation/contact data — single source of truth.
// Update phone, address etc. in lib/constants, propagates everywhere.
// ─────────────────────────────────────────────────────────────
const ORGANIZATION_ID = `${siteConfig.url}/#organization`;
const WEBSITE_ID = `${siteConfig.url}/#website`;

const AREA_SERVED = [
  { "@type": "City", name: london.name },
  ...m25Areas.map((area) => ({ "@type": "AdministrativeArea", name: area.name })),
];

const ORG_DATA = {
  name: "Rosecrest Group Ltd",
  url: siteConfig.url,
  telephone: PHONE,
  email: EMAIL,
  logo: `${siteConfig.url}/assets/svgs/logo-blue.svg`,
  address: {
    "@type": "PostalAddress",
    streetAddress: "71-75 Shelton Street, Covent Garden",
    addressLocality: "London",
    postalCode: "WC2H 9JQ",
    addressCountry: "GB",
  },
  sameAs: [...SOCIAL_LINKS.map((link) => link.href), ...PROFILE_LINKS],
};

const providerRef = { "@id": ORGANIZATION_ID };

// ─────────────────────────────────────────────────────────────
// Sitewide schemas (rendered in root layout)
// ─────────────────────────────────────────────────────────────

export function buildOrganization() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": ORGANIZATION_ID,
    name: ORG_DATA.name,
    url: ORG_DATA.url,
    logo: ORG_DATA.logo,
    image: ORG_DATA.logo,
    telephone: ORG_DATA.telephone,
    email: ORG_DATA.email,
    address: ORG_DATA.address,
    areaServed: AREA_SERVED,
    sameAs: ORG_DATA.sameAs,
    knowsAbout: services.map((service) => service.serviceType),
  };
}

export function buildWebSite() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: ORG_DATA.name,
    url: ORG_DATA.url,
    inLanguage: "en-GB",
    publisher: providerRef,
  };
}

// ─────────────────────────────────────────────────────────────
// Per-page schemas
// ─────────────────────────────────────────────────────────────

export function buildWebPage(
  path: string,
  name: string,
  description?: string,
  type = "WebPage",
) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    url: absoluteUrl(path),
    name,
    ...(description && { description }),
    inLanguage: "en-GB",
    isPartOf: { "@id": WEBSITE_ID },
  };
}

export function buildService(service: CatalogService) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.summary,
    url: absoluteUrl(service.path),
    serviceType: service.serviceType,
    provider: providerRef,
    areaServed: AREA_SERVED,
    ...(service.price && {
      offers: {
        "@type": "Offer",
        url: absoluteUrl(service.path),
        description: service.price.note,
        priceSpecification: {
          "@type": "PriceSpecification",
          minPrice: service.price.from,
          priceCurrency: "GBP",
        },
      },
    }),
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
    url: absoluteUrl(opts.path),
    itemListElement: opts.items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: item.url.startsWith("http") ? item.url : absoluteUrl(item.url),
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
// Person — a named author (Sanity `author` document) who works for Rosecrest.
// ─────────────────────────────────────────────────────────────

export type SchemaAuthor = {
  name: string;
  bio?: string;
  jobTitle?: string;
  /** Post-nominals or qualifications, e.g. "MRICS". */
  credentials?: string[];
  /** RICS directory entry, LinkedIn and other profiles of this person. */
  profileLinks?: string[];
};

const RICS = {
  "@type": "Organization",
  name: "Royal Institution of Chartered Surveyors",
  url: "https://www.rics.org",
};

export function buildPerson(author: SchemaAuthor) {
  const credentials = author.credentials?.filter(Boolean) ?? [];
  const isRicsMember = credentials.some((credential) => /RICS/i.test(credential));
  return {
    "@type": "Person",
    name: author.name,
    ...(author.jobTitle && { jobTitle: author.jobTitle }),
    ...(author.bio && { description: author.bio }),
    worksFor: providerRef,
    ...(credentials.length > 0 && {
      hasCredential: credentials.map((credential) => ({
        "@type": "EducationalOccupationalCredential",
        name: credential,
        ...(/RICS/i.test(credential) && { recognizedBy: RICS }),
      })),
    }),
    ...(isRicsMember && { memberOf: RICS }),
    ...(author.profileLinks?.length && { sameAs: author.profileLinks }),
  };
}

// ─────────────────────────────────────────────────────────────
// BlogPosting / Article + BreadcrumbList
// ─────────────────────────────────────────────────────────────

export function buildBlogPosting(opts: {
  title: string;
  slug: string;
  datePublished: string;
  dateModified?: string;
  imageUrl?: string;
  description?: string;
  /** Falls back to the firm when the post has no named author. */
  author?: SchemaAuthor | null;
}) {
  const url = absoluteUrl(`/blog/${opts.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: opts.title,
    url,
    mainEntityOfPage: url,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    ...(opts.imageUrl && { image: opts.imageUrl }),
    ...(opts.description && { description: opts.description }),
    inLanguage: "en-GB",
    author: opts.author?.name ? buildPerson(opts.author) : providerRef,
    publisher: providerRef,
  };
}

export function buildArticle(opts: {
  path: string;
  title: string;
  description: string;
  dateModified: string;
}) {
  const url = absoluteUrl(opts.path);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    url,
    mainEntityOfPage: url,
    dateModified: opts.dateModified,
    inLanguage: "en-GB",
    author: providerRef,
    publisher: providerRef,
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
      item: absoluteUrl(item.path),
    })),
  };
}

/** Home > each ancestor that is a real page > this page. */
export function breadcrumbTrail(path: string, name: string) {
  const trail = [{ name: "Home", path: "/" }];
  const segments = path.split("/").filter(Boolean);
  for (let i = 1; i < segments.length; i++) {
    const ancestor = `/${segments.slice(0, i).join("/")}`;
    const ancestorMeta = pageMetadata[ancestor];
    if (ancestorMeta) trail.push({ name: ancestorMeta.name, path: ancestor });
  }
  trail.push({ name, path });
  return trail;
}

// ─────────────────────────────────────────────────────────────
// Everything a page in pageMetadata should carry, from its path.
// ─────────────────────────────────────────────────────────────

const PAGE_TYPES: Record<string, string> = {
  "/about": "AboutPage",
  "/contact": "ContactPage",
  "/services": "CollectionPage",
  "/blog": "CollectionPage",
  "/guides": "CollectionPage",
};

const SECTOR_AUDIENCES: Record<string, Audience[]> = {
  "/homebuyer": ["homebuyers"],
  "/landlord": ["landlords"],
  "/legal": ["legal"],
  "/councils": ["councils", "housing-providers"],
};

function serviceItems(list: CatalogService[]) {
  return list.map((service) => ({ name: service.name, url: service.path }));
}

export function buildPageSchema(path: string): object[] {
  const meta = pageMetadata[path];
  if (!meta) return [];

  const blocks: object[] = [
    buildWebPage(path, meta.title, meta.description, PAGE_TYPES[path]),
  ];

  if (path !== "/") {
    blocks.push(buildBreadcrumbList(breadcrumbTrail(path, meta.name)));
  }

  const service = getService(path);
  if (service) blocks.push(buildService(service));

  if (path === "/" || path === "/services") {
    blocks.push(
      buildItemList({ path, name: "Rosecrest services", items: serviceItems(services) }),
    );
  }

  const sectorAudiences = SECTOR_AUDIENCES[path];
  if (sectorAudiences) {
    const relevant = services.filter((s) =>
      s.audiences.some((audience) => sectorAudiences.includes(audience)),
    );
    blocks.push(buildItemList({ path, name: meta.name, items: serviceItems(relevant) }));
  }

  const faqs = getFAQsForRoute(path);
  if (faqs) blocks.push(buildFAQPage(faqs));

  return blocks;
}
