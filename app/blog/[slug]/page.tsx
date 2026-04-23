import { getPostBySlug, getAllPosts } from "@/lib/wordpress";
import { sourceSans } from "@/lib/fonts";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Footer from "@/components/common/Footer";
import BlogHero from "@/fragments/blog/BlogHero";

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
              className={`${sourceSans.className} blog-content prose prose-lg max-w-none text-[#4A5565]
                prose-headings:text-[#262A6F] prose-headings:font-bold prose-headings:tracking-tight
                prose-h2:text-3xl lg:prose-h2:text-4xl prose-h2:mt-12 prose-h2:mb-5
                prose-h3:text-2xl lg:prose-h3:text-3xl prose-h3:mt-10 prose-h3:mb-4
                prose-h4:text-2xl lg:prose-h4:text-3xl prose-h4:mt-10 prose-h4:mb-4
                prose-h5:text-xl prose-h5:mt-8 prose-h5:mb-3
                prose-p:leading-relaxed prose-p:mb-5
                prose-a:text-[#262A6F] prose-a:font-medium prose-a:underline prose-a:underline-offset-4 prose-a:decoration-[#DBB38E] prose-a:decoration-2 hover:prose-a:decoration-[#262A6F]
                prose-strong:text-[#101828] prose-strong:font-semibold
                prose-ul:my-5 prose-ul:pl-6 prose-ol:my-5 prose-ol:pl-6
                prose-li:my-2 prose-li:marker:text-[#DBB38E]
                prose-blockquote:border-l-4 prose-blockquote:border-[#DBB38E]
                prose-blockquote:bg-white prose-blockquote:py-3 prose-blockquote:px-5
                prose-blockquote:rounded-r-xl prose-blockquote:not-italic
                prose-blockquote:text-[#262A6F] prose-blockquote:font-medium
                prose-img:rounded-2xl prose-img:shadow-sm
                prose-hr:border-[#E5E7EB] prose-hr:my-10
              `}
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