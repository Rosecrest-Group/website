import Link from "next/link";
import Image from "next/image";
import { sanityFetch } from "@/sanity/lib/client";
import { allPostsQuery } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import { sourceSans } from "@/lib/fonts";
import Footer from "@/components/common/Footer";
import { Home, ArrowRight, Phone } from "lucide-react";

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

export default async function NotFound() {
  let recentPosts: Post[] = [];
  try {
    const posts: Post[] = await sanityFetch<Post[]>(allPostsQuery);
    recentPosts = posts.slice(0, 3);
  } catch {
    // fail silently — posts are non-critical
  }

  const quickLinks = [
    { label: "Homebuyer", href: "/homebuyer" },
    { label: "Services", href: "/services" },
    { label: "Areas We Cover", href: "/areas-we-cover" },
    { label: "About Rosecrest", href: "/about" },
    { label: "Contact Us", href: "/contact" },
  ];

  return (
    <div className="bg-[#FBF7F4] min-h-screen flex flex-col">
      {/* Hero */}
      <section className="bg-[#262A6F] text-white py-36 px-4 text-center">
        <p className={`${sourceSans.className} text-[#DBB38E] text-sm font-semibold uppercase tracking-widest mb-4`}>
          404 — Page Not Found
        </p>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-6">
          This page doesn&apos;t exist
        </h1>
        <p className={`${sourceSans.className} text-white/80 text-lg max-w-xl mx-auto mb-10`}>
          It may have been moved or removed. Use the links below to find what
          you&apos;re looking for, or head back to the homepage.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#DBB38E] hover:bg-[#c9a07c] text-[#101828] font-semibold px-6 py-3 rounded-full transition-colors text-sm"
          >
            <Home className="w-4 h-4" />
            Back to Homepage
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-full transition-colors text-sm border border-white/20"
          >
            <Phone className="w-4 h-4" />
            Contact Us
          </Link>
        </div>
      </section>

      {/* Quick Links + Posts */}
      <section className="max-w-7xl mx-auto px-4 py-16 lg:py-24 w-full flex-1">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Quick Links */}
          <div>
            <h2 className="text-lg font-bold text-[#101828] mb-6">
              Popular pages
            </h2>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`${sourceSans.className} flex items-center justify-between group px-4 py-3 bg-white rounded-xl border border-gray-100 hover:border-[#262A6F] hover:shadow-sm transition-all text-sm text-[#101828]`}
                  >
                    {link.label}
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#262A6F] transition-colors" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Recent Posts */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-bold text-[#101828] mb-6">
              Latest from the blog
            </h2>
            {recentPosts.length === 0 ? (
              <p className={`${sourceSans.className} text-[#6A7282] text-sm`}>
                No posts available right now.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentPosts.map((post) => (
                  <Link
                    key={post._id}
                    href={`/blog/${post.slug}`}
                    className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
                  >
                    {post.heroImage && (
                      <div className="relative h-40 w-full">
                        <Image
                          src={urlFor(post.heroImage).width(400).format("webp").url()}
                          alt={post.heroImage.alt ?? post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <p className={`${sourceSans.className} text-xs text-[#6A7282] mb-1.5`}>
                        {post.publishedAt?.slice(0, 10)}
                      </p>
                      <h3 className="font-bold text-[#101828] text-sm leading-snug group-hover:text-[#262A6F] transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
