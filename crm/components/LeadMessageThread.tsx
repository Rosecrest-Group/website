"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
  Reply,
  StickyNote,
  X,
} from "lucide-react";
import { api } from "@/crm/lib/api";
import type { Activity, InternalMessageItem, MentionSuggestion, Message } from "@/crm/types";
import { toast } from "sonner";
import CurvedContainer from "@/crm/components/ui/CurvedContainer";
import CrmModal from "@/crm/components/ui/CrmModal";
import CrmSlidePanel from "@/crm/components/ui/CrmSlidePanel";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import TextField from "@/crm/components/ui/TextField";
import ChannelSelector, { type MessageChannel } from "@/crm/components/ui/ChannelSelector";
import MessageRichCompose, {
  getEmailPayload,
  type MessageRichComposeHandle,
} from "@/crm/components/ui/MessageRichCompose";
import ChatComposeField from "@/crm/components/ui/ChatComposeField";
import {
  formatChatDateSeparator,
  formatChatTime,
  initialsFromName,
  messageTimestamp,
} from "@/crm/lib/formatChatTime";
import { linkifyText } from "@/crm/lib/formatMessageBody";
import {
  isDesignedEmailHtml,
  parseWhatsAppFormatting,
  prepareEmailHtmlForThread,
} from "@/crm/lib/messageFormatting";
import { scrollChatContainerToBottom } from "@/crm/lib/scrollChatThread";
import { parseTrailingMediaUrls } from "@/crm/lib/messageMediaAttachments";
import { cadenceStopTooltip } from "@/crm/lib/cadenceStopReason";
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
import { ensureRecordThread } from "@/crm/lib/recordThread";
import {
  getCachedConversationThread,
  setCachedConversationThread,
} from "@/crm/lib/conversationMessageCache";
import MessageThreadSkeleton from "@/crm/components/ui/MessageThreadSkeleton";
import { cn } from "@/lib/utils";

type Channel = MessageChannel;
type ComposeMode = "reply" | "note";

type ThreadEntry =
  | { kind: "message"; id: string; createdAt: string; message: Message }
  | { kind: "note"; id: string; createdAt: string; note: InternalMessageItem }
  | { kind: "call"; id: string; createdAt: string; activity: Activity }
  | { kind: "cadence_stop"; id: string; createdAt: string; activity: Activity }
  | { kind: "payment"; id: string; createdAt: string; activity: Activity };

const MENTION_REGEX = /@([a-zA-Z0-9._-]+)/g;

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

function messagePreviewSnippet(message: Message): string {
  if (message.subject?.trim()) return message.subject.trim();
  return message.body
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

function insertMentionToken(
  token: string,
  compose: string,
  setCompose: (v: string) => void,
  composeRef: React.RefObject<HTMLTextAreaElement | null>
) {
  const textarea = composeRef.current;
  if (!textarea) return;
  const cursor = textarea.selectionStart;
  const before = compose.slice(0, cursor).replace(/@([a-zA-Z0-9._-]*)$/, `@${token} `);
  setCompose(before + compose.slice(cursor));
  textarea.focus();
}

function buildOptimisticNote(params: {
  tempId: string;
  body: string;
  author: { id: string; fullName: string; email?: string };
  parentMessageId?: string | null;
  referencedMessage?: Message | null;
}): InternalMessageItem {
  const referenced = params.referencedMessage;
  return {
    id: params.tempId,
    body: params.body,
    createdAt: new Date().toISOString(),
    author: {
      id: params.author.id,
      fullName: params.author.fullName,
      email: params.author.email ?? "",
    },
    parentMessageId: params.parentMessageId ?? null,
    parentPreview: null,
    referencedMessageId: referenced?.id ?? null,
    referencedPreview: referenced
      ? {
          id: referenced.id,
          subject: referenced.subject ?? null,
          body: messagePreviewSnippet(referenced),
          channel: referenced.channel,
          direction: referenced.direction,
        }
      : null,
    mentions: [],
    reactions: [],
    attachments: [],
  };
}

const meCache: { current: { id: string; fullName: string; email: string } | null } = {
  current: null,
};

async function resolveCurrentUser() {
  if (meCache.current) return meCache.current;
  const me = await api.getMe();
  meCache.current = { id: me.id, fullName: me.fullName, email: me.email ?? "" };
  return meCache.current;
}

function renderNoteBody(
  body: string,
  mentions: InternalMessageItem["mentions"]
): ReactNode {
  const linkClass = "text-rose-800 underline underline-offset-2 hover:opacity-80";
  const labels = new Map<string, string>();
  for (const mention of mentions) {
    const alias = mention.alias?.toLowerCase();
    if (!alias) continue;
    labels.set(
      alias,
      mention.user?.fullName ??
        (mention.role ? mention.role.replace(/_/g, " ") : `@${alias}`)
    );
  }

  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  const re = new RegExp(MENTION_REGEX.source, "g");
  let match: RegExpExecArray | null;
  while ((match = re.exec(body)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(...linkifyText(body.slice(lastIndex, match.index), linkClass));
    }
    const alias = match[1].toLowerCase();
    const label = labels.get(alias);
    nodes.push(
      <span
        key={`${match.index}-${alias}`}
        className="rounded bg-rose-200/60 px-0.5 font-medium text-rose-950"
        title={label}
      >
        @{match[1]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < body.length) {
    nodes.push(...linkifyText(body.slice(lastIndex), linkClass));
  }
  return nodes.length > 0 ? nodes : linkifyText(body, linkClass);
}

/** ~2 lines of text-sm / leading-relaxed — preview height for long email bubbles. */
const EMAIL_COLLAPSED_MAX_PX = 52;

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

function formatCallDuration(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
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

function CallThreadBanner({ activity }: { activity: Activity }) {
  const meta = activity.metadata ?? {};
  const directionRaw = String(meta.direction ?? "outbound").toLowerCase();
  const isOutbound = directionRaw !== "inbound";
  const direction: "inbound" | "outbound" = isOutbound ? "outbound" : "inbound";
  const outcome = typeof meta.outcome === "string" ? meta.outcome.toLowerCase() : "";
  const isInitiated = activity.type.includes("initiated");
  const missed =
    outcome === "no_answer" ||
    outcome === "missed" ||
    outcome === "busy" ||
    outcome === "cancelled" ||
    outcome === "canceled";

  const durationSeconds =
    typeof meta.durationSeconds === "number"
      ? meta.durationSeconds
      : typeof meta.duration === "number"
        ? meta.duration
        : null;
  const duration =
    durationSeconds != null && durationSeconds > 0
      ? formatCallDuration(durationSeconds)
      : durationSeconds === 0 && !isInitiated
        ? "0:00"
        : null;

  const number = callNumberFromMeta(meta, direction);
  const recordingUrl = typeof meta.recordingUrl === "string" ? meta.recordingUrl : null;
  const transcript = typeof meta.transcript === "string" ? meta.transcript : null;
  const time = formatChatTime(activity.createdAt);

  const label = missed
    ? isOutbound
      ? "Missed outgoing call"
      : "Missed incoming call"
    : isInitiated
      ? isOutbound
        ? "Outgoing call…"
        : "Incoming call…"
      : isOutbound
        ? "Outgoing call"
        : "Incoming call";

  const Icon = missed ? PhoneMissed : isOutbound ? PhoneOutgoing : PhoneIncoming;

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
          <span className={cn("text-[11px] font-semibold tabular-nums", colors.muted)}>{duration}</span>
        ) : null}
        <span className={cn("text-[11px] font-medium", colors.muted)}>{time}</span>
      </div>

      {(recordingUrl || transcript) && (
        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px]">
          {recordingUrl ? (
            <a
              href={recordingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-(--color-primary) hover:underline"
            >
              Listen to recording
            </a>
          ) : null}
          {transcript ? (
            <details className="max-w-md">
              <summary className="cursor-pointer font-medium text-(--color-tc-30)">
                View transcript
              </summary>
              <p className="mt-1 whitespace-pre-wrap rounded-lg border border-(--color-tc-20) bg-white px-3 py-2 text-left text-xs leading-relaxed text-(--color-tc-40)">
                {transcript}
              </p>
            </details>
          ) : null}
        </div>
      )}
    </div>
  );
}

function NoteThreadBubble({
  note,
  replies = [],
  onComment,
}: {
  note: InternalMessageItem;
  replies?: InternalMessageItem[];
  onComment?: (note: InternalMessageItem) => void;
}) {
  const time = formatChatTime(note.createdAt);
  const refLabel = note.referencedPreview
    ? note.referencedPreview.subject?.trim() || note.referencedPreview.body
    : null;

  return (
    <div className="group flex justify-center py-1">
      <div className="w-full max-w-[min(100%,36rem)]">
        <div className="rounded-xl border border-rose-200/90 bg-rose-50/90 px-4 py-3 shadow-sm">
          <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-rose-900/70">
            <StickyNote className="size-3.5 shrink-0 text-rose-700" aria-hidden />
            <span className="font-semibold text-rose-950">Internal note</span>
            <span className="font-medium text-rose-900">{note.author.fullName}</span>
            <span>{time}</span>
          </div>
          {refLabel ? (
            <p className="mb-2 truncate rounded-lg border border-rose-200/80 bg-white/70 px-2.5 py-1 text-[11px] text-rose-900/80">
              On: {refLabel}
            </p>
          ) : null}
          <p className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed text-rose-950">
            {note.isDeleted ? (
              <span className="italic text-rose-900/60">[Note deleted]</span>
            ) : (
              renderNoteBody(note.body, note.mentions)
            )}
          </p>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-2">
          {onComment ? (
            <button
              type="button"
              onClick={() => onComment(note)}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-(--color-tc-30) opacity-0 transition group-hover:opacity-100 focus:opacity-100 hover:bg-white hover:text-(--color-tc-40)"
            >
              <MessageSquare className="size-3" aria-hidden />
              Comment
            </button>
          ) : null}
          {replies.length > 0 && onComment ? (
            <button
              type="button"
              onClick={() => onComment(note)}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium text-rose-800 transition hover:bg-rose-50"
            >
              <MessageSquare className="size-3" aria-hidden />
              {replies.length} {replies.length === 1 ? "comment" : "comments"}
            </button>
          ) : null}
        </div>
      </div>
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
  const designedEmail =
    message.channel === "EMAIL" && isDesignedEmailHtml(message.body);
  const addressLabel = counterpartAddressLabel(message, isOutbound);

  return (
    <div className={cn("group flex gap-2", isOutbound ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
          isOutbound ? "bg-(--color-primary) text-white" : "bg-(--color-nc-10) text-(--color-tc-40)"
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
  messages: initialMessages,
  threadActivities: initialThreadActivities = [],
  onSent,
  onRead,
  className,
  headerActions,
  /** When true, paint seed immediately but still fetch fresh messages (inbox preview). */
  revalidateSeed = false,
}: {
  leadId: string;
  customerName: string;
  messages: Message[];
  /** Calls + cadence-stop + payment system events, sorted into the chat by time */
  threadActivities?: Activity[];
  onSent?: () => void;
  /** Fired as the thread is marked read so the inbox can drop its unread styling. */
  onRead?: (leadId: string) => void;
  className?: string;
  headerActions?: ReactNode;
  revalidateSeed?: boolean;
}) {
  const cachedThread = getCachedLeadThread(leadId);
  const [messages, setMessages] = useState(() =>
    initialMessages.length > 0 ? initialMessages : cachedThread?.messages ?? []
  );
  const [notes, setNotes] = useState<InternalMessageItem[]>(() => cachedThread?.notes ?? []);
  const [conversationId, setConversationId] = useState<string | null>(
    () => cachedThread?.conversationId ?? null
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
      !cachedThread &&
      initialThreadActivities.length === 0
  );
  const [sending, setSending] = useState(false);
  const [composeMode, setComposeMode] = useState<ComposeMode>("reply");
  const [targetMessage, setTargetMessage] = useState<Message | null>(null);
  const [commentModalNote, setCommentModalNote] = useState<InternalMessageItem | null>(null);
  const [channel, setChannel] = useState<Channel>("EMAIL");
  const [subject, setSubject] = useState("");
  const [plainBody, setPlainBody] = useState("");
  const [htmlBody, setHtmlBody] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [commentDraft, setCommentDraft] = useState("");
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionSuggestions, setMentionSuggestions] = useState<MentionSuggestion | null>(null);
  const [error, setError] = useState("");
  const [commentError, setCommentError] = useState("");
  const [composeCollapsed, setComposeCollapsed] = useState(true);
  const [composeExpanded, setComposeExpanded] = useState(false);
  const { teamConnectEnabled, teamConnectNumbers, selectedPhoneDocId, setSelectedPhoneDocId, dialpadEnabled } =
    usePhone();
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasScrolledToBottomRef = useRef(false);
  const composeRef = useRef<MessageRichComposeHandle>(null);
  const expandedComposeRef = useRef<MessageRichComposeHandle>(null);
  const noteComposeRef = useRef<HTMLTextAreaElement>(null);
  const commentComposeRef = useRef<HTMLTextAreaElement>(null);
  const commentScrollRef = useRef<HTMLDivElement>(null);
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
    if (extras?.notes) setNotes(extras.notes);
    if (extras?.conversationId !== undefined) setConversationId(extras.conversationId);
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
    });
  }

  useEffect(() => {
    void resolveCurrentUser();
  }, []);

  useEffect(() => {
    // Ignore empty seed arrays — inbox passes `messages={[]}` which would otherwise
    // clear fetched messages whenever the parent re-renders after send.
    if (initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    if (initialThreadActivities.length > 0) {
      setThreadActivities(initialThreadActivities);
    }
  }, [initialThreadActivities]);

  useEffect(() => {
    let cancelled = false;
    const hasSeed = initialMessages.length > 0;
    const cached = getCachedLeadThread(leadId);
    const cacheIsFresh = cached ? Date.now() - cached.fetchedAt < CACHE_FRESH_MS : false;

    if (hasSeed) {
      setLoading(false);
    } else if (cached) {
      setMessages(cached.messages);
      setNotes(cached.notes);
      setConversationId(cached.conversationId);
      setMessagesPage(cached.page);
      setMessagesHasMore(cached.hasMore);
      setThreadActivities(cached.activities);
      setLoading(false);
    } else {
      setMessages([]);
      setNotes([]);
      setConversationId(null);
      setMessagesPage(1);
      setMessagesHasMore(false);
      setLoading(true);
    }

    if (hasSeed && !revalidateSeed) {
      // Authoritative seed from lead detail — keep existing cache warm.
      setCachedLeadThread(leadId, {
        messages: initialMessages,
        activities: initialThreadActivities,
        page: 1,
        hasMore: false,
      });
      // Still load notes so Internal comments appear in Messages/Inbox.
      void fetchLeadThreadPage(leadId, MESSAGE_FIRST_PAGE_SIZE)
        .then((result) => {
          if (cancelled) return;
          setNotes(result.notes);
          setConversationId(result.conversationId);
          setCachedLeadThread(leadId, {
            notes: result.notes,
            conversationId: result.conversationId,
          });
        })
        .catch(() => undefined);
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      try {
        if (!hasSeed && !cached) {
          // Nothing painted yet, so join the request the inbox already started on
          // hover/click rather than firing a duplicate.
          const thread = await prefetchLeadThreadWithActivities(leadId);
          if (cancelled) return;
          setMessages(thread.messages);
          setNotes(thread.notes);
          setConversationId(thread.conversationId);
          setMessagesPage(thread.page);
          setMessagesHasMore(thread.hasMore);
          setThreadActivities(thread.activities);
        } else if (!cacheIsFresh) {
          const take = Math.max(
            MESSAGE_FIRST_PAGE_SIZE,
            cached?.messages.length ?? 0,
            hasSeed ? initialMessages.length : 0
          );

          // Cache / seed is already painted, so this only replaces stale content.
          const result = await fetchLeadThreadPage(leadId, take);
          if (cancelled) return;
          applyMessagePage(result.pageResult, "replace", {
            notes: result.notes,
            conversationId: result.conversationId,
            activities: result.activities,
          });
        }
      } catch {
        // keep cache / seed / empty state
      } finally {
        if (!cancelled) setLoading(false);
      }

      if (!teamConnectEnabled || cancelled) return;

      // Defer TeamConnect sync so first paint isn't blocked.
      await new Promise((resolve) => window.setTimeout(resolve, 1500));
      if (cancelled) return;

      try {
        const sync = await api.syncLeadSmsFromTeamConnect(leadId);
        // Nothing new upstream, so the thread on screen is already current.
        if (cancelled || sync.synced === 0) return;
        const synced = await api.listMessages({
          leadId,
          limit: String(
            Math.max(MESSAGE_PAGE_SIZE, getCachedLeadThread(leadId)?.messages.length ?? 0)
          ),
          page: "1",
        });
        if (!cancelled) applyMessagePage(synced, "replace");
      } catch {
        // Sync is best-effort; UI already has DB messages.
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when lead / TeamConnect changes
  }, [leadId, teamConnectEnabled, revalidateSeed]);

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
    const itemCount = sortedMessages.length + notes.length + threadActivities.length;
    const behavior: ScrollBehavior =
      itemCount > 0 && hasScrolledToBottomRef.current ? "smooth" : "instant";
    if (itemCount > 0) hasScrolledToBottomRef.current = true;
    scrollChatContainerToBottom(scrollRef.current, behavior);
  }, [
    sortedMessages.length,
    notes.length,
    threadActivities.length,
    sortedMessages[sortedMessages.length - 1]?.id,
    notes[notes.length - 1]?.id,
  ]);

  useEffect(() => {
    if (composeMode !== "reply" || channel !== "EMAIL") return;
    setSubject((current) => current || suggestEmailSubject(sortedMessages, targetMessage));
  }, [channel, sortedMessages, composeMode, targetMessage]);

  useEffect(() => {
    if (!mentionQuery) {
      setMentionSuggestions(null);
      return;
    }
    const timer = setTimeout(() => {
      void api.getMentionSuggestions(mentionQuery).then(setMentionSuggestions);
    }, 200);
    return () => clearTimeout(timer);
  }, [mentionQuery]);

  const activeMentionToken = useMemo(() => {
    if (commentModalNote) {
      const cursor = commentComposeRef.current?.selectionStart ?? commentDraft.length;
      const match = commentDraft.slice(0, cursor).match(/@([a-zA-Z0-9._-]*)$/);
      return match ? match[1] : null;
    }
    const cursor = noteComposeRef.current?.selectionStart ?? noteDraft.length;
    const match = noteDraft.slice(0, cursor).match(/@([a-zA-Z0-9._-]*)$/);
    return match ? match[1] : null;
  }, [noteDraft, commentDraft, commentModalNote]);

  useEffect(() => {
    if (activeMentionToken !== null) setMentionQuery(activeMentionToken);
    else setMentionQuery("");
  }, [activeMentionToken]);

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

  function openComposer(mode: ComposeMode, message?: Message | null) {
    setComposeMode(mode);
    setTargetMessage(message ?? null);
    setComposeCollapsed(false);
    setError("");
    if (mode === "reply" && message) {
      const nextChannel = (message.channel as Channel) || "EMAIL";
      setChannel(nextChannel);
      if (nextChannel === "EMAIL") {
        setSubject(suggestEmailSubject(sortedMessages, message));
      }
    }
    if (mode === "note") {
      requestAnimationFrame(() => noteComposeRef.current?.focus());
    }
  }

  function openNoteComment(note: InternalMessageItem) {
    // Slack-style: all comments hang off the root note.
    const root =
      note.parentMessageId
        ? notes.find((n) => n.id === note.parentMessageId) ?? note
        : note;
    setCommentModalNote(root);
    setCommentDraft("");
    setCommentError("");
    requestAnimationFrame(() => {
      commentComposeRef.current?.focus();
      commentScrollRef.current?.scrollIntoView({ block: "end" });
    });
  }

  function closeCommentModal() {
    setCommentModalNote(null);
    setCommentDraft("");
    setCommentError("");
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
      const syncPromise = teamConnectEnabled
        ? api.syncLeadSmsFromTeamConnect(leadId).catch(() => undefined)
        : Promise.resolve(undefined);

      const take = Math.max(MESSAGE_PAGE_SIZE, messages.length, messagesPage * MESSAGE_PAGE_SIZE);
      const result = await fetchLeadThreadPage(leadId, take);
      applyMessagePage(result.pageResult, "replace", {
        notes: result.notes,
        conversationId: result.conversationId,
        activities: result.activities,
      });
      if (!silent) setLoading(false);

      if (teamConnectEnabled) {
        const sync = await syncPromise;
        if (sync?.synced) {
          const synced = await api.listMessages({ leadId, limit: String(take), page: "1" });
          applyMessagePage(synced, "replace");
        }
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
    composeMode === "note"
      ? "Add an internal note… Use @name to tag teammates"
      : channel === "EMAIL"
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
      {composeMode === "reply" ? (
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
      ) : null}
    </>
  );

  const smsNumbers = teamConnectNumbers.filter((n) => n.smsEnabled && n.status === "active");
  const showSmsNumberSelector =
    composeMode === "reply" && channel === "SMS" && teamConnectEnabled && smsNumbers.length > 0;

  async function handleSendNote() {
    const text = noteDraft.trim();
    if (!text || sending) return;

    const referenced = targetMessage;
    const tempId = `pending-${crypto.randomUUID()}`;
    const author = meCache.current ?? { id: "me", fullName: "You", email: "" };
    void resolveCurrentUser();

    const optimistic = buildOptimisticNote({
      tempId,
      body: text,
      author,
      referencedMessage: referenced,
    });
    setNotes((prev) => {
      const next = [...prev, optimistic];
      setCachedLeadThread(leadId, { notes: next });
      return next;
    });
    setError("");
    setNoteDraft("");
    clearComposeTarget();
    setSending(true);
    onSent?.();

    try {
      const thread =
        conversationId
          ? { id: conversationId }
          : await ensureRecordThread({ leadId });
      const created = await api.sendConversationMessage(thread.id, {
        body: text,
        referencedMessageId: referenced?.id,
      });
      setNotes((prev) => {
        const next = [...prev.filter((n) => n.id !== tempId && n.id !== created.id), created];
        setCachedLeadThread(leadId, { notes: next, conversationId: thread.id });
        const existingConv = getCachedConversationThread(thread.id)?.messages ?? [];
        setCachedConversationThread(thread.id, {
          messages: [
            ...existingConv.filter((n) => n.id !== tempId && n.id !== created.id),
            created,
          ],
        });
        return next;
      });
      setConversationId(thread.id);
    } catch (e) {
      setNotes((prev) => {
        const next = prev.filter((n) => n.id !== tempId);
        setCachedLeadThread(leadId, { notes: next });
        return next;
      });
      setNoteDraft(text);
      if (referenced) setTargetMessage(referenced);
      const message = e instanceof Error ? e.message : "Failed to post note";
      setError(message);
      toast.error(message);
    } finally {
      setSending(false);
    }
  }

  async function handleSendComment() {
    const text = commentDraft.trim();
    if (!text || !commentModalNote) return;

    const rootNote = commentModalNote;
    const tempId = `pending-${crypto.randomUUID()}`;
    const author = meCache.current ?? { id: "me", fullName: "You", email: "" };
    void resolveCurrentUser();

    const optimistic = buildOptimisticNote({
      tempId,
      body: text,
      author,
      parentMessageId: rootNote.id,
    });
    setNotes((prev) => {
      const next = [...prev, optimistic];
      setCachedLeadThread(leadId, { notes: next });
      if (conversationId) {
        const existingConv = getCachedConversationThread(conversationId)?.messages ?? [];
        setCachedConversationThread(conversationId, {
          messages: [...existingConv.filter((n) => n.id !== tempId), optimistic],
        });
      }
      return next;
    });
    setCommentError("");
    setCommentDraft("");
    onSent?.();
    requestAnimationFrame(() => {
      commentScrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      commentComposeRef.current?.focus();
    });

    try {
      const thread =
        conversationId
          ? { id: conversationId }
          : await ensureRecordThread({ leadId });
      const created = await api.sendConversationMessage(thread.id, {
        body: text,
        parentMessageId: rootNote.id,
      });
      setNotes((prev) => {
        const next = [...prev.filter((n) => n.id !== tempId && n.id !== created.id), created];
        setCachedLeadThread(leadId, { notes: next, conversationId: thread.id });
        const existingConv = getCachedConversationThread(thread.id)?.messages ?? [];
        setCachedConversationThread(thread.id, {
          messages: [
            ...existingConv.filter((n) => n.id !== tempId && n.id !== created.id),
            created,
          ],
        });
        return next;
      });
      setConversationId(thread.id);
    } catch (e) {
      setNotes((prev) => {
        const next = prev.filter((n) => n.id !== tempId);
        setCachedLeadThread(leadId, { notes: next });
        return next;
      });
      setCommentDraft(text);
      const message = e instanceof Error ? e.message : "Failed to post comment";
      setCommentError(message);
      toast.error(message);
      requestAnimationFrame(() => commentComposeRef.current?.focus());
    }
  }

  async function handleSend() {
    if (composeMode === "note") {
      await handleSendNote();
      return;
    }

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

  const noteRepliesByParent = useMemo(() => {
    const map = new Map<string, InternalMessageItem[]>();
    for (const note of notes) {
      if (note.isDeleted || !note.parentMessageId) continue;
      const list = map.get(note.parentMessageId) ?? [];
      list.push(note);
      map.set(note.parentMessageId, list);
    }
    for (const [, list] of map) {
      list.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }
    return map;
  }, [notes]);

  const sortedThreadEntries = useMemo(() => {
    const entries: ThreadEntry[] = [
      ...sortedMessages.map((message) => ({
        kind: "message" as const,
        id: message.id,
        createdAt: messageTimestamp(message),
        message,
      })),
      // Root notes only — comments nest under the parent like Slack.
      ...notes
        .filter((note) => !note.isDeleted && !note.parentMessageId)
        .map((note) => ({
          kind: "note" as const,
          id: note.id,
          createdAt: note.createdAt,
          note,
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
  }, [sortedMessages, notes, threadActivities]);

  const threadItems: Array<
    | { kind: "date"; key: string; label: string }
    | { kind: "message"; key: string; message: Message }
    | { kind: "note"; key: string; note: InternalMessageItem }
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
    } else if (entry.kind === "note") {
      threadItems.push({ kind: "note", key: entry.id, note: entry.note });
    } else if (entry.kind === "cadence_stop") {
      threadItems.push({ kind: "cadence_stop", key: entry.id, activity: entry.activity });
    } else if (entry.kind === "payment") {
      threadItems.push({ kind: "payment", key: entry.id, activity: entry.activity });
    } else {
      threadItems.push({ kind: "call", key: entry.id, activity: entry.activity });
    }
  }

  return (
    <CurvedContainer
      className={cn(
        "flex min-h-[min(32rem,calc(100dvh-8rem))] max-h-[calc(100dvh-8rem)] flex-col overflow-hidden",
        className
      )}
      showBorderAndShadow
    >
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
              Send a reply or add an internal note below. Replies, notes, and calls appear here together.
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
              <CallThreadBanner key={item.key} activity={item.activity} />
            ) : item.kind === "note" ? (
              <NoteThreadBubble
                key={item.key}
                note={item.note}
                replies={noteRepliesByParent.get(item.note.id) ?? []}
                onComment={openNoteComment}
              />
            ) : (
              <ThreadBubble
                key={item.key}
                message={item.message}
                customerName={customerName}
                onReply={(message) => openComposer("reply", message)}
                onAddNote={(message) => openComposer("note", message)}
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
            onClick={() => openComposer("reply")}
            className="flex w-full items-center justify-between rounded-2xl border border-(--color-tc-20) bg-white px-4 py-3 text-left text-sm text-(--color-tc-30) shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition hover:border-(--color-primary)/30 hover:bg-(--color-nc-10)/50"
          >
            <span>{composePlaceholder}</span>
            <ChevronDown className="size-4 shrink-0" aria-hidden />
          </button>
        ) : (
          <>
            <div className="mb-3 flex items-center gap-1 rounded-xl bg-(--color-nc-10) p-1">
              <button
                type="button"
                onClick={() => setComposeMode("reply")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition",
                  composeMode === "reply"
                    ? "bg-white text-(--color-tc-40) shadow-sm"
                    : "text-(--color-tc-30) hover:text-(--color-tc-40)"
                )}
              >
                <Reply className="size-3.5" aria-hidden />
                Reply
              </button>
              <button
                type="button"
                onClick={() => setComposeMode("note")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition",
                  composeMode === "note"
                    ? "bg-white text-rose-900 shadow-sm"
                    : "text-(--color-tc-30) hover:text-(--color-tc-40)"
                )}
              >
                <StickyNote className="size-3.5" aria-hidden />
                Internal note
              </button>
            </div>

            {targetMessage ? (
              <div className="mb-3 flex items-start gap-2 rounded-xl border border-(--color-tc-20) bg-(--color-nc-10)/60 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-(--color-tc-30)">
                    {composeMode === "note" ? "Note on" : "Replying to"}
                  </p>
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

            {composeMode === "reply" && channel === "EMAIL" && !composeExpanded && (
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

            {composeMode === "note" ? (
              <div className="relative">
                {mentionSuggestions && activeMentionToken !== null && (
                  <div className="absolute bottom-full left-0 z-20 mb-2 max-h-48 w-full overflow-y-auto rounded-xl border border-(--color-tc-20) bg-white py-1 shadow-lg">
                    {mentionSuggestions.users.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        className="block w-full px-3 py-2 text-left text-sm hover:bg-(--color-nc-10)"
                        onClick={() =>
                          insertMentionToken(u.mention, noteDraft, setNoteDraft, noteComposeRef)
                        }
                      >
                        @{u.mention} — {u.fullName}
                      </button>
                    ))}
                    {mentionSuggestions.groups.map((g) => (
                      <button
                        key={g.alias}
                        type="button"
                        className="block w-full px-3 py-2 text-left text-sm hover:bg-(--color-nc-10)"
                        onClick={() =>
                          insertMentionToken(g.alias, noteDraft, setNoteDraft, noteComposeRef)
                        }
                      >
                        @{g.alias}
                      </button>
                    ))}
                  </div>
                )}
                <div className="mb-2 flex items-center justify-end gap-1">{composeWindowControls}</div>
                <ChatComposeField
                  ref={noteComposeRef}
                  value={noteDraft}
                  onChange={setNoteDraft}
                  onSend={() => void handleSendNote()}
                  sending={sending}
                  placeholder={composePlaceholder}
                  onKeyDown={(event) => {
                    if (
                      event.key !== "Enter" ||
                      event.shiftKey ||
                      !mentionSuggestions ||
                      activeMentionToken === null
                    ) {
                      return;
                    }
                    const firstUser = mentionSuggestions.users[0];
                    const firstGroup = mentionSuggestions.groups[0];
                    if (!firstUser && !firstGroup) return;
                    event.preventDefault();
                    insertMentionToken(
                      firstUser?.mention ?? firstGroup!.alias,
                      noteDraft,
                      setNoteDraft,
                      noteComposeRef
                    );
                  }}
                />
              </div>
            ) : (
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
            )}
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

      <CrmSlidePanel
        isOpen={Boolean(commentModalNote)}
        title="Note comments"
        onClose={closeCommentModal}
        closeDisabled={sending}
        widthClassName="max-w-lg"
        footer={
          commentModalNote ? (
            <div className="w-full space-y-2">
              <div className="relative">
                {mentionSuggestions && activeMentionToken !== null && (
                  <div className="absolute bottom-full left-0 z-20 mb-2 max-h-48 w-full overflow-y-auto rounded-xl border border-(--color-tc-20) bg-white py-1 shadow-lg">
                    {mentionSuggestions.users.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        className="block w-full px-3 py-2 text-left text-sm hover:bg-(--color-nc-10)"
                        onClick={() =>
                          insertMentionToken(
                            u.mention,
                            commentDraft,
                            setCommentDraft,
                            commentComposeRef
                          )
                        }
                      >
                        @{u.mention} — {u.fullName}
                      </button>
                    ))}
                    {mentionSuggestions.groups.map((g) => (
                      <button
                        key={g.alias}
                        type="button"
                        className="block w-full px-3 py-2 text-left text-sm hover:bg-(--color-nc-10)"
                        onClick={() =>
                          insertMentionToken(
                            g.alias,
                            commentDraft,
                            setCommentDraft,
                            commentComposeRef
                          )
                        }
                      >
                        @{g.alias}
                      </button>
                    ))}
                  </div>
                )}
                <ChatComposeField
                  ref={commentComposeRef}
                  value={commentDraft}
                  onChange={setCommentDraft}
                  onSend={() => void handleSendComment()}
                  placeholder="Write a comment… Use @name to tag teammates"
                  onKeyDown={(event) => {
                    if (
                      event.key !== "Enter" ||
                      event.shiftKey ||
                      !mentionSuggestions ||
                      activeMentionToken === null
                    ) {
                      return;
                    }
                    const firstUser = mentionSuggestions.users[0];
                    const firstGroup = mentionSuggestions.groups[0];
                    if (!firstUser && !firstGroup) return;
                    event.preventDefault();
                    insertMentionToken(
                      firstUser?.mention ?? firstGroup!.alias,
                      commentDraft,
                      setCommentDraft,
                      commentComposeRef
                    );
                  }}
                />
              </div>
              {commentError ? <p className="text-xs text-red-600">{commentError}</p> : null}
              <div className="flex justify-end gap-2">
                <SecondaryButton
                  type="button"
                  size="small"
                  className="w-auto"
                  onClick={closeCommentModal}
                  disabled={sending}
                >
                  Close
                </SecondaryButton>
                <PrimaryButton
                  type="button"
                  className="w-auto"
                  onClick={() => void handleSendComment()}
                  disabled={!commentDraft.trim()}
                >
                  Post comment
                </PrimaryButton>
              </div>
            </div>
          ) : undefined
        }
      >
        {commentModalNote ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-rose-200/90 bg-rose-50 px-4 py-3">
              <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-rose-900/70">
                <StickyNote className="size-3.5 shrink-0 text-rose-700" aria-hidden />
                <span className="font-semibold text-rose-950">Internal note</span>
                <span className="font-medium text-rose-900">{commentModalNote.author.fullName}</span>
                <span>{formatChatTime(commentModalNote.createdAt)}</span>
              </div>
              {commentModalNote.referencedPreview ? (
                <p className="mb-2 truncate rounded-lg border border-rose-200/80 bg-white/70 px-2.5 py-1 text-[11px] text-rose-900/80">
                  On:{" "}
                  {commentModalNote.referencedPreview.subject?.trim() ||
                    commentModalNote.referencedPreview.body}
                </p>
              ) : null}
              <p className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed text-rose-950">
                {renderNoteBody(commentModalNote.body, commentModalNote.mentions)}
              </p>
            </div>

            {(noteRepliesByParent.get(commentModalNote.id) ?? []).length === 0 ? (
              <p className="ml-4 border-l-2 border-rose-100 pl-4 text-xs text-(--color-tc-30)">
                No comments yet. Be the first.
              </p>
            ) : (
              <div className="ml-4 space-y-2.5 border-l-2 border-rose-200 pl-4">
                <p className="text-[11px] font-medium text-rose-800/80">
                  {(noteRepliesByParent.get(commentModalNote.id) ?? []).length}{" "}
                  {(noteRepliesByParent.get(commentModalNote.id) ?? []).length === 1
                    ? "comment"
                    : "comments"}
                </p>
                {(noteRepliesByParent.get(commentModalNote.id) ?? []).map((reply) => (
                  <div
                    key={reply.id}
                    className={cn(
                      "rounded-lg border border-rose-100 bg-white px-3 py-2.5 shadow-sm",
                      reply.id.startsWith("pending-") && "opacity-70"
                    )}
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px] text-rose-900/65">
                      <span className="font-semibold text-rose-950">{reply.author.fullName}</span>
                      <span>{formatChatTime(reply.createdAt)}</span>
                    </div>
                    <p className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed text-rose-950">
                      {reply.isDeleted ? (
                        <span className="italic text-rose-900/60">[Comment deleted]</span>
                      ) : (
                        renderNoteBody(reply.body, reply.mentions)
                      )}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div ref={commentScrollRef} />
          </div>
        ) : null}
      </CrmSlidePanel>
    </CurvedContainer>
  );
}
