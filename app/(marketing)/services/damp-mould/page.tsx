import {
  BadgeCheck,
  Clock,
  Droplets,
  FileText,
  MessageSquareWarning,
  PhoneCall,
  Scale,
  Search,
  ShieldCheck,
} from "lucide-react";
import { getPageMetadata } from "@/lib/page-metadata";
import PageJsonLd from "@/components/common/PageJsonLd";
import CallbackSection from "@/components/site/CallbackSection";
import {
  ButtonLink,
  CheckItem,
  CheckList,
  Eyebrow,
  FaqList,
  NoteStrip,
  PageHero,
  RelatedLinks,
  Section,
  SectionHeading,
  TextLink,
  type FaqItem,
} from "@/components/site/primitives";
import {
  BandPhone,
  CallLink,
  FeatureCard,
  FramedImage,
  NavyBand,
  PriceCard,
  TintNote,
} from "@/components/site/landlord-services/blocks";
import MouldEstimator from "@/components/site/landlord-services/MouldEstimator";

export const metadata = getPageMetadata("/services/damp-mould");

const NEEDS = [
  {
    icon: MessageSquareWarning,
    title: "Tenant Complaints",
    text: "Responding to occupant concerns about damp or mould with an independent assessment.",
  },
  {
    icon: Droplets,
    title: "Condensation Issues",
    text: "Identifying ventilation problems and condensation-related concerns.",
  },
  { icon: ShieldCheck, title: "Compliance Queries", text: "Meeting housing standards and regulatory requirements." },
  {
    icon: FileText,
    title: "Independent Reports",
    text: "Clear documentation for legal, insurance or dispute resolution purposes.",
  },
  { icon: Search, title: "Remedial Scoping", text: "Assessment to plan and scope appropriate treatment works." },
];

const FAQS: FaqItem[] = [
  {
    q: "Do you carry out damp and mould testing?",
    a: "Yes. The Damp, Mould and Condensation Survey is a visual, non-invasive inspection of the accessible affected areas, with thermal imaging and indicative moisture readings where appropriate and available. Readings are indicative, so we consider them together with the building and how the home is used.",
  },
  {
    q: "What’s included in a Damp & Mould Condition Report?",
    a: "The affected areas, the conditions observed, contributing factors, photographs and recommendations for onward action. The report identifies likely causes where supported by the findings and recommends further investigation where necessary.",
  },
  {
    q: "Can you carry out remedial works as well as reports?",
    a: "Yes. Mould treatment is £25 per m² + VAT, subject to exact measurement, and other remedial work can be arranged through our trusted trade network. If we’re instructed as an expert witness on a property, we don’t quote for or carry out repairs or mould treatment on it as part of, or alongside, that instruction.",
  },
  {
    q: "Can you remove black mould?",
    a: "Yes. Black mould removal is part of our mould treatment: we treat the mould, clean the area and apply a stain block. Mould can return if the cause stays, so we recommend a Damp, Mould and Condensation Survey first, then fixing the cause, then a recheck.",
  },
  {
    q: "Is mould treatment the same as wall injection or insulation?",
    a: "No. We treat mould on the surface. Injection and cavity insulation address different problems and aren’t part of this service.",
  },
  {
    q: "Is a condensation survey different from a damp survey?",
    a: "Our Damp, Mould and Condensation Survey covers both. Condensation, penetrating damp and rising damp can look alike on a wall but need different fixes, so the survey assesses the likely cause, where the evidence supports it, before any work is recommended.",
  },
  {
    q: "Who is responsible for mould in a rented property?",
    a: "Landlords must keep a rented home fit for human habitation, which includes serious damp and inadequate ventilation (Landlord and Tenant Act 1985, s9A), and keep the structure and exterior in repair (s11). Tenants should report damp or mould to their landlord in writing. General guidance, not legal advice.",
  },
  {
    q: "What should I do about mould in a council house?",
    a: "Report it to the council or housing association in writing. Since 27 October 2025, Awaab’s Law has required social landlords to investigate damp and mould within set timescales. We carry out Damp, Mould and Condensation Surveys for councils and housing associations. General guidance, not legal advice.",
  },
  {
    q: "How much does a damp survey cost in London?",
    a: "Our Damp, Mould and Condensation Survey starts from £540 including VAT, subject to the property’s circumstances and the agreed scope of inspection. Where treatment is appropriate, mould removal is £25 per m² + VAT, subject to exact measurement.",
  },
  {
    q: "How quickly can you inspect?",
    a: "Tell us if a tenant complaint or deadline is involved and we’ll offer the earliest date we can.",
  },
];

export default function DampMouldPage() {
  return (
    <>
      <PageJsonLd path="/services/damp-mould" />

      <PageHero
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Landlords", href: "/landlord" },
          { label: "Damp, Mould and Condensation Survey" },
        ]}
        eyebrow="Damp and mould survey, London"
        title="Damp, Mould & Condensation: Inspection, Reporting & Treatment Support"
        intro={
          <>
            <p>
              Damp, mould and condensation issues are increasingly common across residential property, and often
              require a clear, independent damp and mould survey before appropriate action can be taken.
            </p>
            <p className="text-[17px]">
              Rosecrest provides damp, mould and condensation inspections, reporting and treatment support to
              landlords, councils, organisations and property owners across London. Services are delivered with a
              focus on identifying observed conditions, contributing factors and appropriate next steps, with clear
              documentation throughout.
            </p>
          </>
        }
        actions={
          <>
            <ButtonLink href="/request-inspection">Book Damp and Mould Survey</ButtonLink>
            <CallLink />
          </>
        }
        media={
          <FramedImage
            src="/assets/images/paint-decor.png"
            alt="Black mould spreading from the ceiling corner of a London flat"
            width={1078}
            height={1096}
            priority
          />
        }
      >
        <ul className="m-0 flex list-none flex-wrap gap-x-[26px] gap-y-2.5 p-0 font-semibold text-ink">
          <CheckItem>Independent inspections</CheckItem>
          <CheckItem>Clear reporting</CheckItem>
          <CheckItem>Professional standards</CheckItem>
        </ul>
      </PageHero>

      <Section>
        <SectionHeading
          eyebrow="Damp, mould and condensation inspections"
          title="When is this service needed?"
          intro="Our damp and mould inspection service addresses key property concerns."
        />
        <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
          {NEEDS.map((item) => (
            <FeatureCard key={item.title} icon={item.icon} title={item.title}>
              <p className="text-[15px] text-body">{item.text}</p>
            </FeatureCard>
          ))}
          <FeatureCard icon={PhoneCall} title="Need Guidance?" className="border-teal-line bg-teal-tint">
            <p className="text-[15px] text-body">Speak to our team to discuss your specific requirements.</p>
            <TextLink href="#callback" className="mt-auto text-[15px]">
              Get in Touch →
            </TextLink>
          </FeatureCard>
        </div>
      </Section>

      <Section tone="mist">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
          <div className="flex flex-col gap-[18px]">
            <Eyebrow>Mould survey at a fixed price</Eyebrow>
            <h2 className="text-[30px] font-extrabold leading-[1.08] md:text-[40px]">Fixed-Price Damp &amp; Mould Survey</h2>
            <p className="text-lg text-body">
              Our comprehensive inspection provides clear documentation of observed conditions and contributing
              factors.
            </p>
            <CheckList
              className="gap-3.5"
              items={[
                "Visual inspection of accessible affected areas",
                "Identification of damp and mould conditions",
                "Assessment of potential contributing factors",
                "Detailed photographic evidence",
                "Written report for onward action",
              ]}
            />
            <p className="text-sm text-muted-ink">
              Where appropriate and available, thermal imaging and indicative moisture readings support the findings.
              Readings don’t prove a cause on their own. The report identifies likely causes where supported by the
              findings and recommends further investigation where necessary.
            </p>
          </div>
          <PriceCard
            label="Damp, Mould and Condensation Survey"
            price="From £540"
            note="Including VAT, subject to the property’s circumstances and the agreed scope of inspection."
            items={[
              "Visual, non-invasive inspection of accessible affected areas",
              "Thermal imaging and indicative moisture readings where appropriate and available",
              "Photographs of the conditions recorded",
              "Written report for onward action",
            ]}
            action={<ButtonLink href="/request-inspection">Book Damp &amp; Mould Survey</ButtonLink>}
          />
        </div>
      </Section>

      <Section id="treatment">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-[18px]">
            <Eyebrow>Mould treatment and mould removal, London</Eyebrow>
            <h2 className="text-[30px] font-extrabold leading-[1.08] md:text-[40px]">Mould Treatment &amp; Remediation</h2>
            <p className="text-lg text-body">Transparent pricing based on the size of the affected area.</p>
            <p className="text-[17px] text-body">
              Where the survey shows treatment is appropriate, our mould treatment service treats and removes the
              mould, including black mould, cleans the area and applies a stain block, with before-and-after photos
              for your records. Treating without finding the cause usually means treating again, which is why the
              survey comes first.
            </p>
            <TintNote title="Kept separate from expert witness work">
              If we’re instructed as an expert witness on a property, we don’t quote for or carry out repairs or mould
              treatment on it as part of, or alongside, that instruction.
            </TintNote>
          </div>
          <MouldEstimator />
        </div>
      </Section>

      <NavyBand
        title="Need help quickly?"
        text="Speak to our expert team to discuss your requirements or book your inspection today."
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
          { icon: Clock, label: "24h Response" },
          { icon: Scale, label: "Independent" },
        ]}
      />

      <NoteStrip>
        Looking for a different service? <TextLink href="/services">View all property services</TextLink>
      </NoteStrip>

      <Section>
        <SectionHeading
          eyebrow="Questions"
          title="Frequently asked questions"
          intro="Here are answers to the most common questions about our damp, mould and condensation inspection service."
        />
        <FaqList items={FAQS} />
        <RelatedLinks
          links={[
            { label: "Housing disrepair surveys", href: "/services/housing-disrepair" },
            { label: "HHSRS guide", href: "/guides/hhsrs" },
            { label: "Landlords and property owners", href: "/landlord" },
          ]}
        />
      </Section>

      <CallbackSection
        formName="Damp and mould page call back"
        defaultNeeds={["Damp, Mould and Condensation Survey"]}
      />
    </>
  );
}
