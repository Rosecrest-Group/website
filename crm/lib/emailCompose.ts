import type { LeadDetail } from "@/crm/types";

export type EmailToKind = "client" | "agent" | "vendor" | "surveyor" | "other";

export type EmailToOption = {
  kind: Exclude<EmailToKind, "other">;
  label: string;
  email: string;
  name?: string | null;
};

export type LeadEmailContacts = {
  customerEmail?: string | null;
  customerName?: string | null;
  agentEmail?: string | null;
  agentName?: string | null;
  vendorEmail?: string | null;
  vendorName?: string | null;
  surveyorEmail?: string | null;
  surveyorName?: string | null;
};

export type EmailSendFields =
  | { ok: false; error: string }
  | { ok: true; toAddress?: string; ccAddresses?: string[] };

export function parseEmailAddresses(raw: string): string[] {
  return raw
    .split(/[,;\s]+/)
    .map((address) => address.trim().toLowerCase())
    .filter(Boolean);
}

/** Add addresses from a draft, skipping blanks and duplicates. */
export function commitEmailChips(existing: string[], raw: string): string[] {
  const next = [...existing];
  for (const address of parseEmailAddresses(raw)) {
    if (!next.includes(address)) next.push(address);
  }
  return next;
}

export function emailContactsFromLead(lead: LeadDetail | null | undefined): LeadEmailContacts {
  if (!lead) return {};
  const customer = lead.customer;
  const job = lead.job;
  return {
    customerEmail: customer?.email ?? null,
    customerName: customer
      ? [customer.firstName, customer.lastName].filter(Boolean).join(" ").trim() || null
      : null,
    agentEmail: job?.agentEmail ?? null,
    agentName: job?.agentName ?? null,
    vendorEmail: job?.vendorEmail ?? null,
    vendorName: job?.vendorName ?? null,
    surveyorEmail: job?.assignedTo?.email ?? null,
    surveyorName: job?.assignedTo?.fullName ?? null,
  };
}

export function mergeEmailContacts(
  base: LeadEmailContacts,
  override?: LeadEmailContacts | null
): LeadEmailContacts {
  if (!override) return base;
  return {
    customerEmail: override.customerEmail ?? base.customerEmail,
    customerName: override.customerName ?? base.customerName,
    agentEmail: override.agentEmail ?? base.agentEmail,
    agentName: override.agentName ?? base.agentName,
    vendorEmail: override.vendorEmail ?? base.vendorEmail,
    vendorName: override.vendorName ?? base.vendorName,
    surveyorEmail: override.surveyorEmail ?? base.surveyorEmail,
    surveyorName: override.surveyorName ?? base.surveyorName,
  };
}

export function buildEmailToOptions(
  contacts: LeadEmailContacts,
  fallbackCustomerName: string
): EmailToOption[] {
  const options: EmailToOption[] = [
    {
      kind: "client",
      label: "Client",
      email: contacts.customerEmail?.trim() || "",
      name: contacts.customerName?.trim() || fallbackCustomerName,
    },
  ];
  const agentEmail = contacts.agentEmail?.trim();
  if (agentEmail) {
    options.push({
      kind: "agent",
      label: "Agent",
      email: agentEmail,
      name: contacts.agentName,
    });
  }
  const vendorEmail = contacts.vendorEmail?.trim();
  if (vendorEmail) {
    options.push({
      kind: "vendor",
      label: "Vendor",
      email: vendorEmail,
      name: contacts.vendorName,
    });
  }
  const surveyorEmail = contacts.surveyorEmail?.trim();
  if (surveyorEmail) {
    options.push({
      kind: "surveyor",
      label: "Surveyor",
      email: surveyorEmail,
      name: contacts.surveyorName,
    });
  }
  return options;
}

/** Resolve send `toAddress`. Client uses the API default (omit). */
export function resolveEmailToAddress(
  kind: EmailToKind,
  options: EmailToOption[],
  otherEmail: string
): string | undefined {
  if (kind === "other") {
    const address = otherEmail.trim();
    return address || undefined;
  }
  if (kind === "client") return undefined;
  return options.find((option) => option.kind === kind)?.email.trim() || undefined;
}

export function matchEmailToKind(
  fromAddress: string | null | undefined,
  options: EmailToOption[],
  customerEmail?: string | null
): { kind: EmailToKind; otherEmail?: string } {
  const from = fromAddress?.trim().toLowerCase();
  if (!from) return { kind: "client" };

  for (const option of options) {
    if (option.email.trim().toLowerCase() === from) {
      return { kind: option.kind };
    }
  }

  if (customerEmail?.trim().toLowerCase() === from) {
    return { kind: "client" };
  }

  return { kind: "other", otherEmail: fromAddress?.trim() ?? from };
}

export function emailSendFields(input: {
  channel: string;
  subject: string;
  toKind: EmailToKind;
  options: EmailToOption[];
  otherToEmail: string;
  ccAddresses: string[];
}): EmailSendFields {
  if (input.channel !== "EMAIL") return { ok: true };
  if (!input.subject.trim()) return { ok: false, error: "Subject is required for email." };

  const toAddress = resolveEmailToAddress(input.toKind, input.options, input.otherToEmail);
  if (input.toKind === "other" && !toAddress) {
    return { ok: false, error: "Enter a To email address." };
  }
  if (input.toKind !== "client" && input.toKind !== "other" && !toAddress) {
    return { ok: false, error: "Selected contact has no email address." };
  }

  return {
    ok: true,
    ...(toAddress ? { toAddress } : {}),
    ...(input.ccAddresses.length > 0 ? { ccAddresses: input.ccAddresses } : {}),
  };
}
