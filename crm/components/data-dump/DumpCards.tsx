import { Mail, MessageSquare, Phone } from "lucide-react";
import {
  SalesIgniterRichContent,
  isEmailPreviewStub,
} from "@/crm/lib/salesIgniterContent";
import { formatChatTime, initialsFromName } from "@/crm/lib/formatChatTime";
import type { SalesIgniterMessage, SalesIgniterNote } from "@/crm/types";
import { formatMessageType } from "@/crm/components/data-dump/shared";
import { isOpportunityActivityMessage } from "@/crm/components/data-dump/opportunityLink";
import CurvedContainer from "@/crm/components/ui/CurvedContainer";
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

type DumpChannel = "EMAIL" | "SMS" | "WHATSAPP" | "CALL" | "OTHER";

function dumpMessageChannel(message: SalesIgniterMessage): DumpChannel {
  const raw = String(message.messageType ?? message.type ?? "").toUpperCase();
  if (raw.includes("EMAIL")) return "EMAIL";
  if (raw.includes("WHATSAPP")) return "WHATSAPP";
  if (raw.includes("CALL") || raw.includes("PHONE")) return "CALL";
  if (raw.includes("SMS") || raw.includes("TEXT")) return "SMS";
  return "OTHER";
}

function isDumpOutbound(message: SalesIgniterMessage): boolean {
  const direction = String(message.direction ?? "").toLowerCase();
  if (direction.includes("out") || direction === "outbound") return true;
  if (direction.includes("in") || direction === "inbound") return false;
  // Fall back: many SI activity types are agent-side
  const type = String(message.messageType ?? message.type ?? "").toUpperCase();
  if (type.includes("ACTIVITY")) return true;
  return false;
}

function channelIcon(channel: DumpChannel) {
  if (channel === "EMAIL") return Mail;
  if (channel === "WHATSAPP" || channel === "CALL") return Phone;
  return MessageSquare;
}

function channelLabel(channel: DumpChannel, message: SalesIgniterMessage): string {
  if (channel === "EMAIL") return "Email";
  if (channel === "WHATSAPP") return "WhatsApp";
  if (channel === "CALL") return "Call";
  if (channel === "SMS") return "SMS";
  return formatMessageType(message);
}

export function DumpMessageCard({
  message,
  customerName = "Contact",
  onOpenOpportunity,
}: {
  message: SalesIgniterMessage;
  customerName?: string;
  onOpenOpportunity?: (message: SalesIgniterMessage) => void;
}) {
  const isOutbound = isDumpOutbound(message);
  const channel = dumpMessageChannel(message);
  const ChannelIcon = channelIcon(channel);
  const authorName = isOutbound ? "Rosecrest" : customerName;
  const showPreviewHint =
    message.emailHydrated === false ||
    (isEmailPreviewStub(message.body) && !message.html?.trim());
  const isOpportunityActivity = isOpportunityActivityMessage(message);
  const canOpenOpportunity = isOpportunityActivity && onOpenOpportunity;
  const time = message.dateAdded ? formatChatTime(message.dateAdded) : "";

  const bubble = (
    <CurvedContainer
      variant={isOutbound ? "primary" : "white"}
      className={cn(
        "px-4 py-3",
        channel === "WHATSAPP" &&
          (isOutbound ? "bg-emerald-600" : "border-emerald-200 bg-emerald-50/70"),
        channel === "SMS" &&
          (isOutbound
            ? "border border-orange-200 bg-orange-100 text-orange-950 [&_a]:text-orange-800"
            : "border-orange-100 bg-orange-50/80"),
        channel === "EMAIL" &&
          (isOutbound
            ? "border border-indigo-200 bg-indigo-100 text-indigo-950 [&_a]:text-indigo-700"
            : "border-indigo-100 bg-indigo-50/80"),
        channel === "CALL" &&
          (isOutbound
            ? "border border-orange-100 bg-orange-50/40 text-(--color-tc-40)"
            : "border-orange-100 bg-orange-50/40"),
        isOutbound &&
          channel !== "SMS" &&
          channel !== "EMAIL" &&
          channel !== "CALL" &&
          "text-white [&_a]:text-white",
        !isOutbound && "text-(--color-tc-40)"
      )}
      showBorderAndShadow={!isOutbound}
    >
      {channel === "EMAIL" && message.subject ? (
        <p
          className={cn(
            "mb-2 border-b pb-2 text-sm font-semibold",
            isOutbound ? "border-indigo-200/80" : "border-(--color-tc-20)"
          )}
        >
          {message.subject}
        </p>
      ) : null}

      <SalesIgniterRichContent
        body={message.body}
        html={message.html}
        compact
        isOutbound={isOutbound}
        channel={channel}
      />

      {canOpenOpportunity ? (
        <p
          className={cn(
            "mt-3 text-xs font-medium",
            isOutbound && channel !== "EMAIL" && channel !== "SMS"
              ? "text-white/90"
              : "text-(--color-primary)"
          )}
        >
          View opportunity details →
        </p>
      ) : null}

      {showPreviewHint ? (
        <p
          className={cn(
            "mt-2 text-xs",
            isOutbound && channel === "EMAIL" ? "text-indigo-900/80" : "text-amber-800"
          )}
        >
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
                className={cn(
                  "underline underline-offset-2",
                  isOutbound && channel !== "EMAIL" && channel !== "SMS"
                    ? "text-white/90"
                    : "text-(--color-primary)"
                )}
              >
                Attachment
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </CurvedContainer>
  );

  return (
    <div className={cn("flex gap-2", isOutbound ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
          isOutbound ? "bg-(--color-primary) text-white" : "bg-(--color-nc-10) text-(--color-tc-40)"
        )}
        aria-hidden
      >
        {initialsFromName(authorName)}
      </div>

      <div
        className={cn(
          "flex min-w-0 max-w-[min(100%,36rem)] flex-col",
          isOutbound ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "mb-1 flex flex-wrap items-center gap-2 text-xs text-(--color-tc-30)",
            isOutbound && "justify-end"
          )}
        >
          <span className="font-medium text-(--color-tc-40)">{authorName}</span>
          <span
            className={cn(
              "inline-flex items-center gap-1",
              channel === "WHATSAPP" && "text-emerald-600",
              channel === "SMS" && "text-orange-500",
              channel === "EMAIL" && "text-indigo-500",
              channel === "CALL" && "text-orange-700"
            )}
          >
            <ChannelIcon className="size-3" aria-hidden />
            {channelLabel(channel, message)}
          </span>
          {time ? <span>{time}</span> : null}
          {message.status ? <span className="capitalize">{message.status.toLowerCase()}</span> : null}
        </div>

        {canOpenOpportunity ? (
          <button
            type="button"
            onClick={() => onOpenOpportunity(message)}
            className="w-full max-w-full cursor-pointer text-left transition hover:opacity-95"
          >
            {bubble}
          </button>
        ) : (
          bubble
        )}
      </div>
    </div>
  );
}
