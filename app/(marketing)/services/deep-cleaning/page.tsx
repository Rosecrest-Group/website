import { getPageMetadata } from "@/lib/page-metadata";
import PageJsonLd from "@/components/common/PageJsonLd";
import TradePage, { type TradeContent } from "@/components/site/trades/TradePage";

export const metadata = getPageMetadata("/services/deep-cleaning");

const content: TradeContent = {
  name: "Deep cleaning",
  formName: "Deep cleaning page call back",
  hero: {
    eyebrow: "Deep cleaning services in London",
    title: "Deep Cleaning Services in London",
    intro: [
      "Are you in need of deep cleaning or specialist cleaning services in London and the surrounding areas? Look no further than Rosecrest.",
      "With extensive experience, unmatched expertise and a strong commitment to customer service, we take pride in being one of the leading providers of specialist, biohazard and deep cleaning services across London and the M25. Let us help you maintain a clean and safe environment tailored to your needs.",
    ],
    photo: {
      src: "/assets/images/deep-cleaning.png",
      alt: "Cleaning team vacuuming and cleaning an office in London",
      width: 539,
      height: 548,
      framed: true,
    },
  },
  services: {
    eyebrow: "Cleaning services",
    title: "Comprehensive Range of Cleaning Services",
    intro:
      "At Rosecrest, we offer a comprehensive range of cleaning services designed to meet the various needs of our clients.",
    columns: 2,
    items: [
      {
        title: "Deep Cleaning",
        body: "Our expert team specialises in deep cleaning, ensuring every corner of your property is thoroughly sanitised and restored to a pristine condition.",
      },
      {
        title: "Biohazard Cleaning",
        body: "We also provide biohazard cleaning, expertly handling hazardous materials to create a safe environment for your home or business.",
      },
      {
        title: "House Clearance",
        body: [
          "Our ",
          { label: "house clearance services", href: "/services/house-clearance" },
          " are efficient and discreet, helping you declutter or clear out entire properties with ease.",
        ],
      },
      {
        title: "Regular Maintenance Cleaning",
        body: "We offer tailored solutions for commercial spaces, including regular maintenance cleaning and specialised services to keep your workplace looking its best.",
      },
    ],
  },
  why: {
    lead: "Are you looking for specialist cleaning services in London and the surrounding area?",
    body: "Then look no further than Rosecrest. With a wealth of experience, unmatched expertise and an unwavering commitment to customer service, we are proud to be one of the go-to specialist, biohazard and deep cleaning companies across London and the M25.",
    photo: {
      src: "/assets/images/carpet-cleaning/maintenance.png",
      alt: "Cleaning operatives in gloves and aprons cleaning a workplace",
      width: 547,
      height: 250,
    },
  },
  cta: {
    title: "Ready for a spotless transformation?",
    text: "Contact us today to book your deep cleaning service.",
  },
  faq: {
    title: "Deep cleaning in London: your questions",
    items: [
      {
        q: "What does a deep clean include?",
        a: "Our team cleans every corner of the property and sanitises it thoroughly, restoring it to a pristine condition.",
      },
      {
        q: "Do you offer end of tenancy cleaning in London?",
        a: "Yes. A deep clean can be booked at the end of a tenancy to leave the property ready for the next occupant.",
      },
      {
        q: "Do you clean commercial premises?",
        a: "Yes. We offer tailored solutions for commercial spaces, including regular maintenance cleaning.",
      },
      {
        q: "Can you deal with biohazards?",
        a: "Yes. We provide biohazard cleaning, handling hazardous materials safely in homes and businesses.",
      },
    ],
    related: [
      { label: "House clearance", href: "/services/house-clearance" },
      { label: "Carpet cleaning", href: "/services/carpet-cleaning" },
      { label: "Handyman services", href: "/services/handyman" },
    ],
  },
};

export default function DeepCleaningPage() {
  return (
    <>
      <PageJsonLd path="/services/deep-cleaning" />
      <TradePage content={content} />
    </>
  );
}
