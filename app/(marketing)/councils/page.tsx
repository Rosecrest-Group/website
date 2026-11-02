import {
  Building,
  Droplet,
  FileText,
  Home as HomeIcon,
  Scale,
  Search,
  ShieldCheck,
  TriangleAlert,
  Users,
  Wrench,
} from "lucide-react";
import { getPageMetadata } from "@/lib/page-metadata";
import { buildFAQPage } from "@/lib/schema";
import { EMAIL_HREF, PHONE, PHONE_HREF } from "@/lib/constants";
import JsonLd from "@/components/common/JsonLd";
import PageJsonLd from "@/components/common/PageJsonLd";
import CallbackSection from "@/components/site/CallbackSection";
import {
  BadgeTile,
  FeatureCard,
  FramedPhoto,
  HeroPills,
  NavyBand,
  type PageFaq,
  TintNote,
  toFaqList,
  toFaqSchema,
} from "@/components/site/professional/parts";
import {
  ButtonLink,
  buttonClass,
  CheckList,
  FaqList,
  NoteStrip,
  PageHero,
  Section,
  SectionHeading,
  SmartLink,
  TextLink,
} from "@/components/site/primitives";
import { cn } from "@/lib/utils";

export const metadata = getPageMetadata("/councils");

const CASE_STUDIES = [
  {
    title:
      "Delivering Complex Damp & Mould Remediation and Kitchen/Bathroom Upgrades Within Local Authority Basket Rates",
    rows: [
      ["Client", "Local Authority Housing Department"],
      ["Properties", "Multiple occupied residential dwellings"],
      ["Services Provided", "Damp & mould investigation, kitchen/bathroom replacement, ventilation upgrades"],
      ["Key Outcome", "Resolution of disrepair complaints and 99.9% tenant satisfaction"],
    ],
  },
  // The district council stock condition case study (1,200 council-owned homes) was removed
  // in November 2026: Rosecrest has not verified it. Reinstate only once Venesha confirms the
  // project and the client's permission to publish it.
  {
    title: "Fire Safety & Building Compliance Review Across High-Rise Portfolio",
    rows: [
      ["Client", "Social Housing Provider"],
      ["Properties", "28 high-rise residential blocks"],
      ["Services Provided", "Fire risk assessments, building safety evaluations, remediation prioritisation"],
      ["Key Outcome", "Full compliance with updated regulatory guidance and clear action plan for resident safety"],
    ],
  },
];

const EXPERTISE = [
  {
    icon: Droplet,
    title: "Damp & mould investigations",
    text: "Independent assessment of damp and mould conditions with contributing factor analysis",
    link: { href: "/services/damp-mould", label: "Damp and mould surveys →" },
  },
  {
    icon: FileText,
    title: "Housing condition reporting",
    text: "Detailed property condition assessments aligned with housing standards",
  },
  {
    icon: TriangleAlert,
    title: "Compliance assessments",
    text: "HHSRS and regulatory compliance inspections",
    link: { href: "/guides/hhsrs", label: "HHSRS guide →" },
  },
  {
    icon: Users,
    title: "Tenant complaint support",
    text: "Independent reporting supporting complaint resolution and dispute management.",
  },
];

const COMPLIANCE_POINTS = [
  "Governance aligned reporting",
  "Independent inspections",
  "Risk-aware documentation",
  "Clear scope definition",
];

const COMPLIANCE_PACK: { title: string; text: React.ReactNode }[] = [
  { title: "RICS-regulated firm", text: "Registered for regulation by RICS." },
  { title: "Constructionline Gold", text: "Pre-qualified for public sector buyers." },
  { title: "SafeContractor approved", text: "Health and safety accreditation through Alcumus." },
  { title: "Professional indemnity", text: "Professional indemnity insurance in place." },
  {
    title: "Public and employer’s liability",
    text: "Public liability and employer’s liability insurance in place.",
  },
  { title: "RAMS", text: "Risk assessments and method statements issued before we attend." },
  { title: "Policies", text: "Health and safety, data protection (UK GDPR), environmental, equality." },
  { title: "Memberships", text: "Recognised industry organisations, including IPWS, CABE and RPSA." },
  {
    title: "Complaints and redress",
    text: (
      <>
        Published <TextLink href="/complaints-procedure">complaints procedure</TextLink>, with escalation to our
        independent redress provider, CEDR.
      </>
    ),
  },
];

const ASSET_SUPPORT = [
  {
    icon: Building,
    title: "Portfolio inspections",
    text: "Coordinated inspection programmes across multiple properties using consistent methodology and reporting standards.",
  },
  {
    icon: HomeIcon,
    title: "Stock condition surveys",
    text: "Systematic assessment of housing stock condition to inform maintenance and investment planning.",
    link: { href: "/services/stock-condition", label: "Stock condition surveys →" },
  },
  {
    icon: Wrench,
    title: "Programme support",
    text: "Technical consultancy supporting housing improvement programmes and capital works planning.",
  },
];

const LEGAL_SUPPORT = [
  {
    icon: Scale,
    title: "Expert witness reporting",
    text: "Professional expert witness services for property-related legal matters.",
  },
  {
    icon: FileText,
    title: "CPR-35 experience",
    text: "Expert reporting aligned with Civil Procedure Rules Part 35.",
    link: { href: "/services/cpr-35-reports", label: "CPR 35 expert reports →" },
  },
  {
    icon: Search,
    title: "Independent expert advice",
    text: "Professional opinion and technical consultancy on building condition and defects.",
  },
];

const FAQS: PageFaq[] = [
  {
    question: "Does Awaab’s Law apply to councils and housing associations?",
    answer:
      "Yes. It applies to social landlords, and has covered damp and mould and all emergency hazards since 27 October 2025. Phase 2 is due on 30 November 2026, subject to Parliament.",
    content: (
      <>
        Yes. It applies to social landlords, and has covered damp and mould and all emergency hazards since 27
        October 2025. Phase 2 is due on 30 November 2026, subject to Parliament.{" "}
        <TextLink href="/guides/awaabs-law">Awaab’s Law explained →</TextLink>
      </>
    ),
  },
  {
    question: "Do you carry out HHSRS inspections?",
    answer: "Yes. HHSRS and regulatory compliance inspections, with clear reporting on the hazards found.",
    content: (
      <>
        Yes. HHSRS and regulatory compliance inspections, with clear reporting on the hazards found.{" "}
        <TextLink href="/guides/hhsrs">HHSRS guide →</TextLink>
      </>
    ),
  },
  {
    question: "Can you survey a whole housing portfolio?",
    answer:
      "Yes. Coordinated inspection programmes and stock condition surveys across multiple properties, using a consistent methodology and reporting standard.",
    content: (
      <>
        Yes. Coordinated inspection programmes and stock condition surveys across multiple properties, using a
        consistent methodology and reporting standard.{" "}
        <TextLink href="/services/stock-condition">Stock condition surveys →</TextLink>
      </>
    ),
  },
  {
    question: "Do you provide insurance and accreditation documents for procurement?",
    answer:
      "Yes. We hold RICS regulation, Constructionline Gold and SafeContractor approval, with professional indemnity insurance in place. Our compliance pack has copies of the certificates, insurance schedules, RAMS summary and policies in one PDF.",
    content: (
      <>
        Yes. We hold RICS regulation, Constructionline Gold and SafeContractor approval, with professional indemnity
        insurance in place. Our compliance pack has copies of the certificates, insurance schedules, RAMS summary and
        policies in one PDF. <TextLink href="#compliance">Compliance documents →</TextLink>
      </>
    ),
  },
  {
    question: "What does it mean to be a RICS-regulated firm?",
    answer:
      "A RICS-regulated firm is registered for regulation by RICS and must follow its rules of conduct for firms, which include having a complaints handling procedure and appropriate professional indemnity insurance.",
  },
  {
    question: "How do we raise a complaint?",
    answer:
      "Follow our published complaints procedure. If you are not satisfied with our final response, you can refer the matter to our independent redress provider, CEDR.",
    content: (
      <>
        Follow our <TextLink href="/complaints-procedure">published complaints procedure</TextLink>. If you are not
        satisfied with our final response, you can refer the matter to our independent redress provider, CEDR.
      </>
    ),
  },
];

export default function CouncilsPage() {
  return (
    <>
      <PageJsonLd path="/councils" />
      <JsonLd data={buildFAQPage(toFaqSchema(FAQS))} id="councils-faq" />

      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Councils and organisations" }]}
        eyebrow="Surveys, HHSRS and Awaab’s Law support for councils and housing associations"
        title="Inspection, Reporting & Remediation Services for Councils"
        intro={
          <>
            <p>
              Independent inspections, compliance assessments and remedial services supporting councils, housing
              associations and public sector organisations.
            </p>
            <p className="text-[17px]">
              Rosecrest supports councils, housing associations and other public bodies with building inspections,
              condition reporting and specialist consultancy. Our work assists with tenant complaints, regulatory
              obligations and asset management within established procurement and governance frameworks, across
              London and areas within the M25.
            </p>
          </>
        }
        media={
          <FramedPhoto
            src="/assets/images/storey.png"
            alt="Council-owned high-rise residential block"
            className="md:h-[460px]"
            crop={1.35}
            origin="50% 35%"
            priority
          />
        }
      >
        <HeroPills items={["RICS Regulated", "Professional Indemnity Insured", "Procurement & Governance Aligned"]} />
        <div className="flex flex-wrap items-center gap-3.5">
          <ButtonLink href="#callback">Discuss your requirements</ButtonLink>
          <ButtonLink href="#compliance" variant="outline" className="border-2 border-line-strong">
            Compliance documents
          </ButtonLink>
        </div>
      </PageHero>

      <Section>
        <SectionHeading
          eyebrow="Case studies"
          title="Project Examples"
          intro="Examples of inspection, reporting and consultancy work delivered for our councils, housing organisations and public sector clients"
        />
        <div className="grid gap-[18px] md:grid-cols-2 lg:grid-cols-3">
          {CASE_STUDIES.map((study) => (
            <article
              key={study.title}
              className="flex flex-col gap-3 rounded-[18px] border border-line bg-white p-[26px]"
            >
              <h3 className="font-display text-xl font-bold leading-[1.3]">{study.title}</h3>
              <span className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-teal">
                Project Snapshot
              </span>
              <dl className="m-0 flex flex-col gap-3">
                {study.rows.map(([label, value]) => (
                  <div key={label} className="flex flex-col gap-0.5 border-t border-line pt-2.5">
                    <dt className="text-[13px] font-bold uppercase tracking-[0.04em] text-muted-ink">{label}</dt>
                    <dd className="m-0 text-[15px] text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
        <p className="text-center text-[17px] font-bold text-body">
          Trusted by councils, housing associations and public sector organisations
        </p>
      </Section>

      <Section tone="mist">
        <SectionHeading
          eyebrow="Damp and mould surveys for social housing"
          title="Housing Standards & Damp / Mould Expertise"
          intro="We support councils and housing providers investigating damp, mould and housing condition issues through independent inspections and structured reporting."
        />
        <div className="grid gap-[18px] md:grid-cols-2 lg:grid-cols-4">
          {EXPERTISE.map((item) => (
            <FeatureCard key={item.title} icon={item.icon} title={item.title} text={item.text} link={item.link} />
          ))}
        </div>
        <TintNote title="Awaab’s Law investigations for social landlords">
          Awaab’s Law applies to social landlords: councils and housing associations. Phase 1 has covered damp and
          mould and all emergency hazards since 27 October 2025. Phase 2 is due to add further hazard groups on 30
          November 2026, subject to Parliament approving the regulations. We carry out documented investigations to
          support your timescales. <TextLink href="/guides/awaabs-law">Awaab’s Law guide →</TextLink>
        </TintNote>
        <TextLink href="/services/damp-mould" className="self-start">
          View Damp &amp; Mould Service →
        </TextLink>
      </Section>

      <Section id="compliance">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
          <div className="flex flex-col gap-6">
            <SectionHeading
              eyebrow="Compliance and risk"
              title="Supporting Compliance And Risk Management"
              intro="Our reporting and inspection services help organisations demonstrate due diligence, maintain governance standards and manage housing risks effectively"
            />
            <CheckList items={COMPLIANCE_POINTS} className="grid gap-x-8 gap-y-3.5 sm:grid-cols-2" />
          </div>
          <FramedPhoto
            src="/assets/images/terraces.png"
            alt="Social housing blocks on a city street"
            className="md:h-[380px]"
            crop={1.3}
            origin="50% 40%"
          />
        </div>
        <div className="grid items-start gap-8 rounded-[22px] border border-line bg-mist p-6 md:p-8 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)] lg:gap-10">
          <div className="flex flex-col gap-5">
            <h3 className="text-[24px] font-extrabold leading-[1.15] md:text-[26px]">
              Accreditations and compliance pack
            </h3>
            <dl className="m-0 grid gap-x-8 gap-y-[18px] sm:grid-cols-2">
              {COMPLIANCE_PACK.map((item) => (
                <div key={item.title} className="flex flex-col gap-1">
                  <dt className="text-base font-bold text-ink">{item.title}</dt>
                  <dd className="m-0 text-[15px] text-body">{item.text}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-col gap-3.5 rounded-[18px] bg-white p-[26px] shadow-pop">
            <b className="font-display text-[21px] leading-[1.25]">Get the compliance pack</b>
            <p className="text-[15px] text-body">
              Certificates, insurance schedules, RAMS summary and policy statements in one PDF, sent by email, for
              supplier onboarding, tenders and frameworks.
            </p>
            <SmartLink
              href={`${EMAIL_HREF}?subject=Compliance%20pack%20request`}
              className={cn(buttonClass("primary"), "whitespace-normal text-center")}
            >
              Request the compliance pack
            </SmartLink>
          </div>
        </div>
      </Section>

      <Section tone="mist">
        <SectionHeading
          eyebrow="Stock condition surveys and asset management"
          title="Housing Stock and Asset Support"
          intro="Examples of inspection, reporting and consultancy work delivered for our councils, housing organisations and public sector clients"
        />
        <div className="grid gap-[18px] md:grid-cols-3">
          {ASSET_SUPPORT.map((item) => (
            <FeatureCard key={item.title} icon={item.icon} title={item.title} text={item.text} link={item.link} />
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Expert witness support"
          title="Legal and Expert Support"
          intro="We support councils and housing organisations involved in disputes, investigations and legal proceedings"
        />
        <div className="grid gap-[18px] md:grid-cols-3">
          {LEGAL_SUPPORT.map((item) => (
            <FeatureCard key={item.title} icon={item.icon} title={item.title} text={item.text} link={item.link} />
          ))}
        </div>
      </Section>

      <Section tone="mist">
        <SectionHeading eyebrow="Accreditations" title="Professional Standards and Governance" />
        <div className="grid grid-cols-2 gap-[18px] md:grid-cols-3 lg:grid-cols-5">
          <BadgeTile
            label="RICS Regulated"
            logo={{ src: "/assets/brands/rics.svg", alt: "Regulated by RICS", width: 87, height: 34 }}
          />
          <BadgeTile label="CPR-35 Experience" icon={FileText} />
          <BadgeTile
            label="Constructionline Gold"
            logo={{
              src: "/assets/brands/constructionline.svg",
              alt: "Constructionline Gold Member",
              width: 83,
              height: 44,
            }}
          />
          <BadgeTile
            label="SafeContractor Accredited"
            logo={{
              src: "/assets/brands/safecontractor.svg",
              alt: "Alcumus SafeContractor",
              width: 200,
              height: 32,
              className: "h-9 max-w-full",
            }}
          />
          <BadgeTile label="Professional Indemnity Insured" icon={ShieldCheck} />
        </div>
        <TextLink href="#compliance" className="self-start text-[15px]">
          Get the compliance pack →
        </TextLink>
      </Section>

      <Section>
        <SectionHeading eyebrow="Questions" title="What procurement teams ask" />
        <FaqList items={toFaqList(FAQS)} />
      </Section>

      <NavyBand
        title="Discuss your requirements"
        text="We welcome the opportunity to discuss how our services can support your organisation’s property inspection and compliance requirements."
        actions={
          <>
            <ButtonLink href="#callback" variant="light">
              Submit an enquiry
            </ButtonLink>
            <a
              href={PHONE_HREF}
              className="whitespace-nowrap font-display text-2xl font-extrabold text-white no-underline hover:text-white"
            >
              {PHONE}
            </a>
          </>
        }
      />

      <NoteStrip>
        Looking for a different service? <TextLink href="/services">View all property services</TextLink>
      </NoteStrip>

      <CallbackSection formName="Councils page call back" />
    </>
  );
}
