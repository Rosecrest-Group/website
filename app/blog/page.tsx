import { sanityFetch } from "@/sanity/lib/client";
import { allPostsQuery } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import Link from "next/link";
import Image from "next/image";
import { sourceSans } from "@/lib/fonts";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import Footer from "@/components/common/Footer";

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
}

export default async function BlogPage() {
  const posts: Post[] = await sanityFetch<Post[]>(allPostsQuery);

  return (
    <div className="bg-[#FBF7F4]">
      <JourneyHero>
        <p className="text-white text-4xl lg:text-5xl tracking-tight leading-tight font-bold">
          News & Insights
        </p>
        <p
          className={`${sourceSans.className} mt-6 mx-auto text-white/90 text-base lg:text-xl leading-relaxed max-w-2xl`}
        >
          Property advice, industry updates and guidance from the Rosecrest
          team.
        </p>
      </JourneyHero>

      <section className="max-w-7xl mx-auto px-4 py-16 lg:py-24">
        {posts.length === 0 ? (
          <p className={`${sourceSans.className} text-center text-[#4A5565]`}>
            No posts yet. Check back soon.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post._id}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
              >
                {post.heroImage && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={urlFor(post.heroImage).width(800).format("webp").url()}
                      alt={post.heroImage.alt ?? post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <p
                    className={`${sourceSans.className} text-xs text-[#6A7282] mb-2`}
                  >
                    {post.publishedAt?.slice(0, 10)}
                  </p>
                  <h2 className="font-bold text-[#101828] text-lg mb-3 leading-snug group-hover:text-[#262A6F] transition-colors">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p
                      className={`${sourceSans.className} text-[#4A5565] text-sm line-clamp-3`}
                    >
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
