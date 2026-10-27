import { NextResponse } from "next/server";

import type { NextFetchEvent, NextRequest } from "next/server";

import { detectCrawler, recordCrawl, type CrawlKind } from "@/lib/ai-crawlers";
import { markdownPath, siteConfig } from "@/lib/page-metadata";
import { isPublicPagePath } from "@/lib/public-paths";

const RESOURCE_KINDS: Record<string, CrawlKind> = {
  "/llms.txt": "llms.txt",
  "/robots.txt": "robots.txt",
  "/sitemap.xml": "sitemap",
};

/** q-value of a media type in an Accept header, or 0 when it isn't listed. */
function acceptWeight(accept: string, type: string): number {
  for (const part of accept.toLowerCase().split(",")) {
    const [media, ...params] = part.trim().split(";");
    if (media.trim() !== type) continue;
    const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
    return q ? Number(q.slice(2)) || 0 : 1;
  }
  return 0;
}

/** An agent that lists `text/markdown` at least as high as `text/html` gets the Markdown twin. */
function prefersMarkdown(accept: string | null): boolean {
  if (!accept) return false;
  const markdown = acceptWeight(accept, "text/markdown");
  return markdown > 0 && markdown >= acceptWeight(accept, "text/html");
}

function markdownRoute(pagePath: string): string {
  return pagePath === "/" ? "/md" : `/md${pagePath}`;
}

export function proxy(request: NextRequest, event: NextFetchEvent) {

  const requestHeaders = new Headers(request.headers);

  const pathname = request.nextUrl.pathname;

  const crawler = detectCrawler(request.headers.get("user-agent"));

  if (pathname.endsWith(".md")) {
    const withoutExt = pathname.slice(0, -3);
    const url = request.nextUrl.clone();
    url.pathname = withoutExt === "/index" ? "/md" : markdownRoute(withoutExt || "/");
    if (crawler) event.waitUntil(recordCrawl(crawler, { path: pathname, kind: "markdown" }));
    return NextResponse.rewrite(url);
  }

  const pagePath = pathname.replace(/\/$/, "") || "/";
  const isPublicPage = isPublicPagePath(pagePath);

  if (isPublicPage && prefersMarkdown(request.headers.get("accept"))) {
    const url = request.nextUrl.clone();
    url.pathname = markdownRoute(pagePath);
    if (crawler) event.waitUntil(recordCrawl(crawler, { path: pathname, kind: "negotiated" }));
    requestHeaders.set("x-markdown-negotiated", "1");
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  if (crawler && (isPublicPage || RESOURCE_KINDS[pathname])) {
    event.waitUntil(recordCrawl(crawler, { path: pathname, kind: RESOURCE_KINDS[pathname] ?? "html" }));
  }

  const hideSiteChrome =

    pathname.startsWith("/studio") || pathname.startsWith("/crm");



  requestHeaders.set(

    "x-rosecrest-hide-site-chrome",

    hideSiteChrome ? "1" : "0"

  );

  requestHeaders.set("x-pathname", pathname);



  const isPublicCrmAuthRoute =
    pathname.startsWith("/crm/login") ||
    pathname.startsWith("/crm/forgot-password") ||
    pathname.startsWith("/crm/reset-password") ||
    pathname.startsWith("/crm/accept-invite");

  const isPublicCrmDocsRoute = pathname.startsWith("/crm/documentation");

  if (pathname.startsWith("/crm") && !isPublicCrmAuthRoute && !isPublicCrmDocsRoute) {

    const token = request.cookies.get("crm_session")?.value;

    if (!token) {

      const loginUrl = new URL("/crm/login", request.url);

      loginUrl.searchParams.set("redirect", pathname);

      return NextResponse.redirect(loginUrl);

    }

  }



  if (isPublicCrmAuthRoute) {

    const token = request.cookies.get("crm_session")?.value;

    if (token) {

      return NextResponse.redirect(new URL("/crm", request.url));

    }

  }



  const response = NextResponse.next({

    request: { headers: requestHeaders },

  });

  if (isPublicPage) {
    response.headers.append(
      "Link",
      `<${siteConfig.url}${markdownPath(pagePath)}>; rel="alternate"; type="text/markdown"`,
    );
  }

  return response;

}



export const config = {

  matcher: [

    "/((?!api|_next/static|_next/image|favicon.ico).*)",

  ],

};

