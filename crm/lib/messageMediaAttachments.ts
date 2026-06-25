export const MAX_MESSAGE_MEDIA_BYTES = 5 * 1024 * 1024;
export const MAX_MESSAGE_MEDIA_ATTACHMENTS = 5;

export const ALLOWED_MESSAGE_MEDIA_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const IMAGE_URL_RE = /^https?:\/\/.+\.(?:jpe?g|png|gif|webp)(?:\?.*)?$/i;

export function validateMessageMediaFile(file: File): string | null {
  if (!ALLOWED_MESSAGE_MEDIA_TYPES.has(file.type)) {
    return `${file.name}: only JPEG, PNG, WebP, and GIF images are supported`;
  }
  if (file.size <= 0 || file.size > MAX_MESSAGE_MEDIA_BYTES) {
    return `${file.name}: must be 5 MB or smaller`;
  }
  return null;
}

export function isImageMediaUrl(value: string): boolean {
  return IMAGE_URL_RE.test(value.trim());
}

export function parseTrailingMediaUrls(body: string): { text: string; mediaUrls: string[] } {
  const lines = body.split("\n");
  const mediaUrls: string[] = [];

  while (lines.length > 0) {
    const line = lines[lines.length - 1]?.trim() ?? "";
    if (!line || !isImageMediaUrl(line)) break;
    mediaUrls.unshift(line);
    lines.pop();
  }

  while (lines.length > 0 && lines[lines.length - 1]?.trim() === "") {
    lines.pop();
  }

  return { text: lines.join("\n"), mediaUrls };
}

export function mergeBodyWithMediaUrls(body: string, mediaUrls: string[]): string {
  const trimmed = body.trimEnd();
  if (mediaUrls.length === 0) return trimmed;
  return `${trimmed}${trimmed ? "\n\n" : ""}${mediaUrls.join("\n")}`;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Failed to read file"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function buildEmailImageHtml(url: string, alt: string): string {
  const safeAlt = alt.replace(/"/g, "&quot;");
  return `<p><img src="${url}" alt="${safeAlt}" style="max-width:100%;height:auto;border-radius:12px;" /></p>`;
}

export type EmailImagePreview = {
  url: string;
  alt: string;
};

export function extractEmailImages(html: string): EmailImagePreview[] {
  if (!html.trim() || typeof document === "undefined") return [];

  const div = document.createElement("div");
  div.innerHTML = html;
  const seen = new Set<string>();

  return Array.from(div.querySelectorAll("img"))
    .map((img) => ({
      url: img.getAttribute("src") ?? "",
      alt: img.getAttribute("alt") ?? "image",
    }))
    .filter((item) => {
      if (!item.url || seen.has(item.url)) return false;
      seen.add(item.url);
      return true;
    });
}

export function removeEmailImage(html: string, url: string): string {
  if (!html.trim() || typeof document === "undefined") return html;

  const div = document.createElement("div");
  div.innerHTML = html;

  for (const img of div.querySelectorAll("img")) {
    if (img.getAttribute("src") !== url) continue;
    const parent = img.parentElement;
    img.remove();
    if (parent?.tagName === "P" && !parent.textContent?.trim() && !parent.querySelector("img")) {
      parent.remove();
    }
  }

  return div.innerHTML.trim();
}

export function appendEmailImageHtml(html: string, url: string, alt: string): string {
  const fragment = buildEmailImageHtml(url, alt);
  const trimmed = html.trim();
  return trimmed ? `${trimmed}${fragment}` : fragment;
}
