import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { Fragment, type AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import HeroTopBar from "@/components/site/HeroTopBar";

// ─────────────────────────────────────────────────────────────
// Building blocks for the marketing site. Every page is a stack of
// <Section>s; the rest of this file is the vocabulary used inside them.
// ─────────────────────────────────────────────────────────────

type Tone = "white" | "mist" | "tint" | "navy";

const TONE_CLASS: Record<Tone, string> = {
  white: "bg-white text-ink",
  mist: "bg-mist text-ink",
  tint: "bg-teal-tint text-ink",
  navy: "bg-navy text-white",
};

/** Full-bleed band with the site gutter and a 1440px content cap. */
export function Section({
  tone = "white",
  id,
  className,
  innerClassName,
  children,
}: {
  tone?: Tone;
  id?: string;
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn(TONE_CLASS[tone], "scroll-mt-24 py-14 md:py-20", className)}>
      <div className={cn("mx-auto flex w-full max-w-[1440px] flex-col gap-9 px-gutter", innerClassName)}>
        {children}
      </div>
    </section>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("text-[13px] font-bold uppercase tracking-[0.08em] text-teal", className)}>
      {children}
    </span>
  );
}

/** Eyebrow, heading and intro paragraph at the top of a section. */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  as: Heading = "h2",
  align = "left",
  size = "md",
  className,
  children,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  intro?: React.ReactNode;
  as?: "h1" | "h2";
  align?: "left" | "center";
  size?: "md" | "lg";
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex max-w-[820px] flex-col gap-3",
        align === "center" && "mx-auto items-center text-center",
        className,
      )}
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <Heading
        className={cn(
          "font-extrabold leading-[1.08]",
          size === "lg" ? "text-[34px] leading-[1.04] md:text-[52px]" : "text-[30px] md:text-[40px]",
        )}
      >
        {title}
      </Heading>
      {intro && <p className="text-lg text-body">{intro}</p>}
      {children}
    </div>
  );
}

type ButtonVariant = "primary" | "light" | "outline" | "navy";

const BUTTON_VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-teal text-white hover:bg-teal-dark hover:text-white",
  light: "bg-white text-ink hover:bg-mist hover:text-ink",
  outline: "border border-line bg-white text-ink hover:border-line-strong hover:text-ink",
  navy: "bg-navy text-white hover:bg-navy-deep hover:text-white",
};

const BUTTON_SIZE = {
  sm: "px-[18px] py-3 text-[15px]",
  md: "px-[22px] py-[15px] text-base",
  lg: "px-7 py-4 text-[17px]",
};

export function buttonClass(variant: ButtonVariant = "primary", size: keyof typeof BUTTON_SIZE = "md") {
  return cn(
    "inline-flex min-h-11 items-center justify-center gap-2.5 whitespace-nowrap rounded-xl font-bold no-underline transition-colors",
    BUTTON_VARIANT[variant],
    BUTTON_SIZE[size],
  );
}

/** Internal routes use next/link; tel:, mailto:, #hash and external links use a plain anchor. */
export function SmartLink({
  href,
  className,
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const isPlain = /^(tel:|mailto:|https?:|#)/.test(href) || href.endsWith(".pdf");
  if (isPlain) {
    return (
      <a href={href} className={className} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} {...rest}>
      {children}
    </Link>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: ButtonVariant;
  size?: keyof typeof BUTTON_SIZE;
}) {
  return (
    <SmartLink href={href} className={cn(buttonClass(variant, size), className)} {...rest}>
      {children}
    </SmartLink>
  );
}

/** Teal bold text link, the design's default inline link. */
export function TextLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <SmartLink href={href} className={cn("font-bold text-teal no-underline hover:text-teal-dark", className)}>
      {children}
    </SmartLink>
  );
}

export function Card({
  className,
  children,
  as: Tag = "div",
}: {
  className?: string;
  children: React.ReactNode;
  as?: "div" | "article" | "li";
}) {
  return (
    <Tag className={cn("flex flex-col gap-3 rounded-[18px] border border-line bg-white p-[26px]", className)}>
      {children}
    </Tag>
  );
}

/** A whole card that links somewhere, with an arrow call to action at the bottom. */
export function LinkCard({
  href,
  title,
  children,
  cta,
  className,
}: {
  href: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  cta?: React.ReactNode;
  className?: string;
}) {
  return (
    <SmartLink
      href={href}
      className={cn(
        "group flex flex-col gap-2.5 rounded-[18px] border border-line bg-white p-6 text-ink no-underline transition-colors hover:border-teal hover:text-ink",
        className,
      )}
    >
      <h3 className="text-[19px] font-bold leading-[1.25]">{title}</h3>
      {children && <div className="text-[15px] text-body">{children}</div>}
      {cta && (
        <span className="mt-auto flex items-center gap-2 pt-1 text-[15px] font-bold text-teal group-hover:text-teal-dark">
          {cta}
        </span>
      )}
    </SmartLink>
  );
}

/** 48px rounded tile holding a teal stroke icon. */
export function IconTile({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-tint text-teal", className)}
    >
      {children}
    </span>
  );
}

export function CheckItem({
  children,
  className,
  size = "md",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <li
      className={cn(
        "flex items-start gap-2.5",
        size === "sm" && "text-[15px]",
        size === "md" && "text-base",
        size === "lg" && "text-[17px]",
        className,
      )}
    >
      <Check aria-hidden="true" className="mt-[3px] h-[18px] w-[18px] shrink-0 text-teal" strokeWidth={2.4} />
      <span>{children}</span>
    </li>
  );
}

export function CheckList({
  items,
  className,
  size,
}: {
  items: React.ReactNode[];
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <ul className={cn("m-0 flex list-none flex-col gap-2.5 p-0 text-body", className)}>
      {items.map((item, i) => (
        <CheckItem key={i} size={size}>
          {item}
        </CheckItem>
      ))}
    </ul>
  );
}

/** Small rounded label, e.g. "From £450" or "5 working days". */
export function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex rounded-full bg-mist px-3 py-1.5 text-sm text-ink", className)}>{children}</span>
  );
}

/** Numbered circle used for process steps. */
export function StepNumber({ n, tone = "navy" }: { n: React.ReactNode; tone?: "navy" | "teal" }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-extrabold text-white",
        tone === "navy" ? "bg-navy" : "bg-teal",
      )}
    >
      {n}
    </span>
  );
}

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({
  items,
  className,
  compact = false,
}: {
  items: Crumb[];
  className?: string;
  /** On phones, show only a "← parent" link when the trail is three or more deep. */
  compact?: boolean;
}) {
  const parentIndex = compact && items.length > 2 ? items.length - 2 : -1;
  return (
    <nav aria-label="Breadcrumb" className={cn("flex flex-wrap items-center gap-2.5 text-sm", className)}>
      {items.map((item, i) => {
        const isParent = i === parentIndex;
        const hideOnPhone = parentIndex >= 0 && !isParent;
        return (
          <Fragment key={i}>
            {i > 0 && (
              <span aria-hidden="true" className={cn("text-line-strong", parentIndex >= 0 && "hidden md:inline")}>
                /
              </span>
            )}
            {item.href ? (
              <Link
                href={item.href}
                className={cn(
                  "text-muted-ink no-underline hover:text-ink",
                  hideOnPhone && "hidden md:inline",
                  isParent && "font-bold text-teal md:font-normal md:text-muted-ink",
                )}
              >
                {isParent && (
                  <span aria-hidden="true" className="md:hidden">
                    ←{" "}
                  </span>
                )}
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className={cn("font-semibold text-ink", hideOnPhone && "hidden md:inline")}>
                {item.label}
              </span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}

/**
 * Inner-page hero on the mist background: breadcrumbs, eyebrow, H1, lede,
 * actions, and an optional photo or panel on the right.
 */
export function PageHero({
  breadcrumbs,
  eyebrow,
  title,
  intro,
  actions,
  media,
  children,
  className,
}: {
  breadcrumbs?: Crumb[];
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  intro?: React.ReactNode;
  actions?: React.ReactNode;
  media?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("bg-mist text-ink", className)}>
      <div className="mx-auto w-full max-w-[1440px] px-gutter pb-16 md:pb-20">
        {breadcrumbs ? <HeroTopBar items={breadcrumbs} /> : <div className="pt-4" />}
        <div
          className={cn(
            "mt-7 grid items-center gap-10 md:mt-9 lg:gap-16",
            media && "lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]",
          )}
        >
          <div className="flex flex-col gap-5">
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            <h1 className="text-[38px] font-extrabold leading-[1.04] md:text-[54px]">{title}</h1>
            {intro && <div className="flex max-w-[640px] flex-col gap-4 text-xl text-body">{intro}</div>}
            {children}
            {actions && <div className="flex flex-wrap items-center gap-3.5">{actions}</div>}
          </div>
          {media && <div>{media}</div>}
        </div>
      </div>
    </section>
  );
}

/** Rounded photo that fills a fixed-height frame. */
export function Photo({
  src,
  alt,
  className,
  priority,
  sizes = "(max-width: 1024px) 100vw, 50vw",
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div className={cn("relative h-[300px] overflow-hidden rounded-[22px] bg-mist md:h-[440px]", className)}>
      <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" />
    </div>
  );
}

export type FaqItem = { q: React.ReactNode; a: React.ReactNode };

/** Two-column question and answer list (all answers visible). */
export function FaqList({ items, className }: { items: FaqItem[]; className?: string }) {
  return (
    <div className={cn("grid md:grid-cols-2 md:gap-x-14", className)}>
      {items.map((item, i) => (
        <div key={i} className="flex flex-col gap-2 border-t border-line py-[22px]">
          <h3 className="text-lg font-bold leading-[1.35]">{item.q}</h3>
          <div className="rc-prose flex flex-col gap-2 text-base text-body">{item.a}</div>
        </div>
      ))}
    </div>
  );
}

/** "Related services: A · B · C" line under a section. */
export function RelatedLinks({
  label = "Related services:",
  links,
  className,
}: {
  label?: string;
  links: { label: string; href: string }[];
  className?: string;
}) {
  return (
    <p className={cn("border-t border-line pt-[22px] text-base text-body", className)}>
      <b className="text-ink">{label}</b>{" "}
      {links.map((link, i) => (
        <Fragment key={link.href}>
          {i > 0 && (
            <span aria-hidden="true" className="text-line-strong">
              {" · "}
            </span>
          )}
          <TextLink href={link.href}>{link.label}</TextLink>
        </Fragment>
      ))}
    </p>
  );
}

/** White panel with a heading on the left and one action on the right. */
export function CtaPanel({
  title,
  text,
  action,
  className,
}: {
  title: React.ReactNode;
  text?: React.ReactNode;
  action: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-12 gap-y-6 rounded-[22px] border border-line bg-white p-7 md:p-12",
        className,
      )}
    >
      <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-2.5">
        <h2 className="text-[28px] font-extrabold leading-[1.1] md:text-[38px]">{title}</h2>
        {text && <p className="text-lg text-body">{text}</p>}
      </div>
      {action}
    </div>
  );
}

/** Navy panel: "Not sure which option applies to you?" and similar prompts. */
export function NavyPanel({
  title,
  text,
  actions,
  className,
}: {
  title: React.ReactNode;
  text?: React.ReactNode;
  actions: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-8 gap-y-[18px] rounded-[18px] bg-navy px-6 py-7 text-white md:px-8",
        className,
      )}
    >
      <div className="flex flex-[1_1_420px] flex-col gap-1.5">
        <h3 className="text-2xl font-bold leading-[1.2]">{title}</h3>
        {text && <p className="text-base text-navy-soft">{text}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-x-[22px] gap-y-3">{actions}</div>
    </div>
  );
}

/** Thin centred strip, e.g. "Looking for a different service? View all property services". */
export function NoteStrip({ children }: { children: React.ReactNode }) {
  return (
    <section className="border-t border-line bg-mist">
      <div className="mx-auto w-full max-w-[1440px] px-gutter py-9 text-center text-lg text-body">{children}</div>
    </section>
  );
}

/** A compact table drawn with CSS grid rows, used for prices and comparisons. */
export function DataTable({
  caption,
  columns,
  rows,
  className,
}: {
  caption?: string;
  columns: React.ReactNode[];
  rows: React.ReactNode[][];
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto rounded-[18px] border border-line bg-white", className)}>
      <table className="w-full min-w-[560px] border-collapse text-left text-[15px]">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="bg-mist">
            {columns.map((col, i) => (
              <th key={i} scope="col" className="px-5 py-3.5 font-bold text-ink">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r} className={r % 2 === 1 ? "bg-mist-soft" : "bg-white"}>
              {row.map((cell, c) =>
                c === 0 ? (
                  <th key={c} scope="row" className="border-t border-line px-5 py-3.5 font-bold text-ink">
                    {cell}
                  </th>
                ) : (
                  <td key={c} className="border-t border-line px-5 py-3.5 text-body">
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
