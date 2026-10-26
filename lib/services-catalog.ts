import { pageMetadata } from "@/lib/page-metadata";

// ─────────────────────────────────────────────────────────────
// Every public service, in one place.
// Read by JSON-LD, llms.txt, the sitemap and the public /api/ai catalog.
// Prices and turnarounds must match what the service page itself says.
// ─────────────────────────────────────────────────────────────

export type ServiceCategory = "survey" | "trade";

export type Audience =
  | "homebuyers"
  | "homeowners"
  | "landlords"
  | "tenants"
  | "legal"
  | "councils"
  | "housing-providers"
  | "developers"
  | "surveyors";

export type ServicePrice = {
  /** GBP. Lowest published price for this service. */
  from: number;
  /** Exactly what the price covers, as published on the service page. */
  note: string;
};

export type CatalogService = {
  path: string;
  name: string;
  category: ServiceCategory;
  summary: string;
  serviceType: string;
  audiences: Audience[];
  price?: ServicePrice;
  turnaround?: string;
  /** Plain-language situations someone would describe when they need this service. */
  intents: string[];
};

export const services: CatalogService[] = [
  {
    path: "/homebuyer/survey-level-1",
    name: "RICS Level 1 Condition Report",
    category: "survey",
    summary:
      "A brief condition report with traffic-light ratings for new builds and standard, unaltered homes built within the last 5–10 years.",
    serviceType: "RICS Home Survey Level 1",
    audiences: ["homebuyers"],
    turnaround:
      "1–2 hours on site; report within 2 working days of the inspection. Express 48-hour report available.",
    intents: [
      "buying a new build",
      "buying a modern flat",
      "basic survey before buying",
      "cheapest home survey",
      "condition report",
    ],
  },
  {
    path: "/homebuyer/survey-level-2",
    name: "RICS Level 2 HomeBuyer Report",
    category: "survey",
    summary:
      "The most common survey for conventional homes in reasonable condition, typically built within the last 30 years. Visual inspection, traffic-light ratings and advice on repairs and further investigation.",
    serviceType: "RICS Home Survey Level 2",
    audiences: ["homebuyers"],
    turnaround:
      "2–3 hours on site; report within 5 working days of the inspection (typically 3–5). Express 48-hour report available.",
    intents: [
      "buying a house",
      "buying a flat",
      "homebuyer report",
      "homebuyer survey",
      "survey before buying",
      "first time buyer survey",
      "survey with valuation",
    ],
  },
  {
    path: "/homebuyer/survey-level-3",
    name: "RICS Level 3 Building Survey",
    category: "survey",
    summary:
      "The most detailed survey, for older, altered, extended, listed or non-standard properties. Full defect analysis with repair advice and optional repair cost estimates.",
    serviceType: "RICS Home Survey Level 3",
    audiences: ["homebuyers", "homeowners"],
    turnaround:
      "Report within 5–7 working days of the inspection. Express 48-hour report available.",
    intents: [
      "buying an old house",
      "victorian house survey",
      "period property survey",
      "listed building survey",
      "full structural survey",
      "building survey",
      "property needs renovation",
    ],
  },
  {
    path: "/services/damp-mould",
    name: "Damp, mould and condensation inspection",
    category: "survey",
    summary:
      "Independent on-site inspection to identify damp, mould and condensation, their causes and the remedial action needed, with photographs and a written report. Mould treatment is also available.",
    serviceType: "Damp and mould survey",
    audiences: ["landlords", "tenants", "homeowners", "councils", "housing-providers"],
    price: {
      from: 450,
      note: "Fast-track inspection at a fixed £450. Treatment is priced separately at £25 per m².",
    },
    intents: [
      "damp in my house",
      "mould in my flat",
      "condensation problem",
      "black mould",
      "tenant complaint about damp",
      "awaab's law",
      "rising damp",
      "penetrating damp",
    ],
  },
  {
    path: "/services/party-wall",
    name: "Party wall surveyor",
    category: "survey",
    summary:
      "Party wall notices, schedules of condition and party wall awards under the Party Wall etc. Act 1996, acting as agreed surveyor or for one owner.",
    serviceType: "Party wall surveying",
    audiences: ["homeowners", "developers"],
    turnaround:
      "Straightforward cases can finish in a few weeks; where an award is needed it typically takes 6–8 weeks.",
    intents: [
      "neighbour is extending",
      "building an extension next to a neighbour",
      "loft conversion party wall",
      "party wall agreement",
      "party wall award",
      "basement excavation near neighbour",
      "received a party wall notice",
    ],
  },
  {
    path: "/services/party-wall/notice-generator",
    name: "Party wall notice generator",
    category: "survey",
    summary:
      "A free online tool that generates a party wall notice under the Party Wall etc. Act 1996 from the owners' and works details.",
    serviceType: "Party wall notice",
    audiences: ["homeowners", "developers"],
    intents: [
      "write a party wall notice",
      "party wall notice template",
      "serve a party wall notice myself",
    ],
  },
  {
    path: "/services/cpr-35-reports",
    name: "CPR 35 expert witness reports",
    category: "survey",
    summary:
      "Independent, court-compliant expert reports under Civil Procedure Rules Part 35 for disrepair claims, defects, boundary and valuation disputes.",
    serviceType: "Expert witness report",
    audiences: ["legal", "tenants", "landlords"],
    turnaround:
      "Draft report usually within 10–15 working days of instruction and inspection; urgent deadlines can be discussed.",
    intents: [
      "expert witness surveyor",
      "solicitor needs a surveyor report",
      "court report on property defects",
      "litigation property inspection",
    ],
  },
  {
    path: "/services/housing-disrepair",
    name: "Housing disrepair surveys",
    category: "survey",
    summary:
      "Inspections that identify defects against UK housing standards, with a report and repair recommendations, for tenants, landlords and their representatives.",
    serviceType: "Housing disrepair survey",
    audiences: ["tenants", "landlords", "legal", "councils", "housing-providers"],
    intents: [
      "housing disrepair claim",
      "landlord won't fix repairs",
      "hhsrs assessment",
      "disrepair report for solicitor",
      "council house repairs",
    ],
  },
  {
    path: "/services/stock-condition",
    name: "Stock condition surveys",
    category: "survey",
    summary:
      "Stock condition and asset surveys for housing providers to assess condition, lifecycle costs, compliance and long-term maintenance planning.",
    serviceType: "Stock condition survey",
    audiences: ["councils", "housing-providers", "landlords"],
    intents: [
      "stock condition survey",
      "asset management survey",
      "planned maintenance programme",
      "housing association surveys",
    ],
  },
  {
    path: "/services/epc",
    name: "Energy Performance Certificates (EPC)",
    category: "survey",
    summary:
      "Residential and commercial Energy Performance Certificates for selling, letting and compliance. Valid for 10 years.",
    serviceType: "Energy Performance Certificate",
    audiences: ["landlords", "homeowners"],
    price: { from: 33, note: "Residential EPCs from £33." },
    turnaround:
      "Assessment usually within 1–2 working days, with the certificate issued shortly after the visit.",
    intents: [
      "need an epc",
      "epc for renting",
      "epc for selling",
      "energy performance certificate",
      "commercial epc",
    ],
  },
  {
    path: "/services/environmental-reports",
    name: "Environmental reports",
    category: "survey",
    summary:
      "Environmental risk reports covering flood risk, contaminated land, radon, ground stability and other hazards for buyers, landlords and developers.",
    serviceType: "Environmental risk report",
    audiences: ["homebuyers", "landlords", "developers"],
    intents: [
      "flood risk report",
      "contaminated land",
      "ground stability",
      "radon",
      "environmental search",
    ],
  },
  {
    path: "/services/thermographic-surveys",
    name: "Thermographic building surveys",
    category: "survey",
    summary:
      "Surveyor-led thermal-imaging surveys that find surface-temperature patterns linked to heat loss, missing insulation, air leakage, moisture and water ingress, with a written report.",
    serviceType: "Thermographic survey",
    audiences: ["homeowners", "homebuyers", "landlords"],
    price: {
      from: 175,
      note: "£175 incl. VAT as an add-on to a Level 2 or Level 3 survey; standalone surveys from £325 incl. VAT.",
    },
    intents: [
      "thermal imaging survey",
      "heat loss survey",
      "find a leak",
      "missing insulation",
      "cold spots in house",
    ],
  },
  {
    path: "/services/assocrics-mentoring",
    name: "AssocRICS mentoring and counsellor support",
    category: "survey",
    summary:
      "Structured mentoring and counsellor support for surveying professionals working towards Associate membership of RICS. Free 30-minute suitability call.",
    serviceType: "Professional mentoring",
    audiences: ["surveyors"],
    price: {
      from: 120,
      note: "Free 30-minute suitability call; pay-as-you-go mentoring £120 incl. VAT per hour.",
    },
    intents: [
      "assocrics mentor",
      "rics counsellor",
      "become an associate of rics",
      "assocrics assessment help",
    ],
  },
  {
    path: "/services/handyman",
    name: "Handyman services",
    category: "trade",
    summary: "Property maintenance, minor repairs and installations.",
    serviceType: "Handyman",
    audiences: ["homeowners", "landlords", "housing-providers"],
    intents: ["small repairs", "property maintenance", "odd jobs"],
  },
  {
    path: "/services/carpentry",
    name: "Carpentry",
    category: "trade",
    summary: "Repairs, installations, flooring and bespoke joinery.",
    serviceType: "Carpentry",
    audiences: ["homeowners", "landlords"],
    intents: ["carpenter", "fit a door", "floor installation", "joinery"],
  },
  {
    path: "/services/carpet-cleaning",
    name: "Carpet cleaning",
    category: "trade",
    summary: "Deep, steam and stain-removal carpet cleaning for homes and commercial properties.",
    serviceType: "Carpet cleaning",
    audiences: ["homeowners", "landlords"],
    intents: ["carpet cleaning", "end of tenancy carpet clean", "stain removal"],
  },
  {
    path: "/services/deep-cleaning",
    name: "Deep cleaning",
    category: "trade",
    summary: "Specialist, biohazard, end-of-tenancy and void property cleaning.",
    serviceType: "Deep cleaning",
    audiences: ["landlords", "housing-providers", "homeowners"],
    intents: ["end of tenancy clean", "void property clean", "biohazard cleaning"],
  },
  {
    path: "/services/plastering",
    name: "Plastering",
    category: "trade",
    summary: "Skimming, repairs, installations and decorative plastering.",
    serviceType: "Plastering",
    audiences: ["homeowners", "landlords"],
    intents: ["plasterer", "skim a wall", "crack in plaster"],
  },
  {
    path: "/services/house-clearance",
    name: "House clearance",
    category: "trade",
    summary: "Full, estate and item clearances for voids, refurbishments and relocations.",
    serviceType: "House clearance",
    audiences: ["homeowners", "landlords", "housing-providers"],
    intents: ["clear a house", "probate clearance", "rubbish removal"],
  },
  {
    path: "/services/tiling",
    name: "Tiling",
    category: "trade",
    summary: "Floor, wall, bathroom and kitchen tiling, plus tile repairs.",
    serviceType: "Tiling",
    audiences: ["homeowners", "landlords"],
    intents: ["tiler", "bathroom tiling", "kitchen tiles"],
  },
  {
    path: "/services/plumbing",
    name: "Plumbing",
    category: "trade",
    summary: "Plumbing repairs, installations, drainage and emergency call-outs.",
    serviceType: "Plumbing",
    audiences: ["homeowners", "landlords", "housing-providers"],
    intents: ["plumber", "leak", "blocked drain", "emergency plumber"],
  },
  {
    path: "/services/painting-decorating",
    name: "Painting and decorating",
    category: "trade",
    summary: "Interior and exterior painting and decorating to a professional finish.",
    serviceType: "Painting and decorating",
    audiences: ["homeowners", "landlords"],
    intents: ["painter", "decorator", "repaint a flat"],
  },
];

/** Sector pages: who Rosecrest works for. */
export const sectors = [
  { path: "/homebuyer", audience: "Homebuyers choosing a Level 1, 2 or 3 survey" },
  { path: "/landlord", audience: "Landlords dealing with disrepair, damp, HHSRS and Awaab's Law" },
  { path: "/legal", audience: "Solicitors and legal teams needing independent reports" },
  { path: "/councils", audience: "Councils and housing providers needing inspections and compliance reporting" },
] as const;

export function sectorName(path: string): string {
  return pageMetadata[path]?.name ?? path;
}

export function getService(path: string): CatalogService | undefined {
  return services.find((service) => service.path === path);
}
