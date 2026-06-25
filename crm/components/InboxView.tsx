"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Mail, MessageSquare, Phone, Search } from "lucide-react";
import { api } from "@/crm/lib/api";
import { formatChatTime } from "@/crm/lib/formatChatTime";
import { isHtmlContent } from "@/crm/lib/messageFormatting";
import type { InboxThread, Message } from "@/crm/types";

const INBOX_THREAD_MESSAGES: Message[] = [];
import LeadDetailPanel from "@/crm/components/LeadDetailPanel";
import LeadMessageThread from "@/crm/components/LeadMessageThread";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import { cn } from "@/lib/utils";

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

export default function InboxView() {
  const [threads, setThreads] = useState<InboxThread[]>([]);
  const [selected, setSelected] = useState<InboxThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const [leadPanelOpen, setLeadPanelOpen] = useState(false);

  const loadThreads = useCallback(async () => {
    const result = await api.getInbox();
    setThreads(result.items);
    return result.items;
  }, []);

  useEffect(() => {
    loadThreads().finally(() => setLoading(false));
  }, [loadThreads]);

  const filteredThreads = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return threads;
    return threads.filter((thread) => {
      const haystack = [
        thread.customerName,
        thread.propertyPostcode ?? "",
        thread.lastMessage.body,
        thread.lastMessage.subject ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [searchQuery, threads]);

  useEffect(() => {
    setLeadPanelOpen(false);
  }, [selected?.leadId]);

  function openThread(thread: InboxThread) {
    setSelected(thread);
    setMobileShowThread(true);
  }

  async function handleSent() {
    const items = await loadThreads();
    if (selected) {
      const refreshed = items.find((thread) => thread.leadId === selected.leadId);
      if (refreshed) setSelected(refreshed);
    }
  }

  const showListLoading = loading && threads.length === 0;
  const leadPanelTitle = selected
    ? `${selected.customerName}${selected.propertyPostcode ? ` · ${selected.propertyPostcode}` : ""}`
    : undefined;

  return (
    <>
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <div
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

        {!showListLoading && filteredThreads.length === 0 && (
          <div className="px-4 py-6 text-sm text-(--color-tc-30)">
            {threads.length === 0 ? "No client conversations yet." : "No conversations match your search."}
          </div>
        )}

        {filteredThreads.map((thread) => {
          const ChannelIcon = channelIcon(thread.lastMessage.channel);
          const isSelected = selected?.threadKey === thread.threadKey;

          return (
            <button
              key={thread.threadKey}
              type="button"
              onClick={() => openThread(thread)}
              className={cn(
                "w-full border-b border-(--color-tc-20) px-4 py-3 text-left transition hover:bg-(--color-nc-10)",
                isSelected && "bg-(--color-nc-10)"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-(--color-tc-40)">{thread.customerName}</p>
                  {thread.propertyPostcode && (
                    <p className="mt-0.5 truncate text-xs text-(--color-tc-30)">{thread.propertyPostcode}</p>
                  )}
                </div>
                <span className="shrink-0 text-[10px] text-(--color-tc-30)">
                  {formatChatTime(thread.lastMessage.createdAt)}
                </span>
              </div>
              <p className="mt-1 truncate text-xs text-(--color-tc-30)">
                {messagePreview(thread.lastMessage.body, thread.lastMessage.channel)}
              </p>
              <div className="mt-1.5 flex items-center gap-2 text-[10px] text-(--color-tc-30)">
                <span className="inline-flex items-center gap-1">
                  <ChannelIcon className="size-3" aria-hidden />
                  {thread.lastMessage.channel}
                </span>
                <span>{thread.messageCount} msgs</span>
              </div>
            </button>
          );
        })}
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
              messages={INBOX_THREAD_MESSAGES}
              onSent={handleSent}
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
        void loadThreads();
      }}
    />
    </>
  );
}
