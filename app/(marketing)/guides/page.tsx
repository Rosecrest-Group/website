import Image from "next/image";
import JsonLd from "@/components/common/JsonLd";
import PageJsonLd from "@/components/common/PageJsonLd";
import CallbackSection from "@/components/site/CallbackSection";
import { PageHero, Section, SectionHeading, TextLink } from "@/components/site/primitives";
import { StoryCard, formatDate } from "@/components/site/articles/ArticleParts";
import { GUIDE_CARDS } from "@/components/site/articles/guide-cards";
import { getPageMetadata } from "@/lib/page-metadata";
import { buildItemList } from "@/lib/schema";
import { sanityFetch } from "@/sanity/lib/client";
import { allPostsQuery } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";

export const revalidate = 60;

export const metadata = getPageMetadata("/guides");

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

const BUILDING_SURVEYOR_POST = /what[\s-]+(does[\s-]+a[\s-]+)?building[\s-]+surveyors?[\s-]+do/i;

export default async function GuidesPage() {
  let posts: Post[] = [];
  try {
    posts = (await sanityFetch<Post[]>(allPostsQuery)) ?? [];
  } catch {
    // The guides still render if Sanity is unreachable.
  }

  const surveyorPost = posts.find((post) => BUILDING_SURVEYOR_POST.test(post.title) || BUILDING_SURVEYOR_POST.test(post.slug));

  return (
    <>
      <PageJsonLd path="/guides" />
      <JsonLd
        id="guides"
        data={buildItemList({
          path: "/guides",
          name: "News, insights and property guides",
          items: [
            ...posts.map((post) => ({ name: post.title, url: `/blog/${post.slug}` })),
            ...GUIDE_CARDS.map((guide) => ({ name: guide.title, url: guide.href })),
          ],
        })}
      />

      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Guides" }]}
        eyebrow="Guides and property advice"
        title="News & Insights"
        intro={<p>Property advice, industry updates and guidance from the Rosecrest team.</p>}
        className="[&>div]:pb-12 md:[&>div]:pb-[72px]"
      />

      {posts.length > 0 && (
        <section className="bg-mist text-ink">
          <div className="mx-auto w-full max-w-[1440px] px-gutter pb-14 md:pb-20">
            <h2 className="sr-only">Latest articles</h2>
            <div className="grid gap-[18px] md:grid-cols-2">
              {posts.map((post) => (
                <StoryCard
                  key={post._id}
                  href={`/blog/${post.slug}`}
                  meta={formatDate(post.publishedAt)}
                  title={post.title}
                  text={post.excerpt}
                  size="lg"
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
          </div>
        </section>
      )}

      <Section tone="white">
        <SectionHeading eyebrow="More guides" title="Guides from our surveyors" />
        <div className="grid gap-[18px] md:grid-cols-2 lg:grid-cols-3">
          {GUIDE_CARDS.map((guide) => (
            <StoryCard
              key={guide.href}
              href={guide.href}
              meta={guide.label}
              title={guide.title}
              text={guide.blurb}
              cta="Read the guide →"
            />
          ))}
        </div>
      </Section>

      <Section tone="mist">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-16">
          <div className="flex flex-col gap-4">
            <SectionHeading
              eyebrow="Building surveyors"
              title={<span className="md:text-[36px]">What does a building surveyor do?</span>}
            />
            <p className="text-[17px] text-body">
              Building surveyors are sometimes called “building doctors”. They inspect properties to find defects,
              using their knowledge and tools such as moisture meters, then work out the underlying cause so that
              remedial work stops the problem coming back. A building surveyor can also act as an expert witness when
              defects lead to legal disputes, manage building projects, and draw up maintenance plans for residential
              and commercial buildings.
            </p>
            {surveyorPost && (
              <TextLink href={`/blog/${surveyorPost.slug}`} className="self-start">
                Read: What does a building surveyor do? →
              </TextLink>
            )}
          </div>
          {surveyorPost?.heroImage && (
            <div className="relative h-[260px] overflow-hidden rounded-[22px] bg-line md:h-[320px]">
              <Image
                src={urlFor(surveyorPost.heroImage).width(900).format("webp").url()}
                alt={surveyorPost.heroImage.alt ?? "Building surveyor carrying out a property inspection"}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </Section>

      <CallbackSection formName="Guides page call back" />
    </>
  );
}
