import sanitizeHtml from "sanitize-html";

const EMAIL_ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "a",
  "blockquote",
  "h1",
  "h2",
  "h3",
  "span",
  "div",
  "img",
];

const EMAIL_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: EMAIL_ALLOWED_TAGS,
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height", "style"],
    "*": ["style"],
  },
};

/** Thread bubbles: semantic markup only — no layout styles that fight the chat column. */
const THREAD_EMAIL_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: EMAIL_ALLOWED_TAGS,
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt"],
  },
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
  },
};

export function isHtmlContent(body: string): boolean {
  // Require a real HTML tag — plain-text emails often include <https://...> angle brackets.
  return /<\/?(?:p|div|br|span|strong|b|em|i|u|s|ul|ol|li|a|h[1-6]|table|thead|tbody|tr|td|th|blockquote|img|html|body|font|center)\b/i.test(
    body.trim()
  );
}

export function sanitizeEmailHtml(html: string): string {
  return sanitizeHtml(html, EMAIL_SANITIZE_OPTIONS);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function linkifyEscaped(text: string): string {
  return text.replace(
    /(https?:\/\/[^\s<]+[^\s<.,;:!?)}\]'"])/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );
}

function quoteDepth(line: string): { depth: number; rest: string } {
  let depth = 0;
  let rest = line;
  while (/^\s*>/.test(rest)) {
    rest = rest.replace(/^\s*>\s?/, "");
    depth += 1;
  }
  return { depth, rest };
}

/**
 * Recover plain-text email replies whose newlines were collapsed to spaces
 * (common after HTML→text stripping), so `> quoted` lines become real lines again.
 */
function recoverCollapsedPlainTextEmail(text: string): string {
  if (/\n/.test(text)) return text;
  if (!/(?:^|\s)>{1,2}\s/.test(text)) return text;
  // Only re-break on quote markers — do not split `> • item` apart.
  return text.replace(/\s+(>{1,2})(?=\s|$)/g, "\n$1");
}

/** Format plain-text / quoted email replies for readable thread bubbles. */
export function plainTextEmailToHtml(text: string): string {
  let normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  normalized = recoverCollapsedPlainTextEmail(normalized);

  const lines = normalized.split("\n");
  const blocks: string[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let quoteBuffer: { depth: number; lines: string[] } | null = null;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(`<p>${paragraph.map(linkifyEscaped).join("<br>")}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!listItems.length) return;
    blocks.push(`<ul>${listItems.map((item) => `<li>${linkifyEscaped(item)}</li>`).join("")}</ul>`);
    listItems = [];
  };

  const flushQuote = () => {
    if (!quoteBuffer) return;
    const inner = quoteBuffer.lines.map(linkifyEscaped).join("<br>");
    let html = `<p>${inner || "<br>"}</p>`;
    for (let d = 0; d < quoteBuffer.depth; d++) {
      html = `<blockquote>${html}</blockquote>`;
    }
    blocks.push(html);
    quoteBuffer = null;
  };

  for (const rawLine of lines) {
    const { depth, rest } = quoteDepth(rawLine);
    const trimmed = rest.trim();

    if (depth > 0) {
      flushParagraph();
      flushList();
      if (quoteBuffer && quoteBuffer.depth === depth) {
        quoteBuffer.lines.push(escapeHtml(rest));
      } else {
        flushQuote();
        quoteBuffer = { depth, lines: [escapeHtml(rest)] };
      }
      continue;
    }

    flushQuote();

    if (!trimmed) {
      flushList();
      flushParagraph();
      continue;
    }

    const bullet = trimmed.match(/^[•·\-*]\s+(.*)$/);
    if (bullet) {
      flushParagraph();
      listItems.push(escapeHtml(bullet[1] ?? ""));
      continue;
    }

    flushList();
    paragraph.push(escapeHtml(rest));
  }

  flushQuote();
  flushList();
  flushParagraph();

  return blocks.join("") || "<p></p>";
}

/**
 * Normalize email HTML for chat-thread bubbles.
 * Contenteditable often emits <div> lines; inbound plain-text replies need quote/list formatting.
 */
export function prepareEmailHtmlForThread(body: string): string {
  if (!isHtmlContent(body)) {
    return plainTextEmailToHtml(body);
  }

  let html = sanitizeHtml(body, THREAD_EMAIL_SANITIZE_OPTIONS);

  // Contenteditable / marketing wrappers → paragraphs
  html = html.replace(/<div(\s[^>]*)?>/gi, "<p>").replace(/<\/div>/gi, "</p>");

  // Flatten accidental nested paragraphs from wrapper conversion
  for (let i = 0; i < 4; i++) {
    const next = html.replace(/<p>\s*<p>/gi, "<p>").replace(/<\/p>\s*<\/p>/gi, "</p>");
    if (next === html) break;
    html = next;
  }

  // Blank contenteditable lines → soft breaks instead of empty blocks
  html = html.replace(/<p>\s*(?:&nbsp;|\u00a0|\s|<br\s*\/?\s*>)*\s*<\/p>/gi, "<br>");

  // Keep at most one blank line between blocks
  html = html.replace(/(?:<br\s*\/?\s*>\s*){3,}/gi, "<br><br>");

  return html.trim() || "<p></p>";
}

export function htmlToPlainText(html: string): string {
  const sanitized = sanitizeEmailHtml(html);
  if (typeof document !== "undefined") {
    const div = document.createElement("div");
    div.innerHTML = sanitized;
    return (div.textContent ?? div.innerText ?? "").replace(/\u00a0/g, " ").trim();
  }
  return sanitized
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function plainTextToHtml(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export type WhatsAppSegment =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "italic"; value: string }
  | { type: "strike"; value: string }
  | { type: "mono"; value: string };

export function parseWhatsAppFormatting(text: string): WhatsAppSegment[] {
  const pattern = /(\*[^*\n]+\*|_[^_\n]+_|~[^~\n]+~|```[^`\n]+```)/g;
  const segments: WhatsAppSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, index) });
    }

    const token = match[0];
    if (token.startsWith("*")) {
      segments.push({ type: "bold", value: token.slice(1, -1) });
    } else if (token.startsWith("_")) {
      segments.push({ type: "italic", value: token.slice(1, -1) });
    } else if (token.startsWith("~")) {
      segments.push({ type: "strike", value: token.slice(1, -1) });
    } else if (token.startsWith("```")) {
      segments.push({ type: "mono", value: token.slice(3, -3) });
    }

    lastIndex = index + token.length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: "text", value: text }];
}

export function wrapTextSelection(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  wrapper: string
): { nextValue: string; nextSelectionStart: number; nextSelectionEnd: number } {
  if (selectionStart === selectionEnd) {
    const nextValue = `${value.slice(0, selectionStart)}${wrapper}${wrapper}${value.slice(selectionEnd)}`;
    const cursor = selectionStart + wrapper.length;
    return { nextValue, nextSelectionStart: cursor, nextSelectionEnd: cursor };
  }

  const selected = value.slice(selectionStart, selectionEnd);
  const nextValue = `${value.slice(0, selectionStart)}${wrapper}${selected}${wrapper}${value.slice(selectionEnd)}`;
  return {
    nextValue,
    nextSelectionStart: selectionStart + wrapper.length,
    nextSelectionEnd: selectionEnd + wrapper.length,
  };
}
