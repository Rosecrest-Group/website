import { sanityFetch } from "@/sanity/lib/client";
import { postIndexQuery } from "@/sanity/lib/queries";
import { guides } from "@/lib/guides";
import { pageMetadata } from "@/lib/page-metadata";

export type BlogPostSummary = {
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt?: string;
  _updatedAt?: string;
};

/** Every indexable path that isn't a blog post. */
export function staticPublicPaths(): string[] {
  return [
    ...Object.keys(pageMetadata),
    ...guides.map((guide) => `/guides/${guide.slug}`),
  ];
}

export async function getBlogPosts(): Promise<BlogPostSummary[]> {
  try {
    return (await sanityFetch<BlogPostSummary[]>(postIndexQuery)) ?? [];
  } catch {
    return [];
  }
}
