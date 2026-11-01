import Image from "next/image";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export type BadgeKey = "rics" | "constructionline" | "safecontractor" | "ipws" | "cabe" | "rpsa";

// `width`/`height` are the SVG's own proportions; `display` is the on-screen height at desktop.
// SafeContractor is a long wordmark, so it sits shorter (36px, as in the design) to keep the row balanced.
const BADGES: Record<BadgeKey, { src: string; alt: string; width: number; height: number; display: number }> = {
  rics: { src: "/assets/brands/rics.svg", alt: "Regulated by RICS", width: 87, height: 34, display: 48 },
  constructionline: {
    src: "/assets/brands/constructionline.svg",
    alt: "Constructionline Gold Member",
    width: 83,
    height: 44,
    display: 48,
  },
  safecontractor: {
    src: "/assets/brands/safecontractor.svg",
    alt: "Alcumus SafeContractor",
    width: 200,
    height: 32,
    display: 36,
  },
  ipws: { src: "/assets/brands/ipws.svg", alt: "Institute of Party Wall Surveyors", width: 100, height: 33, display: 48 },
  cabe: { src: "/assets/brands/cabe.svg", alt: "CABE", width: 100, height: 54, display: 48 },
  rpsa: {
    src: "/assets/brands/rpsa.svg",
    alt: "Residential Property Surveyors Association",
    width: 100,
    height: 56,
    display: 48,
  },
};

const DEFAULT_ORDER: BadgeKey[] = ["rics", "constructionline", "safecontractor", "ipws", "cabe", "rpsa"];

/** Row of accreditation logos. `strip` is the bordered band used under inner-page heroes. */
export default function TrustBadges({
  badges = DEFAULT_ORDER,
  variant = "row",
  className,
}: {
  badges?: BadgeKey[];
  variant?: "row" | "strip";
  className?: string;
}) {
  // Each logo's box starts at its display width and may shrink. From lg up the row never wraps,
  // so if space is tight every logo scales down by the same proportion instead of one dropping a line.
  const row = (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-8 gap-y-6 md:justify-between lg:flex-nowrap",
        className,
      )}
    >
      {badges.map((key) => {
        const badge = BADGES[key];
        const displayWidth = Math.round((badge.display * badge.width) / badge.height);
        return (
          <div
            key={key}
            style={{ "--logo-w": `${displayWidth}px` } as CSSProperties}
            className="min-w-0 flex-[0_1_calc(var(--logo-w)*0.75)] md:flex-[0_1_var(--logo-w)]"
          >
            <Image src={badge.src} alt={badge.alt} width={badge.width} height={badge.height} className="h-auto w-full" />
          </div>
        );
      })}
    </div>
  );

  if (variant === "row") return row;

  return (
    <section className="border-b border-line bg-white">
      <div className="mx-auto w-full max-w-[1440px] px-gutter py-10">{row}</div>
    </section>
  );
}
