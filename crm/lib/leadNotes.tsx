import type { ReactNode } from "react";
import { api } from "@/crm/lib/api";
import { getCachedCurrentUser } from "@/crm/lib/currentUserCache";
import { setCachedConversationThread } from "@/crm/lib/conversationMessageCache";
import { getCachedLeadThread, setCachedLeadThread } from "@/crm/lib/leadMessageCache";
import { ensureRecordThread } from "@/crm/lib/recordThread";
import { linkifyText } from "@/crm/lib/formatMessageBody";
import type { InternalMessageItem, Message } from "@/crm/types";

export const NOTE_MENTION_REGEX = /@([a-zA-Z0-9._-]+)/g;

export function messagePreviewSnippet(message: Message): string {
  if (message.subject?.trim()) return message.subject.trim();
  return message.body
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

export function insertMentionToken(
  token: string,
  compose: string,
  setCompose: (value: string) => void,
  composeRef: React.RefObject<HTMLTextAreaElement | null>
) {
  const textarea = composeRef.current;
  if (!textarea) return;
  const cursor = textarea.selectionStart;
  const before = compose.slice(0, cursor).replace(/@([a-zA-Z0-9._-]*)$/, `@${token} `);
  setCompose(before + compose.slice(cursor));
  textarea.focus();
}

export function mentionTokenAtCursor(value: string, cursor: number): string | null {
  const match = value.slice(0, cursor).match(/@([a-zA-Z0-9._-]*)$/);
  return match ? match[1] : null;
}

export function notesAuthorFallback() {
  const cached = getCachedCurrentUser();
  return cached
    ? { id: cached.id, fullName: cached.fullName, email: "" }
    : { id: "me", fullName: "You", email: "" };
}

export function buildOptimisticNote(params: {
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

export function renderNoteBody(
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
      mention.user?.fullName ?? (mention.role ? mention.role.replace(/_/g, " ") : `@${alias}`)
    );
  }

  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  const re = new RegExp(NOTE_MENTION_REGEX.source, "g");
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

export function rootNoteOf(
  note: InternalMessageItem,
  notes: InternalMessageItem[]
): InternalMessageItem {
  if (!note.parentMessageId) return note;
  return notes.find((item) => item.id === note.parentMessageId) ?? note;
}

export function rootLeadNotes(notes: InternalMessageItem[]): InternalMessageItem[] {
  return notes
    .filter((note) => !note.isDeleted && !note.parentMessageId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function noteRepliesByParent(
  notes: InternalMessageItem[]
): Map<string, InternalMessageItem[]> {
  const map = new Map<string, InternalMessageItem[]>();
  for (const note of notes) {
    if (note.isDeleted || !note.parentMessageId) continue;
    const list = map.get(note.parentMessageId) ?? [];
    list.push(note);
    map.set(note.parentMessageId, list);
  }
  for (const [, list] of map) {
    list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  return map;
}

export function persistLeadNotes(
  leadId: string,
  notes: InternalMessageItem[],
  conversationId?: string | null
) {
  const nextId = conversationId?.trim() ? conversationId : undefined;
  setCachedLeadThread(leadId, {
    notes,
    ...(nextId ? { conversationId: nextId } : {}),
  });
  const convId = nextId ?? getCachedLeadThread(leadId)?.conversationId ?? null;
  if (!convId) return;
  setCachedConversationThread(convId, { messages: notes });
}

export function replaceTempLeadNote(
  notes: InternalMessageItem[],
  tempId: string,
  created: InternalMessageItem
): InternalMessageItem[] {
  return [...notes.filter((note) => note.id !== tempId && note.id !== created.id), created];
}

export async function resolveNotesThread(leadId: string, conversationId: string | null) {
  if (conversationId) return { id: conversationId };
  const cachedId = getCachedLeadThread(leadId)?.conversationId;
  if (cachedId) return { id: cachedId };
  return ensureRecordThread({ leadId });
}

export async function uploadNoteAttachments(conversationId: string, files: File[]) {
  const attachmentIds: string[] = [];
  for (const file of files) {
    attachmentIds.push(await api.uploadConversationAttachment(conversationId, file));
  }
  return attachmentIds;
}
