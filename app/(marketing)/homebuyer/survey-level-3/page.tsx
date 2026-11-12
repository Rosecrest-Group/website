import { Check } from "lucide-react";
import { getPageMetadata } from "@/lib/page-metadata";
import PageJsonLd from "@/components/common/PageJsonLd";
import CallbackSection from "@/components/site/CallbackSection";
import { Eyebrow, Section, SectionHeading, TextLink } from "@/components/site/primitives";
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
import HeroQuickPrice from "@/components/site/homebuyer/HeroQuickPrice";
import SurveyLevelChooser from "@/components/site/homebuyer/SurveyLevelChooser";
import { LEVEL_3_PAGE_FAQ } from "@/lib/faqs";

export const metadata = getPageMetadata("/homebuyer/survey-level-3");

const INCLUDED = [
  {
    title: "A more detailed inspection and report",
    text: "A more detailed assessment of the building’s construction, condition and defects, based on a generally visual, non-invasive inspection of accessible areas, including roofs, floors and walls, with building services assessed where visible.",
  },
  {
    title: "Visible signs of significant defects and their likely implications",
    text: "The additional detail can help identify visible signs of significant defects, assess their likely implications and highlight where further specialist investigation may be necessary before purchase.",
  },
  {
    title: "Repair cost estimates where applicable",
    text: "More extensive advice on repairs and maintenance, with repair cost estimates where applicable to help you plan.",
  },
];

const WHY = [
  "The most detailed RICS home survey level",
  "More detailed assessment of construction and defects",
  "More extensive repair and maintenance advice",
  "Repair cost estimates where applicable",
];

// "What a Level 3 survey doesn't cover". Wording from Rosecrest's approved rules
// (claude/article-writing-rules.md) and copy already published on this page.
const NOT_COVERED = [
  {
    title: "No opening up",
    text: "Level 3 surveys are generally visual and non-invasive. Surveyors inspect accessible areas without opening up the building or carrying out destructive investigations.",
  },
  {
    title: "Hidden defects",
    text: "A Level 3 doesn’t guarantee finding concealed or hidden defects. Findings are based on accessible areas and the evidence available at the time of inspection.",
  },
  {
    title: "Testing services",
    text: "Building services are assessed where visible and accessible, rather than tested. Where needed, the report highlights where further specialist investigation may be necessary.",
  },
  {
    title: "A structural engineer’s report",
    text: "A Level 3 isn’t a structural engineer’s report. If a survey recommends further structural assessment, obtain a quotation from an appropriately qualified structural engineer.",
  },
  {
    title: "Legal matters",
    text: "A home survey isn’t a legal investigation, but the surveyor may flag matters for your legal adviser.",
  },
  {
    title: "A valuation",
    text: "A valuation is not included with this survey, but a separate, discounted valuation can be provided upon request.",
  },
];

// "London homes". New wording (12 Nov 2026), awaiting Rosecrest's review.
const LONDON_HOMES = [
  {
    title: "Period homes",
    text: "Much of London’s housing is Victorian, Edwardian or interwar. A Level 3 is designed for older, altered or non-standard buildings, and gives more extensive advice on repairs and maintenance, with repair cost estimates where applicable.",
  },
  {
    title: "Extensions, lofts and basements",
    text: "Where a home has been extended, converted or had a loft or basement added, a Level 3 gives a more detailed assessment of its construction and defects, and highlights where further specialist investigation may be needed. Planning and building control matters are for your legal adviser; the surveyor may flag them.",
  },
  {
    title: "Listed buildings and conservation areas",
    text: "A Level 3 suits heritage and listed properties. Listing and conservation-area status are legal and planning matters for your legal adviser to check; the surveyor may flag things to look into.",
  },
];

// Starting prices shown in the cost section, from the booking form's own price list.
const PRICE_ROWS = ["Studio", "1 Bedroom", "2 Bedroom", "3 Bedroom", "4 Bedroom"].map((bedrooms) => ({
  label: bedrooms === "Studio" ? "Studio" : bedrooms.replace(" Bedroom", "-bedroom property"),
  price: formatPounds(surveyPrice(3, bedrooms)),
}));

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
        pills={["Most comprehensive", "from £550.99", "Report in 5–7 working days"]}
        title="RICS Level 3 Building Survey in London"
        lede="A RICS Level 3 survey, also known as a Building Survey and formerly called a full structural survey, is the most detailed RICS home survey. It gives a more detailed assessment of the building’s construction, condition and defects, including more extensive advice on repairs and maintenance."
        sublede="Carried out by qualified and experienced surveyors across London and areas within the M25."
        facts={[
          "Fixed price from £550.99 for a studio, VAT included. Your quote depends on the property’s size, type, location and complexity",
          "Inspection typically takes 2–3 hours",
          "Report within 5–7 working days, or choose our Express 48-Hour Report option",
        ]}
        aside={<HeroQuickPrice level={3} />}
      />

      <SurveyTrustStrip />

      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
          <div className="flex flex-col gap-4">
            <Eyebrow>Level 3 Building Survey</Eyebrow>
            <h2 className="text-[30px] font-extrabold leading-[1.08] md:text-[40px]">What is the RICS Level 3 Survey?</h2>
            <div className="flex flex-col gap-4 text-lg text-body">
              <p>
                The RICS Level 3 Survey, also known as a Building Survey, provides a more detailed assessment of the
                building’s construction, condition and defects, including more extensive advice on repairs and
                maintenance. That additional detail can help identify visible signs of significant defects, assess their likely implications and highlight where further specialist investigation may be necessary before purchase.
              </p>
              <p>
                Both Level 2 and Level 3 surveys are generally visual and non-invasive. Surveyors inspect accessible areas without opening up the building or carrying out destructive investigations. A home survey isn’t a legal investigation, but the surveyor may flag matters for your legal adviser.
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

      <Section id="scope">
        <SectionHeading
          eyebrow="Level 3 Building Survey"
          title="What a Level 3 survey doesn’t cover"
          intro="Knowing the limits helps you plan any further investigation before you buy."
        />
        <ul className="m-0 grid list-none gap-x-12 gap-y-4 p-0 text-[17px] text-body md:grid-cols-2">
          {NOT_COVERED.map((item) => (
            <Tick key={item.title} bad>
              <b className="text-ink">{item.title}.</b> {item.text}
            </Tick>
          ))}
        </ul>
      </Section>

      <TurnaroundSection
        tone="mist"
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

      <ConditionRatingsSection tone="white" />

      <Section tone="mist">
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
              { text: "More detailed assessment of defects, with repair cost estimates where applicable" },
              { text: "For buyers who want more detailed advice on repairs and maintenance" },
              { text: "Recommended for properties requiring significant renovation or restoration" },
            ]}
          />
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Level 3 Building Survey"
          title="Why choose a Level 3 Building Survey?"
          intro="The Level 3 survey is the most detailed RICS home survey level. Like a Level 2, it is generally visual and non-invasive. It suits properties where age, construction, alterations or renovation plans call for more detailed advice on defects, repairs and maintenance."
        />
        <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          {WHY.map((item) => (
            <div key={item} className="flex flex-col gap-3 rounded-[18px] border border-line bg-white p-[22px]">
              <CheckHeading>{item}</CheckHeading>
            </div>
          ))}
        </div>
      </Section>

      <Section id="cost" tone="mist">
        <SectionHeading
          eyebrow="Level 3 survey cost"
          title="What does a Level 3 survey cost in London?"
          intro="Our Level 3 Building Survey starts from £550.99 for a studio, including VAT. The final quotation depends on the property’s size, type, location and complexity, and you see your fixed price before you book."
        />
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div className="flex flex-col gap-4 text-[17px] text-body">
            <p>
              For Level 3 surveys, HomeOwners Alliance’s indicative national price range is £630 to £1,500, with costs
              varying according to property value, size, condition and complexity.
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
            <h3 className="text-[19px] font-bold">Level 3 starting prices, including VAT</h3>
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

      <Section id="london-homes">
        <SectionHeading
          eyebrow="Buying in London"
          title="Older London homes, extensions and listed buildings"
          intro="The properties where a Level 3 is most often the right choice."
        />
        <div className="grid gap-[18px] md:grid-cols-3">
          {LONDON_HOMES.map((item) => (
            <div key={item.title} className="flex flex-col gap-3 rounded-[18px] border border-line bg-white p-6">
              <h3 className="text-[20px] font-bold leading-[1.25]">{item.title}</h3>
              <p className="text-[16px] text-body">{item.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="which-survey" tone="mist">
        <SectionHeading
          eyebrow="Level 2 or Level 3?"
          title="Should I get a Level 2 or a Level 3 survey?"
          intro="Both are generally visual and non-invasive. The right one depends on the property. Tick anything that applies to see which survey is designed for it."
        />
        <SurveyLevelChooser page={3} />
      </Section>

      <PriceSection level={3} />

      <SurveyFaqSection
        title="About the RICS Level 3 Survey"
        items={faqItems(LEVEL_3_PAGE_FAQ.map(({ question, answer }) => ({ q: question, a: answer })))}
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
