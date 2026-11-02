import { Fragment } from "react";
import { getPageMetadata } from "@/lib/page-metadata";
import JsonLd from "@/components/common/JsonLd";
import PageJsonLd from "@/components/common/PageJsonLd";
import CallbackSection from "@/components/site/CallbackSection";
import { Breadcrumbs, Section, SmartLink, TextLink } from "@/components/site/primitives";
import { buildFAQPage } from "@/lib/schema";

export const metadata = getPageMetadata("/faqs");

// This page's answers follow the page design and differ from the answers in
// lib/faqs.ts (still used by the service pages), so the page keeps its own copy.
// The FAQPage structured data is built from this same list, so it always matches
// what is visible here.

/** An answer is plain text with optional inline links. */
type Segment = string | { text: string; href: string };
type Faq = { q: string; a: Segment[] };
type Category = { id: string; title: string; items: Faq[] };

const CATEGORIES: Category[] = [
  {
    id: "faq-general",
    title: "General FAQs",
    items: [
      {
        q: "Who are Rosecrest Group Ltd?",
        a: [
          "A RICS-regulated firm of qualified and experienced surveyors and trade professionals, serving London and the M25.",
        ],
      },
      {
        q: "What areas do you cover?",
        a: [
          "All 32 London boroughs and the City of London, plus areas within the M25 in Surrey, Kent, Hertfordshire and Essex. ",
          { text: "Check your postcode", href: "/areas-we-cover" },
          ".",
        ],
      },
      {
        q: "Are you insured and accredited?",
        a: [
          "Yes. We are RICS-regulated, Constructionline Gold accredited and SafeContractor approved, and we hold professional indemnity insurance.",
        ],
      },
      {
        q: "How do I book a survey or inspection?",
        a: [
          "Request an inspection online or call our trusted advisors on 020 4576 5317, Mon to Fri, 8am to 5pm. We confirm a fixed price before you commit.",
        ],
      },
    ],
  },
  {
    id: "faq-rics",
    title: "RICS Surveys",
    items: [
      {
        q: "What is the difference between a Level 2 and a Level 3 survey?",
        a: [
          "A Level 2 survey suits conventional homes in reasonable condition. A Level 3 survey is a more detailed inspection for older, larger, altered or run-down properties, with more detail on defects and repairs. ",
          { text: "Compare the levels", href: "/guides/level-2-vs-level-3-survey" },
          ".",
        ],
      },
      {
        q: "How long does a survey take?",
        a: [
          "The inspection typically takes 1 to 2 hours for a Level 1 survey and 2 to 3 hours for a Level 3 survey, depending on the size and condition of the property.",
        ],
      },
      {
        q: "When will I receive my report?",
        a: [
          "Level 1 within 2 working days, Level 2 in 3 to 5 working days and Level 3 in 5 to 7 working days. An express 48-hour report option is available.",
        ],
      },
      {
        q: "Will I receive photographs in my report?",
        a: ["Yes. Defects are photographed and explained in the report."],
      },
      {
        q: "Can you survey vacant or tenanted properties?",
        a: ["Yes. We arrange access with the estate agent, seller or managing agent."],
      },
    ],
  },
  {
    id: "faq-damp",
    title: "Damp, Mould & Condensation Services",
    items: [
      {
        q: "Do you carry out damp and mould testing?",
        a: [
          "Yes. Our Damp, Mould and Condensation Survey is a visual, non-invasive inspection of the accessible affected areas, with thermal imaging and indicative moisture readings where appropriate and available. It looks for evidence of causes such as condensation, penetrating or rising damp, or leaks. The report identifies likely causes where supported by the findings and recommends further investigation where necessary.",
        ],
      },
      {
        q: "What’s included in a Damp & Mould Condition Report?",
        a: [
          "The affected areas and visible conditions, photographs, relevant readings where appropriate, evidence of potential contributing factors, likely causes where supported by the findings, and recommended next steps, including any further investigation needed.",
        ],
      },
      {
        q: "Can you carry out remedial works as well as reports?",
        a: [
          "Yes, including mould treatment at £25 per m² plus VAT, subject to exact measurement. When we are instructed as an expert witness, our role is independent evidence for the court only, and we do not quote for or carry out works on that property.",
        ],
      },
    ],
  },
  {
    id: "faq-cpr",
    title: "CPR 35 Expert Witness Reports",
    items: [
      {
        q: "What is a CPR-35 Expert Witness Report?",
        a: [
          "An independent expert report prepared for the court under Part 35 of the Civil Procedure Rules, including the expert’s declaration and statement of truth.",
        ],
      },
      {
        q: "Who do you prepare reports for?",
        a: [
          "Solicitors acting for tenants or landlords, whether we are instructed by one party or as a single joint expert.",
        ],
      },
      {
        q: "How long does it take to produce an expert report?",
        a: ["It depends on the case. Tell us your deadline when you instruct us."],
      },
    ],
  },
  {
    id: "faq-party",
    title: "Party Wall & Boundary Services",
    items: [
      {
        q: "What is the Party Wall etc. Act 1996?",
        a: [
          "The law in England and Wales that sets out how building work on shared walls, on boundaries and near a neighbour’s foundations must be notified and, if there is a dispute, settled by party wall surveyors.",
        ],
      },
      {
        q: "Do you act for both sides?",
        a: [
          "Yes, as the agreed surveyor, if both owners agree to appoint us. Otherwise we act for either the building owner or the adjoining owner.",
        ],
      },
      {
        q: "How long does the Party Wall process take?",
        a: [
          "Notices are served one to two months before work starts, and neighbours have 14 days to respond. Where an award is needed, it typically takes 6 to 12 weeks.",
        ],
      },
    ],
  },
  {
    id: "faq-epc",
    title: "Energy Performance Certificates (EPCs)",
    items: [
      { q: "How long is an EPC valid for?", a: ["10 years."] },
      {
        q: "Do landlords need an EPC before letting?",
        a: ["Yes. You need a valid EPC before you let, and rented homes must meet the minimum rating."],
      },
      { q: "How quickly can I get an EPC?", a: ["Usually within a few days of booking."] },
    ],
  },
  {
    id: "faq-assoc",
    title: "AssocRICS Mentoring & Counsellor Support",
    items: [
      {
        q: "Who is this service for?",
        a: ["Surveying professionals working towards Associate membership of RICS."],
      },
      { q: "Is this for AssocRICS only?", a: ["Yes. This service is for the AssocRICS pathway only."] },
      {
        q: "Will Rosecrest write my assessment submissions?",
        a: [
          "No. All assessment documents must be your own original work. We provide developmental guidance and feedback.",
        ],
      },
      {
        q: "What is the Official Counsellor Appointment and Governance Fee?",
        a: [
          "£450 incl. VAT, which applies where Rosecrest formally accepts the appointment as your counsellor. Counsellor approval cannot be guaranteed or purchased.",
        ],
      },
      { q: "How do I get started?", a: ["Book the free 30-minute suitability call."] },
    ],
  },
  {
    id: "faq-thermo",
    title: "Thermographic Building Surveys",
    items: [
      {
        q: "What is a thermographic survey?",
        a: [
          "A surveyor-led inspection using thermal imaging to record surface-temperature patterns, which can point to heat loss, moisture and air leakage, with a written report.",
        ],
      },
      {
        q: "What does the price include?",
        a: [
          "The inspection, thermal and standard photographs, professional interpretation and a written report with practical recommendations.",
        ],
      },
      { q: "Can I add this to a Level 2 or Level 3 survey?", a: ["Yes, for £175 incl. VAT."] },
      {
        q: "Does thermal imaging see through walls?",
        a: [
          "No. It records surface-temperature patterns and does not see through walls, ceilings, floors or other building elements.",
        ],
      },
      {
        q: "When might further investigation be needed?",
        a: [
          "When the cause or extent of a concealed defect remains uncertain. Further intrusive or specialist investigation may then be recommended.",
        ],
      },
    ],
  },
  {
    id: "faq-build",
    title: "Building and Maintenance Services",
    items: [
      {
        q: "What types of works do you carry out?",
        a: [
          "Plastering, plumbing, tiling, carpentry and flooring, painting and decorating, handyman and maintenance work, deep and specialist cleaning, house clearance and mould treatment.",
        ],
      },
      { q: "Are your operatives qualified?", a: ["Yes."] },
      { q: "Can you handle larger contracts?", a: ["Yes, across multiple properties and programmes of work."] },
    ],
  },
  {
    id: "faq-pricing",
    title: "Pricing & Payment",
    items: [
      {
        q: "How are fees calculated?",
        a: ["By service, property type and size. You receive a fixed price before you book."],
      },
      {
        q: "Do you charge VAT?",
        a: [
          "Thermographic and AssocRICS prices shown include VAT; mould treatment is £25 per m² plus VAT.",
        ],
      },
      {
        q: "What payment methods are accepted?",
        a: ["We confirm payment details when you book. Payment secures your booking."],
      },
    ],
  },
];

const plainText = (segments: Segment[]) => segments.map((s) => (typeof s === "string" ? s : s.text)).join("");

const SCHEMA_ITEMS = CATEGORIES.flatMap((c) => c.items.map((item) => ({ question: item.q, answer: plainText(item.a) })));

export default function FaqsPage() {
  return (
    <>
      <PageJsonLd path="/faqs" />
      <JsonLd data={buildFAQPage(SCHEMA_ITEMS)} id="faqs" />

      <section className="bg-mist text-ink">
        <div className="mx-auto w-full max-w-[1440px] px-gutter pb-14 pt-4 md:pb-[72px]">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "FAQs" }]} />
          <div className="mt-10 flex max-w-[900px] flex-col gap-[18px] md:mt-14">
            <h1 className="text-[38px] font-extrabold leading-[1.04] md:text-[54px]">Frequently Asked Questions</h1>
            <p className="max-w-[680px] text-xl text-body">
              Here are answers to the most common questions about our property surveys, valuations, and reports.
            </p>
          </div>
        </div>
      </section>

      <Section>
        <nav aria-label="FAQ categories" className="flex flex-wrap gap-2.5">
          {CATEGORIES.map((c) => (
            <SmartLink
              key={c.id}
              href={`#${c.id}`}
              className="rounded-full border border-line bg-white px-4 py-[9px] text-[15px] text-ink no-underline hover:border-teal hover:text-ink"
            >
              {c.title}
            </SmartLink>
          ))}
        </nav>

        <div>
          {CATEGORIES.map((c) => (
            <div
              key={c.id}
              id={c.id}
              className="grid scroll-mt-24 gap-4 border-t border-line py-9 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12"
            >
              <h2 className="text-[24px] font-extrabold leading-[1.2] md:text-[26px]">{c.title}</h2>
              <div className="grid md:grid-cols-2 md:gap-x-14">
                {c.items.map((item) => (
                  <div key={item.q} className="flex flex-col gap-2 border-t border-line py-[22px]">
                    <h3 className="font-body text-lg font-bold leading-[1.35] tracking-normal">{item.q}</h3>
                    <p className="text-base text-body">
                      {item.a.map((s, i) =>
                        typeof s === "string" ? (
                          <Fragment key={i}>{s}</Fragment>
                        ) : (
                          <TextLink key={i} href={s.href}>
                            {s.text}
                          </TextLink>
                        ),
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <CallbackSection formName="FAQs page call back" />
    </>
  );
}
