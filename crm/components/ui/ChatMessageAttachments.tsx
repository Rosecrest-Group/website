"use client";

import { FileText } from "lucide-react";
import type { MessageAttachment } from "@/crm/types";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ChatMessageAttachments({
  attachments,
  isMine,
}: {
  attachments: MessageAttachment[];
  isMine: boolean;
}) {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {attachments.map((attachment) =>
        attachment.isImage ? (
          <a
            key={attachment.id}
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden rounded-xl"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={attachment.url}
              alt={attachment.filename}
              className="max-h-56 max-w-full rounded-xl object-cover"
            />
          </a>
        ) : (
          <a
            key={attachment.id}
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            download={attachment.filename}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition hover:opacity-90 ${
              isMine
                ? "border-white/30 bg-white/10 text-white"
                : "border-(--color-tc-20) bg-(--color-nc-10) text-(--color-tc-40)"
            }`}
          >
            <FileText className="size-4 shrink-0" aria-hidden />
            <span className="min-w-0 flex-1 truncate font-medium">{attachment.filename}</span>
            <span className={`shrink-0 text-xs ${isMine ? "text-white/80" : "text-(--color-tc-30)"}`}>
              {formatFileSize(attachment.sizeBytes)}
            </span>
          </a>
        )
      )}
    </div>
  );
}
