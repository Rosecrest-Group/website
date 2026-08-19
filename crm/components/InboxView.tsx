"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import {
  Copy,
  Mail,
  MailOpen,
  MessageSquare,
  Phone,
  Pin,
  PinOff,
  Search,
  User,
} from "lucide-react";
import { toast } from "sonner";
import LeadDetailPanel from "@/crm/components/LeadDetailPanel";
import LeadMessageThread from "@/crm/components/LeadMessageThread";
import ActionDropdown, { type DropdownAction } from "@/crm/components/ui/ActionDropdown";
import CrmModal from "@/crm/components/ui/CrmModal";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import PhoneButton from "@/crm/components/PhoneButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import { api } from "@/crm/lib/api";
import { formatInboxListTime, messageTimestamp } from "@/crm/lib/formatChatTime";
import { getCachedLead, prefetchLead } from "@/crm/lib/leadDetailCache";
import { isHtmlContent } from "@/crm/lib/messageFormatting";
import { useInfiniteScroll } from "@/crm/lib/useInfiniteScroll";
import { MESSAGE_FIRST_PAGE_SIZE } from "@/crm/lib/leadMessageCache";
import { prefetchLeadThreadWithActivities } from "@/crm/lib/loadLeadThread";
import { refreshInboxUnreadCount } from "@/crm/lib/useInboxUnreadCount";
import type { InboxThread, Message } from "@/crm/types";
import { cn } from "@/lib/utils";

const INBOX_THREAD_MESSAGES: Message[] = [];
const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 200;
const INBOX_PIN_LIMIT = 3;
const INBOX_LAYOUT = { type: "spring", stiffness: 380, damping: 34, mass: 0.75 } as const;

function apiErrorCode(err: unknown): string | undefined {
  if (err && typeof err === "object" && "code" in err && typeof err.code === "string") {
    return err.code;
  }
  return undefined;
}

function isAbortError(err: unknown): boolean {
  return err instanceof Error && err.name === "AbortError";
}

/** Keeps the list honest about new arrivals without a realtime channel for client messages. */
const REFRESH_MS = 20_000;
/**
 * Warmed on idle only. Hover/focus prefetch covers the rest, and every extra thread
 * fetched up front competes with the one the user actually clicks.
 */
const WARM_PREFETCH_COUNT = 3;

function messagePreview(body: string, channel: string): string {
  const text =
    channel === "EMAIL" && isHtmlContent(body)
      ? body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
      : body.trim();
  return text.length > 80 ? `${text.slice(0, 80)}…` : text;
}

function channelIcon(channel: string) {
  if (channel === "EMAIL") return Mail;
  if (channel === "WHATSAPP") return Phone;
  return MessageSquare;
}

function displayAddress(address?: string | null): string | null {
  const trimmed = address?.trim();
  if (!trimmed) return null;
  return trimmed.replace(/^whatsapp:/i, "");
}

function counterpartLabel(message: Message): string | null {
  const address = displayAddress(
    message.direction === "OUTBOUND" ? message.toAddress : message.fromAddress
  );
  if (!address) return null;
  return message.direction === "OUTBOUND" ? `To ${address}` : `From ${address}`;
}

/** Match thread bubble channel colors; stronger for outbound, softer for inbound. */
function channelBadgeClass(channel: string, direction?: string) {
  const outbound = direction === "OUTBOUND";
  if (channel === "WHATSAPP") {
    return outbound
      ? "bg-emerald-600 text-white"
      : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  }
  if (channel === "SMS") {
    return outbound
      ? "bg-orange-100 text-orange-800 ring-1 ring-orange-200"
      : "bg-orange-50/80 text-orange-600 ring-1 ring-orange-100";
  }
  if (channel === "EMAIL") {
    return outbound
      ? "bg-indigo-100 text-indigo-800 ring-1 ring-indigo-200"
      : "bg-indigo-50/80 text-indigo-600 ring-1 ring-indigo-100";
  }
  return "bg-(--color-nc-10) text-(--color-tc-30)";
}

function sortInboxThreads(threads: InboxThread[]): InboxThread[] {
  return [...threads].sort((a, b) => {
    if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
    const at = new Date(messageTimestamp(a.lastMessage)).getTime();
    const bt = new Date(messageTimestamp(b.lastMessage)).getTime();
    if (at !== bt) return bt - at;
    return (b.leadId ?? b.threadKey).localeCompare(a.leadId ?? a.threadKey);
  });
}

function threadMatchesQuery(thread: InboxThread, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const digits = q.replace(/\D/g, "");
  const preview = messagePreview(thread.lastMessage.body, thread.lastMessage.channel);
  const fields = [
    thread.customerName,
    thread.propertyPostcode,
    thread.customerEmail,
    thread.customerPhone,
    thread.lastMessage.subject,
    thread.lastMessage.fromAddress,
    thread.lastMessage.toAddress,
    preview,
  ];
  if (fields.some((value) => value?.toLowerCase().includes(q))) return true;
  if (digits.length >= 4) {
    const phoneDigits = thread.customerPhone?.replace(/\D/g, "") ?? "";
    if (phoneDigits.includes(digits)) return true;
  }
  return false;
}

function threadPanelTitle(thread: InboxThread): string {
  return `${thread.customerName}${thread.propertyPostcode ? ` · ${thread.propertyPostcode}` : ""}`;
}

async function copyText(value: string, success: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(success);
  } catch {
    toast.error("Couldn’t copy");
  }
}

function InboxThreadRow({
  thread,
  isSelected,
  onOpen,
  onPrefetch,
  onAction,
}: {
  thread: InboxThread;
  isSelected: boolean;
  onOpen: () => void;
  onPrefetch: () => void;
  onAction: (actionId: string) => void;
}) {
  const ChannelIcon = channelIcon(thread.lastMessage.channel);
  const isUnread = Boolean(thread.unread) && !isSelected;
  const unreadCount = thread.unreadCount ?? 0;
  const addressLabel = counterpartLabel(thread.lastMessage);
  const senderName =
    thread.lastMessage.direction === "OUTBOUND"
      ? thread.lastMessage.author?.fullName?.trim()
      : undefined;
  const phone = thread.customerPhone?.trim();
  const email = thread.customerEmail?.trim();

  const actions: DropdownAction[] = [
    {
      id: "toggle-read",
      label: thread.unread ? "Mark as read" : "Mark as unread",
      icon: thread.unread ? <MailOpen className="size-4" /> : <Mail className="size-4" />,
    },
    {
      id: "toggle-pin",
      label: thread.pinned ? "Unpin" : "Pin to top",
      icon: thread.pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />,
    },
    ...(phone
      ? [{ id: "copy-phone", label: "Copy phone", icon: <Copy className="size-4" /> }]
      : []),
    ...(email
      ? [{ id: "copy-email", label: "Copy email", icon: <Copy className="size-4" /> }]
      : []),
    ...(thread.leadId
      ? [{ id: "open-lead", label: "Open lead", icon: <User className="size-4" /> }]
      : []),
  ];

  return (
    <div
      className={cn(
        "relative w-full border-b border-(--color-tc-20) border-l-2 border-l-transparent transition hover:bg-(--color-nc-10)",
        isUnread && "border-l-brand bg-brand-muted/25",
        isSelected && "border-l-brand bg-brand-muted/70 hover:bg-brand-muted/70"
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        onMouseEnter={onPrefetch}
        onFocus={onPrefetch}
        className="w-full px-4 py-3 pr-10 text-left"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "flex items-center gap-1.5 truncate font-medium text-(--color-tc-40)",
                isUnread && "font-semibold"
              )}
            >
              {thread.pinned ? (
                <Pin className="size-3 shrink-0 fill-brand text-brand" aria-label="Pinned" />
              ) : null}
              <span className="truncate">{thread.customerName}</span>
            </p>
            {thread.propertyPostcode && (
              <p className="mt-0.5 truncate text-xs text-(--color-tc-30)">{thread.propertyPostcode}</p>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span
              className={cn(
                "text-[10px] text-(--color-tc-30)",
                isUnread && "font-semibold text-brand"
              )}
            >
              {formatInboxListTime(messageTimestamp(thread.lastMessage))}
            </span>
            {isUnread && unreadCount > 0 ? (
              <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-medium leading-none text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            ) : null}
          </div>
        </div>
        <p
          className={cn(
            "mt-1 truncate text-xs text-(--color-tc-30)",
            isUnread && "font-medium text-(--color-tc-40)"
          )}
        >
          {messagePreview(thread.lastMessage.body, thread.lastMessage.channel)}
        </p>
        <div className="mt-1.5 flex items-center gap-2 text-[10px] text-(--color-tc-30)">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-medium",
              channelBadgeClass(thread.lastMessage.channel, thread.lastMessage.direction)
            )}
          >
            <ChannelIcon className="size-3" aria-hidden />
            {thread.lastMessage.channel}
          </span>
          {addressLabel && (
            <span className="truncate text-(--color-tc-40)">{addressLabel}</span>
          )}
          {senderName && <span className="truncate">{senderName}</span>}
          <span>{thread.messageCount} msgs</span>
        </div>
      </button>
      <div className="absolute right-1.5 top-2.5">
        <ActionDropdown
          icon="vertical"
          size="sm"
          ariaLabel={`Actions for ${thread.customerName}`}
          actions={actions}
          onActionClick={onAction}
        />
      </div>
    </div>
  );
}

export default function InboxView({
  initialThreads = null,
  initialHasMore = false,
  initialCursor = null,
}: {
  initialThreads?: InboxThread[] | null;
  initialHasMore?: boolean;
  initialCursor?: string | null;
}) {
  const searchParams = useSearchParams();
  const deepLinkLeadId = searchParams.get("leadId");
  const [threads, setThreads] = useState<InboxThread[]>(() =>
    initialThreads ? sortInboxThreads(initialThreads) : []
  );
  const [selected, setSelected] = useState<InboxThread | null>(null);
  const [loading, setLoading] = useState(() => !initialThreads);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const [leadPanel, setLeadPanel] = useState<{ leadId: string; title: string } | null>(null);
  const [pinLimitThread, setPinLimitThread] = useState<InboxThread | null>(null);
  const [customerPhone, setCustomerPhone] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const skipInitialFetch = useRef(Boolean(initialThreads));
  const listRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);
  const handledDeepLinkRef = useRef<string | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);
  const threadsRef = useRef(threads);
  threadsRef.current = threads;
  const layoutTransition = reduceMotion ? { duration: 0 } : INBOX_LAYOUT;

  const loadThreads = useCallback(
    async (opts: { cursor: string | null; query: string; append: boolean }) => {
      if (!opts.append) {
        searchAbortRef.current?.abort();
        searchAbortRef.current = new AbortController();
      }
      const signal = opts.append ? undefined : searchAbortRef.current?.signal;
      const result = await api.getInbox(
        {
          cursor: opts.cursor,
          limit: PAGE_SIZE,
          query: opts.query || undefined,
        },
        signal ? { signal } : undefined
      );

      setThreads((prev) => {
        const next = opts.append
          ? (() => {
              const seen = new Set(prev.map((thread) => thread.threadKey));
              return [...prev, ...result.items.filter((thread) => !seen.has(thread.threadKey))];
            })()
          : result.items;
        return sortInboxThreads(next);
      });
      setCursor(result.nextCursor);
      setHasMore(result.hasMore);
      return result.items;
    },
    []
  );

  useEffect(() => {
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false;
      return;
    }

    let cancelled = false;
    setLoading(true);
    void loadThreads({ cursor: null, query: activeQuery, append: false })
      .catch((err) => {
        if (cancelled || isAbortError(err)) return;
        setThreads([]);
        setHasMore(false);
        setCursor(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      searchAbortRef.current?.abort();
    };
  }, [activeQuery, loadThreads]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setActiveQuery(searchQuery.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [searchQuery]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading || loadingMoreRef.current || !cursor) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    void loadThreads({ cursor, query: activeQuery, append: true })
      .catch(() => {
        // keep current list
      })
      .finally(() => {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      });
  }, [activeQuery, cursor, hasMore, loadThreads, loading]);

  useInfiniteScroll({
    rootRef: listRef,
    sentinelRef,
    enabled: hasMore && !loading,
    onLoadMore: loadMore,
  });

  useEffect(() => {
    setLeadPanel(null);
  }, [selected?.leadId]);

  // Page one holds the newest threads, so refetching it is enough to surface new arrivals
  // and reordering; anything already scrolled past keeps its place below.
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState !== "visible") return;
      if (loadingMoreRef.current) return;
      void api
        .getInbox({ limit: PAGE_SIZE, query: activeQuery || undefined })
        .then((result) => {
          setThreads((prev) => {
            const refreshedKeys = new Set(result.items.map((thread) => thread.threadKey));
            return sortInboxThreads([
              ...result.items,
              ...prev.filter((t) => !refreshedKeys.has(t.threadKey)),
            ]);
          });
        })
        .catch(() => {
          // keep current list
        });
    };
    const timer = window.setInterval(tick, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [activeQuery]);

  const patchThread = useCallback((leadId: string, patch: Partial<InboxThread>) => {
    setThreads((prev) =>
      sortInboxThreads(
        prev.map((thread) => (thread.leadId === leadId ? { ...thread, ...patch } : thread))
      )
    );
    setSelected((prev) =>
      prev?.leadId === leadId ? { ...prev, ...patch } : prev
    );
  }, []);

  const clearUnread = useCallback((leadId: string) => {
    patchThread(leadId, { unread: false, unreadCount: 0 });
  }, [patchThread]);

  function prefetchThread(leadId: string | null | undefined) {
    if (!leadId) return;
    void prefetchLeadThreadWithActivities(leadId, MESSAGE_FIRST_PAGE_SIZE);
  }

  function openThread(thread: InboxThread) {
    if (thread.leadId) prefetchThread(thread.leadId);
    setSelected(thread);
    setMobileShowThread(true);
  }

  function openLeadPanel(thread: InboxThread) {
    if (!thread.leadId) return;
    void prefetchLead(thread.leadId);
    setLeadPanel({ leadId: thread.leadId, title: threadPanelTitle(thread) });
  }

  async function handleThreadAction(thread: InboxThread, actionId: string) {
    const leadId = thread.leadId;
    if (!leadId) return;

    if (actionId === "open-lead") {
      openLeadPanel(thread);
      return;
    }

    if (actionId === "copy-phone") {
      const phone = thread.customerPhone?.trim();
      if (phone) void copyText(phone, "Phone copied");
      return;
    }

    if (actionId === "copy-email") {
      const email = thread.customerEmail?.trim();
      if (email) void copyText(email, "Email copied");
      return;
    }

    if (actionId === "toggle-read") {
      const markUnread = !thread.unread;
      patchThread(leadId, {
        unread: markUnread,
        unreadCount: markUnread ? Math.max(1, thread.unreadCount ?? 0) : 0,
      });
      try {
        if (markUnread) await api.markInboxThreadUnread(leadId);
        else await api.markInboxThreadRead(leadId);
        refreshInboxUnreadCount();
        toast.success(markUnread ? "Marked as unread" : "Marked as read");
      } catch {
        patchThread(leadId, { unread: thread.unread, unreadCount: thread.unreadCount ?? 0 });
        toast.error(markUnread ? "Couldn’t mark as unread" : "Couldn’t mark as read");
      }
      return;
    }

    if (actionId === "toggle-pin") {
      void setThreadPinned(thread, !thread.pinned);
    }
  }

  async function setThreadPinned(
    thread: InboxThread,
    pinned: boolean,
    opts?: { skipLimitCheck?: boolean }
  ): Promise<boolean> {
    const leadId = thread.leadId;
    if (!leadId) return false;

    if (pinned && !thread.pinned && !opts?.skipLimitCheck) {
      const pinnedCount = threadsRef.current.filter(
        (item) => item.pinned && item.leadId !== leadId
      ).length;
      if (pinnedCount >= INBOX_PIN_LIMIT) {
        setPinLimitThread(thread);
        return false;
      }
    }

    patchThread(leadId, { pinned });
    try {
      await api.pinInboxThread(leadId, pinned);
      toast.success(pinned ? "Pinned to top" : "Unpinned");
      return true;
    } catch (err) {
      patchThread(leadId, { pinned: Boolean(thread.pinned) });
      if (apiErrorCode(err) === "PIN_LIMIT") {
        setPinLimitThread(thread);
        return false;
      }
      toast.error(pinned ? "Couldn’t pin conversation" : "Couldn’t unpin conversation");
      return false;
    }
  }

  async function unpinToMakeRoom(pinnedThread: InboxThread) {
    const pending = pinLimitThread;
    if (!pending) return;
    const unpinned = await setThreadPinned(pinnedThread, false);
    if (!unpinned) return;
    setPinLimitThread(null);
    await setThreadPinned(pending, true, { skipLimitCheck: true });
  }

  useEffect(() => {
    const leadId = selected?.leadId;
    if (!leadId) {
      setCustomerPhone(null);
      return;
    }

    const cached = getCachedLead(leadId);
    if (cached?.customer?.phone) {
      setCustomerPhone(cached.customer.phone);
    } else {
      setCustomerPhone(null);
    }

    let cancelled = false;
    void prefetchLead(leadId).then((lead) => {
      if (!cancelled) setCustomerPhone(lead?.customer?.phone ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [selected?.leadId]);

  // Notification deep link. The thread is normally already on page one, but fall back to
  // fetching it directly so an older conversation still opens. Handled once per link so a
  // background refresh never yanks the user back to it.
  useEffect(() => {
    if (!deepLinkLeadId || handledDeepLinkRef.current === deepLinkLeadId) return;

    const known = threads.find((thread) => thread.leadId === deepLinkLeadId);
    if (known) {
      handledDeepLinkRef.current = deepLinkLeadId;
      openThread(known);
      return;
    }
    if (loading) return;
    handledDeepLinkRef.current = deepLinkLeadId;

    let cancelled = false;
    void api
      .getInbox({ leadId: deepLinkLeadId, limit: 1 })
      .then((result) => {
        const thread = result.items[0];
        if (cancelled || !thread) return;
        setThreads((prev) =>
          sortInboxThreads(
            prev.some((t) => t.threadKey === thread.threadKey) ? prev : [thread, ...prev]
          )
        );
        openThread(thread);
      })
      .catch(() => {
        // deep link points at a thread we can't resolve; leave the inbox as-is
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-runs when the link or list changes
  }, [deepLinkLeadId, threads, loading]);

  // Warm the top few threads so the common "click top of inbox" path is instant, but
  // only once the browser is idle so it never competes with the first paint.
  useEffect(() => {
    const leadIds = threads
      .map((thread) => thread.leadId)
      .filter((id): id is string => Boolean(id))
      .slice(0, WARM_PREFETCH_COUNT);
    if (leadIds.length === 0) return;

    const warm = () => {
      for (const leadId of leadIds) prefetchThread(leadId);
    };
    const idle = window.requestIdleCallback;
    if (idle) {
      const handle = idle(warm, { timeout: 2000 });
      return () => window.cancelIdleCallback?.(handle);
    }
    const handle = window.setTimeout(warm, 500);
    return () => window.clearTimeout(handle);
  }, [threads]);

  async function handleSent() {
    const items = await loadThreads({ cursor: null, query: activeQuery, append: false });
    if (selected) {
      const refreshed = items.find((thread) => thread.leadId === selected.leadId);
      if (refreshed) setSelected(refreshed);
    }
  }

  const typedQuery = searchQuery.trim();
  const searchPending = typedQuery !== activeQuery;
  const displayedThreads = useMemo(() => {
    if (typedQuery && searchPending) {
      return threads.filter((thread) => threadMatchesQuery(thread, typedQuery));
    }
    return threads;
  }, [searchPending, threads, typedQuery]);

  const showListLoading = displayedThreads.length === 0 && (loading || searchPending);

  const emptyMessage = useMemo(() => {
    if (showListLoading) return null;
    if (displayedThreads.length === 0 && typedQuery) return "No conversations match your search.";
    if (displayedThreads.length === 0) return "No client conversations yet.";
    return null;
  }, [displayedThreads.length, showListLoading, typedQuery]);

  const pinnedThreads = useMemo(() => threads.filter((thread) => thread.pinned), [threads]);

  return (
    <>
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <motion.div
        ref={listRef}
        layoutScroll
        className={cn(
          "min-h-0 w-80 max-w-full shrink-0 overflow-y-auto border-r border-(--color-tc-20) bg-white max-md:w-full",
          mobileShowThread && "max-md:hidden"
        )}
      >
        <div className="border-b border-(--color-tc-20) p-4">
          <h1 className="mb-3 text-lg font-semibold text-(--color-tc-40)">Inbox</h1>
          <div className="relative min-w-0">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-(--color-tc-30)"
              aria-hidden
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations…"
              aria-busy={searchPending || loading}
              className="h-9 w-full min-w-0 rounded-lg border border-(--color-tc-20) bg-(--color-nc-10) py-2 pl-9 pr-3 text-sm text-(--color-tc-40) outline-none placeholder:text-(--color-tc-30) focus:ring-2 focus:ring-(--color-primary)/20"
            />
          </div>
        </div>

        {showListLoading && (
          <div className="flex h-32 items-center justify-center">
            <LoadingSpinner />
          </div>
        )}

        {!showListLoading && emptyMessage ? (
          <div className="px-4 py-6 text-sm text-(--color-tc-30)">{emptyMessage}</div>
        ) : null}

        <LayoutGroup>
          {displayedThreads.map((thread) => (
            <motion.div key={thread.threadKey} layout="position" transition={layoutTransition}>
              <InboxThreadRow
                thread={thread}
                isSelected={selected?.threadKey === thread.threadKey}
                onOpen={() => openThread(thread)}
                onPrefetch={() => prefetchThread(thread.leadId)}
                onAction={(actionId) => void handleThreadAction(thread, actionId)}
              />
            </motion.div>
          ))}
        </LayoutGroup>

        {hasMore ? <div ref={sentinelRef} className="h-8" aria-hidden /> : null}
        {loadingMore ? (
          <div className="flex h-12 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : null}
      </motion.div>

      <div
        className={cn(
          "min-h-0 min-w-0 flex-1 flex-col bg-(--color-nc-10)",
          mobileShowThread ? "flex" : "max-md:hidden md:flex"
        )}
      >
        {selected?.leadId ? (
          <div className="flex min-h-0 flex-1 flex-col p-4 md:p-6">
            <div className="mb-3 md:hidden">
              <button
                type="button"
                onClick={() => setMobileShowThread(false)}
                className="text-sm font-medium text-(--color-primary)"
              >
                ← Back
              </button>
            </div>
            <LeadMessageThread
              key={selected.leadId}
              leadId={selected.leadId}
              customerName={selected.customerName}
              // No seed: the list's single preview message would paint one bubble and
              // then get replaced by the real thread. The prefetch cache fills this in.
              messages={INBOX_THREAD_MESSAGES}
              revalidateSeed
              onSent={handleSent}
              onRead={clearUnread}
              className="min-h-0 flex-1"
              headerActions={
                <div className="flex w-full items-center justify-between gap-3">
                  <SecondaryButton
                    type="button"
                    size="small"
                    className="w-auto"
                    onClick={() => openLeadPanel(selected)}
                  >
                    View lead
                  </SecondaryButton>
                  {customerPhone ? (
                    <PhoneButton
                      number={customerPhone}
                      iconOnly
                      context={{
                        leadId: selected.leadId,
                        customerName: selected.customerName,
                      }}
                    />
                  ) : null}
                </div>
              }
            />
          </div>
        ) : showListLoading ? (
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 items-center justify-center px-6 text-center text-sm text-(--color-tc-30)">
            Select a client conversation to view the full thread
          </div>
        )}
      </div>
    </div>

    <LeadDetailPanel
      leadId={leadPanel?.leadId ?? null}
      isOpen={Boolean(leadPanel)}
      onClose={() => setLeadPanel(null)}
      title={leadPanel?.title}
      onDeleted={() => {
        const deletedId = leadPanel?.leadId;
        setLeadPanel(null);
        if (selected?.leadId === deletedId) setSelected(null);
        void loadThreads({ cursor: null, query: activeQuery, append: false });
      }}
    />

    <CrmModal
      isOpen={Boolean(pinLimitThread)}
      title="Unpin one first"
      description={`You can pin up to ${INBOX_PIN_LIMIT} conversations. Unpin one to pin ${pinLimitThread?.customerName ?? "this one"}.`}
      onClose={() => setPinLimitThread(null)}
      size="sm"
      footer={
        <SecondaryButton type="button" className="w-auto" onClick={() => setPinLimitThread(null)}>
          Cancel
        </SecondaryButton>
      }
    >
      {pinnedThreads.length === 0 ? (
        <p className="text-sm text-ink-muted">Unpin one from the top of the inbox, then try again.</p>
      ) : (
        <ul className="divide-y divide-line">
          {pinnedThreads.map((thread) => (
            <li key={thread.threadKey} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-sm text-ink">{thread.customerName}</p>
                {thread.propertyPostcode ? (
                  <p className="truncate text-xs text-ink-muted">{thread.propertyPostcode}</p>
                ) : null}
              </div>
              <SecondaryButton
                type="button"
                size="small"
                className="w-auto shrink-0"
                onClick={() => void unpinToMakeRoom(thread)}
              >
                Unpin
              </SecondaryButton>
            </li>
          ))}
        </ul>
      )}
    </CrmModal>
    </>
  );
}
