// ─────────────────────────────────────────────────────────────
// AI and search crawlers we want to see in the logs.
// Matched on the User-Agent only, so a hit is "claims to be", not verified by IP.
// `purpose`: training = model training, search = builds an AI/search index,
// user = fetched live because a person asked an assistant something.
// ─────────────────────────────────────────────────────────────

import { crmApiV1Url } from "@/config/api";

export type CrawlerPurpose = "training" | "search" | "user";

type Crawler = { token: string; operator: string; purpose: CrawlerPurpose };

const CRAWLERS: Crawler[] = [
  { token: "GPTBot", operator: "OpenAI", purpose: "training" },
  { token: "OAI-SearchBot", operator: "OpenAI", purpose: "search" },
  { token: "ChatGPT-User", operator: "OpenAI", purpose: "user" },
  { token: "ClaudeBot", operator: "Anthropic", purpose: "training" },
  { token: "Claude-SearchBot", operator: "Anthropic", purpose: "search" },
  { token: "Claude-User", operator: "Anthropic", purpose: "user" },
  { token: "anthropic-ai", operator: "Anthropic", purpose: "training" },
  { token: "PerplexityBot", operator: "Perplexity", purpose: "search" },
  { token: "Perplexity-User", operator: "Perplexity", purpose: "user" },
  { token: "Google-CloudVertexBot", operator: "Google", purpose: "user" },
  { token: "Googlebot", operator: "Google", purpose: "search" },
  { token: "bingbot", operator: "Microsoft", purpose: "search" },
  { token: "Applebot", operator: "Apple", purpose: "search" },
  { token: "Meta-ExternalAgent", operator: "Meta", purpose: "training" },
  { token: "Meta-ExternalFetcher", operator: "Meta", purpose: "user" },
  { token: "Amazonbot", operator: "Amazon", purpose: "search" },
  { token: "DuckAssistBot", operator: "DuckDuckGo", purpose: "user" },
  { token: "MistralAI-User", operator: "Mistral", purpose: "user" },
  { token: "CCBot", operator: "Common Crawl", purpose: "training" },
  { token: "Bytespider", operator: "ByteDance", purpose: "training" },
];

export type CrawlerMatch = { bot: string; operator: string; purpose: CrawlerPurpose };

export function detectCrawler(userAgent: string | null): CrawlerMatch | null {
  if (!userAgent) return null;
  const ua = userAgent.toLowerCase();
  const match = CRAWLERS.find((crawler) => ua.includes(crawler.token.toLowerCase()));
  return match ? { bot: match.token, operator: match.operator, purpose: match.purpose } : null;
}

/**
 * What the crawler fetched: `markdown` (a `.md` twin), `negotiated` (a page URL answered as
 * Markdown because of `Accept: text/markdown`), `html`, or a named resource.
 */
export type CrawlKind = "html" | "markdown" | "negotiated" | "llms.txt" | "robots.txt" | "sitemap" | "api";

/**
 * Writes one JSON log line per crawler hit (filter host logs on `ai_crawler`) and, when
 * AI_CRAWL_INGEST_SECRET is set, stores it in the CRM for the Analytics "AI crawlers" card.
 * Never throws. Callers hand the promise to `waitUntil`/`after` so the visitor isn't kept waiting.
 */
export async function recordCrawl(
  crawler: CrawlerMatch,
  hit: { path: string; kind: CrawlKind; query?: string },
): Promise<void> {
  const record = {
    bot: crawler.bot,
    operator: crawler.operator,
    purpose: crawler.purpose,
    kind: hit.kind,
    path: hit.path.slice(0, 512),
    ...(hit.query && { query: hit.query.slice(0, 512) }),
  };
  console.log(JSON.stringify({ event: "ai_crawler", ...record }));

  const secret = process.env.AI_CRAWL_INGEST_SECRET;
  if (!secret) return;
  try {
    const response = await fetch(`${crmApiV1Url()}/ai-crawls`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Ingest-Secret": secret },
      body: JSON.stringify(record),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) console.error("ai_crawler ingest failed:", response.status);
  } catch (error) {
    console.error("ai_crawler ingest failed:", error);
  }
}
