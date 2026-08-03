import type { Metadata } from "next";

// ─────────────────────────────────────────────────────────────
// Site-wide config
// ─────────────────────────────────────────────────────────────
export const siteConfig = {
  name: "Rosecrest Group Ltd",
  url: "https://www.rosecrestgroupltd.co.uk",
  defaultOgImage: "/og-default.svg", // place a 1200×630 image at /public/og-default.jpg
  twitterHandle: "", // add if/when one exists
};

// ─────────────────────────────────────────────────────────────
// Per-page metadata
// Keys MUST match the Next.js route exactly (no trailing slash).
// Update titles/descriptions here in one place — never inline.
// ─────────────────────────────────────────────────────────────
type PageMeta = {
  title: string;
  description: string;
  ogImage?: string; // optional override
};

export const pageMetadata: Record<string, PageMeta> = {
  "/": {
    title: "Expert Property Surveys & Building Consultancy | Rosecrest",
    description:
      "Rosecrest Group Ltd offers professional property surveys, housing consultancy, and compliance assessments for residential, commercial, and social housing sectors",
  },
  "/about": {
    title: "About Us - Rosecrest Registered Chartered Surveyors",
    description:
      "Rosecrest Group Ltd provides expert property surveys and consultancy services with integrity and precision, helping homes and businesses make informed decisions",
  },
  "/areas-we-cover": {
    title: "Areas We Cover | Building Surveyors Across London & Home Counties",
    description:
      "We provide building surveys and consultancy across London and the Home Counties. See where we cover and how we can support your property project.",
  },
  "/contact": {
    title: "Contact Rosecrest Group Ltd | Property Surveys & Consultancy",
    description:
      "Get in touch with Rosecrest Group Ltd for expert property surveys, consultancy services, and professional advice. We're here to assist with all your property needs",
  },
  "/homebuyer": {
    title: "Homebuyer Survey London | Level 1, 2 & 3 Surveys Explained",
    description:
      "Buying a property in London? We offer Level 1, 2 and 3 homebuyer surveys, helping you choose the right survey and avoid costly issues before you buy.",
  },
  "/homebuyer/survey-level-1": {
    title: "RICS Level 1 Survey London | Condition Report for Newer Homes",
    description:
      "Get a RICS Level 1 Survey in London. Ideal for newer homes, our condition reports highlight defects using a clear traffic light system for peace of mind.",
  },
  "/homebuyer/survey-level-2": {
    title: "RICS Level 2 Survey London | Homebuyer Report for Property Buyers",
    description:
      "Get a RICS Level 2 Survey in London. Our Homebuyer Reports highlight defects, risks and repairs, helping you make an informed property purchase decision.",
  },
  "/homebuyer/survey-level-3": {
    title: "RICS Level 3 Survey London | Building Survey for Older Properties",
    description:
      "Need a RICS Level 3 Survey in London? Our Building Surveys provide detailed defect analysis, repair advice and optional cost estimates for older or complex properties.",
  },
  "/landlord": {
    title: "Housing Disrepair Surveys London | Landlord Compliance & Reports",
    description:
      "Dealing with housing disrepair or damp issues? We provide inspections, HHSRS reports and landlord advice across London to support compliance and disputes.",
  },
  "/legal": {
    title: "Legal Property Inspections London | Independent Survey Reports",
    description:
      "Need a property inspection for a legal matter? We provide independent reports for housing claims, defects, damp, disputes and litigation across London.",
  },
  "/councils": {
    title: "Property Inspections for Councils | Surveys, Compliance & Reporting",
    description:
      "We support councils and housing providers with inspections, compliance reporting, damp and mould assessments, and asset management services across London.",
  },
  "/services": {
    title: "Property Services London | Surveys, Reports & Inspections",
    description:
      "Explore our property services in London, including surveys, party wall advice, damp and mould inspections, EPCs, thermographic surveys, AssocRICS mentoring and more.",
  },
  "/services/stock-condition": {
    title: "Stock Condition Surveys London | Housing & Asset Assessments",
    description:
      "We provide stock condition surveys in London, helping housing providers assess property condition, plan maintenance, meet compliance and manage assets effectively.",
  },
  "/services/damp-mould": {
    title: "Damp and Mould Survey London | Inspections, Reports & Treatment",
    description:
      "Need a damp and mould survey in London? We provide inspections, clear reports and treatment support to identify causes, resolve issues and meet compliance.",
  },
  "/services/party-wall": {
    title: "Party Wall Surveyor London | Notices, Awards & Advice",
    description:
      "Need a party wall surveyor in London? We prepare notices, schedules of condition and party wall awards to keep your project compliant and dispute-free.",
  },
  "/services/party-wall/notice-generator": {
    title: "Party Wall Notice Generator London | Generate Your Notice",
    description:
      "Need a party wall surveyor in London? We prepare notices, schedules of condition and party wall awards to keep your project compliant and dispute-free.",
  },
  "/services/cpr-35-reports": {
    title: "CPR 35 Expert Witness Reports London | Property Inspections",
    description:
      "Need a CPR 35 expert witness report in London? We provide independent property inspections, defect analysis and court-compliant reports for legal disputes.",
  },
  "/services/housing-disrepair": {
    title: "Housing Disrepair Survey London | Property Inspections & Reports",
    description:
      "Need a housing disrepair survey in London? We inspect properties, identify defects against UK standards and provide clear reports with repair recommendations.",
  },
  "/services/epc": {
    title: "EPC Certificate London | Energy Performance Certificates from £33",
    description:
      "Need an EPC certificate in London? We provide fast, compliant Energy Performance Certificates from £33 for landlords, sellers and property owners.",
  },
  "/services/environmental-reports": {
    title: "Environmental Reports London | Property Risk & Land Assessments",
    description:
      "Need an environmental report in London? We assess flood risk, contaminated land, ground stability and hazards to help buyers, landlords and developers make informed decisions.",
  },
  "/services/assocrics-mentoring": {
    title:
      "AssocRICS Mentoring & Counsellor Support | Rosecrest Group Ltd",
    description:
      "Structured mentoring and counsellor support for surveying professionals working towards Associate membership of RICS. Free 30-minute suitability call available.",
  },
  "/services/thermographic-surveys": {
    title: "Thermographic Building Surveys London | Thermal-Imaging Surveys",
    description:
      "Surveyor-led thermographic surveys using infrared imaging to identify surface-temperature patterns linked to heat loss, insulation, moisture and water ingress. Written report included.",
  },
  "/services/carpentry": {
    title: "Carpentry Services London | Bespoke Woodwork & Flooring",
    description:
      "Looking for carpentry services in London? We offer bespoke woodwork, floor installation and refurbishment, delivering high-quality craftsmanship for your home.",
  },
  "/services/carpet-cleaning": {
    title: "Carpet Cleaning London | Deep Clean, Stain & Odour Removal",
    description:
      "Need carpet cleaning in London? We offer deep cleaning, stain removal, steam cleaning and odour treatment to refresh your carpets and improve your home environment.",
  },
  "/services/deep-cleaning": {
    title: "Deep Cleaning Services London | Specialist & Biohazard Cleaning",
    description:
      "Need deep cleaning services in London? We provide specialist, biohazard and property cleaning to restore safe, hygienic environments for homes and businesses.",
  },
  "/services/handyman": {
    title: "Handyman Services London | Repairs, Installations & Maintenance",
    description:
      "Need handyman services in London? We handle repairs, installations, decorating and maintenance, delivering reliable solutions to keep your home in top condition.",
  },
  "/services/house-clearance": {
    title: "House Clearance London | Full, Estate & Item Removal Services",
    description:
      "Need house clearance in London? We offer full clearances, estate services and item removal, handling everything efficiently, respectfully and responsibly.",
  },
  "/services/painting-decorating": {
    title: "Painting and Decorating London | Interior & Home Décor Experts",
    description:
      "Looking for painting and decorating in London? We transform interiors with expert design, colour selection and professional finishes tailored to your home.",
  },
  "/services/plastering": {
    title: "Plastering Services London | Skimming, Repairs & Installations",
    description:
      "Need plastering services in London? We offer skimming, repairs, installations and decorative plastering to create smooth, durable finishes for your home.",
  },
  "/services/plumbing": {
    title: "Plumbing Services London | Repairs, Installations & Emergency",
    description:
      "Need plumbing services in London? We handle repairs, installations, drainage and emergency plumbing, delivering fast, reliable solutions for homes and businesses.",
  },
  "/services/tiling": {
    title: "Tiling Services London | Floor, Wall & Bathroom Tiling",
    description:
      "Looking for tiling services in London? We install floor and wall tiles, bathroom and kitchen tiling, plus repairs to create durable, high-quality finishes.",
  },
  "/faqs": {
    title: "FAQs | Property Surveys, Valuations & Reports in London | Rosecrest Group",
    description:
      "Have questions about property surveys, valuations and reports? Find clear answers on costs, timelines, EPCs and party wall services across London.",
  },
  "/request-inspection": {
    title: "Request a Property Inspection London | Book a Survey Today",
    description:
      "Request a property inspection in London. Tell us about your situation and our team will recommend the right survey and next steps for your property.",
  },
  "/privacy-policy": {
    title: "Privacy Policy | Rosecrest Group Ltd",
    description:
      "Read how Rosecrest Group Ltd collects, uses and protects your personal data, including cookies, tracking and your rights under UK data regulations.",
  },
  "/cookie-policy": {
    title: "Cookie Policy | Rosecrest Group Ltd",
    description:
      "Learn how Rosecrest Group Ltd uses cookies, tracking technologies and third-party tools, and how you can manage your cookie preferences on our website.",
  },
};

// ─────────────────────────────────────────────────────────────
// Helper: build Next.js Metadata for a given route.
// Returns full Metadata object including OG, Twitter, canonical.
// ─────────────────────────────────────────────────────────────
export function getPageMetadata(path: string): Metadata {
  const meta = pageMetadata[path];

  if (!meta) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[metadata] No entry for "${path}" in pageMetadata`);
    }
    return {
      title: siteConfig.name,
    };
  }

  const ogImage = meta.ogImage ?? siteConfig.defaultOgImage;
  const canonical = `${siteConfig.url}${path === "/" ? "" : path}`;

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      url: canonical,
      title: meta.title,
      description: meta.description,
      siteName: siteConfig.name,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [ogImage],
    },
  };
}