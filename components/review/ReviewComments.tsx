"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { siteFontClass } from "@/lib/fonts";
import { buildTextIndex, describeRange, locateAnchor, type TextAnchor } from "./anchor";
import CommentBox from "./CommentBox";
import ReviewPanel from "./ReviewPanel";
import {
  addReply,
  createThread,
  deleteComment,
  fetchReviewUser,
  fetchThreads,
  setResolved,
  type ReviewThread,
  type ReviewUser,
} from "./reviewApi";

const MAX_QUOTE_CHARS = 10000;
const REFRESH_MS = 30000;
const COMPOSER_WIDTH = 440;
const VIEWPORT_MARGIN = 12;

/** Highlights are painted by the browser instead of wrapping text in markup, so the page's DOM
 * stays exactly as it will ship and React can re-render it without losing them. */
const HIGHLIGHT_STYLES = `
  ::highlight(review-comment) { background-color: rgb(252 211 77 / 0.45); }
  ::highlight(review-comment-active) { background-color: rgb(251 146 60 / 0.55); }
`;

type Placement = { top: number; left: number };
type Selected = { anchor: TextAnchor; range: Range; placement: Placement };

const reviewRoot = () => document.querySelector("[data-review-root]");

function placeBelow(range: Range): Placement {
  const rect = range.getBoundingClientRect();
  const width = Math.min(COMPOSER_WIDTH, window.innerWidth - VIEWPORT_MARGIN * 2);
  const left = Math.min(
    Math.max(VIEWPORT_MARGIN, rect.left),
    window.innerWidth - width - VIEWPORT_MARGIN,
  );
  return { top: rect.bottom + window.scrollY + 8, left: left + window.scrollX };
}

function readSelection(): Selected | null {
  const root = reviewRoot();
  const selection = window.getSelection();
  if (!root || !selection || selection.isCollapsed || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return null;
  const anchor = describeRange(buildTextIndex(root), range);
  if (!anchor || anchor.quote.length > MAX_QUOTE_CHARS) return null;
  return { anchor, range: range.cloneRange(), placement: placeBelow(range) };
}

function paintHighlight(name: string, ranges: Range[]) {
  if (typeof Highlight === "undefined") return;
  CSS.highlights.set(name, new Highlight(...ranges));
}

function clearHighlight(name: string) {
  if (typeof Highlight !== "undefined") CSS.highlights.delete(name);
}

function caretAt(x: number, y: number): { node: Node; offset: number } | null {
  if (document.caretPositionFromPoint) {
    const position = document.caretPositionFromPoint(x, y);
    return position ? { node: position.offsetNode, offset: position.offset } : null;
  }
  const range = document.caretRangeFromPoint?.(x, y);
  return range ? { node: range.startContainer, offset: range.startOffset } : null;
}

function ReviewLayer({
  pagePath,
  user,
  panelOpen,
  setPanelOpen,
}: {
  pagePath: string;
  user: ReviewUser | null;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
}) {
  const [threads, setThreads] = useState<ReviewThread[]>([]);
  const [ranges, setRanges] = useState<Map<string, Range>>(() => new Map());
  const [selected, setSelected] = useState<Selected | null>(null);
  const [composing, setComposing] = useState<Selected | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  const composingRef = useRef(composing);
  useEffect(() => {
    composingRef.current = composing;
  }, [composing]);

  // The box opens under the selection and grows as it's typed in, so keep its buttons on screen.
  const composer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = composer.current;
    if (!element) return;
    const observer = new ResizeObserver(() => element.scrollIntoView({ block: "nearest" }));
    observer.observe(element);
    return () => observer.disconnect();
  }, [composing]);

  // Another reviewer's comments and replies appear without a reload.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const load = () => {
      if (document.hidden) return;
      fetchThreads(pagePath)
        .then((items) => {
          if (cancelled) return;
          setThreads(items);
          setLoadError(false);
        })
        .catch(() => {
          if (!cancelled) setLoadError(true);
        });
    };
    load();
    const timer = window.setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [pagePath, user]);

  // Text can arrive or change after load (accordions, client data), so anchors are re-found then.
  useEffect(() => {
    const root = reviewRoot();
    if (!root) return;
    const locate = () => {
      const index = buildTextIndex(root);
      const next = new Map<string, Range>();
      for (const thread of threads) {
        const range = locateAnchor(index, thread, document);
        if (range) next.set(thread.id, range);
      }
      setRanges(next);
    };
    locate();
    let timer: number | undefined;
    const observer = new MutationObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(locate, 300);
    });
    observer.observe(root, { subtree: true, childList: true, characterData: true });
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [threads]);

  useEffect(() => {
    const open = threads.filter((thread) => !thread.resolvedAt && thread.id !== activeId);
    paintHighlight(
      "review-comment",
      open.flatMap((thread) => ranges.get(thread.id) ?? []),
    );
    const activeRange = activeId ? ranges.get(activeId) : undefined;
    const emphasised = composing?.range ?? activeRange;
    paintHighlight("review-comment-active", emphasised ? [emphasised] : []);
    return () => {
      clearHighlight("review-comment");
      clearHighlight("review-comment-active");
    };
  }, [threads, ranges, activeId, composing]);

  useEffect(() => {
    let timer: number | undefined;
    const onSelectionChange = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (!composingRef.current) setSelected(readSelection());
      }, 200);
    };
    document.addEventListener("selectionchange", onSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", onSelectionChange);
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!window.getSelection()?.isCollapsed) return;
      if (!reviewRoot()?.contains(event.target as Node)) return;
      const caret = caretAt(event.clientX, event.clientY);
      if (!caret) return;
      const hit = threads.find((thread) => {
        const range = ranges.get(thread.id);
        return !thread.resolvedAt && range?.isPointInRange(caret.node, caret.offset);
      });
      if (!hit) return;
      setActiveId(hit.id);
      setPanelOpen(true);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [threads, ranges, setPanelOpen]);

  const replaceThread = useCallback((updated: ReviewThread) => {
    setThreads((current) =>
      current.map((thread) => (thread.id === updated.id ? updated : thread)),
    );
  }, []);

  const locatedIds = useMemo(() => new Set(ranges.keys()), [ranges]);
  const openCount = threads.filter((thread) => !thread.resolvedAt).length;
  const signInHref = `/crm/login?redirect=${encodeURIComponent(pagePath)}`;

  return (
    <div className={siteFontClass} data-review-ui>
      <style>{HIGHLIGHT_STYLES}</style>

      {selected && !composing ? (
        <div className="absolute z-9999" style={selected.placement}>
          {user ? (
            <button
              type="button"
              // Keeps the reader's selection in place through the click.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setComposing(selected);
                setSelected(null);
                window.getSelection()?.removeAllRanges();
              }}
              className="rounded-md bg-navy px-3 py-1.5 text-sm font-medium text-white shadow-lg hover:bg-navy-deep"
            >
              Comment
            </button>
          ) : (
            <a
              href={signInHref}
              className="block rounded-md bg-navy px-3 py-1.5 text-sm font-medium text-white shadow-lg hover:bg-navy-deep"
            >
              Sign in to comment
            </a>
          )}
        </div>
      ) : null}

      {composing ? (
        <div
          ref={composer}
          role="dialog"
          aria-label="Add a comment"
          className="absolute z-9999 scroll-mb-3 rounded-lg border border-neutral-200 bg-white p-3 shadow-xl"
          style={{ ...composing.placement, width: `min(${COMPOSER_WIDTH}px, calc(100vw - ${VIEWPORT_MARGIN * 2}px))` }}
        >
          <p className="mb-2 line-clamp-2 border-l-2 border-amber-400 pl-2 text-sm text-neutral-600 italic">
            {composing.anchor.quote}
          </p>
          <CommentBox
            placeholder="Write your comment"
            submitLabel="Post comment"
            onCancel={() => setComposing(null)}
            onSubmit={async (body) => {
              const thread = await createThread(pagePath, composing.anchor, body);
              setThreads((current) => [...current, thread]);
              setComposing(null);
              setActiveId(thread.id);
              setPanelOpen(true);
            }}
          />
        </div>
      ) : null}

      {panelOpen && user ? (
        <ReviewPanel
          threads={threads}
          user={user}
          locatedIds={locatedIds}
          activeId={activeId}
          onClose={() => {
            setPanelOpen(false);
            setActiveId(null);
          }}
          onSelect={(thread) => {
            setActiveId(thread.id);
            ranges
              .get(thread.id)
              ?.startContainer.parentElement?.scrollIntoView({ block: "center", behavior: "smooth" });
          }}
          onReply={async (thread, body) => replaceThread(await addReply(thread.id, body))}
          onToggleResolved={async (thread) => {
            replaceThread(await setResolved(thread.id, !thread.resolvedAt));
            setActiveId(null);
          }}
          onDelete={async (commentId) => {
            const { thread: updated } = await deleteComment(commentId);
            if (updated) {
              replaceThread(updated);
            } else {
              setThreads((current) => current.filter((thread) => thread.id !== commentId));
              if (activeId === commentId) setActiveId(null);
            }
          }}
        />
      ) : null}

      {user && !panelOpen && !composing ? (
        <button
          type="button"
          onClick={() => setPanelOpen(true)}
          className="fixed bottom-4 left-4 z-9999 rounded-full bg-navy px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-navy-deep"
        >
          {loadError ? "Comments unavailable" : `Comments (${openCount})`}
        </button>
      ) : null}
    </div>
  );
}

/** Text-selection comments for copy review. Only mounted on staging; see `MarketingSiteChrome`. */
export default function ReviewComments() {
  const pagePath = usePathname();
  // Undefined until the login check answers, which also keeps this out of the server render.
  const [user, setUser] = useState<ReviewUser | null>();
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    void fetchReviewUser().then(setUser);
  }, []);

  if (user === undefined) return null;

  return createPortal(
    // Remounting per page drops any half-finished selection along with the old page's anchors.
    <ReviewLayer key={pagePath} pagePath={pagePath} user={user} panelOpen={panelOpen} setPanelOpen={setPanelOpen} />,
    document.body,
  );
}
