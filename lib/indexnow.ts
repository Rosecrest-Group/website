import { absoluteUrl, siteConfig } from "@/lib/page-metadata";

// ─────────────────────────────────────────────────────────────
// IndexNow tells Bing (which grounds Copilot and much of ChatGPT search),
// Yandex, Seznam and Naver that a URL changed, instead of waiting for a recrawl.
// The key is public by design: it must match public/<key>.txt on the live site.
// ─────────────────────────────────────────────────────────────

export const INDEXNOW_KEY = "29b092d607ab5a9f831047a2a7c3a7e7";
const ENDPOINT = "https://api.indexnow.org/indexnow";

export type IndexNowResult = { submitted: number; status?: number; skipped?: string };

/** Submits site paths (or absolute site URLs). 200 and 202 both mean accepted. */
export async function submitToIndexNow(
  pathsOrUrls: string[],
  options: { dryRun?: boolean } = {},
): Promise<IndexNowResult> {
  const urlList = [
    ...new Set(pathsOrUrls.map((p) => (p.startsWith("http") ? p : absoluteUrl(p)))),
  ].filter((url) => url.startsWith(siteConfig.url));
  if (urlList.length === 0) return { submitted: 0, skipped: "no URLs on this site" };
  if (options.dryRun) return { submitted: urlList.length, skipped: "dry run" };

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: new URL(siteConfig.url).host,
      key: INDEXNOW_KEY,
      keyLocation: `${siteConfig.url}/${INDEXNOW_KEY}.txt`,
      urlList,
    }),
  });
  return { submitted: urlList.length, status: response.status };
}
