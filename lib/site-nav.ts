// ─────────────────────────────────────────────────────────────
// Marketing site navigation: header menu, "who we help" lanes and footer.
// One place for every link so the header, footer and pages stay in step.
// ─────────────────────────────────────────────────────────────

export type NavLink = { label: string; href: string };

/** A main-menu item; `dropdown` items open a panel instead of navigating. */
export type MainNavItem = NavLink & { dropdown?: "guides" };

/** The four homepage lanes, shown in the header bar on every page after the homepage. */
export const LANE_LINKS: NavLink[] = [
  { label: "Buying a property", href: "/homebuyer" },
  { label: "Landlord or property owner", href: "/landlord" },
  { label: "Solicitor or legal professional", href: "/legal" },
  { label: "Council or organisation", href: "/councils" },
];

export const MAIN_NAV_LINKS: MainNavItem[] = [
  { label: "Areas we cover", href: "/areas-we-cover" },
  { label: "About Rosecrest", href: "/about" },
  { label: "Guides", href: "/guides", dropdown: "guides" },
  { label: "Contact", href: "/contact" },
];

/** Survey services menu, in two columns. */
export const SURVEY_SERVICE_COLUMNS: NavLink[][] = [
  [
    { label: "RICS Level 1, 2 and 3 surveys", href: "/homebuyer" },
    { label: "Damp, Mould and Condensation Survey", href: "/services/damp-mould" },
    { label: "Housing disrepair surveys", href: "/services/housing-disrepair" },
    { label: "CPR 35 expert witness reports", href: "/services/cpr-35-reports" },
    { label: "Party wall surveys", href: "/services/party-wall" },
  ],
  [
    { label: "Stock condition surveys", href: "/services/stock-condition" },
    { label: "Thermographic surveys", href: "/services/thermographic-surveys" },
    { label: "Energy Performance Certificates", href: "/services/epc" },
    { label: "Environmental reports", href: "/services/environmental-reports" },
    { label: "AssocRICS mentoring", href: "/services/assocrics-mentoring" },
  ],
];

export const TRADE_SERVICE_LINKS: NavLink[] = [
  { label: "Plastering", href: "/services/plastering" },
  { label: "Plumbing", href: "/services/plumbing" },
  { label: "Tiling", href: "/services/tiling" },
  { label: "Carpentry and flooring", href: "/services/carpentry" },
  { label: "Painting and decorating", href: "/services/painting-decorating" },
  { label: "Handyman and maintenance", href: "/services/handyman" },
  { label: "Deep and specialist cleaning", href: "/services/deep-cleaning" },
  { label: "Carpet and upholstery cleaning", href: "/services/carpet-cleaning" },
  { label: "House clearance", href: "/services/house-clearance" },
];

/** Guide pages, used by the footer and the guides index. */
export const GUIDE_ROUTES = {
  awaabsLaw: "/guides/awaabs-law",
  hhsrs: "/guides/hhsrs",
  level2vs3: "/guides/level-2-vs-level-3-survey",
} as const;

/** "Guides" dropdown in the header. */
export const GUIDE_MENU_LINKS: NavLink[] = [
  { label: "Level 2 vs Level 3 survey", href: GUIDE_ROUTES.level2vs3 },
  { label: "Awaab’s Law guide", href: GUIDE_ROUTES.awaabsLaw },
  { label: "HHSRS guide", href: GUIDE_ROUTES.hhsrs },
];

export const TOOL_MENU_LINKS: NavLink[] = [
  { label: "Mould removal estimate", href: "/services/damp-mould#treatment" },
  { label: "Party wall notice generator", href: "/services/party-wall/notice-generator" },
];

export type FooterColumn = {
  title: string;
  links: (NavLink | { label: string; action: "terms" })[];
};

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Who we help",
    links: [...LANE_LINKS, { label: "Areas we cover", href: "/areas-we-cover" }],
  },
  {
    title: "Survey services",
    links: [
      { label: "RICS Level 1, 2 and 3 surveys", href: "/homebuyer" },
      { label: "Damp, Mould and Condensation Survey", href: "/services/damp-mould" },
      { label: "Housing disrepair surveys", href: "/services/housing-disrepair" },
      { label: "CPR 35 expert witness reports", href: "/services/cpr-35-reports" },
      { label: "Stock condition surveys", href: "/services/stock-condition" },
      { label: "Party wall surveys", href: "/services/party-wall" },
      { label: "Trade services", href: "/services#trade-services" },
      { label: "All services", href: "/services" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Rosecrest", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Guides", href: "/guides" },
      { label: "FAQs", href: "/faqs" },
      { label: "Independence policy", href: "/services/cpr-35-reports#independence" },
      { label: "Terms of Engagement", action: "terms" },
      { label: "Complaints procedure", href: "/complaints-procedure" },
      { label: "Privacy policy", href: "/privacy-policy" },
    ],
  },
];

/** Options for "What do you need help with?" on the call-back form. */
export const CALLBACK_NEEDS = [
  "RICS Level 1 Condition Report",
  "RICS Level 2 Homebuyer Survey",
  "RICS Level 3 Building Survey",
  "Damp, Mould and Condensation Survey",
  "Mould treatment",
  "Housing disrepair survey",
  "CPR 35 expert witness report",
  "Party wall",
  "HHSRS inspection",
  "Stock condition survey",
  "Thermographic survey",
  "Energy Performance Certificate (EPC)",
  "Environmental report",
  "Trade services and repairs",
  "AssocRICS mentoring",
  "Not sure yet",
];
