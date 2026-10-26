import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronLeft } from "lucide-react";
import Footer from "@/components/common/Footer";
import FAQ from "@/components/common/FAQ";
import JsonLd from "@/components/common/JsonLd";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import { sourceSans } from "@/lib/fonts";
import { getGuide, guides, type GuideTable } from "@/lib/guides";
import { buildMetadata } from "@/lib/page-metadata";
import {
  breadcrumbTrail,
  buildArticle,
  buildBreadcrumbList,
  buildFAQPage,
} from "@/lib/schema";

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return buildMetadata({
    path: `/guides/${guide.slug}`,
    title: guide.metaTitle,
    description: guide.description,
    type: "article",
  });
}

function ComparisonTable({ table }: { table: GuideTable }) {
  const { columns: header, rows } = table;
  const hasRowHeadings = header[0] === "";
  return (
    <div className="my-8 overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white">
      <table className="w-full border-collapse text-left text-sm lg:text-base">
        <caption className="sr-only">{table.caption}</caption>
        <thead>
          <tr>
            {header.map((cell, index) => (
              <th
                key={index}
                scope="col"
                className="border-b border-[#E5E7EB] bg-[#FBF7F4] px-4 py-3 font-bold text-[#101828]"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="align-top">
              {row.map((cell, cellIndex) =>
                hasRowHeadings && cellIndex === 0 ? (
                  <th
                    key={cellIndex}
                    scope="row"
                    className="border-b border-[#E5E7EB] px-4 py-3 font-semibold text-[#262A6F]"
                  >
                    {cell}
                  </th>
                ) : (
                  <td
                    key={cellIndex}
                    className="border-b border-[#E5E7EB] px-4 py-3 text-[#4A5565]"
                  >
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const path = `/guides/${guide.slug}`;

  return (
    <div className="bg-[#FBF7F4]">
      <JsonLd
        id="guide"
        data={[
          buildArticle({
            path,
            title: guide.title,
            description: guide.description,
            dateModified: guide.updated,
          }),
          buildBreadcrumbList(breadcrumbTrail(path, guide.name)),
          buildFAQPage(guide.faqs),
        ]}
      />
      <JourneyHero>
        <h1 className="text-white text-3xl lg:text-5xl tracking-tight leading-tight font-bold max-w-4xl mx-auto">
          {guide.title}
        </h1>
        <p
          className={`${sourceSans.className} mt-6 mx-auto text-white/90 text-base lg:text-xl leading-relaxed max-w-3xl`}
        >
          {guide.description}
        </p>
      </JourneyHero>

      <article className={`${sourceSans.className} max-w-4xl mx-auto px-4 py-16 lg:py-20`}>
        <Link
          href="/guides"
          className="inline-flex items-center gap-1.5 text-sm text-[#262A6F] hover:text-[#262A6F]/80 mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          All guides
        </Link>

        <div className="space-y-5 text-lg text-[#4A5565] leading-relaxed">
          {guide.intro.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {guide.comparison && <ComparisonTable table={guide.comparison} />}

        {guide.sections.map((section) => (
          <section key={section.heading} className="mt-12">
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#262A6F] mb-5">
              {section.heading}
            </h2>
            {section.table && <ComparisonTable table={section.table} />}
            {section.paragraphs?.map((paragraph, index) => (
              <p key={index} className="text-base lg:text-lg text-[#4A5565] leading-relaxed mb-5">
                {paragraph}
              </p>
            ))}
            {section.bullets && (
              <ul className="list-disc pl-6 space-y-2 text-base lg:text-lg text-[#4A5565] leading-relaxed marker:text-[#DBB38E]">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section className="mt-12 rounded-2xl bg-white border border-[#E5E7EB] p-6 lg:p-8">
          <h2 className="text-xl font-bold text-[#101828] mb-4">Related</h2>
          <ul className="space-y-3">
            {guide.related.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex items-center gap-2 font-medium text-[#262A6F] underline underline-offset-4 decoration-[#DBB38E] decoration-2 hover:decoration-[#262A6F]"
                >
                  {link.label}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/request-inspection"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#262A6F] px-6 py-3 text-sm font-semibold text-white hover:bg-[#262A6F]/90"
          >
            Request an inspection
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </article>

      <FAQ questions={guide.faqs} />
      <Footer />
    </div>
  );
}
