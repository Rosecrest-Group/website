"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/crm/lib/api";
import type { JobDocument, MessageTemplate } from "@/crm/types";
import {
  WORKFLOW_SEND_TEMPLATE_CATALOG,
  findWorkflowSendEntry,
  type WorkflowALevel,
  type WorkflowSendCc,
  type WorkflowSendGroup,
  type WorkflowSendRecipient,
} from "@/crm/lib/workflowATemplates";
import { isDesignedEmailHtml, isHtmlContent, plainTextToHtml, sanitizeEmailHtml } from "@/crm/lib/messageFormatting";
import CrmPanel from "@/crm/components/ui/CrmPanel";
import CrmModal from "@/crm/components/ui/CrmModal";
import SelectField from "@/crm/components/ui/SelectField";
import TextField from "@/crm/components/ui/TextField";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import ConfirmModal from "@/crm/components/ui/ConfirmModal";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import { toast } from "sonner";
import { doneTopProgress, startTopProgress } from "@/crm/lib/topProgress";

type SelectableTemplate = {
  id: string;
  name: string;
  channel: "EMAIL" | "SMS";
  group: WorkflowSendGroup;
  recipientKind: WorkflowSendRecipient;
  ccRecipient?: WorkflowSendCc;
  requireReport?: boolean;
  level?: WorkflowALevel;
  label: string;
};

const REPORT_FILE_ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.gif";

function asSendChannel(channel: string): "EMAIL" | "SMS" | null {
  const value = channel.toUpperCase();
  if (value === "EMAIL" || value === "SMS") return value;
  return null;
}

function parseQuoteAmount(raw: string): number | null {
  const amount = Number(raw);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return amount;
}

function missingRecipientMessage(template: SelectableTemplate): string {
  if (template.recipientKind === "agent") return "No agent email on this job.";
  if (template.recipientKind === "surveyor") return "No surveyor email on this job.";
  return template.channel === "EMAIL" ? "No email on this lead." : "No phone number on this lead.";
}

function matchCatalogTemplates(items: MessageTemplate[]): SelectableTemplate[] {
  const active = items.filter((item) => item.isActive);
  const byName = new Map(active.map((item) => [item.name, item] as const));
  const usedIds = new Set<string>();
  const matched: SelectableTemplate[] = [];

  for (const entry of WORKFLOW_SEND_TEMPLATE_CATALOG) {
    const template =
      byName.get(entry.name) ??
      active.find((item) => findWorkflowSendEntry(item.name)?.name === entry.name);
    const channel = template ? asSendChannel(template.channel) : null;
    if (!template || !channel || usedIds.has(template.id)) continue;
    usedIds.add(template.id);
    matched.push({
      id: template.id,
      name: template.name,
      channel,
      group: entry.group,
      recipientKind: entry.recipient,
      ccRecipient: entry.ccRecipient,
      requireReport: entry.requireReport,
      level: entry.level,
      label: entry.label,
    });
  }
  return matched;
}

export default function LeadWorkflowASend({
  leadId,
  jobId,
  quotedAmount,
  customerEmail,
  customerPhone,
  agentEmail,
  surveyorEmail,
  onSent,
}: {
  leadId: string;
  jobId?: string | null;
  quotedAmount: number | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  agentEmail?: string | null;
  surveyorEmail?: string | null;
  onSent: () => void;
}) {
  const [templates, setTemplates] = useState<SelectableTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [quoteInput, setQuoteInput] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ subject: string | null; body: string } | null>(null);
  const [jobDocuments, setJobDocuments] = useState<JobDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [uploadingReport, setUploadingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const reportInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .listTemplates()
      .then((result) => {
        if (cancelled) return;
        setTemplates(matchCatalogTemplates(result.items));
      })
      .catch(() => {
        if (!cancelled) setTemplates([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingTemplates(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = useMemo(
    () => templates.find((template) => template.id === selectedId) ?? null,
    [templates, selectedId]
  );

  const recipient = useMemo(() => {
    if (!selected) return null;
    if (selected.recipientKind === "agent") return agentEmail?.trim() || null;
    if (selected.recipientKind === "surveyor") return surveyorEmail?.trim() || null;
    return selected.channel === "EMAIL"
      ? customerEmail?.trim() || null
      : customerPhone?.trim() || null;
  }, [selected, agentEmail, surveyorEmail, customerEmail, customerPhone]);

  const missingRecipient = Boolean(selected) && !recipient;
  const needsQuote = selected?.group === "workflow_a";
  const needsReport = Boolean(selected?.requireReport);
  const surveyorCc =
    selected?.ccRecipient === "surveyor" && selected.channel === "EMAIL"
      ? surveyorEmail?.trim() || null
      : null;
  const reportDocuments = jobDocuments.filter((doc) => doc.type === "REPORT");
  const hasReport = reportDocuments.length > 0;
  const missingReport = needsReport && !hasReport;

  useEffect(() => {
    if (!needsReport || !jobId) {
      setJobDocuments([]);
      setLoadingDocuments(false);
      setReportFile(null);
      setReportError(
        needsReport && !jobId ? "This lead has no job yet. Create the job before sending the report." : null
      );
      return;
    }
    let cancelled = false;
    setLoadingDocuments(true);
    setReportError(null);
    api
      .listJobDocuments(jobId)
      .then((result) => {
        if (!cancelled) setJobDocuments(result.items);
      })
      .catch((e) => {
        if (!cancelled) {
          setJobDocuments([]);
          setReportError(e instanceof Error ? e.message : "Could not load job documents");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingDocuments(false);
      });
    return () => {
      cancelled = true;
    };
  }, [needsReport, jobId]);

  const grouped = useMemo(() => {
    const levels: WorkflowALevel[] = [1, 2, 3];
    const levelGroups = levels
      .map((level) => ({
        key: `level-${level}`,
        label: `Level ${level}`,
        items: templates.filter((template) => template.group === "workflow_a" && template.level === level),
      }))
      .filter((group) => group.items.length > 0);
    const postPayment = templates.filter((template) => template.group === "post_payment");
    return [
      ...levelGroups,
      ...(postPayment.length > 0
        ? [{ key: "post_payment", label: "Post payment", items: postPayment }]
        : []),
    ];
  }, [templates]);

  async function uploadReport() {
    if (!jobId || !reportFile || uploadingReport) return;
    setUploadingReport(true);
    setReportError(null);
    try {
      const doc = await api.uploadJobDocument(jobId, reportFile, "REPORT");
      setJobDocuments((prev) => [doc, ...prev.filter((item) => item.id !== doc.id)]);
      setReportFile(null);
      if (reportInputRef.current) reportInputRef.current.value = "";
      toast.success("Report uploaded");
    } catch (e) {
      setReportError(e instanceof Error ? e.message : "Could not upload the report");
    } finally {
      setUploadingReport(false);
    }
  }

  function openConfirm() {
    if (!selected || missingRecipient || missingReport || sending) return;
    setSendError(null);
    setQuoteInput(quotedAmount != null && quotedAmount > 0 ? String(quotedAmount) : "");
    setConfirmOpen(true);
  }

  async function openPreview() {
    if (!selected) return;
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewError(null);
    setPreview(null);
    try {
      const result = await api.previewTemplate(selected.id, {
        leadId,
        ...(jobId ? { jobId } : {}),
      });
      setPreview(result);
    } catch (e) {
      setPreviewError(e instanceof Error ? e.message : "Could not load template preview");
    } finally {
      setPreviewLoading(false);
    }
  }

  async function sendTemplate() {
    if (!selected || sending) return;
    const amount = needsQuote ? parseQuoteAmount(quoteInput) : null;
    if (needsQuote && amount == null) {
      setSendError("Enter a valid quote amount greater than 0.");
      return;
    }
    if (missingRecipient) {
      setSendError(missingRecipientMessage(selected));
      return;
    }
    if (missingReport) {
      setSendError("Upload a report before sending this template");
      return;
    }

    setSending(true);
    setSendError(null);
    const toastId = toast.loading("Sending…");
    startTopProgress();
    let quoteUpdated = false;
    try {
      if (needsQuote && amount != null && quotedAmount !== amount) {
        await api.updateLead(leadId, { quotedAmount: amount });
        quoteUpdated = true;
      }
      await api.sendMessage({
        channel: selected.channel,
        leadId,
        ...(jobId ? { jobId } : {}),
        templateId: selected.id,
        ...(recipient ? { toAddress: recipient } : {}),
        ...(surveyorCc ? { ccAddresses: [surveyorCc] } : {}),
      });
      setConfirmOpen(false);
      toast.success(
        quoteUpdated && amount != null
          ? `Sent · quote updated to £${amount}`
          : `Sent · ${selected.label}`,
        { id: toastId }
      );
      onSent();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to send template";
      setSendError(message);
      toast.error(message, { id: toastId });
      if (quoteUpdated) onSent();
    } finally {
      doneTopProgress();
      setSending(false);
    }
  }

  return (
    <>
      <CrmPanel title="Send workflow template">
        {loadingTemplates ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner />
          </div>
        ) : templates.length === 0 ? (
          <p className="text-sm text-ink-muted">No workflow templates are available.</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-end gap-2">
              <div className="min-w-0 flex-1">
                <SelectField
                  label="Template"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                >
                  <option value="">Select a template</option>
                  {grouped.map((group) => (
                    <optgroup key={group.key} label={group.label}>
                      {group.items.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </SelectField>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-lg px-3 py-2.5 text-sm font-medium text-brand hover:bg-brand-muted disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!selected}
                onClick={() => void openPreview()}
              >
                Preview
              </button>
            </div>

            {selected && (
              <p className="text-xs text-ink-muted">
                {missingRecipient
                  ? missingRecipientMessage(selected)
                  : [
                      `${selected.channel === "EMAIL" ? "Email" : "SMS"} to ${recipient}`,
                      surveyorCc
                        ? `CC ${surveyorCc}`
                        : selected.ccRecipient === "surveyor"
                          ? "Surveyor not copied — none assigned"
                          : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
              </p>
            )}

            {needsReport ? (
              <div className="space-y-2 rounded-xl border border-line bg-sidebar/40 p-3 duration-200 ease-out motion-reduce:transition-none">
                <p className="text-sm font-medium text-ink">Report attachment</p>
                {loadingDocuments ? (
                  <div className="flex justify-center py-3">
                    <LoadingSpinner />
                  </div>
                ) : hasReport ? (
                  <ul className="space-y-1">
                    {reportDocuments.map((doc) => (
                      <li key={doc.id}>
                        <a
                          href={doc.storageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-brand hover:underline"
                        >
                          {doc.filename}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-ink-muted">
                    Upload the report here before this email can send. It is attached like the
                    normal workflow.
                  </p>
                )}
                {jobId ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      ref={reportInputRef}
                      type="file"
                      accept={REPORT_FILE_ACCEPT}
                      className="sr-only"
                      onChange={(e) => {
                        setReportFile(e.target.files?.[0] ?? null);
                        setReportError(null);
                      }}
                    />
                    <SecondaryButton
                      type="button"
                      size="small"
                      className="w-auto max-w-full"
                      disabled={uploadingReport}
                      onClick={() => reportInputRef.current?.click()}
                    >
                      <span className="truncate">
                        {reportFile ? reportFile.name : hasReport ? "Replace report" : "Choose report"}
                      </span>
                    </SecondaryButton>
                    <PrimaryButton
                      type="button"
                      className="w-auto !px-4 !py-1.5"
                      disabled={!reportFile || uploadingReport}
                      onClick={() => void uploadReport()}
                    >
                      {uploadingReport ? "Uploading…" : "Upload"}
                    </PrimaryButton>
                  </div>
                ) : null}
                {reportError ? <p className="text-sm text-orange-700">{reportError}</p> : null}
              </div>
            ) : null}

            <PrimaryButton
              type="button"
              className="!h-auto w-full !px-4 !py-1.5"
              disabled={!selected || missingRecipient || missingReport || sending || uploadingReport}
              onClick={openConfirm}
            >
              Send
            </PrimaryButton>
          </div>
        )}
      </CrmPanel>

      <ConfirmModal
        isOpen={confirmOpen}
        title="Send this template?"
        description={
          selected
            ? [
                `Send ${selected.label} (${selected.channel === "EMAIL" ? "email" : "SMS"})`,
                recipient ? `to ${recipient}` : null,
                surveyorCc ? `and copy ${surveyorCc}` : null,
                needsReport ? "with the report attached" : null,
              ]
                .filter(Boolean)
                .join(" ") + "."
            : undefined
        }
        confirmLabel="Send now"
        loading={sending}
        error={sendError ?? undefined}
        onConfirm={() => void sendTemplate()}
        onCancel={() => {
          if (sending) return;
          setConfirmOpen(false);
          setSendError(null);
        }}
      >
        {needsQuote ? (
          <>
            <TextField
              id="workflow-a-quote-amount"
              label="Quote (£)"
              type="text"
              inputMode="decimal"
              value={quoteInput}
              disabled={sending}
              autoFocus
              placeholder={quotedAmount != null ? String(quotedAmount) : "0.00"}
              onChange={(e) => {
                setQuoteInput(e.target.value.replace(/[^0-9.]/g, ""));
                if (sendError) setSendError(null);
              }}
            />
            {quotedAmount != null && quotedAmount > 0 ? (
              <p className="mt-1.5 text-xs text-ink-muted">
                Current quote: £{quotedAmount}. Change it above if this send should use a different fee.
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-ink-muted">
                Enter the fee to include in this message. It becomes the lead’s quoted price.
              </p>
            )}
          </>
        ) : null}
      </ConfirmModal>

      <CrmModal
        isOpen={previewOpen}
        title={selected ? selected.label : "Template preview"}
        description={
          selected
            ? `${selected.group === "post_payment" ? "Post payment" : `Level ${selected.level}`} · ${selected.channel === "EMAIL" ? "Email" : "SMS"} · filled from this lead`
            : undefined
        }
        onClose={() => {
          if (previewLoading) return;
          setPreviewOpen(false);
        }}
        closeDisabled={previewLoading}
        size="lg"
        footer={
          <SecondaryButton
            type="button"
            className="w-auto"
            disabled={previewLoading}
            onClick={() => setPreviewOpen(false)}
          >
            Close
          </SecondaryButton>
        }
      >
        {previewLoading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        )}
        {previewError && <p className="text-sm text-orange-700">{previewError}</p>}
        {preview && !previewLoading && (
          <div className="space-y-3">
            {preview.subject && (
              <div>
                <p className="text-xs font-medium text-ink-muted">Subject</p>
                <p className="mt-1 text-sm font-medium text-ink">{preview.subject}</p>
              </div>
            )}
            {selected?.channel === "EMAIL" ? (
              <div
                className={`crm-email-body rounded-xl border border-line bg-sidebar p-3 text-sm text-ink [&_a]:underline [&_img]:my-2 [&_img]:max-w-full [&_img]:rounded-xl${
                  isDesignedEmailHtml(preview.body) ? " crm-email-body--designed" : ""
                }`}
                dangerouslySetInnerHTML={{
                  __html: sanitizeEmailHtml(
                    isHtmlContent(preview.body) ? preview.body : plainTextToHtml(preview.body)
                  ),
                }}
              />
            ) : (
              <pre className="whitespace-pre-wrap rounded-xl border border-line bg-sidebar p-3 text-sm text-ink">
                {preview.body}
              </pre>
            )}
          </div>
        )}
      </CrmModal>
    </>
  );
}
