import { guides } from "@/lib/guides";
import { pageMetadata } from "@/lib/page-metadata";

// Kept free of Sanity and other heavy imports so `proxy.ts` can use it on every request.

export const BLOG_POST_PATH = /^\/blog\/[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Every indexable path that isn't a blog post. */
export function staticPublicPaths(): string[] {
  return [
    ...Object.keys(pageMetadata),
    ...guides.map((guide) => `/guides/${guide.slug}`),
  ];
}

/** True for a public page that has a Markdown twin. Expects no trailing slash (except `/`). */
export function isPublicPagePath(path: string): boolean {
  return staticPublicPaths().includes(path) || BLOG_POST_PATH.test(path);
}
