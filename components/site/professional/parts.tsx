import Image from "next/image";
import { Check, Quote, type LucideIcon } from "lucide-react";
import type { FAQItem } from "@/lib/faqs";
import { cn } from "@/lib/utils";
import { type FaqItem, IconTile, SmartLink } from "@/components/site/primitives";

// ─────────────────────────────────────────────────────────────
// Pieces shared by the legal, CPR 35, councils and stock condition pages.
// ─────────────────────────────────────────────────────────────

/** White rounded pills with a tick, shown under some hero intros. */
export function HeroPills({ items }: { items: string[] }) {
  return (
    <ul className="m-0 flex list-none flex-wrap items-center gap-2.5 p-0">
      {items.map((item) => (
        <li
          key={item}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2 text-sm font-bold text-ink"
        >
          <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-teal" strokeWidth={2.4} />
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * Rounded photo frame for the older site images, which have a decorative
 * border baked into the file. The image is scaled up inside the frame so only
 * the photo itself shows.
 */
export function FramedPhoto({
  src,
  alt,
  className,
  crop = 1.2,
  origin = "50% 50%",
  priority,
  sizes = "(max-width: 1024px) 100vw, 45vw",
}: {
  src: string;
  alt: string;
  className?: string;
  crop?: number;
  origin?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div className={cn("relative h-[300px] overflow-hidden rounded-[22px] bg-mist md:h-[440px]", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover"
        style={{ transform: `scale(${crop})`, transformOrigin: origin }}
      />
    </div>
  );
}

export type CardLink = { href: string; label: string };

/** White card: icon tile, display-font title, short text and an optional arrow link. */
export function FeatureCard({
  icon: Icon,
  title,
  text,
  link,
  as: Title = "h3",
}: {
  icon: LucideIcon;
  title: React.ReactNode;
  text: React.ReactNode;
  link?: CardLink;
  as?: "h3" | "b";
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[18px] border border-line bg-white p-[26px]">
      <IconTile>
        <Icon className="h-6 w-6" strokeWidth={2} />
      </IconTile>
      <Title className="font-display text-[21px] font-bold leading-[1.25]">{title}</Title>
      <p className="text-[15px] text-body">{text}</p>
      {link && (
        <div className="mt-auto pt-1.5">
          <SmartLink href={link.href} className="text-[15px] font-bold text-teal no-underline hover:text-teal-dark">
            {link.label}
          </SmartLink>
        </div>
      )}
    </div>
  );
}

/** Teal-tinted note box with a bold title. */
export function TintNote({
  title,
  children,
  className,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 rounded-2xl border border-teal-line bg-teal-tint px-6 py-[22px]",
        className,
      )}
    >
      <b className="text-[17px] text-ink">{title}</b>
      <div className="text-[15px] text-body">{children}</div>
    </div>
  );
}

/** Single quoted testimonial card. */
export function Testimonial({
  quote,
  name,
  role,
  className,
}: {
  quote: string;
  name: string;
  role: string;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "m-0 flex max-w-[980px] flex-col gap-[18px] rounded-[20px] border border-line bg-white p-6 md:p-9",
        className,
      )}
    >
      <Quote aria-hidden="true" className="h-8 w-8 fill-teal-tint text-teal" strokeWidth={1.8} />
      <blockquote className="m-0 text-[17px] leading-[1.6] text-ink md:text-lg">“{quote}”</blockquote>
      <figcaption className="text-[15px] text-muted-ink">
        <b className="text-ink">{name}</b> · {role}
      </figcaption>
    </figure>
  );
}

/** Full-width navy band with a heading on the left and actions on the right. */
export function NavyBand({
  title,
  text,
  kicker,
  actions,
}: {
  title: React.ReactNode;
  text?: React.ReactNode;
  kicker?: React.ReactNode;
  actions: React.ReactNode;
}) {
  return (
    <section className="bg-navy text-white">
      <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-x-12 gap-y-7 px-gutter py-14 md:py-16">
        <div className="flex max-w-[700px] flex-col gap-2.5">
          <h2 className="text-[28px] font-extrabold leading-[1.12] md:text-[34px]">{title}</h2>
          {text && <p className="text-[17px] text-navy-soft">{text}</p>}
          {kicker && <p className="text-sm font-bold tracking-[0.04em] text-[#7FD8C8]">{kicker}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-x-[18px] gap-y-3">{actions}</div>
      </div>
    </section>
  );
}

/** A question with a plain-text answer (used for FAQPage structured data) and optional rich content for the page. */
export type PageFaq = FAQItem & { content?: React.ReactNode };

export function toFaqList(items: PageFaq[]): FaqItem[] {
  return items.map((item) => ({ q: item.question, a: <p>{item.content ?? item.answer}</p> }));
}

export function toFaqSchema(items: PageFaq[]): FAQItem[] {
  return items.map(({ question, answer }) => ({ question, answer }));
}

/** Accreditation tile: a logo or icon above a short label. */
export function BadgeTile({
  label,
  logo,
  icon: Icon,
}: {
  label: string;
  logo?: { src: string; alt: string; width: number; height: number; className?: string };
  icon?: LucideIcon;
}) {
  return (
    <div className="flex min-h-[140px] flex-col items-center justify-center gap-2.5 rounded-[18px] border border-line bg-white p-[22px] text-center">
      {logo ? (
        <Image
          src={logo.src}
          alt={logo.alt}
          width={logo.width}
          height={logo.height}
          className={cn("h-12 w-auto", logo.className)}
        />
      ) : (
        Icon && (
          <IconTile>
            <Icon className="h-6 w-6" strokeWidth={2} />
          </IconTile>
        )
      )}
      <b className="text-[15px] leading-[1.3]">{label}</b>
    </div>
  );
}
