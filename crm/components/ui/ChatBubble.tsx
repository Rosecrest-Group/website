"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, CheckCheck, MoreHorizontal, Pin } from "lucide-react";
import { formatChatTime, initialsFromName } from "@/crm/lib/formatChatTime";
import { linkifyText } from "@/crm/lib/formatMessageBody";
import type { MessageAttachment, MessageReaction, ReadReceiptDetail } from "@/crm/types";
import type { ReadReceipt } from "@/crm/lib/chatReceipts";
import ChatMessageAttachments from "@/crm/components/ui/ChatMessageAttachments";

const MENTION_REGEX = /@([a-zA-Z0-9._-]+)/g;

export const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "🎉"] as const;

export type ChatMention = {
  kind?: "USER" | "ROLE";
  alias?: string | null;
  userId?: string | null;
  user?: { id?: string; fullName: string } | null;
  role?: string | null;
};

export type ChatBubbleActions = {
  onReply?: (messageId: string) => void;
  onEdit?: (messageId: string, body: string) => void;
  onDelete?: (messageId: string) => void;
  onPin?: (messageId: string, pinned: boolean) => void;
  onCreateTask?: (messageId: string) => void;
  onCopyLink?: (messageId: string) => void;
  onShowReadReceipts?: (messageId: string) => void;
};

export default function ChatBubble({
  messageId,
  body,
  authorName,
  authorAvatarUrl,
  createdAt,
  editedAt,
  isUrgent,
  isPinned,
  isDeleted,
  isPending = false,
  parentPreview,
  isMine,
  showHeader = true,
  showAvatar = true,
  showReadReceipt = false,
  readReceipt = null,
  readReceiptDetails,
  mentions = [],
  reactions = [],
  attachments = [],
  onToggleReaction,
  onMentionClick,
  actions,
  highlight,
}: {
  messageId: string;
  body: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  createdAt: string;
  editedAt?: string | null;
  isUrgent?: boolean;
  isPinned?: boolean;
  isDeleted?: boolean;
  isPending?: boolean;
  parentPreview?: { id: string; authorName: string; body: string } | null;
  isMine: boolean;
  showHeader?: boolean;
  showAvatar?: boolean;
  showReadReceipt?: boolean;
  readReceipt?: ReadReceipt | null;
  readReceiptDetails?: ReadReceiptDetail[];
  mentions?: ChatMention[];
  reactions?: MessageReaction[];
  attachments?: MessageAttachment[];
  onToggleReaction?: (messageId: string, emoji: string) => void;
  onMentionClick?: (userId: string) => void;
  actions?: ChatBubbleActions;
  highlight?: boolean;
}) {
  const hasBody = body.trim().length > 0;
  const hasAttachments = attachments.length > 0;
  const time = formatChatTime(createdAt);
  const initials = initialsFromName(authorName);
  const [reactionsVisible, setReactionsVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const hideReactionsTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (hideReactionsTimeoutRef.current) clearTimeout(hideReactionsTimeoutRef.current);
    };
  }, []);

  const { mentionLabels, mentionUserIds } = useMemo(() => {
    const labels = new Map<string, string>();
    const userIds = new Map<string, string>();
    for (const mention of mentions) {
      const alias = mention.alias?.toLowerCase();
      if (!alias) continue;
      const label =
        mention.user?.fullName ??
        (mention.role ? mention.role.replace(/_/g, " ") : `@${alias}`);
      labels.set(alias, label);
      if (mention.kind === "USER") {
        const userId = mention.userId ?? mention.user?.id;
        if (userId) userIds.set(alias, userId);
      }
    }
    return { mentionLabels: labels, mentionUserIds: userIds };
  }, [mentions]);

  const reactionChips =
    reactions.length > 0 ? (
      <div className={`mt-1 flex flex-wrap gap-1 ${isMine ? "justify-end" : "justify-start"}`}>
        {reactions.map((reaction) => (
          <button
            key={reaction.emoji}
            type="button"
            title={reaction.users.map((u) => u.fullName).join(", ")}
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition hover:bg-(--color-nc-10) ${
              reaction.reactedByMe
                ? "border-(--color-primary)/30 bg-(--color-primary)/8"
                : "border-(--color-tc-20) bg-white"
            }`}
            onClick={() => onToggleReaction?.(messageId, reaction.emoji)}
          >
            <span>{reaction.emoji}</span>
            <span className="font-medium text-(--color-tc-40)">{reaction.count}</span>
          </button>
        ))}
      </div>
    ) : null;

  const receiptTitle =
    readReceiptDetails && readReceiptDetails.length > 0
      ? readReceiptDetails
          .map((r) => `${r.fullName}: ${r.hasRead ? "Seen" : "Not yet"}`)
          .join("\n")
      : readReceipt?.label;

  const readReceiptEl =
    showReadReceipt && readReceipt && isMine ? (
      <button
        type="button"
        className="mt-0.5 flex items-center gap-1 px-1 text-[10px] text-(--color-tc-30) hover:text-(--color-tc-40)"
        title={receiptTitle}
        onClick={() => actions?.onShowReadReceipts?.(messageId)}
      >
        {readReceipt.allRead ? (
          <CheckCheck className="size-3 text-(--color-primary)" aria-hidden />
        ) : (
          <Check className="size-3" aria-hidden />
        )}
        <span>{readReceipt.label}</span>
      </button>
    ) : null;

  const metaBadges = (
    <span className="inline-flex items-center gap-1">
      {isUrgent && (
        <span className="rounded bg-red-500/15 px-1 py-0.5 text-[10px] font-semibold text-red-600">
          Urgent
        </span>
      )}
      {isPinned && <Pin className="size-3 text-(--color-primary)" aria-label="Pinned" />}
      {editedAt && !isDeleted && (
        <span className="text-[10px] text-(--color-tc-30)">(edited)</span>
      )}
    </span>
  );

  const menu =
    actions && !isDeleted ? (
      <div className="relative">
        <button
          type="button"
          className="rounded p-1 opacity-0 transition group-hover:opacity-100 hover:bg-black/5"
          aria-label="Message actions"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <MoreHorizontal className="size-4" />
        </button>
        {menuOpen && (
          <div
            className={`absolute z-20 min-w-[140px] rounded-lg border border-(--color-tc-20) bg-white py-1 shadow-lg ${
              isMine ? "right-0" : "left-0"
            }`}
          >
            {actions.onReply && (
              <button type="button" className="block w-full px-3 py-1.5 text-left text-sm hover:bg-(--color-nc-10)" onClick={() => { actions.onReply?.(messageId); setMenuOpen(false); }}>Reply</button>
            )}
            {isMine && actions.onEdit && (
              <button type="button" className="block w-full px-3 py-1.5 text-left text-sm hover:bg-(--color-nc-10)" onClick={() => { actions.onEdit?.(messageId, body); setMenuOpen(false); }}>Edit</button>
            )}
            {isMine && actions.onDelete && (
              <button type="button" className="block w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50" onClick={() => { actions.onDelete?.(messageId); setMenuOpen(false); }}>Delete</button>
            )}
            {actions.onPin && (
              <button type="button" className="block w-full px-3 py-1.5 text-left text-sm hover:bg-(--color-nc-10)" onClick={() => { actions.onPin?.(messageId, !isPinned); setMenuOpen(false); }}>{isPinned ? "Unpin" : "Pin"}</button>
            )}
            {actions.onCreateTask && (
              <button type="button" className="block w-full px-3 py-1.5 text-left text-sm hover:bg-(--color-nc-10)" onClick={() => { actions.onCreateTask?.(messageId); setMenuOpen(false); }}>Create task</button>
            )}
            {actions.onCopyLink && (
              <button type="button" className="block w-full px-3 py-1.5 text-left text-sm hover:bg-(--color-nc-10)" onClick={() => { actions.onCopyLink?.(messageId); setMenuOpen(false); }}>Copy link</button>
            )}
          </div>
        )}
      </div>
    ) : null;

  const bubbleContent = (
    <div className={`flex flex-col ${hasBody && hasAttachments ? "gap-2" : ""}`}>
      {hasBody && (
        <p className={`whitespace-pre-wrap break-words ${isDeleted ? "italic opacity-70" : ""}`}>
          <MessageBody
            body={body}
            variant={isMine ? "sent" : "received"}
            mentionLabels={mentionLabels}
            mentionUserIds={mentionUserIds}
            onMentionClick={onMentionClick}
          />
        </p>
      )}
      {hasAttachments && <ChatMessageAttachments attachments={attachments} isMine={isMine} />}
    </div>
  );

  const tailRadius = showHeader
    ? isMine
      ? "rounded-br-[5px]"
      : "rounded-bl-[5px]"
    : isMine
      ? "rounded-tr-[5px]"
      : "rounded-tl-[5px]";

  const replyPreview = parentPreview ? (
    <div
      className="mb-1 flex max-w-full cursor-pointer items-center gap-1.5 rounded-lg bg-(--color-nc-10) px-2 py-1 transition-colors hover:bg-(--color-nc-20)"
    >
      <span className="h-3.5 w-0.5 shrink-0 rounded-full bg-(--color-primary)" aria-hidden />
      <span className="shrink-0 text-[11px] font-medium text-(--color-primary)">
        {parentPreview.authorName}
      </span>
      <span className="truncate text-[11px] text-(--color-tc-30)">
        {parentPreview.body}
      </span>
    </div>
  ) : null;

  const bubbleShell = (
    <div
      className={`w-fit max-w-full rounded-[18px] px-4 py-2.5 text-sm leading-snug shadow-sm ${tailRadius} ${
        isMine
          ? `bg-(--color-primary) text-white ${isUrgent ? "ring-2 ring-red-400/50" : ""}`
          : `border border-(--color-tc-20) bg-white text-(--color-tc-40) ${isUrgent ? "ring-2 ring-red-300/60" : ""}`
      }`}
    >
      {bubbleContent}
    </div>
  );

  const avatarEl = showAvatar ? (
    authorAvatarUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={authorAvatarUrl}
        alt=""
        className="mt-0.5 size-8 shrink-0 rounded-full object-cover"
      />
    ) : (
      <span
        className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-(--color-nc-40) text-[11px] font-semibold text-(--color-tc-40)"
        aria-hidden
      >
        {initials}
      </span>
    )
  ) : (
    <span className="size-8 shrink-0" aria-hidden />
  );

  if (isMine) {
    return (
      <div
        id={`msg-${messageId}`}
        className={`group relative w-fit max-w-[75%] shrink-0 scroll-mt-24 ${highlight ? "rounded-lg ring-2 ring-(--color-primary)/40" : ""}`}
        onMouseEnter={() => onToggleReaction && setReactionsVisible(true)}
        onMouseLeave={() => setReactionsVisible(false)}
      >
        <div className="flex flex-col items-end gap-1">
          {showHeader && (
            <span className="flex items-center gap-1 px-1 text-[11px] text-(--color-tc-30)">
              You · {time} {metaBadges} {menu}
            </span>
          )}
          {replyPreview}
          {bubbleShell}
          {!showHeader && (
            <span className="flex items-center gap-1 px-1 text-[10px] text-(--color-tc-30)">
              {time} {metaBadges}
            </span>
          )}
          {reactionChips}
          {readReceiptEl}
        </div>
      </div>
    );
  }

  return (
    <div
      id={`msg-${messageId}`}
      className={`group relative flex w-fit max-w-[85%] shrink-0 gap-2.5 scroll-mt-24 ${highlight ? "rounded-lg ring-2 ring-(--color-primary)/40" : ""}`}
      onMouseEnter={() => onToggleReaction && setReactionsVisible(true)}
      onMouseLeave={() => setReactionsVisible(false)}
    >
      {avatarEl}
      <div className="min-w-0">
        {showHeader && (
          <p className="mb-1 flex items-center gap-1 px-1 text-[11px] text-(--color-tc-30)">
            <span className="font-medium text-(--color-tc-40)">{authorName}</span>
            <span>·</span>
            <span>{time}</span>
            {metaBadges}
            {menu}
          </p>
        )}
        {replyPreview}
        {bubbleShell}
        {!showHeader && (
          <span className="mt-1 block px-1 text-[10px] text-(--color-tc-30)">{time}</span>
        )}
        {reactionChips}
      </div>
    </div>
  );
}

function MessageBody({
  body,
  variant,
  mentionLabels,
  mentionUserIds,
  onMentionClick,
}: {
  body: string;
  variant: "sent" | "received";
  mentionLabels: Map<string, string>;
  mentionUserIds: Map<string, string>;
  onMentionClick?: (userId: string) => void;
}) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  const mentionClassName =
    variant === "sent"
      ? "rounded-sm bg-white/20 px-0.5 font-semibold text-white"
      : "rounded-sm bg-(--color-primary)/10 px-0.5 font-semibold text-(--color-primary)";

  const linkClassName =
    variant === "sent" ? "underline text-white/90" : "underline text-(--color-primary)";

  for (const match of body.matchAll(MENTION_REGEX)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push(...linkifyText(body.slice(lastIndex, index), linkClassName));
    }

    const token = match[0];
    const alias = match[1].toLowerCase();
    const label = mentionLabels.get(alias);
    const userId = mentionUserIds.get(alias);

    if (userId && onMentionClick) {
      parts.push(
        <button
          key={key++}
          type="button"
          title={`Message ${label ?? token.slice(1)}`}
          className={`${mentionClassName} cursor-pointer underline-offset-2 hover:underline`}
          onClick={() => onMentionClick(userId)}
        >
          {token}
        </button>
      );
    } else {
      parts.push(
        <span key={key++} title={label} className={mentionClassName}>
          {token}
        </span>
      );
    }
    lastIndex = index + token.length;
  }

  if (lastIndex < body.length) {
    parts.push(...linkifyText(body.slice(lastIndex), linkClassName));
  }

  return <>{parts.length > 0 ? parts : linkifyText(body, linkClassName)}</>;
}
