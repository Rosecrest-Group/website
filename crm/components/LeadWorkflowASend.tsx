"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/crm/lib/api";
import type { MessageTemplate } from "@/crm/types";
import {
  WORKFLOW_A_TEMPLATE_CATALOG,
  findWorkflowAEntry,
  type WorkflowALevel,
} from "@/crm/lib/workflowATemplates";
import { isHtmlContent, plainTextToHtml, sanitizeEmailHtml } from "@/crm/lib/messageFormatting";
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
  level: WorkflowALevel;
  label: string;
};

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

function matchCatalogTemplates(items: MessageTemplate[]): SelectableTemplate[] {
  const active = items.filter((item) => item.isActive);
  const byName = new Map(active.map((item) => [item.name, item] as const));
  const usedIds = new Set<string>();
  const matched: SelectableTemplate[] = [];

  for (const entry of WORKFLOW_A_TEMPLATE_CATALOG) {
    const template =
      byName.get(entry.name) ??
      active.find((item) => findWorkflowAEntry(item.name)?.name === entry.name);
    const channel = template ? asSendChannel(template.channel) : null;
    if (!template || !channel || usedIds.has(template.id)) continue;
    usedIds.add(template.id);
    matched.push({
      id: template.id,
      name: template.name,
      channel,
      level: entry.level,
      label: entry.label,
    });
  }
  return matched;
}

export default function LeadWorkflowASend({
  leadId,
  quotedAmount,
  customerEmail,
  customerPhone,
  onSent,
}: {
  leadId: string;
  quotedAmount: number | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
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

  const recipient =
    selected?.channel === "EMAIL"
      ? customerEmail?.trim() || null
      : selected?.channel === "SMS"
        ? customerPhone?.trim() || null
        : null;

  const missingRecipient = Boolean(selected) && !recipient;

  const grouped = useMemo(() => {
    const levels: WorkflowALevel[] = [1, 2, 3];
    return levels
      .map((level) => ({
        level,
        items: templates.filter((template) => template.level === level),
      }))
      .filter((group) => group.items.length > 0);
  }, [templates]);

  function openConfirm() {
    if (!selected || missingRecipient || sending) return;
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
      const result = await api.previewTemplate(selected.id, { leadId });
      setPreview(result);
    } catch (e) {
      setPreviewError(e instanceof Error ? e.message : "Could not load template preview");
    } finally {
      setPreviewLoading(false);
    }
  }

  async function sendTemplate() {
    if (!selected || sending) return;
    const amount = parseQuoteAmount(quoteInput);
    if (amount == null) {
      setSendError("Enter a valid quote amount greater than 0.");
      return;
    }
    if (missingRecipient) {
      setSendError(
        selected.channel === "EMAIL" ? "This lead has no email address." : "This lead has no phone number."
      );
      return;
    }

    setSending(true);
    setSendError(null);
    const toastId = toast.loading("Sending…");
    startTopProgress();
    let quoteUpdated = false;
    try {
      if (quotedAmount !== amount) {
        await api.updateLead(leadId, { quotedAmount: amount });
        quoteUpdated = true;
      }
      await api.sendMessage({
        channel: selected.channel,
        leadId,
        templateId: selected.id,
      });
      setConfirmOpen(false);
      toast.success(
        quoteUpdated
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
          <p className="text-sm text-ink-muted">No Workflow A templates are available.</p>
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
                    <optgroup key={group.level} label={`Level ${group.level}`}>
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
                  ? selected.channel === "EMAIL"
                    ? "No email on this lead."
                    : "No phone number on this lead."
                  : `${selected.channel === "EMAIL" ? "Email" : "SMS"} to ${recipient}`}
              </p>
            )}

            <PrimaryButton
              type="button"
              className="!h-auto w-full !px-4 !py-1.5"
              disabled={!selected || missingRecipient || sending}
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
            ? `Send ${selected.label} (${selected.channel === "EMAIL" ? "email" : "SMS"})${
                recipient ? ` to ${recipient}` : ""
              }.`
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
      </ConfirmModal>

      <CrmModal
        isOpen={previewOpen}
        title={selected ? selected.label : "Template preview"}
        description={
          selected
            ? `Level ${selected.level} · ${selected.channel === "EMAIL" ? "Email" : "SMS"} · filled from this lead`
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
                className="crm-email-body rounded-xl border border-line bg-sidebar p-3 text-sm text-ink [&_a]:underline [&_img]:my-2 [&_img]:max-w-full [&_img]:rounded-xl"
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
