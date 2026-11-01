import Image from "next/image";
import { Fragment } from "react";
import JsonLd from "@/components/common/JsonLd";
import CallbackSection from "@/components/site/CallbackSection";
import {
  ButtonLink,
  Card,
  CtaPanel,
  Eyebrow,
  FaqList,
  PageHero,
  RelatedLinks,
  Section,
  SectionHeading,
  TextLink,
} from "@/components/site/primitives";
import { buildFAQPage } from "@/lib/schema";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Shared template for the trade service pages (plastering, plumbing,
// tiling, carpentry, painting and decorating, handyman, deep cleaning,
// carpet cleaning, house clearance). Each route passes a TradeContent.
// ─────────────────────────────────────────────────────────────

/** A run of copy: plain text, or text with inline links. */
export type TradeInline = string | { label: string; href: string };
export type TradeRich = string | TradeInline[];

export type TradePhoto = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /**
   * The older hero images (e.g. plastering/hero.png) have a decorative card
   * frame baked into the PNG. `framed` crops that frame away.
   */
  framed?: boolean;
};

export type TradeContent = {
  /** Breadcrumb label, e.g. "Plastering". */
  name: string;
  /** Attribution label for call-back leads from this page. */
  formName: string;
  hero: {
    eyebrow: string;
    title: string;
    /** First paragraph is the 20px lede; any further paragraphs are 17px. */
    intro: string[];
    action?: string;
    photo: TradePhoto;
  };
  services: {
    eyebrow: string;
    title: string;
    intro?: string;
    columns: 2 | 3;
    items: { title: string; body: TradeRich; note?: TradeRich }[];
    /** Teal tint strip under the grid. */
    note?: TradeRich;
  };
  why: {
    eyebrow?: string;
    title?: string;
    lead: string;
    body: string;
    photo: TradePhoto;
  };
  cta: { title: string; text: string; action?: string };
  faq: {
    eyebrow?: string;
    title: string;
    items: { q: string; a: TradeRich }[];
    related: { label: string; href: string }[];
  };
};

function Rich({ value }: { value: TradeRich }) {
  if (typeof value === "string") return <>{value}</>;
  return (
    <>
      {value.map((part, i) =>
        typeof part === "string" ? (
          <Fragment key={i}>{part}</Fragment>
        ) : (
          <TextLink key={i} href={part.href}>
            {part.label}
          </TextLink>
        ),
      )}
    </>
  );
}

function richText(value: TradeRich) {
  if (typeof value === "string") return value;
  return value.map((part) => (typeof part === "string" ? part : part.label)).join("");
}

function TradePhotoFrame({ photo, priority }: { photo: TradePhoto; priority?: boolean }) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-[22px] bg-mist",
        photo.framed && "aspect-[12/11] lg:max-h-[520px]",
      )}
      style={photo.framed ? undefined : { aspectRatio: `${photo.width} / ${photo.height}` }}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        priority={priority}
        sizes="(max-width: 1024px) 100vw, 45vw"
        className={cn("object-cover", photo.framed && "scale-[1.12]")}
      />
    </div>
  );
}

export default function TradePage({ content }: { content: TradeContent }) {
  const { hero, services, why, cta, faq } = content;

  return (
    <>
      <JsonLd
        id="faq"
        data={buildFAQPage(faq.items.map((item) => ({ question: item.q, answer: richText(item.a) })))}
      />

      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: content.name }]}
        eyebrow={hero.eyebrow}
        title={hero.title}
        intro={hero.intro.map((p, i) => (
          <p key={i} className={i > 0 ? "text-[17px]" : undefined}>
            {p}
          </p>
        ))}
        actions={<ButtonLink href="#callback">{hero.action ?? "Make an enquiry"}</ButtonLink>}
        media={<TradePhotoFrame photo={hero.photo} priority />}
      />

      <Section tone="mist">
        <SectionHeading eyebrow={services.eyebrow} title={services.title} intro={services.intro} />
        <div className={cn("grid gap-[18px] md:grid-cols-2", services.columns === 3 && "lg:grid-cols-3")}>
          {services.items.map((item) => (
            <Card key={item.title}>
              <h3 className="text-[21px] font-bold leading-[1.25]">{item.title}</h3>
              <p className="text-base text-body">
                <Rich value={item.body} />
              </p>
              {item.note && (
                <p className="mt-auto text-[15px] text-body">
                  <Rich value={item.note} />
                </p>
              )}
            </Card>
          ))}
        </div>
        {services.note && (
          <div className="flex flex-col gap-1.5 rounded-2xl border border-teal-line bg-teal-tint px-6 py-[22px]">
            <span className="text-[17px] text-ink">
              <Rich value={services.note} />
            </span>
          </div>
        )}
      </Section>

      <Section tone="white">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
          <div className="flex flex-col gap-4">
            <Eyebrow>{why.eyebrow ?? "Why choose us"}</Eyebrow>
            <h2 className="text-[30px] font-extrabold leading-[1.1] md:text-[38px]">
              {why.title ?? "Why Choose Rosecrest Group Ltd?"}
            </h2>
            <p className="text-[19px] font-semibold text-ink">{why.lead}</p>
            <p className="text-[17px] text-body">{why.body}</p>
          </div>
          <TradePhotoFrame photo={why.photo} />
        </div>
      </Section>

      <Section tone="mist">
        <CtaPanel
          title={cta.title}
          text={cta.text}
          action={<ButtonLink href="#callback">{cta.action ?? "Get started now"}</ButtonLink>}
        />
      </Section>

      <Section tone="white">
        <SectionHeading eyebrow={faq.eyebrow ?? "Questions"} title={faq.title} />
        <FaqList
          items={faq.items.map((item) => ({
            q: item.q,
            a: (
              <p>
                <Rich value={item.a} />
              </p>
            ),
          }))}
        />
        <RelatedLinks links={faq.related} />
      </Section>

      <CallbackSection formName={content.formName} defaultNeeds={["Trade services and repairs"]} />
    </>
  );
}
