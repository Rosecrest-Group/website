"use client";

import { useEffect, useState } from "react";
import type { MessageChannel } from "@/crm/components/ui/ChannelSelector";
import { api } from "@/crm/lib/api";
import { isDesignedEmailHtml, isHtmlContent, plainTextToHtml, sanitizeEmailHtml } from "@/crm/lib/messageFormatting";
import { parseTrailingMediaUrls } from "@/crm/lib/messageMediaAttachments";

type Props = {
  open: boolean;
  templateId: string | null;
  templateName: string;
  channel: MessageChannel;
  onClose: () => void;
};

export default function WorkflowTemplatePreviewModal({
  open,
  templateId,
  templateName,
  channel,
  onClose,
}: Props) {
  const [preview, setPreview] = useState<{ subject: string | null; body: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadedId, setLoadedId] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !templateId) return;

    let cancelled = false;
    api
      .previewTemplate(templateId)
      .then((result) => {
        if (cancelled) return;
        setPreview(result);
        setError(null);
        setLoadedId(templateId);
      })
      .catch((e) => {
        if (cancelled) return;
        setPreview(null);
        setError(e instanceof Error ? e.message : "Could not load template preview");
        setLoadedId(templateId);
      });

    return () => {
      cancelled = true;
    };
  }, [open, templateId]);

  const loading = Boolean(open && templateId && loadedId !== templateId);
  const shownPreview = open && loadedId === templateId ? preview : null;
  const shownError = open && loadedId === templateId ? error : null;

  if (!open || !templateId) return null;

  return (
    <div className="wf-modal-backdrop" onClick={onClose}>
      <div
        className="wf-modal wf-modal-template"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wf-template-preview-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="wf-template-editor-header">
          <div className="min-w-0">
            <h2 id="wf-template-preview-title" className="wf-modal-title">
              {templateName}
            </h2>
            <p className="mt-1 text-xs uppercase tracking-wide" style={{ color: "var(--wf-text-3)" }}>
              {channel === "EMAIL" ? "Email template" : channel === "WHATSAPP" ? "WhatsApp template" : "SMS template"}
            </p>
          </div>
          <button type="button" className="wf-config-close" onClick={onClose} aria-label="Close">
            <i className="ti ti-x" />
          </button>
        </div>

        <div className="wf-template-editor-body">
          {loading && (
            <p className="text-sm" style={{ color: "var(--wf-text-2)" }}>
              Loading preview…
            </p>
          )}
          {shownError && <p className="wf-template-error">{shownError}</p>}
          {shownPreview && !loading && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--wf-text-3)" }}>
                Rendered preview
              </p>
              {shownPreview.subject && (
                <p className="mt-2 text-sm font-medium" style={{ color: "var(--wf-text-1)" }}>
                  {shownPreview.subject}
                </p>
              )}
              {channel === "EMAIL" ? (
                <div
                  className={`crm-email-body mt-3 rounded-xl p-3 text-sm [&_a]:underline [&_img]:my-2 [&_img]:max-w-full [&_img]:rounded-xl${
                    shownPreview.body && isDesignedEmailHtml(shownPreview.body) ? " crm-email-body--designed" : ""
                  }`}
                  style={{ background: "var(--wf-bg-subtle)", color: "var(--wf-text-1)" }}
                  dangerouslySetInnerHTML={{
                    __html: sanitizeEmailHtml(
                      isHtmlContent(shownPreview.body) ? shownPreview.body : plainTextToHtml(shownPreview.body)
                    ),
                  }}
                />
              ) : (
                (() => {
                  const { text, mediaUrls } = parseTrailingMediaUrls(shownPreview.body);
                  return (
                    <>
                      {text && (
                        <pre
                          className="mt-3 whitespace-pre-wrap rounded-xl p-3 text-sm"
                          style={{ background: "var(--wf-bg-subtle)", color: "var(--wf-text-1)" }}
                        >
                          {text}
                        </pre>
                      )}
                      {mediaUrls.map((url) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={url}
                          src={url}
                          alt=""
                          className="mt-3 max-h-48 rounded-xl border object-contain"
                          style={{ borderColor: "var(--wf-border)" }}
                        />
                      ))}
                    </>
                  );
                })()
              )}
            </div>
          )}
        </div>

        <div className="wf-modal-actions">
          <button type="button" className="wf-btn wf-btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
