import { absoluteUrl } from "@/lib/page-metadata";
import { renderPageMarkdown, resolveHtmlPath } from "@/lib/page-markdown";

function notFound() {
  return new Response("Not found\n", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await context.params;
  const htmlPath = resolveHtmlPath(path ?? []);
  if (!htmlPath) return notFound();

  const body = await renderPageMarkdown(htmlPath, new URL(request.url).origin);
  if (!body) return notFound();

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      Link: `<${absoluteUrl(htmlPath)}>; rel="canonical"`,
    },
  });
}
