import { BrickWall, Camera, Flame, Grid2x2, House, Layers, Lightbulb, Ruler, Wind } from "lucide-react";
import { getPageMetadata } from "@/lib/page-metadata";
import PageJsonLd from "@/components/common/PageJsonLd";
import CallbackSection from "@/components/site/CallbackSection";
import {
  ButtonLink,
  CheckList,
  Eyebrow,
  FaqList,
  RelatedLinks,
  PageHero,
  Section,
  SectionHeading,
  StepNumber,
  type FaqItem,
} from "@/components/site/primitives";
import {
  BandPhone,
  CallLink,
  FeatureCard,
  FramedImage,
  NavyBand,
  PriceCard,
} from "@/components/site/landlord-services/blocks";

export const metadata = getPageMetadata("/services/epc");

const FACTORS = [
  { icon: Ruler, title: "Property Size", text: "The overall dimensions and layout of the property." },
  { icon: Layers, title: "Insulation", text: "The type and extent of insulation present." },
  { icon: BrickWall, title: "Construction Type", text: "The materials and methods used in the property’s construction." },
  { icon: Lightbulb, title: "Lighting", text: "The types of lighting fixtures and their efficiency." },
  { icon: Flame, title: "Heating Systems", text: "The heating systems installed and their control mechanisms." },
  { icon: Wind, title: "Ventilation", text: "The effectiveness of the property’s ventilation system." },
];

const CHECKS = [
  {
    icon: Lightbulb,
    title: "Lighting",
    text: "The assessor will examine the number of fixed light fittings in the property and assess the types of lightbulbs used, including low-energy options such as CFLs, LEDs and standard fluorescent tubes.",
  },
  {
    icon: House,
    title: "Loft",
    text: "The assessor will examine the loft space, which may not require entry but should be accessible to assess the level and placement of insulation. Currently, the recommended insulation depth is 270mm at the joists. The assessor will also investigate the type of wall separating your property from neighbouring ones.",
  },
  {
    icon: Grid2x2,
    title: "Windows",
    text: "The assessor will evaluate the property’s windows to determine whether they are single, double or triple glazed, as this significantly affects energy efficiency. They will also check the installation date of the glazing. If available, BFRC data or a FENSA certificate can serve as helpful evidence.",
  },
  {
    icon: Flame,
    title: "Heating",
    text: "The assessor will examine the property’s heating system, so having your boiler documentation ready can be beneficial. They will review heat controls, boiler timing, thermostats, thermostatic radiator valves and any additional heating sources, such as coal or gas coal-effect fires and log burners.",
  },
  {
    icon: Camera,
    title: "Photos and Measurements",
    text: "The EPC assessor will take photographs and measurements of the interior and exterior of the property. These images are essential for quality assurance, as assessors undergo regular audits. They will also measure the property and create a sketch of the layout.",
  },
];

const CERTIFICATE_SECTIONS = [
  {
    title: "Property Information",
    text: "Details about the property, the assessment date, a reference number and average energy costs for similar property types.",
  },
  {
    title: "Energy Rating",
    text: "The A to G energy efficiency rating and the environmental impact (CO2) rating, which indicate the property’s energy performance.",
  },
  {
    title: "Recommendations",
    text: "Actionable suggestions for improving the building’s energy efficiency, along with information on eligibility for assistance through the Green Deal.",
  },
  {
    title: "Summary of Features",
    text: "A summary of the property’s features and their corresponding energy ratings based on U-values.",
  },
];

const RETROFIT_STEPS = [
  {
    title: "Initial Consultation",
    text: "Discussing your vision and requirements and identifying potential areas for energy efficiency improvements.",
  },
  {
    title: "Home Assessment",
    text: "A comprehensive inspection of your current home setup and an evaluation of insulation, heating, cooling and other systems.",
  },
  {
    title: "Customised Plan Development",
    text: "A retrofit plan tailored to your home, recommending energy-efficient solutions that match your budget.",
  },
  {
    title: "Execution",
    text: "Implementing the retrofit solutions with minimal disruption, using the latest tools and techniques for precision, sustainability and durability.",
  },
  {
    title: "Final Review & Handover",
    text: "Assessing the improvements to ensure they meet our quality standards, with guidance on maintaining and getting the most from your new systems.",
  },
];

const FAQS: FaqItem[] = [
  {
    q: "How long is an EPC valid for?",
    a: "10 years. If you make significant improvements, such as new heating or insulation, a new EPC will show the better rating.",
  },
  {
    q: "Do landlords need an EPC before letting?",
    a: "Yes. A valid EPC must be in place before a rental property is marketed, and tenants must be given a copy. Rented homes must also meet the minimum energy efficiency standard, currently a rating of E or above unless a valid exemption is registered. General guidance, not legal advice.",
  },
  {
    q: "How quickly can I get an EPC?",
    a: "Fast turnaround is available. Tell us when you need it and we’ll confirm the earliest appointment.",
  },
  {
    q: "Do you provide commercial EPCs in London?",
    a: "Yes. We assess non-domestic properties, issue the certificate and advise on improving the energy rating.",
  },
  {
    q: "How much is an EPC for a rental property?",
    a: "Residential EPCs will start from £33. Get in touch for commercial EPC pricing.",
  },
  {
    q: "Can I check whether a property already has an EPC?",
    a: "Yes. EPCs are lodged on the government’s register, which you can search by postcode on GOV.UK.",
  },
];

export default function EpcPage() {
  return (
    <>
      <PageJsonLd path="/services/epc" />

      <PageHero
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Landlords", href: "/landlord" },
          { label: "Energy Performance Certificates" },
        ]}
        eyebrow="EPC London"
        title="Energy Performance Certificate (EPC)"
        intro={
          <>
            <p className="font-display text-2xl font-extrabold text-teal">Residential EPCs will start from £33</p>
            <p>
              Selling, renting, or simply curious about your home’s energy efficiency? We provide energy performance
              certificates in London for homes, rental properties and commercial premises.
            </p>
          </>
        }
        actions={
          <>
            <ButtonLink href="/request-inspection">Make an enquiry</ButtonLink>
            <CallLink />
          </>
        }
        media={
          <PriceCard
            label="Residential EPC"
            price="from £33"
            note="Domestic and commercial EPCs across London."
            items={["Valid for 10 years", "Fast turnaround available", "Generally non-disruptive"]}
            action={<ButtonLink href="/request-inspection">Make an enquiry</ButtonLink>}
          />
        }
      >
        <p className="text-[17px] font-semibold text-ink">We offer legally required EPCs, which include:</p>
        <CheckList
          items={["Detailed property inspection", "Accurate measurements", "Full report and certificate issuance"]}
        />
      </PageHero>

      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
          <div className="flex flex-col gap-4">
            <Eyebrow>What is an EPC?</Eyebrow>
            <h2 className="text-[30px] font-extrabold leading-[1.08] md:text-[40px]">
              How an Energy Performance Certificate is Conducted
            </h2>
            <p className="text-[17px] text-body">
              When renting or buying a property, either commercial or domestic, you should receive an Energy
              Performance Certificate (EPC). This certificate is the result of an assessment by a professional,
              indicating the energy efficiency of the property. It’s essential for landlords, renters, buyers and
              sellers to provide an EPC whenever the property changes hands.
            </p>
            <div>
              <ButtonLink href="/request-inspection">Make an enquiry</ButtonLink>
            </div>
          </div>
          <FramedImage
            src="/assets/images/epc.png"
            alt="Energy assessor working through a property plan beside model houses"
            width={1078}
            height={1096}
            className="max-w-[440px]"
          />
        </div>
      </Section>

      <Section tone="mist">
        <SectionHeading
          eyebrow="EPC assessment"
          title="The Domestic EPC Assessment Process"
          intro="During a domestic EPC assessment, the assessor evaluates various factors that influence the property’s energy efficiency, resulting in an ‘energy rating’. To conduct a thorough assessment, the assessor will need access to all areas of the property."
        >
          <p className="text-[17px] text-body">Some of the factors assessed during the EPC evaluation include:</p>
        </SectionHeading>
        <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
          {FACTORS.map((item) => (
            <FeatureCard key={item.title} icon={item.icon} title={item.title}>
              <p className="text-[15px] text-body">{item.text}</p>
            </FeatureCard>
          ))}
        </div>
        <p className="max-w-[900px] text-lg text-body">
          Based on this information, the energy efficiency of the property is rated from A to G, with ‘A’
          representing the highest efficiency and ‘G’ the lowest.
        </p>
      </Section>

      <Section>
        <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] text-teal">What the assessor checks</h2>
        <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
          {CHECKS.map((item) => (
            <FeatureCard key={item.title} icon={item.icon} title={item.title}>
              <p className="text-[15px] text-body">{item.text}</p>
            </FeatureCard>
          ))}
        </div>
        <p className="max-w-[900px] text-[17px] text-body">
          The assessor may also ask you questions about the construction of the property, including its age, any
          modifications made, the presence of cavity wall insulation, heat recovery technology and whether you have a
          single or double electricity meter.
        </p>
      </Section>

      <Section tone="mist">
        <SectionHeading
          eyebrow="Your certificate"
          title="After the Assessment"
          intro="Once the assessment is complete, you will receive your Energy Performance Certificate (EPC), which consists of four key sections:"
        />
        <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          {CERTIFICATE_SECTIONS.map((item) => (
            <FeatureCard key={item.title} title={item.title}>
              <p className="text-[15px] text-body">{item.text}</p>
            </FeatureCard>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-3.5">
            <Eyebrow>On the day</Eyebrow>
            <h2 className="text-[28px] font-extrabold leading-[1.1] md:text-[36px]">Duration of the Assessment</h2>
            <p className="text-[17px] text-body">
              The duration of the assessment will vary based on the property’s size and the assessor’s ability to
              access all areas. While the EPC process is thorough, it is generally non-disruptive if access to all
              parts of the property is straightforward. Besides being a legal requirement for selling or renting, an
              EPC is a valuable tool for improving energy efficiency.
            </p>
          </div>
          <div className="flex flex-col gap-3.5">
            <Eyebrow>Non-domestic EPC</Eyebrow>
            <h2 className="text-[28px] font-extrabold leading-[1.1] md:text-[36px]">Commercial EPCs in London</h2>
            <p className="text-[17px] text-body">
              Energy Performance Certificates (EPCs) are vital for non-domestic properties. At Rosecrest Group Ltd, we
              provide comprehensive EPC services tailored for commercial properties. Our experts will assess your
              property’s energy efficiency, issue the necessary certificate and offer valuable insights on improving
              your energy rating, ensuring compliance while promoting sustainability.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="mist">
        <SectionHeading
          eyebrow="Domestic retrofit"
          title="Domestic Retrofit"
          intro="Recognising the importance of upgrading homes for enhanced energy efficiency, our domestic retrofit services are designed to improve your living space and reduce your carbon footprint. From insulation to the installation of modern energy-efficient systems, our professional team will transform your home into a more environmentally friendly and cost-effective space."
        />
        <div className="flex flex-col gap-1.5">
          <h3 className="text-[22px] font-bold">Step-by-step process:</h3>
          <p className="text-base text-body">
            A structured approach ensuring clarity, independence and professional standards throughout.
          </p>
        </div>
        <ol className="m-0 grid list-none gap-7 p-0 sm:grid-cols-2 lg:grid-cols-5">
          {RETROFIT_STEPS.map((step, i) => (
            <li key={step.title} className="flex flex-col gap-2.5">
              <StepNumber n={i + 1} />
              <h4 className="font-body text-lg font-bold tracking-normal">{step.title}</h4>
              <p className="text-[15px] text-body">{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <NavyBand
        title="Residential EPCs will start from £33"
        text="Choose Rosecrest Group Ltd for a holistic approach to building and property solutions, where quality and client satisfaction are our top priorities."
        actions={
          <>
            <ButtonLink href="/request-inspection" variant="light">
              Get started now
            </ButtonLink>
            <BandPhone />
          </>
        }
      />

      <Section>
        <SectionHeading
          eyebrow="Questions"
          title="Frequently asked questions"
          intro="Here are answers to the most common questions about Energy Performance Certificates."
        />
        <FaqList items={FAQS} />
        <RelatedLinks
          links={[
            { label: "Landlords and property owners", href: "/landlord" },
            { label: "Thermographic surveys", href: "/services/thermographic-surveys" },
          ]}
        />
      </Section>

      <CallbackSection
        formName="EPC page call back"
        defaultNeeds={["Energy Performance Certificate (EPC)"]}
      />
    </>
  );
}
