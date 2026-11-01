import { sanityFetch } from "@/sanity/lib/client";
import { allPostsQuery } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import JsonLd from "@/components/common/JsonLd";
import PageJsonLd from "@/components/common/PageJsonLd";
import CallbackSection from "@/components/site/CallbackSection";
import { PageHero, TextLink } from "@/components/site/primitives";
import { StoryCard, formatDate } from "@/components/site/articles/ArticleParts";
import { getPageMetadata } from "@/lib/page-metadata";
import { buildItemList } from "@/lib/schema";

export const revalidate = 60;

export const metadata = getPageMetadata("/blog");

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
}

export default async function BlogPage() {
  const posts: Post[] = (await sanityFetch<Post[]>(allPostsQuery)) ?? [];

  return (
    <>
      <PageJsonLd path="/blog" />
      {posts.length > 0 && (
        <JsonLd
          id="blog-posts"
          data={buildItemList({
            path: "/blog",
            name: "News & insights",
            items: posts.map((post) => ({ name: post.title, url: `/blog/${post.slug}` })),
          })}
        />
      )}

      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "News & Insights" }]}
        eyebrow="Articles"
        title="News & Insights"
        intro={<p>Property advice, industry updates and guidance from the Rosecrest team.</p>}
        className="[&>div]:pb-12 md:[&>div]:pb-[72px]"
      />

      <section className="bg-mist text-ink">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-9 px-gutter pb-14 md:pb-20">
          {posts.length === 0 ? (
            <p className="text-lg text-body">No posts yet. Check back soon.</p>
          ) : (
            <div className="grid gap-[18px] md:grid-cols-2">
              {posts.map((post) => (
                <StoryCard
                  key={post._id}
                  href={`/blog/${post.slug}`}
                  meta={formatDate(post.publishedAt)}
                  title={post.title}
                  text={post.excerpt}
                  size="lg"
                  headingLevel="h2"
                  image={
                    post.heroImage
                      ? {
                          src: urlFor(post.heroImage).width(900).format("webp").url(),
                          alt: post.heroImage.alt ?? post.title,
                        }
                      : undefined
                  }
                />
              ))}
            </div>
          )}
          <p className="text-lg text-body">
            Looking for survey and compliance guides? <TextLink href="/guides">See all guides →</TextLink>
          </p>
        </div>
      </section>

      <CallbackSection formName="Blog page call back" />
    </>
  );
}
