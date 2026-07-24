import { linkifyText } from "@/crm/lib/formatMessageBody";
import { htmlToPlainText, isHtmlContent, sanitizeEmailHtml } from "@/crm/lib/messageFormatting";

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
};

export function SalesIgniterRichContent({ body, html, compact = false }: RichContentProps) {
  const linkClassName = "text-(--color-primary) underline underline-offset-2 hover:opacity-80";
  const source = html?.trim() || body?.trim() || "";

  if (!source) {
    return <span className="text-sm text-(--color-tc-30)">No content</span>;
  }

  if (isHtmlContent(source)) {
    return (
      <div
        className={
          compact
            ? "prose prose-sm max-w-none text-sm leading-relaxed prose-neutral [&_a]:text-(--color-primary) [&_img]:my-2 [&_img]:max-w-full [&_img]:rounded-lg"
            : "prose prose-sm max-w-none text-sm leading-relaxed prose-neutral [&_a]:text-(--color-primary) [&_img]:my-2 [&_img]:max-w-full [&_img]:rounded-lg"
        }
        dangerouslySetInnerHTML={{ __html: sanitizeEmailHtml(source) }}
      />
    );
  }

  if (isEmailPreviewStub(source)) {
    return (
      <div className="space-y-1 text-sm text-(--color-tc-40)">
        {formatPlainDumpText(source, linkClassName)}
      </div>
    );
  }

  return (
    <div className="whitespace-pre-wrap text-sm leading-relaxed text-(--color-tc-40)">
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
