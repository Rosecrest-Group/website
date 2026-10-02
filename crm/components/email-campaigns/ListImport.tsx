"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/crm/lib/api";
import {
  IMPORT_FIELDS,
  SAMPLE_LIST_CSV,
  autoMapHeader,
  importFieldLabel,
  inferImportedCustomerType,
  parseCustomerType,
  parseSpreadsheet,
  sheetFileName,
  type ImportField,
  type ParsedSheet,
} from "@/crm/lib/listImportFile";
import type { CustomerType } from "@/crm/types";
import type {
  ContactListImportError,
  ContactListImportRecord,
  ContactListMemberRow,
} from "@/crm/types/prospecting";
import { CUSTOMER_TYPE_LABELS, CUSTOMER_TYPE_OPTIONS } from "@/crm/lib/constants";
import { cn } from "@/lib/utils";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import TextAreaField from "@/crm/components/ui/TextAreaField";
import SelectField from "@/crm/components/ui/SelectField";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import Table, { type Column } from "@/crm/components/ui/Table";
import ConfirmModal from "@/crm/components/ui/ConfirmModal";
import EditImportedContactModal from "@/crm/components/email-campaigns/EditImportedContactModal";

type MapRow = {
  index: number;
  header: string;
  preview: string;
};

type HistoryRow = {
  id: string;
  when: string;
  source: string;
  added: string;
  already: string;
  errors: string;
};

function downloadText(filename: string, contents: string) {
  const blob = new Blob([contents], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function errorsCsv(errors: ContactListImportError[]): string {
  const lines = ["Line,Reason", ...errors.map((row) => `${row.line},"${row.reason.replaceAll('"', '""')}"`)];
  return `${lines.join("\n")}\n`;
}

function cell(row: string[], mapping: ImportField[], field: ImportField): string {
  const index = mapping.indexOf(field);
  if (index < 0) return "";
  return (row[index] ?? "").trim();
}

export default function ListImport() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const fileRef = useRef<HTMLInputElement>(null);
  const [listName, setListName] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [readingFile, setReadingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [paste, setPaste] = useState("");
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [usingPaste, setUsingPaste] = useState(false);
  const [sampleSaved, setSampleSaved] = useState(false);
  const [sheet, setSheet] = useState<ParsedSheet | null>(null);
  const [sourceLabel, setSourceLabel] = useState("");
  const [mapping, setMapping] = useState<ImportField[]>([]);
  const [expectEmail, setExpectEmail] = useState(false);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [result, setResult] = useState<ContactListImportRecord | null>(null);
  const [history, setHistory] = useState<ContactListImportRecord[]>([]);
  const [undoTarget, setUndoTarget] = useState<ContactListImportRecord | null>(null);
  const [undoing, setUndoing] = useState(false);
  const [undoError, setUndoError] = useState<string | null>(null);
  const [defaultType, setDefaultType] = useState<CustomerType | "">("");
  const [defaultTypeTouched, setDefaultTypeTouched] = useState(false);
  const [importedMembers, setImportedMembers] = useState<ContactListMemberRow[]>([]);
  const [editMember, setEditMember] = useState<ContactListMemberRow | null>(null);

  const load = useCallback(async () => {
    const [detail, imports] = await Promise.all([api.getContactList(id, { page: 1, limit: 1 }), api.listContactListImports(id)]);
    setListName(detail.name);
    setHistory(imports.items);
    if (!defaultTypeTouched) {
      setDefaultType(inferImportedCustomerType({ listName: detail.name }) ?? "");
    }
  }, [id, defaultTypeTouched]);

  useEffect(() => {
    setLoading(true);
    void load()
      .catch((err: unknown) => setLoadError(err instanceof Error ? err.message : "Could not load list"))
      .finally(() => setLoading(false));
  }, [load]);

  function applySheet(next: ParsedSheet, label: string) {
    setSheet(next);
    setSourceLabel(label);
    setMapping(next.columns.map((column) => autoMapHeader(column.header)));
    setImported(false);
    setImportError(null);
    setResult(null);
    setImportedMembers([]);
  }

  async function takeFile(file: File) {
    setReadingFile(true);
    setFileError(null);
    setPasteError(null);
    try {
      const named = sheetFileName(file);
      if (typeof named !== "string") {
        setFileError(named.error);
        return;
      }
      const text = await file.text();
      const parsed = parseSpreadsheet(text);
      if ("error" in parsed) {
        setFileError(parsed.error);
        return;
      }
      applySheet(parsed, named);
    } finally {
      setReadingFile(false);
    }
  }

  function usePasted() {
    setUsingPaste(true);
    setPasteError(null);
    setFileError(null);
    const parsed = parseSpreadsheet(paste);
    if ("error" in parsed) {
      setPasteError(parsed.error);
      setUsingPaste(false);
      return;
    }
    applySheet(parsed, "Pasted contacts");
    setUsingPaste(false);
  }

  function assignField(index: number, field: ImportField) {
    setImported(false);
    setMapping((current) => {
      const next = [...current];
      if (field !== "skip") {
        for (let i = 0; i < next.length; i++) {
          if (i !== index && next[i] === field) next[i] = "skip";
        }
      }
      next[index] = field;
      return next;
    });
  }

  const mappedCount = sheet?.rows.length ?? 0;
  const hasIdentifier = mapping.includes("email") || mapping.includes("phone");

  const mapRows: MapRow[] = useMemo(
    () =>
      (sheet?.columns ?? []).map((column, index) => ({
        index,
        header: column.header,
        preview:
          mapping[index] === "customerType"
            ? column.samples
                .map((sample) => {
                  const mapped = parseCustomerType(sample);
                  return mapped ? `${sample} → ${CUSTOMER_TYPE_LABELS[mapped]}` : sample;
                })
                .join(", ") || "—"
            : column.samples.join(", ") || "—",
      })),
    [sheet, mapping],
  );

  const mapColumns: Column<MapRow>[] = [
    { key: "header", header: "Column in file", render: (value) => String(value) },
    { key: "preview", header: "Preview", render: (value) => String(value) },
    {
      key: "field",
      header: "List field",
      render: (_value, row) => (
        <SelectField
          aria-label={`Field for ${row.header}`}
          value={mapping[row.index] ?? "skip"}
          onChange={(event) => assignField(row.index, event.target.value as ImportField)}
        >
          {IMPORT_FIELDS.map((field) => (
            <option key={field} value={field}>
              {importFieldLabel(field)}
            </option>
          ))}
        </SelectField>
      ),
    },
  ];

  async function completeImport() {
    if (!sheet || importing || imported) return;
    if (!expectEmail) {
      setImportError("Confirm these contacts expect email from you.");
      return;
    }
    if (!hasIdentifier) {
      setImportError("Map an email or a phone column.");
      return;
    }
    setImporting(true);
    setImportError(null);
    try {
      const fallbackType =
        defaultType || inferImportedCustomerType({ listName }) || undefined;
      const rows = sheet.rows.map((row, index) => {
        const company = cell(row, mapping, "company").slice(0, 200);
        const typeValue = cell(row, mapping, "customerType");
        const customerType =
          inferImportedCustomerType({ typeValue, listName, company }) ?? fallbackType;
        return {
          line: (sheet.hadHeader ? 2 : 1) + index,
          firstName: cell(row, mapping, "firstName").slice(0, 200),
          lastName: cell(row, mapping, "lastName").slice(0, 200),
          email: cell(row, mapping, "email").slice(0, 320),
          phone: cell(row, mapping, "phone").slice(0, 80),
          company,
          ...(customerType ? { customerType } : {}),
        };
      });
      const payload = {
        sourceLabel,
        expectEmail: true as const,
        ...(fallbackType ? { customerType: fallbackType } : {}),
        rows,
      };
      let importedRow: ContactListImportRecord;
      try {
        importedRow = await api.importContactList(id, payload);
      } catch (err) {
        const message = err instanceof Error ? err.message : "";
        const sentType = Boolean(payload.customerType) || rows.some((row) => row.customerType);
        if (!sentType || !/customerType|unrecogni[sz]ed|unexpected field/i.test(message)) {
          throw err;
        }
        importedRow = await api.importContactList(id, {
          sourceLabel,
          expectEmail: true,
          rows: rows.map((row) => ({
            line: row.line,
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            phone: row.phone,
            company: row.company,
          })),
        });
      }
      setResult(importedRow);
      setImported(true);
      setHistory((current) => [importedRow, ...current.filter((row) => row.id !== importedRow.id)]);
      const cutoff = Date.now() - 10 * 60 * 1000;
      const detail = await api.getContactList(id, { page: 1, limit: 50 });
      setImportedMembers(
        detail.members.filter((member) => {
          const added = Date.parse(member.addedAt);
          return Number.isFinite(added) && added >= cutoff;
        }),
      );
      toast.success("Contacts imported.");
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Could not import");
    } finally {
      setImporting(false);
    }
  }

  async function confirmUndo() {
    if (!undoTarget || undoing) return;
    setUndoing(true);
    setUndoError(null);
    try {
      const outcome = await api.undoContactListImport(id, undoTarget.id);
      const undoneAt = new Date().toISOString();
      setHistory((current) =>
        current.map((row) => (row.id === undoTarget.id ? { ...row, undoneAt: row.undoneAt ?? undoneAt } : row)),
      );
      if (result?.id === undoTarget.id) setResult({ ...result, undoneAt: result.undoneAt ?? undoneAt });
      setUndoTarget(null);
      toast.success(outcome.alreadyUndone ? "This import was already undone." : "Import undone. Contacts were kept.");
    } catch (err) {
      setUndoError(err instanceof Error ? err.message : "Could not undo");
    } finally {
      setUndoing(false);
    }
  }

  const historyRows: HistoryRow[] = history.map((row) => ({
    id: row.id,
    when: new Date(row.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }),
    source: row.sourceLabel,
    added: String(row.added),
    already: String(row.alreadyMembers),
    errors: String(row.errorCount),
  }));

  const historyColumns: Column<HistoryRow>[] = [
    { key: "when", header: "When", render: (value) => String(value) },
    { key: "source", header: "Source", render: (value) => String(value) },
    { key: "added", header: "Added", render: (value) => String(value) },
    { key: "already", header: "Already on list", render: (value) => String(value) },
    { key: "errors", header: "Errors", render: (value) => String(value) },
    {
      key: "undo",
      header: "",
      render: (_value, row) => {
        const record = history.find((item) => item.id === row.id);
        if (!record) return null;
        if (record.undoneAt) return <span className="text-sm text-ink-muted">Undone</span>;
        return (
          <div className="flex flex-wrap gap-2">
            {record.errorCount > 0 ? (
              <SecondaryButton
                type="button"
                size="small"
                className="w-auto"
                onClick={() => downloadText(`import-errors-${record.id}.csv`, errorsCsv(record.errors))}
              >
                Errors
              </SecondaryButton>
            ) : null}
            <SecondaryButton
              type="button"
              size="small"
              className="w-auto"
              onClick={() => {
                setUndoError(null);
                setUndoTarget(record);
              }}
            >
              Undo
            </SecondaryButton>
          </div>
        );
      },
    },
  ];

  if (loading && !listName) {
    return (
      <CrmPageContent>
        <LoadingSpinner />
      </CrmPageContent>
    );
  }

  if (loadError && !listName) {
    return (
      <CrmPageContent>
        <p className="text-sm text-orange-700">{loadError}</p>
      </CrmPageContent>
    );
  }

  return (
    <CrmPageContent>
      <p>
        <Link href={`/crm/email-campaigns/lists/${id}`} className="text-sm text-ink-muted hover:text-ink">
          ← {listName || "List"}
        </Link>
      </p>
      <CrmPageHeader
        title="Import"
        subtitle={listName ? `Into ${listName}` : undefined}
        actions={
          <SecondaryButton
            type="button"
            className="w-auto"
            onClick={() => {
              downloadText("sample-list-import.csv", SAMPLE_LIST_CSV);
              setSampleSaved(true);
            }}
          >
            {sampleSaved ? "Sample downloaded" : "Sample CSV"}
          </SecondaryButton>
        }
      />
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const file = event.dataTransfer.files[0];
          if (file) void takeFile(file);
        }}
        className={cn(
          "rounded-xl border border-dashed px-6 py-10 text-center transition-[border-color] duration-200 ease-out motion-reduce:transition-none",
          dragging ? "border-brand bg-brand-muted" : "border-line bg-surface",
        )}
      >
        <p className="text-sm font-medium text-ink">Drop a CSV or TXT file</p>
        <p className="mt-1 text-sm text-ink-muted">
          Use the sample columns: First name, Last name, Email, Phone, Company, Type. A row needs an
          email or a phone. Solicitor / legal rows map to Legal — not Landlord.
        </p>
        <div className="mt-4 flex justify-center">
          <SecondaryButton type="button" className="w-auto" disabled={readingFile} onClick={() => fileRef.current?.click()}>
            {readingFile ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {readingFile ? "Reading…" : "Choose a file"}
          </SecondaryButton>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.txt,text/csv,text/plain"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void takeFile(file);
          }}
        />
        {sourceLabel && sheet ? <p className="mt-3 text-sm text-ink">{sourceLabel}</p> : null}
        {fileError ? <p className="mt-3 text-sm text-orange-700">{fileError}</p> : null}
      </div>
      <div className="space-y-3">
        <TextAreaField
          label="Or paste from a spreadsheet"
          value={paste}
          onChange={(event) => {
            setPaste(event.target.value);
            setPasteError(null);
          }}
          placeholder="First name, Last name, Email, Phone, Company, Type"
        />
        <SecondaryButton type="button" className="w-auto" disabled={usingPaste || paste.trim().length === 0} onClick={usePasted}>
          {usingPaste ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {usingPaste ? "Reading…" : "Use pasted rows"}
        </SecondaryButton>
        {pasteError ? <p className="text-sm text-orange-700">{pasteError}</p> : null}
      </div>
      <div
        className={cn(
          "grid motion-reduce:transition-none transition-[grid-template-rows] duration-200 ease-out",
          sheet ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          {sheet ? (
            <div className="space-y-4 pt-1">
              <Table
                title="Match columns"
                columns={mapColumns}
                data={mapRows}
                getRowKey={(row) => row.index}
                emptyMessage="This file has no columns."
              />
              <p className="text-sm text-ink-muted">
                {mappedCount} contact{mappedCount === 1 ? "" : "s"} ready. Unmatched columns are not imported.
                {mapping.includes("customerType")
                  ? " Type values such as Solicitor map to Legal / solicitor."
                  : defaultType
                    ? ` No Type column — these contacts will be imported as ${CUSTOMER_TYPE_LABELS[defaultType]}.`
                    : " Map a Type column, or choose a type below, so solicitors are not stored as Landlord."}
              </p>
              <SelectField
                label="Contact type"
                value={defaultType}
                onChange={(event) => {
                  setDefaultTypeTouched(true);
                  setDefaultType(event.target.value as CustomerType | "");
                  setImportError(null);
                }}
              >
                <option value="">Set from the Type column or list name</option>
                {CUSTOMER_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectField>
              <label className="flex items-start gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={expectEmail}
                  onChange={(event) => {
                    setExpectEmail(event.target.checked);
                    setImportError(null);
                  }}
                  className="mt-0.5 size-4 rounded border-line text-brand accent-brand"
                />
                These contacts expect email from us.
              </label>
              <div>
                <PrimaryButton
                  type="button"
                  className="w-auto"
                  disabled={importing || imported || !expectEmail}
                  onClick={() => void completeImport()}
                >
                  {importing ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                  {importing ? "Importing…" : imported ? "Imported" : "Complete import"}
                </PrimaryButton>
                {importError ? (
                  <p className="mt-2 text-sm text-orange-700" role="alert">
                    {importError}
                  </p>
                ) : null}
              </div>
              <div
                className={cn(
                  "grid motion-reduce:transition-none transition-[grid-template-rows] duration-200 ease-out",
                  result ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="overflow-hidden">
                  {result ? (
                    <div className="space-y-3 rounded-xl border border-line bg-surface p-4" aria-live="polite">
                      <p className="text-sm text-ink">
                        Added {result.added}. {result.alreadyMembers} already on the list. Created {result.createdCustomers}{" "}
                        contact{result.createdCustomers === 1 ? "" : "s"}. {result.errorCount} row
                        {result.errorCount === 1 ? "" : "s"} need a fix.
                        {result.undoneAt ? " This import was undone." : ""}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <SecondaryButton
                          type="button"
                          className="w-auto"
                          onClick={() => router.push(`/crm/email-campaigns/lists/${id}`)}
                        >
                          Open the list
                        </SecondaryButton>
                        {result.errorCount > 0 ? (
                          <SecondaryButton
                            type="button"
                            className="w-auto"
                            onClick={() => downloadText(`import-errors-${result.id}.csv`, errorsCsv(result.errors))}
                          >
                            Download errors
                          </SecondaryButton>
                        ) : null}
                      </div>
                      {result.errors.length > 0 ? (
                        <Table
                          title="Rows that were not imported"
                          columns={[
                            { key: "line", header: "Line", render: (value) => String(value) },
                            { key: "reason", header: "Reason", render: (value) => String(value) },
                          ]}
                          data={result.errors.slice(0, 50).map((row) => ({ line: row.line, reason: row.reason }))}
                          totalCount={result.errors.length}
                          emptyMessage="No errors."
                        />
                      ) : null}
                      {result.errors.length > 50 ? (
                        <p className="text-sm text-ink-muted">Showing 50 of {result.errors.length}. Download the file for the rest.</p>
                      ) : null}
                      {importedMembers.length > 0 ? (
                        <Table
                          title="Edit imported contacts"
                          columns={[
                            { key: "name", header: "Name", render: (value) => String(value || "—") },
                            {
                              key: "email",
                              header: "Email",
                              render: (value) => (value ? String(value) : "—"),
                            },
                            {
                              key: "edit",
                              header: "",
                              render: (_value, row) =>
                                row.customerId ? (
                                  <SecondaryButton
                                    type="button"
                                    size="small"
                                    className="w-auto"
                                    onClick={() => setEditMember(row)}
                                  >
                                    Edit
                                  </SecondaryButton>
                                ) : null,
                            },
                          ]}
                          data={importedMembers}
                          getRowKey={(row) => row.id}
                          emptyMessage="No contacts from this import."
                        />
                      ) : result.added > 0 ? (
                        <p className="text-sm text-ink-muted">
                          Open the list to edit a contact if a name, email, or type needs a correction.
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <Table
        title="Past imports"
        columns={historyColumns}
        data={historyRows}
        getRowKey={(row) => row.id}
        emptyMessage="No imports yet."
      />
      <ConfirmModal
        isOpen={undoTarget != null}
        title="Undo this import?"
        description="People stay in the CRM. This only removes the companies and contacts this import added to the list."
        confirmLabel="Undo import"
        danger
        loading={undoing}
        error={undoError ?? undefined}
        onConfirm={() => void confirmUndo()}
        onCancel={() => setUndoTarget(null)}
      />
      <EditImportedContactModal
        isOpen={editMember != null}
        member={editMember}
        defaultCustomerType={defaultType || inferImportedCustomerType({ listName }) || null}
        onClose={() => setEditMember(null)}
        onSaved={(customer) => {
          setImportedMembers((current) =>
            current.map((row) =>
              row.customerId === customer.id
                ? {
                    ...row,
                    name: `${customer.firstName} ${customer.lastName}`.trim(),
                    email: customer.email,
                    phone: customer.phone,
                  }
                : row,
            ),
          );
        }}
      />
    </CrmPageContent>
  );
}
