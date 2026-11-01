import { getPageMetadata } from "@/lib/page-metadata";
import { PHONE, PHONE_HREF } from "@/lib/constants";
import PageJsonLd from "@/components/common/PageJsonLd";
import CallbackSection from "@/components/site/CallbackSection";
import { FramedPhoto, NavyBand, Testimonial, toFaqList, type PageFaq } from "@/components/site/professional/parts";
import {
  ButtonLink,
  CheckList,
  FaqList,
  NoteStrip,
  PageHero,
  RelatedLinks,
  Section,
  SectionHeading,
  StepNumber,
  TextLink,
} from "@/components/site/primitives";

export const metadata = getPageMetadata("/services/cpr-35-reports");

const SERVICES = [
  "Building defects and poor workmanship",
  "Damage arising from building or renovation works",
  "Cracking, movement and structural concerns",
  "Damp, water ingress and associated damage",
  "Repair liability and remedial works disputes",
  "Neighbouring property damage and related building issues",
];

const REPORT_CONTENTS = [
  "Relevant material facts",
  "Assumptions relied upon",
  "Technical analysis",
  "Independent expert opinion",
  "Basis of conclusions reached",
  "Expert qualifications and declaration",
];

const PROCESS = [
  {
    title: "Review and inspection",
    text: "We begin by thoroughly reviewing the nature of your property dispute or related matter, gathering the necessary documents and evidence for a comprehensive assessment. This is followed by an in-depth property evaluation, including site inspections guided by legislative requirements, Building Regulations and local authority standards.",
  },
  {
    title: "Report and evidence",
    text: "After completing the analysis, we compile our findings into a detailed report, incorporating the relevant legal frameworks and our expert opinion. Should your case require legal proceedings, we are prepared to serve as expert witnesses, providing clear and well-reasoned evidence to assist the court.",
  },
  {
    title: "After the case",
    text: "Once the case is resolved, we will meet with you to discuss the outcome, offer any further recommendations and make sure you are fully informed and satisfied with our service.",
  },
];

const POLICY: { title: string; text: React.ReactNode }[] = [
  {
    title: "Our duty is to the court",
    text: "Not to the party paying us. Our opinions are our own, reasoned and supported by evidence.",
  },
  {
    title: "Every instruction is conflict-checked",
    text: "We check for any connection to the parties or the property before the letter of instruction, on anonymised details if names can’t be released yet. The other party on every case is logged, and landlords in live tenant-side cases are excluded from our marketing.",
  },
  {
    title: "Both sides, never against ourselves",
    text: "We accept instructions from solicitors acting for tenants and for landlords, and as single joint expert. We never act for and against the same landlord at the same time.",
  },
  {
    title: "Expert work kept separate from remedial work",
    text: "When we’re instructed as an expert witness on a property, we don’t quote for or carry out repairs or mould treatment on it as part of, or alongside, that instruction. This applies only to properties where we are the expert.",
  },
  {
    title: "Financial dependence is disclosed",
    text: "In line with the RICS professional statement for surveyors acting as expert witnesses, new edition in force from 30 November 2026, we disclose where fees from one client form a significant share of our expert witness income.",
  },
  {
    title: "Use of technology is disclosed",
    text: "If any part of a report is assisted by software or AI tools, we say so. Every opinion is the expert’s own.",
  },
  {
    title: "Raising a concern",
    text: (
      <>
        Ask about a potential conflict before you instruct and we’ll confirm in writing. Rosecrest Group Ltd is a
        RICS-regulated firm. Complaints follow our <TextLink href="/complaints-procedure">published procedure</TextLink>
        , with escalation to our independent redress provider, the Centre for Effective Dispute Resolution (CEDR).
      </>
    ),
  },
];

// FAQPage structured data for this route comes from the "cpr35" category in lib/faqs.ts (via PageJsonLd).
const FAQS: PageFaq[] = [
  {
    question: "What is a CPR 35 expert witness report?",
    answer:
      "A report prepared by an independent expert under Part 35 of the Civil Procedure Rules and its Practice Direction, to help the court with technical matters outside ordinary knowledge. It sets out the facts and assumptions relied upon, the analysis, and the expert’s opinion with the basis for it, together with the expert’s qualifications and declaration.",
  },
  {
    question: "Who do you prepare reports for?",
    answer:
      "Solicitors and legal professionals acting for claimants or defendants in property and building disputes, including housing disrepair claims. Whoever instructs us, our duty is to the court. When we are instructed as an expert witness, our role is independent evidence for the court only.",
  },
  {
    question: "How long does it take to produce an expert report?",
    answer:
      "We confirm an inspection date as soon as access is arranged. Tell us your deadline or any court directions when you enquire and we’ll confirm whether we can meet it.",
  },
  {
    question: "What does a building surveyor expert witness report on?",
    answer:
      "Building defects and poor workmanship, damage from building or renovation works, cracking, movement and structural concerns, damp and water ingress, repair liability and remedial works disputes, and damage to neighbouring property.",
  },
  {
    question: "Will the expert give evidence in court?",
    answer:
      "Yes, if your case requires it. When giving evidence, as in the written report, the expert’s duty is to the court.",
  },
  {
    question: "Do you accept Legal Aid instructions?",
    answer:
      "Yes, subject to scope and approval requirements. We’re happy to discuss Legal Aid matters to confirm eligibility and reporting requirements.",
  },
];

const TESTIMONIAL =
  "We have consistently found Rosecrest Group Ltd’s expert reports to be professional, detailed, and highly reliable. In particular, their CPR Part 35-compliant reports and damp and mould investigations are thorough and clearly presented, making them well-suited for litigation purposes. The staff have been consistently helpful, professional, and responsive throughout our dealings, which has made the instruction process straightforward and efficient. Their reports have greatly assisted our clients in pursuing claims against their landlords by clearly identifying defects, causation, and the extent of disrepair. The findings have been instrumental in evidencing issues such as damp, mould, and structural defects, as well as ensuring that appropriate remedial work is recommended.";

export default function Cpr35Page() {
  return (
    <>
      <PageJsonLd path="/services/cpr-35-reports" />

      <PageHero
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Solicitors", href: "/legal" },
          { label: "CPR 35 expert witness reports" },
        ]}
        eyebrow="CPR 35 expert witness reports, London"
        title="Expert Witness Surveyor: CPR 35 Rules & Inspections"
        intro={
          <p>
            Rosecrest provides expert witness surveyors for property and building disputes across London and areas
            within the M25. A Part 35 compliant expert witness report should include both the facts and the
            assumptions used by the expert. It should also include any analysis and the expert’s opinion on the
            matter.
          </p>
        }
        media={
          <FramedPhoto
            src="/assets/images/cpr.png"
            alt="Expert witness surveyor recording evidence during a CPR 35 building inspection in London"
            priority
          />
        }
      />

      <Section>
        <div className="flex max-w-[860px] flex-col gap-5">
          <h2 className="text-[30px] font-extrabold leading-[1.08] md:text-[40px]">
            CPR 35 Expert Witness Inspections Explained
          </h2>
          <p className="text-[17px] text-body">
            We provide expert witness inspections and building reports prepared in accordance with CPR Part 35 and the
            associated Practice Direction. In these matters, the expert’s overriding duty is to the court: to provide
            an independent, impartial and professionally reasoned opinion on technical building issues to assist the
            judge in determining the dispute.
          </p>
          <p className="text-[17px] text-body">
            Each instruction is approached carefully and objectively. Our reports set out the relevant facts, the
            assumptions relied upon, the analysis undertaken and the expert opinion reached, together with the basis
            for that opinion and the expert’s qualifications. Reports are prepared clearly and professionally so they
            can properly assist the court in understanding technical matters that fall outside ordinary knowledge.
          </p>
          <p className="text-[17px] text-body">
            Whether the dispute concerns the cause of damage, the standard of works carried out or the extent of
            necessary repairs, we provide focused building inspections and expert reporting to support legal
            proceedings with clarity and independence.
          </p>
          <div>
            <ButtonLink href="/legal#instruct">Make an enquiry</ButtonLink>
          </div>
        </div>
      </Section>

      <Section tone="mist">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-6">
            <h2 className="text-[26px] font-extrabold leading-[1.08] md:text-[30px]">
              Our CPR Part 35 expert services may include
            </h2>
            <CheckList items={SERVICES} className="gap-3.5" />
          </div>
          <div className="flex flex-col gap-6">
            <h2 className="text-[26px] font-extrabold leading-[1.08] md:text-[30px]">
              What our CPR 35 expert reports include
            </h2>
            <CheckList items={REPORT_CONTENTS} className="gap-3.5" />
          </div>
        </div>
        <p className="text-lg text-body">
          If you require an expert witness inspection or CPR Part 35 building report,{" "}
          <TextLink href="/legal#instruct">contact us to discuss your matter</TextLink>.
        </p>
      </Section>

      <Section>
        <SectionHeading title="Expert Witness Process" />
        <ol className="m-0 grid list-none gap-10 p-0 md:grid-cols-3">
          {PROCESS.map((step, i) => (
            <li key={step.title} className="flex flex-col gap-2.5">
              <StepNumber n={i + 1} />
              <h3 className="font-body text-lg font-bold tracking-normal text-ink">{step.title}</h3>
              <p className="text-base text-body">{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="mist">
        <SectionHeading
          title="Testimonials from Solicitors"
          intro="Here’s what the solicitors who instruct us are saying."
        />
        <Testimonial
          quote={TESTIMONIAL}
          name="Din Solicitors"
          role="Trusted Solicitors for Claims"
          className="max-w-[960px]"
        />
      </Section>

      <NavyBand
        title="Need help quickly?"
        text="Speak to our expert team to discuss your requirements or book your inspection today."
        kicker="RICS Regulated · Independent"
        actions={
          <>
            <ButtonLink href="#callback" variant="light">
              Request a discussion
            </ButtonLink>
            <a href={PHONE_HREF} className="whitespace-nowrap px-2.5 py-[15px] font-bold text-white no-underline hover:text-white">
              or call {PHONE}
            </a>
          </>
        }
      />

      <NoteStrip>
        Looking for a different service? <TextLink href="/services">View all property services</TextLink>
      </NoteStrip>

      <Section id="independence" tone="tint">
        <SectionHeading
          eyebrow="Expert witness independence"
          title="Our independence policy"
          intro="The rules we follow so solicitors and the court can rely on our expert evidence."
        />
        <ol className="m-0 grid list-none gap-x-14 gap-y-[22px] p-0 md:grid-cols-2">
          {POLICY.map((item, i) => (
            <li key={item.title} className="flex items-start gap-3.5 border-t border-teal-line pt-[18px]">
              <span aria-hidden="true" className="shrink-0 font-display text-[15px] font-extrabold text-teal">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-col gap-1">
                <b className="text-[17px] text-ink">{item.title}</b>
                <p className="text-[15px] text-body">{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="text-base text-body">
          Questions about a potential conflict? <TextLink href="/legal#instruct">Send us your instruction</TextLink> or
          call{" "}
          <a href={PHONE_HREF} className="font-bold text-ink no-underline hover:text-ink">
            {PHONE}
          </a>
          . We can check on anonymised details if you prefer.
        </p>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="CPR 35 expert witness reports"
          title="Frequently asked questions"
          intro="Here are answers to the most common questions about our CPR 35 expert witness reports."
        />
        <FaqList items={toFaqList(FAQS)} />
        <RelatedLinks
          label="Related:"
          links={[
            { label: "Solicitors and legal professionals", href: "/legal" },
            { label: "Housing disrepair surveys", href: "/services/housing-disrepair" },
            { label: "Our independence policy", href: "#independence" },
          ]}
        />
      </Section>

      <CallbackSection formName="CPR 35 page call back" defaultNeeds={["CPR 35 expert witness report"]} />
    </>
  );
}
