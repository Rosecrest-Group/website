import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Footer from "@/components/common/Footer";
import JsonLd from "@/components/common/JsonLd";
import PageJsonLd from "@/components/common/PageJsonLd";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import { sourceSans } from "@/lib/fonts";
import { guides } from "@/lib/guides";
import { getPageMetadata } from "@/lib/page-metadata";
import { buildItemList } from "@/lib/schema";

export const metadata = getPageMetadata("/guides");

export default function GuidesPage() {
  return (
    <div className="bg-[#FBF7F4]">
      <PageJsonLd path="/guides" />
      <JsonLd
        id="guides"
        data={buildItemList({
          path: "/guides",
          name: "Property survey guides",
          items: guides.map((guide) => ({ name: guide.title, url: `/guides/${guide.slug}` })),
        })}
      />
      <JourneyHero>
        <h1 className="text-white text-4xl lg:text-5xl tracking-tight leading-tight font-bold">
          Which survey do I need?
        </h1>
        <p
          className={`${sourceSans.className} mt-6 mx-auto text-white/90 text-base lg:text-xl leading-relaxed max-w-2xl`}
        >
          Plain-English comparisons from our surveyors, so you can choose the
          right survey, report or inspection.
        </p>
      </JourneyHero>

      <section className="max-w-7xl mx-auto px-4 py-16 lg:py-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {guides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="group flex flex-col bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="font-bold text-[#101828] text-lg mb-3 leading-snug group-hover:text-[#262A6F] transition-colors">
                {guide.title}
              </h2>
              <p className={`${sourceSans.className} text-[#4A5565] text-sm line-clamp-3 mb-5`}>
                {guide.description}
              </p>
              <span
                className={`${sourceSans.className} mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-[#262A6F]`}
              >
                Read the guide
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
