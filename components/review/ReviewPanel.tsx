"use client";

import { useEffect, useRef, useState } from "react";
import CommentBox from "./CommentBox";
import type { ReviewThread } from "./reviewApi";

const COLLAPSED_CHARS = 420;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

function CommentText({ author, createdAt, body }: { author: string; createdAt: string; body: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = body.length > COLLAPSED_CHARS;
  const shown = isLong && !expanded ? `${body.slice(0, COLLAPSED_CHARS).trimEnd()}…` : body;

  return (
    <div>
      <p className="text-sm font-medium text-neutral-900">{author}</p>
      <p className="text-xs text-neutral-500">{formatDate(createdAt)}</p>
      <p className="mt-1.5 text-sm leading-relaxed wrap-anywhere whitespace-pre-wrap text-neutral-800">{shown}</p>
      {isLong ? (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-1 text-xs font-medium text-navy underline"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      ) : null}
    </div>
  );
}

function ThreadCard({
  thread,
  located,
  active,
  onSelect,
  onReply,
  onToggleResolved,
}: {
  thread: ReviewThread;
  located: boolean;
  active: boolean;
  onSelect: () => void;
  onReply: (body: string) => Promise<void>;
  onToggleResolved: () => Promise<void>;
}) {
  const [replying, setReplying] = useState(false);
  const card = useRef<HTMLElement>(null);

  useEffect(() => {
    if (active) card.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [active]);

  return (
    <article
      ref={card}
      className={`rounded-lg border p-3 ${active ? "border-navy ring-1 ring-navy" : "border-neutral-200"}`}
    >
      <button type="button" onClick={onSelect} className="block w-full text-left">
        <span className="line-clamp-2 border-l-2 border-amber-400 pl-2 text-sm text-neutral-600 italic">
          {thread.quote}
        </span>
      </button>
      {!located ? (
        <p className="mt-1.5 rounded bg-amber-50 px-2 py-1 text-xs text-amber-900">
          This text is no longer on the page. It may have been edited.
        </p>
      ) : null}

      <div className="mt-2.5">
        <CommentText author={thread.author.fullName} createdAt={thread.createdAt} body={thread.body} />
      </div>

      {thread.replies.length > 0 ? (
        <ul className="mt-3 space-y-3 border-l border-neutral-200 pl-3">
          {thread.replies.map((reply) => (
            <li key={reply.id}>
              <CommentText author={reply.author.fullName} createdAt={reply.createdAt} body={reply.body} />
            </li>
          ))}
        </ul>
      ) : null}

      {thread.resolvedAt ? (
        <p className="mt-2.5 text-xs text-neutral-500">
          Resolved by {thread.resolvedBy ?? "a former user"} on {formatDate(thread.resolvedAt)}
        </p>
      ) : null}

      {replying ? (
        <div className="mt-3">
          <CommentBox
            placeholder="Write a reply"
            submitLabel="Reply"
            onCancel={() => setReplying(false)}
            onSubmit={async (body) => {
              await onReply(body);
              setReplying(false);
            }}
          />
        </div>
      ) : (
        <div className="mt-2.5 flex gap-3 text-sm">
          <button type="button" onClick={() => setReplying(true)} className="font-medium text-navy hover:underline">
            Reply
          </button>
          <button
            type="button"
            onClick={() => void onToggleResolved()}
            className="text-neutral-600 hover:underline"
          >
            {thread.resolvedAt ? "Reopen" : "Resolve"}
          </button>
        </div>
      )}
    </article>
  );
}

export default function ReviewPanel({
  threads,
  locatedIds,
  activeId,
  onClose,
  onSelect,
  onReply,
  onToggleResolved,
}: {
  threads: ReviewThread[];
  locatedIds: Set<string>;
  activeId: string | null;
  onClose: () => void;
  onSelect: (thread: ReviewThread) => void;
  onReply: (thread: ReviewThread, body: string) => Promise<void>;
  onToggleResolved: (thread: ReviewThread) => Promise<void>;
}) {
  const [showResolved, setShowResolved] = useState(false);
  const open = threads.filter((thread) => !thread.resolvedAt);
  const resolved = threads.filter((thread) => thread.resolvedAt);
  const activeIsResolved = resolved.some((thread) => thread.id === activeId);
  const listingResolved = showResolved || activeIsResolved;
  const shown = listingResolved ? resolved : open;

  const tabClass = (selected: boolean) =>
    `rounded-md px-3 py-1 text-sm ${selected ? "bg-neutral-200 font-medium text-neutral-900" : "text-neutral-600 hover:bg-neutral-100"}`;

  return (
    <aside
      aria-label="Review comments"
      className="fixed inset-y-0 right-0 z-9999 flex w-full max-w-md flex-col border-l border-neutral-200 bg-white shadow-xl"
    >
      <header className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
        <h2 className="text-base font-semibold text-neutral-900">Review comments</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-2 py-1 text-sm text-neutral-700 hover:bg-neutral-100"
        >
          Close
        </button>
      </header>
      <div className="flex gap-1 border-b border-neutral-200 px-4 py-2">
        <button type="button" className={tabClass(!listingResolved)} onClick={() => setShowResolved(false)}>
          Open ({open.length})
        </button>
        <button type="button" className={tabClass(listingResolved)} onClick={() => setShowResolved(true)}>
          Resolved ({resolved.length})
        </button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {shown.length === 0 ? (
          <p className="text-sm text-neutral-600">
            {listingResolved
              ? "No resolved comments on this page."
              : "No open comments on this page. Select any text to add one."}
          </p>
        ) : null}
        {shown.map((thread) => (
          <ThreadCard
            key={thread.id}
            thread={thread}
            located={locatedIds.has(thread.id)}
            active={thread.id === activeId}
            onSelect={() => onSelect(thread)}
            onReply={(body) => onReply(thread, body)}
            onToggleResolved={() => onToggleResolved(thread)}
          />
        ))}
      </div>
    </aside>
  );
}
