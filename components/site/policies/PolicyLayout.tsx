import OnThisPage from "@/components/site/guides/OnThisPage";
import { PageHero } from "@/components/site/primitives";
import { cn } from "@/lib/utils";

// Shared layout for the legal policy pages (/privacy-policy, /cookie-policy):
// mist hero with the H1, then a contents list beside the full policy text.

export type PolicySection = {
  id: string;
  /** Heading as shown, including any number, e.g. "1. Data collection and usage". */
  title: string;
  content: React.ReactNode;
};

export default function PolicyLayout({
  crumb,
  title,
  intro,
  sections,
}: {
  crumb: string;
  title: string;
  intro?: React.ReactNode;
  sections: PolicySection[];
}) {
  return (
    <>
      <PageHero breadcrumbs={[{ label: "Home", href: "/" }, { label: crumb }]} title={title} intro={intro} />

      <section className="bg-white text-ink">
        <div className="mx-auto grid w-full max-w-[1440px] items-start gap-10 px-gutter py-14 md:py-20 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16">
          <aside className="rounded-2xl border border-line p-5 lg:sticky lg:top-6 lg:rounded-none lg:border-0 lg:p-0">
            <OnThisPage
              title="Contents"
              variant="plain"
              items={sections.map((section) => ({ id: section.id, label: section.title }))}
            />
          </aside>
          <div className="flex min-w-0 max-w-[820px] flex-col">
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="rc-prose flex scroll-mt-6 flex-col gap-3 border-t border-line py-[26px] text-[17px] text-body"
              >
                <h2 className="text-2xl font-extrabold leading-[1.2] text-ink">{section.title}</h2>
                {section.content}
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/** Sub-heading inside a policy section. */
export function PolicyH3({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn("mt-1.5 text-[19px] font-bold leading-[1.3] text-ink", className)}>{children}</h3>;
}

/** Bulleted list inside a policy section. */
export function PolicyList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="m-0 flex list-disc flex-col gap-1.5 pl-[22px] marker:text-teal">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
