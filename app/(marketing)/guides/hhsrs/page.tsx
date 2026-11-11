import Link from "next/link";
import { Droplet, ShieldCheck, Thermometer, TriangleAlert } from "lucide-react";
import JsonLd from "@/components/common/JsonLd";
import PageJsonLd from "@/components/common/PageJsonLd";
import CallbackSection from "@/components/site/CallbackSection";
import { GuideSectionHeading, NavyBand, TitleCard } from "@/components/site/guides/blocks";
import { ButtonLink, FaqList, IconTile, PageHero, Section, StepNumber, TextLink } from "@/components/site/primitives";
import type { FAQItem } from "@/lib/faqs";
import { getPageMetadata, pageMetadata } from "@/lib/page-metadata";
import { buildArticle, buildFAQPage } from "@/lib/schema";

const PATH = "/guides/hhsrs";
const TITLE = "HHSRS explained: hazards, ratings and inspections";
const UPDATED = "2026-11-01";

export const metadata = getPageMetadata(PATH);

const HAZARDS = [
  {
    icon: Droplet,
    title: "Damp and mould",
    text: "The hazard behind most complaints, with likely causes identified where the findings support them.",
  },
  { icon: Thermometer, title: "Excess cold", text: "Heating, insulation and ventilation assessed together." },
  { icon: TriangleAlert, title: "Falls and safety", text: "Stairs, windows and trip hazards recorded and rated." },
  { icon: ShieldCheck, title: "Fire and electrical", text: "Visible risks flagged for specialist follow-up." },
];

const STEPS = [
  { title: "Scope agreed", text: "Properties, hazards of concern and deadlines." },
  { title: "Inspection", text: "Every room, with photos and readings." },
  { title: "Hazard rating", text: "Each hazard scored, banded and explained." },
  { title: "Report and actions", text: "Clear priorities and remedial recommendations." },
];

const FAQS: FAQItem[] = [
  {
    question: "What changed in HHSRS in 2026?",
    answer:
      "Since 23 June 2026, England uses a revised system: 21 hazards, three bands (High, Medium and Low) in place of the old ten, and new statutory operating and enforcement guidance. Older reports may need re-rating under the new method.",
  },
  {
    question: "What is an HHSRS assessment?",
    answer:
      "A room-by-room inspection that identifies hazards in a home and rates how likely each is to cause harm and how serious that harm could be. The report sets out the hazards found, their band and what needs attention.",
  },
  {
    question: "Who needs an HHSRS inspection?",
    answer:
      "Councils and housing associations managing stock, landlords responding to complaints, and solicitors needing evidence in disrepair cases.",
  },
  {
    question: "Does this help with Awaab’s Law?",
    answer:
      "If you’re a social landlord, yes: a prompt, documented investigation supports the Awaab’s Law timescales. Awaab’s Law does not currently apply to private landlords.",
  },
];

export default function HhsrsGuide() {
  return (
    <>
      <PageJsonLd path={PATH} />
      <JsonLd
        id="guide"
        data={[
          buildArticle({ path: PATH, title: TITLE, description: pageMetadata[PATH].description, dateModified: UPDATED }),
          buildFAQPage(FAQS),
        ]}
      />

      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Guides", href: "/guides" }, { label: "HHSRS" }]}
        title={TITLE}
        intro={
          <>
            <p>
              An HHSRS inspection is a formal assessment of hazards in a home under the Housing Health and Safety Rating
              System, the system councils use to enforce housing standards.
            </p>
            <p className="text-[17px]">
              This guide explains how hazards are rated under the revised system in force in England since 23 June 2026,
              and what an HHSRS inspection involves.
            </p>
          </>
        }
      />

      <Section>
        <GuideSectionHeading
          eyebrow="HHSRS hazards"
          title="How HHSRS hazards are rated"
          intro={
            <p>
              Since 23 June 2026, the HHSRS in England covers 21 hazards. Each hazard found is scored for how likely it
              is to cause harm and how serious that harm could be, then placed in a High, Medium or Low band. High-band
              hazards are Category 1, which councils must act on; Medium and Low are Category 2.
            </p>
          }
        />
        <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          {HAZARDS.map((hazard) => (
            <TitleCard
              key={hazard.title}
              title={hazard.title}
              icon={
                <IconTile>
                  <hazard.icon className="h-6 w-6" strokeWidth={2} />
                </IconTile>
              }
            >
              {hazard.text}
            </TitleCard>
          ))}
        </div>
      </Section>

      <Section tone="mist">
        <GuideSectionHeading eyebrow="The inspection" title="What an HHSRS inspection involves" />
        <ol className="m-0 grid list-none gap-7 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex flex-col gap-2.5">
              <StepNumber n={i + 1} />
              <h3 className="font-body text-lg font-bold tracking-normal text-ink">{step.title}</h3>
              <p className="text-[15px] text-body">{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <NavyBand
        title="HHSRS inspections"
        text="We carry out HHSRS assessments and compliance reporting for councils, housing associations and landlords across London, including programmes across portfolios with one consistent method and reporting format."
        actions={
          <>
            <ButtonLink href="/councils" variant="light">
              Councils and housing associations
            </ButtonLink>
            <ButtonLink
              href="/landlord"
              className="border border-muted-ink bg-transparent text-white hover:bg-navy-deep hover:text-white"
            >
              Landlords and property owners
            </ButtonLink>
          </>
        }
      />

      <Section>
        <GuideSectionHeading eyebrow="Questions" title="About HHSRS inspections" />
        <FaqList
          items={FAQS.map((faq, i) => ({
            q: faq.question,
            a: (
              <p>
                {faq.answer}
                {i === FAQS.length - 1 && (
                  <>
                    {" "}
                    <Link href="/guides/awaabs-law">Awaab’s Law explained →</Link>
                  </>
                )}
              </p>
            ),
          }))}
        />
        <p className="border-t border-line pt-[22px] text-base text-body">
          <b className="text-ink">Related guide:</b> <TextLink href="/guides/awaabs-law">Awaab’s Law explained</TextLink>
        </p>
      </Section>

      <CallbackSection formName="HHSRS guide call back" />
    </>
  );
}
