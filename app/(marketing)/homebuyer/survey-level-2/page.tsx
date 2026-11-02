import { getPageMetadata } from "@/lib/page-metadata";
import PageJsonLd from "@/components/common/PageJsonLd";
import CallbackSection from "@/components/site/CallbackSection";
import { Section, SectionHeading, TextLink } from "@/components/site/primitives";
import {
  ConditionRatingsSection,
  KeyFeaturesCard,
  OtherSurveys,
  PriceSection,
  SampleExtract,
  SURVEY_FAQ,
  SurveyFaqSection,
  SurveyHero,
  SurveyTrustStrip,
  Tick,
  TurnaroundSection,
  faqItems,
} from "@/components/site/homebuyer/survey-sections";

export const metadata = getPageMetadata("/homebuyer/survey-level-2");

const INCLUDED = [
  "A visual inspection of the property to evaluate its overall condition and state of repair",
  "Identification of visible significant defects, along with recommendations for further investigation where necessary",
  "Assessment of accessible building elements, both inside and outside, including walls, ceilings, roofs, gutters, windows and doors",
  "A visual appraisal of services such as gas/oil heating, electricity, water and drainage, with suggestions for further inspections if needed",
  "A traffic light grading system to indicate the severity of any identified issues",
  "Identification of urgent repair needs and future maintenance requirements",
  "Matters such as planning, building control or disputes flagged for your legal adviser to check, as a home survey isn’t a legal investigation",
];

export default function Page() {
  return (
    <>
      <PageJsonLd path="/homebuyer/survey-level-2" />

      <SurveyHero
        crumb="Level 2 Homebuyer Survey"
        pills={["Most common choice", "from £330.99", "Report in 3–5 working days"]}
        eyebrow="RICS Level 2 survey in London"
        title="RICS Level 2 Survey: Homebuyer Report"
        lede="Also known as the Homebuyer Report, the RICS Level 2 survey provides a detailed visual inspection of the property to assess its overall condition, including any notable defects."
        sublede="The report helps buyers make an informed decision about whether to proceed with their purchase. Please note, however, that our surveyors cannot advise whether to proceed with or withdraw from the purchase."
        facts={[
          "Fixed price from £330.99 for a studio, VAT included. Your quote depends on the property’s size, type, location and complexity",
          "Qualified and experienced surveyors across London and areas within the M25",
          "Express 48-Hour Report option available",
        ]}
      />

      <SurveyTrustStrip />

      <Section>
        <SectionHeading eyebrow="Level 2 Homebuyer Report" title="What is included?" />
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <div className="flex flex-col gap-4 text-[17px] text-body">
              <p>
                This report provides an overview of the building’s condition, including its services and grounds. It
                highlights any defects or issues identified during the inspection, using an easy-to-understand traffic
                light system. It also notes potential risks to the building, its occupants or the surrounding grounds, and
                may flag matters for your legal adviser to check. A home survey isn’t a legal investigation.
              </p>
              <p>
                The RICS Level 2 survey includes more detail than a Condition Survey, with greater detail on defects
                and urgency of any issues identified. If the surveyor is unable to draw conclusions about any part of
                the property with sufficient confidence, the report will recommend further investigations.
              </p>
              <p>Both Level 2 and Level 3 surveys are generally visual and non-invasive. Surveyors inspect accessible areas without opening up the building or carrying out destructive investigations.</p>
            </div>
            <ul className="m-0 mt-6 flex list-none flex-col gap-3.5 p-0 text-base text-body">
              {INCLUDED.map((item) => (
                <Tick key={item}>{item}</Tick>
              ))}
            </ul>
          </div>
          <SampleExtract
            caption="1990s semi-detached house · illustrative"
            rows={[
              {
                rating: 3,
                title: "E2 Roof coverings",
                text: "Slipped and cracked tiles to the rear slope. Repair needed now; further investigation of the roof space recommended.",
              },
              { rating: 2, title: "E3 Walls", text: "Open mortar joints to the rear elevation. Repointing needed, not urgent." },
              {
                rating: 2,
                title: "F2 Electricity",
                text: "Older consumer unit. An Electrical Installation Condition Report (EICR) is recommended.",
              },
              { rating: 1, title: "E5 Windows", text: "Replacement uPVC units in reasonable order." },
            ]}
          />
        </div>
      </Section>

      <TurnaroundSection
        tone="mist"
        paragraphs={[
          "Your detailed Level 2 HomeBuyer Report will be delivered within 5 working days of the inspection as standard.",
          "Need it sooner? Choose our Express 48-Hour Report option when you check availability and get your fixed price, ideal if you’re working to a tight purchase timeline.",
        ]}
        facts={[
          { label: "Report", value: "Within 5 working days" },
          { label: "Need it sooner?", value: "Express 48-Hour Report" },
          { label: "Fixed price", value: "from £330.99" },
        ]}
      />

      <ConditionRatingsSection tone="white" />

      <Section tone="mist">
        <SectionHeading
          eyebrow="Level 2 Homebuyer Report"
          title="Key features of this survey"
          intro="The facts to compare against the property you’re buying. The final choice of survey is yours."
        />
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-16">
          <KeyFeaturesCard
            items={[
              { text: "Ideal for modern and conventional properties built in the last 30 years" },
              { text: "Most popular choice for standard residential properties" },
              { text: "Appropriate for unaltered and non-extended property" },
              { text: "Not suitable for older, larger or non-traditional properties", bad: true },
            ]}
          />
          <div className="flex flex-col gap-3 rounded-[18px] border border-line bg-teal-tint p-6 sm:p-[30px]">
            <h3 className="text-[22px] font-bold leading-[1.25]">Additional Services</h3>
            <p className="text-[17px] text-body">
              You can add a property valuation, gas safety check or Electrical Installation Condition Report (EICR) to
              the Homebuyer Report for an additional fee.
            </p>
            <TextLink href="/services" className="self-start text-[15px]">
              View our Services Page →
            </TextLink>
          </div>
        </div>
      </Section>

      <PriceSection level={2} />

      <SurveyFaqSection
        title="About the RICS Level 2 Survey"
        items={faqItems([
          {
            q: "Is a Level 2 the same as a HomeBuyer Report?",
            a: "Yes. The RICS Level 2 survey is also known as the Homebuyer Report, and many people still use that name.",
          },
          SURVEY_FAQ.level2vs3,
          SURVEY_FAQ.advise,
          SURVEY_FAQ.whenReport,
          SURVEY_FAQ.photos,
          SURVEY_FAQ.vacant,
        ])}
      />

      <OtherSurveys
        cards={[
          {
            title: "Level 1: Home Conditions Survey",
            text: "Best for newer homes. A straightforward overview using a simple traffic light rating system.",
            href: "/homebuyer/survey-level-1",
            cta: "Read more →",
          },
          {
            title: "Level 3: Building Survey",
            text: "Most detailed. A more detailed assessment of construction, condition and defects for older, altered or non-standard buildings.",
            href: "/homebuyer/survey-level-3",
            cta: "Read more →",
          },
          {
            title: "Compare the three levels",
            text: "See what each RICS survey includes, side by side.",
            href: "/homebuyer#compare",
            cta: "Back to survey selection →",
          },
        ]}
      />

      <CallbackSection formName="Level 2 survey page call back" defaultNeeds={["RICS Level 2 Homebuyer Survey"]} />
    </>
  );
}
