import { Droplet, Layers, Leaf, MapPin, Thermometer, TriangleAlert } from "lucide-react";
import { getPageMetadata } from "@/lib/page-metadata";
import { PHONE, PHONE_HREF } from "@/lib/constants";
import PageJsonLd from "@/components/common/PageJsonLd";
import CallbackSection from "@/components/site/CallbackSection";
import EnquiryButton from "@/components/site/service-pages/EnquiryButton";
import {
  Card,
  CheckList,
  FaqList,
  IconTile,
  NoteStrip,
  PageHero,
  Photo,
  RelatedLinks,
  Section,
  SectionHeading,
  TextLink,
  type FaqItem,
} from "@/components/site/primitives";

export const metadata = getPageMetadata("/services/environmental-reports");

const COVERS = [
  {
    icon: TriangleAlert,
    title: "Contaminated Land Assessments",
    text: "Identifying past industrial use, potential pollution risks and remediation requirements.",
  },
  {
    icon: Droplet,
    title: "Flood Risk Analysis",
    text: "Includes river, surface water, groundwater and coastal flood data to assess exposure and insurance implications.",
  },
  {
    icon: Layers,
    title: "Ground Stability Checks",
    text: "Insight into risks from subsidence, sinkholes and mining activity.",
  },
  {
    icon: Leaf,
    title: "Radon Exposure Mapping",
    text: "Identifying areas with elevated radon gas levels and the associated health risks.",
  },
  {
    icon: MapPin,
    title: "Proximity to Environmental Hazards",
    text: "Including landfill sites, energy infrastructure and other potential nuisances.",
  },
  {
    icon: Thermometer,
    title: "Climate Impact Considerations",
    text: "Future-proof your investment by understanding climate-related risk factors such as increased flooding and heat stress.",
  },
];

const WHO_NEEDS = [
  "Buyers and sellers of residential or commercial property",
  "Landlords and letting agents",
  "Developers and architects",
  "Solicitors and conveyancers",
  "Mortgage lenders and insurers",
];

const WHY_US = [
  "Clear, easy-to-understand summaries",
  "Backed by national data sources and GIS mapping",
  "Fast turnaround available",
  "Expert advice from qualified professionals",
  "Affordable, fixed-rate pricing",
];

const FAQS: FaqItem[] = [
  {
    q: "What is an environmental search?",
    a: (
      <p>
        A report on the environmental risks affecting a property, backed by national data sources and GIS mapping. Ours
        covers contaminated land, flood risk, ground stability, radon, nearby environmental hazards and climate-related
        risk, with a clear, easy-to-understand summary.
      </p>
    ),
  },
  {
    q: "What does a flood risk report cover?",
    a: (
      <p>
        River, surface water, groundwater and coastal flood data, to assess the property’s exposure to flooding and the
        possible insurance implications.
      </p>
    ),
  },
  {
    q: "What is a contaminated land report?",
    a: <p>It identifies past industrial use, potential pollution risks and any remediation requirements for the land.</p>,
  },
  {
    q: "What does a ground stability report check?",
    a: <p>Risks from subsidence, sinkholes and mining activity.</p>,
  },
  {
    q: "Who needs an environmental report?",
    a: (
      <p>
        Buyers and sellers of residential or commercial property, landlords and letting agents, developers and
        architects, solicitors and conveyancers, and mortgage lenders and insurers.
      </p>
    ),
  },
  {
    q: "How much does it cost and how long does it take?",
    a: <p>We offer affordable, fixed-rate pricing, and a fast turnaround is available.</p>,
  },
];

export default function EnvironmentalReportsPage() {
  return (
    <>
      <PageJsonLd path="/services/environmental-reports" />

      <PageHero
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: "Environmental reports" },
        ]}
        eyebrow="Environmental searches, London"
        title="Environmental Reports"
        intro={
          <>
            <p className="font-display text-2xl font-bold text-ink">Professional. Insightful. Risk-Aware.</p>
            <p>
              An environmental search report sets out the contaminated land, flood, ground stability, radon and nearby
              hazard risks affecting a property, so you can make an informed decision before you buy, let, lend on or
              develop it.
            </p>
          </>
        }
        media={
          <Photo
            src="/assets/images/environmental-house.png"
            alt="Residential building surrounded by trees, the kind of setting an environmental search assesses"
            priority
            className="md:h-[420px]"
          />
        }
      />

      <Section tone="mist">
        <SectionHeading title="What Our Environmental Reports Cover" />
        <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
          {COVERS.map((item) => (
            <Card key={item.title}>
              <IconTile>
                <item.icon className="h-6 w-6" strokeWidth={2} />
              </IconTile>
              <h3 className="text-[21px] font-bold leading-[1.25]">{item.title}</h3>
              <p className="text-[15px] text-body">{item.text}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid items-start gap-12 md:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-6">
            <h2 className="text-[26px] font-extrabold leading-[1.08] md:text-[30px]">Who Needs an Environmental Report?</h2>
            <CheckList items={WHO_NEEDS} className="gap-3.5" />
          </div>
          <div className="flex flex-col gap-6">
            <h2 className="text-[26px] font-extrabold leading-[1.08] md:text-[30px]">Why Choose Rosecrest?</h2>
            <CheckList items={WHY_US} className="gap-3.5" />
          </div>
        </div>
      </Section>

      <section className="bg-navy text-white">
        <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-x-12 gap-y-6 px-gutter py-14 md:py-16">
          <div className="flex max-w-[700px] flex-col gap-2.5">
            <h2 className="text-[28px] font-extrabold leading-[1.12] md:text-[34px]">
              Protect your investment and stay compliant.
            </h2>
            <p className="text-[17px] text-navy-soft">
              Enquire today about our Environmental Report service: your first step towards responsible property
              ownership.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <EnquiryButton context="Environmental Report" variant="light">
              Get Started Now
            </EnquiryButton>
            <a
              href={PHONE_HREF}
              className="whitespace-nowrap px-2.5 py-[15px] font-bold text-white no-underline hover:text-white"
            >
              or call {PHONE}
            </a>
          </div>
        </div>
      </section>

      <NoteStrip>
        Looking for a different service? <TextLink href="/services">View all property services</TextLink>
      </NoteStrip>

      <Section>
        <SectionHeading eyebrow="Questions" title="Environmental search FAQs" />
        <FaqList items={FAQS} />
        <RelatedLinks
          label="Related:"
          links={[
            { label: "RICS Level 1, 2 and 3 surveys", href: "/homebuyer" },
            { label: "Energy Performance Certificates", href: "/services/epc" },
          ]}
        />
      </Section>

      <CallbackSection formName="Environmental reports page call back" defaultNeeds={["Environmental report"]} />
    </>
  );
}
