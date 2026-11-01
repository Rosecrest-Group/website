"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type TocItem = { id: string; label: string };

/** Sidebar table of contents; the section in view gets the teal rule. */
export default function ArticleToc({ items, label }: { items: TocItem[]; label: string }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (headings.length === 0) return;

    const onScroll = () => {
      // The last heading that has scrolled past the top third of the viewport.
      const line = window.innerHeight * 0.3;
      let current = headings[0].id;
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= line) current = heading.id;
        else break;
      }
      setActive(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  return (
    <nav aria-label={label} className="flex flex-col gap-0.5">
      <b className="mb-2 text-sm uppercase tracking-[0.06em] text-muted-ink">{label}</b>
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          aria-current={active === item.id ? "location" : undefined}
          className={cn(
            "border-l-2 py-1.5 pl-3.5 text-[15px] leading-[1.45] text-body no-underline transition-colors hover:text-teal",
            active === item.id ? "border-teal text-ink" : "border-line",
          )}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
