import Image from "next/image";
import Link from "next/link";
import { ButtonLink, Eyebrow, type Crumb } from "@/components/site/primitives";
import HeroTopBar from "@/components/site/HeroTopBar";
import { cn } from "@/lib/utils";
import ArticleToc, { type TocItem } from "./ArticleToc";

// ─────────────────────────────────────────────────────────────
// Shared layout for long-form pages: Sanity blog posts (/blog/[slug])
// and the data-driven guides (/guides/[slug]). Mirrors Guide-Article.
// ─────────────────────────────────────────────────────────────

export type { TocItem };

/** Heading anchor in the same shape WordPress used, so pasted "#what-is-a-party-wall" links keep working. */
export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’'`]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/[\s-]+/g, "-");
}

export function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" });
}

/** Mist header: slim breadcrumb row, eyebrow, H1, lede and a byline row. */
export function ArticleHero({
  breadcrumbs,
  eyebrow,
  title,
  intro,
  byline,
}: {
  breadcrumbs: Crumb[];
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  intro?: React.ReactNode;
  byline?: React.ReactNode;
}) {
  return (
    <section className="bg-mist text-ink">
      <div className="mx-auto w-full max-w-[1440px] px-gutter pb-14 md:pb-16">
        <HeroTopBar items={breadcrumbs} />
        <div className="mt-7 flex max-w-[980px] flex-col gap-[18px] md:mt-9">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h1 className="text-[34px] font-extrabold leading-[1.06] md:text-[50px]">{title}</h1>
          {intro && <p className="max-w-[820px] text-lg text-body md:text-xl">{intro}</p>}
          {byline && (
            <div className="flex max-w-[820px] items-center gap-4 border-y border-line py-[18px]">{byline}</div>
          )}
        </div>
      </div>
    </section>
  );
}

/** Byline contents: optional avatar, a bold name line and a muted meta line. */
export function Byline({
  avatarUrl,
  name,
  meta,
}: {
  avatarUrl?: string;
  name?: React.ReactNode;
  meta?: React.ReactNode;
}) {
  return (
    <>
      {avatarUrl && (
        <Image
          src={avatarUrl}
          alt=""
          width={52}
          height={52}
          className="h-[52px] w-[52px] shrink-0 rounded-full bg-line object-cover"
        />
      )}
      <div className="flex flex-col">
        {name && <b>{name}</b>}
        {meta && <span className="text-sm text-muted-ink">{meta}</span>}
      </div>
    </>
  );
}

/**
 * White band with the article on the left and a sticky aside (table of contents
 * plus a call-to-action card) on the right. On phones the contents sit in a
 * collapsible block above the article and the card follows it.
 */
export function ArticleShell({
  toc,
  tocLabel = "Table of Contents",
  aside,
  children,
}: {
  toc?: TocItem[];
  tocLabel?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  const hasToc = Boolean(toc && toc.length > 1);
  return (
    <section className="bg-white text-ink">
      <div className="mx-auto grid w-full max-w-[1440px] items-start gap-10 px-gutter py-14 md:pb-[88px] md:pt-[72px] lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-16">
        <div className="min-w-0">
          {hasToc && (
            <details className="group mb-8 rounded-2xl border border-line bg-mist-soft px-5 py-4 lg:hidden">
              <summary className="cursor-pointer list-none text-sm font-bold uppercase tracking-[0.06em] text-muted-ink [&::-webkit-details-marker]:hidden">
                {tocLabel}
                <span aria-hidden="true" className="float-right transition-transform group-open:rotate-180">
                  ⌄
                </span>
              </summary>
              <ol className="m-0 mt-3 flex list-none flex-col gap-1 p-0">
                {toc!.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`} className="block py-1 text-[15px] text-body no-underline hover:text-teal">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ol>
            </details>
          )}
          {children}
        </div>
        {(hasToc || aside) && (
          <aside className="flex flex-col gap-7 lg:sticky lg:top-6">
            {hasToc && (
              <div className="hidden lg:block">
                <ArticleToc items={toc!} label={tocLabel} />
              </div>
            )}
            {aside}
          </aside>
        )}
      </div>
    </section>
  );
}

/** White card in the aside: eyebrow, big title, short text and one button. */
export function AsideCard({
  eyebrow,
  title,
  text,
  href,
  cta,
  children,
}: {
  eyebrow: string;
  title: string;
  text: string;
  href: string;
  cta: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3.5 rounded-[22px] border border-line bg-white p-[30px] shadow-[0_24px_50px_-30px_rgba(15,30,56,0.4)]">
      <span className="text-[13px] font-bold uppercase tracking-[0.06em] text-muted-ink">{eyebrow}</span>
      <span className="font-display text-[30px] font-extrabold leading-[1.1]">{title}</span>
      <span className="text-[15px] text-body">{text}</span>
      <ButtonLink href={href} className="self-start">
        {cta}
      </ButtonLink>
      {children}
    </div>
  );
}

/** Teal-tint note inside an article: "Need a notice now?" and similar. */
export function ArticleNote({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="not-prose flex flex-col gap-1.5 rounded-2xl border border-teal-line bg-teal-tint px-6 py-[22px]">
      <b className="text-[17px] text-ink">{title}</b>
      <div className="rc-prose text-[15px] leading-[1.6] text-body">{children}</div>
    </div>
  );
}

/** Comparison table with a navy header row, as drawn in the guide designs. */
export function ArticleTable({
  caption,
  columns,
  rows,
  rowHeadings = true,
  className,
}: {
  caption?: string;
  columns: React.ReactNode[];
  rows: React.ReactNode[][];
  rowHeadings?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("not-prose overflow-x-auto rounded-2xl border border-line bg-white", className)}>
      <table className="w-full min-w-[560px] border-collapse text-left text-[15px] leading-[1.5]">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} scope="col" className="bg-navy px-5 py-3.5 align-bottom font-bold text-white">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r} className={r % 2 === 1 ? "bg-mist-soft" : "bg-white"}>
              {row.map((cell, c) =>
                c === 0 && rowHeadings ? (
                  <th key={c} scope="row" className="border-t border-line px-5 py-3.5 align-top font-bold text-ink">
                    {cell}
                  </th>
                ) : (
                  <td
                    key={c}
                    className={cn(
                      "border-t border-line px-5 py-3.5 align-top text-body",
                      c === 0 && "font-bold text-ink",
                    )}
                  >
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

/** Typography for article bodies, matching the design: 18px / 1.7 body, 30px h2, 21px h3. */
export const ARTICLE_BODY_CLASS = cn(
  "prose max-w-none text-[18px] leading-[1.7] text-body",
  "prose-headings:scroll-mt-6 prose-headings:font-extrabold prose-headings:text-ink",
  "prose-h2:mb-[18px] prose-h2:mt-9 prose-h2:text-[26px] prose-h2:leading-[1.15] md:prose-h2:text-[30px]",
  "prose-h3:mb-3 prose-h3:mt-7 prose-h3:text-[21px] prose-h3:leading-[1.25]",
  "prose-h4:mb-3 prose-h4:mt-7 prose-h4:text-[19px] prose-h4:leading-[1.3]",
  "prose-h5:mb-2 prose-h5:mt-6 prose-h5:text-[17px] prose-h5:text-ink",
  "prose-p:my-[18px]",
  "prose-a:font-bold prose-a:text-teal prose-a:underline-offset-2 hover:prose-a:text-teal-dark",
  "prose-strong:font-bold prose-strong:text-current",
  "prose-ol:my-[18px] prose-ol:pl-[22px] prose-ul:my-[18px] prose-ul:pl-[22px]",
  "prose-li:my-1.5 prose-li:pl-0.5 prose-li:marker:text-muted-ink",
  "prose-blockquote:rounded-r-2xl prose-blockquote:border-l-4 prose-blockquote:border-teal prose-blockquote:bg-teal-tint prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:font-medium prose-blockquote:not-italic prose-blockquote:text-ink",
  "prose-figure:my-8 prose-img:rounded-[22px] prose-hr:my-10 prose-hr:border-line",
  "[&>:first-child]:mt-0",
);

/** FAQ block inside an article body: border-top items with an 18px question. */
export const ARTICLE_FAQ_CLASS = cn(
  "[&_h3]:mb-0 [&_h3]:mt-0 [&_h3]:border-t [&_h3]:border-line [&_h3]:pt-[22px] [&_h3]:text-lg [&_h3]:font-bold [&_h3]:leading-[1.35]",
  "[&_h3]:font-body! [&_h3]:tracking-normal!",
  "[&_h3+*]:mt-2 [&_h3~p]:text-base [&_h3~p]:leading-[1.6]",
  "[&_h3~p]:mb-[22px]",
);

/** Teal-tint "Quick answers" / "In short" box at the top of an article. */
export const ARTICLE_CALLOUT_CLASS = cn(
  "my-[18px] rounded-2xl bg-teal-tint px-6 py-[26px] md:px-7",
  "[&>:first-child]:mt-0 [&>:last-child]:mb-0",
  "[&_h2]:mb-2.5 [&_h2]:text-2xl [&_h2]:leading-[1.2] [&_h3]:mb-2.5 [&_h3]:text-xl",
  "[&_p]:my-2.5 [&_ul]:my-2.5",
);

/** Card for an article or guide in an index grid. */
export function StoryCard({
  href,
  meta,
  title,
  text,
  cta = "Read more →",
  image,
  size = "md",
  headingLevel: Heading = "h3",
}: {
  href: string;
  meta?: React.ReactNode;
  title: string;
  text?: string;
  cta?: string;
  image?: { src: string; alt: string };
  size?: "md" | "lg";
  headingLevel?: "h2" | "h3";
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-[18px] border border-line bg-white p-6 text-ink no-underline transition-colors hover:border-teal hover:text-ink md:p-[26px]"
    >
      {image && (
        <div className="relative h-[200px] overflow-hidden rounded-[14px] bg-mist md:h-[240px]">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
      )}
      {meta && <span className="text-[13px] font-bold text-muted-ink">{meta}</span>}
      <Heading className={cn("font-bold leading-[1.25]", size === "lg" ? "text-[22px]" : "text-[21px]")}>
        {title}
      </Heading>
      {text && <p className="line-clamp-3 text-[15px] text-body">{text}</p>}
      <span className="mt-auto text-[15px] font-bold text-teal group-hover:text-teal-dark">{cta}</span>
    </Link>
  );
}
