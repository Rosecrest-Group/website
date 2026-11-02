import Link from "next/link";
import { Star } from "lucide-react";
import JsonLd from "@/components/common/JsonLd";
import PageJsonLd from "@/components/common/PageJsonLd";
import CallbackSection from "@/components/site/CallbackSection";
import TrustBadges from "@/components/site/TrustBadges";
import OnThisPage from "@/components/site/guides/OnThisPage";
import { GuideTable, InfoBox, NavyBand } from "@/components/site/guides/blocks";
import { ButtonLink, FaqList, PageHero, Section, SectionHeading } from "@/components/site/primitives";
import { PHONE, PHONE_HREF } from "@/lib/constants";
import type { FAQItem } from "@/lib/faqs";
import { getPageMetadata, pageMetadata } from "@/lib/page-metadata";
import { buildArticle, buildFAQPage } from "@/lib/schema";

const PATH = "/guides/level-2-vs-level-3-survey";
const TITLE = "Level 2 or Level 3 survey? What each one covers, for London buyers";
const UPDATED = "2026-11-01";

export const metadata = getPageMetadata(PATH);

const PRICE_CARDS = [
  {
    href: "/homebuyer/survey-level-2",
    tag: "Most common choice",
    level: "Level 2",
    name: "Homebuyer Survey",
    price: "£330.99",
    suits: "Modern and conventional properties",
    report: "Report in 3–5 working days",
  },
  {
    href: "/homebuyer/survey-level-3",
    tag: "Most comprehensive",
    level: "Level 3",
    name: "Building Survey",
    price: "£550.99",
    suits: "Older, altered or non-standard buildings",
    report: "Report in 5–7 working days",
  },
];

const TOC = [
  { id: "in-short", label: "In short" },
  { id: "difference", label: "The difference in one line" },
  { id: "which", label: "Which properties each survey suits" },
  { id: "london", label: "London property types" },
  { id: "price", label: "What it costs" },
  { id: "limits", label: "What no survey can tell you" },
  { id: "use", label: "How to read your report" },
  { id: "faqs", label: "FAQs" },
];

const LONDON_FEATURES = [
  {
    title: "Period construction",
    text: "Solid brick walls, lime mortar, shallow footings and suspended timber floors. Cement render and modern plaster can trap moisture inside them. A Level 2 flags the damp; a Level 3 explains the cause and the right repair, because the wrong fix can make it worse.",
  },
  {
    title: "London clay",
    text: "Clay swells when wet and shrinks when dry, and Victorian bays sit on shallow footings. We look at crack patterns, distorted openings, nearby trees and leaking drains that wash out the ground.",
  },
  {
    title: "Conversions into flats",
    text: "Fire and sound separation, shared roofs and drains, and works that may never have been signed off. Your solicitor reads the lease. We tell you what the building itself suggests you could be paying towards.",
  },
  {
    title: "Extensions and removed walls",
    text: "Loft rooms, side returns and knocked-through ground floors move loads around. A chimney breast removed without support, or a steel with no sign-off, is the kind of alteration a Level 3 looks at in more depth.",
  },
  {
    title: "Basements",
    text: "Dig-outs bring waterproofing, drainage and party wall questions. If the waterproofing fails, the repair can mean stripping the room back to brick.",
  },
];

const STATS = [
  {
    value: "43%",
    text: "of London properties projected to be affected by clay shrink-swell by 2030, up from 20% in 1990",
    source: "British Geological Survey",
    href: "https://www.bgs.ac.uk/news/maps-show-the-real-threat-of-climate-related-subsidence-to-british-homes-and-properties/",
  },
  {
    value: "£20,000",
    text: "average subsidence insurance claim in Q2 2026, up 15% on a year earlier",
    source: "Association of British Insurers, via Insurance Journal",
    href: "https://www.insurancejournal.com/news/international/2026/08/24/882555.htm",
  },
];

const SOURCES = [
  {
    label: "RICS: house surveys, costs, types and benefits",
    href: "https://www.rics.org/consumer-guides/house-surveys-uk-the-costs-types-and-benefits-of-an-rics-home-survey",
  },
  {
    label: "Health Foundation: properties built before 1919 (VOA 2024)",
    href: "https://www.health.org.uk/evidence-hub/housing/housing-quality/proportion-of-properties-built-before-1919-by-local-authority",
  },
  {
    label: "British Geological Survey: subsidence maps",
    href: "https://www.bgs.ac.uk/news/maps-show-the-real-threat-of-climate-related-subsidence-to-british-homes-and-properties/",
  },
  {
    label: "Insurance Journal: London subsidence claims (ABI data)",
    href: "https://www.insurancejournal.com/news/international/2026/08/24/882555.htm",
  },
  { label: "reallymoving: average survey costs", href: "https://www.reallymoving.com/surveyors" },
  {
    label: "HomeOwners Alliance: survey costs 2026",
    href: "https://hoa.org.uk/advice/guides-for-homeowners/i-am-buying/how-much-does-a-house-survey-cost/",
  },
];

const FAQS: FAQItem[] = [
  {
    question: "What does a Level 3 add to a Level 2?",
    answer:
      "A Level 3 is a more in-depth inspection with a full defect analysis. It explains the likely causes of defects and what may happen if repairs aren’t addressed, and offers optional estimated repair costs. At Rosecrest the difference between starting prices is £247.50.",
  },
  {
    question: "Is a Level 2 the same as a HomeBuyer Report?",
    answer:
      "Broadly, yes. The RICS HomeBuyer Report became the RICS Level 2 survey when RICS introduced its three survey levels. Many people still use the old name.",
  },
  {
    question: "Does my mortgage valuation count as a survey?",
    answer:
      "No. It protects the lender, not you. It checks the price, not the condition, and won’t look in the loft or lift a floorboard.",
  },
  {
    question: "Which survey is designed for a flat?",
    answer:
      "The Level 2 is ideal for modern and conventional properties, which includes many flats in purpose-built blocks. A flat converted from a period house is an older, altered building, the kind of property the Level 3 is designed for, and the shared structure, roof and drains form part of what you’re buying. Compare what each report covers; the final choice of survey is yours.",
  },
  {
    question: "How long does a survey take?",
    answer:
      "The duration of the survey depends on the size of the property. A Level 1 typically takes 1–2 hours and a Level 3 typically 2–3 hours. Larger or more complex properties take longer.",
  },
  {
    question: "When will I receive my report?",
    answer:
      "Level 2 within 3–5 working days and Level 3 within 5–7 working days of the inspection. Express 48-hour delivery is available.",
  },
  {
    question: "When should I book?",
    answer:
      "As soon as your offer is accepted, and before you exchange contracts, so the report is in hand while you make your decision.",
  },
  {
    question: "Which survey is designed for a new build?",
    answer:
      "Our Level 1 Condition Report is ideal for new builds and standardised properties built within the last 5-10 years. It is not suitable for older, larger or non-traditional properties.",
  },
  {
    question: "Can I add thermal imaging?",
    answer: "Yes, for £175 with a Level 2 or 3. It spots heat loss, missing insulation and hidden damp.",
  },
  {
    question: "Will you lift floorboards?",
    answer: "No. RICS surveys are non-invasive. If we suspect a hidden problem, we’ll tell you which specialist to call.",
  },
];

const H2 = "scroll-mt-6 mt-4 text-[26px] font-extrabold leading-[1.15] text-ink md:text-[30px]";

export default function LevelTwoVsThreeGuide() {
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
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Guides", href: "/guides" }, { label: "Level 2 vs Level 3" }]}
        eyebrow="Guide"
        title={TITLE}
        intro={
          <p>
            The two most common RICS surveys compared in plain English: what each inspection covers, what the report
            tells you, how long it takes and what it costs. Everything you need to make an informed choice. The final
            choice of survey is yours.
          </p>
        }
        actions={
          <>
            <ButtonLink href="#price">What it costs</ButtonLink>
            <ButtonLink href="#which" variant="outline" className="border-line-strong">
              Compare the two
            </ButtonLink>
          </>
        }
        media={
          <div className="flex flex-col gap-3.5">
            <div className="grid gap-3.5 sm:grid-cols-2">
              {PRICE_CARDS.map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group flex flex-col gap-2 rounded-[18px] border-2 border-line bg-white p-5 text-ink no-underline transition-colors hover:border-teal hover:text-ink"
                >
                  <span className="self-start rounded-full bg-mist px-[9px] py-1 text-xs font-extrabold uppercase tracking-[0.06em]">
                    {card.tag}
                  </span>
                  <span className="text-sm font-semibold text-muted-ink">{card.level}</span>
                  <b className="font-display text-[21px] leading-[1.2]">{card.name}</b>
                  <span className="font-display text-[34px] font-extrabold leading-none">{card.price}</span>
                  <span className="text-sm text-body">{card.suits}</span>
                  <span className="text-sm text-body">{card.report}</span>
                  <span className="mt-1 text-[15px] font-bold text-teal group-hover:text-teal-dark">
                    See what’s included →
                  </span>
                </Link>
              ))}
            </div>
            <span className="text-sm text-muted-ink">
              Starting prices, VAT included. Your exact price depends on property type and bedrooms. Express 48-hour
              reports available on both.
            </span>
          </div>
        }
      >
        <div className="flex flex-col border-y border-line py-5">
          <span className="text-sm text-muted-ink">Written by RICS-regulated surveyors at Rosecrest · 10 min read</span>
        </div>
      </PageHero>

      <TrustBadges variant="strip" badges={["ipws", "cabe", "rpsa", "rics", "constructionline", "safecontractor"]} />

      <section className="bg-white text-ink">
        <div className="mx-auto grid w-full max-w-[1440px] items-start gap-10 px-gutter py-14 md:py-20 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-16">
          <article className="flex min-w-0 flex-col gap-[18px] text-[17px] leading-[1.7] text-body md:text-lg">
            <div id="in-short" className="flex scroll-mt-6 flex-col gap-2.5 rounded-2xl bg-teal-tint px-6 py-6 md:px-[26px]">
              <b className="text-lg text-ink">In short</b>
              <ul className="m-0 flex list-disc flex-col gap-1.5 pl-[22px]">
                <li>
                  <b className="text-ink">Level 2 Homebuyer Survey:</b> a detailed visual inspection, ideal for modern
                  and conventional properties built in the last 30 years that are unaltered and non-extended.
                </li>
                <li>
                  <b className="text-ink">Level 3 Building Survey:</b> an in-depth inspection, ideal for older, altered or
                  non-standard buildings, heritage and listed properties, and properties requiring significant
                  renovation.
                </li>
                <li>
                  <b className="text-ink">In London</b> many homes are period terraces, conversions into flats or
                  extended homes. Compare what each report covers against the property you’re buying.
                </li>
                <li>
                  <b className="text-ink">Price difference at Rosecrest:</b> £220 between our starting prices
                  (£330.99 and £550.99 for a studio, VAT included).
                </li>
                <li>
                  <b className="text-ink">Still have questions?</b> If you ask, our trusted advisors will explain the
                  nature and scope of each survey. The final choice of survey is yours.
                </li>
              </ul>
            </div>

            <h2 id="difference" className={H2}>
              The difference in one line
            </h2>
            <p>
              A Level 2 tells you what’s wrong. A Level 3 tells you why it’s happening, what to do about it, and what
              happens if you leave it.
            </p>
            <p>
              Both are carried out by qualified and experienced surveyors at a RICS-regulated firm. Both rate the
              condition of the property green, amber or red. The Level 3 surveyor spends longer on site, looks harder at
              how the building is put together, and writes a report that helps you plan repairs and maintenance.
            </p>
            <GuideTable
              caption="Level 2 Homebuyer Survey and Level 3 Building Survey compared"
              columns={["", "Level 2 Homebuyer Survey", "Level 3 Building Survey"]}
              widths={["30%", "35%", "35%"]}
              rows={[
                [
                  "Ideal for",
                  "Modern and conventional properties built in the last 30 years",
                  "Older, altered or non-standard buildings, heritage and listed properties",
                ],
                ["Traffic-light condition ratings", "Yes", "Yes"],
                ["Advice on repairs and maintenance", "Yes", "Detailed"],
                ["Causes of defects explained", "Headline", "In depth"],
                ["Repair options and cost estimates", "No", "Optional"],
                ["Notes for your conveyancer", "Yes", "Yes"],
                ["Time on site", "Depends on the size of the property", "Usually 2–3 hours"],
                ["Report delivered", "3–5 working days", "5–7 working days"],
                ["Express 48-hour report", "Available", "Available"],
                ["Thermal imaging add-on", "£175", "£175"],
                ["Starting price (studio), VAT included", "from £330.99", "from £550.99"],
              ]}
            />

            <h2 id="which" className={H2}>
              Which properties each survey is designed for
            </h2>
            <p>
              These are the property types each RICS survey level is designed for, as set out on our survey pages.
              Compare them with the property you’re buying. If you ask, our trusted advisors will explain the
              difference between the options; the final choice of survey is yours.
            </p>
            <GuideTable
              caption="Level 1, Level 2 and Level 3 surveys: which properties each is designed for"
              columns={["", "Level 1 Condition Report", "Level 2 Homebuyer Survey", "Level 3 Building Survey"]}
              widths={["19%", "27%", "27%", "27%"]}
              minWidth={720}
              rows={[
                [
                  "Ideal for",
                  "New builds and standardised properties built within the last 5-10 years",
                  "Modern and conventional properties built in the last 30 years",
                  "Older, altered or non-standard buildings",
                ],
                [
                  "Also suited to",
                  "Unaltered and non-extended property, for a brief insight of the property condition",
                  "Unaltered and non-extended property; standard residential properties",
                  "Heritage and listed properties, and properties requiring significant renovation or restoration",
                ],
                [
                  "Not suitable for",
                  "Older, larger or non-traditional properties",
                  "Older, larger or non-traditional properties",
                  "Not applicable",
                ],
                ["Report within", "2 working days", "3–5 working days", "5–7 working days"],
                ["Starting price (studio), VAT included", "from £280.99", "from £330.99", "from £550.99"],
              ]}
            />

            <figure className="my-2 flex flex-col gap-3 rounded-[18px] bg-mist px-6 py-[26px] md:px-7">
              <div className="flex gap-0.5" role="img" aria-label="5 out of 5 stars">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} aria-hidden="true" className="h-[18px] w-[18px] fill-teal text-teal" strokeWidth={0} />
                ))}
              </div>
              <blockquote className="m-0 text-[19px] font-medium leading-[1.55] text-ink">
                “I used Rosecrest to prepare a level 3 report on a property I am purchasing. The report was detailed and
                covered everything I needed, I felt well informed during the process and it was completed in fast turn
                around”
              </blockquote>
              <figcaption className="text-sm text-muted-ink">
                <b className="text-ink">Verified Trustpilot reviewer</b> · Level 3 Building Survey, May 2026 · Trustpilot
              </figcaption>
            </figure>

            <h2 id="london" className={H2}>
              London property types and what each survey covers
            </h2>
            <p>
              National advice is written for the average English home. London’s homes aren’t average. In Kensington and
              Chelsea, 65% of homes were built before 1919. In Hammersmith and Fulham it’s 56%, and in Haringey 54%. Many
              have since been split into flats, extended into the loft, or dug out below ground.
            </p>
            <p>
              These are five features we see often on London inspections. They describe the older, altered or
              non-standard buildings the Level 3 Building Survey is designed for.
            </p>
            <ol className="m-0 flex list-none flex-col gap-3.5 p-0">
              {LONDON_FEATURES.map((feature, i) => (
                <li key={feature.title} className="flex items-start gap-[18px] rounded-[18px] border border-line p-5 md:p-6">
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-base font-bold text-white"
                  >
                    {i + 1}
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-xl font-bold text-ink">{feature.title}</h3>
                    <p className="text-base leading-[1.6] text-body">{feature.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="grid gap-3.5 sm:grid-cols-2">
              {STATS.map((stat) => (
                <div key={stat.value} className="flex flex-col gap-2 rounded-[18px] bg-navy p-6">
                  <span className="font-display text-[40px] font-extrabold leading-none text-[#7FD8C8]">{stat.value}</span>
                  <span className="text-[15px] leading-normal text-white">{stat.text}</span>
                  <a href={stat.href} className="text-xs text-navy-muted underline hover:text-white">
                    {stat.source}
                  </a>
                </div>
              ))}
            </div>

            <h2 id="price" className={H2}>
              What it costs
            </h2>
            <p>
              Every Rosecrest survey has a fixed price, VAT included, that you see before you book. It depends on the
              survey, the property type and the number of bedrooms.
            </p>
            <GuideTable
              caption="Rosecrest survey prices and report times"
              columns={["Survey", "From (VAT included)", "Report delivered"]}
              widths={["38%", "31%", "31%"]}
              rows={[
                ["Level 1 Condition Report", "£280.99", "2 working days"],
                ["Level 2 Homebuyer Survey", "£330.99", "3–5 working days"],
                ["Level 3 Building Survey", "£550.99", "5–7 working days"],
                ["Express 48-hour report", "Available on all three", "48 hours"],
                ["Thermal imaging add-on", "£175 with a Level 2 or 3", "With your report"],
                ["Damp, Mould and Condensation Survey", "£540, subject to scope", "Agreed when you book"],
              ]}
            />
            <p>
              For context, the average quote on reallymoving between January 2024 and July 2025 was £499 for a Level 2
              and £661 for a Level 3 across the UK. The HomeOwners Alliance puts typical 2026 ranges at £400–£1,000 for a
              Level 2 and £630–£1,500 for a Level 3, with London towards the top because homes cost more.
            </p>

            <h2 id="limits" className={H2}>
              What no survey can tell you, and who can
            </h2>
            <p>
              Every RICS survey is non-invasive. We won’t lift fitted carpets or floorboards, drill into walls or open
              secured panels. When we see signs of something we can’t confirm, we’ll tell you who to call. Allow time
              for this before you exchange, especially on a period home.
            </p>
            <GuideTable
              caption="Specialists to bring in after a survey"
              columns={["If the report flags", "Who to bring in"]}
              widths={["38%", "62%"]}
              minWidth={480}
              rows={[
                [
                  "Damp, condensation or mould",
                  <>
                    A{" "}
                    <Link href="/services/damp-mould" className="font-bold text-teal no-underline hover:text-teal-dark">
                      damp and mould survey
                    </Link>{" "}
                    that assesses the likely cause, where the evidence supports it, before any treatment is quoted. Ours starts from £540 including VAT.
                  </>,
                ],
                ["Cracking or movement", "A structural engineer, to judge whether movement is historic or ongoing"],
                ["Drain defects, or trees near the house on clay", "A CCTV drain survey"],
                [
                  "Old wiring or consumer unit",
                  "A qualified electrician for an electrical installation condition report (EICR)",
                ],
                ["Boiler or gas appliances", "A Gas Safe registered engineer"],
                ["Possible asbestos", "An asbestos surveyor"],
                ["Hidden heat loss or damp", "Thermal imaging, £175 added to a Level 2 or 3"],
              ]}
            />

            <h2 id="use" className={H2}>
              How to read your report
            </h2>
            <ol className="m-0 flex list-decimal flex-col gap-2.5 pl-6">
              <li>
                <b className="text-ink">Read the reds first.</b> Each condition rating 3 is a serious defect requiring
                urgent attention and repair, or a matter the surveyor says needs further investigation.
              </li>
              <li>
                <b className="text-ink">Follow up further investigations.</b> Where the report recommends a specialist,
                such as a structural engineer or a Gas Safe registered engineer, arrange it before you exchange.
              </li>
              <li>
                <b className="text-ink">Pass legal points to your conveyancer.</b> Missing sign-off for an extension,
                unclear repair liability in a lease.
              </li>
              <li>
                <b className="text-ink">Plan for the ambers.</b> Defects requiring attention and repair that are not
                urgent.
              </li>
              <li>
                <b className="text-ink">Ask us to explain.</b> If anything in the report isn’t clear, ask before you
                exchange, not after.
              </li>
            </ol>
            <p>
              As section 8 of our Terms of Engagement puts it: “The report is intended to assist decision-making only.
              The decision to proceed, renegotiate, or withdraw from a purchase is the Client’s responsibility.”
            </p>
            <InfoBox title="Questions about the survey levels?">
              Our trusted advisors will explain the nature and scope of each survey and give you a fixed fee before you
              commit. The final choice of survey is yours. <a href="#callback">Request a call back →</a>
            </InfoBox>
            <div className="border-t border-line pt-[18px] text-sm leading-[1.6] text-muted-ink">
              <b className="text-ink">Sources</b>
              <br />
              {SOURCES.map((source) => (
                <span key={source.href}>
                  <a href={source.href} className="text-muted-ink underline hover:text-ink">
                    {source.label}
                  </a>
                  {" · "}
                </span>
              ))}
              Reviews quoted from{" "}
              <a
                href="https://uk.trustpilot.com/review/rosecrestgroupltd.co.uk"
                className="text-muted-ink underline hover:text-ink"
              >
                Rosecrest on Trustpilot
              </a>
            </div>
          </article>

          <aside className="order-first rounded-2xl border border-line p-5 lg:sticky lg:top-6 lg:order-none lg:rounded-none lg:border-0 lg:p-0">
            <OnThisPage items={TOC} />
          </aside>
        </div>
      </section>

      <Section id="faqs" tone="mist">
        <SectionHeading eyebrow="FAQs" title="Level 2 vs Level 3: common questions" />
        <FaqList items={FAQS.map((faq) => ({ q: faq.question, a: <p>{faq.answer}</p> }))} />
      </Section>

      <NavyBand
        eyebrow="Book your survey"
        title="Pick the right survey"
        text="Compare the Level 1, 2 and 3 RICS surveys side by side, with fixed prices and report times, and choose the one for the property you’re buying."
        actions={
          <>
            <ButtonLink href="/homebuyer" variant="light">
              Compare RICS surveys
            </ButtonLink>
            <a
              href={PHONE_HREF}
              className="whitespace-nowrap text-center text-base font-bold text-white no-underline hover:text-white"
            >
              or call {PHONE}
            </a>
          </>
        }
      />

      <CallbackSection formName="Level 2 vs Level 3 guide call back" />
    </>
  );
}
