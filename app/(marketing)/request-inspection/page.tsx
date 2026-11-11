import { getPageMetadata } from "@/lib/page-metadata";
import { PHONE, PHONE_HREF } from "@/lib/constants";
import PageJsonLd from "@/components/common/PageJsonLd";
import HeroTopBar from "@/components/site/HeroTopBar";
import TrustBadges from "@/components/site/TrustBadges";
import EnquiryForm from "@/components/site/contact/EnquiryForm";
import { Section, SectionHeading, StepNumber, TextLink } from "@/components/site/primitives";
import { formatPounds, surveyPrice } from "@/components/site/homebuyer/pricing";

export const metadata = getPageMetadata("/request-inspection");

// Starting prices Rosecrest has cleared for use (see claude/article-writing-rules.md, Prices).
// Survey prices come from the booking form's own price list.
const PRICES = [
  {
    label: "RICS Level 1 Condition Report",
    price: `from ${formatPounds(surveyPrice(1, "Studio"))}`,
    href: "/homebuyer/survey-level-1",
  },
  {
    label: "RICS Level 2 Homebuyer Survey",
    price: `from ${formatPounds(surveyPrice(2, "Studio"))}`,
    href: "/homebuyer/survey-level-2",
  },
  {
    label: "RICS Level 3 Building Survey",
    price: `from ${formatPounds(surveyPrice(3, "Studio"))}`,
    href: "/homebuyer/survey-level-3",
  },
  { label: "Damp, Mould and Condensation Survey", price: "from £540", href: "/services/damp-mould" },
];

const STEPS = [
  {
    title: "Tell us about the property",
    text: "Fill in the form with the address and what’s going on. If you’re not sure which service you need, say so: we’ll direct your enquiry to the appropriate team member.",
  },
  {
    title: "Get your quotation",
    text: "We provide a quotation based on the property details, with the total fee and expected report turnaround confirmed before booking. All quotations include VAT.",
  },
  {
    title: "Book the inspection",
    text: "Payment secures your booking. Our inspections are visual and non-invasive, with findings based on accessible areas and the evidence available at the time of inspection.",
  },
  {
    title: "Receive your report",
    text: "Your written report sets out the surveyor’s findings and recommendations, including where further specialist investigation may be needed.",
  },
];

export default function RequestInspectionPage() {
  return (
    <>
      <PageJsonLd path="/request-inspection" />

      <section className="bg-mist text-ink">
        <div className="mx-auto w-full max-w-[1440px] px-gutter pb-16 md:pb-24">
          <HeroTopBar items={[{ label: "Home", href: "/" }, { label: "Request an inspection" }]} />
          <div className="mt-7 grid items-start gap-10 md:mt-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-16">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <h1 className="text-[38px] font-extrabold leading-[1.04] md:text-[52px]">Request an inspection</h1>
                <p className="text-xl text-body">
                  Not sure which service you need? Provide a few details and our team will guide you on the most
                  appropriate next step.
                </p>
                <p className="text-[17px] text-body">
                  Rosecrest Group Ltd is a RICS-regulated surveying firm providing property surveys, inspections and
                  expert reports across London and the South East. We cover London’s 32 boroughs and the City of
                  London, as well as towns around the M25 in Surrey, Kent, Hertfordshire and Essex.
                </p>
              </div>

              <div className="rounded-[18px] border border-line bg-white p-6">
                <h2 className="text-[19px] font-bold leading-[1.3]">Starting prices, including VAT</h2>
                <ul className="m-0 mt-2 list-none p-0">
                  {PRICES.map((row) => (
                    <li
                      key={row.label}
                      className="flex items-baseline justify-between gap-4 border-t border-line py-3 first:border-t-0"
                    >
                      <TextLink href={row.href} className="text-[16px] font-semibold">
                        {row.label}
                      </TextLink>
                      <b className="shrink-0 font-display text-[17px]">{row.price}</b>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-sm text-muted-ink">
                  RICS survey prices are for a studio property; the final quotation depends on the property’s size,
                  type, location and complexity. Damp, Mould and Condensation Surveys are subject to the property’s
                  circumstances and the agreed scope of inspection. CPR Part 35 expert reports are quoted on request,
                  subject to formal instruction, conflict checks and agreed terms.
                </p>
              </div>

              <p className="text-[17px] text-body">
                Prefer to talk it through? Call{" "}
                <a href={PHONE_HREF} className="font-bold text-teal">
                  {PHONE}
                </a>
                .
              </p>
            </div>
            <EnquiryForm
              title="Fill in the form below"
              intro="Tell us a little about your situation and we’ll direct your enquiry to the appropriate team member."
              submitLabel="Submit"
              formName="Request an inspection form"
            />
          </div>
        </div>
      </section>

      <TrustBadges variant="strip" />

      <Section>
        <SectionHeading eyebrow="What happens next" title="From enquiry to report" />
        <ol className="m-0 grid list-none gap-[18px] p-0 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex flex-col gap-3 rounded-[18px] border border-line bg-white p-6">
              <StepNumber n={i + 1} tone="teal" />
              <h3 className="text-[19px] font-bold leading-[1.3]">{step.title}</h3>
              <p className="text-[15px] text-body">{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>
    </>
  );
}
