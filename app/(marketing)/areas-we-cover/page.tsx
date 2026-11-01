import { getPageMetadata } from "@/lib/page-metadata";
import { london, m25Areas } from "@/lib/coverage";
import { PHONE, PHONE_HREF } from "@/lib/constants";
import PageJsonLd from "@/components/common/PageJsonLd";
import CallbackSection from "@/components/site/CallbackSection";
import { ButtonLink, Eyebrow, PageHero, Section } from "@/components/site/primitives";
import AreasWeCoverClient from "./AreasWeCoverClient";

export const metadata = getPageMetadata("/areas-we-cover");

// The borough and town lists come from lib/coverage.ts, the same data the
// postcode checker, structured data and llms.txt use (they match the design).

export default function AreasWeCoverPage() {
  return (
    <>
      <PageJsonLd path="/areas-we-cover" />

      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Areas" }]}
        eyebrow="Surveyors across London and the M25"
        title="Areas we cover"
        intro={
          <>
            <p>
              Rosecrest delivers property inspection, compliance and consultancy services across London and areas within
              the M25.
            </p>
            <p className="text-[17px]">
              Our qualified and experienced surveyors carry out RICS surveys, damp and mould investigations, expert
              reports and party wall services across all 32 London boroughs, the City of London and towns in Surrey,
              Kent, Hertfordshire and Essex.
            </p>
          </>
        }
        media={<AreasWeCoverClient />}
      />

      <Section>
        <h2 className="text-[30px] font-extrabold leading-[1.08] md:text-[40px]">Our Coverage Areas</h2>

        <div className="flex flex-col gap-3.5">
          <Eyebrow>London</Eyebrow>
          <h3 className="text-[26px] font-extrabold leading-[1.1] md:text-[30px]">
            All 32 boroughs and the City of London
          </h3>
          <p className="text-[17px] text-body">
            Full coverage across all 32 London boroughs and the City of London.
          </p>
          <ul className="m-0 flex list-none flex-wrap gap-2.5 p-0">
            {london.boroughs.map((borough) => (
              <li key={borough} className="rounded-full border border-line bg-white px-4 py-[9px] text-[15px] text-ink">
                {borough}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-[18px] md:grid-cols-2">
          {m25Areas.map((area) => (
            <div key={area.id} className="flex flex-col gap-2.5 rounded-[18px] border border-line bg-white p-[26px]">
              <h3 className="text-2xl font-extrabold">{area.name}</h3>
              <p className="text-[15px] text-muted-ink">{area.description}</p>
              <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                {area.towns.map((town) => (
                  <li key={town} className="rounded-full bg-mist px-3 py-1.5 text-sm">
                    {town}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <section className="bg-navy text-white">
        <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-x-12 gap-y-6 px-gutter py-12 md:py-16">
          <div className="flex max-w-[760px] flex-col gap-2.5">
            <h2 className="text-[28px] font-extrabold leading-[1.12] md:text-[34px]">Not sure if we cover you?</h2>
            <p className="text-[17px] text-navy-soft">
              If your property is near the M25 boundary or outside our listed areas, just get in touch. We regularly
              take on work in surrounding areas and will always do our best to accommodate your requirements.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ButtonLink href="/contact" variant="light">
              Get in Touch
            </ButtonLink>
            <a
              href={PHONE_HREF}
              className="whitespace-nowrap px-2.5 py-[15px] font-bold text-white no-underline hover:text-white"
            >
              or call {PHONE}
            </a>
          </div>
        </div>
      </section>

      <CallbackSection formName="Areas we cover page call back" />
    </>
  );
}
