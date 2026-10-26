import { siteConfig } from "@/lib/page-metadata";

const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
] as const;

// A crawler that matches its own group ignores `*`, so every group repeats the rules.
const RULES = [
  "Allow: /",
  "Allow: /api/ai",
  "Disallow: /api/",
  "Disallow: /crm",
  "Disallow: /studio",
  "Disallow: /thank-you",
];

export const dynamic = "force-static";

export function GET() {
  const siteUrl = siteConfig.url;

  const lines = [
    "User-agent: *",
    ...RULES,
    "",
    ...AI_CRAWLERS.flatMap((userAgent) => [`User-agent: ${userAgent}`, ...RULES, ""]),
    "# llms.txt: structured site index for AI systems",
    `# ${siteUrl}/llms.txt`,
    `# Markdown twins: append .md to any public URL (home is ${siteUrl}/index.md)`,
    `# Service catalog (JSON): ${siteUrl}/api/ai`,
    "",
    `Sitemap: ${siteUrl}/sitemap.xml`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
