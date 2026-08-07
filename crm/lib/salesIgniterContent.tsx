import { linkifyText } from "@/crm/lib/formatMessageBody";
import { htmlToPlainText, isHtmlContent, sanitizeEmailHtml } from "@/crm/lib/messageFormatting";
import { cn } from "@/lib/utils";

const BRACKET_URL_REGEX = /\[?(https?:\/\/[^\]\s<>]+)\]?/gi;
const EMAIL_PREVIEW_LABEL = /view this email in browser/i;

export function extractBracketUrls(text: string): string[] {
  const urls: string[] = [];
  for (const match of text.matchAll(BRACKET_URL_REGEX)) {
    const url = match[1]?.trim();
    if (url) urls.push(url);
  }
  return urls;
}

export function isEmailPreviewStub(body?: string): boolean {
  if (!body?.trim()) return false;
  return EMAIL_PREVIEW_LABEL.test(body) || /email-preview/i.test(body);
}

function formatPlainDumpText(text: string, linkClassName: string) {
  const lines = text.split(/\r?\n/);
  return lines.map((line, lineIndex) => {
    const bracketMatch = line.match(/^\[?(https?:\/\/[^\]\s]+)\]?$/i);
    if (bracketMatch) {
      const url = bracketMatch[1];
      return (
        <p key={lineIndex} className="mt-1">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClassName}
          >
            Open email preview
          </a>
        </p>
      );
    }

    if (EMAIL_PREVIEW_LABEL.test(line.trim()) && lines[lineIndex + 1]) {
      const nextUrl = extractBracketUrls(lines[lineIndex + 1] ?? "")[0];
      if (nextUrl) {
        return (
          <p key={lineIndex}>
            <a
              href={nextUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClassName}
            >
              View this email in browser
            </a>
          </p>
        );
      }
    }

    if (lineIndex > 0 && EMAIL_PREVIEW_LABEL.test(lines[lineIndex - 1]?.trim() ?? "")) {
      const url = extractBracketUrls(line)[0];
      if (url) return null;
    }

    return (
      <p key={lineIndex} className={lineIndex > 0 ? "mt-1" : undefined}>
        {linkifyText(line, linkClassName)}
      </p>
    );
  });
}

type RichContentProps = {
  body?: string;
  html?: string;
  compact?: boolean;
  isOutbound?: boolean;
  channel?: "EMAIL" | "SMS" | "WHATSAPP" | "CALL" | "OTHER";
};

export function SalesIgniterRichContent({
  body,
  html,
  compact = false,
  isOutbound = false,
  channel = "OTHER",
}: RichContentProps) {
  const linkClassName =
    isOutbound && channel !== "EMAIL" && channel !== "SMS"
      ? "underline underline-offset-2 opacity-90 hover:opacity-100"
      : channel === "EMAIL" && isOutbound
        ? "text-indigo-700 underline underline-offset-2 hover:opacity-80"
        : channel === "SMS" && isOutbound
          ? "text-orange-800 underline underline-offset-2 hover:opacity-80"
          : "text-(--color-primary) underline underline-offset-2 hover:opacity-80";
  const source = html?.trim() || body?.trim() || "";

  if (!source) {
    return <span className="text-sm opacity-70">No content</span>;
  }

  if (isHtmlContent(source)) {
    return (
      <div
        className={cn(
          "crm-email-body crm-email-body--thread text-sm leading-relaxed [&_a]:underline [&_img]:my-2 [&_img]:max-w-full [&_img]:rounded-xl",
          compact && "prose prose-sm max-w-none prose-neutral",
          isOutbound && channel === "EMAIL"
            ? "[&_a]:text-indigo-700"
            : "[&_a]:text-(--color-primary)"
        )}
        dangerouslySetInnerHTML={{ __html: sanitizeEmailHtml(source) }}
      />
    );
  }

  if (isEmailPreviewStub(source)) {
    return (
      <div className="space-y-1 text-sm">
        {formatPlainDumpText(source, linkClassName)}
      </div>
    );
  }

  return (
    <div className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed">
      {formatPlainDumpText(source, linkClassName)}
    </div>
  );
}

export function salesIgniterPreviewText(body?: string, html?: string): string {
  const source = html?.trim() || body?.trim() || "";
  if (!source) return "";
  if (isHtmlContent(source)) return htmlToPlainText(source);
  if (isEmailPreviewStub(source)) return "Email (preview link)";
  return source;
}
