"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Calendar, ChevronDown } from "lucide-react";
import { api } from "@/crm/lib/api";
import { CRM_BASE_PATH } from "@/crm/lib/constants";
import { htmlToPlainText } from "@/crm/lib/messageFormatting";
import type { CampaignAudience, CampaignDetail, CampaignLeadFilter } from "@/crm/types/campaigns";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import TextField from "@/crm/components/ui/TextField";
import MessageRichCompose, {
  type EmailRichEditorHandle,
  type MessageRichComposeHandle,
} from "@/crm/components/ui/MessageRichCompose";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import StatusPill from "@/crm/components/ui/StatusPill";
import CampaignLeadPicker from "@/crm/components/email-campaigns/CampaignLeadPicker";

const MERGE_FIELDS = [
  "{{customer.firstName}}",
  "{{customer.lastName}}",
  "{{lead.propertyAddress}}",
  "{{lead.propertyPostcode}}",
  "{{lead.surveyType}}",
  "{{lead.quotedAmount}}",
  "{{links.paymentLink}}",
  "{{links.reportLink}}",
];

const DEFAULT_FROM_NAME = "Rosecrest Group";

const FOLD_GRID =
  "grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none";

function emptyFilter(): CampaignLeadFilter {
  return { stage: null, source: null, search: "" };
}

export default function CampaignEditor({ id }: { id: string }) {
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [plain, setPlain] = useState("");
  const [audience, setAudience] = useState<CampaignAudience>({
    include: emptyFilter(),
    exclude: null,
    recipients: [],
    selections: [],
    attachments: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [sendMode, setSendMode] = useState<"now" | "later" | "usual">("now");
  const [quietOn, setQuietOn] = useState(false);
  const [quietStart, setQuietStart] = useState("21:00");
  const [quietEnd, setQuietEnd] = useState("08:00");
  const [sendTimes, setSendTimes] = useState<{
    hours: { hour: number; predicted: number; fallback: number }[];
    predictedCount: number;
    fallbackCount: number;
    skippedCount: number;
  } | null>(null);
  const [sendTimesError, setSendTimesError] = useState("");
  const composeRef = useRef<MessageRichComposeHandle>(null);
  const emailEditorRef = useRef<EmailRichEditorHandle>(null);
  const insertTarget = useRef<"subject" | "body">("body");
  const subjectCaret = useRef({ start: 0, end: 0 });
  const hydrated = useRef(false);
  const dirty = useRef(false);
  const saveTimer = useRef<number>(0);
  const lockedRef = useRef(false);
  const saveDraftRef = useRef<() => Promise<boolean>>(async () => true);

  useEffect(() => {
    let cancelled = false;
    api
      .getCampaign(id)
      .then((row) => {
        if (cancelled) return;
        hydrated.current = false;
        setCampaign(row);
        setSubject(row.subject);
        setHtml(row.html);
        setPlain(htmlToPlainText(row.html));
        setAudience({
          ...row.audience,
          recipients: row.audience.recipients ?? [],
          selections: row.audience.selections ?? [],
          attachments: row.audience.attachments ?? [],
        });
        const timing = row.audience.timing;
        if (timing && timing.mode !== "now") {
          setSendMode(timing.mode);
          setScheduleDate(timing.sendDate ?? "");
          setScheduleTime(timing.fallbackTime ?? "");
          if (timing.quietStart && timing.quietEnd) {
            setQuietOn(true);
            setQuietStart(timing.quietStart);
            setQuietEnd(timing.quietEnd);
          }
          setScheduleOpen(true);
        } else if (row.scheduledAt) {
          const when = new Date(row.scheduledAt);
          if (!Number.isNaN(when.getTime())) {
            const local = new Date(when.getTime() - when.getTimezoneOffset() * 60_000).toISOString();
            setScheduleDate(local.slice(0, 10));
            setScheduleTime(local.slice(11, 16));
            setSendMode("later");
            setScheduleOpen(true);
          }
        }
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Could not open this campaign");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    composeRef.current?.setMediaUrls((campaign?.audience.attachments ?? []).map((item) => item.url));
  }, [campaign?.id, campaign?.audience.attachments]);

  useEffect(() => {
    if (sendMode !== "usual" || !scheduleDate || !scheduleTime) {
      setSendTimes(null);
      setSendTimesError("");
      return;
    }
    const timer = window.setTimeout(() => {
      api
        .previewCampaignSendTimes(id, {
          audience,
          sendDate: scheduleDate,
          fallbackTime: scheduleTime,
          quietStart: quietOn ? quietStart : null,
          quietEnd: quietOn ? quietEnd : null,
        })
        .then((plan) => {
          setSendTimes(plan);
          setSendTimesError("");
        })
        .catch((err: unknown) => {
          setSendTimes(null);
          setSendTimesError(err instanceof Error ? err.message : "Could not plan send times");
        });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [id, sendMode, scheduleDate, scheduleTime, quietOn, quietStart, quietEnd, audience]);

  function scheduledAtValue(): string | null {
    if (sendMode !== "later" || !scheduleDate || !scheduleTime) return null;
    const when = new Date(`${scheduleDate}T${scheduleTime}`);
    if (Number.isNaN(when.getTime())) return null;
    return when.toISOString();
  }

  function payload() {
    return {
      subject,
      fromName: DEFAULT_FROM_NAME,
      html,
      scheduledAt: scheduledAtValue(),
      audience: {
        ...audience,
        exclude: null,
        attachments: (composeRef.current?.getMediaUrls() ?? []).map((url) => ({
          url,
          filename: decodeURIComponent(url.split("/").pop() || "attachment").slice(0, 200),
        })),
        timing: {
          mode: sendMode,
          sendDate: sendMode === "now" ? null : scheduleDate || null,
          fallbackTime: sendMode === "now" ? null : scheduleTime || null,
          quietStart: sendMode === "usual" && quietOn ? quietStart : null,
          quietEnd: sendMode === "usual" && quietOn ? quietEnd : null,
        },
      },
    };
  }

  async function saveDraft() {
    if (lockedRef.current || !dirty.current) return true;
    dirty.current = false;
    setError("");
    setSaving(true);
    try {
      const row = await api.updateCampaign(id, payload());
      setCampaign(row);
      setSaved(true);
      return true;
    } catch (err) {
      dirty.current = true;
      setError(err instanceof Error ? err.message : "Could not save this campaign");
      return false;
    } finally {
      setSaving(false);
    }
  }
  saveDraftRef.current = saveDraft;

  const locked = campaign != null && campaign.status !== "DRAFT";
  lockedRef.current = locked;

  useEffect(() => {
    if (loading || !campaign || locked) return;
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    dirty.current = true;
    setSaved(false);
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      void saveDraft();
    }, 700);
    return () => window.clearTimeout(saveTimer.current);
  }, [id, loading, locked, subject, html, audience, sendMode, scheduleDate, scheduleTime, quietOn, quietStart, quietEnd]);

  useEffect(() => {
    function flush() {
      window.clearTimeout(saveTimer.current);
      void saveDraftRef.current();
    }
    function onHide() {
      if (document.visibilityState === "hidden") flush();
    }
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      flush();
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [id]);

  async function send() {
    setError("");
    setSent(false);
    setSaved(false);
    setSending(true);
    try {
      window.clearTimeout(saveTimer.current);
      dirty.current = true;
      const ok = await saveDraft();
      if (!ok) return;
      const row = await api.sendCampaign(id);
      setCampaign(row);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send this campaign");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <CrmPageContent className="space-y-4 py-3 sm:py-4 lg:py-4">
        <LoadingSpinner />
      </CrmPageContent>
    );
  }

  if (!campaign) {
    return (
      <CrmPageContent className="space-y-4 py-3 sm:py-4 lg:py-4">
        <p className="text-sm text-orange-700">{error || "Campaign not found"}</p>
      </CrmPageContent>
    );
  }

  const hasBody = plain.trim().length > 0 || html.replace(/<[^>]+>/g, " ").trim().length > 0;
  const scheduleReady = sendMode === "now" || (scheduleDate.length > 0 && scheduleTime.length > 0);
  const canSend =
    !locked &&
    !saving &&
    !sending &&
    subject.trim().length > 0 &&
    hasBody &&
    (audience.selections ?? []).length > 0 &&
    scheduleReady;
  const scheduleSummary =
    sendMode === "now"
      ? "Send now"
      : sendMode === "usual"
        ? scheduleDate
          ? `Usual open times · ${scheduleDate}`
          : "Pick a send date"
        : scheduleDate && scheduleTime
          ? `${scheduleDate} · ${scheduleTime}`
          : "Pick a date and time";

  function insertToken(token: string) {
    setSaved(false);
    if (insertTarget.current === "subject") {
      const { start, end } = subjectCaret.current;
      const next = subject.slice(0, start) + token + subject.slice(end);
      const caret = start + token.length;
      subjectCaret.current = { start: caret, end: caret };
      setSubject(next);
      return;
    }
    emailEditorRef.current?.insertText(token);
  }

  return (
    <CrmPageContent className="space-y-4 py-3 sm:py-4 lg:py-4">
      <Link href={`${CRM_BASE_PATH}/email-campaigns`} className="text-sm text-ink-muted hover:text-ink">
        Email campaigns
      </Link>
      <CrmPageHeader
        title={campaign.name}
        subtitle={
          <StatusPill
            variant={campaign.status === "SENT" ? "completed" : "new"}
            label={campaign.status === "DRAFT" ? "Draft" : campaign.status === "SENT" ? "Sent" : campaign.status}
          />
        }
        actions={
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              {locked ? null : (
                <span className="text-sm text-ink-muted motion-reduce:transition-none transition-opacity duration-200 ease-out">
                  {saving ? "Saving…" : saved ? "Saved" : ""}
                </span>
              )}
              <PrimaryButton type="button" onClick={send} disabled={!canSend}>
                {sending ? "Sending…" : sent ? "Sent" : sendMode === "now" ? "Send" : "Schedule"}
              </PrimaryButton>
            </div>
            {error ? (
              <p className="max-w-sm text-right text-sm text-orange-700 motion-reduce:transition-none transition-opacity duration-200 ease-out">
                {error}
              </p>
            ) : null}
          </div>
        }
      />

      <section className="space-y-6 rounded-xl border border-line bg-surface px-4 py-5 sm:px-5">
        <div role="group" aria-labelledby="email-send-to">
          <p id="email-send-to" className="mb-1.5 text-sm font-semibold text-ink">
            Send to
          </p>
          <CampaignLeadPicker
            value={audience.selections ?? []}
            disabled={locked}
            onChange={(selections) => {
              setSaved(false);
              setAudience({ ...audience, selections });
            }}
          />
          <div className="mt-3">
            <TextField
              id="campaign-subject"
              label="Subject"
              value={subject}
              disabled={locked}
              onFocus={(event) => {
                insertTarget.current = "subject";
                subjectCaret.current = {
                  start: event.currentTarget.selectionStart ?? subject.length,
                  end: event.currentTarget.selectionEnd ?? subject.length,
                };
              }}
              onSelect={(event) => {
                subjectCaret.current = {
                  start: event.currentTarget.selectionStart ?? subject.length,
                  end: event.currentTarget.selectionEnd ?? subject.length,
                };
              }}
              onChange={(event) => {
                setSaved(false);
                setSubject(event.target.value);
                subjectCaret.current = {
                  start: event.target.selectionStart ?? event.target.value.length,
                  end: event.target.selectionEnd ?? event.target.value.length,
                };
              }}
            />
            <div className="mt-3">
              <p className="mb-1.5 text-sm font-medium text-ink">Personalize</p>
              <div className="flex flex-wrap gap-1.5">
                {MERGE_FIELDS.map((field) => (
                  <button
                    key={field}
                    type="button"
                    disabled={locked}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => insertToken(field)}
                    className="rounded-full border border-line bg-surface px-2.5 py-1 font-mono text-[11px] text-ink-muted hover:border-ink-muted hover:text-ink disabled:cursor-default"
                  >
                    {field}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-ink-muted">
                Click a field to insert it into the subject or the email, whichever you used last.
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-ink">Email content</p>
          <div onMouseDown={() => { insertTarget.current = "body"; }}>
          <MessageRichCompose
            ref={composeRef}
            emailEditorRef={emailEditorRef}
            channel="EMAIL"
            plainValue={plain}
            htmlValue={html}
            disabled={locked}
            showSendButton={false}
            enableImageAttachments
            onUploadImage={async (file) => {
              setSaved(false);
              return (await api.uploadMessageMedia(file)).url;
            }}
            onAttachmentError={setError}
            placeholder="Write the email…"
            onPlainChange={(value) => {
              setSaved(false);
              setPlain(value);
            }}
            onHtmlChange={(value) => {
              setSaved(false);
              setHtml(value);
              setPlain(htmlToPlainText(value));
            }}
          />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-ink">Schedule</p>
            <span className="text-sm text-ink-muted">Optional</span>
          </div>
          <button
            type="button"
            aria-expanded={scheduleOpen}
            onClick={() => setScheduleOpen((open) => !open)}
            disabled={locked}
            className={`flex w-full items-center gap-2 rounded-md border border-line bg-surface px-3 py-2.5 text-left hover:border-ink-muted disabled:cursor-default ${
              scheduleOpen ? "border-ink" : ""
            }`}
          >
            <Calendar className="h-4 w-4 shrink-0 text-ink-subtle" />
            <span className={`min-w-0 flex-1 truncate text-sm ${sendMode !== "now" && !scheduleDate ? "text-ink-subtle" : "text-ink"}`}>
              {scheduleSummary}
            </span>
            <ChevronDown className={`h-4 w-4 shrink-0 text-ink-muted ${scheduleOpen ? "rotate-180" : ""}`} />
          </button>
          <div className={`${FOLD_GRID} ${scheduleOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
            <div className="min-h-0 overflow-hidden">
              <div className="space-y-3 pt-3">
                <div className="grid gap-2 sm:grid-cols-3">
                  <button
                    type="button"
                    aria-pressed={sendMode === "now"}
                    disabled={locked}
                    onClick={() => {
                      setSaved(false);
                      setSendMode("now");
                      setScheduleDate("");
                      setScheduleTime("");
                    }}
                    className={`rounded-md border px-3 py-2.5 text-left disabled:cursor-default ${
                      sendMode === "now"
                        ? "border-emerald-400 bg-emerald-100"
                        : "border-emerald-200 bg-emerald-50 hover:border-emerald-300"
                    }`}
                  >
                    <span className="block text-sm font-medium text-emerald-900">Send now</span>
                    <span className="mt-0.5 block text-xs text-emerald-800">Everyone gets it right away.</span>
                  </button>
                  <button
                    type="button"
                    aria-pressed={sendMode === "later"}
                    disabled={locked}
                    onClick={() => {
                      setSaved(false);
                      setSendMode("later");
                    }}
                    className={`rounded-md border px-3 py-2.5 text-left disabled:cursor-default ${
                      sendMode === "later"
                        ? "border-sky-400 bg-sky-100"
                        : "border-sky-200 bg-sky-50 hover:border-sky-300"
                    }`}
                  >
                    <span className="block text-sm font-medium text-sky-900">At a specific time</span>
                    <span className="mt-0.5 block text-xs text-sky-800">Everyone gets it at once.</span>
                  </button>
                  <button
                    type="button"
                    aria-pressed={sendMode === "usual"}
                    disabled={locked}
                    onClick={() => {
                      setSaved(false);
                      setSendMode("usual");
                      if (!scheduleTime) setScheduleTime("09:00");
                    }}
                    className={`rounded-md border px-3 py-2.5 text-left disabled:cursor-default ${
                      sendMode === "usual"
                        ? "border-violet-400 bg-violet-100"
                        : "border-violet-200 bg-violet-50 hover:border-violet-300"
                    }`}
                  >
                    <span className="block text-sm font-medium text-violet-900">When they&apos;re likely to open</span>
                    <span className="mt-0.5 block text-xs text-violet-800">Each person at their usual hour.</span>
                  </button>
                </div>
                {sendMode === "later" || sendMode === "usual" ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <TextField
                      label="Send date"
                      type="date"
                      value={scheduleDate}
                      disabled={locked}
                      onChange={(event) => {
                        setSaved(false);
                        setScheduleDate(event.target.value);
                      }}
                    />
                    <TextField
                      label={sendMode === "usual" ? "Fallback time" : "Send time"}
                      type="time"
                      value={scheduleTime}
                      disabled={locked}
                      onChange={(event) => {
                        setSaved(false);
                        setScheduleTime(event.target.value);
                      }}
                    />
                  </div>
                ) : null}
                {sendMode === "usual" ? (
                  <div className="space-y-3">
                    <p className="text-xs text-ink-muted">
                      Anyone with fewer than two opens or clicks in the last 90 days gets the fallback time.
                    </p>
                    <label className="flex items-center gap-2 text-sm text-ink">
                      <input
                        type="checkbox"
                        checked={quietOn}
                        disabled={locked}
                        onChange={(event) => {
                          setSaved(false);
                          setQuietOn(event.target.checked);
                        }}
                      />
                      Do not send overnight
                    </label>
                    {quietOn ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <TextField
                          label="Quiet from"
                          type="time"
                          value={quietStart}
                          disabled={locked}
                          onChange={(event) => {
                            setSaved(false);
                            setQuietStart(event.target.value);
                          }}
                        />
                        <TextField
                          label="Quiet until"
                          type="time"
                          value={quietEnd}
                          disabled={locked}
                          onChange={(event) => {
                            setSaved(false);
                            setQuietEnd(event.target.value);
                          }}
                        />
                      </div>
                    ) : null}
                    {sendTimesError ? <p className="text-sm text-orange-700">{sendTimesError}</p> : null}
                    {sendTimes ? (
                      <div className="space-y-2">
                        <p className="text-xs text-ink-muted">
                          {sendTimes.predictedCount} at their usual hour · {sendTimes.fallbackCount} at the fallback
                          {sendTimes.skippedCount > 0 ? ` · ${sendTimes.skippedCount} skipped` : ""}
                        </p>
                        <div className="flex h-16 items-end gap-0.5" aria-hidden="true">
                          {sendTimes.hours.map((bucket) => {
                            const total = bucket.predicted + bucket.fallback;
                            const max = Math.max(
                              1,
                              ...sendTimes.hours.map((row) => row.predicted + row.fallback),
                            );
                            return (
                              <div key={bucket.hour} className="flex h-full flex-1 flex-col justify-end">
                                <div
                                  className="w-full rounded-sm bg-brand"
                                  style={{ height: `${Math.max(total > 0 ? 8 : 0, (total / max) * 100)}%` }}
                                  title={`${bucket.hour}:00 · ${total}`}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </CrmPageContent>
  );
}
