"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react";
import {
  AlertCircle,
  Ban,
  Banknote,
  Check,
  CheckCheck,
  ChevronDown,
  Clock3,
  Eye,
  Mail,
  Maximize2,
  MessageSquare,
  Minus,
  OctagonPause,
  Phone,
  PhoneIncoming,
  PhoneMissed,
  PhoneOutgoing,
  Pause,
  Play,
  Reply,
  StickyNote,
  X,
} from "lucide-react";
import { api } from "@/crm/lib/api";
import type { Activity, InternalMessageItem, Message } from "@/crm/types";
import { toast } from "sonner";
import CurvedContainer from "@/crm/components/ui/CurvedContainer";
import CrmModal from "@/crm/components/ui/CrmModal";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import TextField from "@/crm/components/ui/TextField";
import ChannelSelector, { type MessageChannel } from "@/crm/components/ui/ChannelSelector";
import MessageRichCompose, {
  getEmailPayload,
  type MessageRichComposeHandle,
} from "@/crm/components/ui/MessageRichCompose";
import {
  formatChatDateSeparator,
  formatChatTime,
  initialsFromName,
  messageTimestamp,
} from "@/crm/lib/formatChatTime";
import { linkifyText } from "@/crm/lib/formatMessageBody";
import { messagePreviewSnippet } from "@/crm/lib/leadNotes";
import {
  isDesignedEmailHtml,
  parseWhatsAppFormatting,
  prepareEmailHtmlForThread,
} from "@/crm/lib/messageFormatting";
import { scrollChatContainerToBottom } from "@/crm/lib/scrollChatThread";
import { parseTrailingMediaUrls } from "@/crm/lib/messageMediaAttachments";
import { cadenceStopTooltip } from "@/crm/lib/cadenceStopReason";
import { callDirectionLabel, resolveCallDirection } from "@/crm/lib/callDisplay";
import SelectField from "@/crm/components/ui/SelectField";
import { usePhone } from "@/crm/lib/phoneContext";
import { refreshInboxUnreadCount } from "@/crm/lib/useInboxUnreadCount";
import {
  MESSAGE_FIRST_PAGE_SIZE,
  getCachedLeadThread,
  setCachedLeadThread,
} from "@/crm/lib/leadMessageCache";
import {
  fetchLeadThreadPage,
  prefetchLeadThreadWithActivities,
} from "@/crm/lib/loadLeadThread";
import MessageThreadSkeleton from "@/crm/components/ui/MessageThreadSkeleton";
import { cn } from "@/lib/utils";

type Channel = MessageChannel;

type ThreadEntry =
  | { kind: "message"; id: string; createdAt: string; message: Message }
  | { kind: "call"; id: string; createdAt: string; activity: Activity }
  | { kind: "cadence_stop"; id: string; createdAt: string; activity: Activity }
  | { kind: "payment"; id: string; createdAt: string; activity: Activity };

const MESSAGE_PAGE_SIZE = 40;
/** A thread this recently fetched (usually by the inbox prefetch) skips its own revalidate. */
const CACHE_FRESH_MS = 30_000;

function channelLabel(channel: string) {
  if (channel === "EMAIL") return "Email";
  if (channel === "WHATSAPP") return "WhatsApp";
  return "SMS";
}

function displayAddress(address?: string | null): string | null {
  const trimmed = address?.trim();
  if (!trimmed) return null;
  return trimmed.replace(/^whatsapp:/i, "");
}

function counterpartAddressLabel(message: Message, isOutbound: boolean): string | null {
  const address = displayAddress(isOutbound ? message.toAddress : message.fromAddress);
  if (!address) return null;
  return isOutbound ? `To ${address}` : `From ${address}`;
}

function isPolicySkipFailure(reason?: string | null): boolean {
  if (!reason) return false;
  const r = reason.toLowerCase();
  return (
    r.includes("cadence stopped") ||
    r.includes("marketing message blocked") ||
    r.includes("opted out") ||
    r.includes("opt-out")
  );
}

function deliveryStatusTooltip(status: string, failureReason?: string | null): string | undefined {
  const reason = failureReason?.trim();
  if (!reason) {
    if (status === "FAILED") return "Message failed to send";
    if (status === "BOUNCED") return "Message bounced";
    return undefined;
  }
  if (/opted out|opt-out/i.test(reason)) {
    return "Not sent — customer opted out of marketing";
  }
  if (/cadence stopped|marketing message blocked/i.test(reason)) {
    return "Not sent — nurture stopped (customer paid or lead closed)";
  }
  return reason;
}

function messageStatusMeta(
  status: string,
  channel: string,
  failureReason?: string | null
): {
  label: string;
  icon: typeof Check;
  tone: "success" | "neutral" | "pending" | "error" | "read" | "skipped";
} {
  switch (status) {
    case "READ":
      return {
        label: channel === "EMAIL" ? "Opened" : "Read",
        icon: channel === "EMAIL" ? Eye : CheckCheck,
        tone: "read",
      };
    case "DELIVERED":
      return { label: "Delivered", icon: CheckCheck, tone: "success" };
    case "SENT":
      return { label: "Sent", icon: Check, tone: "neutral" };
    case "QUEUED":
      return { label: "Sending", icon: Clock3, tone: "pending" };
    case "FAILED":
      if (isPolicySkipFailure(failureReason)) {
        return { label: "Skipped", icon: Ban, tone: "skipped" };
      }
      return { label: "Failed", icon: AlertCircle, tone: "error" };
    case "BOUNCED":
      return { label: "Bounced", icon: AlertCircle, tone: "error" };
    default:
      return { label: status.charAt(0) + status.slice(1).toLowerCase(), icon: Check, tone: "neutral" };
  }
}

function MessageDeliveryStatus({
  status,
  channel,
  failureReason,
}: {
  status: string;
  channel: string;
  failureReason?: string | null;
}) {
  const meta = messageStatusMeta(status, channel, failureReason);
  const Icon = meta.icon;
  const tooltip = deliveryStatusTooltip(status, failureReason);

  return (
    <span
      title={tooltip}
      aria-label={tooltip ? `${meta.label}: ${tooltip}` : meta.label}
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-medium",
        tooltip && "cursor-help",
        meta.tone === "read" && "text-sky-600",
        meta.tone === "success" && "text-emerald-600",
        meta.tone === "neutral" && "text-(--color-tc-30)",
        meta.tone === "pending" && "text-amber-600",
        meta.tone === "skipped" && "text-(--color-tc-30)",
        meta.tone === "error" && "text-red-600"
      )}
    >
      <Icon className="size-3 shrink-0" aria-hidden />
      {meta.label}
    </span>
  );
}

function suggestEmailSubject(messages: Message[], replyTarget?: Message | null): string {
  const source =
    replyTarget?.channel === "EMAIL" && replyTarget.subject?.trim()
      ? replyTarget
      : [...messages]
          .reverse()
          .find((m) => m.channel === "EMAIL" && m.subject?.trim());
  if (!source?.subject) return "";
  const subject = source.subject.trim();
  return /^re:/i.test(subject) ? subject : `Re: ${subject}`;
}

/** ~2 lines of text-sm / leading-relaxed — preview height for long email bubbles. */
const EMAIL_COLLAPSED_MAX_PX = 52;

function CollapsiblePlainBody({
  children,
  fadeFrom,
}: {
  children: ReactNode;
  fadeFrom: string;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const [fullHeight, setFullHeight] = useState(0);

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const measure = () => {
      const next = el.scrollHeight;
      setFullHeight(next);
      setOverflows(next > EMAIL_COLLAPSED_MAX_PX + 4);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [children]);

  const collapsed = overflows && !expanded;

  return (
    <div className="relative">
      <div
        className={cn(
          "overflow-hidden transition-[max-height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          overflows && "cursor-pointer"
        )}
        style={{
          maxHeight: overflows
            ? collapsed
              ? EMAIL_COLLAPSED_MAX_PX
              : Math.max(fullHeight, EMAIL_COLLAPSED_MAX_PX)
            : undefined,
        }}
        onClick={overflows ? () => setExpanded((value) => !value) : undefined}
        aria-expanded={overflows ? expanded : undefined}
      >
        <div ref={contentRef}>{children}</div>
      </div>
      {overflows && (
        <button
          type="button"
          className={cn(
            "flex w-full items-center justify-center text-current/55 transition-colors hover:text-current/80",
            collapsed
              ? cn("absolute inset-x-0 bottom-0 bg-linear-to-t to-transparent pt-7 pb-0.5", fadeFrom)
              : "mt-1.5 pt-0.5"
          )}
          onClick={(event) => {
            event.stopPropagation();
            setExpanded((value) => !value);
          }}
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          <ChevronDown
            className={cn(
              "size-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              expanded && "rotate-180"
            )}
            aria-hidden
          />
        </button>
      )}
    </div>
  );
}

function CollapsibleEmailBody({ body, isOutbound }: { body: string; isOutbound: boolean }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const [fullHeight, setFullHeight] = useState(0);
  const designed = isDesignedEmailHtml(body);

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const measure = () => {
      const next = el.scrollHeight;
      setFullHeight(next);
      setOverflows(next > EMAIL_COLLAPSED_MAX_PX + 4);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [body]);

  useEffect(() => {
    setExpanded(false);
  }, [body]);

  const collapsed = overflows && !expanded;
  const fadeFrom = designed
    ? "from-white"
    : isOutbound
      ? "from-indigo-100"
      : "from-indigo-50";

  return (
    <div className="relative">
      <div
        className={cn(
          "overflow-hidden transition-[max-height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          overflows && "cursor-pointer"
        )}
        style={{
          maxHeight: overflows
            ? collapsed
              ? EMAIL_COLLAPSED_MAX_PX
              : Math.max(fullHeight, EMAIL_COLLAPSED_MAX_PX)
            : undefined,
        }}
        onClick={
          overflows
            ? (event) => {
                // Let real links work; click elsewhere toggles expand/collapse.
                if ((event.target as HTMLElement).closest("a")) return;
                setExpanded((value) => !value);
              }
            : undefined
        }
        aria-expanded={overflows ? expanded : undefined}
      >
        <div
          ref={contentRef}
          className={cn(
            "crm-email-body crm-email-body--thread text-sm leading-relaxed [&_img]:my-2 [&_img]:max-w-full [&_img]:rounded-xl",
            designed
              ? "crm-email-body--designed"
              : cn(
                  "[&_a]:underline",
                  isOutbound ? "[&_a]:text-indigo-700" : "[&_a]:text-(--color-primary)"
                )
          )}
          dangerouslySetInnerHTML={{ __html: prepareEmailHtmlForThread(body) }}
        />
      </div>

      {overflows && (
        <button
          type="button"
          className={cn(
            "flex w-full items-center justify-center text-current/55 transition-colors hover:text-current/80",
            collapsed
              ? cn(
                  "absolute inset-x-0 bottom-0 bg-linear-to-t to-transparent pt-7 pb-0.5",
                  fadeFrom
                )
              : "mt-1.5 pt-0.5"
          )}
          onClick={(event) => {
            event.stopPropagation();
            setExpanded((value) => !value);
          }}
          aria-label={expanded ? "Collapse email" : "Expand email"}
        >
          <ChevronDown
            className={cn(
              "size-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              expanded && "rotate-180"
            )}
            aria-hidden
          />
        </button>
      )}
    </div>
  );
}

function MessageBody({
  body,
  channel,
  isOutbound,
}: {
  body: string;
  channel: string;
  isOutbound: boolean;
}) {
  const linkClass = isOutbound
    ? "underline underline-offset-2 opacity-90 hover:opacity-100"
    : "text-(--color-primary) underline underline-offset-2 hover:opacity-80";

  if (channel === "EMAIL") {
    return <CollapsibleEmailBody body={body} isOutbound={isOutbound} />;
  }

  if (channel === "WHATSAPP" || channel === "SMS") {
    const { text, mediaUrls } = parseTrailingMediaUrls(body);
    const content = channel === "WHATSAPP" ? (
      <div className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed">
        {parseWhatsAppFormatting(text).map((segment, index) => {
          if (segment.type === "bold") {
            return (
              <strong key={index} className="font-semibold">
                {segment.value}
              </strong>
            );
          }
          if (segment.type === "italic") {
            return (
              <em key={index} className="italic">
                {segment.value}
              </em>
            );
          }
          if (segment.type === "strike") {
            return (
              <span key={index} className="line-through opacity-80">
                {segment.value}
              </span>
            );
          }
          if (segment.type === "mono") {
            return (
              <code
                key={index}
                className={cn(
                  "rounded px-1 py-0.5 font-mono text-[0.85em]",
                  isOutbound ? "bg-white/15" : "bg-(--color-nc-10)"
                )}
              >
                {segment.value}
              </code>
            );
          }
          return <span key={index}>{linkifyText(segment.value, linkClass)}</span>;
        })}
      </div>
    ) : (
      <div className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed">
        {linkifyText(text, linkClass)}
      </div>
    );

    return (
      <div className="space-y-2">
        {text ? content : null}
        {mediaUrls.map((url) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={url} src={url} alt="" className="max-h-48 max-w-full rounded-xl object-contain" />
        ))}
      </div>
    );
  }

  return (
    <div className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed">
      {linkifyText(body, linkClass)}
    </div>
  );
}

function CadenceStopThreadBanner({ activity }: { activity: Activity }) {
  const tooltip = cadenceStopTooltip(activity);
  const time = formatChatTime(activity.createdAt);

  return (
    <div className="flex justify-center py-1">
      <div
        title={tooltip}
        aria-label={`Cadence stopped at ${time}: ${tooltip}`}
        className="inline-flex max-w-full cursor-help items-center gap-2 rounded-full border border-amber-300/80 bg-amber-50 px-3.5 py-1.5 text-amber-950 shadow-sm"
      >
        <OctagonPause className="size-3.5 shrink-0 text-amber-700" aria-hidden />
        <span className="text-xs font-semibold tracking-wide">Cadence stopped</span>
        <span className="text-[11px] font-medium text-amber-800/80">{time}</span>
      </div>
    </div>
  );
}

function PaymentReceivedThreadBanner({ activity }: { activity: Activity }) {
  const meta = activity.metadata ?? {};
  const amount = typeof meta.amount === "number" ? meta.amount : null;
  const method = typeof meta.method === "string" ? meta.method.replace(/_/g, " ") : null;
  const tooltipParts = [
    amount != null ? `£${amount.toFixed(2)}` : null,
    method,
    activity.description,
  ].filter(Boolean);
  const tooltip = tooltipParts.join(" · ") || "Payment received";
  const time = formatChatTime(activity.createdAt);

  return (
    <div className="flex justify-center py-1">
      <div
        title={tooltip}
        aria-label={`Payment received at ${time}: ${tooltip}`}
        className="inline-flex max-w-full cursor-help items-center gap-2 rounded-full border border-emerald-300/80 bg-emerald-50 px-3.5 py-1.5 text-emerald-950 shadow-sm"
      >
        <Banknote className="size-3.5 shrink-0 text-emerald-700" aria-hidden />
        <span className="text-xs font-semibold tracking-wide">Payment received</span>
        {amount != null && (
          <span className="text-[11px] font-medium text-emerald-800/90">£{amount.toFixed(2)}</span>
        )}
        <span className="text-[11px] font-medium text-emerald-800/80">{time}</span>
      </div>
    </div>
  );
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return null;
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && Boolean(item.trim()));
}

function formatCallDuration(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}m ${String(secs).padStart(2, "0")}s`;
}

function formatPlayerClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function CallMiniPlayer({
  activityId,
  durationSeconds,
  isOutbound,
}: {
  activityId: string;
  durationSeconds: number | null;
  isOutbound: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(durationSeconds && durationSeconds > 0 ? durationSeconds : 0);

  useEffect(() => {
    if (durationSeconds && durationSeconds > 0) setDuration(durationSeconds);
  }, [durationSeconds]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  async function ensureSrc() {
    const audio = audioRef.current;
    if (!audio) throw new Error("missing audio");
    if (objectUrlRef.current) return;
    const blob = await api.fetchDialpadCallRecording(activityId);
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const objectUrl = URL.createObjectURL(blob);
    objectUrlRef.current = objectUrl;
    audio.src = objectUrl;
    await new Promise<void>((resolve, reject) => {
      const onReady = () => {
        audio.removeEventListener("loadedmetadata", onReady);
        audio.removeEventListener("error", onError);
        resolve();
      };
      const onError = () => {
        audio.removeEventListener("loadedmetadata", onReady);
        audio.removeEventListener("error", onError);
        reject(new Error("load"));
      };
      audio.addEventListener("loadedmetadata", onReady);
      audio.addEventListener("error", onError);
      audio.load();
    });
  }

  async function toggle() {
    const audio = audioRef.current;
    if (!audio || loading) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    setError(false);
    setLoading(true);
    try {
      await ensureSrc();
      await audio.play();
    } catch {
      setPlaying(false);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  function seek(event: MouseEvent<HTMLButtonElement>) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
    setCurrent(audio.currentTime);
  }

  const progress = duration > 0 ? Math.min(1, current / duration) : 0;
  const tone = isOutbound
    ? {
        shell: "border-sky-200 bg-sky-50 text-sky-950",
        button: "bg-sky-600 text-white hover:bg-sky-700",
        track: "bg-sky-200",
        fill: "bg-sky-600",
      }
    : {
        shell: "border-emerald-200 bg-emerald-50 text-emerald-950",
        button: "bg-emerald-600 text-white hover:bg-emerald-700",
        track: "bg-emerald-200",
        fill: "bg-emerald-600",
      };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={cn("inline-flex items-center gap-2 rounded-full border px-1.5 py-1 shadow-sm", tone.shell)}>
        <audio
          ref={audioRef}
          preload="none"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            setPlaying(false);
            setCurrent(0);
          }}
          onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => {
            const next = event.currentTarget.duration;
            if (Number.isFinite(next) && next > 0) setDuration(next);
          }}
        />
        <button
          type="button"
          onClick={() => void toggle()}
          disabled={loading}
          aria-busy={loading}
          aria-label={playing ? "Pause recording" : "Play recording"}
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full transition-colors",
            tone.button,
            loading && "opacity-70"
          )}
        >
          {playing ? <Pause className="size-3 fill-current" /> : <Play className="size-3 fill-current" />}
        </button>
        <span className="w-8 text-[10px] font-medium tabular-nums">{formatPlayerClock(current)}</span>
        <button
          type="button"
          aria-label="Seek recording"
          onClick={seek}
          className={cn("relative h-1.5 w-24 rounded-full", tone.track)}
        >
          <span
            className={cn("absolute inset-y-0 left-0 rounded-full", tone.fill)}
            style={{ width: `${progress * 100}%` }}
          />
        </button>
        <span className="w-8 pr-1 text-[10px] font-medium tabular-nums">{formatPlayerClock(duration)}</span>
      </div>
      {error ? <p className="text-[10px] text-rose-700">Recording could not be played</p> : null}
    </div>
  );
}

function CallNotesPanel({
  recap,
  recapPurposes,
  recapActionItems,
  recapDisposition,
  transcript,
  duration,
  time,
  isOutbound,
}: {
  recap: string | null;
  recapPurposes: string[];
  recapActionItems: string[];
  recapDisposition: string | null;
  transcript: string | null;
  duration: string | null;
  time: string;
  isOutbound: boolean;
}) {
  const hasRecap = Boolean(
    recap || recapDisposition || recapPurposes.length || recapActionItems.length
  );
  const tabs = [
    hasRecap ? { id: "recap" as const, label: "Recap" } : null,
    transcript ? { id: "transcript" as const, label: "Transcript" } : null,
  ].filter((tab): tab is { id: "recap" | "transcript"; label: string } => Boolean(tab));

  const [activeId, setActiveId] = useState<"recap" | "transcript">(tabs[0]?.id ?? "recap");
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];
  if (!active) return null;

  const directionLabel = callDirectionLabel(isOutbound ? "outbound" : "inbound");
  const muted = isOutbound ? "text-sky-900/70" : "text-emerald-900/70";

  return (
    <div className="w-full max-w-[min(100%,36rem)]">
      <div
        className={cn(
          "rounded-xl border px-4 py-3 shadow-sm",
          isOutbound
            ? "border-sky-200/90 bg-sky-50/90 text-sky-950"
            : "border-emerald-200/90 bg-emerald-50/90 text-emerald-950"
        )}
      >
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className={cn("text-xs font-semibold tracking-wide", isOutbound ? "text-sky-950" : "text-emerald-950")}>
            {directionLabel}
          </span>
          {tabs.length > 1 ? (
            <div
              className={cn(
                "flex items-center rounded-lg p-0.5",
                isOutbound ? "bg-sky-100/80" : "bg-emerald-100/80"
              )}
              role="tablist"
              aria-label={`${directionLabel} call notes`}
            >
              {tabs.map((tab) => {
                const selected = tab.id === active.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setActiveId(tab.id)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
                      selected
                        ? "bg-white text-ink shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
                        : isOutbound
                          ? "text-sky-800/70 hover:text-sky-950"
                          : "text-emerald-800/70 hover:text-emerald-950"
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <span className={cn("text-xs font-semibold", isOutbound ? "text-sky-950" : "text-emerald-950")}>
              {active.id === "recap" ? "Recap" : "Transcript"}
            </span>
          )}
          {duration ? (
            <span className={cn("text-xs", muted)}>{duration}</span>
          ) : null}
          <span className={cn("text-xs", muted)}>{time}</span>
        </div>
        <CollapsiblePlainBody
          key={active.id}
          fadeFrom={isOutbound ? "from-sky-50" : "from-emerald-50"}
        >
          {active.id === "transcript" ? (
            <p className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed">{transcript}</p>
          ) : (
            <div className="space-y-3">
              {recap ? (
                <p className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed">{recap}</p>
              ) : null}
              {recapDisposition ? (
                <div>
                  <p className="text-xs font-semibold">Outcome</p>
                  <p className="mt-0.5 text-sm leading-relaxed">{recapDisposition}</p>
                </div>
              ) : null}
              {recapPurposes.length > 0 ? (
                <div>
                  <p className="text-xs font-semibold">Purpose</p>
                  <p className="mt-0.5 text-sm leading-relaxed">{recapPurposes.join(" · ")}</p>
                </div>
              ) : null}
              {recapActionItems.length > 0 ? (
                <div>
                  <p className="text-xs font-semibold">Action items</p>
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-sm leading-relaxed">
                    {recapActionItems.map((item, index) => (
                      <li key={`${index}-${item.slice(0, 24)}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </CollapsiblePlainBody>
      </div>
    </div>
  );
}

function callNumberFromMeta(
  meta: Record<string, unknown>,
  direction: "inbound" | "outbound"
): string | null {
  const preferred =
    direction === "inbound"
      ? [meta.from, meta.phone, meta.to]
      : [meta.to, meta.phone, meta.from];
  for (const value of preferred) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function CallThreadBanner({
  activity,
  customerPhone,
}: {
  activity: Activity;
  customerPhone?: string | null;
}) {
  const meta = activity.metadata ?? {};
  const direction = resolveCallDirection(meta, customerPhone, activity.description);
  const isOutbound = direction === "outbound";
  const outcome = typeof meta.outcome === "string" ? meta.outcome.toLowerCase() : "";
  const durationSeconds =
    asFiniteNumber(meta.durationSeconds) ?? asFiniteNumber(meta.duration);
  const isInitiated =
    activity.type.includes("initiated") &&
    durationSeconds == null &&
    Date.now() - new Date(activity.createdAt).getTime() < 3 * 60 * 1000;
  const missed =
    outcome === "no_answer" ||
    outcome === "missed" ||
    outcome === "busy" ||
    outcome === "cancelled" ||
    outcome === "canceled";
  const isVoicemail = outcome === "voicemail";

  const duration =
    durationSeconds != null && (durationSeconds > 0 || !isInitiated)
      ? formatCallDuration(durationSeconds)
      : null;

  const number = callNumberFromMeta(meta, direction);
  const recordingUrl = typeof meta.recordingUrl === "string" ? meta.recordingUrl : null;
  const transcript =
    typeof meta.transcript === "string" && meta.transcript.trim()
      ? meta.transcript
      : null;
  const recap =
    typeof meta.recapSummary === "string" && meta.recapSummary.trim()
      ? meta.recapSummary
      : typeof meta.summary === "string" && meta.summary.trim()
        ? meta.summary
        : null;
  const recapPurposes = asStringList(meta.recapPurposes);
  const recapActionItems = asStringList(meta.recapActionItems);
  const recapDisposition =
    typeof meta.recapDisposition === "string" && meta.recapDisposition.trim()
      ? meta.recapDisposition
      : null;
  const time = formatChatTime(activity.createdAt);

  const label = isVoicemail
    ? isOutbound
      ? "Outgoing voicemail"
      : "Incoming voicemail"
    : missed
    ? isOutbound
      ? outcome === "busy"
        ? "Busy"
        : outcome === "cancelled" || outcome === "canceled"
          ? "Cancelled"
          : "No answer"
      : "Missed call"
    : isInitiated
      ? isOutbound
        ? "Outgoing call…"
        : "Incoming call…"
      : isOutbound
        ? "Outgoing call"
        : "Incoming call";

  const Icon = missed && !isOutbound ? PhoneMissed : isOutbound ? PhoneOutgoing : PhoneIncoming;

  const colors = missed
    ? {
        shell: "border-rose-300/80 bg-rose-50 text-rose-950",
        icon: "text-rose-700",
        muted: "text-rose-800/80",
      }
    : isInitiated
      ? {
          shell: "border-amber-300/80 bg-amber-50 text-amber-950",
          icon: "text-amber-700",
          muted: "text-amber-800/80",
        }
      : isOutbound
        ? {
            shell: "border-sky-300/80 bg-sky-50 text-sky-950",
            icon: "text-sky-700",
            muted: "text-sky-800/80",
          }
        : {
            shell: "border-emerald-300/80 bg-emerald-50 text-emerald-950",
            icon: "text-emerald-700",
            muted: "text-emerald-800/80",
          };

  const tooltipParts = [
    label,
    number,
    duration ? `Duration ${duration}` : null,
    activity.description,
  ].filter(Boolean);
  const tooltip = tooltipParts.join(" · ");

  return (
    <div className="flex flex-col items-center gap-1.5 py-1">
      <div
        title={tooltip}
        aria-label={`${label}${number ? ` ${number}` : ""}${duration ? ` ${duration}` : ""} at ${time}`}
        className={cn(
          "inline-flex max-w-full cursor-help items-center gap-2 rounded-full border px-3.5 py-1.5 shadow-sm",
          colors.shell
        )}
      >
        <Icon className={cn("size-3.5 shrink-0", colors.icon)} aria-hidden />
        <span className="text-xs font-semibold tracking-wide">{label}</span>
        {number ? (
          <span className={cn("max-w-[10rem] truncate text-[11px] font-medium tabular-nums", colors.muted)}>
            {number}
          </span>
        ) : null}
        {duration ? (
          <span
            title="Call duration"
            className={cn("text-[11px] font-semibold tabular-nums", colors.muted)}
          >
            {duration}
          </span>
        ) : null}
        <span title="Time of call" className={cn("text-[11px] font-medium tabular-nums", colors.muted)}>
          {time}
        </span>
      </div>

      {recordingUrl ? (
        <CallMiniPlayer
          activityId={activity.id}
          durationSeconds={durationSeconds}
          isOutbound={isOutbound}
        />
      ) : null}

      {recap || recapDisposition || recapPurposes.length || recapActionItems.length || transcript ? (
        <CallNotesPanel
          recap={recap}
          recapPurposes={recapPurposes}
          recapActionItems={recapActionItems}
          recapDisposition={recapDisposition}
          transcript={transcript}
          duration={duration}
          time={time}
          isOutbound={isOutbound}
        />
      ) : null}
    </div>
  );
}

function ThreadBubble({
  message,
  customerName,
  onReply,
  onAddNote,
}: {
  message: Message;
  customerName: string;
  onReply?: (message: Message) => void;
  onAddNote?: (message: Message) => void;
}) {
  const isOutbound = message.direction === "OUTBOUND";
  const authorName = isOutbound
    ? message.author?.fullName?.trim() || "Rosecrest"
    : customerName;
  const ChannelIcon =
    message.channel === "EMAIL" ? Mail : message.channel === "WHATSAPP" ? Phone : MessageSquare;
  // Inbound replies often quote designed cards; keep bubble padding so reply text isn't flush.
  const designedEmail =
    message.channel === "EMAIL" && isOutbound && isDesignedEmailHtml(message.body);
  const addressLabel = counterpartAddressLabel(message, isOutbound);

  return (
    <div className={cn("group flex gap-2", isOutbound ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
          isOutbound ? "bg-(--color-primary) text-white" : "bg-brand-muted text-brand"
        )}
        aria-hidden
      >
        {initialsFromName(authorName)}
      </div>

      <div
        className={cn(
          "flex min-w-0 max-w-[min(100%,36rem)] flex-col",
          designedEmail && "w-full",
          isOutbound ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "mb-1 flex flex-wrap items-center gap-2 text-xs text-(--color-tc-30)",
            isOutbound && "justify-end"
          )}
        >
          <span className="font-medium text-(--color-tc-40)">{authorName}</span>
          <span
            className={cn(
              "inline-flex items-center gap-1",
              message.channel === "WHATSAPP" && "text-emerald-600",
              message.channel === "SMS" && "text-orange-500",
              message.channel === "EMAIL" && "text-indigo-500"
            )}
          >
            <ChannelIcon className="size-3" aria-hidden />
            {channelLabel(message.channel)}
            {addressLabel && (
              <span className="text-[10px] text-(--color-tc-30)">{addressLabel}</span>
            )}
          </span>
          <span>{formatChatTime(messageTimestamp(message))}</span>
          {isOutbound && (
            <MessageDeliveryStatus
              status={message.status}
              channel={message.channel}
              failureReason={message.failureReason}
            />
          )}
        </div>

        <CurvedContainer
          variant={designedEmail ? "white" : isOutbound ? "primary" : "white"}
          className={cn(
            designedEmail ? "w-full overflow-hidden p-0" : "px-4 py-3",
            message.channel === "WHATSAPP" &&
              (isOutbound ? "bg-emerald-600" : "border-emerald-200 bg-emerald-50/70"),
            message.channel === "SMS" &&
              (isOutbound
                ? "border border-orange-200 bg-orange-100 text-orange-950 [&_a]:text-orange-800"
                : "border-orange-100 bg-orange-50/80"),
            message.channel === "EMAIL" &&
              !designedEmail &&
              (isOutbound
                ? "border border-indigo-200 bg-indigo-100 text-indigo-950 [&_a]:text-indigo-700"
                : "border-indigo-100 bg-indigo-50/80"),
            designedEmail && "border border-(--color-line) bg-white text-(--color-ink)",
            isOutbound &&
              message.channel !== "SMS" &&
              message.channel !== "EMAIL" &&
              "text-white [&_a]:text-white",
            !isOutbound && !designedEmail && "text-(--color-tc-40)"
          )}
          showBorderAndShadow={!isOutbound || designedEmail}
        >
          {message.channel === "EMAIL" && message.subject && (
            <p
              className={cn(
                "border-b pb-2 text-sm font-semibold",
                designedEmail
                  ? "mb-0 border-(--color-line) px-4 pt-3 text-(--color-ink)"
                  : cn("mb-2", isOutbound ? "border-indigo-200/80" : "border-(--color-tc-20)")
              )}
            >
              {message.subject}
            </p>
          )}
          <MessageBody body={message.body} channel={message.channel} isOutbound={isOutbound} />
        </CurvedContainer>

        {(onReply || onAddNote) && (
          <div
            className={cn(
              "mt-1 flex items-center gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100",
              isOutbound && "flex-row-reverse"
            )}
          >
            {onReply ? (
              <button
                type="button"
                onClick={() => onReply(message)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-(--color-tc-30) transition hover:bg-white hover:text-(--color-tc-40)"
              >
                <Reply className="size-3" aria-hidden />
                Reply
              </button>
            ) : null}
            {onAddNote ? (
              <button
                type="button"
                onClick={() => onAddNote(message)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-(--color-tc-30) transition hover:bg-white hover:text-(--color-tc-40)"
              >
                <StickyNote className="size-3" aria-hidden />
                Note
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LeadMessageThread({
  leadId,
  customerName,
  customerPhone,
  messages: initialMessages,
  threadActivities: initialThreadActivities = [],
  onSent,
  onRead,
  onAddNote,
  className,
  headerActions,
  framed = true,
  /** When true, paint seed immediately but still fetch fresh messages (inbox preview). */
  revalidateSeed = false,
  isActive = true,
}: {
  leadId: string;
  customerName: string;
  customerPhone?: string | null;
  messages: Message[];
  /** Calls + cadence-stop + payment system events, sorted into the chat by time */
  threadActivities?: Activity[];
  onSent?: () => void;
  /** Fired as the thread is marked read so the inbox can drop its unread styling. */
  onRead?: (leadId: string) => void;
  /** Opens the Internal notes tab with this customer message as the note target. */
  onAddNote?: (message: Message) => void;
  className?: string;
  headerActions?: ReactNode;
  framed?: boolean;
  revalidateSeed?: boolean;
  /** When false, the thread stays mounted offscreen (inbox tab carousel). */
  isActive?: boolean;
}) {
  const cachedThread = getCachedLeadThread(leadId);
  const [messages, setMessages] = useState(() =>
    initialMessages.length > 0 ? initialMessages : cachedThread?.messages ?? []
  );
  const [threadActivities, setThreadActivities] = useState<Activity[]>(() =>
    initialThreadActivities.length > 0
      ? initialThreadActivities
      : cachedThread?.activities ?? []
  );
  const [messagesPage, setMessagesPage] = useState(() => cachedThread?.page ?? 1);
  const [messagesHasMore, setMessagesHasMore] = useState(() => cachedThread?.hasMore ?? false);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [loading, setLoading] = useState(
    () =>
      initialMessages.length === 0 &&
      !cachedThread?.notesLoaded &&
      initialThreadActivities.length === 0
  );
  const [sending, setSending] = useState(false);
  const [targetMessage, setTargetMessage] = useState<Message | null>(null);
  const [channel, setChannel] = useState<Channel>("EMAIL");
  const [subject, setSubject] = useState("");
  const [plainBody, setPlainBody] = useState("");
  const [htmlBody, setHtmlBody] = useState("");
  const [error, setError] = useState("");
  const [composeCollapsed, setComposeCollapsed] = useState(true);
  const [composeExpanded, setComposeExpanded] = useState(false);
  const { teamConnectEnabled, teamConnectNumbers, selectedPhoneDocId, setSelectedPhoneDocId, dialpadEnabled } =
    usePhone();
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasScrolledToBottomRef = useRef(false);
  const composeRef = useRef<MessageRichComposeHandle>(null);
  const expandedComposeRef = useRef<MessageRichComposeHandle>(null);
  const onReadRef = useRef(onRead);
  onReadRef.current = onRead;

  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (a, b) =>
          new Date(messageTimestamp(a)).getTime() - new Date(messageTimestamp(b)).getTime()
      ),
    [messages]
  );

  function applyMessagePage(
    result: { items: Message[]; page: number; limit: number; total: number; hasMore?: boolean },
    mode: "replace" | "append",
    extras?: {
      notes?: InternalMessageItem[];
      conversationId?: string | null;
      activities?: Activity[];
    }
  ) {
    const hasMore = result.hasMore ?? result.page * result.limit < result.total;
    setMessages((prev) => {
      if (mode === "replace") return result.items;
      const seen = new Set(prev.map((message) => message.id));
      return [...prev, ...result.items.filter((message) => !seen.has(message.id))];
    });
    setMessagesPage(result.page);
    setMessagesHasMore(hasMore);
    if (extras?.activities) setThreadActivities(extras.activities);

    const cached = getCachedLeadThread(leadId);
    const mergedMessages =
      mode === "replace"
        ? result.items
        : (() => {
            const prev = cached?.messages ?? [];
            const seen = new Set(prev.map((message) => message.id));
            return [...prev, ...result.items.filter((message) => !seen.has(message.id))];
          })();
    setCachedLeadThread(leadId, {
      messages: mergedMessages,
      notes: extras?.notes ?? cached?.notes,
      conversationId:
        extras?.conversationId !== undefined
          ? extras.conversationId
          : cached?.conversationId,
      page: result.page,
      hasMore,
      activities: extras?.activities ?? cached?.activities,
      notesLoaded: extras?.notes !== undefined ? true : cached?.notesLoaded,
    });
  }

  useEffect(() => {
    // Ignore empty seed arrays — inbox passes `messages={[]}` which would otherwise
    // clear fetched messages whenever the parent re-renders after send.
    if (initialMessages.length > 0 && !getCachedLeadThread(leadId)?.notesLoaded) {
      setMessages(initialMessages);
    }
  }, [initialMessages, leadId]);

  useEffect(() => {
    if (initialThreadActivities.length > 0 && !getCachedLeadThread(leadId)?.notesLoaded) {
      setThreadActivities(initialThreadActivities);
    }
  }, [initialThreadActivities, leadId]);

  useEffect(() => {
    let cancelled = false;
    const cached = getCachedLeadThread(leadId);
    const cacheIsComplete = Boolean(cached?.notesLoaded);
    const cacheIsFresh = cached ? Date.now() - cached.fetchedAt < CACHE_FRESH_MS : false;

    if (cached) {
      setMessages(cached.messages);
      setMessagesPage(cached.page);
      setMessagesHasMore(cached.hasMore);
      setThreadActivities(cached.activities);
      setLoading(!cacheIsComplete);
    } else if (initialMessages.length > 0) {
      setMessages(initialMessages);
      setThreadActivities(initialThreadActivities);
      setLoading(true);
    } else {
      setMessages([]);
      setMessagesPage(1);
      setMessagesHasMore(false);
      setLoading(true);
    }

    (async () => {
      try {
        if (!(cacheIsComplete && cacheIsFresh)) {
          const take = Math.max(
            MESSAGE_FIRST_PAGE_SIZE,
            cached?.messages.length ?? 0,
            initialMessages.length
          );
          const thread = cacheIsComplete
            ? await fetchLeadThreadPage(leadId, take)
            : await prefetchLeadThreadWithActivities(leadId, take);
          if (cancelled) return;
          applyMessagePage(
            {
              items: thread.messages,
              page: thread.page,
              limit: take,
              total: thread.messages.length + (thread.hasMore ? 1 : 0),
              hasMore: thread.hasMore,
            },
            "replace",
            {
              notes: thread.notes,
              conversationId: thread.conversationId,
              activities: thread.activities,
            }
          );
        }
      } catch {
        // keep cache / seed / empty state
      } finally {
        if (!cancelled) setLoading(false);
      }

      if ((!teamConnectEnabled && !dialpadEnabled) || cancelled) return;

      // Defer provider sync so first paint isn't blocked.
      await new Promise((resolve) => window.setTimeout(resolve, 1500));
      if (cancelled) return;

      try {
        const [sms, calls] = await Promise.all([
          teamConnectEnabled
            ? api.syncLeadSmsFromTeamConnect(leadId).catch(() => ({ synced: 0 }))
            : Promise.resolve({ synced: 0 }),
          dialpadEnabled
            ? api.syncLeadCallsFromDialpad(leadId).catch(() => ({ synced: 0 }))
            : Promise.resolve({ synced: 0 }),
        ]);
        if (cancelled || (!sms.synced && !calls.synced)) return;
        const take = Math.max(
          MESSAGE_PAGE_SIZE,
          getCachedLeadThread(leadId)?.messages.length ?? 0
        );
        const thread = await fetchLeadThreadPage(leadId, take);
        if (cancelled) return;
        applyMessagePage(
          {
            items: thread.messages,
            page: thread.page,
            limit: take,
            total: thread.messages.length + (thread.hasMore ? 1 : 0),
            hasMore: thread.hasMore,
          },
          "replace",
          {
            notes: thread.notes,
            conversationId: thread.conversationId,
            activities: thread.activities,
          }
        );
      } catch {
        // Sync is best-effort; UI already has DB messages.
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when lead / messaging providers change
  }, [leadId, teamConnectEnabled, dialpadEnabled, revalidateSeed]);

  useEffect(() => {
    hasScrolledToBottomRef.current = false;
  }, [leadId]);

  // Opening the thread clears it for the whole team and drops the matching bell items.
  useEffect(() => {
    onReadRef.current?.(leadId);
    void api
      .markInboxThreadRead(leadId)
      .then(() => refreshInboxUnreadCount())
      .catch(() => {
        // best-effort: the row just stays highlighted until the next refresh
      });
  }, [leadId]);

  useLayoutEffect(() => {
    // Jump on the thread's first paint; only animate for messages that arrive after it.
    const itemCount = sortedMessages.length + threadActivities.length;
    const behavior: ScrollBehavior =
      itemCount > 0 && hasScrolledToBottomRef.current ? "smooth" : "instant";
    if (itemCount > 0) hasScrolledToBottomRef.current = true;
    scrollChatContainerToBottom(scrollRef.current, behavior);
  }, [
    sortedMessages.length,
    threadActivities.length,
    sortedMessages[sortedMessages.length - 1]?.id,
  ]);

  useEffect(() => {
    if (channel !== "EMAIL") return;
    setSubject((current) => current || suggestEmailSubject(sortedMessages, targetMessage));
  }, [channel, sortedMessages, targetMessage]);

  useEffect(() => {
    if (!composeExpanded) return;
    const urls = composeRef.current?.getMediaUrls() ?? [];
    if (urls.length === 0) return;
    requestAnimationFrame(() => {
      expandedComposeRef.current?.setMediaUrls(urls);
      composeRef.current?.clearMedia();
    });
  }, [composeExpanded]);

  function clearComposeTarget() {
    setTargetMessage(null);
  }

  function openComposer(message?: Message | null) {
    setTargetMessage(message ?? null);
    setComposeCollapsed(false);
    setError("");
    if (message) {
      const nextChannel = (message.channel as Channel) || "EMAIL";
      setChannel(nextChannel);
      if (nextChannel === "EMAIL") {
        setSubject(suggestEmailSubject(sortedMessages, message));
      }
    }
  }

  function closeExpandedComposer() {
    expandedComposeRef.current?.flushDraft();
    const urls = expandedComposeRef.current?.getMediaUrls() ?? [];
    setComposeExpanded(false);
    if (urls.length > 0) {
      requestAnimationFrame(() => composeRef.current?.setMediaUrls(urls));
    }
  }

  async function loadOlderMessages() {
    if (!messagesHasMore || loadingOlderMessages) return;
    setLoadingOlderMessages(true);
    try {
      const result = await api.listMessages({
        leadId,
        limit: String(MESSAGE_PAGE_SIZE),
        page: String(messagesPage + 1),
      });
      applyMessagePage(result, "append");
    } catch {
      // keep current list
    } finally {
      setLoadingOlderMessages(false);
    }
  }

  async function refreshMessages(opts?: { silent?: boolean }) {
    const silent = opts?.silent ?? false;
    if (!silent) setLoading(true);
    try {
      const smsPromise = teamConnectEnabled
        ? api.syncLeadSmsFromTeamConnect(leadId).catch(() => undefined)
        : Promise.resolve(undefined);
      const callsPromise = dialpadEnabled
        ? api.syncLeadCallsFromDialpad(leadId).catch(() => undefined)
        : Promise.resolve(undefined);

      const take = Math.max(MESSAGE_PAGE_SIZE, messages.length, messagesPage * MESSAGE_PAGE_SIZE);
      const result = await fetchLeadThreadPage(leadId, take);
      applyMessagePage(result.pageResult, "replace", {
        notes: result.notes,
        conversationId: result.conversationId,
        activities: result.activities,
      });
      if (!silent) setLoading(false);

      const [sms, calls] = await Promise.all([smsPromise, callsPromise]);
      if (sms?.synced || calls?.synced) {
        const thread = await fetchLeadThreadPage(leadId, take);
        applyMessagePage(thread.pageResult, "replace", {
          notes: thread.notes,
          conversationId: thread.conversationId,
          activities: thread.activities,
        });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    if (!teamConnectEnabled && !dialpadEnabled) return;
    const tick = () => {
      if (document.visibilityState !== "visible") return;
      void refreshMessages({ silent: true });
    };
    const timer = window.setInterval(tick, 60_000);
    return () => window.clearInterval(timer);
  }, [leadId, teamConnectEnabled, dialpadEnabled]);

  const composePlaceholder =
    channel === "EMAIL"
      ? "Write your email…"
      : channel === "WHATSAPP"
        ? "Write a WhatsApp message…"
        : "Write an SMS…";

  const composeWindowControls = (
    <>
      <button
        type="button"
        onClick={() => setComposeCollapsed(true)}
        aria-label="Minimize composer"
        title="Minimize"
        className="flex size-8 items-center justify-center rounded-lg text-(--color-tc-30) transition hover:bg-(--color-nc-10) hover:text-(--color-tc-40)"
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => {
          composeRef.current?.flushDraft();
          setComposeExpanded(true);
        }}
        aria-label="Expand composer"
        title="Expand"
        className="flex size-8 items-center justify-center rounded-lg text-(--color-tc-30) transition hover:bg-(--color-nc-10) hover:text-(--color-tc-40)"
      >
        <Maximize2 className="size-3.5" aria-hidden />
      </button>
    </>
  );

  const smsNumbers = teamConnectNumbers.filter((n) => n.smsEnabled && n.status === "active");
  const showSmsNumberSelector =
    channel === "SMS" && teamConnectEnabled && smsNumbers.length > 0;

  async function handleSend() {
    const emailPayload = channel === "EMAIL" ? getEmailPayload(htmlBody) : null;
    const activeComposeRef = composeExpanded ? expandedComposeRef : composeRef;
    const mediaUrls = channel !== "SMS" ? (activeComposeRef.current?.getMediaUrls() ?? []) : [];
    const text = channel === "EMAIL" ? (emailPayload?.plain ?? "") : plainBody.trim();
    const hasEmailContent =
      Boolean(emailPayload?.plain.trim()) ||
      /<img[\s>]/i.test(emailPayload?.html ?? "") ||
      mediaUrls.length > 0;
    const hasContent = channel === "EMAIL" ? hasEmailContent : text.length > 0 || mediaUrls.length > 0;
    if (!hasContent) return;

    if (channel === "EMAIL" && !subject.trim()) {
      setError("Subject is required for email.");
      return;
    }

    setSending(true);
    setError("");
    try {
      await api.sendMessage({
        channel,
        leadId,
        body: channel === "EMAIL" ? text : text || undefined,
        htmlBody: channel === "EMAIL" ? emailPayload?.html : undefined,
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
        subject: channel === "EMAIL" ? subject.trim() : undefined,
        replyToMessageId: targetMessage?.id,
        teamConnectPhoneDocId:
          channel === "SMS" && teamConnectEnabled
            ? selectedPhoneDocId ?? smsNumbers[0]?.phoneDocId
            : undefined,
      });
      setPlainBody("");
      setHtmlBody("");
      composeRef.current?.clearMedia();
      expandedComposeRef.current?.clearMedia();
      clearComposeTarget();
      if (channel === "EMAIL") {
        setSubject(suggestEmailSubject(sortedMessages));
      }
      await refreshMessages();
      onSent?.();
      setComposeExpanded(false);
      toast.success(
        channel === "EMAIL"
          ? "Email sent"
          : channel === "SMS"
            ? "SMS sent"
            : "WhatsApp message sent"
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to send message";
      setError(message);
      toast.error(message);
    } finally {
      setSending(false);
    }
  }

  const sortedThreadEntries = useMemo(() => {
    const entries: ThreadEntry[] = [
      ...sortedMessages.map((message) => ({
        kind: "message" as const,
        id: message.id,
        createdAt: messageTimestamp(message),
        message,
      })),
      ...threadActivities.flatMap((activity): ThreadEntry[] => {
        if (activity.type === "payment.received") {
          return [
            {
              kind: "payment" as const,
              id: activity.id,
              createdAt: activity.createdAt,
              activity,
            },
          ];
        }
        if (activity.type === "cadence.stopped") {
          // Payment banner already covers the paid case — skip duplicate stop chip
          if (activity.metadata?.reason === "payment_received") return [];
          return [
            {
              kind: "cadence_stop" as const,
              id: activity.id,
              createdAt: activity.createdAt,
              activity,
            },
          ];
        }
        if (activity.type.includes("call")) {
          return [
            {
              kind: "call" as const,
              id: activity.id,
              createdAt: activity.createdAt,
              activity,
            },
          ];
        }
        return [];
      }),
    ];
    return entries.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [sortedMessages, threadActivities]);

  const threadItems: Array<
    | { kind: "date"; key: string; label: string }
    | { kind: "message"; key: string; message: Message }
    | { kind: "call"; key: string; activity: Activity }
    | { kind: "cadence_stop"; key: string; activity: Activity }
    | { kind: "payment"; key: string; activity: Activity }
  > = [];
  let lastDate = "";

  for (const entry of sortedThreadEntries) {
    const dateLabel = formatChatDateSeparator(entry.createdAt);
    if (dateLabel !== lastDate) {
      threadItems.push({ kind: "date", key: `date-${dateLabel}-${entry.id}`, label: dateLabel });
      lastDate = dateLabel;
    }
    if (entry.kind === "message") {
      threadItems.push({ kind: "message", key: entry.id, message: entry.message });
    } else if (entry.kind === "cadence_stop") {
      threadItems.push({ kind: "cadence_stop", key: entry.id, activity: entry.activity });
    } else if (entry.kind === "payment") {
      threadItems.push({ kind: "payment", key: entry.id, activity: entry.activity });
    } else {
      threadItems.push({ kind: "call", key: entry.id, activity: entry.activity });
    }
  }

  const threadBody = (
    <>
      {headerActions ? (
        <div className="flex shrink-0 items-center border-b border-(--color-tc-20) px-4 py-2">
          {headerActions}
        </div>
      ) : null}

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-(--color-nc-10) px-4 py-4">
        {loading && sortedThreadEntries.length === 0 ? (
          <MessageThreadSkeleton />
        ) : sortedThreadEntries.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-medium text-(--color-tc-40)">No messages yet</p>
            <p className="mt-1 max-w-sm text-xs text-(--color-tc-30)">
              Send a reply below. Replies and calls appear here together.
            </p>
          </div>
        ) : (
          <>
            {messagesHasMore ? (
              <div className="flex justify-center py-1">
                <button
                  type="button"
                  onClick={() => void loadOlderMessages()}
                  disabled={loadingOlderMessages}
                  className="rounded-full border border-(--color-tc-20) bg-white px-3 py-1 text-xs font-medium text-(--color-tc-40) shadow-sm transition hover:bg-(--color-nc-10) disabled:opacity-60"
                >
                  {loadingOlderMessages ? "Loading…" : "Load earlier messages"}
                </button>
              </div>
            ) : null}
            {threadItems.map((item) =>
            item.kind === "date" ? (
              <div key={item.key} className="flex justify-center">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-(--color-tc-30) shadow-sm">
                  {item.label}
                </span>
              </div>
            ) : item.kind === "cadence_stop" ? (
              <CadenceStopThreadBanner key={item.key} activity={item.activity} />
            ) : item.kind === "payment" ? (
              <PaymentReceivedThreadBanner key={item.key} activity={item.activity} />
            ) : item.kind === "call" ? (
              <CallThreadBanner
                key={item.key}
                activity={item.activity}
                customerPhone={customerPhone}
              />
            ) : (
              <ThreadBubble
                key={item.key}
                message={item.message}
                customerName={customerName}
                onReply={(message) => openComposer(message)}
                onAddNote={onAddNote}
              />
            )
          )}
          </>
        )}
      </div>

      <div className="shrink-0 border-t border-(--color-tc-20) bg-white p-4">
        {composeCollapsed ? (
          <button
            type="button"
            onClick={() => openComposer()}
            className="flex w-full items-center justify-between rounded-2xl border border-(--color-tc-20) bg-white px-4 py-3 text-left text-sm text-(--color-tc-30) shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition hover:border-(--color-primary)/30 hover:bg-(--color-nc-10)/50"
          >
            <span>{composePlaceholder}</span>
            <ChevronDown className="size-4 shrink-0" aria-hidden />
          </button>
        ) : (
          <>
            {targetMessage ? (
              <div className="mb-3 flex items-start gap-2 rounded-xl border border-(--color-tc-20) bg-(--color-nc-10)/60 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-(--color-tc-30)">Replying to</p>
                  <p className="truncate text-xs text-(--color-tc-40)">
                    {messagePreviewSnippet(targetMessage)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearComposeTarget}
                  className="rounded-lg p-1 text-(--color-tc-30) hover:bg-white hover:text-(--color-tc-40)"
                  aria-label="Clear reply target"
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              </div>
            ) : null}

            {channel === "EMAIL" && !composeExpanded && (
              <div className="mb-3">
                <TextField
                  id="lead-message-subject"
                  label="Subject"
                  inline
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject"
                />
              </div>
            )}

            {showSmsNumberSelector && !composeExpanded && (
              <div className="mb-3">
                <SelectField
                  id="lead-message-sms-number"
                  label={smsNumbers.length > 1 ? "Send from" : "Sending from"}
                  value={selectedPhoneDocId ?? smsNumbers[0]?.phoneDocId ?? ""}
                  onChange={(e) => setSelectedPhoneDocId(e.target.value || null)}
                  disabled={smsNumbers.length <= 1}
                >
                  {smsNumbers.map((n) => (
                    <option key={n.phoneDocId} value={n.phoneDocId}>
                      {n.label} ({n.smsNumber ?? n.voiceNumber})
                    </option>
                  ))}
                </SelectField>
              </div>
            )}

            <div className={composeExpanded ? "hidden" : undefined}>
              <MessageRichCompose
                ref={composeRef}
                channel={channel}
                plainValue={plainBody}
                htmlValue={htmlBody}
                onPlainChange={setPlainBody}
                onHtmlChange={setHtmlBody}
                onSend={handleSend}
                sending={sending}
                enableImageAttachments
                onUploadImage={async (file) => (await api.uploadMessageMedia(file)).url}
                onAttachmentError={setError}
                trailingSlot={<ChannelSelector channel={channel} onChange={setChannel} />}
                placeholder={composePlaceholder}
                headerActions={composeWindowControls}
              />
            </div>
          </>
        )}

        {error && !composeCollapsed && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>

      <CrmModal
        isOpen={composeExpanded}
        title={`Message ${customerName}`}
        description="Compose with more space. Your draft is kept when you close this window."
        onClose={closeExpandedComposer}
        closeDisabled={sending}
        size="xl"
        fitScreen
        footer={
          <>
            <SecondaryButton
              type="button"
              size="small"
              className="w-auto"
              onClick={closeExpandedComposer}
              disabled={sending}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="button"
              className="w-auto"
              onClick={() => void handleSend()}
              disabled={sending}
            >
              {sending ? "Sending…" : "Send message"}
            </PrimaryButton>
          </>
        }
      >
        <div className="flex h-full min-h-0 flex-1 flex-col gap-4">
          {channel === "EMAIL" && (
            <TextField
              id="lead-message-subject-expanded"
              label="Subject"
              inline
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          )}
          {showSmsNumberSelector && (
            <SelectField
              id="lead-message-sms-number-expanded"
              label={smsNumbers.length > 1 ? "Send from" : "Sending from"}
              value={selectedPhoneDocId ?? smsNumbers[0]?.phoneDocId ?? ""}
              onChange={(e) => setSelectedPhoneDocId(e.target.value || null)}
              disabled={smsNumbers.length <= 1}
            >
              {smsNumbers.map((n) => (
                <option key={n.phoneDocId} value={n.phoneDocId}>
                  {n.label} ({n.smsNumber ?? n.voiceNumber})
                </option>
              ))}
            </SelectField>
          )}
          <MessageRichCompose
            ref={expandedComposeRef}
            channel={channel}
            plainValue={plainBody}
            htmlValue={htmlBody}
            onPlainChange={setPlainBody}
            onHtmlChange={setHtmlBody}
            sending={sending}
            showSendButton={false}
            enableImageAttachments
            onUploadImage={async (file) => (await api.uploadMessageMedia(file)).url}
            onAttachmentError={setError}
            trailingSlot={<ChannelSelector channel={channel} onChange={setChannel} />}
            placeholder={composePlaceholder}
            fillHeight
          />
          {error && <p className="shrink-0 text-xs text-red-600">{error}</p>}
        </div>
      </CrmModal>
    </>
  );

  if (!framed) {
    return <div className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", className)}>{threadBody}</div>;
  }

  return (
    <CurvedContainer
      className={cn(
        "flex min-h-[min(32rem,calc(100dvh-8rem))] max-h-[calc(100dvh-8rem)] flex-col overflow-hidden",
        className
      )}
      showBorderAndShadow
    >
      {threadBody}
    </CurvedContainer>
  );
}
