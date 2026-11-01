import Link from "next/link";
import {
  ArrowRight,
  BrickWall,
  Building2,
  Droplet,
  FileText,
  GraduationCap,
  Grid3x3,
  Home as HomeIcon,
  Leaf,
  MapPin,
  PaintRoller,
  Scale,
  SprayCan,
  Thermometer,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { getPageMetadata } from "@/lib/page-metadata";
import PageJsonLd from "@/components/common/PageJsonLd";
import CallbackSection from "@/components/site/CallbackSection";
import { ButtonLink, IconTile, PageHero, Section, SectionHeading } from "@/components/site/primitives";

export const metadata = getPageMetadata("/services");

type ServiceCardData = {
  href: string;
  icon: LucideIcon;
  title: string;
  text: string;
  price?: string;
};

const SURVEY_SERVICES: ServiceCardData[] = [
  {
    href: "/homebuyer",
    icon: HomeIcon,
    title: "RICS Level 1, 2 and 3 surveys",
    text: "Level 1 Condition Report, Level 2 Homebuyer Survey and Level 3 Building Survey, to help you make an informed decision before you purchase a property.",
    price: "from £313.99",
  },
  {
    href: "/services/damp-mould",
    icon: Droplet,
    title: "Damp, Mould and Condensation Survey",
    text: "Fast-track inspection and a written report on observed conditions and contributing factors, with mould treatment where appropriate.",
    price: "£450 fixed price",
  },
  {
    href: "/services/housing-disrepair",
    icon: FileText,
    title: "Housing disrepair surveys",
    text: "On-site inspection and a list of defects against UK standards.",
  },
  {
    href: "/services/cpr-35-reports",
    icon: Scale,
    title: "CPR 35 expert witness reports",
    text: "Expert witness inspections and building reports prepared in accordance with CPR Part 35.",
  },
  {
    href: "/services/party-wall",
    icon: BrickWall,
    title: "Party wall surveys",
    text: "Notices, awards and advice under the Party Wall etc. Act 1996, with a free notice generator.",
  },
  {
    href: "/services/stock-condition",
    icon: Building2,
    title: "Stock condition surveys",
    text: "For local authorities and social housing providers, to keep homes safe, compliant and well maintained.",
  },
  {
    href: "/services/thermographic-surveys",
    icon: Thermometer,
    title: "Thermographic surveys",
    text: "Surveyor-led thermal-imaging surveys with professional interpretation and a written report.",
    price: "from £325 incl. VAT",
  },
  {
    href: "/services/epc",
    icon: Leaf,
    title: "Energy Performance Certificates",
    text: "Residential and commercial EPCs for selling or renting.",
    price: "from £33",
  },
  {
    href: "/services/environmental-reports",
    icon: MapPin,
    title: "Environmental reports",
    text: "Contaminated land, flood risk, ground stability and radon exposure.",
  },
  {
    href: "/services/assocrics-mentoring",
    icon: GraduationCap,
    title: "AssocRICS mentoring",
    text: "Structured mentoring and counsellor support for candidates working towards Associate membership of RICS.",
  },
];

const TRADE_SERVICES: ServiceCardData[] = [
  {
    href: "/services/carpentry",
    icon: Wrench,
    title: "Carpentry",
    text: "Wooden floor installation, bespoke woodwork and fitting.",
  },
  {
    href: "/services/carpet-cleaning",
    icon: SprayCan,
    title: "Carpet cleaning",
    text: "Deep cleaning, stain and odour removal.",
  },
  {
    href: "/services/deep-cleaning",
    icon: SprayCan,
    title: "Deep cleaning",
    text: "Specialist, biohazard and deep cleaning.",
  },
  {
    href: "/services/handyman",
    icon: Wrench,
    title: "Handyman",
    text: "Repairs, installations and general maintenance.",
  },
  {
    href: "/services/house-clearance",
    icon: HomeIcon,
    title: "House clearance",
    text: "Full, estate and item removal.",
  },
  {
    href: "/services/painting-decorating",
    icon: PaintRoller,
    title: "Painting and decorating",
    text: "Interior painting and decorating, from colour choice to the final coat.",
  },
  {
    href: "/services/plastering",
    icon: BrickWall,
    title: "Plastering",
    text: "Skimming, repairs and new installations.",
  },
  {
    href: "/services/plumbing",
    icon: Droplet,
    title: "Plumbing",
    text: "Repairs, installations and maintenance.",
  },
  {
    href: "/services/tiling",
    icon: Grid3x3,
    title: "Tiling",
    text: "Floor, wall and bathroom tiling.",
  },
];

function ServiceGrid({ items }: { items: ServiceCardData[] }) {
  return (
    <ul className="m-0 grid list-none gap-[18px] p-0 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((service) => (
        <li key={service.href} className="flex">
          <Link
            href={service.href}
            className="group flex w-full flex-col gap-2.5 rounded-[18px] border border-line bg-white p-6 text-ink no-underline transition-colors hover:border-teal hover:text-ink"
          >
            <IconTile>
              <service.icon className="h-6 w-6" strokeWidth={2} />
            </IconTile>
            <h3 className="text-xl font-bold leading-[1.25]">{service.title}</h3>
            <p className="text-[15px] text-body">{service.text}</p>
            {service.price && <p className="text-[15px] font-bold text-ink">{service.price}</p>}
            <span className="mt-auto flex items-center gap-2 pt-1 text-[15px] font-bold text-teal group-hover:text-teal-dark">
              View service
              <ArrowRight aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function ServicesPage() {
  return (
    <>
      <PageJsonLd path="/services" />

      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
        eyebrow="Property surveys and trade services in London and the M25"
        title="Our Comprehensive Services"
        intro={
          <>
            <p className="max-w-[700px]">
              Explore our professional surveying and specialist trade services, designed to give you clarity and
              confidence in your property decisions.
            </p>
            <p className="max-w-[700px] text-[17px]">
              RICS-regulated surveys, inspections and reports, plus practical trade services, across London and areas
              within the M25.
            </p>
          </>
        }
        actions={
          <>
            <ButtonLink href="#survey-services">Survey services</ButtonLink>
            <ButtonLink href="#trade-services" variant="outline" className="border-2 border-line-strong">
              Trade services
            </ButtonLink>
          </>
        }
      />

      <Section id="survey-services">
        <SectionHeading
          eyebrow="Survey services"
          title="Survey services"
          intro="Inspections, surveys and professional reports from RICS-regulated surveyors."
        />
        <ServiceGrid items={SURVEY_SERVICES} />
      </Section>

      <Section id="trade-services" tone="mist">
        <SectionHeading
          eyebrow="Trade services"
          title="Trade services"
          intro="Practical repairs, cleaning, maintenance and property preparation across London and the M25."
        />
        <ServiceGrid items={TRADE_SERVICES} />
      </Section>

      <CallbackSection formName="Services page call back" />
    </>
  );
}
