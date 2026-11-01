import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { PHONE, PHONE_HREF } from "@/lib/constants";
import { CheckList, IconTile } from "@/components/site/primitives";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Blocks shared by the landlord, damp and mould, housing disrepair,
// EPC and thermographic pages.
// ─────────────────────────────────────────────────────────────

/** "or call 020 ..." link that sits beside a hero button. */
export function CallLink({ className }: { className?: string }) {
  return (
    <a
      href={PHONE_HREF}
      className={cn("whitespace-nowrap text-base font-bold text-ink no-underline hover:text-teal", className)}
    >
      or call {PHONE}
    </a>
  );
}

/** White card with a teal icon tile, a heading and a short description. */
export function FeatureCard({
  icon: Icon,
  title,
  children,
  className,
}: {
  icon?: LucideIcon;
  title: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 rounded-[18px] border border-line bg-white p-[26px]", className)}>
      {Icon && (
        <IconTile>
          <Icon className="h-6 w-6" strokeWidth={2} />
        </IconTile>
      )}
      <h3 className="text-[21px] font-bold leading-[1.25]">{title}</h3>
      {children}
    </div>
  );
}

/** Price panel used in heroes and beside service descriptions. */
export function PriceCard({
  label,
  price,
  note,
  items,
  action,
  footnote,
  className,
}: {
  label: React.ReactNode;
  price: React.ReactNode;
  note?: React.ReactNode;
  items?: React.ReactNode[];
  action?: React.ReactNode;
  footnote?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 rounded-[22px] bg-white p-6 shadow-card md:p-8", className)}>
      <span className="text-[13px] font-bold uppercase tracking-[0.06em] text-muted-ink">{label}</span>
      <span className="font-display text-[40px] font-extrabold leading-none md:text-[44px]">{price}</span>
      {note && <span className="text-[15px] text-body">{note}</span>}
      {items && <CheckList items={items} size="sm" className="gap-2 border-t border-line pt-4" />}
      {action}
      {footnote && <span className="text-[13px] text-muted-ink">{footnote}</span>}
    </div>
  );
}

export type BandPill = { icon: LucideIcon; label: string };

/** Navy call-to-action band: heading and text on the left, actions on the right, optional pills below. */
export function NavyBand({
  title,
  text,
  actions,
  pills,
}: {
  title: React.ReactNode;
  text?: React.ReactNode;
  actions: React.ReactNode;
  pills?: BandPill[];
}) {
  return (
    <section className="bg-navy text-white">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-7 px-gutter py-14 md:py-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div className="flex max-w-[700px] flex-col gap-2.5">
            <h2 className="text-[28px] font-extrabold leading-[1.12] md:text-[34px]">{title}</h2>
            {text && <p className="text-[17px] text-navy-soft">{text}</p>}
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-x-[18px] gap-y-3">{actions}</div>
        </div>
        {pills && (
          <ul className="m-0 flex list-none flex-wrap items-center gap-2.5 p-0">
            {pills.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-[#2E4166] bg-white/[0.08] px-3.5 py-2 text-sm font-bold"
              >
                <Icon aria-hidden="true" className="h-4 w-4 text-teal-tint" strokeWidth={2.2} />
                {label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/** Large phone number link used inside navy bands. */
export function BandPhone() {
  return (
    <a
      href={PHONE_HREF}
      className="whitespace-nowrap font-display text-2xl font-extrabold text-white no-underline hover:text-white"
    >
      {PHONE}
    </a>
  );
}

/** Pale teal note box with a bold heading. */
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
    <div className={cn("flex flex-col gap-1.5 rounded-2xl border border-teal-line bg-teal-tint px-6 py-[22px]", className)}>
      <b className="text-[17px]">{title}</b>
      <div className="text-[15px] text-body">{children}</div>
    </div>
  );
}

/**
 * Existing site photos are exported with their own rounded frame, so they are
 * shown at their natural aspect ratio rather than cropped into a box.
 */
export function FramedImage({
  src,
  alt,
  width,
  height,
  priority,
  className,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      sizes="(max-width: 1024px) 100vw, 45vw"
      className={cn("mx-auto h-auto w-full max-w-[560px]", className)}
    />
  );
}
