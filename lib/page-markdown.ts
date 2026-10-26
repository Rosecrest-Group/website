import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import { EMAIL, PHONE } from "@/lib/constants";
import { absoluteUrl, markdownPath, siteConfig } from "@/lib/page-metadata";
import { staticPublicPaths } from "@/lib/site-index";

const BLOG_POST_PATH = /^\/blog\/[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** HTML path for a `/md/...` request, or null when it isn't a public page. */
export function resolveHtmlPath(segments: string[]): string | null {
  const parts = segments.map((segment) => segment.toLowerCase()).filter(Boolean);
  const path = parts.length === 0 || (parts.length === 1 && parts[0] === "index")
    ? "/"
    : `/${parts.join("/")}`;
  if (staticPublicPaths().includes(path) || BLOG_POST_PATH.test(path)) return path;
  return null;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function headValue(html: string, pattern: RegExp): string {
  const match = html.match(pattern);
  return match ? decodeEntities(match[1].trim()) : "";
}

function linkTarget(href: string): string | null {
  if (!href || href.startsWith("#") || href.startsWith("javascript:")) return null;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return href;
  if (href.startsWith("http")) return href;
  if (!href.startsWith("/")) return null;
  const [pathOnly] = href.split(/[?#]/);
  const clean = pathOnly.replace(/\/$/, "") || "/";
  if (staticPublicPaths().includes(clean) || BLOG_POST_PATH.test(clean)) {
    return `${siteConfig.url}${markdownPath(clean)}`;
  }
  return `${siteConfig.url}${href}`;
}

function createTurndown(): TurndownService {
  const service = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
  });
  service.use(gfm);
  service.addRule("links", {
    filter: "a",
    replacement: (content, node) => {
      const text = content.trim();
      const target = linkTarget((node as HTMLElement).getAttribute("href") ?? "");
      if (!text) return "";
      if (!target) return text;
      const [first, ...rest] = text.split(/\n+/).filter((line) => line.trim());
      if (rest.length === 0) return `[${text}](${target})`;
      const heading = first.match(/^#+\s+/)?.[0] ?? "";
      const label = first.slice(heading.length);
      return `\n\n${heading}[${label}](${target})\n\n${rest.join("\n\n")}\n\n`;
    },
  });
  service.addRule("caption", {
    filter: "caption",
    replacement: (content) => `\n\n${content.trim()}\n\n`,
  });
  // Rules added with addRule take precedence over the built-in image rule; remove() does not.
  service.addRule("drop", {
    filter: (node) =>
      [
        "script",
        "style",
        "noscript",
        "template",
        "iframe",
        "svg",
        "img",
        "picture",
        "video",
        "button",
        "form",
        "input",
        "select",
        "textarea",
        "label",
        "nav",
        "footer",
        "dialog",
      ].includes(node.nodeName.toLowerCase()),
    replacement: () => "",
  });
  return service;
}

function tidy(markdown: string): string {
  return markdown
    .split("\n")
    .map((line) => line.replace(/\s+$/, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function closingIndex(html: string, from: number, open: RegExp, close: string): number {
  const tags = new RegExp(`${open.source}|${close.replace(/[$/]/g, "\\$&")}`, "g");
  tags.lastIndex = from;
  let depth = 1;
  for (let match = tags.exec(html); match; match = tags.exec(html)) {
    depth += match[0] === close ? -1 : 1;
    if (depth === 0) return match.index;
  }
  return -1;
}

/**
 * Pages behind a `loading.tsx` stream their content into a hidden `<div id="S:n">` after `</main>`,
 * which React's `$RC` script swaps into the `<template id="B:n">` fallback in the browser.
 */
function inlineStreamedContent(html: string): string {
  let result = html;
  for (const [, boundaryId, segmentId] of html.matchAll(/\$RC\("([^"]+)","([^"]+)"\)/g)) {
    const segmentTag = `<div hidden id="${segmentId}">`;
    const segmentStart = result.indexOf(segmentTag);
    if (segmentStart === -1) continue;
    const contentStart = segmentStart + segmentTag.length;
    const segmentEnd = closingIndex(result, contentStart, /<div\b/, "</div>");
    if (segmentEnd === -1) continue;
    const content = result.slice(contentStart, segmentEnd);
    result = result.slice(0, segmentStart) + result.slice(segmentEnd + "</div>".length);

    const placeholder = `<template id="${boundaryId}"></template>`;
    const fallbackStart = result.indexOf(placeholder);
    if (fallbackStart === -1) continue;
    const fallbackEnd = closingIndex(
      result,
      fallbackStart + placeholder.length,
      /<!--\$[?!]?-->/,
      "<!--/$-->",
    );
    if (fallbackEnd === -1) continue;
    result = result.slice(0, fallbackStart) + content + result.slice(fallbackEnd);
  }
  return result;
}

function yamlString(value: string): string {
  return JSON.stringify(value);
}

/** Markdown for a public page, converted from its own server-rendered HTML. */
export async function renderPageMarkdown(path: string, origin: string): Promise<string | null> {
  const response = await fetch(`${origin}${path}`, {
    headers: { accept: "text/html" },
    next: { revalidate: 3600 },
  });
  if (!response.ok) return null;

  const html = inlineStreamedContent(await response.text());
  const main = html.match(/<main\b[^>]*>([\s\S]*)<\/main>/i)?.[1];
  if (!main) return null;

  const title = headValue(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const description = headValue(html, /<meta\s+name="description"\s+content="([^"]*)"/i);
  const body = tidy(createTurndown().turndown(main));

  return [
    "---",
    `title: ${yamlString(title)}`,
    ...(description ? [`description: ${yamlString(description)}`] : []),
    `url: ${absoluteUrl(path)}`,
    "---",
    "",
    body,
    "",
    "---",
    "",
    "## Contact Rosecrest Group Ltd",
    "",
    `- Request an inspection: ${siteConfig.url}${markdownPath("/request-inspection")}`,
    `- Phone: ${PHONE}`,
    `- Email: ${EMAIL}`,
    `- Site index for AI systems: ${siteConfig.url}/llms.txt`,
    "",
  ].join("\n");
}
