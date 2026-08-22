"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDown, MessageSquare, StickyNote, X } from "lucide-react";
import { toast } from "sonner";
import ChatComposeField, {
  type PendingComposeAttachment,
} from "@/crm/components/ui/ChatComposeField";
import ChatMessageAttachments from "@/crm/components/ui/ChatMessageAttachments";
import CrmSlidePanel from "@/crm/components/ui/CrmSlidePanel";
import CurvedContainer from "@/crm/components/ui/CurvedContainer";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import { api } from "@/crm/lib/api";
import { MAX_CHAT_ATTACHMENTS, validateChatAttachmentFile } from "@/crm/lib/chatAttachments";
import { formatChatDateSeparator, formatChatTime } from "@/crm/lib/formatChatTime";
import {
  getCachedLeadThread,
} from "@/crm/lib/leadMessageCache";
import {
  buildOptimisticNote,
  insertMentionToken,
  mentionTokenAtCursor,
  messagePreviewSnippet,
  noteRepliesByParent,
  notesAuthorFallback,
  persistLeadNotes,
  renderNoteBody,
  replaceTempLeadNote,
  resolveNotesThread,
  rootLeadNotes,
  rootNoteOf,
  uploadNoteAttachments,
} from "@/crm/lib/leadNotes";
import { prefetchLeadThreadWithActivities } from "@/crm/lib/loadLeadThread";
import { scrollChatContainerToBottom } from "@/crm/lib/scrollChatThread";
import type { InternalMessageItem, MentionSuggestion, Message } from "@/crm/types";
import { cn } from "@/lib/utils";

type LocalPendingAttachment = PendingComposeAttachment & { file: File };

const NOTE_COLLAPSED_MAX_PX = 52;

function CollapsibleNoteBody({ children }: { children: ReactNode }) {
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
      setOverflows(next > NOTE_COLLAPSED_MAX_PX + 4);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
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
              ? NOTE_COLLAPSED_MAX_PX
              : Math.max(fullHeight, NOTE_COLLAPSED_MAX_PX)
            : undefined,
        }}
        onClick={overflows ? () => setExpanded((value) => !value) : undefined}
        aria-expanded={overflows ? expanded : undefined}
      >
        <div ref={contentRef}>{children}</div>
      </div>
      {overflows ? (
        <button
          type="button"
          className={cn(
            "flex w-full items-center justify-center text-current/55 transition-colors hover:text-current/80",
            collapsed
              ? "absolute inset-x-0 bottom-0 bg-linear-to-t from-rose-50 to-transparent pt-7 pb-0.5"
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
      ) : null}
    </div>
  );
}

function MentionMenu({
  suggestions,
  draft,
  setDraft,
  composeRef,
}: {
  suggestions: MentionSuggestion;
  draft: string;
  setDraft: (value: string) => void;
  composeRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  return (
    <div className="absolute bottom-full left-0 z-20 mb-2 max-h-48 w-full overflow-y-auto rounded-xl border border-line bg-white py-1 shadow-lg">
      {suggestions.users.map((user) => (
        <button
          key={user.id}
          type="button"
          className="block w-full px-3 py-2 text-left text-sm hover:bg-sidebar"
          onClick={() => insertMentionToken(user.mention, draft, setDraft, composeRef)}
        >
          @{user.mention} — {user.fullName}
        </button>
      ))}
      {suggestions.groups.map((group) => (
        <button
          key={group.alias}
          type="button"
          className="block w-full px-3 py-2 text-left text-sm hover:bg-sidebar"
          onClick={() => insertMentionToken(group.alias, draft, setDraft, composeRef)}
        >
          @{group.alias}
        </button>
      ))}
    </div>
  );
}

export function NoteThreadBubble({
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
          <CollapsibleNoteBody>
            <p className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed text-rose-950">
              {note.isDeleted ? (
                <span className="italic text-rose-900/60">[Note deleted]</span>
              ) : (
                renderNoteBody(note.body, note.mentions)
              )}
            </p>
          </CollapsibleNoteBody>
          {!note.isDeleted && note.attachments?.length ? (
            <div className="mt-2">
              <ChatMessageAttachments attachments={note.attachments} isMine={false} />
            </div>
          ) : null}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-2">
          {onComment ? (
            <button
              type="button"
              onClick={() => onComment(note)}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-ink-muted opacity-0 transition group-hover:opacity-100 focus:opacity-100 hover:bg-white hover:text-ink"
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

export function NoteCommentsSlidePanel({
  leadId,
  conversationId,
  note,
  notes,
  onClose,
  onNotesChange,
}: {
  leadId: string;
  conversationId: string | null;
  note: InternalMessageItem | null;
  notes: InternalMessageItem[];
  onClose: () => void;
  onNotesChange: (notes: InternalMessageItem[], conversationId?: string | null) => void;
}) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionSuggestions, setMentionSuggestions] = useState<MentionSuggestion | null>(null);
  const composeRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const repliesByParent = useMemo(() => noteRepliesByParent(notes), [notes]);
  const replies = note ? repliesByParent.get(note.id) ?? [] : [];

  useEffect(() => {
    if (!note) {
      setDraft("");
      setError("");
      return;
    }
    requestAnimationFrame(() => {
      composeRef.current?.focus();
      scrollRef.current?.scrollIntoView({ block: "end" });
    });
  }, [note?.id]);

  const activeMentionToken = useMemo(() => {
    const cursor = composeRef.current?.selectionStart ?? draft.length;
    return mentionTokenAtCursor(draft, cursor);
  }, [draft]);

  useEffect(() => {
    setMentionQuery(activeMentionToken ?? "");
  }, [activeMentionToken]);

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

  async function handleSend() {
    const text = draft.trim();
    if (!text || !note) return;

    const tempId = `pending-${crypto.randomUUID()}`;
    const optimistic = buildOptimisticNote({
      tempId,
      body: text,
      author: notesAuthorFallback(),
      parentMessageId: note.id,
    });
    const nextOptimistic = [...notes, optimistic];
    persistLeadNotes(leadId, nextOptimistic, conversationId);
    onNotesChange(nextOptimistic, conversationId);
    setError("");
    setDraft("");
    requestAnimationFrame(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      composeRef.current?.focus();
    });

    try {
      const thread = await resolveNotesThread(leadId, conversationId);
      const created = await api.sendConversationMessage(thread.id, {
        body: text,
        parentMessageId: note.id,
      });
      const next = replaceTempLeadNote(
        getCachedLeadThread(leadId)?.notes ?? nextOptimistic,
        tempId,
        created
      );
      persistLeadNotes(leadId, next, thread.id);
      onNotesChange(next, thread.id);
    } catch (err) {
      const rolledBack = (getCachedLeadThread(leadId)?.notes ?? nextOptimistic).filter(
        (item) => item.id !== tempId
      );
      persistLeadNotes(leadId, rolledBack, conversationId);
      onNotesChange(rolledBack, conversationId);
      setDraft(text);
      const message = err instanceof Error ? err.message : "Failed to post comment";
      setError(message);
      toast.error(message);
      requestAnimationFrame(() => composeRef.current?.focus());
    }
  }

  return (
    <CrmSlidePanel
      isOpen={Boolean(note)}
      title="Note comments"
      onClose={onClose}
      widthClassName="max-w-lg"
      footer={
        note ? (
          <div className="w-full space-y-2">
            <div className="relative">
              {mentionSuggestions && activeMentionToken !== null ? (
                <MentionMenu
                  suggestions={mentionSuggestions}
                  draft={draft}
                  setDraft={setDraft}
                  composeRef={composeRef}
                />
              ) : null}
              <ChatComposeField
                ref={composeRef}
                value={draft}
                onChange={setDraft}
                onSend={() => void handleSend()}
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
                    draft,
                    setDraft,
                    composeRef
                  );
                }}
              />
            </div>
            {error ? <p className="text-xs text-red-600">{error}</p> : null}
            <div className="flex justify-end gap-2">
              <SecondaryButton type="button" size="small" className="w-auto" onClick={onClose}>
                Close
              </SecondaryButton>
              <PrimaryButton
                type="button"
                className="w-auto"
                onClick={() => void handleSend()}
                disabled={!draft.trim()}
              >
                Post comment
              </PrimaryButton>
            </div>
          </div>
        ) : undefined
      }
    >
      {note ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-rose-200/90 bg-rose-50 px-4 py-3">
            <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-rose-900/70">
              <StickyNote className="size-3.5 shrink-0 text-rose-700" aria-hidden />
              <span className="font-semibold text-rose-950">Internal note</span>
              <span className="font-medium text-rose-900">{note.author.fullName}</span>
              <span>{formatChatTime(note.createdAt)}</span>
            </div>
            {note.referencedPreview ? (
              <p className="mb-2 truncate rounded-lg border border-rose-200/80 bg-white/70 px-2.5 py-1 text-[11px] text-rose-900/80">
                On: {note.referencedPreview.subject?.trim() || note.referencedPreview.body}
              </p>
            ) : null}
            <p className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed text-rose-950">
              {renderNoteBody(note.body, note.mentions)}
            </p>
          </div>

          {replies.length === 0 ? (
            <p className="ml-4 border-l-2 border-rose-100 pl-4 text-xs text-ink-muted">
              No comments yet. Be the first.
            </p>
          ) : (
            <div className="ml-4 space-y-2.5 border-l-2 border-rose-200 pl-4">
              <p className="text-[11px] font-medium text-rose-800/80">
                {replies.length} {replies.length === 1 ? "comment" : "comments"}
              </p>
              {replies.map((reply) => (
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
          <div ref={scrollRef} />
        </div>
      ) : null}
    </CrmSlidePanel>
  );
}

export default function LeadInternalNotesPanel({
  leadId,
  referencedMessage = null,
  onClearReferencedMessage,
  onPosted,
  className,
  framed = true,
  isActive = true,
}: {
  leadId: string;
  referencedMessage?: Message | null;
  onClearReferencedMessage?: () => void;
  onPosted?: () => void;
  className?: string;
  framed?: boolean;
  /** When false, the panel stays mounted offscreen (inbox tab carousel). */
  isActive?: boolean;
}) {
  const cached = getCachedLeadThread(leadId);
  const [notes, setNotes] = useState<InternalMessageItem[]>(() => cached?.notes ?? []);
  const [conversationId, setConversationId] = useState<string | null>(
    () => cached?.conversationId ?? null
  );
  const [loading, setLoading] = useState(() => !cached?.notesLoaded);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState<LocalPendingAttachment[]>([]);
  const [error, setError] = useState("");
  const [commentNote, setCommentNote] = useState<InternalMessageItem | null>(null);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionSuggestions, setMentionSuggestions] = useState<MentionSuggestion | null>(null);
  const composeRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const existing = getCachedLeadThread(leadId);
    if (existing?.notesLoaded) {
      setNotes(existing.notes);
      setConversationId(existing.conversationId);
      setLoading(false);
    } else if (existing) {
      setNotes(existing.notes);
      setConversationId(existing.conversationId);
      setLoading(true);
    } else {
      setNotes([]);
      setConversationId(null);
      setLoading(true);
    }

    void prefetchLeadThreadWithActivities(leadId)
      .then((result) => {
        if (cancelled) return;
        setNotes(result.notes);
        setConversationId(result.conversationId);
      })
      .catch(() => {
        if (!cancelled && !existing?.notesLoaded) setNotes(existing?.notes ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [leadId]);

  useEffect(() => {
    if (!isActive) return;
    const existing = getCachedLeadThread(leadId);
    if (!existing) return;
    setNotes(existing.notes);
    setConversationId(existing.conversationId);
  }, [isActive, leadId]);

  useEffect(() => {
    if (referencedMessage) {
      requestAnimationFrame(() => composeRef.current?.focus());
    }
  }, [referencedMessage]);

  useEffect(() => {
    if (!loading) {
      requestAnimationFrame(() => scrollChatContainerToBottom(scrollRef.current));
    }
  }, [loading, notes.length]);

  const activeMentionToken = useMemo(() => {
    const cursor = composeRef.current?.selectionStart ?? draft.length;
    return mentionTokenAtCursor(draft, cursor);
  }, [draft]);

  useEffect(() => {
    setMentionQuery(activeMentionToken ?? "");
  }, [activeMentionToken]);

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

  const repliesByParent = useMemo(() => noteRepliesByParent(notes), [notes]);
  const roots = useMemo(() => rootLeadNotes(notes), [notes]);

  const datedItems = useMemo(() => {
    const items: Array<
      | { kind: "date"; key: string; label: string }
      | { kind: "note"; key: string; note: InternalMessageItem }
    > = [];
    let lastDate = "";
    for (const note of roots) {
      const dateLabel = formatChatDateSeparator(note.createdAt);
      if (dateLabel !== lastDate) {
        items.push({ kind: "date", key: `date-${dateLabel}-${note.id}`, label: dateLabel });
        lastDate = dateLabel;
      }
      items.push({ kind: "note", key: note.id, note });
    }
    return items;
  }, [roots]);

  function applyNotes(next: InternalMessageItem[], nextConversationId?: string | null) {
    setNotes(next);
    if (nextConversationId) setConversationId(nextConversationId);
    persistLeadNotes(leadId, next, nextConversationId ?? conversationId);
  }

  async function handleSendNote() {
    const text = draft.trim();
    const attachmentsToSend = [...attachments];
    if ((!text && attachmentsToSend.length === 0) || sending) return;

    const referenced = referencedMessage;
    const tempId = `pending-${crypto.randomUUID()}`;
    const optimistic = buildOptimisticNote({
      tempId,
      body: text,
      author: notesAuthorFallback(),
      referencedMessage: referenced,
    });
    const nextOptimistic = [...notes, optimistic];
    applyNotes(nextOptimistic, conversationId);
    setError("");
    setDraft("");
    setAttachments([]);
    onClearReferencedMessage?.();
    setSending(true);
    onPosted?.();

    try {
      const thread = await resolveNotesThread(leadId, conversationId);
      const attachmentIds = await uploadNoteAttachments(
        thread.id,
        attachmentsToSend.map((item) => item.file)
      );
      const created = await api.sendConversationMessage(thread.id, {
        body: text || undefined,
        referencedMessageId: referenced?.id,
        attachmentIds: attachmentIds.length > 0 ? attachmentIds : undefined,
      });
      applyNotes(replaceTempLeadNote(getCachedLeadThread(leadId)?.notes ?? nextOptimistic, tempId, created), thread.id);
    } catch (err) {
      const rolledBack = (getCachedLeadThread(leadId)?.notes ?? nextOptimistic).filter(
        (item) => item.id !== tempId
      );
      applyNotes(rolledBack, conversationId);
      setDraft(text);
      setAttachments(attachmentsToSend);
      const message = err instanceof Error ? err.message : "Failed to post note";
      setError(message);
      toast.error(message);
    } finally {
      setSending(false);
    }
  }

  const body = (
    <>
      <div className="shrink-0 border-b border-line px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-ink">
          <span className="flex size-7 items-center justify-center rounded-lg bg-rose-50 text-rose-800">
            <StickyNote className="size-3.5" aria-hidden />
          </span>
          Internal notes
        </div>
        <p className="mt-1 text-xs text-ink-muted">
          Team only — never sent as email or SMS. Notes still appear in the messages thread at the
          time they were written.
        </p>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-sidebar px-4 py-4">
        {loading && roots.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : roots.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-medium text-ink">No internal notes yet</p>
            <p className="mt-1 max-w-sm text-xs text-ink-muted">
              Write a note below. Attachments, @mentions, and comments stay on this tab — they are
              not sent to the customer.
            </p>
          </div>
        ) : (
          datedItems.map((item) =>
            item.kind === "date" ? (
              <div key={item.key} className="flex justify-center">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-ink-muted shadow-sm">
                  {item.label}
                </span>
              </div>
            ) : (
              <NoteThreadBubble
                key={item.key}
                note={item.note}
                replies={repliesByParent.get(item.note.id) ?? []}
                onComment={(note) => setCommentNote(rootNoteOf(note, notes))}
              />
            )
          )
        )}
      </div>

      <div className="shrink-0 border-t border-line bg-white p-4">
        {referencedMessage ? (
          <div className="mb-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50/80 px-3 py-2">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-rose-800">Note on</p>
              <p className="truncate text-xs text-rose-950">
                {messagePreviewSnippet(referencedMessage)}
              </p>
            </div>
            <button
              type="button"
              onClick={onClearReferencedMessage}
              className="rounded-lg p-1 text-rose-800 hover:bg-white hover:text-rose-950"
              aria-label="Clear note target"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          </div>
        ) : null}

        <div className="relative">
          {mentionSuggestions && activeMentionToken !== null ? (
            <MentionMenu
              suggestions={mentionSuggestions}
              draft={draft}
              setDraft={setDraft}
              composeRef={composeRef}
            />
          ) : null}
          <ChatComposeField
            ref={composeRef}
            value={draft}
            onChange={setDraft}
            onSend={() => void handleSendNote()}
            sending={sending}
            placeholder="Add an internal note… Use @name to tag teammates"
            attachments={attachments}
            onAddAttachments={(files) => {
              const remaining = MAX_CHAT_ATTACHMENTS - attachments.length;
              if (remaining <= 0) return;
              const next: LocalPendingAttachment[] = [];
              for (const file of Array.from(files).slice(0, remaining)) {
                const invalid = validateChatAttachmentFile(file);
                if (invalid) {
                  toast.error(invalid);
                  continue;
                }
                next.push({
                  id: crypto.randomUUID(),
                  file,
                  filename: file.name,
                  mimeType: file.type,
                  sizeBytes: file.size,
                  previewUrl: file.type.startsWith("image/")
                    ? URL.createObjectURL(file)
                    : undefined,
                });
              }
              if (next.length > 0) setAttachments((prev) => [...prev, ...next]);
            }}
            onRemoveAttachment={(id) => {
              setAttachments((prev) => {
                const removed = prev.find((item) => item.id === id);
                if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
                return prev.filter((item) => item.id !== id);
              });
            }}
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
                draft,
                setDraft,
                composeRef
              );
            }}
          />
        </div>
        {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
      </div>

      <NoteCommentsSlidePanel
        leadId={leadId}
        conversationId={conversationId}
        note={commentNote}
        notes={notes}
        onClose={() => setCommentNote(null)}
        onNotesChange={(next, nextConversationId) => {
          applyNotes(next, nextConversationId || conversationId);
        }}
      />
    </>
  );

  if (!framed) {
    return <div className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", className)}>{body}</div>;
  }

  return (
    <CurvedContainer
      className={cn(
        "flex min-h-[min(32rem,calc(100dvh-8rem))] max-h-[calc(100dvh-8rem)] flex-col overflow-hidden",
        className
      )}
      showBorderAndShadow
    >
      {body}
    </CurvedContainer>
  );
}
