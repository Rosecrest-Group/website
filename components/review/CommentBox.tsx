"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { MAX_COMMENT_WORDS } from "./reviewApi";

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

/** Long comments are normal here, so the box grows with its text and then scrolls. */
export default function CommentBox({
  placeholder,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  placeholder: string;
  submitLabel: string;
  onSubmit: (body: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const textarea = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const element = textarea.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight + 2, window.innerHeight * 0.5)}px`;
  }, [body]);

  const words = countWords(body);
  const tooLong = words > MAX_COMMENT_WORDS;
  const canSubmit = words > 0 && !tooLong && !submitting;

  async function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      await onSubmit(body.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save your comment. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <div>
      <textarea
        ref={textarea}
        autoFocus
        rows={5}
        value={body}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) void submit();
          if (e.key === "Escape") onCancel();
        }}
        className="block w-full resize-none rounded-md border border-neutral-300 bg-white p-2.5 text-sm leading-relaxed text-neutral-900 outline-none focus:border-navy focus:ring-1 focus:ring-navy"
      />
      {error ? <p className="mt-1.5 text-xs text-red-700">{error}</p> : null}
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className={`text-xs tabular-nums ${tooLong ? "font-medium text-red-700" : "text-neutral-500"}`}>
          {words.toLocaleString("en-GB")} / {MAX_COMMENT_WORDS.toLocaleString("en-GB")} words
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => void submit()}
            className="rounded-md bg-navy px-3 py-1.5 text-sm font-medium text-white hover:bg-navy-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Saving…" : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
