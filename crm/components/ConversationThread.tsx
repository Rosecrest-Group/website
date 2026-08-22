"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BellOff,
  ExternalLink,
  Loader2,
  Pin,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/crm/lib/api";
import { CRM_BASE_PATH, USER_ROLE_OPTIONS } from "@/crm/lib/constants";
import {
  getCachedConversationThread,
  setCachedConversationThread,
} from "@/crm/lib/conversationMessageCache";
import {
  fetchLatestConversationMessages,
  fetchOlderConversationMessages,
} from "@/crm/lib/conversationMessages";
import { scrollChatContainerToBottom } from "@/crm/lib/scrollChatThread";
import { useChatDraft } from "@/crm/lib/useChatDraft";
import { useCollaborationRealtime } from "@/crm/lib/useCollaborationRealtime";
import type {
  InternalConversationSummary,
  InternalMessageItem,
  MentionSuggestion,
  MessageReaction,
  ReadReceiptDetail,
} from "@/crm/types";
import ChatBubble from "@/crm/components/ui/ChatBubble";
import ChatComposeField, {
  type PendingComposeAttachment,
} from "@/crm/components/ui/ChatComposeField";
import {
  MAX_CHAT_ATTACHMENTS,
  validateChatAttachmentFile,
} from "@/crm/lib/chatAttachments";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import { getReadReceipt } from "@/crm/lib/chatReceipts";
import { conversationDisplayTitle } from "@/crm/lib/conversationTitle";
import {
  formatChatDateSeparator,
  shouldGroupMessages,
} from "@/crm/lib/formatChatTime";

type LocalPendingAttachment = PendingComposeAttachment & { file: File };

function buildOptimisticMessage(
  tempId: string,
  text: string,
  currentUser: { id: string; fullName: string },
  options: {
    isUrgent: boolean;
    replyTo: InternalMessageItem | null;
    attachments: LocalPendingAttachment[];
  }
): InternalMessageItem {
  return {
    id: tempId,
    body: text,
    createdAt: new Date().toISOString(),
    isUrgent: options.isUrgent,
    author: { id: currentUser.id, fullName: currentUser.fullName, email: "" },
    parentMessageId: options.replyTo?.id ?? null,
    parentPreview: options.replyTo
      ? {
          id: options.replyTo.id,
          authorName: options.replyTo.author.fullName,
          body: options.replyTo.body,
        }
      : null,
    mentions: [],
    reactions: [],
    attachments: options.attachments.map((attachment) => ({
      id: attachment.id,
      filename: attachment.filename,
      mimeType: attachment.mimeType,
      sizeBytes: attachment.sizeBytes,
      url: attachment.previewUrl ?? "",
      isImage: attachment.mimeType.startsWith("image/"),
    })),
  };
}

function isPendingMessageId(id: string) {
  return id.startsWith("pending-");
}

function optimisticToggleReaction(
  reactions: MessageReaction[],
  emoji: string,
  user: { id: string; fullName: string }
): MessageReaction[] {
  const existing = reactions.find((r) => r.emoji === emoji);
  if (existing?.reactedByMe) {
    const nextCount = existing.count - 1;
    if (nextCount <= 0) return reactions.filter((r) => r.emoji !== emoji);
    return reactions.map((r) =>
      r.emoji === emoji
        ? { ...r, count: nextCount, reactedByMe: false, users: r.users.filter((u) => u.id !== user.id) }
        : r
    );
  }
  if (existing) {
    return reactions.map((r) =>
      r.emoji === emoji
        ? { ...r, count: r.count + 1, reactedByMe: true, users: [...r.users, user] }
        : r
    );
  }
  return [...reactions, { emoji, count: 1, reactedByMe: true, users: [user] }];
}

function conversationHeaderSubtitle(
  conversation: InternalConversationSummary,
  currentUserId: string
): string | null {
  if (conversation.kind === "DIRECT") {
    const other = conversation.participants.find((p) => p.userId !== currentUserId)?.user;
    if (!other) return null;
    return USER_ROLE_OPTIONS.find((o) => o.value === other.role)?.label ?? other.role;
  }

  const count = conversation.participants.length;
  return `${count} member${count === 1 ? "" : "s"}`;
}

export default function ConversationThread({
  conversation,
  currentUser,
  onConversationChange,
  onOpenDirectChat,
  onBack,
  embedded = false,
  highlightMessageId,
}: {
  conversation: InternalConversationSummary;
  currentUser: { id: string; fullName: string };
  onConversationChange?: (c: InternalConversationSummary) => void;
  onOpenDirectChat?: (userId: string) => void;
  onBack?: () => void;
  embedded?: boolean;
  highlightMessageId?: string | null;
}) {
  const [messages, setMessages] = useState<InternalMessageItem[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [sending, setSending] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [replyTo, setReplyTo] = useState<InternalMessageItem | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pinned, setPinned] = useState<InternalMessageItem[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [pendingAttachments, setPendingAttachments] = useState<LocalPendingAttachment[]>([]);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionSuggestions, setMentionSuggestions] = useState<MentionSuggestion | null>(null);
  const [readReceiptDetails, setReadReceiptDetails] = useState<Map<string, ReadReceiptDetail[]>>(new Map());

  const { draft, setDraft, clearDraft } = useChatDraft(conversation.id);
  const composeRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const pendingReactionsRef = useRef(new Set<string>());
  const pendingMessagesRef = useRef(new Set<string>());
  const pendingScrollToBottomRef = useRef(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const myParticipant = conversation.participants.find((p) => p.userId === currentUser.id);
  const isMuted = myParticipant?.isMuted ?? false;
  const headerSubtitle = [
    conversationHeaderSubtitle(conversation, currentUser.id),
    isMuted ? "Muted" : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    scrollChatContainerToBottom(messagesContainerRef.current, behavior);
  }, []);

  const scrollToMessage = useCallback((messageId: string) => {
    document.getElementById(`msg-${messageId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const mergeMessages = useCallback(
    (
      prev: InternalMessageItem[],
      serverItems: InternalMessageItem[],
      append: boolean
    ): InternalMessageItem[] => {
      if (append) return [...serverItems, ...prev];
      const pending = prev.filter((m) => pendingMessagesRef.current.has(m.id));
      const dedupedPending = pending.filter(
        (optimistic) =>
          !serverItems.some(
            (server) =>
              server.author.id === optimistic.author.id &&
              server.body === optimistic.body &&
              Math.abs(
                new Date(server.createdAt).getTime() - new Date(optimistic.createdAt).getTime()
              ) < 60_000
          )
      );
      for (const message of pending) {
        if (!dedupedPending.includes(message)) {
          pendingMessagesRef.current.delete(message.id);
        }
      }
      return [...serverItems, ...dedupedPending];
    },
    []
  );

  const syncMessageCache = useCallback(
    (messages: InternalMessageItem[], nextPage: number, nextHasMore: boolean) => {
      const cached = getCachedConversationThread(conversation.id);
      setCachedConversationThread(conversation.id, {
        messages,
        pinned: cached?.pinned,
        page: nextPage,
        hasMore: nextHasMore,
      });
    },
    [conversation.id]
  );

  const refreshLatestMessages = useCallback(
    (prev: InternalMessageItem[], items: InternalMessageItem[]) => {
      const oldestLatest = items[0]?.createdAt;
      const olderHistory = oldestLatest
        ? prev.filter(
            (message) =>
              !pendingMessagesRef.current.has(message.id) &&
              new Date(message.createdAt) < new Date(oldestLatest)
          )
        : [];
      return mergeMessages([...olderHistory, ...items], items, false);
    },
    [mergeMessages]
  );

  const loadMessages = useCallback(
    async (options?: { append?: boolean; olderPage?: number; background?: boolean }) => {
      const append = options?.append ?? false;
      const background = options?.background ?? false;
      if (!append && !background) setMessagesLoading(true);
      else if (append) setLoadingMore(true);
      try {
        if (append) {
          const olderPage = options?.olderPage;
          if (!olderPage || olderPage < 1) return;
          const r = await fetchOlderConversationMessages(conversation.id, olderPage);
          setHasMore(olderPage > 1);
          setPage(olderPage);
          setMessages((prev) => {
            const next = mergeMessages(prev, r.items, true);
            syncMessageCache(next, olderPage, olderPage > 1);
            return next;
          });
          return;
        }

        const r = await fetchLatestConversationMessages(conversation.id);
        setHasMore(r.hasOlder);
        setPage(r.lastPage);
        setMessages((prev) => {
          const next = background
            ? refreshLatestMessages(prev, r.items)
            : mergeMessages(prev, r.items, false);
          syncMessageCache(next, r.lastPage, r.hasOlder);
          return next;
        });
      } finally {
        if (!append && !background) setMessagesLoading(false);
        setLoadingMore(false);
      }
    },
    [conversation.id, mergeMessages, refreshLatestMessages, syncMessageCache]
  );

  const loadPinned = useCallback(async () => {
    try {
      const r = await api.getPinnedMessages(conversation.id);
      setPinned(r.items);
      const cached = getCachedConversationThread(conversation.id);
      setCachedConversationThread(conversation.id, {
        messages: cached?.messages ?? [],
        pinned: r.items,
        page: cached?.page ?? 1,
        hasMore: cached?.hasMore ?? false,
      });
    } catch {
      // ignore
    }
  }, [conversation.id]);

  useEffect(() => {
    pendingScrollToBottomRef.current = !highlightMessageId;
    const cached = getCachedConversationThread(conversation.id);
    if (cached) {
      setMessages(cached.messages);
      setPinned(cached.pinned);
      setPage(cached.page);
      setHasMore(cached.hasMore);
      setMessagesLoading(false);
    } else {
      setMessages([]);
      setPinned([]);
      setPage(1);
      setHasMore(false);
      setMessagesLoading(true);
    }
    setReplyTo(null);
    setEditingId(null);
    setTypingUsers([]);
    setMentionSuggestions(null);
    setReadReceiptDetails(new Map());

    void loadMessages({ background: Boolean(cached) });
    void loadPinned();
    void api.markConversationRead(conversation.id);
  }, [conversation.id, highlightMessageId, loadMessages, loadPinned]);

  useLayoutEffect(() => {
    if (!pendingScrollToBottomRef.current || messagesLoading || messages.length === 0) return;
    scrollChatContainerToBottom(messagesContainerRef.current, "instant");
  }, [conversation.id, messages, messagesLoading]);

  useEffect(() => {
    if (!pendingScrollToBottomRef.current || messagesLoading || messages.length === 0) return;

    const container = messagesContainerRef.current;
    const content = container?.querySelector("[data-chat-messages]");
    if (!container || !content) return;

    const stickToBottom = () => {
      container.scrollTop = container.scrollHeight;
    };

    stickToBottom();
    const observer = new ResizeObserver(stickToBottom);
    observer.observe(content);

    const stopTimer = window.setTimeout(() => {
      pendingScrollToBottomRef.current = false;
      observer.disconnect();
    }, 1200);

    return () => {
      window.clearTimeout(stopTimer);
      observer.disconnect();
    };
  }, [conversation.id, messages.length, messagesLoading]);

  useEffect(() => {
    if (highlightMessageId) {
      pendingScrollToBottomRef.current = false;
      const timer = setTimeout(() => scrollToMessage(highlightMessageId), 300);
      return () => clearTimeout(timer);
    }
  }, [highlightMessageId, messages.length, scrollToMessage]);

  useCollaborationRealtime(
    useCallback(
      (event) => {
        if (event.conversationId && event.conversationId !== conversation.id) return;
        if (event.type === "typing" && event.userId !== currentUser.id) {
          setTypingUsers((prev) => {
            if (event.isTyping) {
              return [...new Set([...prev.filter((n) => n !== event.userName), event.userName ?? ""])].filter(Boolean);
            }
            return prev.filter((n) => n !== event.userName);
          });
          return;
        }
        if (event.type === "message.new" && event.messageId) {
          const inlineMessage = (event as { message?: InternalMessageItem }).message;
          if (inlineMessage) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === inlineMessage.id)) return prev;
              const next = [...prev, inlineMessage];
              syncMessageCache(next, page, hasMore);
              return next;
            });
            pendingScrollToBottomRef.current = true;
            void api.markConversationRead(conversation.id);
          } else {
            void api
              .getConversationMessage(conversation.id, event.messageId)
              .then((msg) => {
                setMessages((prev) => {
                  if (prev.some((m) => m.id === msg.id)) return prev;
                  const next = [...prev, msg];
                  syncMessageCache(next, page, hasMore);
                  return next;
                });
                pendingScrollToBottomRef.current = true;
                void api.markConversationRead(conversation.id);
              })
              .catch(() => void loadMessages({ background: true }));
          }
          return;
        }
        if (
          event.type === "message.updated" ||
          event.type === "message.deleted" ||
          event.type === "reaction.updated" ||
          event.type === "pin.updated"
        ) {
          void loadMessages({ background: true });
          void loadPinned();
        }
        if (event.type === "conversation.read") {
          void api.getConversation(conversation.id).then((c) => onConversationChange?.(c));
        }
      },
      [conversation.id, currentUser.id, hasMore, loadMessages, loadPinned, onConversationChange, page, syncMessageCache]
    )
  );

  useEffect(() => {
    if (!mentionQuery) {
      setMentionSuggestions(null);
      return;
    }
    const timer = setTimeout(() => {
      api.getMentionSuggestions(mentionQuery).then(setMentionSuggestions);
    }, 200);
    return () => clearTimeout(timer);
  }, [mentionQuery]);

  const activeMentionToken = useMemo(() => {
    const match = draft.slice(0, composeRef.current?.selectionStart ?? draft.length).match(/@([a-zA-Z0-9._-]*)$/);
    return match ? match[1] : null;
  }, [draft]);

  useEffect(() => {
    if (activeMentionToken !== null) setMentionQuery(activeMentionToken);
    else setMentionQuery("");
  }, [activeMentionToken]);

  const notifyTyping = useCallback(
    (isTyping: boolean) => {
      void api.sendTypingIndicator(conversation.id, isTyping);
    },
    [conversation.id]
  );

  const handleDraftChange = (value: string) => {
    setDraft(value);
    notifyTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => notifyTyping(false), 2000);
  };

  const handleComposeKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
    insertMention(
      firstUser?.mention ?? firstGroup!.alias,
      draft,
      setDraft,
      composeRef
    );
  };

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text && pendingAttachments.length === 0) return;
    if (sending) return;

    if (editingId) {
      setSending(true);
      try {
        const updated = await api.editConversationMessage(conversation.id, editingId, text);
        setMessages((prev) => {
          const next = prev.map((m) => (m.id === editingId ? updated : m));
          setCachedConversationThread(conversation.id, { messages: next });
          return next;
        });
        setEditingId(null);
        clearDraft();
        setReplyTo(null);
      } finally {
        setSending(false);
      }
      return;
    }

    const attachmentsToSend = [...pendingAttachments];
    const parentMessage = replyTo;
    const urgent = isUrgent;
    const tempId = `pending-${crypto.randomUUID()}`;
    pendingMessagesRef.current.add(tempId);
    const optimistic = buildOptimisticMessage(tempId, text, currentUser, {
      isUrgent: urgent,
      replyTo: parentMessage,
      attachments: attachmentsToSend,
    });
    setMessages((prev) => {
      const next = [...prev, optimistic];
      setCachedConversationThread(conversation.id, { messages: next });
      return next;
    });
    requestAnimationFrame(() => scrollToBottom("instant"));
    clearDraft();
    setReplyTo(null);
    setIsUrgent(false);
    setPendingAttachments([]);
    setSending(true);

    try {
      const attachmentIds: string[] = [];
      for (const attachment of attachmentsToSend) {
        attachmentIds.push(await api.uploadConversationAttachment(conversation.id, attachment.file));
      }
      const msg = await api.sendConversationMessage(conversation.id, {
        body: text,
        attachmentIds,
        parentMessageId: parentMessage?.id,
        isUrgent: urgent,
      });
      pendingMessagesRef.current.delete(tempId);
      setMessages((prev) => {
        const withoutPending = prev.filter((m) => m.id !== tempId);
        const next = withoutPending.some((m) => m.id === msg.id)
          ? withoutPending
          : [...withoutPending, msg];
        setCachedConversationThread(conversation.id, { messages: next });
        return next;
      });
      scrollToBottom("instant");
      void api.markConversationRead(conversation.id);
      notifyTyping(false);
    } catch {
      pendingMessagesRef.current.delete(tempId);
      setMessages((prev) => {
        const next = prev.filter((m) => m.id !== tempId);
        setCachedConversationThread(conversation.id, { messages: next });
        return next;
      });
      setDraft(text);
      setPendingAttachments(attachmentsToSend);
    } finally {
      setSending(false);
    }
  };

  const toggleReaction = async (messageId: string, emoji: string) => {
    const pendingKey = `${messageId}:${emoji}`;
    let previousReactions: MessageReaction[] = [];
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        previousReactions = m.reactions ?? [];
        return {
          ...m,
          reactions: optimisticToggleReaction(previousReactions, emoji, currentUser),
        };
      })
    );
    pendingReactionsRef.current.add(pendingKey);
    try {
      const { reactions } = await api.toggleMessageReaction(conversation.id, messageId, emoji);
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, reactions } : m)));
    } catch {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, reactions: previousReactions } : m))
      );
    } finally {
      pendingReactionsRef.current.delete(pendingKey);
    }
  };

  const contextLink = conversation.leadId
    ? { href: `${CRM_BASE_PATH}/leads/${conversation.leadId}`, label: "View lead" }
    : conversation.jobId
      ? { href: `${CRM_BASE_PATH}/jobs/${conversation.jobId}`, label: "View job" }
      : null;

  const openTeamChatLink = embedded ? (
    <Link
      href={`${CRM_BASE_PATH}/conversations?conversationId=${conversation.id}`}
      className="inline-flex items-center gap-1 text-xs font-medium text-(--color-primary) hover:underline"
    >
      Open in Team Chat <ExternalLink className="size-3" />
    </Link>
  ) : null;

  return (
    <div className={`flex min-h-0 min-w-0 flex-1 flex-col ${embedded ? "max-h-[32rem]" : ""}`}>
      <div className="shrink-0 border-b border-(--color-tc-20) bg-white px-4 py-3 md:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {onBack && (
              <button type="button" onClick={onBack} className="mb-2 flex items-center gap-1 text-sm text-(--color-tc-30) md:hidden">
                <ArrowLeft className="size-4" /> Back
              </button>
            )}
            <h2 className="truncate text-base font-semibold text-(--color-tc-40)">
              {conversationDisplayTitle(conversation, currentUser.id)}
            </h2>
            {headerSubtitle && (
              <p className="text-xs text-(--color-tc-30)">{headerSubtitle}</p>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-3">
              {contextLink && (
                <Link href={contextLink.href} className="text-xs font-medium text-(--color-primary) hover:underline">
                  {contextLink.label}
                </Link>
              )}
              {openTeamChatLink}
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <SecondaryButton
              type="button"
              size="small"
              onClick={async () => {
                await api.setConversationMuted(conversation.id, !isMuted);
                const updated = await api.getConversation(conversation.id);
                onConversationChange?.(updated);
                toast.success(isMuted ? "Notifications unmuted" : "Conversation muted");
              }}
            >
              <BellOff className="size-4" />
            </SecondaryButton>
            {!embedded && conversation.kind === "GROUP" && (
              <>
                <SecondaryButton
                  type="button"
                  size="small"
                  onClick={async () => {
                    const title = window.prompt(
                      "Group name",
                      conversationDisplayTitle(conversation, currentUser.id)
                    );
                    if (!title?.trim()) return;
                    const updated = await api.updateConversation(conversation.id, { title: title.trim() });
                    onConversationChange?.(updated);
                  }}
                >
                  Rename
                </SecondaryButton>
                <SecondaryButton
                  type="button"
                  size="small"
                  onClick={async () => {
                    if (!window.confirm("Leave this group?")) return;
                    await api.removeConversationParticipant(conversation.id, currentUser.id);
                    toast.success("Left group");
                  }}
                >
                  Leave
                </SecondaryButton>
              </>
            )}
            {!embedded && (
              <SecondaryButton
                type="button"
                size="small"
                onClick={async () => {
                  const archived = !(myParticipant?.isArchived ?? false);
                  await api.setConversationArchived(conversation.id, archived);
                  toast.success(archived ? "Conversation archived" : "Conversation restored");
                  void api.getConversation(conversation.id).then(onConversationChange);
                }}
              >
                Archive
              </SecondaryButton>
            )}
          </div>
        </div>
        {pinned.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {pinned.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => scrollToMessage(p.id)}
                className="inline-flex max-w-xs items-center gap-1 rounded-lg border border-(--color-tc-20) bg-(--color-nc-10) px-2 py-1 text-left text-xs hover:bg-white"
              >
                <Pin className="size-3 shrink-0 text-(--color-primary)" />
                <span className="truncate">{p.body.slice(0, 60)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div ref={messagesContainerRef} className="relative min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
        {hasMore && (
          <div className="mb-4 flex justify-center">
            <SecondaryButton
              type="button"
              size="small"
              disabled={loadingMore}
              onClick={() => void loadMessages({ append: true, olderPage: page - 1 })}
            >
              {loadingMore ? <Loader2 className="size-4 animate-spin" /> : "Load older messages"}
            </SecondaryButton>
          </div>
        )}
        {messagesLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-(--color-nc-10)/80">
            <LoadingSpinner className="py-0" />
          </div>
        )}
        <div data-chat-messages className="mx-auto flex max-w-3xl flex-col gap-1">
          {messages.map((m, index) => {
            const isPending = isPendingMessageId(m.id);
            const isMine = m.author.id === currentUser.id;
            const prev = messages[index - 1];
            const next = messages[index + 1];
            const grouped = shouldGroupMessages(
              { authorId: m.author.id, createdAt: m.createdAt },
              prev ? { authorId: prev.author.id, createdAt: prev.createdAt } : undefined
            );
            const isLastInGroup =
              !next ||
              !shouldGroupMessages(
                { authorId: next.author.id, createdAt: next.createdAt },
                { authorId: m.author.id, createdAt: m.createdAt }
              );
            const showDateSeparator =
              !prev || new Date(m.createdAt).toDateString() !== new Date(prev.createdAt).toDateString();
            const readReceipt =
              isMine && isLastInGroup
                ? getReadReceipt(m.createdAt, conversation.participants, currentUser.id)
                : null;

            return (
              <div key={m.id}>
                {showDateSeparator && (
                  <div className="my-4 flex items-center gap-3">
                    <div className="h-px flex-1 bg-(--color-tc-20)" />
                    <span className="shrink-0 text-[11px] font-medium text-(--color-tc-30)">
                      {formatChatDateSeparator(m.createdAt)}
                    </span>
                    <div className="h-px flex-1 bg-(--color-tc-20)" />
                  </div>
                )}
                <div className={`flex ${isMine ? "justify-end" : "justify-start"} ${grouped ? "mt-0.5" : "mt-3 first:mt-0"}`}>
                  <ChatBubble
                    messageId={m.id}
                    body={m.body}
                    authorName={m.author.fullName}
                    authorAvatarUrl={m.author.avatarUrl}
                    createdAt={m.createdAt}
                    editedAt={m.editedAt}
                    isUrgent={m.isUrgent}
                    isPinned={Boolean(m.pinnedAt)}
                    isDeleted={m.isDeleted}
                    isPending={isPending}
                    parentPreview={m.parentPreview}
                    isMine={isMine}
                    showHeader={!grouped}
                    showAvatar={!isMine && !grouped}
                    showReadReceipt={isMine && isLastInGroup && !isPending}
                    readReceipt={readReceipt}
                    readReceiptDetails={readReceiptDetails.get(m.id)}
                    mentions={m.mentions}
                    reactions={m.reactions ?? []}
                    attachments={m.attachments ?? []}
                    highlight={highlightMessageId === m.id}
                    onToggleReaction={isPending ? undefined : toggleReaction}
                    onMentionClick={onOpenDirectChat}
                    actions={isPending ? undefined : {
                      onReply: (id) => {
                        const msg = messages.find((x) => x.id === id);
                        if (msg) setReplyTo(msg);
                      },
                      onEdit: (id, bodyText) => {
                        setEditingId(id);
                        setDraft(bodyText);
                        composeRef.current?.focus();
                      },
                      onDelete: async (id) => {
                        if (!window.confirm("Delete this message?")) return;
                        await api.deleteConversationMessage(conversation.id, id);
                        void loadMessages({ background: true });
                      },
                      onPin: async (id, pin) => {
                        if (pin) await api.pinConversationMessage(conversation.id, id);
                        else await api.unpinConversationMessage(conversation.id, id);
                        void loadPinned();
                      },
                      onCreateTask: async (id) => {
                        const r = await api.createTaskFromMessage(conversation.id, id);
                        toast.success(`Task created: ${r.title}`);
                      },
                      onCopyLink: (id) => {
                        const url = `${window.location.origin}${CRM_BASE_PATH}/conversations?conversationId=${conversation.id}&messageId=${id}`;
                        void navigator.clipboard.writeText(url);
                        toast.success("Link copied");
                      },
                      onShowReadReceipts: async (id) => {
                        const r = await api.getMessageReadReceipts(conversation.id, id);
                        setReadReceiptDetails((prev) => new Map(prev).set(id, r.receipts));
                      },
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {typingUsers.length > 0 && (
        <p className="shrink-0 px-4 pb-1 text-xs text-(--color-tc-30)">
          {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing…
        </p>
      )}

      <div className="relative shrink-0 border-t border-(--color-tc-20) bg-white p-4">
        {(replyTo || editingId) && (
          <div className="mb-2 flex items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg bg-(--color-nc-10) px-2.5 py-1.5">
              <span className="h-4 w-0.5 shrink-0 rounded-full bg-(--color-primary)" aria-hidden />
              <span className="shrink-0 text-[11px] font-medium text-(--color-primary)">
                {editingId ? "Editing" : replyTo?.author.fullName}
              </span>
              {!editingId && replyTo?.body && (
                <span className="truncate text-[11px] text-(--color-tc-30)">{replyTo.body}</span>
              )}
            </div>
            <button
              type="button"
              aria-label={editingId ? "Cancel edit" : "Cancel reply"}
              className="shrink-0 rounded-md p-1 text-(--color-tc-30) transition hover:bg-(--color-nc-10) hover:text-(--color-tc-40)"
              onClick={() => {
                setReplyTo(null);
                setEditingId(null);
                clearDraft();
              }}
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        )}
        {mentionSuggestions && activeMentionToken !== null && (
          <div className="absolute bottom-full left-4 right-4 mb-2 max-h-48 overflow-y-auto rounded-xl border border-(--color-tc-20) bg-white p-2 shadow-lg">
            {mentionSuggestions.users.map((u) => (
              <button key={u.id} type="button" className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-(--color-nc-10)" onClick={() => insertMention(u.mention, draft, setDraft, composeRef)}>
                @{u.mention} — {u.fullName}
              </button>
            ))}
            {mentionSuggestions.groups.map((g) => (
              <button key={g.alias} type="button" className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-(--color-nc-10)" onClick={() => insertMention(g.alias, draft, setDraft, composeRef)}>
                @{g.alias} — {g.label}
              </button>
            ))}
          </div>
        )}
        <div className="mb-2 flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-(--color-tc-30)">
            <input type="checkbox" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)} />
            Mark urgent
          </label>
        </div>
        <ChatComposeField
          ref={composeRef}
          value={draft}
          onChange={handleDraftChange}
          onKeyDown={handleComposeKeyDown}
          onSend={() => void sendMessage()}
          sending={sending}
          placeholder="Message the team… Enter to send, Shift+Enter for new line"
          attachments={pendingAttachments}
          onAddAttachments={(files) => addAttachments(files, pendingAttachments, setPendingAttachments)}
          onRemoveAttachment={(id) => removeAttachment(id, setPendingAttachments)}
        />
      </div>
    </div>
  );
}

function insertMention(
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

function addAttachments(
  files: FileList,
  pendingAttachments: LocalPendingAttachment[],
  setPendingAttachments: React.Dispatch<React.SetStateAction<LocalPendingAttachment[]>>
) {
  const remaining = MAX_CHAT_ATTACHMENTS - pendingAttachments.length;
  if (remaining <= 0) return;
  const next: LocalPendingAttachment[] = [];
  for (const file of Array.from(files).slice(0, remaining)) {
    const error = validateChatAttachmentFile(file);
    if (error) continue;
    next.push({
      id: crypto.randomUUID(),
      file,
      filename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
    });
  }
  if (next.length > 0) setPendingAttachments((prev) => [...prev, ...next]);
}

function removeAttachment(
  id: string,
  setPendingAttachments: React.Dispatch<React.SetStateAction<LocalPendingAttachment[]>>
) {
  setPendingAttachments((prev) => {
    const removed = prev.find((item) => item.id === id);
    if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
    return prev.filter((item) => item.id !== id);
  });
}
