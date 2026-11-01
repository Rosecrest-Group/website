import { ArrowRight } from "lucide-react";
import { SmartLink } from "@/components/site/primitives";

/** "Related" band of arrow links that closes the party wall pages. */
export default function RelatedStrip({ links }: { links: { label: string; href: string }[] }) {
  return (
    <section className="border-t border-line bg-white">
      <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center gap-x-7 gap-y-3 px-gutter py-10 text-base">
        <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-muted-ink">Related</span>
        {links.map((link) => (
          <SmartLink
            key={link.href}
            href={link.href}
            className="inline-flex items-center gap-1.5 font-bold text-teal no-underline hover:text-teal-dark"
          >
            {link.label}
            <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" strokeWidth={2.2} />
          </SmartLink>
        ))}
      </div>
    </section>
  );
}
