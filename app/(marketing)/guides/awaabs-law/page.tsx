import JsonLd from "@/components/common/JsonLd";
import PageJsonLd from "@/components/common/PageJsonLd";
import CallbackSection from "@/components/site/CallbackSection";
import { GuideSectionHeading, GuideTable, InfoBox, NavyBand, TitleCard } from "@/components/site/guides/blocks";
import { ButtonLink, FaqList, PageHero, Section, TextLink } from "@/components/site/primitives";
import type { FAQItem } from "@/lib/faqs";
import { getPageMetadata, pageMetadata } from "@/lib/page-metadata";
import { buildArticle, buildFAQPage } from "@/lib/schema";

const PATH = "/guides/awaabs-law";
const TITLE = "Awaab’s Law explained: deadlines, Phase 2 and private landlords";
const UPDATED = "2026-11-01";

export const metadata = getPageMetadata(PATH);

const PHASE_TWO_HAZARDS = [
  { title: "Excess cold", text: "A complete loss of heating in colder weather can be an emergency." },
  { title: "Excess heat", text: "Overheating with no way to cool the home, such as windows that won’t open." },
  { title: "Falls", text: "On the level, on stairs and between levels: handrails, balustrades, window restrictors." },
  { title: "Structural collapse", text: "Loose or falling elements, and movement that may be active." },
  {
    title: "Fire and explosions",
    text: "Inside the home, such as broken or missing smoke alarms. Communal fire safety sits under separate law.",
  },
  {
    title: "Electrical hazards",
    text: "Exposed live parts, scorching, damaged sockets. Investigated by a qualified electrician.",
  },
  { title: "Domestic hygiene", text: "Includes pest infestation, waste storage, sanitation and food safety." },
];

const FAQS: FAQItem[] = [
  {
    question: "Does Awaab’s Law apply to private landlords?",
    answer:
      "Not yet. It applies to councils and housing associations. On 9 October 2026 the government published a consultation on extending it to private rented tenancies and to licences, which closes at 11:59pm on 18 December 2026. The proposals are questions, not law, and no start date is set.",
  },
  {
    question: "Is 30 November 2026 confirmed?",
    answer:
      "It is the date in the regulations laid before Parliament on 13 July 2026 and in the GOV.UK guidance. It depends on Parliament approving them.",
  },
  {
    question: "Do investigators need to be HHSRS-qualified?",
    answer:
      "No. They must be competent for the hazard in the landlord’s reasonable opinion, and electrical hazards need a qualified electrician. HHSRS training still helps judge risk consistently.",
  },
  {
    question: "Can an investigation be remote?",
    answer:
      "Yes, where photos or video give enough evidence. If the tenant asks for an in-person investigation, the landlord must arrange one.",
  },
  {
    question: "What if we can’t get access?",
    answer:
      "There is a defence if you used all reasonable endeavours. Record every attempt: dates, times, routes tried and offers made.",
  },
];

export default function AwaabsLawGuide() {
  return (
    <>
      <PageJsonLd path={PATH} />
      <JsonLd
        id="guide"
        data={[
          buildArticle({ path: PATH, title: TITLE, description: pageMetadata[PATH].description, dateModified: UPDATED }),
          buildFAQPage(FAQS),
        ]}
      />

      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Guides", href: "/guides" }, { label: "Awaab’s Law" }]}
        eyebrow="Guide"
        title={TITLE}
        intro={
          <>
            <p>
              Awaab’s Law sets legal deadlines for social landlords in England to investigate and fix hazards. It
              applies to social housing only.
            </p>
            <p className="text-[17px]">
              Phase 1 has covered damp and mould and all emergency hazards since 27 October 2025. Phase 2 is due to add
              seven more hazard groups on 30 November 2026, subject to Parliament approving the regulations.
            </p>
            <p className="text-sm text-muted-ink">General guidance, not legal advice.</p>
          </>
        }
      />

      <Section>
        <GuideSectionHeading eyebrow="What it is" title="What is Awaab’s Law?" />
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
          <div className="rc-prose flex flex-col gap-3.5 text-[17px] text-body">
            <p>
              Awaab’s Law is named after Awaab Ishak. He was 2 years old when he died in 2020 from a severe respiratory
              condition caused by prolonged exposure to mould in his home (
              <a href="https://www.gov.uk/government/collections/awaabs-law-in-the-social-rented-sector">GOV.UK</a>).
            </p>
            <p>
              In law it is the Hazards in Social Housing (Prescribed Requirements) (England) Regulations 2025. It turns
              “repair in a reasonable time” into fixed deadlines: investigate, tell the tenant what you found, make the
              home safe and start the longer-term fix.
            </p>
            <p>
              It applies to registered providers of social housing: councils and housing associations, including
              temporary and supported housing let on a tenancy. It is not in force for private landlords. The Renters’
              Rights Act 2025 gives the government the power to extend it, and a consultation on doing so is open until
              18 December 2026.
            </p>
          </div>
          <GuideTable
            caption="Awaab’s Law phases"
            columns={["Phase", "From", "Hazards covered"]}
            widths={["12%", "36%", "52%"]}
            minWidth={520}
            rows={[
              ["1", "27 October 2025", "Damp and mould, plus all emergency hazards"],
              [
                "2",
                "Due 30 November 2026, subject to Parliament approving the regulations laid on 13 July 2026",
                "Adds excess cold, excess heat, falls, structural collapse, fire and explosions, electrical hazards and domestic hygiene",
              ],
              ["3", "2027", "The remaining HHSRS hazards, except overcrowding"],
            ]}
          />
        </div>
      </Section>

      <Section tone="mist">
        <GuideSectionHeading
          eyebrow="The clock"
          title="Awaab’s Law deadlines, step by step"
          intro={<p>Phase 2 keeps the Phase 1 timescales. What changes is how many reports start the clock.</p>}
        />
        <GuideTable
          caption="Awaab’s Law timescales"
          columns={["Step", "Timescale", "Applies to"]}
          widths={["30%", "43%", "27%"]}
          minWidth={640}
          rows={[
            ["Investigate and make safe", "Within 24 hours of becoming aware", "Emergency hazards"],
            [
              "Investigate",
              "Within 10 working days. Day 1 is the day after you become aware",
              "Potential significant hazards",
            ],
            [
              "Written summary to the tenant",
              "Within 3 working days of the investigation concluding",
              "Significant hazard investigations",
            ],
            ["Make safe", "Within 5 working days of the investigation concluding", "Significant hazards"],
            [
              "Begin supplementary preventative work",
              "Within 5 working days of the investigation concluding; if not possible, as soon as reasonably practicable and within 12 weeks",
              "Emergency and significant hazards",
            ],
            [
              "Alternative accommodation",
              "If the home can’t be made safe in time, at the landlord’s expense",
              "Emergency and significant hazards",
            ],
          ]}
        />
        <InfoBox title="The clock starts when you become aware">
          That can be a tenant’s call, a routine inspection, an investigation into a different hazard, or a contractor.
          Systems that log the job date instead of the awareness date run late without anyone seeing it. Source: GOV.UK
          Phase 2 guidance.
        </InfoBox>
      </Section>

      <Section>
        <GuideSectionHeading
          eyebrow="Phase 2"
          title="Awaab’s Law Phase 2: seven hazard groups due 30 November 2026"
          intro={
            <p>
              Due 30 November 2026, subject to Parliament approving the regulations. Examples from the GOV.UK hazards
              guidance. Whether a case is an emergency depends on the condition, the risk and the household.
            </p>
          }
        />
        <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          {PHASE_TWO_HAZARDS.map((hazard) => (
            <TitleCard key={hazard.title} title={hazard.title}>
              {hazard.text}
            </TitleCard>
          ))}
        </div>
      </Section>

      <Section tone="mist">
        <GuideSectionHeading
          eyebrow="Private renting and licences"
          title="Awaab’s Law and private landlords: proposed, not in force"
          intro={
            <p>
              On 9 October 2026 the government published a consultation,{" "}
              <i>Extending Awaab’s Law to private rented tenancies and to licences</i> (MHCLG). It closes at 11:59pm on
              18 December 2026. Everything below is a proposal or a question, not law, and no start date is set.
            </p>
          }
        />
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-16">
          <GuideTable
            caption="What the consultation on extending Awaab’s Law proposes"
            columns={["Topic", "What the consultation proposes or asks"]}
            widths={["27%", "73%"]}
            minWidth={480}
            rows={[
              ["Hazards", "All HHSRS hazards except overcrowding"],
              [
                "Timescales",
                "Starting from the social-sector model. Options include investigating within 10 working days, a written summary within 3 working days, making a significant hazard safe within 5 working days and emergency hazards within 24 hours",
              ],
              ["Tenant breach", "Hazards caused by the tenant’s own breach proposed for exclusion"],
              [
                "Enforcement",
                "An implied tenancy term, so tenants could sue for breach. Councils keep their HHSRS powers, with penalties up to £7,000",
              ],
              [
                "Licences",
                "Supported housing, temporary accommodation for homeless households and care leaver accommodation",
              ],
            ]}
          />
          <div className="flex flex-col gap-6">
            <InfoBox title="If you place households in temporary or supported accommodation">
              The consultation asks whether accommodation let on licences should be covered. If adopted, that could
              reach accommodation you commission as well as homes you own.
            </InfoBox>
            <InfoBox title="Private landlords’ duties today">
              Repair (Landlord and Tenant Act 1985 s11), fitness for human habitation (s9A) and council enforcement under
              HHSRS still apply. <TextLink href="/landlord">For private landlords →</TextLink>
            </InfoBox>
            <p className="text-sm text-muted-ink">
              Source:{" "}
              <a
                href="https://www.gov.uk/government/consultations/extending-awaabs-law-to-private-rented-tenancies-and-to-licences"
                className="text-muted-ink underline hover:text-ink"
              >
                GOV.UK consultation
              </a>
              . General guidance, not legal advice.
            </p>
          </div>
        </div>
      </Section>

      <NavyBand
        title="Awaab’s Law investigations"
        text="We carry out documented investigations for councils and housing associations across London, by qualified and experienced surveyors, written up in time for your 3-working-day tenant summary. Tell us your expected report volumes and we’ll agree investigation capacity before the winter peak."
        actions={
          <>
            <ButtonLink href="/councils" variant="light">
              Councils and housing associations
            </ButtonLink>
            <ButtonLink
              href="/landlord"
              className="border border-muted-ink bg-transparent text-white hover:bg-navy-deep hover:text-white"
            >
              Landlords and property owners
            </ButtonLink>
          </>
        }
      />

      <Section tone="mist">
        <GuideSectionHeading
          eyebrow="Questions"
          title="About Awaab’s Law"
          intro={<p>General guidance, not legal advice.</p>}
        />
        <FaqList items={FAQS.map((faq) => ({ q: faq.question, a: <p>{faq.answer}</p> }))} />
        <p className="border-t border-line pt-[22px] text-base text-body">
          <b className="text-ink">Related guide:</b> <TextLink href="/guides/hhsrs">HHSRS explained</TextLink>
        </p>
      </Section>

      <CallbackSection formName="Awaab’s Law guide call back" />
    </>
  );
}
