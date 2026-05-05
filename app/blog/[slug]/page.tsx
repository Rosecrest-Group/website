import { sanityFetch } from "@/sanity/lib/client";
import { postBySlugQuery, postSlugsQuery, allPostsQuery } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import { sourceSans } from "@/lib/fonts";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Footer from "@/components/common/Footer";
import BlogHero from "@/fragments/blog/BlogHero";
import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";

export const revalidate = 60;

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt: string;
  heroImage?: {
    asset: { _ref: string };
    alt?: string;
  };
  body?: PortableTextBlock[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
}

export async function generateStaticParams() {
  const slugs: string[] = await sanityFetch<string[]>(postSlugsQuery);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post: Post | null = await sanityFetch<Post | null>(postBySlugQuery, { slug });

  if (!post) {
    return { title: "Post not found | Rosecrest Group" };
  }

  return {
    title: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt,
    openGraph: {
      title: post.seo?.metaTitle || post.title,
      description: post.seo?.metaDescription || post.excerpt,
      images: post.heroImage
        ? [urlFor(post.heroImage).width(1200).format("webp").url()]
        : [],
    },
  };
}

const portableTextComponents = {
  types: {
    image: ({ value }: { value: { asset: { _ref: string }; alt?: string; caption?: string } }) => (
      <figure className="my-8">
        <Image
          src={urlFor(value).width(1200).format("webp").url()}
          alt={value.alt || ""}
          width={1200}
          height={675}
          className="rounded-2xl"
        />
        {value.caption && (
          <figcaption className="text-center text-sm text-[#6A7282] mt-2">
            {value.caption}
          </figcaption>
        )}
      </figure>
    ),
  },
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, allPosts]: [Post | null, Post[]] = await Promise.all([
    sanityFetch<Post | null>(postBySlugQuery, { slug }),
    sanityFetch<Post[]>(allPostsQuery),
  ]);

  if (!post) notFound();

  const relatedPosts = allPosts.filter((p) => p.slug !== slug).slice(0, 5);

  return (
    <div className="bg-[#FBF7F4] min-h-screen">
      <BlogHero>
        <p>Blog</p>
      </BlogHero>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-[1fr_320px] gap-12 items-start">
          <article>
            <Link
              href="/blog"
              className={`${sourceSans.className} inline-flex items-center gap-1.5 text-sm text-[#262A6F] hover:text-[#262A6F]/80 mb-8 transition-colors`}
            >
              <ChevronLeft className="w-4 h-4" />
              Back to News & Insights
            </Link>

            {/* Article Header */}
            <header className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-8 h-[2px] bg-[#DBB38E]" />
                <time 
                  dateTime={post.publishedAt}
                  className={`${sourceSans.className} text-sm font-medium text-[#6A7282] uppercase tracking-wider`}
                >
                  {new Date(post.publishedAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </time>
              </div>

              <h1 className="text-3xl lg:text-5xl font-bold text-[#101828] leading-tight mb-6">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className={`${sourceSans.className} text-lg lg:text-xl text-[#4A5565] leading-relaxed`}>
                  {post.excerpt}
                </p>
              )}
            </header>

            {post.heroImage && (
              <div className="relative h-64 lg:h-96 w-full rounded-2xl overflow-hidden mb-10 shadow-sm">
                <Image
                  src={urlFor(post.heroImage).width(1200).format("webp").url()}
                  alt={post.heroImage.alt ?? post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

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
            >
              {post.body && (
                <PortableText value={post.body} components={portableTextComponents} />
              )}
            </div>
          </article>

          {relatedPosts.length > 0 && (
            <aside className="sticky top-8">
              <h2 className="text-sm font-bold text-[#101828] uppercase tracking-widest mb-5">
                More Stories
              </h2>
              <ul className="space-y-5">
                {relatedPosts.map((related) => (
                  <li key={related._id}>
                    <Link
                      href={`/blog/${related.slug}`}
                      className="group flex gap-3 items-start"
                    >
                      {related.heroImage ? (
                        <div className="relative w-20 h-16 rounded-xl overflow-hidden shrink-0">
                          <Image
                            src={urlFor(related.heroImage).width(160).format("webp").url()}
                            alt={related.heroImage.alt ?? related.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-16 rounded-xl bg-[#E5E7EB] shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`${sourceSans.className} text-xs text-[#6A7282] mb-1`}>
                          {related.publishedAt?.slice(0, 10)}
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
