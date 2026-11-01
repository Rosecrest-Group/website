import { Check } from "lucide-react";
import { getPageMetadata } from "@/lib/page-metadata";
import PageJsonLd from "@/components/common/PageJsonLd";
import CallbackSection from "@/components/site/CallbackSection";
import { Eyebrow, Section, SectionHeading } from "@/components/site/primitives";
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
  TurnaroundSection,
  faqItems,
} from "@/components/site/homebuyer/survey-sections";

export const metadata = getPageMetadata("/homebuyer/survey-level-3");

const INCLUDED = [
  {
    title: "Comprehensive inspection with a detailed, thorough report",
    text: "A full analysis of the property’s construction and condition, examining all accessible areas including roofs, floors, walls, and services.",
  },
  {
    title: "Identification of visible defects and assessment of potential future problems",
    text: "Detailed analysis of current issues and expert predictions about potential problems if repairs aren’t addressed promptly.",
  },
  {
    title: "Optional estimated repair costs for identified issues",
    text: "Budget planning assistance with estimated costs for necessary repairs and maintenance work.",
  },
];

const WHY = [
  "Most thorough inspection available",
  "Expert structural analysis",
  "Detailed repair recommendations",
  "Optional cost estimates included",
];

function CheckHeading({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-start gap-2.5 text-[17px]">
      <Check aria-hidden="true" className="mt-[3px] h-[18px] w-[18px] shrink-0 text-teal" strokeWidth={2.4} />
      <h3 className="font-body text-[17px] font-bold leading-[1.4] tracking-normal">{children}</h3>
    </span>
  );
}

export default function Page() {
  return (
    <>
      <PageJsonLd path="/homebuyer/survey-level-3" />

      <SurveyHero
        crumb="Level 3 Building Survey"
        pills={["Most comprehensive", "from £611.49", "Report in 5–7 working days"]}
        eyebrow="RICS Level 3 survey in London"
        title="RICS Level 3 Survey: Building Survey"
        lede="The most detailed RICS survey: an in-depth inspection of the property, including any significant defects and fixtures."
        sublede="Carried out by qualified and experienced surveyors across London and areas within the M25."
        facts={[
          "Fixed price from £611.49, VAT included",
          "Inspection typically takes 2–3 hours",
          "Report within 5–7 working days, or choose our Express 48-Hour Report option",
        ]}
      />

      <SurveyTrustStrip />

      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
          <div className="flex flex-col gap-4">
            <Eyebrow>Level 3 Building Survey</Eyebrow>
            <h2 className="text-[30px] font-extrabold leading-[1.08] md:text-[40px]">What is the RICS Level 3 Survey?</h2>
            <div className="flex flex-col gap-4 text-lg text-body">
              <p>
                The RICS Level 3 Survey, also known as a Building Survey, provides an in-depth inspection of the
                property, including any significant defects and fixtures. This detailed report is designed to help
                buyers make informed decisions about whether to proceed with their purchase.
              </p>
              <p>
                While our surveyors cannot advise on whether to proceed or withdraw from a purchase, this survey is
                particularly recommended for older or heritage buildings, which may have structural concerns or
                restrictions on modifications.
              </p>
            </div>
          </div>
          <SampleExtract
            caption="Victorian mid-terrace · illustrative"
            rows={[
              {
                rating: 3,
                title: "E2 Roof coverings",
                text: "Slipped and cracked slates to the rear slope. Repair needed now to stop water reaching the roof space.",
              },
              {
                rating: 3,
                title: "F3 Dampness",
                text: "High readings to the front bay. Likely cause: bridged damp-proof course from raised paving.",
              },
              { rating: 2, title: "E3 Walls", text: "Open mortar joints to the rear addition. Repoint within 12 months." },
              { rating: 1, title: "E5 Windows", text: "Replacement uPVC units in reasonable order." },
            ]}
          />
        </div>
      </Section>

      <Section tone="mist">
        <SectionHeading eyebrow="What’s included" title="What’s included in a Building Survey?" />
        <div className="grid gap-[18px] md:grid-cols-3">
          {INCLUDED.map((item) => (
            <div key={item.title} className="flex flex-col gap-3 rounded-[18px] border border-line bg-white p-[26px]">
              <CheckHeading>{item.title}</CheckHeading>
              <p className="text-[15px] text-body">{item.text}</p>
            </div>
          ))}
        </div>
        <p className="rounded-2xl border border-teal-line bg-teal-tint px-[22px] py-[18px] text-base text-ink">
          <b>Please note:</b> A valuation is not included with this survey, but a separate, discounted valuation can be
          provided upon request.
        </p>
      </Section>

      <TurnaroundSection
        tone="white"
        paragraphs={[
          "The duration of the survey depends on the size of the property, but typically takes 2-3 hours.",
          "Your Level 3 Building Survey will be delivered within 5–7 working days of the inspection as standard.",
          "Need it sooner? Choose our Express 48-Hour Report option when you check availability and get your fixed price, ideal if you’re working to a tight purchase timeline.",
        ]}
        facts={[
          { label: "Inspection", value: "Typically 2–3 hours" },
          { label: "Report", value: "Within 5–7 working days" },
          { label: "Need it sooner?", value: "Express 48-Hour Report" },
        ]}
      />

      <ConditionRatingsSection tone="mist" />

      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-16">
          <SectionHeading
            eyebrow="Level 3 Building Survey"
            title="Key features of this survey"
            intro="The facts to compare against the property you’re buying. The final choice of survey is yours."
          />
          <KeyFeaturesCard
            items={[
              { text: "Ideal for older, altered or non-standard buildings" },
              { text: "Perfect for heritage and listed properties" },
              { text: "Full defect analysis with repair implications and optional costings" },
              { text: "For buyers who want certainty and comprehensive information" },
              { text: "Recommended for properties requiring significant renovation or restoration" },
            ]}
          />
        </div>
      </Section>

      <Section tone="mist">
        <SectionHeading
          eyebrow="Level 3 Building Survey"
          title="Why choose a Level 3 Building Survey?"
          intro="The Level 3 survey is the most detailed property inspection available, providing you with complete peace of mind. It’s especially valuable for properties where structural integrity, historical significance, or extensive renovation plans are key considerations."
        />
        <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          {WHY.map((item) => (
            <div key={item} className="flex flex-col gap-3 rounded-[18px] border border-line bg-white p-[22px]">
              <CheckHeading>{item}</CheckHeading>
            </div>
          ))}
        </div>
      </Section>

      <PriceSection level={3} />

      <SurveyFaqSection
        title="About the RICS Level 3 Survey"
        items={faqItems([
          {
            q: "Does a Level 3 survey include a valuation?",
            a: "No. A valuation is not included with this survey, but a separate, discounted valuation can be provided upon request.",
          },
          SURVEY_FAQ.level2vs3,
          SURVEY_FAQ.advise,
          SURVEY_FAQ.howLong,
          SURVEY_FAQ.whenReport,
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
            title: "Level 2: Homebuyer Survey",
            text: "Most common choice. A detailed visual inspection for modern and conventional properties.",
            href: "/homebuyer/survey-level-2",
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

      <CallbackSection formName="Level 3 survey page call back" defaultNeeds={["RICS Level 3 Building Survey"]} />
    </>
  );
}
