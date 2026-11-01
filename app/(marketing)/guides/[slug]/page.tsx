import { notFound } from "next/navigation";
import JsonLd from "@/components/common/JsonLd";
import CallbackSection from "@/components/site/CallbackSection";
import { FaqList, Section, SectionHeading, TextLink } from "@/components/site/primitives";
import {
  ARTICLE_BODY_CLASS,
  ArticleHero,
  ArticleNote,
  ArticleShell,
  ArticleTable,
  AsideCard,
  Byline,
  StoryCard,
  formatDate,
  slugify,
} from "@/components/site/articles/ArticleParts";
import { GUIDE_CARDS } from "@/components/site/articles/guide-cards";
import { PHONE, PHONE_HREF } from "@/lib/constants";
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

function GuideComparison({ table }: { table: GuideTable }) {
  const hasRowHeadings = table.columns[0] === "";
  return (
    <ArticleTable
      className="my-[18px]"
      caption={table.caption}
      columns={table.columns}
      rows={table.rows}
      rowHeadings={hasRowHeadings}
    />
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
  const card = GUIDE_CARDS.find((c) => c.href === path);
  const sections = guide.sections.map((section) => ({ ...section, id: slugify(section.heading) }));
  const toc = [
    ...sections.map((section) => ({ id: section.id, label: section.heading })),
    { id: "faqs", label: "FAQs" },
  ];
  const moreGuides = GUIDE_CARDS.filter((c) => c.href !== path).slice(0, 3);
  const updated = formatDate(guide.updated);

  return (
    <>
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

      <ArticleHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Guides", href: "/guides" }, { label: guide.name }]}
        eyebrow={card?.label ?? "Guide"}
        title={guide.title}
        intro={guide.description}
        byline={updated ? <Byline name="Rosecrest Group" meta={`Updated ${updated}`} /> : undefined}
      />

      <ArticleShell
        toc={toc}
        tocLabel="On this page"
        aside={
          <AsideCard
            eyebrow="Not sure which you need?"
            title="Talk to our advisors"
            text="Tell us about the property and we’ll explain the nature and scope of each option, with a fixed fee before you commit."
            href="/request-inspection"
            cta="Request an inspection"
          >
            <a href={PHONE_HREF} className="text-[15px] font-bold text-ink no-underline hover:text-teal">
              or call {PHONE}
            </a>
          </AsideCard>
        }
      >
        <article className={ARTICLE_BODY_CLASS}>
          {guide.intro.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}

          {guide.comparison && <GuideComparison table={guide.comparison} />}

          {sections.map((section) => (
            <section key={section.id}>
              <h2 id={section.id}>{section.heading}</h2>
              {section.table && <GuideComparison table={section.table} />}
              {section.paragraphs?.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
              {section.bullets && (
                <ul>
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {guide.related.length > 0 && (
            <div className="mt-9">
              <ArticleNote title="Related">
                <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                  {guide.related.map((link) => (
                    <li key={link.href}>
                      <TextLink href={link.href}>{link.label} →</TextLink>
                    </li>
                  ))}
                </ul>
              </ArticleNote>
            </div>
          )}
        </article>
      </ArticleShell>

      <Section tone="mist" id="faqs">
        <SectionHeading eyebrow="FAQs" title={`${guide.name}: common questions`} />
        <FaqList items={guide.faqs.map((faq) => ({ q: faq.question, a: <p>{faq.answer}</p> }))} />
      </Section>

      <Section tone="white" className="border-b border-line">
        <SectionHeading eyebrow="More guides" title="Guides from our surveyors" />
        <div className="grid gap-[18px] md:grid-cols-2 lg:grid-cols-3">
          {moreGuides.map((other) => (
            <StoryCard
              key={other.href}
              href={other.href}
              meta={other.label}
              title={other.title}
              text={other.blurb}
              cta="Read the guide →"
            />
          ))}
        </div>
        <TextLink href="/guides" className="self-start">
          View all guides →
        </TextLink>
      </Section>

      <CallbackSection formName={`Guide call back: ${guide.name}`} defaultNeeds={card?.needs} />
    </>
  );
}
