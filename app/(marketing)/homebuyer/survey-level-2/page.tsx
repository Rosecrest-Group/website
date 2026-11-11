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
  SurveyFaqSection,
  SurveyHero,
  SurveyTrustStrip,
  Tick,
  TurnaroundSection,
  faqItems,
} from "@/components/site/homebuyer/survey-sections";
import { formatPounds, surveyPrice } from "@/components/site/homebuyer/pricing";
import { LEVEL_2_PAGE_FAQ } from "@/lib/faqs";

export const metadata = getPageMetadata("/homebuyer/survey-level-2");

const INCLUDED = [
  "A visual inspection of the property to evaluate its overall condition and state of repair",
  "Identification of visible significant defects, along with recommendations for further investigation where necessary",
  "Assessment of accessible building elements, both inside and outside, including walls, ceilings, roofs, gutters, windows and doors",
  "A visual appraisal of services such as gas/oil heating, electricity, water and drainage, with suggestions for further inspections if needed",
  "A traffic light grading system to indicate the severity of any identified issues",
  "Identification of urgent repair needs and future maintenance requirements",
  "A Next Steps Action Plan, setting out what to do about the issues the report identifies",
  "Matters such as planning, building control or disputes flagged for your legal adviser to check, as a home survey isn’t a legal investigation",
];

// Starting prices shown in the "What does it cost" section. They come from the same
// price list as the booking form, so the two can't drift apart.
const PRICE_ROWS = ["Studio", "1 Bedroom", "2 Bedroom", "3 Bedroom", "4 Bedroom"].map((bedrooms) => ({
  label: bedrooms === "Studio" ? "Studio" : bedrooms.replace(" Bedroom", "-bedroom property"),
  price: formatPounds(surveyPrice(2, bedrooms)),
}));

export default function Page() {
  return (
    <>
      <PageJsonLd path="/homebuyer/survey-level-2" />

      <SurveyHero
        crumb="Level 2 Homebuyer Survey"
        pills={["Most common choice", "from £330.99", "Report in 3–5 working days"]}
        eyebrow="RICS Level 2 Home Survey"
        title="RICS Level 2 Survey in London"
        lede="A RICS Level 2 survey, also known as the Homebuyer Report, is a visual, non-invasive inspection of a conventional home in reasonable condition. It uses traffic-light condition ratings to show which defects need urgent attention, which need repair, and what to check further before you buy."
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

      <Section id="cost">
        <SectionHeading
          eyebrow="Level 2 survey cost"
          title="What does a Level 2 survey cost in London?"
          intro="Our Level 2 survey starts from £330.99 for a studio, including VAT. The final quotation depends on the property’s size, type, location and complexity, and you see your fixed price before you book."
        />
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div className="flex flex-col gap-4 text-[17px] text-body">
            <p>
              HomeOwners Alliance reports that the average Level 2 survey in London cost approximately £590 in August
              2026, based on Reallymoving data.
            </p>
            <p>
              RICS also explains that survey costs vary according to the property and the level of inspection
              required. More detailed surveys, particularly for larger or more complex properties, generally cost
              more.
            </p>
            <p>All our quotations include VAT. Payment secures your booking.</p>
            <TextLink href="#price" className="self-start">
              Get your fixed price →
            </TextLink>
          </div>
          <div className="rounded-[18px] border border-line bg-white p-6 sm:p-[30px]">
            <h3 className="text-[19px] font-bold">Level 2 starting prices, including VAT</h3>
            <ul className="m-0 mt-3 list-none p-0">
              {PRICE_ROWS.map((row) => (
                <li
                  key={row.label}
                  className="flex items-baseline justify-between gap-4 border-t border-line py-3 text-[17px] first:border-t-0"
                >
                  <span className="text-body">{row.label}</span>
                  <b className="font-display">from {row.price}</b>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-muted-ink">
              Larger properties are priced on the same basis. Enter the bedrooms below to see yours.
            </p>
          </div>
        </div>
      </Section>

      <PriceSection level={2} />

      <SurveyFaqSection
        title="About the RICS Level 2 Survey"
        items={faqItems(LEVEL_2_PAGE_FAQ.map(({ question, answer }) => ({ q: question, a: answer })))}
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
