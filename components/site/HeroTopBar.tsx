"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Breadcrumbs, type Crumb } from "@/components/site/primitives";
import { LANE_LINKS } from "@/lib/site-nav";
import { cn } from "@/lib/utils";

// Short names for the "Who we help" links, so they fit beside the breadcrumb.
const SHORT_LABELS: Record<string, string> = {
  "/homebuyer": "Buyers",
  "/landlord": "Landlords",
  "/legal": "Solicitors",
  "/councils": "Councils",
};

/**
 * The slim row at the top of every inner page: the breadcrumb on the left and the
 * "Who we help" links on the right (desktop). On phones the breadcrumb shortens to
 * a single "← parent" link and the audience links live in the menu.
 */
export default function HeroTopBar({ items }: { items: Crumb[] }) {
  const pathname = usePathname() ?? "";

  return (
    <div className="flex min-h-[52px] items-center justify-between gap-6 border-b border-line">
      <Breadcrumbs items={items} compact />
      <nav aria-label="Who we help" className="hidden shrink-0 items-center gap-1 lg:flex">
        <span className="mr-2 text-xs font-bold uppercase tracking-[0.06em] text-muted-ink">Who we help</span>
        {LANE_LINKS.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              title={link.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex h-8 items-center rounded-full px-3 text-sm font-semibold no-underline hover:text-teal",
                active ? "bg-teal-tint text-teal" : "text-ink",
              )}
            >
              {SHORT_LABELS[link.href] ?? link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
