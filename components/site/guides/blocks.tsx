import { cn } from "@/lib/utils";
import { Eyebrow } from "@/components/site/primitives";

// Building blocks shared by the guide pages (/guides/awaabs-law, /guides/hhsrs,
// /guides/level-2-vs-level-3-survey) and the policy pages.

/** Comparison table with the design's navy header row. Scrolls sideways on small screens. */
export function GuideTable({
  caption,
  columns,
  rows,
  widths,
  minWidth = 560,
  className,
}: {
  caption: string;
  columns: React.ReactNode[];
  rows: React.ReactNode[][];
  /** Optional relative column widths, e.g. ["30%", "35%", "35%"]. */
  widths?: string[];
  minWidth?: number;
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto rounded-2xl border border-line bg-white", className)}>
      <table className="w-full border-collapse text-left text-[15px] leading-normal" style={{ minWidth }}>
        <caption className="sr-only">{caption}</caption>
        {widths && (
          <colgroup>
            {widths.map((width, i) => (
              <col key={i} style={{ width }} />
            ))}
          </colgroup>
        )}
        <thead>
          <tr className="bg-navy text-white">
            {columns.map((col, i) => (
              <th key={i} scope="col" className="px-[18px] py-3.5 align-top font-bold">
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
                  <th key={c} scope="row" className="border-t border-line px-[18px] py-[13px] align-top font-bold text-ink">
                    {cell}
                  </th>
                ) : (
                  <td key={c} className="border-t border-line px-[18px] py-[13px] align-top text-body">
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

/** Teal-tint call-out with a bold title and a short line of text. */
export function InfoBox({
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
      <b className="text-[17px] leading-snug text-ink">{title}</b>
      <div className="rc-prose text-[15px] text-body">{children}</div>
    </div>
  );
}

/** Full-width navy band: heading and text on the left, stacked actions on the right. */
export function NavyBand({
  eyebrow,
  title,
  text,
  actions,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  text: React.ReactNode;
  actions: React.ReactNode;
}) {
  return (
    <section className="bg-navy text-white">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-gutter py-12 md:py-16 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <div className="flex max-w-[760px] flex-col gap-2.5">
          {eyebrow && <Eyebrow className="text-[#7FD8C8]">{eyebrow}</Eyebrow>}
          <h2 className="text-[28px] font-extrabold leading-[1.12] md:text-[34px]">{title}</h2>
          <p className="text-[17px] text-navy-soft">{text}</p>
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-3 sm:items-start lg:items-stretch">{actions}</div>
      </div>
    </section>
  );
}

/** Eyebrow + H2 + optional intro at the top of a guide section (design: 40px heading, 820px cap). */
export function GuideSectionHeading({
  eyebrow,
  title,
  intro,
  id,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  intro?: React.ReactNode;
  id?: string;
}) {
  return (
    <div className="flex max-w-[820px] flex-col gap-3">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 id={id} className="scroll-mt-6 text-[30px] font-extrabold leading-[1.08] text-ink md:text-[40px]">
        {title}
      </h2>
      {intro && <div className="flex flex-col gap-3 text-lg text-body">{intro}</div>}
    </div>
  );
}

/** Simple card: Schibsted title and a short line of text, with an optional icon tile above. */
export function TitleCard({
  icon,
  title,
  children,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[18px] border border-line bg-white p-[26px]">
      {icon}
      <h3 className="text-[21px] font-bold leading-[1.25]">{title}</h3>
      <p className="text-[15px] text-body">{children}</p>
    </div>
  );
}
