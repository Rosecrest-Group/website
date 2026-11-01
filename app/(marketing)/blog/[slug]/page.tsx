import { sanityFetch } from "@/sanity/lib/client";
import { postBySlugQuery, postSlugsQuery, allPostsQuery } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  PortableText,
  type PortableTextBlockComponent,
  type PortableTextComponents,
} from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import sanitizeHtml from "sanitize-html";
import JsonLd from "@/components/common/JsonLd";
import CallbackSection from "@/components/site/CallbackSection";
import { Eyebrow, Section, TextLink } from "@/components/site/primitives";
import {
  ARTICLE_BODY_CLASS,
  ARTICLE_CALLOUT_CLASS,
  ARTICLE_FAQ_CLASS,
  ArticleHero,
  ArticleShell,
  ArticleTable,
  AsideCard,
  Byline,
  StoryCard,
  formatDate,
  slugify,
  type TocItem,
} from "@/components/site/articles/ArticleParts";
import { buildMetadata } from "@/lib/page-metadata";
import { buildBlogPosting, buildBreadcrumbList, type SchemaAuthor } from "@/lib/schema";
import { cn } from "@/lib/utils";

export const revalidate = 60;

type SanityImage = { asset: { _ref: string }; alt?: string };

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt: string;
  _updatedAt?: string;
  heroImage?: SanityImage;
  body?: PortableTextBlock[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
  author?: (SchemaAuthor & { avatar?: SanityImage }) | null;
  categories?: { title?: string; slug?: string }[] | null;
}

export async function generateStaticParams() {
  const slugs: string[] = (await sanityFetch<string[]>(postSlugsQuery)) ?? [];
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post: Post | null = await sanityFetch<Post | null>(postBySlugQuery, { slug });

  if (!post) {
    return { title: "Post not found | Rosecrest Group" };
  }

  return buildMetadata({
    path: `/blog/${post.slug}`,
    title: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt || "",
    ogImage: post.heroImage
      ? urlFor(post.heroImage).width(1200).format("webp").url()
      : undefined,
    type: "article",
  });
}

const htmlTableOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    "table",
    "thead",
    "tbody",
    "tfoot",
    "tr",
    "th",
    "td",
    "caption",
    "colgroup",
    "col",
    "strong",
    "b",
    "em",
    "i",
    "br",
    "span",
    "p",
  ],
  allowedAttributes: {
    th: ["colspan", "rowspan", "scope"],
    td: ["colspan", "rowspan"],
    col: ["span"],
  },
};

type BodyBlock = PortableTextBlock & { html?: string };

function blockPlainText(block: BodyBlock): string {
  if (block._type !== "block" || !Array.isArray(block.children)) return "";
  return block.children
    .map((child) => {
      if (!child || typeof child !== "object" || !("text" in child)) return "";
      return typeof child.text === "string" ? child.text : "";
    })
    .join("");
}

function textBlock(key: string, text: string): BodyBlock {
  return {
    _type: "block",
    _key: key,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: `${key}-span`, text, marks: [] }],
  };
}

/** A pasted `<table>` inside a normal paragraph is stored as text. Render that markup. */
function expandPastedHtmlTables(blocks: BodyBlock[]): BodyBlock[] {
  const result: BodyBlock[] = [];
  let index = 0;

  while (index < blocks.length) {
    const block = blocks[index];
    if (block._type !== "block" || !blockPlainText(block).includes("<table")) {
      result.push(block);
      index += 1;
      continue;
    }

    let end = index;
    let combined = blockPlainText(block);
    while (!/<\/table>/i.test(combined) && blocks[end + 1]?._type === "block") {
      end += 1;
      combined += `\n${blockPlainText(blocks[end])}`;
    }

    if (!/<\/table>/i.test(combined)) {
      result.push(block);
      index += 1;
      continue;
    }

    const tablePattern = /<table[\s\S]*?<\/table>/gi;
    let last = 0;
    let count = 0;
    for (const match of combined.matchAll(tablePattern)) {
      const before = combined.slice(last, match.index).trim();
      if (before) result.push(textBlock(`${block._key}-before-${count}`, before));
      result.push({
        _type: "htmlTable",
        _key: `${block._key}-html-${count}`,
        html: match[0],
        children: [],
        markDefs: [],
      });
      last = (match.index ?? 0) + match[0].length;
      count += 1;
    }

    const after = combined.slice(last).trim();
    if (after) result.push(textBlock(`${block._key}-after`, after));
    index = end + 1;
  }

  return result;
}

// ─────────────────────────────────────────────────────────────
// Body layout: heading anchors, the sidebar contents, and the
// "Quick answers" and FAQ blocks drawn as in the design.
// ─────────────────────────────────────────────────────────────

const HEADING_LEVEL: Record<string, number> = { h2: 2, h3: 3, h4: 4 };
const TOC_HEADING = /^\s*table of contents\s*:?\s*$/i;
const CALLOUT_HEADING = /^\s*(quick answers?|in short|key (points|takeaways)|at a glance)\b/i;
const FAQ_HEADING = /^\s*(faqs?|frequently asked questions)\b/i;

type Segment = { kind: "plain" | "callout" | "faq"; blocks: BodyBlock[] };

function headingLevel(block: BodyBlock) {
  return block._type === "block" && block.style ? (HEADING_LEVEL[block.style] ?? 0) : 0;
}

function prepareBody(body: BodyBlock[]) {
  const expanded = expandPastedHtmlTables(body).map((block, i) =>
    block._key ? block : { ...block, _key: `block-${i}` },
  );

  // The sidebar replaces any "Table of Contents" heading and link list pasted into the body.
  const blocks: BodyBlock[] = [];
  const breaks = new Set<string>();
  for (let i = 0; i < expanded.length; i++) {
    const block = expanded[i];
    if (headingLevel(block) && TOC_HEADING.test(blockPlainText(block)) && expanded[i + 1]?.listItem) {
      while (expanded[i + 1]?.listItem) i += 1;
      if (expanded[i + 1]) breaks.add(expanded[i + 1]._key!);
      continue;
    }
    blocks.push(block);
  }

  const ids = new Map<string, string>();
  const used = new Set<string>();
  const headings: { level: number; id: string; label: string }[] = [];
  for (const block of blocks) {
    const level = headingLevel(block);
    if (!level) continue;
    const label = blockPlainText(block).trim();
    const base = slugify(label) || "section";
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    ids.set(block._key!, id);
    headings.push({ level, id, label });
  }

  // Contents list: the highest heading level used at least twice.
  const tocLevel = [2, 3, 4].find((level) => headings.filter((h) => h.level === level).length >= 2);
  const toc: TocItem[] = tocLevel
    ? headings.filter((h) => h.level === tocLevel).map(({ id, label }) => ({ id, label }))
    : [];

  const segments: Segment[] = [];
  let current: Segment | null = null;
  let currentLevel = 0;
  for (const block of blocks) {
    const level = headingLevel(block);
    const text = level ? blockPlainText(block) : "";
    // A box ends at the next heading of the same or higher level; the quick-answers box also
    // ends at an image or table, or where a pasted table of contents was taken out.
    if (current && current.kind !== "plain") {
      if (level && level <= currentLevel) current = null;
      else if (current.kind === "callout" && (block._type !== "block" || breaks.has(block._key!))) current = null;
    }
    if (level && (CALLOUT_HEADING.test(text) || FAQ_HEADING.test(text))) {
      current = { kind: FAQ_HEADING.test(text) ? "faq" : "callout", blocks: [] };
      currentLevel = level;
      segments.push(current);
    } else if (!current) {
      current = { kind: "plain", blocks: [] };
      segments.push(current);
    }
    current.blocks.push(block);
  }

  return { segments, toc, ids };
}

function buildComponents(ids: Map<string, string>): PortableTextComponents {
  const heading = (Tag: "h2" | "h3" | "h4"): PortableTextBlockComponent => {
    const Heading: PortableTextBlockComponent = ({ children, value }) => (
      <Tag id={value._key ? ids.get(value._key) : undefined}>{children}</Tag>
    );
    return Heading;
  };

  return {
    block: { h2: heading("h2"), h3: heading("h3"), h4: heading("h4") },
    types: {
      htmlTable: ({ value }: { value: { html?: string } }) => {
        if (!value.html?.trim()) return null;
        return (
          <div
            className={cn(
              "not-prose my-[18px] overflow-x-auto rounded-2xl border border-line bg-white",
              "[&_table]:w-full [&_table]:min-w-[560px] [&_table]:border-collapse [&_table]:text-left [&_table]:text-[15px] [&_table]:leading-[1.5]",
              "[&_th]:px-5 [&_th]:py-3.5 [&_th]:text-left [&_th]:align-top [&_th]:font-bold",
              "[&_thead_th]:bg-navy [&_thead_th]:text-white [&_tbody_th]:border-t [&_tbody_th]:border-line [&_tbody_th]:text-ink",
              "[&_td]:border-t [&_td]:border-line [&_td]:px-5 [&_td]:py-3.5 [&_td]:align-top [&_td]:text-body",
              "[&_td:first-child]:font-bold [&_td:first-child]:text-ink [&_tbody_tr:nth-child(even)]:bg-mist-soft",
              "[&_p]:m-0",
            )}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(value.html, htmlTableOptions) }}
          />
        );
      },
      table: ({ value }: { value: { rows?: { _key: string; cells?: string[] }[] } }) => {
        const [header, ...body] = value.rows ?? [];
        if (!header?.cells?.length) return null;
        return (
          <ArticleTable
            className="my-[18px]"
            columns={header.cells}
            rows={body.map((row) => row.cells ?? [])}
            rowHeadings={false}
          />
        );
      },
      image: ({ value }: { value: { asset: { _ref: string }; alt?: string; caption?: string } }) => (
        <figure className="my-8">
          <Image
            src={urlFor(value).width(1200).format("webp").url()}
            alt={value.alt || ""}
            width={1200}
            height={675}
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="m-0 h-auto w-full rounded-[22px]"
          />
          {value.caption && (
            <figcaption className="mt-2 text-center text-sm text-muted-ink">{value.caption}</figcaption>
          )}
        </figure>
      ),
    },
  };
}

/** Sidebar card and call-back pre-selection, picked from what the post is about. */
function topicFor(post: Post) {
  const text = `${post.title} ${post.slug}`;
  if (/party[\s-]?wall/i.test(text)) {
    return {
      needs: ["Party wall"],
      card: {
        eyebrow: "Party wall surveyors",
        title: "Free initial consultation",
        text: "Professional notice preparation, neighbour liaison and ongoing support throughout your building project.",
        href: "/request-inspection",
        cta: "Book a free consultation",
      },
    };
  }
  const needs = /damp|mould|condensation/i.test(text)
    ? ["Damp, Mould and Condensation Survey"]
    : /expert[\s-]?witness|cpr/i.test(text)
      ? ["CPR 35 expert witness report"]
      : /disrepair/i.test(text)
        ? ["Housing disrepair survey"]
        : undefined;
  return {
    needs,
    card: {
      eyebrow: "Speak to our advisors",
      title: "Not sure what you need?",
      text: "Tell us what’s happening and we’ll name the right service, with the fee and turnaround, before you commit.",
      href: "#callback",
      cta: "Request a call back",
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([
    sanityFetch<Post | null>(postBySlugQuery, { slug }),
    sanityFetch<Post[]>(allPostsQuery),
  ]);

  if (!post) notFound();

  const relatedPosts = (allPosts ?? []).filter((p) => p.slug !== slug).slice(0, 3);
  const { segments, toc, ids } = prepareBody((post.body ?? []) as BodyBlock[]);
  const components = buildComponents(ids);
  const topic = topicFor(post);

  const published = formatDate(post.publishedAt);
  const updated = formatDate(post._updatedAt);
  const author = post.author;
  const authorName = author?.name
    ? `${author.name}${author.credentials?.length ? ` ${author.credentials.join(", ")}` : ""}${
        author.jobTitle ? `, ${author.jobTitle}` : ""
      }`
    : undefined;
  const meta = [
    published && `Published ${published}`,
    updated && updated !== published && `Updated ${updated}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <JsonLd
        id="blog-post"
        data={[
          buildBlogPosting({
            title: post.title,
            slug: post.slug,
            datePublished: post.publishedAt,
            dateModified: post._updatedAt,
            description: post.seo?.metaDescription || post.excerpt,
            author: post.author,
            imageUrl: post.heroImage
              ? urlFor(post.heroImage).width(1200).format("webp").url()
              : undefined,
          }),
          buildBreadcrumbList([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/guides" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />

      <ArticleHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Guides", href: "/guides" }, { label: post.title }]}
        eyebrow={post.categories?.find((c) => c?.title)?.title ?? "Guides and property advice"}
        title={post.title}
        intro={post.excerpt}
        byline={
          authorName || meta ? (
            <Byline
              avatarUrl={author?.avatar ? urlFor(author.avatar).width(104).height(104).url() : undefined}
              name={authorName}
              meta={meta}
            />
          ) : undefined
        }
      />

      <ArticleShell toc={toc} aside={<AsideCard {...topic.card} />}>
        {post.heroImage && (
          <div className="relative mb-8 h-[240px] overflow-hidden rounded-[22px] bg-mist md:h-[340px]">
            <Image
              src={urlFor(post.heroImage).width(1200).format("webp").url()}
              alt={post.heroImage.alt ?? post.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />
          </div>
        )}

        <article className={cn("blog-content", ARTICLE_BODY_CLASS)}>
          {segments.map((segment, i) => (
            <div
              key={segment.blocks[0]?._key ?? i}
              className={cn(
                i === 0 && "[&>:first-child]:mt-0",
                segment.kind === "callout" && ARTICLE_CALLOUT_CLASS,
                segment.kind === "faq" && ARTICLE_FAQ_CLASS,
              )}
            >
              <PortableText value={segment.blocks} components={components} />
            </div>
          ))}
        </article>
      </ArticleShell>

      {relatedPosts.length > 0 && (
        <Section tone="mist">
          <Eyebrow>More stories</Eyebrow>
          <div className="grid gap-[18px] md:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((related) => (
              <StoryCard
                key={related._id}
                href={`/blog/${related.slug}`}
                meta={formatDate(related.publishedAt)}
                title={related.title}
                image={
                  related.heroImage
                    ? {
                        src: urlFor(related.heroImage).width(700).format("webp").url(),
                        alt: related.heroImage.alt ?? related.title,
                      }
                    : undefined
                }
              />
            ))}
          </div>
          <TextLink href="/guides" className="self-start">
            View all articles →
          </TextLink>
        </Section>
      )}

      <CallbackSection formName={`Article call back: ${post.title}`} defaultNeeds={topic.needs} />
    </>
  );
}
