"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  Bold,
  Code,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Send,
  Strikethrough,
  Underline,
  X,
} from "lucide-react";
import {
  MAX_MESSAGE_MEDIA_ATTACHMENTS,
  validateMessageMediaFile,
} from "@/crm/lib/messageMediaAttachments";
import {
  htmlToPlainText,
  plainTextToHtml,
  sanitizeEmailHtml,
  wrapTextSelection,
} from "@/crm/lib/messageFormatting";
import { cn } from "@/lib/utils";

type Channel = "EMAIL" | "SMS" | "WHATSAPP";

type ToolbarButtonProps = {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: ReactNode;
};

function ToolbarButton({ label, onClick, active, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "flex size-8 items-center justify-center rounded-lg text-(--color-tc-30) transition hover:bg-(--color-nc-10) hover:text-(--color-tc-40)",
        active && "bg-(--color-primary)/10 text-(--color-primary)"
      )}
    >
      {children}
    </button>
  );
}

export type EmailRichEditorHandle = {
  insertText: (text: string) => void;
  insertHtml: (html: string) => void;
  getHtml: () => string;
  focus: () => void;
};

export type EmailRichEditorProps = {
  html: string;
  onChange: (html: string) => void;
  placeholder: string;
  disabled?: boolean;
  editorClassName?: string;
  toolbarTrailing?: ReactNode;
  toolbarExtra?: ReactNode;
  toolbarMountEl?: HTMLDivElement | null;
  fillHeight?: boolean;
};

export const EmailRichEditor = forwardRef<EmailRichEditorHandle, EmailRichEditorProps>(
  function EmailRichEditor(
    {
      html,
      onChange,
      placeholder,
      disabled,
      editorClassName,
      toolbarTrailing,
      toolbarExtra,
      toolbarMountEl,
      fillHeight = false,
    },
    ref
  ) {
  const editorRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLTextAreaElement>(null);
  const lastEmittedHtmlRef = useRef<string | null>(null);
  const [showSource, setShowSource] = useState(false);
  const [source, setSource] = useState(html);

  useEffect(() => {
    if (!showSource) setSource(html);
  }, [html, showSource]);

  useEffect(() => {
    if (showSource || !editorRef.current) return;

    const sanitizedCurrent = sanitizeEmailHtml(editorRef.current.innerHTML);
    if (sanitizedCurrent === html) {
      lastEmittedHtmlRef.current = html;
      return;
    }

    editorRef.current.innerHTML = html;
    lastEmittedHtmlRef.current = html;
  }, [html, showSource]);

  const syncHtml = useCallback(() => {
    if (!editorRef.current) return;
    const next = sanitizeEmailHtml(editorRef.current.innerHTML);
    lastEmittedHtmlRef.current = next;
    onChange(next);
  }, [onChange]);

  const runCommand = useCallback(
    (command: string, value?: string) => {
      if (disabled) return;
      editorRef.current?.focus();
      document.execCommand(command, false, value);
      syncHtml();
    },
    [disabled, syncHtml]
  );

  const insertLink = useCallback(() => {
    const url = window.prompt("Link URL");
    if (!url?.trim()) return;
    runCommand("createLink", url.trim());
  }, [runCommand]);

  const insertText = useCallback(
    (text: string) => {
      if (disabled) return;
      if (showSource) {
        const el = sourceRef.current;
        if (!el) {
          const next = source + text;
          setSource(next);
          onChange(sanitizeEmailHtml(next));
          return;
        }
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const next = source.slice(0, start) + text + source.slice(end);
        setSource(next);
        onChange(sanitizeEmailHtml(next));
        requestAnimationFrame(() => {
          el.focus();
          const pos = start + text.length;
          el.setSelectionRange(pos, pos);
        });
        return;
      }
      editorRef.current?.focus();
      document.execCommand("insertText", false, text);
      syncHtml();
    },
    [disabled, showSource, source, syncHtml, onChange]
  );

  const insertHtml = useCallback(
    (html: string) => {
      if (disabled) return;
      if (showSource) {
        const next = source + html;
        setSource(next);
        onChange(sanitizeEmailHtml(next));
        return;
      }
      editorRef.current?.focus();
      document.execCommand("insertHTML", false, html);
      syncHtml();
    },
    [disabled, showSource, source, syncHtml, onChange]
  );

  const getHtml = useCallback(() => {
    if (showSource) return sanitizeEmailHtml(source);
    if (!editorRef.current) return "";
    return sanitizeEmailHtml(editorRef.current.innerHTML);
  }, [showSource, source]);

  useImperativeHandle(
    ref,
    () => ({
      insertText,
      insertHtml,
      getHtml,
      focus: () => {
        if (showSource) sourceRef.current?.focus();
        else editorRef.current?.focus();
      },
    }),
    [insertText, insertHtml, getHtml, showSource]
  );

  const toolbar = (
    <div className="flex w-full flex-wrap items-center gap-1">
      <ToolbarButton label="Bold" onClick={() => runCommand("bold")}>
        <Bold className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Italic" onClick={() => runCommand("italic")}>
        <Italic className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Underline" onClick={() => runCommand("underline")}>
        <Underline className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Bullet list" onClick={() => runCommand("insertUnorderedList")}>
        <List className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Numbered list" onClick={() => runCommand("insertOrderedList")}>
        <ListOrdered className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Insert link" onClick={insertLink}>
        <Link2 className="size-4" />
      </ToolbarButton>
      {toolbarExtra}
      <div className="ml-auto flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => {
            if (showSource) {
              const next = sanitizeEmailHtml(source);
              lastEmittedHtmlRef.current = next;
              onChange(next);
              setShowSource(false);
            } else {
              const current = editorRef.current
                ? sanitizeEmailHtml(editorRef.current.innerHTML)
                : html;
              lastEmittedHtmlRef.current = current;
              onChange(current);
              setSource(current);
              setShowSource(true);
            }
          }}
          className={cn(
            "rounded-lg px-2 py-1 text-[11px] font-medium text-(--color-tc-30) transition hover:bg-(--color-nc-10) hover:text-(--color-tc-40)",
            showSource && "bg-(--color-primary)/10 text-(--color-primary)"
          )}
        >
          {showSource ? "Visual" : "HTML"}
        </button>
        {!toolbarMountEl && toolbarTrailing}
      </div>
    </div>
  );

  const toolbarNode =
    toolbarMountEl === undefined ? (
      <div className="mb-2 flex w-full items-center gap-1 border-b border-(--color-tc-20) pb-2">
        {toolbar}
      </div>
    ) : toolbarMountEl ? (
      createPortal(toolbar, toolbarMountEl)
    ) : null;

  return (
    <div className={cn("min-w-0 flex-1", fillHeight && "flex min-h-0 flex-col")}>
      <div className={fillHeight ? "shrink-0" : undefined}>{toolbarNode}</div>

      {showSource ? (
        <textarea
          ref={sourceRef}
          value={source}
          onChange={(e) => {
            const next = e.target.value;
            setSource(next);
            lastEmittedHtmlRef.current = next;
            onChange(next);
          }}
          disabled={disabled}
          rows={fillHeight ? undefined : 4}
          className={cn(
            "w-full rounded-xl border border-(--color-tc-20) bg-(--color-nc-10) px-3 py-2 font-mono text-xs text-(--color-tc-40) outline-none focus:ring-2 focus:ring-(--color-primary)/20",
            fillHeight ? "min-h-0 flex-1 resize-none overflow-y-auto" : "min-h-[96px] resize-y",
            editorClassName
          )}
          placeholder="<p>Hello</p>"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable={!disabled}
          suppressContentEditableWarning
          onInput={syncHtml}
          data-placeholder={placeholder}
          className={cn(
            "overflow-y-auto px-2 py-1.5 text-sm leading-relaxed text-(--color-tc-40) outline-none empty:before:text-(--color-tc-30) empty:before:content-[attr(data-placeholder)] [&_a]:text-(--color-primary) [&_a]:underline [&_img]:my-2 [&_img]:max-w-full [&_img]:rounded-xl [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5",
            fillHeight ? "min-h-0 flex-1" : "min-h-[96px] max-h-36",
            editorClassName
          )}
        />
      )}
    </div>
  );
});

function WhatsAppEditor({
  value,
  onChange,
  placeholder,
  disabled,
  textareaRef,
  editorClassName,
  syncTextareaRef,
  toolbarTrailing,
  toolbarExtra,
  toolbarMountEl,
  fillHeight = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  textareaRef: React.MutableRefObject<HTMLTextAreaElement | null>;
  editorClassName?: string;
  syncTextareaRef?: (el: HTMLTextAreaElement | null) => void;
  toolbarTrailing?: ReactNode;
  toolbarExtra?: ReactNode;
  toolbarMountEl?: HTMLDivElement | null;
  fillHeight?: boolean;
}) {
  const applyWrap = (wrapper: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const { nextValue, nextSelectionStart, nextSelectionEnd } = wrapTextSelection(
      value,
      el.selectionStart,
      el.selectionEnd,
      wrapper
    );
    onChange(nextValue);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(nextSelectionStart, nextSelectionEnd);
    });
  };

  const toolbar = (
    <div className="flex w-full flex-wrap items-center gap-1">
      <ToolbarButton label="Bold" onClick={() => applyWrap("*")}>
        <Bold className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Italic" onClick={() => applyWrap("_")}>
        <Italic className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Strikethrough" onClick={() => applyWrap("~")}>
        <Strikethrough className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Monospace" onClick={() => applyWrap("```")}>
        <Code className="size-4" />
      </ToolbarButton>
      {toolbarExtra}
      <div className="ml-auto flex items-center gap-1">
        <span className="hidden text-[11px] text-(--color-tc-30) sm:inline">*bold* · _italic_ · ~strike~</span>
        {!toolbarMountEl && toolbarTrailing}
      </div>
    </div>
  );

  const toolbarNode =
    toolbarMountEl === undefined ? (
      <div className="mb-2 flex w-full items-center gap-1 border-b border-(--color-tc-20) pb-2">
        {toolbar}
      </div>
    ) : toolbarMountEl ? (
      createPortal(toolbar, toolbarMountEl)
    ) : null;

  return (
    <div className={cn("min-w-0 flex-1", fillHeight && "flex min-h-0 flex-col")}>
      <div className={fillHeight ? "shrink-0" : undefined}>{toolbarNode}</div>
      <textarea
        ref={(el) => {
          textareaRef.current = el;
          syncTextareaRef?.(el);
        }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        rows={fillHeight ? undefined : 3}
        className={cn(
          "w-full resize-none border-0 bg-transparent px-2 py-1.5 text-sm leading-relaxed text-(--color-tc-40) outline-none placeholder:text-(--color-tc-30) disabled:cursor-not-allowed disabled:opacity-50",
          fillHeight ? "min-h-0 flex-1 overflow-y-auto" : "max-h-36 min-h-[72px]",
          editorClassName
        )}
      />
    </div>
  );
}

export type PendingMessageMedia = {
  id: string;
  url: string;
  filename: string;
};

export type MessageRichComposeHandle = {
  getMediaUrls: () => string[];
  setMediaUrls: (urls: string[]) => void;
  clearMedia: () => void;
  flushDraft: () => void;
};

export type MessageRichComposeProps = {
  channel: Channel;
  plainValue: string;
  htmlValue: string;
  onPlainChange: (value: string) => void;
  onHtmlChange: (value: string) => void;
  onSend?: () => void;
  sending?: boolean;
  disabled?: boolean;
  leadingSlot?: ReactNode;
  trailingSlot?: ReactNode;
  placeholder?: string;
  showSendButton?: boolean;
  editorClassName?: string;
  emailEditorRef?: React.Ref<EmailRichEditorHandle>;
  plainTextareaRef?: React.MutableRefObject<HTMLTextAreaElement | null>;
  enableImageAttachments?: boolean;
  onUploadImage?: (file: File) => Promise<string>;
  onAttachmentError?: (message: string) => void;
  headerActions?: ReactNode;
  className?: string;
  fillHeight?: boolean;
};

const MessageRichCompose = forwardRef<MessageRichComposeHandle, MessageRichComposeProps>(
  function MessageRichCompose(
    {
      channel,
      plainValue,
      htmlValue,
      onPlainChange,
      onHtmlChange,
      onSend,
      sending = false,
      disabled = false,
      leadingSlot,
      trailingSlot,
      placeholder = "Type a message…",
      showSendButton = true,
      editorClassName,
      emailEditorRef,
      plainTextareaRef,
      enableImageAttachments = false,
      onUploadImage,
      onAttachmentError,
      headerActions,
      className,
      fillHeight = false,
    },
    ref
  ) {
  const smsRef = useRef<HTMLTextAreaElement>(null);
  const whatsappRef = useRef<HTMLTextAreaElement>(null);
  const localEmailRef = useRef<EmailRichEditorHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaItems, setMediaItems] = useState<PendingMessageMedia[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const assignEmailEditorRef = useCallback(
    (instance: EmailRichEditorHandle | null) => {
      localEmailRef.current = instance;
      if (typeof emailEditorRef === "function") {
        emailEditorRef(instance);
      } else if (emailEditorRef) {
        (emailEditorRef as React.MutableRefObject<EmailRichEditorHandle | null>).current =
          instance;
      }
    },
    [emailEditorRef]
  );

  const assignPlainTextareaRef = (el: HTMLTextAreaElement | null) => {
    if (plainTextareaRef) plainTextareaRef.current = el;
  };

  useImperativeHandle(
    ref,
    () => ({
      getMediaUrls: () => mediaItems.map((item) => item.url),
      setMediaUrls: (urls) => {
        setMediaItems(
          urls.map((url) => ({
            id: url,
            url,
            filename: url.split("/").pop() ?? "image",
          }))
        );
      },
      clearMedia: () => setMediaItems([]),
      flushDraft: () => {
        if (channel === "EMAIL") {
          onHtmlChange(localEmailRef.current?.getHtml() ?? "");
        } else {
          const el = channel === "WHATSAPP" ? whatsappRef.current : smsRef.current;
          if (el) onPlainChange(el.value);
        }
      },
    }),
    [channel, mediaItems, onHtmlChange, onPlainChange]
  );

  const hasEmailContent =
    htmlToPlainText(htmlValue).trim().length > 0 ||
    /<img[\s>]/i.test(htmlValue) ||
    mediaItems.length > 0;
  const hasPlainContent =
    plainValue.trim().length > 0 || (channel === "WHATSAPP" && mediaItems.length > 0);

  useEffect(() => {
    if (channel === "SMS") {
      setMediaItems([]);
    }
  }, [channel]);

  const canSend =
    showSendButton &&
    onSend &&
    (channel === "EMAIL" ? hasEmailContent : hasPlainContent) &&
    !sending &&
    !disabled &&
    !uploadingImages;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && channel !== "EMAIL" && onSend) {
      event.preventDefault();
      if (canSend) onSend();
    }
  };

  const attachedImageCount = mediaItems.length;

  async function handleImageSelection(files: FileList | null) {
    if (!files?.length || !onUploadImage) return;

    const remaining = MAX_MESSAGE_MEDIA_ATTACHMENTS - attachedImageCount;
    if (remaining <= 0) {
      onAttachmentError?.(`You can attach up to ${MAX_MESSAGE_MEDIA_ATTACHMENTS} images.`);
      return;
    }

    setUploadingImages(true);
    try {
      for (const file of Array.from(files).slice(0, remaining)) {
        const validationError = validateMessageMediaFile(file);
        if (validationError) {
          onAttachmentError?.(validationError);
          continue;
        }

        const url = await onUploadImage(file);
        if (channel === "EMAIL" || channel === "WHATSAPP") {
          setMediaItems((prev) => [
            ...prev,
            { id: crypto.randomUUID(), url, filename: file.name },
          ]);
        }
      }
    } catch (e) {
      onAttachmentError?.(e instanceof Error ? e.message : "Image upload failed");
    } finally {
      setUploadingImages(false);
    }
  }

  function removeMediaItem(id: string) {
    setMediaItems((prev) => prev.filter((item) => item.id !== id));
  }

  const showAttachButton =
    enableImageAttachments && Boolean(onUploadImage) && channel !== "SMS";
  const [toolbarMountEl, setToolbarMountEl] = useState<HTMLDivElement | null>(null);
  const useSplitToolbar =
    Boolean(headerActions) && (channel === "EMAIL" || channel === "WHATSAPP");

  const attachToolbarButton = showAttachButton ? (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(event) => {
          void handleImageSelection(event.target.files);
          event.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={
          disabled ||
          sending ||
          uploadingImages ||
          attachedImageCount >= MAX_MESSAGE_MEDIA_ATTACHMENTS
        }
        aria-label={channel === "EMAIL" ? "Attach file" : "Attach image"}
        title={channel === "EMAIL" ? "Attach file" : "Attach image"}
        className="flex size-8 items-center justify-center rounded-lg text-(--color-tc-30) transition hover:bg-(--color-nc-10) hover:text-(--color-tc-40) disabled:cursor-not-allowed disabled:opacity-50"
      >
        {uploadingImages ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <ImagePlus className="size-4" aria-hidden />
        )}
      </button>
    </>
  ) : null;

  return (
    <div
      className={cn(
        "rounded-2xl border border-(--color-tc-20) bg-white px-2 py-2 shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition focus-within:border-(--color-primary)/50 focus-within:ring-2 focus-within:ring-(--color-primary)/20",
        fillHeight && "flex min-h-0 flex-1 flex-col",
        className
      )}
    >
      {(channel === "EMAIL" || channel === "WHATSAPP") && mediaItems.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2 px-1">
          {mediaItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 rounded-xl border border-(--color-tc-20) bg-(--color-nc-10) px-2 py-1.5 text-xs text-(--color-tc-40)"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt="" className="size-8 rounded-lg object-cover" />
              <span className="max-w-[120px] truncate">{item.filename}</span>
              <button
                type="button"
                onClick={() => removeMediaItem(item.id)}
                className="rounded-md p-0.5 text-(--color-tc-30) transition hover:bg-white hover:text-(--color-tc-40)"
                aria-label={`Remove ${item.filename}`}
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </div>
          ))}
        </div>
      )}

      {useSplitToolbar && (
        <div className="mb-2 flex w-full items-center gap-1 border-b border-(--color-tc-20) pb-2">
          <div
            ref={setToolbarMountEl}
            className="flex min-w-0 flex-1 items-center gap-1"
          />
          <div className="flex shrink-0 items-center gap-0.5">{headerActions}</div>
        </div>
      )}

      {channel === "SMS" && headerActions && (
        <div className="mb-2 flex w-full items-center justify-end gap-0.5 border-b border-(--color-tc-20) pb-2">
          {headerActions}
        </div>
      )}

      <div
        className={cn(
          "flex gap-1.5",
          fillHeight ? "min-h-0 flex-1 items-stretch" : "items-end"
        )}
      >
        {channel === "EMAIL" ? (
          <EmailRichEditor
            ref={assignEmailEditorRef}
            html={htmlValue}
            onChange={onHtmlChange}
            placeholder={placeholder}
            disabled={disabled || sending || uploadingImages}
            editorClassName={editorClassName}
            toolbarTrailing={useSplitToolbar ? undefined : headerActions}
            toolbarExtra={attachToolbarButton}
            toolbarMountEl={useSplitToolbar ? toolbarMountEl : undefined}
            fillHeight={fillHeight}
          />
        ) : channel === "WHATSAPP" ? (
          <WhatsAppEditor
            value={plainValue}
            onChange={onPlainChange}
            placeholder={placeholder}
            disabled={disabled || sending || uploadingImages}
            textareaRef={whatsappRef}
            editorClassName={editorClassName}
            syncTextareaRef={assignPlainTextareaRef}
            toolbarTrailing={useSplitToolbar ? undefined : headerActions}
            toolbarExtra={attachToolbarButton}
            toolbarMountEl={useSplitToolbar ? toolbarMountEl : undefined}
            fillHeight={fillHeight}
          />
        ) : (
          <div className={cn("min-w-0 flex-1", fillHeight && "flex min-h-0 flex-col")}>
            <textarea
              ref={(el) => {
                smsRef.current = el;
                assignPlainTextareaRef(el);
              }}
              value={plainValue}
              onChange={(e) => onPlainChange(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled || sending || uploadingImages}
              placeholder={placeholder}
              rows={fillHeight ? undefined : 3}
              className={cn(
                "w-full resize-none border-0 bg-transparent px-2 py-1.5 text-sm leading-relaxed text-(--color-tc-40) outline-none placeholder:text-(--color-tc-30) disabled:cursor-not-allowed disabled:opacity-50",
                fillHeight ? "min-h-0 flex-1 overflow-y-auto" : "max-h-36 min-h-[72px]",
                editorClassName
              )}
            />
          </div>
        )}

        <div
          className={cn(
            "flex shrink-0 gap-1.5",
            fillHeight ? "flex-col justify-end self-end pb-1" : "items-end"
          )}
        >
        {trailingSlot}

        {showSendButton && onSend && (
          <button
            type="button"
            onClick={onSend}
            disabled={!canSend}
            aria-label={sending ? "Sending message" : "Send message"}
            className={cn(
              "mb-1 flex size-9 shrink-0 items-center justify-center rounded-xl transition",
              canSend
                ? "bg-(--color-primary) text-white shadow-sm hover:opacity-90 active:scale-[0.97]"
                : "cursor-not-allowed bg-(--color-nc-10) text-(--color-tc-30)"
            )}
          >
            {sending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Send className="size-4 translate-x-px" aria-hidden />
            )}
          </button>
        )}
        </div>
      </div>
    </div>
  );
});

export default MessageRichCompose;

export function getEmailPayload(htmlValue: string) {
  const html = sanitizeEmailHtml(htmlValue);
  const plain = htmlToPlainText(html);
  return { html, plain };
}

export function initEmailHtmlFromPlain(plain: string) {
  return plain.trim() ? plainTextToHtml(plain) : "";
}
