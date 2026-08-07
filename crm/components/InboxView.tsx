"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, MessageSquare, Phone, Search } from "lucide-react";
import LeadDetailPanel from "@/crm/components/LeadDetailPanel";
import LeadMessageThread from "@/crm/components/LeadMessageThread";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import { api } from "@/crm/lib/api";
import { formatInboxListTime, messageTimestamp } from "@/crm/lib/formatChatTime";
import { isHtmlContent } from "@/crm/lib/messageFormatting";
import { useInfiniteScroll } from "@/crm/lib/useInfiniteScroll";
import { MESSAGE_FIRST_PAGE_SIZE, prefetchLeadThread } from "@/crm/lib/leadMessageCache";
import type { InboxThread, Message } from "@/crm/types";
import { cn } from "@/lib/utils";

const INBOX_THREAD_MESSAGES: Message[] = [];
const PAGE_SIZE = 10;
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
  const [threads, setThreads] = useState<InboxThread[]>(() => initialThreads ?? []);
  const [selected, setSelected] = useState<InboxThread | null>(null);
  const [loading, setLoading] = useState(() => !initialThreads);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const [leadPanelOpen, setLeadPanelOpen] = useState(false);
  const skipInitialFetch = useRef(Boolean(initialThreads));
  const listRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);
  const handledDeepLinkRef = useRef<string | null>(null);

  const loadThreads = useCallback(
    async (opts: { cursor: string | null; query: string; append: boolean }) => {
      const result = await api.getInbox({
        cursor: opts.cursor,
        limit: PAGE_SIZE,
        query: opts.query || undefined,
      });

      setThreads((prev) => {
        if (!opts.append) return result.items;
        const seen = new Set(prev.map((thread) => thread.threadKey));
        return [...prev, ...result.items.filter((thread) => !seen.has(thread.threadKey))];
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
      .catch(() => {
        if (!cancelled) {
          setThreads([]);
          setHasMore(false);
          setCursor(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeQuery, loadThreads]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setActiveQuery(searchQuery.trim());
    }, 300);
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
    setLeadPanelOpen(false);
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
            return [...result.items, ...prev.filter((t) => !refreshedKeys.has(t.threadKey))];
          });
        })
        .catch(() => {
          // keep current list
        });
    };
    const timer = window.setInterval(tick, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [activeQuery]);

  const clearUnread = useCallback((leadId: string) => {
    setThreads((prev) =>
      prev.map((thread) =>
        thread.leadId === leadId ? { ...thread, unread: false, unreadCount: 0 } : thread
      )
    );
    setSelected((prev) =>
      prev?.leadId === leadId ? { ...prev, unread: false, unreadCount: 0 } : prev
    );
  }, []);

  function prefetchThread(leadId: string | null | undefined) {
    if (!leadId) return;
    void prefetchLeadThread(leadId, async () => {
      const page = await api.listMessages({
        leadId,
        limit: String(MESSAGE_FIRST_PAGE_SIZE),
        page: "1",
      });
      return {
        messages: page.items,
        page: page.page,
        hasMore: page.hasMore ?? page.page * page.limit < page.total,
      };
    });
  }

  function openThread(thread: InboxThread) {
    if (thread.leadId) prefetchThread(thread.leadId);
    setSelected(thread);
    setMobileShowThread(true);
  }

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
          prev.some((t) => t.threadKey === thread.threadKey) ? prev : [thread, ...prev]
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

  const showListLoading = loading && threads.length === 0;
  const leadPanelTitle = selected
    ? `${selected.customerName}${selected.propertyPostcode ? ` · ${selected.propertyPostcode}` : ""}`
    : undefined;

  const emptyMessage = useMemo(() => {
    if (threads.length === 0 && activeQuery) return "No conversations match your search.";
    if (threads.length === 0) return "No client conversations yet.";
    return null;
  }, [activeQuery, threads.length]);

  return (
    <>
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <div
        ref={listRef}
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

        {threads.map((thread) => {
          const ChannelIcon = channelIcon(thread.lastMessage.channel);
          const isSelected = selected?.threadKey === thread.threadKey;
          const isUnread = Boolean(thread.unread) && !isSelected;
          const unreadCount = thread.unreadCount ?? 0;

          return (
            <button
              key={thread.threadKey}
              type="button"
              onClick={() => openThread(thread)}
              onMouseEnter={() => prefetchThread(thread.leadId)}
              onFocus={() => prefetchThread(thread.leadId)}
              className={cn(
                "w-full border-b border-(--color-tc-20) border-l-2 border-l-transparent px-4 py-3 text-left transition hover:bg-(--color-nc-10)",
                isUnread && "border-l-brand bg-brand-muted/25",
                isSelected && "border-l-brand bg-brand-muted/70 hover:bg-brand-muted/70"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate font-medium text-(--color-tc-40)",
                      isUnread && "font-semibold"
                    )}
                  >
                    {thread.customerName}
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
                <span>{thread.messageCount} msgs</span>
              </div>
            </button>
          );
        })}

        {hasMore ? <div ref={sentinelRef} className="h-8" aria-hidden /> : null}
        {loadingMore ? (
          <div className="flex h-12 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : null}
      </div>

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
                <SecondaryButton
                  type="button"
                  size="small"
                  className="w-auto"
                  onClick={() => setLeadPanelOpen(true)}
                >
                  View lead
                </SecondaryButton>
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
      leadId={selected?.leadId ?? null}
      isOpen={leadPanelOpen}
      onClose={() => setLeadPanelOpen(false)}
      title={leadPanelTitle}
      onDeleted={() => {
        setLeadPanelOpen(false);
        setSelected(null);
        void loadThreads({ cursor: null, query: activeQuery, append: false });
      }}
    />
    </>
  );
}
