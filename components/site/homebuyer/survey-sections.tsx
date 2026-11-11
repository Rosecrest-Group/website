import Link from "next/link";
import { ArrowLeft, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Breadcrumbs,
  ButtonLink,
  Eyebrow,
  FaqList,
  Section,
  SectionHeading,
  TextLink,
  type FaqItem,
} from "@/components/site/primitives";
import TrustBadges from "@/components/site/TrustBadges";
import SurveyBookingForm from "@/components/site/homebuyer/SurveyBookingForm";
import type { SurveyLevel } from "@/components/site/homebuyer/pricing";

// Shared building blocks for the RICS Level 1, 2 and 3 survey pages.

export type Rating = 1 | 2 | 3;

const RATING_BG: Record<Rating, string> = {
  1: "bg-[#2E9E6A]",
  2: "bg-[#E0A100]",
  3: "bg-[#D64545]",
};

/** Accreditation logos in the order the survey pages show them. */
export function SurveyTrustStrip() {
  return (
    <TrustBadges variant="strip" badges={["ipws", "cabe", "rpsa", "rics", "constructionline", "safecontractor"]} />
  );
}

/** Teal tick (or amber cross) list item used across the survey pages. */
export function Tick({
  children,
  bad = false,
  className,
}: {
  children: React.ReactNode;
  bad?: boolean;
  className?: string;
}) {
  const Icon = bad ? X : Check;
  return (
    <li className={cn("flex items-start gap-2.5", className)}>
      <Icon
        aria-hidden="true"
        className={cn("mt-[3px] h-[18px] w-[18px] shrink-0", bad ? "text-[#B45309]" : "text-teal")}
        strokeWidth={2.4}
      />
      <span>{children}</span>
    </li>
  );
}

/** Hero for a single survey level: back link, pills, eyebrow, H1, lede and key facts. */
export function SurveyHero({
  crumb,
  pills,
  eyebrow,
  title,
  lede,
  sublede,
  facts,
  aside,
}: {
  crumb: string;
  pills: string[];
  eyebrow: string;
  title: string;
  lede: string;
  sublede: string;
  facts: string[];
  /** Optional card beside the hero copy (e.g. an instant price), stacked below it on mobile. */
  aside?: React.ReactNode;
}) {
  return (
    <section className="bg-mist text-ink">
      <div className="mx-auto w-full max-w-[1440px] px-gutter pb-16 pt-4 md:pb-20">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "RICS surveys", href: "/homebuyer" }, { label: crumb }]} />
        <div
          className={cn(
            "mt-10 flex flex-col gap-5 md:mt-14",
            // With a card beside it, the copy splits around the card so phones see the card
            // straight after the opening paragraph, and desktops show it in its own column.
            aside &&
              "lg:grid lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:items-start lg:gap-x-14 lg:gap-y-5",
          )}
        >
          <div className="flex max-w-[860px] flex-col gap-5 lg:col-start-1">
            <Link
              href="/homebuyer#levels"
              className="inline-flex items-center gap-2 self-start text-[15px] font-bold text-teal no-underline hover:text-teal-dark"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />
              Back to survey selection
            </Link>
            <div className="flex flex-wrap gap-2.5">
              {pills.map((pill) => (
                <span key={pill} className="rounded-full border border-line bg-white px-3 py-1.5 text-[13px] font-bold">
                  {pill}
                </span>
              ))}
            </div>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h1 className="text-[38px] font-extrabold leading-[1.04] md:text-[54px]">{title}</h1>
            <p className="max-w-[640px] text-xl text-body">{lede}</p>
          </div>
          {aside && <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">{aside}</div>}
          <div className="flex max-w-[860px] flex-col gap-5 lg:col-start-1">
            <p className="max-w-[640px] text-[17px] text-body">{sublede}</p>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-base text-body">
              {facts.map((fact) => (
                <Tick key={fact}>{fact}</Tick>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-3.5">
              <ButtonLink href="#price">Check Availability &amp; Get a Fixed Price</ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** "Sample report extract" card with traffic-light rated elements. */
export function SampleExtract({
  caption,
  rows,
}: {
  caption: string;
  rows: { rating: Rating; title: string; text: string }[];
}) {
  return (
    <div
      id="sample"
      className="scroll-mt-24 rounded-[20px] border border-line bg-white p-5 shadow-[0_24px_50px_-34px_rgba(15,30,56,0.4)] sm:p-[26px]"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 pb-3">
        <b className="text-base">Sample report extract</b>
        <span className="text-[13px] text-muted-ink">{caption}</span>
      </div>
      <ul className="m-0 list-none p-0">
        {rows.map((row) => (
          <li key={row.title} className="flex items-start gap-3.5 border-t border-line py-3.5">
            <span
              aria-hidden="true"
              className={cn(
                "flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg font-extrabold text-white",
                RATING_BG[row.rating],
              )}
            >
              {row.rating}
            </span>
            <span className="flex flex-col">
              <b className="text-[15px]">
                <span className="sr-only">Condition rating {row.rating}: </span>
                {row.title}
              </b>
              <span className="text-sm text-body">{row.text}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** "When will I receive my report?" with fact cards on the right. */
export function TurnaroundSection({
  tone,
  paragraphs,
  facts,
}: {
  tone: "white" | "mist";
  paragraphs: string[];
  facts: { label: string; value: string }[];
}) {
  return (
    <Section tone={tone}>
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-16">
        <div className="flex flex-col gap-4">
          <Eyebrow>Turnaround</Eyebrow>
          <h2 className="text-[30px] font-extrabold leading-[1.08] md:text-[40px]">When will I receive my report?</h2>
          {paragraphs.map((p) => (
            <p key={p} className="text-lg text-body">
              {p}
            </p>
          ))}
          <TextLink href="#callback" className="self-start underline">
            Contact us today for a personalised quote.
          </TextLink>
        </div>
        <div className="grid gap-3.5">
          {facts.map((fact) => (
            <div key={fact.label} className="flex flex-col gap-0.5 rounded-[18px] border border-line bg-white px-6 py-5">
              <span className="text-[13px] font-bold uppercase tracking-[0.06em] text-muted-ink">{fact.label}</span>
              <b className="font-display text-2xl">{fact.value}</b>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

const RATINGS: { rating: Rating; title: string; text: string }[] = [
  { rating: 1, title: "Level 1: Green", text: "No action required." },
  { rating: 2, title: "Level 2: Amber", text: "Defects requiring attention and repair that are not urgent." },
  { rating: 3, title: "Level 3: Red", text: "Serious defects requiring urgent attention and repair." },
];

/** "The traffic light system for the condition rating". */
export function ConditionRatingsSection({ tone }: { tone: "white" | "mist" }) {
  return (
    <Section tone={tone}>
      <SectionHeading eyebrow="Condition ratings" title="The traffic light system for the condition rating" />
      <div className="grid gap-[18px] md:grid-cols-3">
        {RATINGS.map((r) => (
          <div key={r.rating} className="flex flex-col gap-2.5 rounded-[18px] border border-line bg-white p-6">
            <span
              aria-hidden="true"
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl text-xl font-extrabold text-white",
                RATING_BG[r.rating],
              )}
            >
              {r.rating}
            </span>
            <h3 className="font-body text-[19px] font-bold tracking-normal">{r.title}</h3>
            <p className="text-[15px] text-body">{r.text}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/** White card listing the key features; `bad` items get an amber cross. */
export function KeyFeaturesCard({ items }: { items: { text: string; bad?: boolean }[] }) {
  return (
    <div className="rounded-[18px] border border-line bg-white p-6 sm:p-[30px]">
      <ul className="m-0 flex list-none flex-col gap-3.5 p-0 text-[17px] text-body">
        {items.map((item) => (
          <Tick key={item.text} bad={item.bad}>
            {item.text}
          </Tick>
        ))}
      </ul>
    </div>
  );
}

/** "Check Availability & Get a Fixed Price" section with the booking form, anchored at #price. */
export function PriceSection({ level }: { level: SurveyLevel }) {
  return (
    <Section id="price">
      <SectionHeading
        eyebrow="Fixed price"
        title={<>Check Availability &amp; Get a Fixed Price</>}
        intro="Provide a few details and we’ll instantly show your survey price. Takes less than 60 seconds."
      />
      <SurveyBookingForm level={level} />
    </Section>
  );
}

export function SurveyFaqSection({ title, items }: { title: string; items: FaqItem[] }) {
  return (
    <Section tone="mist">
      <SectionHeading eyebrow="Questions" title={title} />
      <FaqList items={items} />
    </Section>
  );
}

/** "Looking for a different survey?" cards at the foot of each level page. */
export function OtherSurveys({ cards }: { cards: { title: string; text: string; href: string; cta: string }[] }) {
  return (
    <Section>
      <Eyebrow>Looking for a different survey?</Eyebrow>
      <div className="grid gap-[18px] md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.href} className="flex flex-col gap-3 rounded-[18px] border border-line bg-white p-[26px]">
            <h3 className="text-[21px] font-bold leading-[1.25]">{card.title}</h3>
            <p className="text-[15px] text-body">{card.text}</p>
            <TextLink href={card.href} className="mt-auto text-[15px]">
              {card.cta}
            </TextLink>
          </div>
        ))}
      </div>
    </Section>
  );
}

/** FAQs shared by the three survey pages, so the wording stays identical. */
export const SURVEY_FAQ = {
  howLong: {
    q: "How long does a survey take?",
    a: "The duration of the survey depends on the size of the property. A Level 1 typically takes 1–2 hours and a Level 3 typically 2–3 hours. Larger or more complex properties take longer.",
  },
  whenReport: {
    q: "When will I receive my report?",
    a: "As standard, a Level 1 report is delivered within 2 working days, a Level 2 within 3–5 working days and a Level 3 within 5–7 working days of the inspection. Need it sooner? Choose the Express 48-Hour Report option when you check availability and get your fixed price.",
  },
  photos: {
    q: "Will I receive photographs in my report?",
    a: "Yes. Your report includes photographs of the defects identified during the inspection, with the surveyor’s explanation of each one.",
  },
  vacant: {
    q: "Can you survey vacant or tenanted properties?",
    a: "Yes. We arrange access with the estate agent, seller or managing agent.",
  },
  bedrooms: {
    q: "Why do you need the number of bedrooms?",
    a: "Your price is based on the property type and size. Choose the bedrooms and you’ll see your exact price before you book.",
  },
  level2vs3: {
    q: "What is the difference between a Level 2 and a Level 3 survey?",
    a: "A Level 2 (Homebuyer Survey) suits modern and conventional properties, with condition ratings showing the urgency of any defects. A Level 3 (Building Survey) suits older, altered or non-standard buildings and provides a more detailed assessment of the building’s construction, condition and defects, including more extensive advice on repairs and maintenance and repair cost estimates where applicable. Both Level 2 and Level 3 surveys are generally visual and non-invasive. Surveyors inspect accessible areas without opening up the building or carrying out destructive investigations.",
  },
  advise: {
    q: "Can the surveyor tell me whether to buy the property?",
    a: "No. Our surveyors cannot advise whether to proceed with or withdraw from the purchase. As section 8 of our Terms of Engagement puts it: “The report is intended to assist decision-making only. The decision to proceed, renegotiate, or withdraw from a purchase is the Client’s responsibility.”",
  },
} satisfies Record<string, { q: string; a: string }>;

/** FaqList items from plain strings (answers wrapped in a paragraph). */
export function faqItems(list: { q: string; a: React.ReactNode }[]): FaqItem[] {
  return list.map(({ q, a }) => ({ q, a: typeof a === "string" ? <p>{a}</p> : a }));
}
