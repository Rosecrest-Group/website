import { BrickWall, Check, Droplet, FileText, Home as HomeIcon, Scale, ShieldCheck, Users } from "lucide-react";
import { getPageMetadata } from "@/lib/page-metadata";
import { buildFAQPage } from "@/lib/schema";
import { EMAIL, EMAIL_HREF, PHONE, PHONE_HREF } from "@/lib/constants";
import JsonLd from "@/components/common/JsonLd";
import PageJsonLd from "@/components/common/PageJsonLd";
import CallbackSection from "@/components/site/CallbackSection";
import InstructionForm from "@/components/site/professional/InstructionForm";
import {
  FeatureCard,
  FramedPhoto,
  HeroPills,
  type PageFaq,
  Testimonial,
  TintNote,
  toFaqList,
  toFaqSchema,
} from "@/components/site/professional/parts";
import {
  ButtonLink,
  Eyebrow,
  FaqList,
  NoteStrip,
  PageHero,
  Section,
  SectionHeading,
  StepNumber,
  TextLink,
} from "@/components/site/primitives";

export const metadata = getPageMetadata("/legal");

const MATTERS = [
  {
    icon: FileText,
    title: "Housing Disrepair Claims",
    text: "Independent inspections and reports assessing property condition, defects and repair responsibilities.",
    link: { href: "/services/housing-disrepair", label: "Housing disrepair surveys →" },
  },
  {
    icon: HomeIcon,
    title: "Structural Defect Inspections",
    text: "Inspection of cracking, movement and structural concerns with professional observations on condition.",
  },
  {
    icon: Droplet,
    title: "Damp & Mould Investigations",
    text: "Assessment of damp, mould and condensation issues, including visible conditions, potential contributing factors and likely causes where the findings support them.",
    link: { href: "/services/damp-mould", label: "Damp and mould surveys →" },
  },
  {
    icon: BrickWall,
    title: "Water Ingress & Building Defects",
    text: "Investigation of water penetration and building defects affecting the condition of the property.",
  },
  {
    icon: Scale,
    title: "Property Condition for Litigation",
    text: "Independent condition assessments prepared to support ongoing legal matters.",
    link: { href: "/services/cpr-35-reports", label: "CPR 35 expert reports →" },
  },
  {
    icon: Users,
    title: "Landlord & Tenant Disputes",
    text: "Objective inspections to assess property condition where disputes have arisen between parties.",
  },
];

const CREDENTIALS = [
  {
    icon: ShieldCheck,
    title: "RICS Regulated Firm",
    text: "Regulated by RICS and operating to recognised professional standards.",
  },
  {
    icon: FileText,
    title: "CPR-35 Experience",
    text: "Experienced in preparing reports that meet the requirements of the Civil Procedure Rules.",
    link: { href: "/services/cpr-35-reports", label: "CPR 35 reports →" },
  },
  {
    icon: Scale,
    title: "Professional Indemnity Cover",
    text: "Appropriate professional indemnity insurance in place for expert reporting work.",
  },
  {
    icon: Check,
    title: "Independent Opinion",
    text: "Objective inspections and evidence-based findings prepared with professional independence.",
    link: { href: "/services/cpr-35-reports#independence", label: "Independence policy →" },
  },
];

const STEPS = [
  {
    title: "Initial Instruction Discussion",
    text: "Scope, purpose of report, property details and timescales are discussed with the instructing solicitor.",
  },
  {
    title: "Conflict & Scope Confirmation",
    text: "Independence is confirmed and the agreed scope of inspection and reporting is set out in writing.",
  },
  {
    title: "Inspection & Evidence Gathering",
    text: "Inspection carried out in accordance with agreed scope, with photographic and documentary evidence recorded.",
  },
  {
    title: "Report Preparation & Issue",
    text: "A clear, reasoned report is prepared and issued in line with professional standards.",
  },
  {
    title: "Clarifications (if required)",
    text: "Reasonable clarification provided without straying beyond agreed scope.",
  },
];

const FAQS: PageFaq[] = [
  {
    question: "What should a CPR 35 expert witness report include?",
    answer:
      "A Part 35 compliant expert witness report should include both the facts and the assumptions used by the expert, any analysis, and the expert’s opinion on the matter.",
    content: (
      <>
        A Part 35 compliant expert witness report should include both the facts and the assumptions used by the
        expert, any analysis, and the expert’s opinion on the matter.{" "}
        <TextLink href="/services/cpr-35-reports">CPR 35 expert witness reports →</TextLink>
      </>
    ),
  },
  {
    question: "Do you accept Legal Aid instructions?",
    answer:
      "Yes, subject to scope and approval requirements. We’re happy to discuss Legal Aid matters to confirm eligibility and reporting requirements.",
  },
  {
    question: "How do you confirm independence?",
    answer:
      "Independence is confirmed and the agreed scope of inspection and reporting is set out in writing before the inspection.",
    content: (
      <>
        Independence is confirmed and the agreed scope of inspection and reporting is set out in writing before the
        inspection. <TextLink href="/services/cpr-35-reports#independence">Our independence policy →</TextLink>
      </>
    ),
  },
  {
    question: "Will you act as single joint expert?",
    answer: "Yes, pre-action or under a court order. Both parties’ questions are answered in the same report.",
  },
  {
    question: "How fast can you inspect and report?",
    answer:
      "We confirm an inspection date as soon as access is arranged. Tell us your deadline up front and we’ll tell you straight away whether we can meet it.",
  },
  {
    question: "Which property disputes do you report on?",
    answer:
      "Housing disrepair claims, structural defects, damp and mould, water ingress and building defects, property condition for litigation, and landlord and tenant disputes.",
  },
];

const TESTIMONIAL =
  "We have consistently found Rosecrest Group Ltd’s expert reports to be professional, detailed, and highly reliable. In particular, their CPR Part 35-compliant reports and damp and mould investigations are thorough and clearly presented, making them well-suited for litigation purposes. The staff have been consistently helpful, professional, and responsive throughout our dealings, which has made the instruction process straightforward and efficient. Their reports have greatly assisted our clients in pursuing claims against their landlords by clearly identifying defects, causation, and the extent of disrepair. The findings have been instrumental in evidencing issues such as damp, mould, and structural defects, as well as ensuring that appropriate remedial work is recommended.";

export default function LegalPage() {
  return (
    <>
      <PageJsonLd path="/legal" />
      <JsonLd data={buildFAQPage(toFaqSchema(FAQS))} id="legal-faq" />

      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Solicitors and legal professionals" }]}
        eyebrow="Expert witness surveyors and CPR 35 reports for solicitors"
        title="Independent Property Inspection and Expert Reporting for Legal Matters"
        intro={
          <>
            <p>
              Independent inspections and professional reports prepared to support legal claims, housing disputes and
              formal proceedings with clear, evidence-based findings.
            </p>
            <p className="text-[17px]">
              Legal instructions require independence, clarity and reporting prepared in accordance with relevant
              professional standards. Our inspections assess issues such as damp, mould, structural defects, water
              ingress and general property condition, supported by photographic evidence and professional analysis.
              Reports record clear findings and visible defects, assess likely causes based on the evidence available, and set out an impartial
              professional opinion suitable for legal review.
            </p>
          </>
        }
        media={
          <FramedPhoto
            src="/assets/images/legal-disc.png"
            alt="Moisture meter, tape measure and defect notes beside a mould-damaged wall during an expert inspection"
            className="md:h-[460px]"
            priority
          />
        }
      >
        <div className="flex flex-wrap items-center gap-3.5">
          <ButtonLink href="#instruct">Discuss an instruction</ButtonLink>
          <TextLink href="/services/cpr-35-reports" className="text-[15px]">
            CPR 35 expert witness reports →
          </TextLink>
        </div>
        <HeroPills items={["Independent Expert Reports", "Evidence Based Assessments", "Legal Ready Reports"]} />
      </PageHero>

      <Section>
        <SectionHeading
          eyebrow="Expert witness surveys for housing and property disputes"
          title="Legal Matters We Support"
          intro="Rosecrest provides independent property inspections and expert reporting across a range of property-related legal matters, including:"
        />
        <div className="grid gap-[18px] md:grid-cols-2 lg:grid-cols-3">
          {MATTERS.map((item) => (
            <FeatureCard key={item.title} icon={item.icon} title={item.title} text={item.text} link={item.link} />
          ))}
        </div>
      </Section>

      <Section tone="mist">
        <SectionHeading
          eyebrow="Credentials"
          title="Professional Standards & Credentials"
          intro="The standards and professional safeguards behind our expert reporting services."
        />
        <div className="grid gap-[18px] md:grid-cols-2 lg:grid-cols-4">
          {CREDENTIALS.map((item) => (
            <FeatureCard key={item.title} icon={item.icon} title={item.title} text={item.text} link={item.link} />
          ))}
        </div>
        <div className="grid gap-[18px] md:grid-cols-2">
          <TintNote title="Our duty is to the court">
            Whoever instructs us, an expert’s overriding duty is to the court: to provide an independent, impartial
            opinion. Every expert witness instruction is subject to a conflict-of-interest assessment before acceptance, ensuring that the appointed surveyor can fulfil their duty to provide independent and impartial evidence.
          </TintNote>
          <TintNote title="A separate service">
            When we’re instructed as an expert witness, our role is independent evidence only. We don’t quote for or
            carry out repairs or mould treatment on that property as part of, or alongside, that instruction.{" "}
            <TextLink href="/services/cpr-35-reports#independence">Read our independence policy →</TextLink>
          </TintNote>
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="How to instruct an expert witness surveyor"
          title="Our Instruction Process"
          intro="A structured approach ensuring clarity, independence and professional standards throughout"
        />
        <ol className="m-0 grid list-none gap-7 p-0 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex flex-col gap-2.5">
              <StepNumber n={i + 1} />
              <b className="text-lg text-ink">{step.title}</b>
              <span className="text-[15px] text-body">{step.text}</span>
            </li>
          ))}
        </ol>
        <TextLink href="/services/cpr-35-reports" className="self-start">
          How our CPR 35 expert witness reports work →
        </TextLink>
      </Section>

      <Section tone="mist">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-16">
          <SectionHeading
            eyebrow="Legal aid"
            title="Legal Aid Instructions"
            intro="Rosecrest accepts instructions funded by Legal Aid, subject to scope and approval requirements. We are happy to discuss Legal Aid matters to confirm eligibility and reporting requirements."
          />
          <div className="flex lg:justify-end">
            <ButtonLink href="#instruct">Discuss an instruction</ButtonLink>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Testimonial"
          title="Trusted by Solicitors"
          intro="Hear from legal professionals who regularly instruct Rosecrest for independent inspections and expert reporting."
        />
        <Testimonial quote={TESTIMONIAL} name="Din Solicitors" role="Trusted Solicitors for Claims" />
      </Section>

      <Section tone="mist">
        <SectionHeading eyebrow="Questions" title="What solicitors ask us" />
        <FaqList items={toFaqList(FAQS)} />
      </Section>

      <section id="instruct" className="scroll-mt-24 bg-navy text-white">
        <div className="mx-auto grid w-full max-w-[1440px] items-start gap-10 px-gutter py-14 md:py-20 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div className="flex flex-col gap-[18px]">
            <Eyebrow className="text-[#7FD8C8]">Instruct an expert</Eyebrow>
            <h2 className="text-[30px] font-extrabold leading-[1.08] md:text-[40px]">How To Instruct Rosecrest</h2>
            <p className="text-lg text-navy-soft">
              For new instructions or enquiries please contact our team and we will be happy to assist.
            </p>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-base text-navy-soft">
              <li>Legal Aid instructions accepted</li>
              <li>Independence confirmed on every instruction</li>
              <li>Scope agreed in writing</li>
            </ul>
            <div className="flex flex-col gap-1 border-t border-[#2E4166] pt-[18px]">
              <span className="text-[13px] text-navy-text">Rather call or email?</span>
              <a
                href={PHONE_HREF}
                className="whitespace-nowrap font-display text-2xl font-extrabold text-white no-underline hover:text-white"
              >
                {PHONE}
              </a>
              <a href={EMAIL_HREF} className="break-all text-white no-underline hover:text-white">
                {EMAIL}
              </a>
            </div>
          </div>
          <InstructionForm />
        </div>
      </section>

      <NoteStrip>
        Looking for a different service? <TextLink href="/services">View all property services</TextLink>
      </NoteStrip>

      <CallbackSection formName="Legal page call back" defaultNeeds={["CPR 35 expert witness report"]} />
    </>
  );
}
