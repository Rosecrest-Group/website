import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { sanityFetch } from "@/sanity/lib/client";
import { allPostsQuery } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import CallbackSection from "@/components/site/CallbackSection";
import { ButtonLink, Eyebrow, Section, SectionHeading, TextLink } from "@/components/site/primitives";
import { StoryCard, formatDate } from "@/components/site/articles/ArticleParts";
import { PHONE, PHONE_HREF, EMAIL, EMAIL_HREF } from "@/lib/constants";

interface Post {
  _id: string;
  title: string;
  slug: string;
  publishedAt: string;
  heroImage?: {
    asset: { _ref: string };
    alt?: string;
  };
}

export const metadata: Metadata = {
  title: "Page Not Found | Rosecrest",
  robots: { index: false },
};

const QUICK_LINKS = [
  { label: "Homebuyer surveys", href: "/homebuyer" },
  { label: "Services", href: "/services" },
  { label: "Guides", href: "/guides" },
  { label: "Areas we cover", href: "/areas-we-cover" },
  { label: "About Rosecrest", href: "/about" },
  { label: "Contact us", href: "/contact" },
];

export default async function NotFound() {
  let recentPosts: Post[] = [];
  try {
    const posts: Post[] = (await sanityFetch<Post[]>(allPostsQuery)) ?? [];
    recentPosts = posts.slice(0, 3);
  } catch {
    // fail silently — posts are non-critical
  }

  return (
    <>
      <section className="bg-mist text-ink">
        <div className="mx-auto w-full max-w-[1440px] px-gutter py-16 md:py-24">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-16">
            <div className="flex flex-col gap-5">
              <Eyebrow>404, page not found</Eyebrow>
              <h1 className="text-[38px] font-extrabold leading-[1.04] md:text-[54px]">This page doesn’t exist</h1>
              <p className="max-w-[640px] text-xl text-body">
                It may have been moved or removed. Use the links below to find what you’re looking for, or head back
                to the homepage.
              </p>
              <div className="flex flex-wrap items-center gap-3.5">
                <ButtonLink href="/">Back to the homepage</ButtonLink>
                <ButtonLink href="/contact" variant="outline">
                  Contact us
                </ButtonLink>
              </div>
            </div>

            <div className="flex flex-col gap-3.5">
              <b className="text-sm uppercase tracking-[0.06em] text-muted-ink">Popular pages</b>
              <ul className="m-0 grid list-none gap-2.5 p-0 sm:grid-cols-2 lg:grid-cols-1">
                {QUICK_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3 text-base font-semibold text-ink no-underline transition-colors hover:border-teal hover:text-ink"
                    >
                      {link.label}
                      <ArrowRight
                        aria-hidden="true"
                        className="h-4 w-4 text-line-strong transition-colors group-hover:text-teal"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex flex-col gap-2 rounded-[18px] bg-navy p-6 text-white">
                <b className="font-display text-xl">Prefer to talk?</b>
                <p className="text-[15px] text-navy-soft">Our team can point you to the right survey or service.</p>
                <a href={PHONE_HREF} className="flex items-center gap-2 font-bold text-white no-underline hover:text-white">
                  <Phone aria-hidden="true" className="h-4 w-4 text-teal-line" />
                  {PHONE}
                </a>
                <a
                  href={EMAIL_HREF}
                  className="flex items-center gap-2 break-all font-bold text-white no-underline hover:text-white"
                >
                  <Mail aria-hidden="true" className="h-4 w-4 shrink-0 text-teal-line" />
                  {EMAIL}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section tone="white">
        <SectionHeading eyebrow="News & Insights" title="Latest from the blog" />
        {recentPosts.length === 0 ? (
          <p className="text-body">No posts available right now.</p>
        ) : (
          <div className="grid gap-[18px] md:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post) => (
              <StoryCard
                key={post._id}
                href={`/blog/${post.slug}`}
                meta={formatDate(post.publishedAt)}
                title={post.title}
                image={
                  post.heroImage
                    ? {
                        src: urlFor(post.heroImage).width(700).format("webp").url(),
                        alt: post.heroImage.alt ?? post.title,
                      }
                    : undefined
                }
              />
            ))}
          </div>
        )}
        <TextLink href="/guides" className="self-start">
          View all articles and guides →
        </TextLink>
      </Section>

      <CallbackSection
        eyebrow="Can’t find what you’re looking for?"
        intro="Tell us what you need and the right member of our team will get back to you."
        formName="404 page call back"
      />
    </>
  );
}
