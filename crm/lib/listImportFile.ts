export const IMPORT_ROW_LIMIT = 2000;

export const SAMPLE_LIST_CSV = `First name,Last name,Email,Phone,Company
Ada,Lovelace,ada@example.com,020 7946 0958,Analytical Engines Ltd
`;

export type ImportField = "firstName" | "lastName" | "email" | "phone" | "company" | "skip";

const FIELD_LABELS: Record<ImportField, string> = {
  firstName: "First name",
  lastName: "Last name",
  email: "Email",
  phone: "Phone",
  company: "Company",
  skip: "Don't import",
};

export const IMPORT_FIELDS: ImportField[] = ["email", "firstName", "lastName", "phone", "company", "skip"];

export function importFieldLabel(field: ImportField): string {
  return FIELD_LABELS[field];
}

const ALIASES: Record<Exclude<ImportField, "skip">, string[]> = {
  firstName: ["first name", "firstname", "given name"],
  lastName: ["last name", "lastname", "surname"],
  email: ["email", "email address", "e-mail", "e-mail address"],
  phone: ["phone", "phone number", "telephone", "mobile"],
  company: ["company", "company name", "organisation", "organization"],
};

export function autoMapHeader(header: string): ImportField {
  const key = header.trim().toLowerCase();
  for (const field of Object.keys(ALIASES) as Exclude<ImportField, "skip">[]) {
    if (ALIASES[field].includes(key)) return field;
  }
  return "skip";
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
