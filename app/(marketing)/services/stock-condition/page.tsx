import { Building, Home as HomeIcon, Leaf, PoundSterling, ShieldCheck, Users, Wrench } from "lucide-react";
import { getPageMetadata } from "@/lib/page-metadata";
import { buildFAQPage } from "@/lib/schema";
import { PHONE, PHONE_HREF } from "@/lib/constants";
import JsonLd from "@/components/common/JsonLd";
import PageJsonLd from "@/components/common/PageJsonLd";
import CallbackSection from "@/components/site/CallbackSection";
import {
  FeatureCard,
  FramedPhoto,
  NavyBand,
  type PageFaq,
  TintNote,
  toFaqList,
  toFaqSchema,
} from "@/components/site/professional/parts";
import {
  ButtonLink,
  FaqList,
  PageHero,
  RelatedLinks,
  Section,
  SectionHeading,
  TextLink,
} from "@/components/site/primitives";

export const metadata = getPageMetadata("/services/stock-condition");

const INCLUDES = [
  {
    icon: Building,
    title: "Comprehensive Property Assessments",
    text: "We conduct thorough evaluations of your housing stock, examining critical elements such as roofs, windows, heating systems and insulation. Our surveys help you identify potential issues early, so your properties remain safe and habitable.",
  },
  {
    icon: ShieldCheck,
    title: "Regulatory Compliance Assurance",
    text: "Stay ahead of regulatory requirements, including health and safety standards, building regulations and energy efficiency regulations. Our surveys help you check your properties against the necessary legal standards, giving you peace of mind. Need help with compliance on energy efficiency?",
    link: { href: "/services/epc", label: "Energy Performance Certificates (EPC) →" },
  },
  {
    icon: Wrench,
    title: "Proactive Maintenance Planning",
    text: "Using data from our surveys, you can plan and prioritise maintenance and refurbishment projects efficiently. We help you allocate your budget effectively, preventing minor issues from escalating into costly problems.",
  },
  {
    icon: HomeIcon,
    title: "Enhanced Housing Quality",
    text: "Use our insights to improve living conditions for your tenants. Whether upgrading facilities or improving energy efficiency, our surveys provide the information you need to make meaningful changes. Our housing disrepair surveys are a great way to check properties meet tenants’ needs.",
    link: { href: "/services/housing-disrepair", label: "Housing disrepair surveys →" },
  },
  {
    icon: Users,
    title: "Increased Tenant Satisfaction",
    text: "A well-maintained property fosters happier tenants. Our surveys help you create safe, secure and comfortable homes that support tenant well-being and satisfaction. Explore how we support tenants further with our residential services.",
    link: { href: "/services", label: "Residential services →" },
  },
  {
    icon: PoundSterling,
    title: "Strategic Asset Management",
    text: "Our surveys provide valuable data to inform decisions about the future of your housing stock. Whether planning renovations, sales or redevelopment, we offer the insights needed to manage your assets strategically.",
  },
  {
    icon: Leaf,
    title: "Environmental Responsibility",
    text: "Sustainability is vital in today’s world. Our surveys assess the energy performance of your properties, helping you meet government targets for reducing carbon emissions and improving energy efficiency.",
  },
];

const FAQS: PageFaq[] = [
  {
    question: "What is a stock condition survey?",
    answer:
      "A stock condition survey assesses the homes in your housing stock, examining critical elements such as roofs, windows, heating systems and insulation. The data helps you plan and prioritise maintenance, refurbishment and investment.",
  },
  {
    question: "Who are stock condition surveys for?",
    answer:
      "Local authorities and social housing providers, and other organisations responsible for a portfolio of homes.",
  },
  {
    question: "What happens during a stock condition survey?",
    answer:
      "A surveyor visits each home by appointment and assesses the main elements inside and out, such as the roof, windows, heating and insulation, recording what they find. Nothing is repaired on the day.",
  },
  {
    question: "My landlord has booked a stock condition survey. What do I need to do?",
    answer:
      "If you can, give clear access to the rooms, boiler and loft hatch, and mention any repairs or damp you’re worried about. The surveyor records it for your landlord.",
  },
  {
    question: "Does a stock condition survey cover energy efficiency?",
    answer:
      "Yes. Our surveys assess the energy performance of your properties, helping you work towards government targets for reducing carbon emissions. We also provide Energy Performance Certificates.",
    content: (
      <>
        Yes. Our surveys assess the energy performance of your properties, helping you work towards government
        targets for reducing carbon emissions. We also provide{" "}
        <TextLink href="/services/epc">Energy Performance Certificates</TextLink>.
      </>
    ),
  },
  {
    question: "How much does a stock condition survey cost?",
    answer: "Each programme is different, so get in touch to discuss your requirements and we’ll provide pricing.",
  },
];

export default function StockConditionPage() {
  return (
    <>
      <PageJsonLd path="/services/stock-condition" />
      <JsonLd data={buildFAQPage(toFaqSchema(FAQS))} id="stock-condition-faq" />

      <PageHero
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Councils and housing", href: "/councils" },
          { label: "Stock condition surveys" },
        ]}
        eyebrow="Stock condition surveys for councils and housing providers"
        title="Stock Condition Surveys"
        intro={
          <p>
            Stock condition surveys from Rosecrest Group Ltd are designed to help local authorities and social housing
            providers in London keep their properties safe, compliant and well maintained. We recognise the importance
            of upholding high standards in housing. By providing comprehensive assessments, we enable you to make
            informed decisions that enhance the quality of your housing portfolio.
          </p>
        }
        actions={<ButtonLink href="#callback">Make an enquiry</ButtonLink>}
        media={
          <FramedPhoto
            src="/assets/images/stock.png"
            alt="Red-brick residential housing block in London"
            className="md:h-[420px]"
            priority
          />
        }
      />

      <Section tone="mist">
        <SectionHeading title="Our Stock Condition Surveys Service Includes" />
        <div className="grid gap-[18px] md:grid-cols-2 lg:grid-cols-4">
          {INCLUDES.map((item) => (
            <FeatureCard key={item.title} icon={item.icon} title={item.title} text={item.text} link={item.link} />
          ))}
        </div>
      </Section>

      <NavyBand
        title="Need Guidance?"
        text="Speak to our team to discuss your specific requirements."
        actions={
          <>
            <ButtonLink href="#callback" variant="light">
              Get in Touch
            </ButtonLink>
            <a href={PHONE_HREF} className="whitespace-nowrap px-2.5 py-[15px] font-bold text-white no-underline hover:text-white">
              or call {PHONE}
            </a>
          </>
        }
      />

      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
          <div className="flex flex-col gap-3.5">
            <SectionHeading eyebrow="Why choose us" title="Why Choose Rosecrest Group Ltd?" />
            <p className="text-[17px] text-body">
              At Rosecrest Group Ltd, our expert team is dedicated to delivering comprehensive and trustworthy stock
              condition surveys. With a strong commitment to quality, we help you maintain your housing stock to the
              highest standards, supporting the longevity and sustainability of your portfolio. Trust us to provide
              the insights you need for informed decision-making and exceptional property management.
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <TintNote title="What Happens After The Survey?">
              When your property is due for renewal work, we will inform you of the planned improvements and their
              timeline.
            </TintNote>
            <div>
              <ButtonLink href="#callback">Get started now</ButtonLink>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="mist">
        <SectionHeading eyebrow="Questions" title="Stock condition survey FAQs" />
        <FaqList items={toFaqList(FAQS)} />
        <RelatedLinks
          label="Related:"
          links={[
            { label: "Councils and organisations", href: "/councils" },
            { label: "HHSRS guide", href: "/guides/hhsrs" },
            { label: "Compliance and accreditations", href: "/councils#compliance" },
          ]}
        />
      </Section>

      <CallbackSection formName="Stock condition page call back" defaultNeeds={["Stock condition survey"]} />
    </>
  );
}
