import { getPageMetadata } from "@/lib/page-metadata";
import PageJsonLd from "@/components/common/PageJsonLd";
import CallbackSection from "@/components/site/CallbackSection";
import { ButtonLink, FaqList, PageHero, Section, SectionHeading, TextLink } from "@/components/site/primitives";
import BookingDialogButton from "@/components/site/homebuyer/BookingDialogButton";
import SampleReportsButton from "@/components/site/homebuyer/SampleReportsButton";
import TermsButton from "@/components/site/homebuyer/TermsButton";
import { SURVEY_FAQ, SurveyTrustStrip, Tick, faqItems } from "@/components/site/homebuyer/survey-sections";

export const metadata = getPageMetadata("/homebuyer");

const STEPS = [
  {
    title: "Compare the three levels",
    text: "See what each RICS survey covers, how long the report takes and the fixed price.",
  },
  { title: "Read what’s included", text: "Each survey page explains the inspection, the report and its key features." },
  { title: "Select your survey", text: "Check availability and get a fixed price. Takes less than 60 seconds." },
];

const LEVELS = [
  {
    level: 1,
    badge: "Best for newer homes",
    title: "Level 1: Home Conditions Survey",
    features: [
      "Ideal for new builds and standardised properties built within the last 5-10 years",
      "Perfect for obtaining a brief insight of the property condition",
      "Appropriate for unaltered and non-extended property",
      "Not suitable for older, larger or non-traditional properties",
    ],
    price: "from £313.99",
    meta: "VAT included · Report within 2 working days",
    href: "/homebuyer/survey-level-1",
  },
  {
    level: 2,
    badge: "Most common choice",
    title: "Level 2: Homebuyer Survey",
    features: ["Modern / conventional properties", "Visual inspection", "Detailed condition ratings", "Ideal for low-risk purchases"],
    price: "from £363.99",
    meta: "VAT included · Report within 3–5 working days",
    href: "/homebuyer/survey-level-2",
  },
  {
    level: 3,
    badge: "Most comprehensive",
    title: "Level 3: Building Survey",
    features: [
      "Older, altered or non-standard buildings",
      "Full defect analysis",
      "Repair implications & costings included",
      "For buyers who want certainty",
    ],
    price: "from £611.49",
    meta: "VAT included · Report within 5–7 working days",
    href: "/homebuyer/survey-level-3",
  },
];

const COMPARE: [string, string, string, string][] = [
  ["Traffic-light condition ratings", "Yes", "Yes", "Yes"],
  ["Advice on repairs and maintenance", "No", "Yes", "Detailed"],
  ["Causes of defects explained", "No", "Headline", "In depth"],
  ["Repair options and cost estimates", "No", "No", "Optional"],
  ["Notes on legal matters for your conveyancer", "Yes", "Yes", "Yes"],
  ["Typical inspection time", "1–2 hours", "2–3 hours", "2–3 hours"],
  ["Report delivered", "2 working days", "3–5 working days", "5–7 working days"],
  ["Express 48-hour report", "Available", "Available", "Available"],
  ["Price, VAT included", "from £313.99", "from £363.99", "from £611.49"],
];

const infoCardClass = "flex flex-col gap-3 rounded-[18px] border border-line bg-white p-[26px]";
const infoLinkClass = "mt-auto self-start text-[15px] font-bold text-teal no-underline hover:text-teal-dark";

export default function Page() {
  return (
    <>
      <PageJsonLd path="/homebuyer" />

      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "RICS surveys" }]}
        eyebrow="RICS surveys in London"
        title="Buying a property? Choose the right survey in 60 seconds"
        intro={
          <>
            <p>We’ll help you select the most suitable survey based on the property you’re purchasing.</p>
            <p className="text-[17px]">
              A RICS survey helps you make an informed decision before you purchase a property. It reflects the
              condition of the property at the time of the inspection, giving you a comprehensive view of what you’re
              buying before you commit.
            </p>
          </>
        }
        actions={
          <>
            <ButtonLink href="#levels">Let’s help you choose the right survey</ButtonLink>
            <ButtonLink href="#compare" variant="outline" className="border-2 border-line-strong">
              Compare the three levels
            </ButtonLink>
          </>
        }
        media={
          <div className="flex flex-col gap-4 rounded-[22px] bg-white p-6 shadow-[0_24px_50px_-30px_rgba(15,30,56,0.4)] sm:p-[30px]">
            <span className="text-[13px] font-bold uppercase tracking-[0.06em] text-muted-ink">Choosing your survey</span>
            <b className="font-display text-2xl">Three steps, all on this page</b>
            <ol className="m-0 flex list-none flex-col gap-4 p-0">
              {STEPS.map((step, i) => (
                <li key={step.title} className="flex items-start gap-3.5 border-t border-line pt-4">
                  <span
                    aria-hidden="true"
                    className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-navy font-extrabold text-white"
                  >
                    {i + 1}
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <b className="text-[17px]">{step.title}</b>
                    <span className="text-[15px] text-body">{step.text}</span>
                  </span>
                </li>
              ))}
            </ol>
            <span className="rounded-xl bg-mist px-3.5 py-3 text-sm text-muted-ink">
              If you ask, our trusted advisors will explain the nature and scope of each survey. The final choice of
              survey is yours.
            </span>
          </div>
        }
      >
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-base text-body">
          <Tick>Fixed prices, VAT included, from £313.99</Tick>
          <Tick>Qualified and experienced surveyors across London and areas within the M25</Tick>
          <Tick>Express 48-Hour Report option on every level</Tick>
        </ul>
      </PageHero>

      <SurveyTrustStrip />

      <Section id="levels" tone="mist">
        <SectionHeading
          eyebrow="Let’s help you choose the right survey"
          title="Pick the right survey"
          intro="Three RICS survey levels, each with a fixed price. Compare what each one covers, then select the survey for the property you’re buying."
        />
        <div className="grid gap-[18px] md:grid-cols-2 lg:grid-cols-3">
          {LEVELS.map((item) => (
            <div key={item.level} className="flex flex-col gap-3 rounded-[18px] border border-line bg-white p-[26px]">
              <span className="self-start rounded-full bg-teal-tint px-2.5 py-[5px] text-xs font-extrabold uppercase tracking-[0.04em] text-teal">
                {item.badge}
              </span>
              <h3 className="text-[22px] font-bold leading-[1.25]">{item.title}</h3>
              <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[15px] text-body">
                {item.features.map((feature) => (
                  <Tick key={feature}>{feature}</Tick>
                ))}
              </ul>
              <div className="mt-auto flex flex-col gap-0.5 pt-1.5">
                <span className="font-display text-[26px] font-extrabold">{item.price}</span>
                <span className="text-[13px] text-muted-ink">{item.meta}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <ButtonLink href={`${item.href}#price`} size="sm">
                  Select Level {item.level} Survey
                </ButtonLink>
                <TextLink href={item.href} className="text-[15px]">
                  Read more →
                </TextLink>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="compare">
        <SectionHeading title="Compare the three levels" />
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[680px] border-collapse text-left text-[15px]">
            <caption className="sr-only">RICS Level 1, 2 and 3 surveys compared</caption>
            <thead>
              <tr className="bg-navy text-white">
                {["What’s included", "Level 1", "Level 2", "Level 3"].map((col) => (
                  <th key={col} scope="col" className="px-5 py-3.5 font-bold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map(([label, ...cells], r) => (
                <tr key={label} className={r % 2 === 1 ? "bg-mist-soft" : "bg-white"}>
                  <th scope="row" className="w-[34%] border-t border-line px-5 py-3.5 font-bold text-ink">
                    {label}
                  </th>
                  {cells.map((cell, c) => (
                    <td key={c} className="border-t border-line px-5 py-3.5 text-body">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-ink">
          Every survey is carried out under our <TermsButton>Terms of Engagement</TermsButton>, sent to you before the
          inspection. If you ask, we’ll explain the difference between the survey options. The final choice of survey
          rests with you.
        </p>
      </Section>

      <Section tone="mist">
        <SectionHeading title="Need more information?" />
        <div className="grid gap-[18px] md:grid-cols-3">
          <div className={infoCardClass}>
            <h3 className="text-[21px] font-bold leading-[1.25]">Sample Report Preview</h3>
            <p className="text-[15px] text-body">View examples of our survey reports</p>
            <SampleReportsButton className={infoLinkClass}>View sample report →</SampleReportsButton>
          </div>
          <div className={infoCardClass}>
            <h3 className="text-[21px] font-bold leading-[1.25]">Terms Of Engagement</h3>
            <p className="text-[15px] text-body">View our terms of engagement</p>
            <TermsButton className="mt-auto self-start text-[15px]">View terms →</TermsButton>
          </div>
          <div className={infoCardClass}>
            <h3 className="text-[21px] font-bold leading-[1.25]">Speak with our team</h3>
            <p className="text-[15px] text-body">
              For more information, talk to our trusted advisors. Mon to Fri, 8am to 5pm.
            </p>
            <a href="#callback" className={infoLinkClass}>
              Request a call back →
            </a>
          </div>
        </div>
      </Section>

      <section className="bg-navy text-white">
        <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-8 px-gutter py-14 md:py-16">
          <h2 className="max-w-[640px] text-[28px] font-extrabold leading-[1.1] text-white md:text-4xl">
            Ready to check availability and get a fixed price?
          </h2>
          <div className="flex flex-col items-center gap-2">
            <BookingDialogButton className="inline-flex min-h-11 items-center justify-center whitespace-normal rounded-xl bg-teal px-[26px] py-[17px] text-center text-[17px] font-bold text-white hover:bg-teal-dark sm:whitespace-nowrap">
              Check Availability &amp; Fixed Price
            </BookingDialogButton>
            <span className="text-sm text-navy-text">Takes less than 60 seconds.</span>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-white">
        <p className="mx-auto w-full max-w-[1440px] px-gutter py-8 text-center text-lg text-body">
          Looking for a different service?{" "}
          <TextLink href="/services" className="underline">
            View all property services
          </TextLink>
        </p>
      </section>

      <Section tone="mist">
        <SectionHeading
          eyebrow="Questions"
          title="Frequently asked questions"
          intro="Here are answers to the most common questions about our property surveys, valuations, and reports."
        />
        <FaqList
          items={faqItems([
            SURVEY_FAQ.level2vs3,
            SURVEY_FAQ.howLong,
            SURVEY_FAQ.whenReport,
            SURVEY_FAQ.photos,
            SURVEY_FAQ.vacant,
            SURVEY_FAQ.bedrooms,
            SURVEY_FAQ.advise,
            {
              q: "Which areas do you cover?",
              a: (
                <p>
                  We carry out RICS surveys across London and areas within the M25. Check your postcode on our{" "}
                  <TextLink href="/areas-we-cover">areas we cover</TextLink> page.
                </p>
              ),
            },
          ])}
        />
      </Section>

      <CallbackSection formName="RICS surveys page call back" />
    </>
  );
}
