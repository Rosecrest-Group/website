import Image from "next/image";
import { cn } from "@/lib/utils";

export type BadgeKey = "rics" | "constructionline" | "safecontractor" | "ipws" | "cabe" | "rpsa";

const BADGES: Record<BadgeKey, { src: string; alt: string; width: number; height: number }> = {
  rics: { src: "/assets/brands/rics.svg", alt: "Regulated by RICS", width: 87, height: 34 },
  constructionline: {
    src: "/assets/brands/constructionline.svg",
    alt: "Constructionline Gold Member",
    width: 83,
    height: 44,
  },
  safecontractor: { src: "/assets/brands/safecontractor.svg", alt: "Alcumus SafeContractor", width: 200, height: 32 },
  ipws: { src: "/assets/brands/ipws.svg", alt: "Institute of Party Wall Surveyors", width: 100, height: 33 },
  cabe: { src: "/assets/brands/cabe.svg", alt: "CABE", width: 100, height: 54 },
  rpsa: { src: "/assets/brands/rpsa.svg", alt: "Residential Property Surveyors Association", width: 100, height: 56 },
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
  const row = (
    <div className={cn("flex flex-wrap items-center justify-center gap-x-8 gap-y-6 md:justify-between", className)}>
      {badges.map((key) => {
        const badge = BADGES[key];
        return (
          <Image
            key={key}
            src={badge.src}
            alt={badge.alt}
            width={badge.width}
            height={badge.height}
            className="h-9 w-auto md:h-12"
          />
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
