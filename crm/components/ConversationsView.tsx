"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { api } from "@/crm/lib/api";
import { registerPushNotifications } from "@/crm/lib/pushNotifications";
import {
  getCachedConversationList,
  setCachedConversationList,
  getCachedCurrentUser,
  setCachedCurrentUser,
} from "@/crm/lib/conversationListCache";
import type { InternalConversationSummary } from "@/crm/types";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import RecipientPicker, { type RecipientSelection } from "@/crm/components/ui/RecipientPicker";
import ConversationThread from "@/crm/components/ConversationThread";
import { prefetchConversationThread } from "@/crm/lib/prefetchConversationThread";
import { useCollaborationRealtime } from "@/crm/lib/useCollaborationRealtime";

export default function ConversationsView() {
  const searchParams = useSearchParams();
  const initialConversationId = searchParams.get("conversationId");
  const highlightMessageId = searchParams.get("messageId");

  const [threads, setThreads] = useState<InternalConversationSummary[]>(
    () => getCachedConversationList() ?? []
  );
  const [selected, setSelected] = useState<InternalConversationSummary | null>(null);
  const [loading, setLoading] = useState(() => getCachedConversationList() === null);
  const [showNew, setShowNew] = useState(false);
  const [newRecipients, setNewRecipients] = useState<RecipientSelection[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string; fullName: string } | null>(
    () => getCachedCurrentUser()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<InternalConversationSummary[] | null>(null);
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const prefetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const schedulePrefetch = useCallback((conversationId: string) => {
    if (prefetchTimerRef.current) clearTimeout(prefetchTimerRef.current);
    prefetchTimerRef.current = setTimeout(() => {
      prefetchConversationThread(conversationId);
      prefetchTimerRef.current = null;
    }, 120);
  }, []);

  const cancelPrefetch = useCallback(() => {
    if (prefetchTimerRef.current) {
      clearTimeout(prefetchTimerRef.current);
      prefetchTimerRef.current = null;
    }
  }, []);

  const loadThreads = useCallback(async () => {
    const r = await api.listConversations();
    setThreads(r.items);
    setCachedConversationList(r.items);
    return r.items;
  }, []);

  const openThread = useCallback((thread: InternalConversationSummary) => {
    setShowNew(false);
    setNewRecipients([]);
    setMobileShowThread(true);
    setSelected(thread);
    void api
      .getConversation(thread.id)
      .then((fresh) => {
        setSelected((current) => (current?.id === thread.id ? fresh : current));
      })
      .catch(() => {});
    void api.markConversationRead(thread.id).then(() => {
      setThreads((prev) => prev.map((t) => (t.id === thread.id ? { ...t, unread: false } : t)));
    });
  }, []);

  const openDirectChat = useCallback(
    async (userId: string) => {
      if (!currentUser || userId === currentUser.id) return;
      let existing = threads.find(
        (t) => t.kind === "DIRECT" && t.participants.some((p) => p.userId === userId)
      );
      if (!existing) {
        const items = await loadThreads();
        existing = items.find(
          (t) => t.kind === "DIRECT" && t.participants.some((p) => p.userId === userId)
        );
      }
      if (existing) {
        openThread(existing);
        return;
      }
      const conversation = await api.createConversation({ kind: "DIRECT", participantIds: [userId] });
      const items = await loadThreads();
      openThread(items.find((t) => t.id === conversation.id) ?? conversation);
    },
    [currentUser, threads, openThread, loadThreads]
  );

  useEffect(() => {
    let cancelled = false;
    const cachedThreads = getCachedConversationList();
    const cachedMe = getCachedCurrentUser();
    const hasCache = cachedThreads && cachedMe;
    (async () => {
      if (!hasCache) setLoading(true);
      try {
        const [items, me] = await Promise.all([loadThreads(), api.getMe()]);
        if (cancelled) return;
        const user = { id: me.id, fullName: me.fullName };
        setCurrentUser(user);
        setCachedCurrentUser(user);
        if (initialConversationId) {
          const match = items.find((t) => t.id === initialConversationId);
          if (match) openThread(match);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    void registerPushNotifications();
    return () => {
      cancelled = true;
    };
  }, [initialConversationId, loadThreads, openThread]);

  useCollaborationRealtime(
    useCallback(
      (event) => {
        if (event.type === "message.new" || event.type === "conversation.updated") {
          void loadThreads();
        }
      },
      [loadThreads]
    )
  );

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(() => {
      api.searchConversations(searchQuery.trim()).then((r) => {
        setSearchResults(r.conversations);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  async function startConversation(recipients: RecipientSelection[]) {
    if (recipients.length === 0) return;
    const payload =
      recipients[0].type === "broadcast"
        ? { kind: "BROADCAST" as const, title: "Everyone" }
        : recipients.length === 1
          ? { kind: "DIRECT" as const, participantIds: [recipients[0].id] }
          : {
              kind: "GROUP" as const,
              participantIds: recipients
                .filter((r): r is RecipientSelection & { type: "user" } => r.type === "user")
                .map((r) => r.id),
              title: recipients.map((r) => r.label).join(", "),
            };
    const conversation = await api.createConversation(payload);
    setShowNew(false);
    setNewRecipients([]);
    const items = await loadThreads();
    openThread(items.find((t) => t.id === conversation.id) ?? conversation);
  }

  const listItems = searchResults ?? threads;
  const showListLoading = loading && listItems.length === 0;

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      {/* Thread list — fixed 320px on desktop, full width on mobile */}
      <div
        className={`min-h-0 w-80 max-w-full shrink-0 overflow-y-auto border-r border-(--color-tc-20) bg-white max-md:w-full ${
          mobileShowThread ? "max-md:hidden" : ""
        }`}
      >
        <div className="border-b border-(--color-tc-20) p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h1 className="text-lg font-semibold text-(--color-tc-40)">Team Chat</h1>
            <SecondaryButton
              type="button"
              size="small"
              className="w-10 shrink-0 px-0"
              disabled={!currentUser}
              onClick={() => {
                if (!currentUser) return;
                setSelected(null);
                setShowNew(true);
                setMobileShowThread(false);
              }}
              aria-label="New conversation"
            >
              <Plus className="size-4" aria-hidden />
            </SecondaryButton>
          </div>
          <div className="relative min-w-0">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-(--color-tc-30)"
              aria-hidden
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats…"
              className="h-9 w-full min-w-0 rounded-lg border border-(--color-tc-20) bg-(--color-nc-10) py-2 pl-9 pr-3 text-sm text-(--color-tc-40) outline-none placeholder:text-(--color-tc-30) focus:ring-2 focus:ring-(--color-primary)/20"
            />
          </div>
        </div>
        {showListLoading && (
          <div className="flex h-32 items-center justify-center">
            <LoadingSpinner />
          </div>
        )}
        {!showListLoading && listItems.length === 0 && (
          <div className="px-4 py-6 text-sm text-(--color-tc-30)">No conversations yet.</div>
        )}
        {listItems.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => void openThread(t)}
            onMouseEnter={() => schedulePrefetch(t.id)}
            onMouseLeave={cancelPrefetch}
            onFocus={() => schedulePrefetch(t.id)}
            onBlur={cancelPrefetch}
            className={`w-full border-b border-(--color-tc-20) px-4 py-3 text-left transition hover:bg-(--color-nc-10) ${
              selected?.id === t.id ? "bg-(--color-nc-10)" : ""
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-(--color-tc-40)">{t.title}</p>
              {t.unread && <span className="size-2 rounded-full bg-(--color-primary)" />}
            </div>
            <p className="mt-1 truncate text-xs text-(--color-tc-30)">
              {t.lastMessage?.body.slice(0, 60) ?? "No messages yet"}
            </p>
          </button>
        ))}
      </div>

      {/* Thread panel */}
      <div
        className={`min-h-0 min-w-0 flex-1 flex-col bg-(--color-nc-10) ${
          mobileShowThread ? "flex" : "max-md:hidden md:flex"
        }`}
      >
        {showNew && !selected && currentUser && (
          <RecipientPicker
            selected={newRecipients}
            onChange={setNewRecipients}
            onConfirm={startConversation}
            onCancel={() => setShowNew(false)}
            excludeUserIds={[currentUser.id]}
            className="shrink-0"
          />
        )}
        {selected && currentUser ? (
          <ConversationThread
            conversation={selected}
            currentUser={currentUser}
            highlightMessageId={highlightMessageId}
            onConversationChange={setSelected}
            onOpenDirectChat={openDirectChat}
            onBack={() => setMobileShowThread(false)}
          />
        ) : selected || !currentUser ? (
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : showNew ? (
          <div className="flex min-h-0 flex-1 items-center justify-center px-6 text-center text-sm text-(--color-tc-30)">
            Search for a teammate, add several people for a group chat, or pick Everyone.
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 items-center justify-center text-(--color-tc-30)">
            Select or start a team conversation
          </div>
        )}
      </div>
    </div>
  );
}
