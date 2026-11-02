import { Camera, FileText, ScanSearch, Search } from "lucide-react";
import { getPageMetadata } from "@/lib/page-metadata";
import PageJsonLd from "@/components/common/PageJsonLd";
import CallbackSection from "@/components/site/CallbackSection";
import {
  ButtonLink,
  CheckItem,
  DataTable,
  FaqList,
  NoteStrip,
  PageHero,
  Section,
  SectionHeading,
  TextLink,
  type FaqItem,
} from "@/components/site/primitives";
import { CallLink, FeatureCard, NavyBand, TintNote } from "@/components/site/landlord-services/blocks";

export const metadata = getPageMetadata("/services/thermographic-surveys");

const INCLUDES = [
  {
    icon: Search,
    title: "On-site inspection",
    text: "A non-invasive thermographic survey of the instructed areas, carried out under suitable environmental conditions.",
  },
  {
    icon: Camera,
    title: "Thermal and conventional images",
    text: "Relevant thermal images paired with corresponding conventional photographs for clear comparison.",
  },
  {
    icon: ScanSearch,
    title: "Professional interpretation",
    text: "Surveyor-led explanation of identified surface-temperature anomalies in context.",
  },
  {
    icon: FileText,
    title: "Written report",
    text: "A written report with recommendations for any necessary further investigation.",
  },
];

const PRICES: [string, string][] = [
  ["Add-on to an RICS Level 2 or Level 3 survey", "£175 incl. VAT"],
  ["Apartment or small flat heat-loss survey", "£325 incl. VAT"],
  ["House with up to three bedrooms", "£395 incl. VAT"],
  ["Four- or five-bedroom house", "£475 incl. VAT"],
  ["Targeted damp, moisture or leak investigation", "From £425 incl. VAT"],
  ["Roof or water-ingress thermographic investigation", "From £475 incl. VAT"],
  ["Larger or more complex residential property", "From £575 incl. VAT"],
  ["Commercial thermographic survey", "Bespoke quotation"],
  ["Additional attendance where the original environmental conditions were unsuitable", "£150 incl. VAT"],
];

const FAQS: FaqItem[] = [
  {
    q: "What is a thermographic survey?",
    a: "A thermographic survey, also called a thermal imaging survey, uses infrared imaging to record surface-temperature patterns across the instructed areas of a building. A surveyor interprets patterns that may be associated with heat loss, defective or missing insulation, thermal bridging, air leakage, condensation, moisture and water ingress, and sets out the findings in a written report.",
  },
  {
    q: "What does the price include?",
    a: "The inspection and a written report containing relevant thermal images, corresponding photographs, an explanation of identified anomalies and recommendations for any necessary further investigation. All prices include VAT.",
  },
  {
    q: "Can I add this to a Level 2 or Level 3 survey?",
    a: "Yes. If you are already booking an RICS Level 2 or Level 3 survey, you can add thermography for £175 including VAT.",
  },
  {
    q: "Does thermal imaging see through walls?",
    a: "No. Thermal imaging records surface-temperature patterns and does not see through walls, ceilings, floors or other building elements. A thermal anomaly does not, by itself, establish the presence, cause or extent of a concealed defect.",
  },
  {
    q: "When might further investigation be needed?",
    a: "Where the cause of an anomaly remains uncertain. Findings are interpreted in the context of the building’s construction, environmental conditions, visual observations and any supporting test results, and we may recommend further intrusive or specialist investigation.",
  },
  {
    q: "Is a thermal imaging survey the same as a damp survey?",
    a: (
      <p>
        Not quite. Thermal imaging can show surface-temperature patterns associated with moisture, but it does not
        confirm a cause on its own. If you are dealing with damp or mould, our{" "}
        <TextLink href="/services/damp-mould">Damp, Mould and Condensation Survey</TextLink> is a visual, non-invasive
        inspection with thermal imaging and indicative moisture readings where appropriate and available, and a written
        report that identifies likely causes where supported by the findings.
      </p>
    ),
  },
];

export default function ThermographicSurveysPage() {
  return (
    <>
      <PageJsonLd path="/services/thermographic-surveys" />

      <PageHero
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: "Thermographic surveys" },
        ]}
        eyebrow="Thermal imaging surveys, London"
        title="Thermographic Building Surveys"
        intro={
          <>
            <p>
              Surveyor-led thermal imaging building surveys in London, with professional interpretation and a written
              report.
            </p>
            <p className="text-[17px]">
              Rosecrest Group Ltd provides non-invasive thermographic surveys using infrared imaging to identify
              surface-temperature patterns that may be associated with heat loss, defective or missing insulation,
              thermal bridging, air leakage, condensation, moisture and water ingress.
            </p>
            <p className="text-[17px]">
              Our survey combines thermal images with corresponding conventional photographs, professional
              interpretation and practical recommendations. Where appropriate, findings may also be considered
              alongside visual observations and moisture readings.
            </p>
          </>
        }
        actions={<ButtonLink href="/request-inspection">Request a thermographic survey quote</ButtonLink>}
      >
        <ul className="m-0 flex list-none flex-wrap gap-x-7 gap-y-2.5 p-0 text-body">
          <CheckItem>Surveyor-led</CheckItem>
          <CheckItem>Evidence-based</CheckItem>
          <CheckItem>Written report included</CheckItem>
        </ul>
      </PageHero>

      <Section tone="mist" className="border-t border-line">
        <SectionHeading
          title="What’s included in a thermographic survey"
          intro="Each survey price includes the inspection and a written report containing relevant thermal images, corresponding photographs, an explanation of identified anomalies and recommendations for any necessary further investigation."
        />
        <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          {INCLUDES.map((item) => (
            <FeatureCard key={item.title} icon={item.icon} title={item.title}>
              <p className="text-[15px] text-body">{item.text}</p>
            </FeatureCard>
          ))}
        </div>
        <p className="text-lg font-semibold text-ink">
          A professional, surveyor-led and evidence-based service, focused on interpretation and practical
          recommendations, not a basic camera scan.
        </p>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Pricing"
          title="Thermal imaging survey pricing"
          intro="All prices include VAT. Each survey includes the inspection and a written report."
        />
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-16">
          <DataTable caption="Thermographic survey prices" columns={["Service", "Price (incl. VAT)"]} rows={PRICES} />
          <div className="flex flex-col gap-6">
            <div>
              <ButtonLink href="/request-inspection" className="whitespace-normal text-center">
                Request a thermographic survey quote
              </ButtonLink>
            </div>
            <TintNote title="Already booking a Level 2 or Level 3 survey?">
              <p>
                Add thermography for £175 including VAT.{" "}
                <TextLink href="/request-inspection">Add thermography to your survey</TextLink>
              </p>
            </TintNote>
          </div>
        </div>
      </Section>

      <Section tone="mist">
        <h2 className="text-[28px] font-extrabold leading-[1.08] md:text-[32px]">Important limitations</h2>
        <div className="rounded-2xl border border-[#F5D9A0] bg-[#FFF6E3] px-6 py-[22px] text-[15px] text-body">
          Thermal imaging records surface-temperature patterns and does not see through walls, ceilings, floors or
          other building elements. A thermal anomaly does not, by itself, conclusively establish the presence, cause or
          extent of a concealed defect. Findings are interpreted in the context of the building’s construction,
          environmental conditions, visual observations and any supporting test results. Further intrusive or
          specialist investigation may be recommended where the cause remains uncertain.
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Questions"
          title="Frequently asked questions"
          intro="Clear answers about our thermographic and thermal imaging building surveys."
        />
        <FaqList items={FAQS} />
      </Section>

      <NavyBand
        title="Need a thermal imaging building survey?"
        text="Request a thermographic survey quote and our team will confirm suitability, scope and next steps for your property."
        actions={
          <>
            <ButtonLink href="/request-inspection" variant="light" className="whitespace-normal text-center">
              Request a thermographic survey quote
            </ButtonLink>
            <CallLink className="text-white hover:text-white" />
          </>
        }
      />

      <NoteStrip>
        Looking for a different service? <TextLink href="/services">View all property services</TextLink>
      </NoteStrip>

      <CallbackSection formName="Thermographic survey page call back" defaultNeeds={["Thermographic survey"]} />
    </>
  );
}
