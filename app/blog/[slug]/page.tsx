import { getPostBySlug, getAllPosts } from "@/lib/wordpress";
import { sourceSans } from "@/lib/fonts";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Footer from "@/components/common/Footer";
import BlogHero from "@/fragments/blog/BlogHero";
import JsonLd from "@/components/common/JsonLd";
import { buildBlogPosting, buildBreadcrumbList } from "@/lib/schema";

export const revalidate = 60;

interface StaticParam {
  slug: string;
}

interface Post {
  slug: string;
}

export async function generateStaticParams() {
  if (!process.env.WORDPRESS_GRAPHQL_URL) return [];
  try {
    const posts = await getAllPosts();
    return posts.map((post: Post): StaticParam => ({ slug: post.slug }));
  } catch (err) {
    console.warn("generateStaticParams: could not fetch posts, skipping static generation", err);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Post not found | Rosecrest Group" };
  }

  return {
    title: post.title,
    openGraph: {
      title: post.title,
      images: post.featuredImage?.node?.sourceUrl
        ? [post.featuredImage.node.sourceUrl]
        : [],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([
    getPostBySlug(slug),
    getAllPosts(),
  ]);

  if (!post) notFound();

  const relatedPosts = allPosts
    .filter((p: Post) => p.slug !== slug)
    .slice(0, 5);

  return (
    <div className="bg-[#FBF7F4] min-h-screen">
      <JsonLd
        id="blog-post"
        data={[
          buildBlogPosting({
            title: post.title,
            slug,
            datePublished: post.date,
            imageUrl: post.featuredImage?.node?.sourceUrl,
          }),
          buildBreadcrumbList([
            { name: "Home", path: "/" },
            { name: "News & Insights", path: "/blog" },
            { name: post.title, path: `/blog/${slug}` },
          ]),
        ]}
      />

      <BlogHero>
        <p>Blog</p>
      </BlogHero>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-[1fr_320px] gap-12 items-start">

          {/* ── Main article ── */}
          <article>
            <Link
              href="/blog"
              className={`${sourceSans.className} inline-flex items-center gap-1.5 text-sm text-[#262A6F] hover:text-[#262A6F]/80 mb-8 transition-colors`}
            >
              <ChevronLeft className="w-4 h-4" />
              Back to News & Insights
            </Link>

            {post.featuredImage?.node && (
              <div className="relative h-64 lg:h-96 w-full rounded-2xl overflow-hidden mb-8">
                <Image
                  src={post.featuredImage.node.sourceUrl}
                  alt={post.featuredImage.node.altText ?? post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            <p className={`${sourceSans.className} text-sm text-[#6A7282] mb-3`}>
              {post.date.slice(0, 10)}
            </p>

            <h1 className="text-3xl lg:text-5xl font-bold text-[#101828] mb-10 leading-tight">
              {post.title}
            </h1>

            <div
              className={`${sourceSans.className} blog-content`}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>

          {/* ── Sidebar ── */}
          {relatedPosts.length > 0 && (
            <aside className="sticky top-8">
              <h2 className="text-sm font-bold text-[#101828] uppercase tracking-widest mb-5">
                More Stories
              </h2>
              <ul className="space-y-5">
                {relatedPosts.map((related: (typeof allPosts)[number]) => (
                  <li key={related.slug}>
                    <Link
                      href={`/blog/${related.slug}`}
                      className="group flex gap-3 items-start"
                    >
                      {related.featuredImage?.node ? (
                        <div className="relative w-20 h-16 rounded-xl overflow-hidden shrink-0">
                          <Image
                            src={related.featuredImage.node.sourceUrl}
                            alt={related.featuredImage.node.altText ?? related.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-16 rounded-xl bg-[#E5E7EB] shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`${sourceSans.className} text-xs text-[#6A7282] mb-1`}>
                          {related.date.slice(0, 10)}
                        </p>
                        <p className="text-sm font-semibold text-[#101828] leading-snug line-clamp-2 group-hover:text-[#262A6F] transition-colors">
                          {related.title}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>

              <Link
                href="/blog"
                className={`${sourceSans.className} inline-flex items-center gap-1.5 text-sm text-[#262A6F] hover:text-[#262A6F]/80 mt-7 transition-colors font-medium`}
              >
                View all articles
                <ChevronLeft className="w-4 h-4 rotate-180" />
              </Link>
            </aside>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}