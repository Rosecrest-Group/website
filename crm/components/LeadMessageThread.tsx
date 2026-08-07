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
} from "lucide-react";
import { api } from "@/crm/lib/api";
import type { Activity, Message } from "@/crm/types";
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
import {
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
  prefetchLeadThread,
  setCachedLeadThread,
} from "@/crm/lib/leadMessageCache";
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

function suggestEmailSubject(messages: Message[]): string {
  const latest = [...messages]
    .reverse()
    .find((m) => m.channel === "EMAIL" && m.subject?.trim());
  if (!latest?.subject) return "";
  const subject = latest.subject.trim();
  return /^re:/i.test(subject) ? subject : `Re: ${subject}`;
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
    return (
      <div
        className={cn(
          "crm-email-body crm-email-body--thread text-sm leading-relaxed [&_a]:underline [&_img]:my-2 [&_img]:max-w-full [&_img]:rounded-xl",
          isOutbound ? "[&_a]:text-indigo-700" : "[&_a]:text-(--color-primary)"
        )}
        dangerouslySetInnerHTML={{ __html: prepareEmailHtmlForThread(body) }}
      />
    );
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

function CallThreadBubble({ activity, customerName }: { activity: Activity; customerName: string }) {
  const meta = activity.metadata ?? {};
  const direction = String(meta.direction ?? "outbound");
  const isOutbound = direction === "outbound";
  const authorName = isOutbound
    ? activity.author?.fullName ?? "Rosecrest"
    : customerName;
  const duration =
    typeof meta.durationSeconds === "number" && meta.durationSeconds > 0
      ? `${Math.floor(meta.durationSeconds / 60)}:${String(meta.durationSeconds % 60).padStart(2, "0")}`
      : null;
  const recordingUrl = typeof meta.recordingUrl === "string" ? meta.recordingUrl : null;
  const transcript = typeof meta.transcript === "string" ? meta.transcript : null;
  const statusLabel = activity.type.includes("completed") ? "Completed" : "In progress";

  return (
    <div className={cn("flex gap-2", isOutbound ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
          isOutbound ? "bg-orange-100 text-orange-700" : "bg-(--color-nc-10) text-(--color-tc-40)"
        )}
        aria-hidden
      >
        <Phone className="size-4" />
      </div>

      <div className={cn("flex min-w-0 max-w-[min(100%,36rem)] flex-col", isOutbound ? "items-end" : "items-start")}>
        <div
          className={cn(
            "mb-1 flex flex-wrap items-center gap-2 text-xs text-(--color-tc-30)",
            isOutbound && "justify-end"
          )}
        >
          <span className="font-medium text-(--color-tc-40)">{authorName}</span>
          <span className="inline-flex items-center gap-1">
            <Phone className="size-3" aria-hidden />
            {isOutbound ? "Outbound call" : "Inbound call"}
            {duration && <span>· {duration}</span>}
          </span>
          <span>{formatChatTime(activity.createdAt)}</span>
          <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-medium text-orange-700">
            {statusLabel}
          </span>
        </div>

        <CurvedContainer
          variant={isOutbound ? "white" : "white"}
          className="border border-orange-100 bg-orange-50/40 px-4 py-3 text-(--color-tc-40)"
          showBorderAndShadow
        >
          <p className="text-sm">{activity.description}</p>
          {recordingUrl && (
            <a
              href={recordingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex text-xs font-medium text-(--color-primary) hover:underline"
            >
              Listen to recording
            </a>
          )}
          {transcript && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs font-medium text-(--color-tc-30)">
                View transcript
              </summary>
              <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-(--color-tc-40)">
                {transcript}
              </p>
            </details>
          )}
        </CurvedContainer>
      </div>
    </div>
  );
}

function ThreadBubble({
  message,
  customerName,
}: {
  message: Message;
  customerName: string;
}) {
  const isOutbound = message.direction === "OUTBOUND";
  const authorName = isOutbound ? "Rosecrest" : customerName;
  const ChannelIcon =
    message.channel === "EMAIL" ? Mail : message.channel === "WHATSAPP" ? Phone : MessageSquare;

  return (
    <div className={cn("flex gap-2", isOutbound ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
          isOutbound ? "bg-(--color-primary) text-white" : "bg-(--color-nc-10) text-(--color-tc-40)"
        )}
        aria-hidden
      >
        {initialsFromName(authorName)}
      </div>

      <div className={cn("flex min-w-0 max-w-[min(100%,36rem)] flex-col", isOutbound ? "items-end" : "items-start")}>
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
            {message.channel === "SMS" && isOutbound && message.fromAddress && (
              <span className="text-[10px] text-(--color-tc-20)">from {message.fromAddress}</span>
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
          variant={isOutbound ? "primary" : "white"}
          className={cn(
            "px-4 py-3",
            message.channel === "WHATSAPP" &&
              (isOutbound ? "bg-emerald-600" : "border-emerald-200 bg-emerald-50/70"),
            message.channel === "SMS" &&
              (isOutbound
                ? "border border-orange-200 bg-orange-100 text-orange-950 [&_a]:text-orange-800"
                : "border-orange-100 bg-orange-50/80"),
            message.channel === "EMAIL" &&
              (isOutbound
                ? "border border-indigo-200 bg-indigo-100 text-indigo-950 [&_a]:text-indigo-700"
                : "border-indigo-100 bg-indigo-50/80"),
            isOutbound && message.channel !== "SMS" && message.channel !== "EMAIL" && "text-white [&_a]:text-white",
            !isOutbound && "text-(--color-tc-40)"
          )}
          showBorderAndShadow={!isOutbound}
        >
          {message.channel === "EMAIL" && message.subject && (
            <p
              className={cn(
                "mb-2 border-b pb-2 text-sm font-semibold",
                isOutbound ? "border-indigo-200/80" : "border-(--color-tc-20)"
              )}
            >
              {message.subject}
            </p>
          )}
          <MessageBody body={message.body} channel={message.channel} isOutbound={isOutbound} />
        </CurvedContainer>
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
  /** Calls + cadence-stop system events, sorted into the chat by time */
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
  const [messagesPage, setMessagesPage] = useState(() =>
    initialMessages.length > 0 ? 1 : cachedThread?.page ?? 1
  );
  const [messagesHasMore, setMessagesHasMore] = useState(() =>
    initialMessages.length > 0 ? false : cachedThread?.hasMore ?? false
  );
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [threadActivities, setThreadActivities] = useState(() =>
    initialThreadActivities.length > 0
      ? initialThreadActivities
      : cachedThread?.activities ?? []
  );
  const [loading, setLoading] = useState(
    () =>
      initialMessages.length === 0 &&
      !cachedThread &&
      initialThreadActivities.length === 0
  );
  const [sending, setSending] = useState(false);
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
    mode: "replace" | "append"
  ) {
    const hasMore = result.hasMore ?? result.page * result.limit < result.total;
    setMessages((prev) => {
      if (mode === "replace") return result.items;
      const seen = new Set(prev.map((message) => message.id));
      return [...prev, ...result.items.filter((message) => !seen.has(message.id))];
    });
    setMessagesPage(result.page);
    setMessagesHasMore(hasMore);

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
      page: result.page,
      hasMore,
      activities: cached?.activities,
    });
  }

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
      setMessagesPage(cached.page);
      setMessagesHasMore(cached.hasMore);
      setThreadActivities(cached.activities);
      setLoading(false);
    } else {
      setMessages([]);
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
      return;
    }

    (async () => {
      try {
        if (!hasSeed && !cached) {
          // Nothing painted yet, so join the request the inbox already started on
          // hover/click rather than firing a duplicate.
          const thread = await prefetchLeadThread(leadId, async () => {
            const result = await api.listMessages({
              leadId,
              limit: String(MESSAGE_FIRST_PAGE_SIZE),
              page: "1",
            });
            return {
              messages: result.items,
              page: result.page,
              hasMore: result.hasMore ?? result.page * result.limit < result.total,
            };
          });
          if (cancelled) return;
          setMessages(thread.messages);
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
          const result = await api.listMessages({
            leadId,
            limit: String(take),
            page: "1",
          });
          if (cancelled) return;
          applyMessagePage(result, "replace");
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
    const behavior: ScrollBehavior =
      sortedMessages.length > 0 && hasScrolledToBottomRef.current ? "smooth" : "instant";
    if (sortedMessages.length > 0) hasScrolledToBottomRef.current = true;
    scrollChatContainerToBottom(scrollRef.current, behavior);
  }, [sortedMessages.length, sortedMessages[sortedMessages.length - 1]?.id]);

  useEffect(() => {
    if (channel !== "EMAIL") return;
    setSubject((current) => current || suggestEmailSubject(sortedMessages));
  }, [channel, sortedMessages]);

  useEffect(() => {
    if (!composeExpanded) return;
    const urls = composeRef.current?.getMediaUrls() ?? [];
    if (urls.length === 0) return;
    requestAnimationFrame(() => {
      expandedComposeRef.current?.setMediaUrls(urls);
      composeRef.current?.clearMedia();
    });
  }, [composeExpanded]);

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
      const [result, lead] = await Promise.all([
        api.listMessages({ leadId, limit: String(take), page: "1" }),
        api.getLead(leadId).catch(() => null),
      ]);
      applyMessagePage(result, "replace");
      if (lead) {
        const activities = lead.activities.filter(
          (a) =>
            a.type.includes("call") ||
            a.type === "cadence.stopped" ||
            a.type === "payment.received"
        );
        setThreadActivities(activities);
        setCachedLeadThread(leadId, { activities });
      }
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
  const showSmsNumberSelector = channel === "SMS" && teamConnectEnabled && smsNumbers.length > 0;

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
        isTransactional: true,
        teamConnectPhoneDocId:
          channel === "SMS" && teamConnectEnabled
            ? selectedPhoneDocId ?? smsNumbers[0]?.phoneDocId
            : undefined,
      });
      setPlainBody("");
      setHtmlBody("");
      composeRef.current?.clearMedia();
      expandedComposeRef.current?.clearMedia();
      if (channel === "EMAIL") {
        setSubject(suggestEmailSubject(sortedMessages));
      }
      await refreshMessages();
      onSent?.();
      setComposeExpanded(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send message");
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

  return (
    <CurvedContainer
      className={cn(
        "flex min-h-[min(32rem,calc(100dvh-8rem))] max-h-[calc(100dvh-8rem)] flex-col overflow-hidden",
        className
      )}
      showBorderAndShadow
    >
      {headerActions ? (
        <div className="flex shrink-0 items-center justify-end border-b border-(--color-tc-20) px-4 py-2">
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
              Send the first message below. Replies and calls will appear here in full.
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
              <CallThreadBubble key={item.key} activity={item.activity} customerName={customerName} />
            ) : (
              <ThreadBubble key={item.key} message={item.message} customerName={customerName} />
            )
          )}
          </>
        )}
      </div>

      <div className="shrink-0 border-t border-(--color-tc-20) bg-white p-4">
        {composeCollapsed ? (
          <button
            type="button"
            onClick={() => setComposeCollapsed(false)}
            className="flex w-full items-center justify-between rounded-2xl border border-(--color-tc-20) bg-white px-4 py-3 text-left text-sm text-(--color-tc-30) shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition hover:border-(--color-primary)/30 hover:bg-(--color-nc-10)/50"
          >
            <span>{composePlaceholder}</span>
            <ChevronDown className="size-4 shrink-0" aria-hidden />
          </button>
        ) : (
          <>
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
    </CurvedContainer>
  );
}
