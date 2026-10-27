import { sanityFetch } from "@/sanity/lib/client";
import { postIndexQuery } from "@/sanity/lib/queries";

export type BlogPostSummary = {
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt?: string;
  _updatedAt?: string;
};

export { staticPublicPaths } from "@/lib/public-paths";

export async function getBlogPosts(): Promise<BlogPostSummary[]> {
  try {
    return (await sanityFetch<BlogPostSummary[]>(postIndexQuery)) ?? [];
  } catch {
    return [];
  }
}
