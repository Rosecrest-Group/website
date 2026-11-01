import { Check } from "lucide-react";
import { getPageMetadata } from "@/lib/page-metadata";
import PageJsonLd from "@/components/common/PageJsonLd";
import CallbackSection from "@/components/site/CallbackSection";
import TrustBadges from "@/components/site/TrustBadges";
import { Eyebrow, PageHero, Photo, Section, SectionHeading, TextLink } from "@/components/site/primitives";

export const metadata = getPageMetadata("/about");

const ACCREDITATIONS = [
  "RICS Regulated",
  "Constructionline Gold",
  "SafeContractor approved",
  "Professional Indemnity Insured",
];

const TESTIMONIALS = [
  {
    quote:
      "We instructed Rosecrest Group Ltd to provide independent oversight, monitoring, and reporting in relation to plumbing separation works at one of our sites. The service was delivered in a professional and structured manner, with clear communication throughout. Their oversight and reporting provided a transparent view of the works as they progressed, allowing us to monitor key stages and address any issues efficiently. The final reporting was clear, well presented, and supported our internal processes and decision-making. Overall, we found the service reliable and would be happy to work with Rosecrest Group Ltd again on future projects.",
    source: "Contractor, plumbing separation works",
  },
  {
    quote:
      "We have consistently found Rosecrest Group Ltd’s expert reports to be professional, detailed, and highly reliable. In particular, their CPR Part 35-compliant reports and damp and mould investigations are thorough and clearly presented, making them well-suited for litigation purposes. The staff have been consistently helpful, professional, and responsive throughout our dealings, which has made the instruction process straightforward and efficient. Their reports have greatly assisted our clients in pursuing claims against their landlords by clearly identifying defects, causation, and the extent of disrepair. The findings have been instrumental in evidencing issues such as damp, mould, and structural defects, as well as ensuring that appropriate remedial work is recommended.",
    source: "Solicitors, housing disrepair claims",
  },
];

/** Heading on the left, body copy on the right (stacks below lg). */
function SplitSection({
  tone,
  eyebrow,
  title,
  intro,
  children,
}: {
  tone: "white" | "mist";
  eyebrow: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <Section tone={tone}>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-16">
        <div className="flex flex-col gap-3.5">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="text-[30px] font-extrabold leading-[1.08] md:text-[40px]">{title}</h2>
          {intro && <p className="text-lg text-body">{intro}</p>}
        </div>
        <div className="flex flex-col gap-3.5 text-[17px] text-body">{children}</div>
      </div>
    </Section>
  );
}

export default function AboutPage() {
  return (
    <>
      <PageJsonLd path="/about" />

      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        eyebrow="RICS-regulated building surveyors in London"
        title="About Rosecrest Group Ltd."
        intro={
          <p>
            At Rosecrest Group Ltd, a RICS-regulated firm of building and property surveyors in London, we pride
            ourselves on being your all-in-one solution for construction and building needs. With a dedication to
            excellence and a reputation founded on integrity, we are your trusted partner in the construction industry.
          </p>
        }
        media={
          <Photo
            src="/assets/images/about.png"
            alt="Rosecrest Group building surveyors on site in London"
            className="md:h-[420px]"
            priority
          />
        }
      />

      <TrustBadges variant="strip" badges={["cabe", "rpsa", "rics", "constructionline", "safecontractor"]} />

      <SplitSection tone="white" eyebrow="Who we are" title="Property insight. Professional certainty. Delivered correctly.">
        <p>
          At Rosecrest Group Ltd, we provide professional, compliant and evidence-based property services across London,
          the M25 corridor and surrounding regions.
        </p>
        <p>
          We work with homeowners, landlords, managing agents, developers and commercial clients by first taking the time
          to understand their objectives, concerns and requirements. This ensures that any inspections, advice or
          building services are correctly scoped and aligned with our clients’ intended outcomes.
        </p>
        <p>
          Operating within a RICS-regulated firm framework, our services are delivered by skilled surveyors and qualified
          trade professionals, providing clear inspections, regulated advice and practical building solutions.
        </p>
        <p>
          Our purpose is simple: to help clients understand their buildings, manage risk and protect long-term value
          through accurate assessment, accountable delivery and a strong commitment to client satisfaction.
        </p>
      </SplitSection>

      <SplitSection
        tone="mist"
        eyebrow="Why Rosecrest"
        title="Why Clients Choose Rosecrest Group"
        intro="Clients choose Rosecrest Group for clear advice, professional integrity and dependable delivery."
      >
        <p>
          As a RICS-regulated firm, our work is evidence-based, clearly reported and easy to understand. Whether we are
          undertaking a survey, producing a housing disrepair report, providing party wall advice or acting as expert
          witnesses, clients value our ability to explain complex issues clearly and provide guidance they can rely on.
          Where works are required, our professional advice is supported by qualified trade teams delivering practical,
          compliant solutions.
        </p>
        <p>
          Many clients come to us after unclear advice or ineffective repair works. Where appropriate, we move beyond
          reporting to deliver remedial works, ensuring recommendations are implemented correctly. When we are instructed
          as an expert witness, our role is independent evidence for the court only, and we do not quote for or carry out
          works on that property.
        </p>
      </SplitSection>

      <Section className="md:py-14" innerClassName="gap-6">
        <p className="max-w-[900px] text-lg text-body">
          These logos represent the professional and trade bodies with which we are regulated, accredited or hold
          professional membership. This includes RICS regulation, Constructionline Gold accreditation and membership of
          recognised industry organisations. They demonstrate our commitment to professional standards, compliance and
          quality assurance.
        </p>
        <ul className="m-0 grid list-none gap-3.5 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {ACCREDITATIONS.map((label) => (
            <li
              key={label}
              className="flex items-center gap-2.5 rounded-[14px] border border-line bg-white px-[18px] py-4 text-base font-bold"
            >
              <Check aria-hidden="true" className="h-[18px] w-[18px] shrink-0 text-teal" strokeWidth={2.4} />
              {label}
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="mist">
        <SectionHeading
          eyebrow="Testimonials"
          title="Client Testimonials"
          intro="Feedback from clients on their experience working with Rosecrest."
        />
        <div className="grid items-stretch gap-6 lg:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.source}
              className="m-0 flex flex-col gap-4 rounded-[20px] border border-line bg-white p-6 md:p-8"
            >
              <svg width="34" height="26" viewBox="0 0 34 26" aria-hidden="true">
                <path
                  d="M0 26V14C0 6 5 1 13 0l1 5c-5 1-7 4-7 8h6v13zm20 0V14c0-8 5-13 13-14l1 5c-5 1-7 4-7 8h6v13z"
                  fill="#7FD8C8"
                />
              </svg>
              <blockquote className="m-0 text-[17px] leading-[1.55] text-ink md:text-lg">“{t.quote}”</blockquote>
              <figcaption className="text-[15px] text-muted-ink">{t.source}</figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section className="md:py-16" innerClassName="gap-3.5">
        <h2 className="text-[26px] font-extrabold leading-[1.08] md:text-[32px]">
          Building and property surveyors across London and the M25
        </h2>
        <p className="max-w-[900px] text-lg text-body">
          Our RICS surveyors in London cover all 32 London boroughs and the City of London, plus areas within the M25.{" "}
          <TextLink href="/areas-we-cover">See the areas we cover</TextLink> or{" "}
          <TextLink href="/services">browse all services</TextLink>.
        </p>
      </Section>

      <CallbackSection formName="About page call back" />
    </>
  );
}
