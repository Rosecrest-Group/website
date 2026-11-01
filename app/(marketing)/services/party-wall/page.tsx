import { getPageMetadata } from "@/lib/page-metadata";
import PageJsonLd from "@/components/common/PageJsonLd";
import CallbackSection from "@/components/site/CallbackSection";
import TrustBadges from "@/components/site/TrustBadges";
import RelatedStrip from "@/components/site/party-wall/RelatedStrip";
import {
  ButtonLink,
  Card,
  Eyebrow,
  FaqList,
  PageHero,
  Photo,
  Section,
  SectionHeading,
  TextLink,
  type FaqItem,
} from "@/components/site/primitives";

export const metadata = getPageMetadata("/services/party-wall");

const AGREED_SURVEYOR_STEPS = [
  {
    title: "Notice Preparation & Service",
    text: <>We advise on, prepare, draft, review and serve the necessary notice(s) to comply with the Party Wall etc. Act.</>,
  },
  {
    title: "Schedule of Condition",
    text: <>We document the condition of the adjoining owner’s property before work begins.</>,
  },
  {
    title: "Site Access & Inspection",
    text: (
      <>
        Arranging access and attending the site to assess the specific circumstances involved. For property assessments
        and inspections, we also offer <TextLink href="/homebuyer">RICS Level 1 to 3 Surveys</TextLink>.
      </>
    ),
  },
  {
    title: "Notice Accuracy",
    text: (
      <>
        Serving accurate, legally compliant notices is essential. We ensure all notices meet the required standards to
        avoid any invalidation.
      </>
    ),
  },
  {
    title: "Impartiality",
    text: <>Once appointed under the Act, our surveyor must remain unbiased and ensure fair outcomes for both parties.</>,
  },
  {
    title: "Equitable Party Wall Award",
    text: <>Our surveyor negotiates with the adjoining owner to create a fair and balanced party wall award.</>,
  },
  {
    title: "Issuing the Award",
    text: <>We draft, finalise and serve the Party Wall Award to both parties.</>,
  },
  {
    title: "Additional Awards (if needed)",
    text: <>In some cases, further awards may be required as the project progresses.</>,
  },
];

const FAQS: FaqItem[] = [
  {
    q: "What is the Party Wall etc. Act 1996?",
    a: (
      <p>
        The law in England and Wales that sets out how building work on or near a shared wall, a boundary or a
        neighbour’s foundations must be notified and, if the neighbour dissents, settled by party wall surveyors through
        an award.
      </p>
    ),
  },
  {
    q: "Do you act for both sides?",
    a: (
      <p>
        Yes, as the agreed surveyor, if both owners agree to appoint us. Otherwise we act for either the building owner
        or the adjoining owner, and the two appointed surveyors work together on the award.
      </p>
    ),
  },
  {
    q: "How long does the Party Wall process take?",
    a: (
      <p>
        Notices are served one to two months before work starts, depending on the work, and your neighbour has 14 days
        to respond. Simple consent cases take 2 to 6 weeks; cases needing an award typically take 6 to 12 weeks, and
        complex disputes 3 to 6 months.
      </p>
    ),
  },
  {
    q: "How much does a party wall surveyor cost?",
    a: (
      <p>
        Party wall notices are £50 per notice. A schedule of condition is £450. Surveyor time is £145 per hour, whether
        we are the agreed surveyor or one owner’s appointed surveyor. Introductory offer: a fixed £1,500. The building
        owner normally pays the reasonable fees of both surveyors.
      </p>
    ),
  },
  {
    q: "What is a party wall award?",
    a: (
      <p>
        The legal document the surveyors make when a neighbour dissents, or doesn’t reply within 14 days. It sets out
        how and when the work will proceed, access, protective measures, damage protocols and who pays. It is commonly
        called a party wall agreement.
      </p>
    ),
  },
  {
    q: "Do I need a schedule of condition?",
    a: (
      <p>
        If your neighbour dissents, a schedule of condition records their property before work starts. If they consent,
        nothing more is needed under the Act, but a schedule of condition is still sensible protection for both owners,
        and we can prepare one.
      </p>
    ),
  },
];

export default function PartyWallPage() {
  return (
    <>
      <PageJsonLd path="/services/party-wall" />

      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: "Party wall" }]}
        eyebrow="Party wall surveyors in London"
        title="Party Wall and Professional Advice"
        intro={
          <p>
            A party wall surveyor performs a specialist role in resolving disputes between neighbours under the Party
            Wall etc. Act 1996, and our party wall surveyors in London act for building owners, adjoining owners, or
            both as the agreed surveyor.
          </p>
        }
        media={
          <Photo
            src="/assets/images/party-wall/single-appointed.png"
            alt="Terraced houses in London sharing a party wall"
            priority
            className="md:h-[400px]"
          />
        }
      />

      <TrustBadges variant="strip" badges={["cabe", "rpsa", "rics", "constructionline", "safecontractor"]} />

      {/* Our role */}
      <Section>
        <SectionHeading
          eyebrow="Our role"
          title="The Role of the Party Wall Surveyors"
          intro="Our party wall surveyors assess the building work details, review any objections from adjoining owners, and prepare a legally binding party wall award. This document sets out how and when the work will proceed, includes any necessary conditions, and ensures the award is fit for purpose and compliant with the Party Wall etc. Act 1996."
          className="gap-[18px]"
        >
          <div className="flex flex-wrap items-center gap-3.5">
            <ButtonLink href="/request-inspection">Make an enquiry</ButtonLink>
          </div>
        </SectionHeading>
      </Section>

      {/* Agreed surveyor */}
      <Section>
        <SectionHeading
          eyebrow="Agreed surveyor"
          title="The Agreed Party Wall Surveyor"
          intro="This process involves the building owner and the adjoining owner agreeing to appoint the same party wall surveyor to facilitate the Party Wall Award."
        />
        <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          {AGREED_SURVEYOR_STEPS.map((step) => (
            <Card key={step.title}>
              <h3 className="text-[21px] font-bold leading-[1.25]">{step.title}</h3>
              <p className="text-[15px] text-body">{step.text}</p>
            </Card>
          ))}
        </div>
        <div className="grid gap-10 md:grid-cols-2 md:gap-14">
          <div className="flex flex-col gap-2.5">
            <h3 className="text-[22px] font-extrabold leading-[1.2]">Property Inspection</h3>
            <p className="text-[17px] text-body">
              A thorough examination of the adjoining property ensures we understand the potential impact of the project
              and verify the accuracy of the plans. This step is key to creating a detailed schedule of condition to
              help identify any potential future damage.
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            <h3 className="text-[22px] font-extrabold leading-[1.2]">The Party Wall Award</h3>
            <p className="text-[17px] text-body">
              With all necessary information, we draft the Party Wall Award, detailing each owner’s responsibilities,
              work guidelines, access provisions and damage protocols. Rest assured, we address all concerns
              meticulously to safeguard your interests.
            </p>
          </div>
        </div>
      </Section>

      {/* Single-appointed surveyor and the third surveyor */}
      <Section tone="mist">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-16">
          <div className="flex flex-col gap-4">
            <Eyebrow>Each owner’s surveyor</Eyebrow>
            <h2 className="text-[30px] font-extrabold leading-[1.08] md:text-[40px]">
              The Single-Appointed Party Wall Surveyor
            </h2>
            <p className="text-[17px] text-body">
              This option is typically chosen when either the building owner or the adjoining owner wishes to produce an
              award without sharing a surveyor, often due to concerns about impartiality. In such cases, our surveyors
              will represent either the building owner or the adjoining owner.
            </p>
            <p className="text-[17px] text-body">
              For example, if a building owner appoints us, we will issue a notice to the adjoining owner. If the
              adjoining owner responds by dissenting and chooses to appoint their own surveyor, we will wait for their
              surveyor to send us their appointment letter.
            </p>
            <p className="text-[17px] text-body">
              Once we receive this letter, both appointed surveyors will select a third surveyor to form a tribunal. The
              third surveyor is only engaged if there is a disagreement or dispute between the two primary surveyors
              that requires resolution.
            </p>
            <p className="text-[17px] text-body">
              The role of the surveyors involves collaborating to achieve the award, which includes consultations, site
              visits, preparing a schedule of condition and finally drafting the award (commonly misnamed as the party
              wall agreement).
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="text-[24px] font-extrabold leading-[1.2] md:text-[28px]">The Role of the Third Surveyor</h3>
            <div className="flex flex-col gap-1.5 rounded-2xl border border-teal-line bg-teal-tint px-6 py-[22px]">
              <b className="text-[17px] text-ink">In case of disagreements</b>
              <p className="text-[15px] text-body">
                Should a stalemate occur between the two primary party wall surveyors, the third surveyor will
                intervene. Acting impartially, the third surveyor resolves the matters in dispute, ensuring a seamless
                process for all parties involved.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Free notice generator */}
      <section className="bg-navy text-white">
        <div className="mx-auto grid w-full max-w-[1440px] items-center gap-8 px-gutter py-14 md:py-[72px] lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-16">
          <div className="flex flex-col gap-3.5">
            <Eyebrow className="text-[#7FD8C8]">Free party wall notice</Eyebrow>
            <h2 className="text-[30px] font-extrabold leading-[1.08] md:text-[40px]">
              Create Your Party Wall Notice for Free
            </h2>
            <p className="text-[17px] text-navy-soft">
              Creating a party wall notice is a crucial step when planning construction or renovation projects that
              might affect shared walls with neighbouring properties. Our platform simplifies this process by offering
              you the opportunity to generate your party wall notice for free.
            </p>
            <p className="text-[17px] text-navy-soft">
              With just a few clicks, you can draft a party wall notice, helping your project follow the correct
              procedure and maintain positive relations with your neighbours. Don’t wait: start the process now to
              protect your interests and facilitate a smooth construction journey.
            </p>
          </div>
          <div className="flex lg:justify-end">
            <ButtonLink href="/services/party-wall/notice-generator" variant="light">
              Free Party Wall Tool
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <Section tone="mist">
        <SectionHeading
          title="Frequently asked questions"
          intro="Here are answers to the most common questions about Party Wall and boundary services."
        />
        <FaqList items={FAQS} />
      </Section>

      <RelatedStrip
        links={[
          { label: "Party wall notice generator", href: "/services/party-wall/notice-generator" },
          { label: "The ultimate guide to the Party Wall Act 1996", href: "/blog/ultimate-guide-party-wall-act-1996" },
        ]}
      />

      <CallbackSection formName="Party wall page call back" defaultNeeds={["Party wall"]} />
    </>
  );
}
