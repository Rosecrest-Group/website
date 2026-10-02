import type { CustomerType } from "@/crm/types";

export const IMPORT_ROW_LIMIT = 2000;

export const SAMPLE_LIST_CSV = `First name,Last name,Email,Phone,Company,Type
Ada,Lovelace,ada@example.com,020 7946 0958,Analytical Engines Ltd,Legal
`;

export type ImportField = "firstName" | "lastName" | "email" | "phone" | "company" | "customerType" | "skip";

const FIELD_LABELS: Record<ImportField, string> = {
  firstName: "First name",
  lastName: "Last name",
  email: "Email",
  phone: "Phone",
  company: "Company",
  customerType: "Type",
  skip: "Don't import",
};

export const IMPORT_FIELDS: ImportField[] = [
  "email",
  "firstName",
  "lastName",
  "phone",
  "company",
  "customerType",
  "skip",
];

export function importFieldLabel(field: ImportField): string {
  return FIELD_LABELS[field];
}

const ALIASES: Record<Exclude<ImportField, "skip">, string[]> = {
  firstName: ["first name", "firstname", "given name"],
  lastName: ["last name", "lastname", "surname"],
  email: ["email", "email address", "e-mail", "e-mail address"],
  phone: ["phone", "phone number", "telephone", "mobile"],
  company: ["company", "company name", "organisation", "organization"],
  customerType: [
    "type",
    "customer type",
    "lead type",
    "contact type",
    "category",
    "tag",
    "tags",
  ],
};

export function autoMapHeader(header: string): ImportField {
  const key = header.trim().toLowerCase();
  for (const field of Object.keys(ALIASES) as Exclude<ImportField, "skip">[]) {
    if (ALIASES[field].includes(key)) return field;
  }
  return "skip";
}

const CUSTOMER_TYPES: CustomerType[] = ["HOMEBUYER", "LANDLORD", "LEGAL", "COUNCIL", "TRADE"];

/** Solicitor / legal-firm wording. Checked before landlord so “landlord solicitors” stays LEGAL. */
const LEGAL_TYPE_RE =
  /\b(solicitor|solicitors|legal|lawyer|lawyers|law\s*firm|law\s*firms|conveyancer|conveyancers|sra)\b/i;
const LANDLORD_TYPE_RE = /\b(landlord|landlords|lettings?)\b/i;
const HOMEBUYER_TYPE_RE = /\b(home\s*buyers?|homeowners?|buyers?)\b/i;
const COUNCIL_TYPE_RE = /\b(council|local\s*authorit(?:y|ies)|housing\s*assoc)/i;
const TRADE_TYPE_RE = /\b(trade|trades?person|contractor)\b/i;

/**
 * Map a spreadsheet type/tag cell (or list name / company) onto CRM customerType.
 * Solicitor wording becomes LEGAL — never LANDLORD.
 */
export function parseCustomerType(raw: string): CustomerType | null {
  const text = raw.trim();
  if (!text) return null;
  const compact = text.replace(/[\s-]+/g, "_").toUpperCase();
  if ((CUSTOMER_TYPES as string[]).includes(compact)) {
    return compact as CustomerType;
  }
  if (LEGAL_TYPE_RE.test(text)) return "LEGAL";
  if (LANDLORD_TYPE_RE.test(text)) return "LANDLORD";
  if (HOMEBUYER_TYPE_RE.test(text)) return "HOMEBUYER";
  if (COUNCIL_TYPE_RE.test(text)) return "COUNCIL";
  if (TRADE_TYPE_RE.test(text)) return "TRADE";
  return null;
}

export function inferImportedCustomerType(input: {
  typeValue?: string;
  listName?: string;
  company?: string;
}): CustomerType | null {
  return (
    parseCustomerType(input.typeValue ?? "") ??
    parseCustomerType(input.listName ?? "") ??
    parseCustomerType(input.company ?? "")
  );
}

export type ParsedColumn = {
  header: string;
  samples: string[];
};

export type ParsedSheet = {
  columns: ParsedColumn[];
  rows: string[][];
  hadHeader: boolean;
};

function parseTable(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  const src = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]!;
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else inQuotes = false;
      } else cell += ch;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === delimiter) {
      row.push(cell);
      cell = "";
      continue;
    }
    if (ch === "\n") {
      row.push(cell);
      cell = "";
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      continue;
    }
    cell += ch;
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    if (row.some((value) => value.trim() !== "")) rows.push(row);
  }
  return rows;
}

function delimiterFor(text: string): string {
  const first = text.split(/\r?\n/, 1)[0] ?? "";
  const tabs = first.split("\t").length - 1;
  const commas = first.split(",").length - 1;
  return tabs > commas ? "\t" : ",";
}

function looksLikeHeader(cells: string[]): boolean {
  return cells.some((cell) => autoMapHeader(cell) !== "skip");
}

export function parseSpreadsheet(text: string): ParsedSheet | { error: string } {
  if (text.includes("\u0000")) {
    return { error: "Save the spreadsheet as CSV or TXT, or paste the rows." };
  }
  const table = parseTable(text, delimiterFor(text));
  if (table.length === 0) return { error: "This file has no contacts." };
  const hadHeader = looksLikeHeader(table[0] ?? []);
  const header = hadHeader ? table[0]! : [];
  const data = hadHeader ? table.slice(1) : table;
  if (data.length === 0) return { error: "This file has no contacts." };
  if (data.length > IMPORT_ROW_LIMIT) {
    return { error: "This file has more than 2,000 contacts. Split it and import again." };
  }
  const width = Math.max(header.length, ...data.map((row) => row.length));
  const columns: ParsedColumn[] = [];
  for (let index = 0; index < width; index++) {
    const samples = data
      .map((row) => (row[index] ?? "").trim())
      .filter(Boolean)
      .slice(0, 3);
    columns.push({
      header: (header[index] ?? "").trim() || `Column ${index + 1}`,
      samples,
    });
  }
  return { columns, rows: data, hadHeader };
}

export function sheetFileName(file: File): string | { error: string } {
  const name = file.name.trim();
  const lower = name.toLowerCase();
  if (!lower.endsWith(".csv") && !lower.endsWith(".txt")) {
    return { error: "Save the spreadsheet as CSV or TXT, or paste the rows." };
  }
  if (file.size > 1_500_000) {
    return { error: "This file is too large. Split it and import again." };
  }
  return name.slice(0, 180) || "import.csv";
}
