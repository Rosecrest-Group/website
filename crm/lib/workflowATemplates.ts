export type WorkflowALevel = 1 | 2 | 3;
export type WorkflowSendGroup = "workflow_a" | "post_payment";
export type WorkflowSendRecipient = "customer" | "agent" | "surveyor";
export type WorkflowSendCc = "surveyor";

export type WorkflowACatalogEntry = {
  name: string;
  level: WorkflowALevel;
  label: string;
  channel: "EMAIL" | "SMS";
};

export type PostPaymentCatalogEntry = {
  name: string;
  label: string;
  channel: "EMAIL" | "SMS";
  recipient: WorkflowSendRecipient;
  ccRecipient?: WorkflowSendCc;
  requireReport?: boolean;
};

export type WorkflowSendCatalogEntry = {
  name: string;
  label: string;
  channel: "EMAIL" | "SMS";
  group: WorkflowSendGroup;
  recipient: WorkflowSendRecipient;
  level?: WorkflowALevel;
  ccRecipient?: WorkflowSendCc;
  requireReport?: boolean;
};

/** Canonical MessageTemplate.name values for Master Workflow A (L1–L3). */
export const WORKFLOW_A_TEMPLATE_CATALOG: WorkflowACatalogEntry[] = [
  { name: "Initial Quotation Email - Level 1", level: 1, label: "Initial quotation (email)", channel: "EMAIL" },
  { name: "Sms - Initial Unchanged", level: 1, label: "Initial SMS", channel: "SMS" },
  { name: "48-HOUR FOLLOW-UP – LEVEL 1", level: 1, label: "48-hour follow-up (email)", channel: "EMAIL" },
  { name: "72-HOUR FOLLOW-UP – LEVEL 1", level: 1, label: "72-hour follow-up (email)", channel: "EMAIL" },
  { name: "1-WEEK FOLLOW-UP – LEVEL 1", level: 1, label: "1-week follow-up (email)", channel: "EMAIL" },
  { name: "2-WEEK FOLLOW-UP – LEVEL 1", level: 1, label: "2-week follow-up (email)", channel: "EMAIL" },
  { name: "2-WEEK SMS – LEVEL 1", level: 1, label: "2-week SMS", channel: "SMS" },

  { name: "Initial Quotation Email - Level 2", level: 2, label: "Initial quotation (email)", channel: "EMAIL" },
  { name: "Sms - Initial - Level 2", level: 2, label: "Initial SMS", channel: "SMS" },
  { name: "48-HOUR FOLLOW-UP – LEVEL 2", level: 2, label: "48-hour follow-up (email)", channel: "EMAIL" },
  { name: "72-HOUR FOLLOW-UP – LEVEL 2", level: 2, label: "72-hour follow-up (email)", channel: "EMAIL" },
  { name: "1-WEEK FOLLOW-UP – LEVEL 2", level: 2, label: "1-week follow-up (email)", channel: "EMAIL" },
  { name: "2-WEEK FOLLOW-UP – LEVEL 2", level: 2, label: "2-week follow-up (email)", channel: "EMAIL" },
  { name: "2-WEEK SMS – LEVEL 2", level: 2, label: "2-week SMS", channel: "SMS" },

  { name: "Initial Quotation Email - Level 3", level: 3, label: "Initial quotation (email)", channel: "EMAIL" },
  { name: "Sms - Initial - Level 3", level: 3, label: "Initial SMS", channel: "SMS" },
  { name: "48-HOUR FOLLOW-UP – LEVEL 3", level: 3, label: "48-hour follow-up (email)", channel: "EMAIL" },
  { name: "72-HOUR FOLLOW-UP – LEVEL 3", level: 3, label: "72-hour follow-up (email)", channel: "EMAIL" },
  { name: "1-WEEK FOLLOW-UP – LEVEL 3", level: 3, label: "1-week follow-up (email)", channel: "EMAIL" },
  { name: "2-WEEK FOLLOW-UP – LEVEL 3", level: 3, label: "2-week follow-up (email)", channel: "EMAIL" },
  { name: "2-WEEK SMS – LEVEL 3", level: 3, label: "2-week SMS", channel: "SMS" },
];

/** Canonical MessageTemplate.name values for post-payment (Workflow B/C) stages. */
export const POST_PAYMENT_TEMPLATE_CATALOG: PostPaymentCatalogEntry[] = [
  {
    name: "PAYMENT RECEIVED (ACCESS DETAILS NEEDED)",
    label: "Payment received — access needed (email)",
    channel: "EMAIL",
    recipient: "customer",
  },
  {
    name: "PAYMENT RECEIVED (ACCESS DETAILS PROVIDED)",
    label: "Payment received — access on file (email)",
    channel: "EMAIL",
    recipient: "customer",
  },
  { name: "PAYMENT RECEIVED SMS", label: "Payment received (SMS)", channel: "SMS", recipient: "customer" },
  { name: "ACCESS REQUEST", label: "Access request (email)", channel: "EMAIL", recipient: "agent" },
  { name: "SURVEYOR ASSIGNED", label: "Surveyor assigned (email)", channel: "EMAIL", recipient: "surveyor" },
  {
    name: "INSPECTION CONFIRMED",
    label: "Inspection confirmed (email)",
    channel: "EMAIL",
    recipient: "customer",
    ccRecipient: "surveyor",
  },
  {
    name: "INSPECTION COMPLETE",
    label: "Inspection complete (email)",
    channel: "EMAIL",
    recipient: "customer",
  },
  {
    name: "REPORT ISSUED",
    label: "Report issued (email)",
    channel: "EMAIL",
    recipient: "customer",
    requireReport: true,
  },
  { name: "REVIEW REQUEST – LEVEL 1", label: "Review request (email)", channel: "EMAIL", recipient: "customer" },
  { name: "REVIEW REQUEST SMS – LEVEL 1", label: "Review request (SMS)", channel: "SMS", recipient: "customer" },
];

export const WORKFLOW_SEND_TEMPLATE_CATALOG: WorkflowSendCatalogEntry[] = [
  ...WORKFLOW_A_TEMPLATE_CATALOG.map((entry) => ({
    ...entry,
    group: "workflow_a" as const,
    recipient: "customer" as const,
  })),
  ...POST_PAYMENT_TEMPLATE_CATALOG.map((entry) => ({
    ...entry,
    group: "post_payment" as const,
  })),
];

export function normalizeTemplateName(name: string) {
  return name.replace(/[–—]/g, "-").replace(/\s+/g, " ").trim().toLowerCase();
}

function findCatalogEntry<T extends { name: string }>(catalog: T[], templateName: string) {
  const exact = catalog.find((entry) => entry.name === templateName);
  if (exact) return exact;
  const normalized = normalizeTemplateName(templateName);
  return catalog.find((entry) => normalizeTemplateName(entry.name) === normalized);
}

export function findWorkflowAEntry(templateName: string) {
  return findCatalogEntry(WORKFLOW_A_TEMPLATE_CATALOG, templateName);
}

export function findWorkflowSendEntry(templateName: string) {
  return findCatalogEntry(WORKFLOW_SEND_TEMPLATE_CATALOG, templateName);
}
