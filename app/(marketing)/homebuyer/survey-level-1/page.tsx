import { getPageMetadata } from "@/lib/page-metadata";
import PageJsonLd from "@/components/common/PageJsonLd";
import CallbackSection from "@/components/site/CallbackSection";
import { Section, SectionHeading } from "@/components/site/primitives";
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

export const metadata = getPageMetadata("/homebuyer/survey-level-1");

const INCLUDED = [
  "Condition of the building, services and grounds",
  "Traffic light rating for each element",
  "Legal matters for your conveyancer",
  "Risks to the building, its occupants and the grounds",
  "Further investigations recommended where needed",
  "Photographs of defects identified",
];

export default function Page() {
  return (
    <>
      <PageJsonLd path="/homebuyer/survey-level-1" />

      <SurveyHero
        crumb="Level 1 Condition Report"
        pills={["Best for newer homes", "from £313.99", "Report within 2 working days"]}
        eyebrow="RICS Level 1 survey in London"
        title="RICS Level 1 Survey: Condition Report"
        lede="A straightforward overview of the property’s condition using a simple traffic light rating system."
        sublede="Carried out by qualified and experienced surveyors across London and areas within the M25."
        facts={[
          "Fixed price from £313.99, VAT included",
          "Inspection typically takes 1–2 hours",
          "Report within 2 working days, or choose our Express 48-Hour Report option",
        ]}
      />

      <SurveyTrustStrip />

      <Section>
        <SectionHeading eyebrow="Level 1 Condition Report" title="What is included?" />
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <div className="flex flex-col gap-4 text-[17px] text-body">
              <p>
                This report provides an overview of the building’s condition, including its services and grounds. It
                highlights any defects or issues identified during the inspection, using an easy-to-understand traffic
                light system. Additionally, the report addresses relevant legal matters and potential risks to the
                building, its occupants or the surrounding grounds.
              </p>
              <p>
                The RICS Level 1 Survey, also known as a Condition Survey, does not offer specific advice on repairs or
                ongoing maintenance. If the surveyor is unable to draw conclusions about any part of the property with
                sufficient confidence, the report will recommend further investigations.
              </p>
            </div>
            <ul className="m-0 mt-6 grid list-none gap-x-8 gap-y-3.5 p-0 text-base text-body sm:grid-cols-2">
              {INCLUDED.map((item) => (
                <Tick key={item}>{item}</Tick>
              ))}
            </ul>
          </div>
          <SampleExtract
            caption="Newer flat · illustrative"
            rows={[
              {
                rating: 3,
                title: "F4 Heating",
                text: "Boiler losing pressure. Further investigation by a Gas Safe registered engineer recommended.",
              },
              { rating: 2, title: "E5 Windows", text: "Failed seal to one double-glazed unit in the rear bedroom." },
              { rating: 1, title: "E2 Roof coverings", text: "No defects seen from ground level." },
              { rating: 1, title: "G1 Garage and grounds", text: "Paving and boundary fences in reasonable condition." },
            ]}
          />
        </div>
      </Section>

      <TurnaroundSection
        tone="mist"
        paragraphs={[
          "The duration of the survey depends on the size of the property, but typically takes 1-2 hours.",
          "Your Level 1 Condition Report will be delivered within 2 working days of the inspection as standard.",
          "Need it sooner? Choose our Express 48-Hour Report option when you check availability and get your fixed price, ideal if you’re working to a tight purchase timeline.",
        ]}
        facts={[
          { label: "Inspection", value: "Typically 1–2 hours" },
          { label: "Report", value: "Within 2 working days" },
          { label: "Need it sooner?", value: "Express 48-Hour Report" },
        ]}
      />

      <ConditionRatingsSection tone="white" />

      <Section tone="mist">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-16">
          <SectionHeading
            eyebrow="Level 1 Condition Report"
            title="Key features of this survey"
            intro="The facts to compare against the property you’re buying. The final choice of survey is yours."
          />
          <KeyFeaturesCard
            items={[
              { text: "Ideal for new builds and standardised properties built within the last 5-10 years" },
              { text: "Perfect for obtaining a brief insight of the property condition" },
              { text: "Appropriate for unaltered and non-extended property" },
              { text: "Not suitable for older, larger or non-traditional properties", bad: true },
            ]}
          />
        </div>
      </Section>

      <PriceSection level={1} />

      <SurveyFaqSection
        title="About the RICS Level 1 Survey"
        items={faqItems([
          {
            q: "Does a Level 1 survey include advice on repairs?",
            a: "No. The RICS Level 1 Survey does not offer specific advice on repairs or ongoing maintenance. If the surveyor cannot draw conclusions about any part of the property with sufficient confidence, the report will recommend further investigations.",
          },
          SURVEY_FAQ.howLong,
          SURVEY_FAQ.whenReport,
          SURVEY_FAQ.photos,
          SURVEY_FAQ.vacant,
          SURVEY_FAQ.bedrooms,
        ])}
      />

      <OtherSurveys
        cards={[
          {
            title: "Level 2: Homebuyer Survey",
            text: "Most common choice. A detailed visual inspection for modern and conventional properties.",
            href: "/homebuyer/survey-level-2",
            cta: "Read more →",
          },
          {
            title: "Level 3: Building Survey",
            text: "Most comprehensive. An in-depth inspection for older, altered or non-standard buildings.",
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

      <CallbackSection formName="Level 1 survey page call back" defaultNeeds={["RICS Level 1 Condition Report"]} />
    </>
  );
}
