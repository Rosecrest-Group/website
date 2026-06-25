"use client";

import { forwardRef, useCallback, useRef, type ReactNode } from "react";
import { Loader2, Paperclip, Send, X } from "lucide-react";
import { MAX_CHAT_ATTACHMENTS } from "@/crm/lib/chatAttachments";

export type PendingComposeAttachment = {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  previewUrl?: string;
};

export type ChatComposeFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  sending?: boolean;
  disabled?: boolean;
  placeholder?: string;
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  className?: string;
  leadingSlot?: ReactNode;
  attachments?: PendingComposeAttachment[];
  onAddAttachments?: (files: FileList) => void;
  onRemoveAttachment?: (id: string) => void;
};

function resizeTextarea(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = `${Math.min(el.scrollHeight, 144)}px`;
}

const ChatComposeField = forwardRef<HTMLTextAreaElement, ChatComposeFieldProps>(
  function ChatComposeField(
    {
      value,
      onChange,
      onSend,
      sending = false,
      disabled = false,
      placeholder = "Type a message…",
      onKeyDown,
      className = "",
      leadingSlot,
      attachments = [],
      onAddAttachments,
      onRemoveAttachment,
    },
    ref
  ) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canSend =
      (value.trim().length > 0 || attachments.length > 0) && !sending && !disabled;

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(event.target.value);
        resizeTextarea(event.target);
      },
      [onChange]
    );

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;

        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          if (canSend) onSend();
        }
      },
      [onKeyDown, canSend, onSend]
    );

    return (
      <div className={className}>
        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 rounded-xl border border-(--color-tc-20) bg-(--color-nc-10) px-2 py-1.5 text-xs text-(--color-tc-40)"
              >
                {attachment.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={attachment.previewUrl}
                    alt=""
                    className="size-8 rounded-lg object-cover"
                  />
                ) : (
                  <span className="flex size-8 items-center justify-center rounded-lg bg-white text-[10px] font-semibold">
                    FILE
                  </span>
                )}
                <span className="max-w-[140px] truncate">{attachment.filename}</span>
                {onRemoveAttachment && (
                  <button
                    type="button"
                    onClick={() => onRemoveAttachment(attachment.id)}
                    className="rounded-md p-0.5 text-(--color-tc-30) transition hover:bg-white hover:text-(--color-tc-40)"
                    aria-label={`Remove ${attachment.filename}`}
                  >
                    <X className="size-3.5" aria-hidden />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-1.5 rounded-2xl border border-(--color-tc-20) bg-white px-2 py-2 shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition focus-within:border-(--color-primary)/50 focus-within:ring-2 focus-within:ring-(--color-primary)/20">
          {leadingSlot}
          {onAddAttachments && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,text/plain,text/csv,.doc,.docx,.xls,.xlsx"
                onChange={(event) => {
                  if (event.target.files?.length) {
                    onAddAttachments(event.target.files);
                    event.target.value = "";
                  }
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || sending || attachments.length >= MAX_CHAT_ATTACHMENTS}
                aria-label="Attach file"
                className="flex size-9 shrink-0 items-center justify-center rounded-xl text-(--color-tc-30) transition hover:bg-(--color-nc-10) hover:text-(--color-tc-40) disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Paperclip className="size-4" aria-hidden />
              </button>
            </>
          )}
          <textarea
            ref={ref}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            disabled={disabled}
            className="max-h-36 min-h-[36px] flex-1 resize-none border-0 bg-transparent px-2 py-1.5 text-sm leading-relaxed text-(--color-tc-40) outline-none placeholder:text-(--color-tc-30) disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            type="button"
            onClick={onSend}
            disabled={!canSend}
            aria-label={sending ? "Sending message" : "Send message"}
            className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition ${
              canSend
                ? "bg-(--color-primary) text-white shadow-sm hover:opacity-90 active:scale-[0.97]"
                : "cursor-not-allowed bg-(--color-nc-10) text-(--color-tc-30)"
            }`}
          >
            {sending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Send className="size-4 translate-x-px" aria-hidden />
            )}
          </button>
        </div>
      </div>
    );
  }
);

export default ChatComposeField;
