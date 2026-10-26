import type { MetadataRoute } from "next";
import { guides } from "@/lib/guides";
import { absoluteUrl } from "@/lib/page-metadata";
import { getBlogPosts, staticPublicPaths } from "@/lib/site-index";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const guideUpdated = new Map(guides.map((guide) => [`/guides/${guide.slug}`, guide.updated]));

  const pages = staticPublicPaths().map((path) => ({
    url: absoluteUrl(path),
    lastModified: guideUpdated.has(path) ? new Date(guideUpdated.get(path)!) : now,
  }));

  const posts = (await getBlogPosts()).map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: new Date(post._updatedAt ?? post.publishedAt ?? now),
  }));

  return [...pages, ...posts];
}
