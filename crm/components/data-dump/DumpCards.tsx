import {
  SalesIgniterRichContent,
  isEmailPreviewStub,
} from "@/crm/lib/salesIgniterContent";
import type { SalesIgniterMessage, SalesIgniterNote } from "@/crm/types";
import { formatMessageType } from "@/crm/components/data-dump/shared";
import { isOpportunityActivityMessage } from "@/crm/components/data-dump/opportunityLink";
import { cn } from "@/lib/utils";

export function DumpNoteCard({ note }: { note: SalesIgniterNote }) {
  return (
    <article className="rounded-xl border border-(--color-tc-20) bg-white px-4 py-3">
      <header className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-(--color-tc-30)">
        <span className="font-medium text-(--color-tc-40)">{note.title?.trim() || "Note"}</span>
        <time>{note.dateAdded ? new Date(note.dateAdded).toLocaleString("en-GB") : "—"}</time>
      </header>
      <SalesIgniterRichContent body={note.body} compact />
    </article>
  );
}

export function DumpMessageCard({
  message,
  onOpenOpportunity,
}: {
  message: SalesIgniterMessage;
  onOpenOpportunity?: (message: SalesIgniterMessage) => void;
}) {
  const recipients = Array.isArray(message.to)
    ? message.to.join(", ")
    : message.to?.trim() || null;
  const showPreviewHint =
    message.emailHydrated === false ||
    (isEmailPreviewStub(message.body) && !message.html?.trim());
  const isOpportunityActivity = isOpportunityActivityMessage(message);
  const canOpenOpportunity = isOpportunityActivity && onOpenOpportunity;

  const content = (
    <>
      <header className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-(--color-tc-30)">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-(--color-tc-40)">
            {formatMessageType(message)}
          </span>
          {message.direction ? <span>{message.direction}</span> : null}
          {message.status ? <span>{message.status}</span> : null}
        </div>
        <time>{message.dateAdded ? new Date(message.dateAdded).toLocaleString("en-GB") : "—"}</time>
      </header>

      {message.subject ? (
        <p className="mb-2 text-sm font-medium text-(--color-tc-40)">{message.subject}</p>
      ) : null}

      {message.from || recipients ? (
        <div className="mb-2 space-y-0.5 text-xs text-(--color-tc-30)">
          {message.from ? <p>From: {message.from}</p> : null}
          {recipients ? <p>To: {recipients}</p> : null}
        </div>
      ) : null}

      <SalesIgniterRichContent body={message.body} html={message.html} compact />

      {canOpenOpportunity ? (
        <p className="mt-3 text-xs font-medium text-(--color-primary)">View opportunity details →</p>
      ) : null}

      {showPreviewHint ? (
        <p className="mt-2 text-xs text-amber-800">
          Full email body could not be loaded from Sales Igniter. The preview link above may still
          open the original message.
        </p>
      ) : null}

      {message.attachments && message.attachments.length > 0 ? (
        <ul className="mt-2 space-y-1 text-xs">
          {message.attachments.map((url) => (
            <li key={url}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-(--color-primary) underline underline-offset-2"
              >
                Attachment
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );

  if (canOpenOpportunity) {
    return (
      <button
        type="button"
        onClick={() => onOpenOpportunity(message)}
        className={cn(
          "w-full rounded-xl border border-(--color-tc-20) bg-white px-4 py-3 text-left transition",
          "cursor-pointer hover:border-(--color-primary)/30 hover:bg-slate-50"
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <article className="rounded-xl border border-(--color-tc-20) bg-white px-4 py-3">
      {content}
    </article>
  );
}
