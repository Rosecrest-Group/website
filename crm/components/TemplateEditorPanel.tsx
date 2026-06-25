"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/crm/lib/api";
import type { MessageTemplate } from "@/crm/types";
import ChannelSelector, { type MessageChannel } from "@/crm/components/ui/ChannelSelector";
import CrmSlidePanel from "@/crm/components/ui/CrmSlidePanel";
import MessageRichCompose, {
  getEmailPayload,
  type EmailRichEditorHandle,
  type MessageRichComposeHandle,
} from "@/crm/components/ui/MessageRichCompose";
import { mergeBodyWithMediaUrls, parseTrailingMediaUrls } from "@/crm/lib/messageMediaAttachments";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import TextField from "@/crm/components/ui/TextField";
import { isHtmlContent, plainTextToHtml, sanitizeEmailHtml } from "@/crm/lib/messageFormatting";

const MERGE_FIELDS = [
  "{{customer.firstName}}",
  "{{customer.lastName}}",
  "{{lead.propertyAddress}}",
  "{{lead.propertyPostcode}}",
  "{{links.paymentLink}}",
  "{{links.reportLink}}",
];

type EditorMode = "create" | "edit";

function bodyFromTemplate(template: MessageTemplate, channel: MessageChannel) {
  if (channel === "EMAIL") {
    return {
      plainBody: "",
      htmlBody: isHtmlContent(template.body) ? template.body : plainTextToHtml(template.body),
      mediaUrls: [] as string[],
    };
  }
  const { text, mediaUrls } = parseTrailingMediaUrls(template.body);
  return { plainBody: text, htmlBody: "", mediaUrls };
}

export default function TemplateEditorPanel({
  isOpen,
  mode,
  template,
  onClose,
  onSaved,
  initialTrigger = "MANUAL",
  lockChannel,
  hideTrigger = false,
  saveLabel,
  closeOnSave = false,
}: {
  isOpen: boolean;
  mode: EditorMode;
  template: MessageTemplate | null;
  onClose: () => void;
  onSaved: (template: MessageTemplate) => void;
  initialTrigger?: string;
  lockChannel?: MessageChannel;
  hideTrigger?: boolean;
  saveLabel?: string;
  closeOnSave?: boolean;
}) {
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("MANUAL");
  const [channel, setChannel] = useState<MessageChannel>("EMAIL");
  const [subject, setSubject] = useState("");
  const [plainBody, setPlainBody] = useState("");
  const [htmlBody, setHtmlBody] = useState("");
  const [preview, setPreview] = useState<{ subject: string | null; body: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [savedTemplate, setSavedTemplate] = useState<MessageTemplate | null>(null);

  const emailEditorRef = useRef<EmailRichEditorHandle>(null);
  const plainTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const composeRef = useRef<MessageRichComposeHandle>(null);

  async function refreshPreview(templateId: string) {
    setPreviewLoading(true);
    try {
      setPreview(await api.previewTemplate(templateId));
    } finally {
      setPreviewLoading(false);
    }
  }

  useEffect(() => {
    if (!isOpen) return;

    setError("");
    setPreview(null);
    setPreviewTemplateId(null);
    setSavedTemplate(null);

    if (mode === "edit" && template) {
      const nextChannel = template.channel as MessageChannel;
      const { plainBody: nextPlain, htmlBody: nextHtml, mediaUrls } = bodyFromTemplate(template, nextChannel);
      setName(template.name);
      setTrigger(template.trigger);
      setChannel(nextChannel);
      setSubject(template.subject ?? "");
      setPlainBody(nextPlain);
      setHtmlBody(nextHtml);
      requestAnimationFrame(() => {
        composeRef.current?.setMediaUrls(mediaUrls);
      });
      void refreshPreview(template.id);
      return;
    }

    setName("");
    setTrigger(initialTrigger);
    setChannel(lockChannel ?? "EMAIL");
    setSubject("");
    setPlainBody("");
    setHtmlBody("");
    composeRef.current?.clearMedia();
  }, [isOpen, mode, template, initialTrigger, lockChannel]);

  function handleChannelChange(nextChannel: MessageChannel) {
    if (lockChannel) return;
    setChannel(nextChannel);
    if (nextChannel !== "EMAIL") setSubject("");
    if (mode === "create") {
      setPlainBody("");
      setHtmlBody("");
      composeRef.current?.clearMedia();
      return;
    }
    if (template && nextChannel !== template.channel) {
      setPlainBody("");
      setHtmlBody("");
      composeRef.current?.clearMedia();
    } else if (template && nextChannel === template.channel) {
      const { plainBody: nextPlain, htmlBody: nextHtml, mediaUrls } = bodyFromTemplate(template, nextChannel);
      setPlainBody(nextPlain);
      setHtmlBody(nextHtml);
      composeRef.current?.setMediaUrls(mediaUrls);
    }
  }

  function insertAtCursor(text: string) {
    if (channel === "EMAIL") {
      emailEditorRef.current?.insertText(text);
      return;
    }

    const el = plainTextareaRef.current;
    if (!el) {
      setPlainBody((prev) => prev + text);
      return;
    }

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = plainBody.slice(0, start) + text + plainBody.slice(end);
    setPlainBody(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + text.length;
      el.setSelectionRange(pos, pos);
    });
  }

  async function handleSave() {
    const trimmedName = name.trim();
    const trimmedTrigger = trigger.trim();
    const emailPayload = channel === "EMAIL" ? getEmailPayload(htmlBody) : null;
    const mediaUrls = channel !== "EMAIL" ? (composeRef.current?.getMediaUrls() ?? []) : [];
    const body =
      channel === "EMAIL"
        ? (emailPayload?.html ?? "")
        : mergeBodyWithMediaUrls(plainBody.trim(), mediaUrls);
    const hasEmailContent =
      Boolean(emailPayload?.plain.trim()) || /<img[\s>]/i.test(emailPayload?.html ?? "");

    if (!trimmedName) {
      setError("Enter a template name.");
      return;
    }
    if (!trimmedTrigger) {
      setError("Enter a trigger.");
      return;
    }
    if (
      !body ||
      (channel === "EMAIL" && !hasEmailContent) ||
      (channel !== "EMAIL" && !plainBody.trim() && mediaUrls.length === 0)
    ) {
      setError("Enter message content.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = {
        name: trimmedName,
        channel,
        trigger: trimmedTrigger,
        subject: channel === "EMAIL" ? subject.trim() || undefined : undefined,
        body,
      };

      const saved =
        mode === "create"
          ? await api.createTemplate(payload)
          : await api.updateTemplate(template!.id, payload);

      onSaved(saved);
      setSavedTemplate(saved);
      setPreviewTemplateId(saved.id);
      await refreshPreview(saved.id);
      if (closeOnSave) onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save template");
    } finally {
      setSaving(false);
    }
  }

  async function handlePreview() {
    const templateId = template?.id ?? previewTemplateId;
    if (templateId) {
      await refreshPreview(templateId);
      return;
    }
    setError("Save the template first to preview merge fields.");
  }

  const title = mode === "create" ? "New template" : "Edit template";
  const primarySaveLabel =
    saveLabel ?? (mode === "create" ? "Create template" : "Save template");
  const description =
    mode === "create"
      ? "Create an email, SMS, or WhatsApp template with merge fields."
      : template?.name;
  const placeholder =
    channel === "EMAIL"
      ? "Write your email…"
      : channel === "WHATSAPP"
        ? "Write a WhatsApp message…"
        : "Write an SMS…";

  return (
    <CrmSlidePanel
      isOpen={isOpen}
      onClose={onClose}
      closeDisabled={saving}
      title={title}
      description={description}
      widthClassName="max-w-3xl"
      footer={
        <>
          <SecondaryButton type="button" className="w-auto" onClick={onClose} disabled={saving}>
            Cancel
          </SecondaryButton>
          {preview && (
            <SecondaryButton
              type="button"
              className="w-auto"
              onClick={() => void handlePreview()}
              disabled={previewLoading || saving}
            >
              {previewLoading ? "Loading preview…" : "Refresh preview"}
            </SecondaryButton>
          )}
          <PrimaryButton
            type="button"
            className="w-auto px-6"
            disabled={saving}
            onClick={() => (savedTemplate && mode === "create" ? onClose() : void handleSave())}
          >
            {saving
              ? "Saving…"
              : savedTemplate && mode === "create"
                ? "Done"
                : primarySaveLabel}
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-4 text-sm">
        <TextField
          id="template-name"
          label="Template name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Level 2 · 72-hour follow-up"
        />

        {!hideTrigger && (
          <TextField
            id="template-trigger"
            label="Trigger"
            value={trigger}
            onChange={(e) => setTrigger(e.target.value)}
            placeholder="MANUAL"
          />
        )}

        {channel === "EMAIL" && (
          <TextField
            id="template-subject"
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Re: Level 2 Survey | {{lead.propertyAddress}}"
          />
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium text-(--color-tc-40)">Message</p>
          <div className="flex flex-wrap gap-1.5">
            {MERGE_FIELDS.map((field) => (
              <button
                key={field}
                type="button"
                onClick={() => insertAtCursor(field)}
                className="rounded-lg border border-(--color-tc-20) bg-(--color-nc-10) px-2 py-1 font-mono text-[11px] text-(--color-tc-40) transition hover:border-(--color-primary)/30 hover:bg-white"
              >
                {field}
              </button>
            ))}
          </div>

          <MessageRichCompose
            ref={composeRef}
            channel={channel}
            plainValue={plainBody}
            htmlValue={htmlBody}
            onPlainChange={setPlainBody}
            onHtmlChange={setHtmlBody}
            showSendButton={false}
            disabled={saving}
            enableImageAttachments
            onUploadImage={async (file) => (await api.uploadMessageMedia(file)).url}
            onAttachmentError={setError}
            trailingSlot={
              <ChannelSelector
                channel={channel}
                onChange={handleChannelChange}
                disabled={saving || Boolean(lockChannel)}
              />
            }
            placeholder={placeholder}
            editorClassName="min-h-[180px] max-h-72"
            emailEditorRef={emailEditorRef}
            plainTextareaRef={plainTextareaRef}
          />

          <p className="text-xs text-(--color-tc-30)">
            {channel === "EMAIL"
              ? "Use the toolbar for bold, lists, and links. Click a merge field to insert it."
              : channel === "WHATSAPP"
                ? "WhatsApp formatting: *bold*, _italic_, ~strike~. Click a merge field to insert it."
                : "Click a merge field to insert it. Line breaks are preserved in the sent message."}
          </p>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        {preview && (
          <div className="border-t border-(--color-tc-20) pt-4">
            <p className="text-xs font-medium text-(--color-tc-30)">Rendered preview</p>
            {preview.subject && <p className="mt-1 font-medium text-(--color-tc-40)">{preview.subject}</p>}
            {channel === "EMAIL" && isHtmlContent(preview.body) ? (
              <div
                className="crm-email-body mt-2 rounded-xl bg-(--color-nc-10) p-3 text-xs text-(--color-tc-40) [&_a]:text-(--color-primary) [&_a]:underline [&_img]:my-2 [&_img]:max-w-full [&_img]:rounded-xl [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: sanitizeEmailHtml(preview.body) }}
              />
            ) : (
              (() => {
                const { text, mediaUrls } = parseTrailingMediaUrls(preview.body);
                return (
                  <>
                    {text && (
                      <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-(--color-nc-10) p-3 text-xs text-(--color-tc-40)">
                        {text}
                      </pre>
                    )}
                    {mediaUrls.map((url) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={url}
                        src={url}
                        alt=""
                        className="mt-2 max-h-48 rounded-xl border border-(--color-tc-20) object-contain"
                      />
                    ))}
                  </>
                );
              })()
            )}
          </div>
        )}
      </div>
    </CrmSlidePanel>
  );
}
