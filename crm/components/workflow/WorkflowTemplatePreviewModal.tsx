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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !templateId) {
      setPreview(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setPreview(null);

    api
      .previewTemplate(templateId)
      .then((result) => {
        if (!cancelled) setPreview(result);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load template preview");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, templateId]);

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
          {error && <p className="wf-template-error">{error}</p>}
          {preview && !loading && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--wf-text-3)" }}>
                Rendered preview
              </p>
              {preview.subject && (
                <p className="mt-2 text-sm font-medium" style={{ color: "var(--wf-text-1)" }}>
                  {preview.subject}
                </p>
              )}
              {channel === "EMAIL" ? (
                <div
                  className={`crm-email-body mt-3 rounded-xl p-3 text-sm [&_a]:underline [&_img]:my-2 [&_img]:max-w-full [&_img]:rounded-xl${
                    preview.body && isDesignedEmailHtml(preview.body) ? " crm-email-body--designed" : ""
                  }`}
                  style={{ background: "var(--wf-bg-subtle)", color: "var(--wf-text-1)" }}
                  dangerouslySetInnerHTML={{
                    __html: sanitizeEmailHtml(
                      isHtmlContent(preview.body) ? preview.body : plainTextToHtml(preview.body)
                    ),
                  }}
                />
              ) : (
                (() => {
                  const { text, mediaUrls } = parseTrailingMediaUrls(preview.body);
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
