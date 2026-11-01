import { ClipboardList, FileText, Search } from "lucide-react";
import { getPageMetadata } from "@/lib/page-metadata";
import PageJsonLd from "@/components/common/PageJsonLd";
import CallbackSection from "@/components/site/CallbackSection";
import {
  ButtonLink,
  FaqList,
  PageHero,
  RelatedLinks,
  Section,
  SectionHeading,
  TextLink,
  type FaqItem,
} from "@/components/site/primitives";
import { FeatureCard } from "@/components/site/landlord-services/blocks";

export const metadata = getPageMetadata("/services/housing-disrepair");

const INCLUDES = [
  {
    icon: Search,
    title: "On-site inspection",
    text: "Our qualified experts will conduct a thorough inspection of your property to identify any issues.",
  },
  {
    icon: ClipboardList,
    title: "List of defects against UK standards",
    text: "We will compile a detailed list of defects, ensuring they are measured against relevant UK standards for clarity and compliance.",
  },
  {
    icon: FileText,
    title: "Detailed report",
    text: "You will receive a comprehensive report that outlines responsibilities and includes tailored repair recommendations to address the identified defects.",
  },
];

const FAQS: FaqItem[] = [
  {
    q: "What does a housing disrepair survey include?",
    a: "An on-site inspection, a list of defects measured against relevant UK standards, and a detailed report that outlines responsibilities and includes tailored repair recommendations.",
  },
  {
    q: "Who can instruct a disrepair survey?",
    a: "Landlords, property owners and managing agents, and solicitors acting for tenants or landlords.",
  },
  {
    q: "A tenant has sent a letter of claim. What now?",
    a: "Speak to your solicitor early. The pre-action protocol gives you 20 working days to respond, and an independent disrepair survey puts the facts on record. General guidance, not legal advice.",
  },
  {
    q: "Do you provide expert reports for disrepair claims?",
    a: (
      <p>
        Yes. Where a claim is under the Pre-Action Protocol for Housing Conditions Claims or before the court,
        solicitors instruct our CPR 35 expert witness reports, which are a separate service.{" "}
        <TextLink href="/services/cpr-35-reports">CPR 35 expert witness reports →</TextLink>
      </p>
    ),
  },
  {
    q: "Does a disrepair survey cover damp and mould?",
    a: (
      <p>
        Yes, where damp or mould is part of the disrepair. If damp and mould is the main concern, the{" "}
        <TextLink href="/services/damp-mould">Damp, Mould and Condensation Survey</TextLink> may suit you better.
      </p>
    ),
  },
  {
    q: "How much does a housing disrepair survey cost?",
    a: "Each project is different, so get in touch for detailed pricing. Ask about our special rates when you call.",
  },
];

export default function HousingDisrepairPage() {
  return (
    <>
      <PageJsonLd path="/services/housing-disrepair" />

      <PageHero
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Landlords", href: "/landlord" },
          { label: "Housing disrepair surveys" },
        ]}
        eyebrow="Housing disrepair survey, London"
        title="Housing Disrepair Surveys"
        intro={
          <p>
            Is your property showing signs of wear and tear? Our qualified and experienced surveyors carry out housing
            disrepair surveys across London, inspecting properties to identify issues against UK legislation
            standards.
          </p>
        }
      />

      <Section>
        <SectionHeading
          eyebrow="Disrepair surveys"
          title="Our Housing Disrepair Survey Services"
          intro="We’ll advise you on the next steps and provide a comprehensive suite of services designed to meet your needs, including:"
        />
        <div className="grid gap-[18px] md:grid-cols-3">
          {INCLUDES.map((item) => (
            <FeatureCard key={item.title} icon={item.icon} title={item.title}>
              <p className="text-[15px] text-body">{item.text}</p>
            </FeatureCard>
          ))}
        </div>
      </Section>

      <Section tone="mist">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col items-start gap-3.5 rounded-[22px] border border-line bg-white p-7 md:p-9">
            <h2 className="text-[28px] font-extrabold leading-[1.1] md:text-[32px]">Need Guidance?</h2>
            <p className="text-[17px] text-body">
              We understand that each project is unique, so get in touch for detailed pricing.
            </p>
            <ButtonLink href="#callback" className="mt-auto">
              Get in Touch
            </ButtonLink>
          </div>
          <div className="flex flex-col items-start gap-3.5 rounded-[22px] border border-line bg-white p-7 md:p-9">
            <h2 className="text-[28px] font-extrabold leading-[1.1] md:text-[32px]">Special rates</h2>
            <p className="text-[17px] text-body">
              We even offer special rates to provide you with the best value for your investment, ensuring you receive
              top-notch service without breaking the bank. Let us help you safeguard your property and ensure it meets
              all necessary standards.
            </p>
            <ButtonLink href="/contact" variant="outline" className="mt-auto border-2 border-line-strong">
              Contact us
            </ButtonLink>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Disrepair surveys and section 11"
          title="Housing disrepair and section 11 of the Landlord and Tenant Act 1985"
          className="max-w-[900px]"
        >
          <p className="mt-0.5 text-[17px] text-body">
            Under section 11, landlords of most residential tenancies must keep the structure and exterior of the home
            in repair, and keep the installations for water, gas, electricity, sanitation, space heating and hot water
            in repair and proper working order. Section 9A adds a duty to keep the home fit for human habitation. A
            housing disrepair survey records the condition of the property against these standards, so landlords,
            tenants and their advisers can see what needs attention.
          </p>
          <p className="text-sm text-muted-ink">General guidance, not legal advice.</p>
        </SectionHeading>
      </Section>

      <Section tone="mist">
        <SectionHeading eyebrow="Questions" title="About housing disrepair surveys" />
        <FaqList items={FAQS} />
        <RelatedLinks
          links={[
            { label: "Landlords and property owners", href: "/landlord" },
            { label: "Damp, Mould and Condensation Survey", href: "/services/damp-mould" },
            { label: "HHSRS guide", href: "/guides/hhsrs" },
            { label: "CPR 35 expert witness reports", href: "/services/cpr-35-reports" },
          ]}
        />
      </Section>

      <CallbackSection formName="Housing disrepair page call back" defaultNeeds={["Housing disrepair survey"]} />
    </>
  );
}
