"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Mail, MessageSquare, Phone, RefreshCw, Search } from "lucide-react";
import { api } from "@/crm/lib/api";
import {
  contactDisplayName,
  DataDumpStatusBanner,
  formatMessageType,
  scopeHint,
  useDataDumpConfigured,
} from "@/crm/components/data-dump/shared";
import { DumpMessageCard } from "@/crm/components/data-dump/DumpCards";
import DumpOpportunityPanel from "@/crm/components/data-dump/DumpOpportunityPanel";
import {
  extractOpportunityIdFromMessage,
  pickOpportunityForMessage,
} from "@/crm/components/data-dump/opportunityLink";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import { formatInboxListTime } from "@/crm/lib/formatChatTime";
import { scrollChatContainerToBottom } from "@/crm/lib/scrollChatThread";
import { useInfiniteScroll } from "@/crm/lib/useInfiniteScroll";
import type {
  DumpInboxSyncStatus,
  SalesIgniterConversation,
  SalesIgniterMessage,
  SalesIgniterOpportunity,
} from "@/crm/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

function messagePreview(body?: string): string {
  const text = (body ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > 80 ? `${text.slice(0, 80)}…` : text || "No preview";
}

function channelIcon(type?: string) {
  const normalized = (type ?? "").toUpperCase();
  if (normalized.includes("EMAIL")) return Mail;
  if (normalized.includes("CALL") || normalized.includes("PHONE")) return Phone;
  return MessageSquare;
}

function threadDisplayName(thread: SalesIgniterConversation) {
  return contactDisplayName(thread);
}

function threadTimestamp(thread: SalesIgniterConversation) {
  const raw = thread.lastMessageDate ?? thread.dateUpdated ?? thread.dateAdded;
  return raw ? formatInboxListTime(raw) : "";
}

function formatSyncTime(value?: string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleString("en-GB");
}

export default function DataDumpInboxView({
  enableSync = true,
}: {
  enableSync?: boolean;
} = {}) {
  const dumpConfigured = useDataDumpConfigured();
  const configured = enableSync ? dumpConfigured : true;
  const autoSyncStarted = useRef(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);

  const [threads, setThreads] = useState<SalesIgniterConversation[]>([]);
  const [syncStatus, setSyncStatus] = useState<DumpInboxSyncStatus | null>(null);
  const [selected, setSelected] = useState<SalesIgniterConversation | null>(null);
  const [messages, setMessages] = useState<SalesIgniterMessage[]>([]);
  const [messagesHasMore, setMessagesHasMore] = useState(false);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [threadLoading, setThreadLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<SalesIgniterOpportunity | null>(null);
  const [opportunityLoading, setOpportunityLoading] = useState(false);
  const [opportunityError, setOpportunityError] = useState<string | null>(null);

  const loadLocalThreads = useCallback(
    async (opts: { page: number; query: string; append: boolean }) => {
      const result = await api.listDumpInboxThreads({
        page: opts.page,
        limit: PAGE_SIZE,
        query: opts.query || undefined,
      });

      setThreads((prev) => {
        if (!opts.append) return result.threads;
        const seen = new Set(prev.map((thread) => thread.id));
        return [...prev, ...result.threads.filter((thread) => !seen.has(thread.id))];
      });
      if (result.sync) setSyncStatus(result.sync);
      setPage(result.page);
      setHasMore(result.hasMore);
      return result.threads;
    },
    []
  );

  const runSync = useCallback(
    async (options?: { reloadOnly?: boolean }) => {
      if (!configured) return;

      setSyncError(null);

      if (!options?.reloadOnly) {
        setSyncLoading(true);
        setSyncProgress("Checking for new conversations…");

        try {
          let startAfterDate: string | undefined;
          let isFirstChunk = true;
          let threadsChecked = 0;
          let threadsUpToDate = false;

          while (true) {
            const chunk = await api.syncDumpInboxThreads({
              startAfterDate,
              reset: isFirstChunk,
            });

            isFirstChunk = false;
            threadsChecked += chunk.checked;

            if (chunk.upToDate) {
              threadsUpToDate = true;
              setSyncProgress("Conversations up to date");
              break;
            }

            setSyncProgress(
              chunk.inserted > 0 || chunk.updated > 0
                ? `Syncing threads… ${threadsChecked.toLocaleString()} checked · ${chunk.inserted} new · ${chunk.updated} updated`
                : `Syncing threads… ${threadsChecked.toLocaleString()} checked (${chunk.dbTotal.toLocaleString()} in DB)`
            );

            if (chunk.done) break;
            if (!chunk.startAfterDate) break;
            startAfterDate = chunk.startAfterDate;
          }

          const status = await api.getDumpInboxSyncStatus();
          const messagesNeeded = !threadsUpToDate || status.pendingConversations > 0;

          if (!messagesNeeded) {
            setSyncProgress("Inbox up to date");
          } else {
            setSyncProgress("Checking message sync status…");

            let messagesChecked = 0;
            let isFirstMessageChunk = true;

            while (true) {
              const chunk = await api.syncDumpInboxMessages({ reset: isFirstMessageChunk });
              isFirstMessageChunk = false;

              if (chunk.upToDate) {
                setSyncProgress("Messages up to date");
                break;
              }

              messagesChecked += chunk.checked;

              setSyncProgress(
                chunk.pendingConversations > 0
                  ? `Syncing messages… ${chunk.dbTotal.toLocaleString()} in DB · ${chunk.pendingConversations.toLocaleString()} conversations remaining`
                  : `Syncing messages… ${messagesChecked.toLocaleString()} checked (${chunk.dbTotal.toLocaleString()} in DB)`
              );

              if (chunk.done) break;
            }
          }
        } catch (e) {
          setSyncError(e instanceof Error ? e.message : "Failed to sync inbox");
          throw e;
        } finally {
          setSyncLoading(false);
          setSyncProgress(null);
        }
      }

      await loadLocalThreads({ page: 1, query: activeQuery, append: false });
    },
    [activeQuery, configured, loadLocalThreads]
  );

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setListError(null);

    void loadLocalThreads({ page: 1, query: activeQuery, append: false })
      .catch((e) => {
        if (cancelled) return;
        setThreads([]);
        setSyncStatus(null);
        setHasMore(false);
        setListError(e instanceof Error ? e.message : "Failed to load inbox");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeQuery, configured, loadLocalThreads]);

  useEffect(() => {
    if (!configured || !enableSync) return;
    if (autoSyncStarted.current) return;
    autoSyncStarted.current = true;
    void runSync().catch(() => {
      // syncError is set inside runSync
    });
  }, [configured, enableSync, runSync]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setActiveQuery(searchQuery.trim());
    }, 300);
    return () => window.clearTimeout(handle);
  }, [searchQuery]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    void loadLocalThreads({ page: page + 1, query: activeQuery, append: true })
      .catch(() => {
        // keep current list
      })
      .finally(() => {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      });
  }, [activeQuery, hasMore, loadLocalThreads, loading, page]);

  useInfiniteScroll({
    rootRef: listRef,
    sentinelRef,
    enabled: configured && hasMore && !loading,
    onLoadMore: loadMore,
  });

  useLayoutEffect(() => {
    if (threadLoading || messages.length === 0) return;
    scrollChatContainerToBottom(messagesContainerRef.current, "instant");
  }, [selected?.id, messages, threadLoading]);

  const openThread = useCallback(async (thread: SalesIgniterConversation) => {
    setSelected(thread);
    setMobileShowThread(true);
    setMessages([]);
    setMessagesHasMore(false);
    setMessagesError(null);
    setThreadLoading(true);
    setSelectedOpportunity(null);
    setOpportunityError(null);

    try {
      const result = await api.listDumpConversationMessages(thread.id, { limit: 40 });
      setMessages(result.messages);
      setMessagesHasMore(result.hasMore);
    } catch (e) {
      setMessagesError(e instanceof Error ? e.message : "Failed to load messages");
    } finally {
      setThreadLoading(false);
    }
  }, []);

  const loadOlderMessages = useCallback(async () => {
    if (!selected || !messagesHasMore || loadingOlderMessages || messages.length === 0) return;
    const oldest = messages[0]?.dateAdded;
    if (!oldest) return;

    setLoadingOlderMessages(true);
    try {
      const result = await api.listDumpConversationMessages(selected.id, {
        limit: 40,
        before: oldest,
      });
      setMessages((prev) => {
        const seen = new Set(prev.map((message) => message.id));
        return [...result.messages.filter((message) => !seen.has(message.id)), ...prev];
      });
      setMessagesHasMore(result.hasMore);
    } catch (e) {
      setMessagesError(e instanceof Error ? e.message : "Failed to load older messages");
    } finally {
      setLoadingOlderMessages(false);
    }
  }, [loadingOlderMessages, messages, messagesHasMore, selected]);

  const openOpportunityFromMessage = useCallback(
    async (message: SalesIgniterMessage) => {
      setOpportunityLoading(true);
      setOpportunityError(null);
      setSelectedOpportunity(null);

      try {
        const result = await api.listDumpOpportunities();
        const directId = extractOpportunityIdFromMessage(message);

        if (directId) {
          const match = result.opportunities.find((opp) => opp.id === directId);
          if (match) {
            setSelectedOpportunity(match);
            return;
          }
          if (enableSync) {
            const remote = await api.getSalesIgniterOpportunity(directId);
            setSelectedOpportunity(remote.opportunity);
            return;
          }
          setOpportunityError("Opportunity not found in the local dump.");
          return;
        }

        const contactId = message.contactId ?? selected?.contactId;
        if (!contactId) {
          setOpportunityError("No opportunity link found on this activity.");
          return;
        }

        const contactOpps = result.opportunities.filter((opp) => opp.contactId === contactId);
        const match = pickOpportunityForMessage(contactOpps, message.dateAdded);
        if (!match) {
          setOpportunityError("No opportunity found for this contact.");
          return;
        }

        setSelectedOpportunity(match);
      } catch (e) {
        setOpportunityError(e instanceof Error ? e.message : "Failed to load opportunity");
      } finally {
        setOpportunityLoading(false);
      }
    },
    [enableSync, selected?.contactId]
  );

  const handleManualSync = useCallback(async () => {
    try {
      await runSync();
    } catch {
      // syncError is set inside runSync
    }
  }, [runSync]);

  if (!configured) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-8">
        {enableSync ? <DataDumpStatusBanner /> : null}
      </div>
    );
  }

  const showListLoading = loading && threads.length === 0;

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <div
        ref={listRef}
        className={cn(
          "min-h-0 w-80 max-w-full shrink-0 overflow-y-auto border-r border-(--color-tc-20) bg-white max-md:w-full",
          mobileShowThread && "max-md:hidden"
        )}
      >
        <div className="border-b border-(--color-tc-20) p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h1 className="text-lg font-semibold text-(--color-tc-40)">Inbox</h1>
            {enableSync ? (
              <PrimaryButton
                type="button"
                onClick={() => void handleManualSync()}
                disabled={syncLoading}
                className="!h-9 !min-w-0 !px-3 inline-flex items-center gap-1.5 text-sm"
              >
                <RefreshCw className={`size-3.5 ${syncLoading ? "animate-spin" : ""}`} aria-hidden />
                {syncLoading ? "…" : "Sync"}
              </PrimaryButton>
            ) : null}
          </div>
          {syncStatus ? (
            <p className="mb-3 text-[10px] leading-relaxed text-(--color-tc-30)">
              {syncStatus.threadTotal.toLocaleString()} threads ·{" "}
              {syncStatus.messageTotal.toLocaleString()} messages
              {enableSync && syncStatus.pendingConversations > 0
                ? ` · ${syncStatus.pendingConversations} pending`
                : ""}
              {enableSync ? (
                <>
                  <br />
                  Threads: {formatSyncTime(syncStatus.threads.lastSyncedAt)} · Messages:{" "}
                  {formatSyncTime(syncStatus.messages.lastSyncedAt)}
                </>
              ) : null}
            </p>
          ) : null}
          {enableSync && syncProgress ? (
            <p className="mb-3 text-xs text-(--color-tc-30)">{syncProgress}</p>
          ) : null}
          {enableSync && syncError ? (
            <p className="mb-3 text-xs text-red-700">{syncError}</p>
          ) : null}
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
          {listError ? (
            <p className="mt-3 text-xs text-red-700">
              {listError}
              {scopeHint(listError)}
            </p>
          ) : null}
        </div>

        {showListLoading && (
          <div className="flex h-32 items-center justify-center">
            <LoadingSpinner />
          </div>
        )}

        {!showListLoading && threads.length === 0 && (
          <div className="px-4 py-6 text-sm text-(--color-tc-30)">
            {activeQuery ? "No conversations match your search." : "No conversations found."}
          </div>
        )}

        {threads.map((thread) => {
          const ChannelIcon = channelIcon(thread.lastMessageType);
          const isSelected = selected?.id === thread.id;

          return (
            <button
              key={thread.id}
              type="button"
              onClick={() => void openThread(thread)}
              className={cn(
                "w-full border-b border-(--color-tc-20) border-l-2 border-l-transparent px-4 py-3 text-left transition hover:bg-(--color-nc-10)",
                isSelected && "border-l-brand bg-brand-muted/70 hover:bg-brand-muted/70"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-(--color-tc-40)">{threadDisplayName(thread)}</p>
                  {thread.email ? (
                    <p className="mt-0.5 truncate text-xs text-(--color-tc-30)">{thread.email}</p>
                  ) : null}
                </div>
                <span className="shrink-0 text-[10px] text-(--color-tc-30)">{threadTimestamp(thread)}</span>
              </div>
              <p className="mt-1 truncate text-xs text-(--color-tc-30)">
                {messagePreview(thread.lastMessageBody)}
              </p>
              <div className="mt-1.5 flex items-center gap-2 text-[10px] text-(--color-tc-30)">
                <span className="inline-flex items-center gap-1">
                  <ChannelIcon className="size-3" aria-hidden />
                  {formatMessageType({ type: thread.lastMessageType })}
                </span>
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
        {selected ? (
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

            <header className="mb-4 shrink-0 rounded-xl border border-(--color-tc-20) bg-white px-4 py-3">
              <h2 className="text-base font-semibold text-(--color-tc-40)">{threadDisplayName(selected)}</h2>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-(--color-tc-30)">
                {selected.email ? <span>{selected.email}</span> : null}
                {selected.phone ? <span>{selected.phone}</span> : null}
                {selected.contactId ? <span>Contact ID: {selected.contactId}</span> : null}
              </div>
            </header>

            {threadLoading ? (
              <div className="flex min-h-0 flex-1 items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : messagesError ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {messagesError}
                {scopeHint(messagesError)}
              </div>
            ) : messages.length > 0 ? (
              <div
                ref={messagesContainerRef}
                className="min-h-0 flex-1 space-y-4 overflow-y-auto"
              >
                {messagesHasMore ? (
                  <div className="flex justify-center py-1">
                    <button
                      type="button"
                      onClick={() => void loadOlderMessages()}
                      disabled={loadingOlderMessages}
                      className="rounded-full border border-(--color-tc-20) bg-white px-3 py-1 text-xs font-medium text-(--color-tc-40) transition hover:bg-(--color-nc-10) disabled:opacity-60"
                    >
                      {loadingOlderMessages ? "Loading…" : "Load earlier messages"}
                    </button>
                  </div>
                ) : null}
                {messages.map((message) => (
                  <DumpMessageCard
                    key={message.id}
                    message={message}
                    customerName={threadDisplayName(selected)}
                    onOpenOpportunity={(msg) => void openOpportunityFromMessage(msg)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-(--color-tc-30)">
                No messages in this conversation.
              </div>
            )}
          </div>
        ) : showListLoading ? (
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 items-center justify-center px-6 text-center text-sm text-(--color-tc-30)">
            Select a conversation to view the full thread
          </div>
        )}
      </div>

      <DumpOpportunityPanel
        opportunity={selectedOpportunity}
        loading={opportunityLoading}
        error={opportunityError}
        onClose={() => {
          setSelectedOpportunity(null);
          setOpportunityError(null);
          setOpportunityLoading(false);
        }}
      />
    </div>
  );
}
