"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type TocItem = { id: string; label: string };

/**
 * "On this page" / "Contents" list for long guides and policies. Highlights the
 * section currently at the top of the viewport.
 */
export default function OnThisPage({
  items,
  title = "On this page",
  variant = "rail",
  className,
}: {
  items: TocItem[];
  title?: string;
  /** `rail` draws the teal/grey left rule from the guide design; `plain` is the policy contents list. */
  variant?: "rail" | "plain";
  className?: string;
}) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = items[0]?.id;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= 140) current = item.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [items]);

  return (
    <nav aria-label={title} className={cn("flex flex-col gap-0.5", className)}>
      <b className="mb-2 text-sm uppercase tracking-[0.06em] text-muted-ink">{title}</b>
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-current={isActive ? "location" : undefined}
            className={cn(
              "py-1.5 text-[15px] no-underline transition-colors hover:text-teal",
              variant === "rail" && "border-l-2 pl-3.5",
              variant === "rail" && (isActive ? "border-teal" : "border-line"),
              isActive ? "font-semibold text-ink" : "text-body",
            )}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
