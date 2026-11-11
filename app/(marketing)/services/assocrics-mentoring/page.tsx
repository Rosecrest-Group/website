import { getPageMetadata } from "@/lib/page-metadata";
import { PHONE, PHONE_HREF } from "@/lib/constants";
import PageJsonLd from "@/components/common/PageJsonLd";
import CallbackSection from "@/components/site/CallbackSection";
import EnquiryButton from "@/components/site/service-pages/EnquiryButton";
import {
  CheckList,
  FaqList,
  PageHero,
  Photo,
  Section,
  SectionHeading,
  SmartLink,
  type FaqItem,
} from "@/components/site/primitives";

export const metadata = getPageMetadata("/services/assocrics-mentoring");

const SERVICE = "AssocRICS Mentoring";
const SUITABILITY_CALL = "AssocRICS Mentoring — free suitability call";

const SERVICES_INCLUDE = [
  "Initial eligibility and suitability discussions.",
  "Pathway and competency mapping.",
  "Structured professional-development planning.",
  "Regular progress and competency reviews.",
  "Review of experience records, CPD and supporting evidence.",
  "Developmental feedback on candidate-prepared submissions.",
  "Guidance on case-study selection and structure.",
  "Ethics and professional-practice preparation.",
  "Mock assessment interviews.",
  "Official RICS counsellor support, where Rosecrest has formally accepted the appointment.",
];

const PRICING = [
  { service: "Initial 30-minute suitability call", price: "Free" },
  { service: "One-hour pathway and competency consultation", price: "£120 incl. VAT" },
  { service: "Pay-as-you-go mentoring (per hour)", price: "£120 incl. VAT" },
  { service: "Mock Associate assessment with feedback", price: "£240 incl. VAT" },
  { service: "Submission compliance review", price: "£360 incl. VAT" },
  { service: "Re-review following candidate amendments", price: "£180 incl. VAT" },
  { service: "Monthly mentoring: one meeting", price: "£275 incl. VAT" },
  { service: "Monthly mentoring: two meetings", price: "£395 incl. VAT" },
  { service: "Official Counsellor Appointment and Governance Fee", price: "£450 incl. VAT" },
  { service: "Referred-candidate review and recovery plan", price: "£295 incl. VAT" },
];

const PACKAGE_INCLUDES = [
  "Initial eligibility and suitability assessment.",
  "Pathway and competency mapping.",
  "Two one-hour meetings each month.",
  "Written actions following each meeting.",
  "Review of competency evidence and CPD.",
  "Developmental comments on candidate-prepared documents.",
  "Ethics and professional-practice preparation.",
  "One mock assessment.",
  "Continuing monitoring of assessment readiness.",
];

const FAQS: FaqItem[] = [
  {
    q: "Who is this service for?",
    a: (
      <p>
        Surveying professionals working towards Associate membership of RICS (AssocRICS) who want structured mentoring
        and developmental feedback.
      </p>
    ),
  },
  {
    q: "Is this for AssocRICS only?",
    a: <p>Yes. This service is for the AssocRICS pathway only.</p>,
  },
  {
    q: "Will Rosecrest write my assessment submissions?",
    a: (
      <p>
        No. All assessment documents must be your own original work. We give developmental guidance and feedback on
        documents you prepare.
      </p>
    ),
  },
  {
    q: "What is the Official Counsellor Appointment and Governance Fee?",
    a: (
      <p>
        A £450 fee (incl. VAT) that applies where Rosecrest formally accepts an appointment as your counsellor.
        Counsellor approval is an independent professional judgement and cannot be guaranteed or purchased.
      </p>
    ),
  },
  {
    q: "How do I get started?",
    a: (
      <p>
        Book your free 30-minute suitability call. We’ll discuss your pathway, check eligibility and explain the support
        options.
      </p>
    ),
  },
  {
    q: "What is AssocRICS?",
    a: (
      <p>
        AssocRICS is the Associate grade of membership of RICS. Candidates are assessed on their experience and
        competencies, and assessment and membership decisions rest with RICS.
      </p>
    ),
  },
  {
    q: "Can I get an RICS mentor for my AssocRICS assessment?",
    a: (
      <p>
        Yes. Our structured mentoring covers pathway and competency mapping, evidence reviews and mock assessments, and,
        where Rosecrest has formally accepted the appointment, official RICS counsellor support.
      </p>
    ),
  },
];

const HERO_PILLS = ["AssocRICS pathway support", "Structured mentoring", "Developmental feedback"];

export default function AssocRicsMentoringPage() {
  return (
    <>
      <PageJsonLd path="/services/assocrics-mentoring" />

      <PageHero
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: "AssocRICS mentoring" },
        ]}
        title="AssocRICS Candidate Mentoring & Counsellor Support"
        intro={
          <>
            <p className="text-[21px] font-semibold text-ink">
              Structured mentoring for surveying professionals working towards Associate membership of RICS.
            </p>
            <p className="text-lg">
              Rosecrest Group Ltd provides structured AssocRICS mentoring and counsellor support for surveying
              professionals working towards Associate membership of RICS. Our support is tailored to each
              candidate’s pathway, experience and development needs.
            </p>
            <p className="text-base">
              This service is for the AssocRICS pathway only, supporting candidates working towards Associate
              membership of RICS.
            </p>
          </>
        }
        actions={
          <EnquiryButton
            context={SUITABILITY_CALL}
            track={{ service: SERVICE, label: "Book free suitability call" }}
            className="whitespace-normal text-center"
          >
            Book your free 30-minute suitability call
          </EnquiryButton>
        }
        media={
          <Photo
            src="/assets/images/legal-professionals.png"
            alt="Quiet office used for one-to-one mentoring sessions"
            priority
          />
        }
      >
        <ul className="m-0 flex list-none flex-wrap gap-2.5 p-0">
          {HERO_PILLS.map((pill) => (
            <li
              key={pill}
              className="rounded-full border border-teal-line bg-white px-3.5 py-2 text-sm font-bold text-teal"
            >
              {pill}
            </li>
          ))}
        </ul>
      </PageHero>

      {/* What we offer */}
      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-16">
          <SectionHeading
            eyebrow="What we offer"
            title="Services may include"
            intro="Support is tailored to each candidate’s pathway, experience and development needs."
            className="gap-3.5"
          />
          <CheckList items={SERVICES_INCLUDE} className="gap-3.5" />
        </div>
      </Section>

      {/* Pricing */}
      <Section tone="mist">
        <SectionHeading eyebrow="AssocRICS fees" title="Pricing" intro="All prices include VAT." />
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[480px] border-collapse text-left text-[15px]">
            <caption className="sr-only">AssocRICS mentoring prices, including VAT</caption>
            <thead>
              <tr className="bg-navy text-white">
                <th scope="col" className="w-2/3 px-5 py-3.5 font-bold">
                  Service
                </th>
                <th scope="col" className="px-5 py-3.5 font-bold">
                  Price (incl. VAT)
                </th>
              </tr>
            </thead>
            <tbody>
              {PRICING.map((row, i) => (
                <tr key={row.service} className={i % 2 === 1 ? "bg-mist-soft" : "bg-white"}>
                  <th scope="row" className="border-t border-line px-5 py-3.5 font-bold text-ink">
                    {row.service}
                  </th>
                  <td className="border-t border-line px-5 py-3.5 text-body">{row.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Featured package */}
      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
          <div className="flex flex-col gap-3.5 rounded-[22px] border border-line bg-white p-6 shadow-[0_24px_50px_-30px_rgba(15,30,56,0.4)] md:p-8">
            <span className="text-[13px] font-bold uppercase tracking-[0.06em] text-muted-ink">Featured package</span>
            <h2 className="text-[26px] font-extrabold leading-[1.15] md:text-[30px]">
              AssocRICS Guided Candidate Programme
            </h2>
            <span className="font-display text-[40px] font-extrabold leading-none">£395</span>
            <p className="text-[15px] text-body">incl. VAT per month, with a minimum three-month commitment.</p>
            <EnquiryButton
              context="AssocRICS Guided Candidate Programme — £395/month"
              track={{ service: SERVICE, label: "Enquire Guided Candidate Programme" }}
            >
              Enquire about this package
            </EnquiryButton>
          </div>
          <CheckList items={PACKAGE_INCLUDES} className="gap-3.5" />
        </div>
      </Section>

      {/* Important information */}
      <Section tone="mist" className="md:py-16">
        <div className="flex flex-col gap-1.5 rounded-2xl border border-[#F5D9A0] bg-[#FFF6E3] px-6 py-[22px]">
          <b className="text-[17px] text-ink">Important information</b>
          <p className="text-[15px] text-body">
            Counsellor approval is an independent professional judgement and cannot be guaranteed or purchased. All
            assessment documents must be the candidate’s own original work. Rosecrest Group Ltd provides developmental
            guidance and feedback but does not write or generate assessment submissions on behalf of candidates.
            Assessment and membership decisions remain entirely with RICS.
          </p>
        </div>
      </Section>

      {/* FAQs */}
      <Section>
        <SectionHeading
          title="Frequently asked questions"
          intro="Clear answers about our AssocRICS mentoring and counsellor support."
        />
        <FaqList items={FAQS} />
      </Section>

      {/* Closing call to action */}
      <section className="bg-navy text-white">
        <div className="mx-auto grid w-full max-w-[1440px] items-center gap-8 px-gutter py-14 md:py-[72px] lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-16">
          <div className="flex flex-col gap-3">
            <h2 className="text-[30px] font-extrabold leading-[1.1] md:text-[38px]">Start with a free suitability call</h2>
            <p className="text-[17px] text-navy-soft">
              Book your free 30-minute suitability call to discuss your AssocRICS pathway and how Rosecrest can support
              your development.
            </p>
            <p className="text-[15px] text-navy-soft">
              Looking for a different service?{" "}
              <SmartLink href="/services" className="font-bold text-[#7FD8C8] hover:text-white">
                View all property services
              </SmartLink>
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <EnquiryButton
              context={SUITABILITY_CALL}
              track={{ service: SERVICE, label: "Get Started Now" }}
              variant="light"
            >
              Book your free suitability call
            </EnquiryButton>
            <a href={PHONE_HREF} className="text-[22px] font-extrabold text-white no-underline hover:text-white">
              {PHONE}
            </a>
          </div>
        </div>
      </section>

      <CallbackSection formName="AssocRICS mentoring page call back" defaultNeeds={["AssocRICS mentoring"]} />
    </>
  );
}
