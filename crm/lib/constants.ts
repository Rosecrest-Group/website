/** Base path for all CRM routes */
export const CRM_BASE_PATH = "/crm";

/** Public CRM pages — no shell, no session required */
export const CRM_PUBLIC_ROUTES = [
  `${CRM_BASE_PATH}/login`,
  `${CRM_BASE_PATH}/forgot-password`,
  `${CRM_BASE_PATH}/reset-password`,
  `${CRM_BASE_PATH}/accept-invite`,
  `${CRM_BASE_PATH}/documentation`,
] as const;

/** @deprecated use CRM_PUBLIC_ROUTES */
export const CRM_AUTH_ROUTES = CRM_PUBLIC_ROUTES;

export function isCrmPublicRoute(pathname: string) {
  return CRM_PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function isCrmAuthRoute(pathname: string) {
  return isCrmPublicRoute(pathname);
}

export const CRM_DATA_DUMP_PATH = `${CRM_BASE_PATH}/data-dump`;

export const CRM_LEGACY_PATH = `${CRM_BASE_PATH}/legacy`;

export function isCrmDataDumpRoute(pathname: string) {
  return pathname === CRM_DATA_DUMP_PATH || pathname.startsWith(`${CRM_DATA_DUMP_PATH}/`);
}

export function isCrmLegacyRoute(pathname: string) {
  return pathname === CRM_LEGACY_PATH || pathname.startsWith(`${CRM_LEGACY_PATH}/`);
}

export type DataDumpNavItem = {
  label: string;
  href: string;
};

export const DATA_DUMP_NAV_ITEMS: DataDumpNavItem[] = [
  { label: "Contacts", href: `${CRM_DATA_DUMP_PATH}/contacts` },
  { label: "Opportunities", href: `${CRM_DATA_DUMP_PATH}/opportunities` },
  { label: "Inbox", href: `${CRM_DATA_DUMP_PATH}/inbox` },
];

export type CrmNavItem = {
  label: string;
  href: string;
  badge?: number;
};

export type CrmNavSection = {
  title: string;
  items: CrmNavItem[];
};

/** Sidebar nav aligned with PRD §13.1 — only routes with working UI. */
export const CRM_NAV_SECTIONS: CrmNavSection[] = [
  {
    title: "Workspace",
    items: [
      { label: "Dashboard", href: CRM_BASE_PATH },
      { label: "Inbox", href: `${CRM_BASE_PATH}/inbox` },
      { label: "Customers", href: `${CRM_BASE_PATH}/customers` },
    ],
  },
  {
    title: "Collaboration",
    items: [{ label: "Team Chat", href: `${CRM_BASE_PATH}/conversations` }],
  },
  {
    title: "Operations",
    items: [
      { label: "Leads", href: `${CRM_BASE_PATH}/leads` },
      { label: "Jobs", href: `${CRM_BASE_PATH}/jobs` },
      { label: "Tasks", href: `${CRM_BASE_PATH}/tasks` },
      { label: "Schedule", href: `${CRM_BASE_PATH}/schedule` },
    ],
  },
  {
    title: "Automation",
    items: [
      { label: "Workflows", href: `${CRM_BASE_PATH}/workflows` },
      { label: "Templates", href: `${CRM_BASE_PATH}/templates` },
    ],
  },
  {
    title: "Dashboards",
    items: [
      { label: "Operations", href: `${CRM_BASE_PATH}/analytics` },
      { label: "Finance", href: `${CRM_BASE_PATH}/revenue` },
      { label: "SLAs", href: `${CRM_BASE_PATH}/slas` },
    ],
  },
  {
    title: "Legacy",
    items: [
      { label: "Contacts", href: `${CRM_LEGACY_PATH}/contacts` },
      { label: "Opportunities", href: `${CRM_LEGACY_PATH}/opportunities` },
      { label: "Inbox", href: `${CRM_LEGACY_PATH}/inbox` },
    ],
  },
  {
    title: "Settings",
    items: [
      { label: "Team", href: `${CRM_BASE_PATH}/settings/team` },
      { label: "Audit log", href: `${CRM_BASE_PATH}/settings/audit-log` },
      { label: "Integrations", href: `${CRM_BASE_PATH}/settings/integrations` },
      { label: "API Partners", href: `${CRM_BASE_PATH}/settings/partners` },
      { label: "API Docs", href: `${CRM_BASE_PATH}/documentation` },
    ],
  },
];

export const USER_ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "ADMIN", label: "Admin" },
  { value: "OPS", label: "Operations" },
  { value: "SURVEYOR", label: "Surveyor" },
  { value: "TRADE_OPERATIVE", label: "Trade Operative" },
  { value: "QC", label: "QC" },
  { value: "FINANCE", label: "Finance" },
  { value: "READ_ONLY", label: "Read Only" },
];

/** Lead intake sources (must match API LeadSource enum). */
export const LEAD_SOURCES: { value: string; label: string }[] = [
  { value: "PINLOCAL", label: "Pinlocal" },
  { value: "COMPARE_MY_MOVE", label: "Compare My Move" },
  { value: "REALLYMOVING", label: "ReallyMoving" },
  { value: "GET_A_SURVEYOR", label: "Get a Surveyor" },
  { value: "WEBSITE", label: "Website (homebuyer booking)" },
  { value: "WEBSITE_CONTACT_FORM", label: "Website contact form" },
  { value: "PARTY_WALL_TOOL", label: "Party Wall Tool" },
  { value: "DIRECT", label: "Direct" },
  { value: "DIRECT_PHONE", label: "Direct (phone)" },
  { value: "DIRECT_EMAIL", label: "Direct (email)" },
  { value: "REFERRAL", label: "Referral" },
  { value: "THIRD_PARTY", label: "Third Party" },
  { value: "OTHER", label: "Other" },
];

export const LEAD_STAGE_LABELS: Record<string, string> = {
  NEW: "New lead",
  QUOTE_SENT: "Quote sent",
  FOLLOWING_UP: "Following up",
  AWAITING_PAYMENT: "Awaiting payment",
  PAUSED: "Paused",
  CONVERTED: "Converted",
  LOST: "Lost",
};

export const LOST_REASON_OPTIONS: { value: string; label: string }[] = [
  { value: "CHOSE_COMPETITOR", label: "Chose competitor" },
  { value: "TIMING_WRONG", label: "Timing wrong" },
  { value: "PROPERTY_FELL_THROUGH", label: "Property fell through" },
  { value: "NO_LONGER_NEEDED", label: "No longer needed" },
  { value: "UNRESPONSIVE", label: "Unresponsive" },
  { value: "DND_REQUESTED", label: "Do not contact requested" },
  { value: "DUPLICATE", label: "Duplicate" },
  { value: "WRONG_NUMBER", label: "Wrong number" },
  { value: "OUT_OF_AREA", label: "Out of area" },
  { value: "OTHER", label: "Other" },
];

/** Workflow trigger values (must match API dispatcher / seed). */
export const WORKFLOW_TRIGGERS: { value: string; label: string }[] = [
  { value: "lead.created", label: "Lead created" },
  { value: "lead.followup.48hr", label: "Lead follow-up (48h)" },
  { value: "lead.followup.72hr", label: "Lead follow-up (72h)" },
  { value: "lead.lost", label: "Lead lost" },
  { value: "payment.received", label: "Payment received" },
  { value: "payment.refunded", label: "Payment refunded" },
  { value: "job.stage_changed", label: "Job stage changed" },
  { value: "job.inspection_reminder", label: "Inspection reminder" },
  { value: "job.assigned", label: "Job assigned" },
  { value: "job.sla_warning", label: "SLA warning" },
  { value: "job.sla_breach", label: "SLA breach" },
  { value: "job.report_delivered", label: "Report delivered" },
  { value: "job.completed", label: "Job completed" },
];

export const TASK_STATUS_LABELS: Record<string, string> = {
  OPEN: "Open",
  DONE: "Done",
};

export const SURVEY_LEVELS: { value: string; label: string }[] = [
  { value: "LEVEL_1", label: "Level 1" },
  { value: "LEVEL_2", label: "Level 2" },
  { value: "LEVEL_3", label: "Level 3" },
  { value: "CPR_35", label: "CPR-35" },
];

export const SURVEY_LEVEL_LABELS: Record<string, string> = Object.fromEntries(
  SURVEY_LEVELS.map((level) => [level.value, level.label])
);

export const BEDROOM_BANDS = [
  "STUDIO",
  "1_BED",
  "2_BED",
  "3_BED",
  "4_BED",
  "5_BED",
  "6_BED",
  "7_BED",
  "8_BED",
  "9_BED",
  "ABOVE_9",
] as const;

export type BedroomBand = (typeof BEDROOM_BANDS)[number];

export const BEDROOM_BAND_LABELS: Record<string, string> = {
  STUDIO: "Studio",
  "1_BED": "1 bed",
  "2_BED": "2 bed",
  "3_BED": "3 bed",
  "4_BED": "4 bed",
  "5_BED": "5 bed",
  "6_BED": "6 bed",
  "7_BED": "7 bed",
  "8_BED": "8 bed",
  "9_BED": "9 bed",
  ABOVE_9: "9+ bed",
};

/** Flexi-Fee inc-VAT (£) — keep in sync with api/src/config/stripePaymentCatalog.ts */
export const FLEXI_FEE_INC_VAT: Record<BedroomBand, { l1: number; l2: number; l3: number }> = {
  STUDIO: { l1: 280.99, l2: 330.99, l3: 550.99 },
  "1_BED": { l1: 313.99, l2: 363.99, l3: 611.49 },
  "2_BED": { l1: 368.99, l2: 418.99, l3: 666.49 },
  "3_BED": { l1: 396.49, l2: 446.49, l3: 693.99 },
  "4_BED": { l1: 440.49, l2: 490.49, l3: 737.99 },
  "5_BED": { l1: 478.99, l2: 528.99, l3: 776.49 },
  "6_BED": { l1: 511.99, l2: 561.99, l3: 809.49 },
  "7_BED": { l1: 566.99, l2: 616.99, l3: 864.49 },
  "8_BED": { l1: 621.99, l2: 671.99, l3: 919.49 },
  "9_BED": { l1: 676.99, l2: 726.99, l3: 974.49 },
  ABOVE_9: { l1: 731.99, l2: 781.99, l3: 1029.49 },
};

export function flexiFeeIncVat(
  surveyLevel: string | null | undefined,
  bedroomBand: string | null | undefined
): number | null {
  if (!bedroomBand || !(bedroomBand in FLEXI_FEE_INC_VAT)) return null;
  const fees = FLEXI_FEE_INC_VAT[bedroomBand as BedroomBand];
  if (surveyLevel === "LEVEL_1") return fees.l1;
  if (surveyLevel === "LEVEL_2") return fees.l2;
  if (surveyLevel === "LEVEL_3") return fees.l3;
  return null;
}
