import type { ProspectCard } from "@/crm/types/prospecting";

export type PillVariant = "completed" | "failed" | "in-review" | "pending";

export type SalesField = { label: string; value: string };

export type SalesGateRow = {
  gate: string;
  gateLabel: string;
  result: string;
  resultLabel: string;
  resultVariant: PillVariant;
  reason: string;
};

export type SalesBuyer = { id: string; line: string };

export type SalesCardView = {
  title: string;
  laneLabel: string;
  workflowLabel: string;
  decisionLabel: string;
  decisionVariant: PillVariant;
  decisionReason: string | null;
  standingGrade: string;
  standingLabel: string;
  standingVariant: PillVariant;
  scoreDisplay: string | null;
  scoreBand: string | null;
  scoreBreakdown: string | null;
  identity: SalesField[];
  gates: SalesGateRow[];
  needKind: "signals" | "search-only" | "unknown";
  needLines: string[];
  offer: string;
  buyers: SalesBuyer[];
  buyersEmpty: string;
  value: string;
  framework: string;
  procurement: string;
  network: string;
  standingLines: string[];
};

const UNKNOWN = "Unknown";
const NONE_THIS_PASS = "None this pass";

const LANE_LABELS: Record<string, string> = {
  estate_agency_sales: "Estate agency — sales",
  estate_agency_lettings: "Estate agency — lettings",
  public_social_housing: "Public / social housing",
  legal_expert: "Legal / expert",
  development_party_wall: "Development / party wall",
  mortgage_lending: "Mortgage lending",
  property_operators: "Property operators",
};

const WORKFLOW_LABELS: Record<string, string> = {
  sales: "Sales",
  bid: "Bid",
  monitor: "Monitor",
};

const DECISION_LABELS: Record<string, string> = {
  proceed: "Proceed",
  proceed_strategic: "Proceed (strategic)",
  proceed_with_conditions: "Proceed with conditions",
  management_review: "Management review",
  monitor: "Monitor",
  subcontract_route: "Subcontract",
  referral_route: "Referral",
  reject: "Reject",
  do_not_contact: "Do not contact",
};

const GATE_LABELS: Record<string, string> = {
  legitimacy: "Legitimacy",
  uk_operation: "UK operation",
  property_relationship: "Property relationship",
  service_compatibility: "Service compatibility",
  geography: "Geography",
  commercial_value: "Commercial value",
  financial_risk: "Financial risk",
  public_standing: "Public standing",
  procurement_access: "Procurement access",
  strategic_access: "Strategic access",
  crm_history: "CRM history",
  conflicts: "Conflicts",
};

const SCORE_LABELS: Record<string, string> = {
  service_match: "match",
  need: "need",
  value: "value",
  repeat_framework: "repeat",
  buyer: "buyer",
  geography: "geography",
  procurement_access: "access",
  accreditation: "accreditation",
  cross_sell: "cross-sell",
};

const CHECK_LABELS: Record<string, string> = {
  gazette_insolvency: "Gazette",
  hse: "HSE",
  sra: "SRA authorisation",
  fca: "FCA",
  rsh: "Regulator of Social Housing",
  charity_commission: "Charity Commission",
  housing_ombudsman: "Housing Ombudsman",
};

const STANDING_CHECK_ORDER = [
  "gazette_insolvency",
  "hse",
  "sra",
  "fca",
  "rsh",
  "housing_ombudsman",
  "charity_commission",
] as const;

const JUNK_PERSON_NAME_RE =
  /^(never\b.*|our people|meet the(?: team)?|about us|contact us|latest news|follow us|subscribe|cookies?)$/i;
const GENERIC_MAILBOX_RE = /^(info|enquiries|enquiry|admin|office|contact|hello|mail|reception|london)$/i;
const DISCOVERED_VIA_RE = /^discovered via\b/i;

export function toSalesCard(card: ProspectCard): SalesCardView {
  const decisionKey = card.decision ?? "unevaluated";
  return {
    title: card.legalName,
    laneLabel: humanLabel(card.lane, LANE_LABELS),
    workflowLabel: humanLabel(card.workflow, WORKFLOW_LABELS),
    decisionLabel: humanLabel(decisionKey, DECISION_LABELS),
    decisionVariant: decisionVariant(card.decision),
    decisionReason: oneLine(card.decisionReason),
    standingGrade: card.standingGrade,
    standingLabel: standingLabel(card.standingGrade),
    standingVariant: standingVariant(card.standingGrade),
    scoreDisplay: card.scoreDisplay,
    scoreBand: card.scoreBand,
    scoreBreakdown: scoreBreakdown(card),
    identity: identityFields(card),
    gates: card.gates.map((gate) => ({
      gate: gate.gate,
      gateLabel: humanLabel(gate.gate, GATE_LABELS),
      result: gate.result,
      resultLabel: gateResultLabel(gate.result),
      resultVariant: gateResultVariant(gate.result),
      reason: oneLine(gate.reason) ?? "—",
    })),
    ...needSection(card),
    offer: humanLabel(card.lane, LANE_LABELS) || UNKNOWN,
    buyers: buyersFrom(card),
    buyersEmpty: "No published buyers stored yet.",
    value: valueLine(card),
    framework: frameworkLine(card),
    procurement: procurementLine(card),
    network: networkLine(card),
    standingLines: standingLines(card),
  };
}

function identityFields(card: ProspectCard): SalesField[] {
  const companyNo = scalarText(chipValue(card, "identity.company_number"));
  const status = titleCaseWords(scalarText(chipValue(card, "identity.status")));
  const address =
    formatAddress(chipValue(card, "identity.registered_address")) ??
    oneLine(card.fca?.addressLine);
  const domain =
    scalarText(chipValue(card, "identity.domain")) ??
    hostFrom(chipValue(card, "contact.website")) ??
    hostFrom(card.fca?.website);
  const fields: SalesField[] = [
    { label: "Legal name", value: card.legalName || UNKNOWN },
    { label: "Company no.", value: companyNo ?? UNKNOWN },
    { label: "Status", value: status ?? UNKNOWN },
    { label: "Address", value: address ?? UNKNOWN },
    { label: "Domain", value: domain ?? UNKNOWN },
  ];
  if (card.sra) {
    fields.push({ label: "SRA number", value: card.sra.sraNumber ?? UNKNOWN });
  }
  if (card.fca) {
    fields.push({ label: "FCA FRN", value: card.fca.frn ?? UNKNOWN });
  }
  return fields;
}

function needSection(card: ProspectCard): Pick<SalesCardView, "needKind" | "needLines"> {
  const statement = card.needStatement?.trim() ?? "";
  const searchOnly = Boolean(statement) && DISCOVERED_VIA_RE.test(statement);
  const procurementNeed = oneLine(card.procurement?.title);
  const planningNeed =
    card.planning?.reference &&
    `Planning ${card.planning.reference}${card.planning.status ? ` · ${humanLabel(card.planning.status, {})}` : ""}`;

  if (procurementNeed) {
    return { needKind: "signals", needLines: [procurementNeed] };
  }
  if (statement && !searchOnly) {
    return { needKind: "signals", needLines: [statement] };
  }
  if (planningNeed) {
    return { needKind: "signals", needLines: [planningNeed] };
  }
  if (searchOnly) {
    return { needKind: "search-only", needLines: ["No buying signal this pass — found via search."] };
  }
  return { needKind: "unknown", needLines: [] };
}

function buyersFrom(card: ProspectCard): SalesBuyer[] {
  const usable = card.contacts.filter((contact) => {
    if (contact.suppressed) return false;
    const name = contact.personName?.trim() ?? "";
    if (name && JUNK_PERSON_NAME_RE.test(name)) return false;
    return Boolean(name || contact.email);
  });

  const named: typeof usable = [];
  const mailboxes: typeof usable = [];
  for (const contact of usable) {
    if (isOfficeMailbox(contact)) mailboxes.push(contact);
    else named.push(contact);
  }

  const chosen = [...named.slice(0, 5)];
  if (mailboxes[0]) chosen.push(mailboxes[0]);

  return chosen.map((contact) => ({
    id: contact.id,
    line: [contact.personName, contact.roleTitle, contact.email].filter(Boolean).join(" · ") || "Unnamed contact",
  }));
}

function isOfficeMailbox(contact: ProspectCard["contacts"][number]): boolean {
  const name = contact.personName?.trim() ?? "";
  if (looksLikePersonName(name)) return false;
  if (contact.confidence === "generic") return true;
  if (!name) return true;
  const local = contact.email?.split("@")[0]?.toLowerCase() ?? "";
  return Boolean(local && GENERIC_MAILBOX_RE.test(local));
}

function looksLikePersonName(name: string): boolean {
  if (!name || JUNK_PERSON_NAME_RE.test(name)) return false;
  return name.trim().split(/\s+/).length >= 2;
}

function valueLine(card: ProspectCard): string {
  const amount = card.procurement?.totalValueExVat;
  if (typeof amount !== "number" || !Number.isFinite(amount)) return UNKNOWN;
  const band = bandLabel(amount);
  return band ? `${formatGbp(amount)} ex VAT (${band})` : `${formatGbp(amount)} ex VAT`;
}

function frameworkLine(card: ProspectCard): string {
  const ref =
    scalarText(chipValue(card, "framework.ref")) ??
    scalarText(chipValue(card, "procurement.commercial_tool")) ??
    scalarText(chipValue(card, "procurement.framework_ref"));
  return ref ?? NONE_THIS_PASS;
}

function procurementLine(card: ProspectCard): string {
  if (!card.procurement) return NONE_THIS_PASS;
  const parts = [
    oneLine(card.procurement.title),
    oneLine(card.procurement.status),
    card.procurement.currentNoticeType || card.procurement.currentNoticeId
      ? [card.procurement.currentNoticeType, card.procurement.currentNoticeId].filter(Boolean).join(" ")
      : null,
  ].filter(Boolean);
  return parts.join(" · ") || card.procurement.ocid;
}

function networkLine(card: ProspectCard): string {
  const name = scalarText(chipValue(card, "network.name")) ?? scalarText(chipValue(card, "network.reach_note"));
  return name ?? NONE_THIS_PASS;
}

function standingLines(card: ProspectCard): string[] {
  const latest = new Map<string, string>();
  for (const check of card.checks) {
    latest.set(check.checkType, check.outcome);
  }

  const lines: string[] = [];
  for (const type of STANDING_CHECK_ORDER) {
    if (lines.length >= 5) break;
    if (type === "sra" && card.sra) {
      const auth = card.sra.status
        ? card.sra.status
        : card.sra.authorised
          ? "Authorised"
          : outcomeLabel(latest.get("sra") ?? null);
      lines.push(`SRA authorisation: ${auth}`);
      if (lines.length < 5) {
        const decisions =
          card.sra.outcome === "not_checked"
            ? "Not checked"
            : `${card.sra.publishedDecisionCount} published`;
        lines.push(`SRA published decisions: ${decisions}`);
      }
      continue;
    }
    if (type === "fca" && card.fca) {
      const auth = card.fca.status ?? (card.fca.authorised ? "Authorised" : outcomeLabel(latest.get("fca")));
      lines.push(`FCA: ${auth}`);
      continue;
    }
    const outcome = latest.get(type);
    if (!outcome) continue;
    lines.push(`${CHECK_LABELS[type]}: ${outcomeLabel(outcome)}`);
  }

  return lines.slice(0, 5);
}

function scoreBreakdown(card: ProspectCard): string | null {
  if (!card.scores.length) return null;
  return card.scores
    .map((row) => `${SCORE_LABELS[row.component] ?? humanLabel(row.component, {})} ${row.points}`)
    .join(" / ");
}

function chipValue(card: ProspectCard, fieldPath: string): unknown {
  const chip = card.chips.find((row) => row.fieldPath === fieldPath);
  if (!chip) return undefined;
  return parseMaybeJson(chip.value);
}

function parseMaybeJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return value;
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return value;
  }
}

function scalarText(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string") return oneLine(value);
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return null;
}

function formatAddress(value: unknown): string | null {
  const parsed = parseMaybeJson(value);
  if (typeof parsed === "string") return oneLine(parsed);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
  const rec = parsed as Record<string, unknown>;
  const parts = [
    rec.address_line_1,
    rec.address_line_2,
    rec.locality ?? rec.town,
    rec.region,
    rec.postal_code ?? rec.postalCode ?? rec.postcode,
    rec.country,
  ];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of parts) {
    const text = typeof part === "string" ? part.trim() : "";
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(text);
  }
  return out.length ? out.join(", ") : null;
}

function hostFrom(value: unknown): string | null {
  const text = scalarText(value);
  if (!text) return null;
  const stripped = text.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  const host = stripped.split("/")[0]?.trim() ?? "";
  return host || null;
}

function humanLabel(raw: string, map: Record<string, string>): string {
  if (!raw) return UNKNOWN;
  if (map[raw]) return map[raw];
  return raw
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function titleCaseWords(value: string | null): string | null {
  if (!value) return null;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) return value;
  return value
    .toLowerCase()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function oneLine(value: string | null | undefined, max = 180): string | null {
  if (value == null) return null;
  const text = value.replace(/\s+/g, " ").trim();
  if (!text) return null;
  if (text.startsWith("{") || text.startsWith("[")) return null;
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function gateResultLabel(result: string): string {
  const key = result.toLowerCase();
  if (key === "pass" || key === "clear" || key === "accessible") return "Pass";
  if (key === "fail" || key === "conflict") return "Fail";
  if (key === "review") return "Review";
  if (key === "unknown" || key === "not_checked") return "Unknown";
  return humanLabel(result, {});
}

function gateResultVariant(result: string): PillVariant {
  const key = result.toLowerCase();
  if (key === "pass" || key === "clear" || key === "accessible") return "completed";
  if (key === "fail" || key === "conflict") return "failed";
  if (key === "review") return "in-review";
  return "pending";
}

function decisionVariant(decision: string | null): PillVariant {
  if (decision === "proceed" || decision === "proceed_strategic") return "completed";
  if (decision === "reject" || decision === "do_not_contact") return "failed";
  if (decision === "management_review" || decision === "proceed_with_conditions") return "in-review";
  return "pending";
}

function standingVariant(grade: string): PillVariant {
  if (grade === "green" || grade === "green_amber") return "completed";
  if (grade === "red" || grade === "amber_red") return "failed";
  if (grade === "amber") return "in-review";
  return "pending";
}

function standingLabel(grade: string): string {
  if (grade === "green_amber") return "Green / amber";
  if (grade === "amber_red") return "Amber / red";
  return humanLabel(grade, {});
}

function outcomeLabel(outcome: string | null | undefined): string {
  if (!outcome) return UNKNOWN;
  if (outcome === "not_checked") return "Not checked";
  if (outcome === "clear") return "Clear";
  if (outcome === "findings") return "Findings";
  if (outcome === "error") return "Error";
  return humanLabel(outcome, {});
}

function formatGbp(amount: number): string {
  return `£${amount.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`;
}

function bandLabel(amount: number): string | null {
  if (amount < 10_000) return "Below threshold";
  if (amount < 25_000) return "Qualifying";
  if (amount < 100_000) return "Strong";
  if (amount < 500_000) return "Major";
  return "Strategic";
}
