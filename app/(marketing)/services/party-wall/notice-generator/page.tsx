import { getPageMetadata } from "@/lib/page-metadata";
import PageJsonLd from "@/components/common/PageJsonLd";
import HeroTopBar from "@/components/site/HeroTopBar";
import CallbackSection from "@/components/site/CallbackSection";
import NoticeGeneratorForm from "@/components/site/party-wall/NoticeGeneratorForm";
import RelatedStrip from "@/components/site/party-wall/RelatedStrip";
import { Eyebrow, FaqList, Section, SectionHeading, TextLink, type FaqItem } from "@/components/site/primitives";

export const metadata = getPageMetadata("/services/party-wall/notice-generator");

const FAQS: FaqItem[] = [
  {
    q: "Is this a party wall notice template?",
    a: (
      <p>
        It works like one: instead of filling in a blank template, you answer the questions above and we prepare the
        notice from your answers and email it to you.
      </p>
    ),
  },
  {
    q: "Which party wall notice do I need?",
    a: (
      <p>
        It depends on the work. Loft beams, chimney breast removal and other work to a shared wall need a party
        structure notice. A new wall on the boundary needs a line of junction notice. Excavating within 3 metres of a
        neighbour’s building and deeper than its foundations (or within 6 metres in some cases) needs a notice of
        adjacent excavation.
      </p>
    ),
  },
  {
    q: "What happens after I serve the notice?",
    a: (
      <p>
        Your neighbour has 14 days to respond. If they consent in writing, nothing more is needed under the Act. If they
        dissent, or don’t reply, party wall surveyors prepare a party wall award before the work starts.
      </p>
    ),
  },
  {
    q: "Can you serve the notice for me?",
    a: (
      <p>
        Yes. We advise on, prepare, draft, review and serve notices: £50 per notice.{" "}
        <TextLink href="/services/party-wall">See our party wall surveyors</TextLink>.
      </p>
    ),
  },
];

export default function PartyWallNoticeGeneratorPage() {
  return (
    <>
      <PageJsonLd path="/services/party-wall/notice-generator" />

      <section className="bg-mist text-ink">
        <div className="mx-auto w-full max-w-[1440px] px-gutter pb-16 md:pb-20">
          <HeroTopBar
            items={[
              { label: "Home", href: "/" },
              { label: "Party wall", href: "/services/party-wall" },
              { label: "Notice generator" },
            ]}
          />
          <div className="mt-7 flex flex-col gap-9 md:mt-9">
            <div className="flex max-w-[820px] flex-col gap-[18px]">
              <Eyebrow>Free party wall notice template</Eyebrow>
              <h1 className="text-[38px] font-extrabold leading-[1.04] md:text-[54px]">Party Wall Notice Generator</h1>
              <p className="text-xl text-body">
                Complete the form below to generate your party wall notice. We prepare the document from the information
                you supply and email it to you on submission.
              </p>
            </div>
            <NoticeGeneratorForm />
          </div>
        </div>
      </section>

      <Section>
        <div className="flex flex-col gap-[18px]">
          <SectionHeading eyebrow="About party wall notices" title="What is a party wall notice?" />
          <p className="max-w-[900px] text-lg text-body">
            A party wall notice is the formal written notice a building owner serves on each adjoining owner before
            starting work covered by the Party Wall etc. Act 1996. There are three types: a party structure notice for
            work to a shared wall (at least two months’ notice), a line of junction notice for a new wall on or at the
            boundary (at least one month), and a notice of adjacent excavation for digging near a neighbour’s foundations
            (at least one month).
          </p>
        </div>
        <FaqList items={FAQS} />
      </Section>

      <RelatedStrip
        links={[
          { label: "Party wall surveyors in London", href: "/services/party-wall" },
          { label: "The ultimate guide to the Party Wall Act 1996", href: "/blog/ultimate-guide-party-wall-act-1996" },
        ]}
      />

      <CallbackSection formName="Party wall notice generator page call back" defaultNeeds={["Party wall"]} />
    </>
  );
}
