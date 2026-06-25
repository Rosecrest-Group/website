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

export function isHtmlContent(body: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(body.trim());
}

export function sanitizeEmailHtml(html: string): string {
  return sanitizeHtml(html, EMAIL_SANITIZE_OPTIONS);
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
