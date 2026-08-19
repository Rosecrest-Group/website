export type WorkflowALevel = 1 | 2 | 3;

export type WorkflowACatalogEntry = {
  name: string;
  level: WorkflowALevel;
  label: string;
  channel: "EMAIL" | "SMS";
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

export function normalizeTemplateName(name: string) {
  return name.replace(/[–—]/g, "-").replace(/\s+/g, " ").trim().toLowerCase();
}

export function findWorkflowAEntry(templateName: string) {
  const exact = WORKFLOW_A_TEMPLATE_CATALOG.find((entry) => entry.name === templateName);
  if (exact) return exact;
  const normalized = normalizeTemplateName(templateName);
  return WORKFLOW_A_TEMPLATE_CATALOG.find(
    (entry) => normalizeTemplateName(entry.name) === normalized
  );
}
