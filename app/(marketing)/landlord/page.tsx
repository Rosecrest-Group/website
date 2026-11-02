import { BadgeCheck, ClipboardCheck, Droplets, FileText, Gauge, House, Zap, type LucideIcon } from "lucide-react";
import { getPageMetadata } from "@/lib/page-metadata";
import PageJsonLd from "@/components/common/PageJsonLd";
import CallbackSection from "@/components/site/CallbackSection";
import {
  ButtonLink,
  CheckList,
  Eyebrow,
  FaqList,
  IconTile,
  NoteStrip,
  PageHero,
  Section,
  SectionHeading,
  TextLink,
  type FaqItem,
} from "@/components/site/primitives";
import { BandPhone, CallLink, FramedImage, NavyBand, TintNote } from "@/components/site/landlord-services/blocks";

export const metadata = getPageMetadata("/landlord");

type LandlordService = {
  icon: LucideIcon;
  title: string;
  badge?: string;
  text: string;
  points: string[];
  primary: { label: string; href: string; filled?: boolean };
  link: { label: string; href: string };
};

const SERVICES: LandlordService[] = [
  {
    icon: Droplets,
    title: "Damp, Mould & Condensation",
    badge: "Clear pricing",
    text: "Independent, non-invasive inspections with clear pricing. Suited to tenant complaints and compliance requirements.",
    points: [
      "Damp, Mould and Condensation Survey from £540 incl. VAT, subject to scope",
      "Mould treatment, a separate service: £25 per m²",
      "Full booking & cost calculator available",
    ],
    primary: { label: "Book Damp & Mould Survey", href: "/services/damp-mould", filled: true },
    link: { label: "Mould treatment cost →", href: "/services/damp-mould#treatment" },
  },
  {
    icon: ClipboardCheck,
    title: "HHSRS Assessment",
    text: "Formal hazard assessment and compliance reporting for Housing Health & Safety standards.",
    points: ["Formal hazard assessment", "Compliance reporting", "Housing Health & Safety Rating System"],
    primary: { label: "Request a discussion", href: "#callback" },
    link: { label: "HHSRS guide →", href: "/guides/hhsrs" },
  },
  {
    icon: House,
    title: "Disrepair & Condition Surveys",
    text: "Independent condition assessment and scope of works reporting for property disputes.",
    points: ["Independent condition assessment", "Scope of works reporting", "Evidence for dispute resolution"],
    primary: { label: "Request a discussion", href: "#callback" },
    link: { label: "Housing disrepair surveys →", href: "/services/housing-disrepair" },
  },
  {
    icon: Gauge,
    title: "Energy Performance Certificates",
    text: "Energy Performance Certificates (EPC) for rental compliance with fast turnaround and 10-year validity.",
    points: ["Compliance with rental requirements", "Valid for 10 years", "Fast turnaround available"],
    primary: { label: "Request a discussion", href: "#callback" },
    link: { label: "EPCs from £33 →", href: "/services/epc" },
  },
];

const FAQS: FaqItem[] = [
  {
    q: "What does a damp and mould survey involve?",
    a: (
      <p>
        A visual, non-invasive inspection of the accessible affected areas, with photographs and, where appropriate
        and available, thermal imaging and indicative moisture readings. The report identifies likely causes where
        supported by the findings and recommends further investigation where necessary. <TextLink href="/services/damp-mould">Damp and mould surveys →</TextLink>
      </p>
    ),
  },
  {
    q: "Does Awaab’s Law apply to private landlords?",
    a: "Not yet. It applies to councils and housing associations. A consultation on extending it to private rented tenancies runs until 18 December 2026. Your existing duties on repair, fitness for habitation and HHSRS already apply.",
  },
  {
    q: "What is an HHSRS assessment?",
    a: (
      <p>
        A formal assessment of hazards in a home under the Housing Health and Safety Rating System, the system
        councils use to enforce housing standards. The report sets out the hazards found and what needs attention.{" "}
        <TextLink href="/guides/hhsrs">HHSRS guide →</TextLink>
      </p>
    ),
  },
  {
    q: "A tenant has sent a letter of claim. What now?",
    a: (
      <p>
        Speak to your solicitor early. The pre-action protocol gives you 20 working days to respond, and an
        independent disrepair survey puts the facts on record.{" "}
        <TextLink href="/services/housing-disrepair">Housing disrepair surveys →</TextLink>
      </p>
    ),
  },
  {
    q: "Do I need an EPC to let a property?",
    a: (
      <p>
        Yes. A valid Energy Performance Certificate is needed before you let a home, and it is valid for 10 years.{" "}
        <TextLink href="/services/epc">Energy Performance Certificates →</TextLink>
      </p>
    ),
  },
  {
    q: "Can you treat mould and arrange repairs as well as report?",
    a: (
      <p>
        Yes. Mould treatment is £25 per m²{" "}
        <TextLink href="/services/damp-mould#treatment">(work out your cost)</TextLink>, and remedial work can be
        arranged through our trusted trade network. If we’re instructed as an expert witness on a property, we don’t
        quote for or carry out repairs or mould treatment on it as part of, or alongside, that instruction.
      </p>
    ),
  },
];

export default function LandlordPage() {
  return (
    <>
      <PageJsonLd path="/landlord" />

      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Landlords and property owners" }]}
        eyebrow="Housing disrepair surveys and landlord compliance reports, London"
        title="Housing Disrepair and Awaab’s Law Advice for Landlords & Property Owners"
        intro={
          <>
            <p>
              Independent inspections and clear reporting to help landlords manage housing disrepair claims,
              compliance obligations and property condition disputes.
            </p>
            <p className="text-[17px]">
              We help landlords understand property condition issues quickly and objectively through independent
              inspections and professional reports. Whether responding to a tenant claim, preparing for a potential
              claim, or ensuring compliance with Awaab’s Law where it applies to you, our assessments provide clear
              findings and help landlords understand the appropriate next steps. We cover London and areas within the
              M25.
            </p>
          </>
        }
        actions={
          <>
            <ButtonLink href="#callback">Discuss a Property Issue</ButtonLink>
            <CallLink />
          </>
        }
        media={
          <FramedImage
            src="/assets/images/landlord.png"
            alt="Surveyor taking moisture readings on a mouldy wall in a rented flat"
            width={1211}
            height={962}
            priority
          />
        }
      />

      <Section>
        <SectionHeading
          eyebrow="Landlord compliance, condition and disrepair reports"
          title="Services for Landlords And Property Owners"
          intro="Professional inspections, compliance reporting and support services to help landlords and owners address tenant complaints and building condition issues."
        />
        <div className="grid gap-[18px] md:grid-cols-2">
          {SERVICES.map((service) => (
            <div
              key={service.title}
              className="flex flex-col gap-3 rounded-[18px] border border-line bg-white p-[26px]"
            >
              <div className="flex items-start justify-between gap-3">
                <IconTile>
                  <service.icon className="h-6 w-6" strokeWidth={2} />
                </IconTile>
                {service.badge && (
                  <span className="whitespace-nowrap rounded-full border border-line bg-white px-3 py-1.5 text-[13px] font-bold">
                    {service.badge}
                  </span>
                )}
              </div>
              <h3 className="text-[21px] font-bold leading-[1.25]">{service.title}</h3>
              <p className="text-[15px] text-body">{service.text}</p>
              <CheckList items={service.points} size="sm" className="gap-2" />
              <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-1.5">
                <ButtonLink
                  href={service.primary.href}
                  variant={service.primary.filled ? "primary" : "outline"}
                  size="sm"
                  className={service.primary.filled ? undefined : "border-2 border-line-strong"}
                >
                  {service.primary.label}
                </ButtonLink>
                <TextLink href={service.link.href} className="text-[15px]">
                  {service.link.label}
                </TextLink>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="mist">
        <div className="flex max-w-[820px] flex-col gap-[18px]">
          <Eyebrow>Repairs and trade services for landlords</Eyebrow>
          <h2 className="text-[30px] font-extrabold leading-[1.08] md:text-[40px]">
            Property Support &amp; Remedial Services
          </h2>
          <p className="text-lg text-body">
            Where remedial work or property preparation is required, Rosecrest can also assist with a range of
            practical property services through our trusted trade network.
          </p>
          <p className="text-[17px] text-body">
            These services can support landlords and property owners in addressing issues identified during
            inspections or preparing properties for tenants. Services include property preparation, cleaning,
            maintenance and other specialist trade works.
          </p>
          <div>
            <ButtonLink href="/services#trade-services">Explore Property Services</ButtonLink>
          </div>
        </div>
      </Section>

      <Section>
        <div className="flex flex-col gap-3">
          <Eyebrow>Questions</Eyebrow>
          <h2 className="text-[30px] font-extrabold leading-[1.08] md:text-[40px]">What landlords ask us</h2>
        </div>
        <TintNote title="Awaab’s Law: where landlords stand today">
          <p>
            Awaab’s Law applies to social landlords only: councils and housing associations. On 9 October 2026 the
            government opened a consultation on extending it to private rented tenancies. It closes on 18 December
            2026; the proposals are not law and no start date is set. Private landlords’ current duties still apply:
            repair (Landlord and Tenant Act 1985 s11), fitness for human habitation (s9A) and council enforcement
            under HHSRS. General guidance, not legal advice.{" "}
            <TextLink href="/guides/awaabs-law">Awaab’s Law explained →</TextLink>
          </p>
        </TintNote>
        <FaqList items={FAQS} />
      </Section>

      <NavyBand
        title="Need Advice or an Inspection?"
        text="Discuss a tenant complaint, compliance concern or building condition issue with our team."
        actions={
          <>
            <ButtonLink href="#callback" variant="light">
              Request a discussion
            </ButtonLink>
            <BandPhone />
          </>
        }
        pills={[
          { icon: BadgeCheck, label: "RICS Regulated" },
          { icon: FileText, label: "Independent Reporting" },
          { icon: Zap, label: "Fast Response" },
        ]}
      />

      <NoteStrip>
        Looking for a different service? <TextLink href="/services">View all property services</TextLink>
      </NoteStrip>

      <CallbackSection formName="Landlords page call back" />
    </>
  );
}
