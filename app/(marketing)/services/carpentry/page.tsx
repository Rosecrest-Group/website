import { getPageMetadata } from "@/lib/page-metadata";
import PageJsonLd from "@/components/common/PageJsonLd";
import TradePage, { type TradeContent } from "@/components/site/trades/TradePage";

export const metadata = getPageMetadata("/services/carpentry");

const content: TradeContent = {
  name: "Carpentry",
  formName: "Carpentry page call back",
  hero: {
    eyebrow: "Carpenter in London",
    title: "Carpentry Services in London",
    intro: [
      "At Rosecrest Group Ltd, our City & Guilds qualified carpenters are dedicated to transforming homes throughout London with exceptional craftsmanship. Each project reflects our commitment to quality, precision and a keen eye for detail, ensuring that every installation and refurbishment enhances the beauty and functionality of your space.",
    ],
    photo: {
      src: "/assets/images/carpentry/floor-installation.png",
      alt: "Carpenter measuring and fitting a new wooden floor",
      width: 547,
      height: 250,
    },
  },
  services: {
    eyebrow: "Carpentry and flooring",
    title: "Our services cover a wide range of carpentry solutions, including",
    columns: 2,
    items: [
      {
        title: "Wooden Floor Installation",
        body: "Whether you’re looking for a classic oak finish or something modern and sleek, we install wooden floors that are as durable as they are beautiful. Our team works with a variety of wood types and styles, ensuring that your new floors complement the unique character of your home.",
      },
      {
        title: "Floor Refurbishment",
        body: "Restore the elegance of your existing wooden floors with our comprehensive refurbishment services. We carefully sand, repair and refinish floors to bring back their original lustre and extend their lifespan.",
        note: [
          "Pair this with our ",
          { label: "decorating and painting services", href: "/services/painting-decorating" },
          " to complete your space.",
        ],
      },
      {
        title: "Custom Carpentry Projects",
        body: "From bespoke cabinetry and shelving units to intricate moulding and trim, our carpenters bring your vision to life with custom solutions tailored to fit your space and style.",
        note: [
          "For smaller jobs or quick fixes, explore our ",
          { label: "handyman services", href: "/services/handyman" },
          ".",
        ],
      },
      {
        title: "Precision and Quality",
        body: "At Rosecrest Group Ltd, we take pride in delivering exceptional workmanship on every project. Our team uses only the finest materials, and our carpenters employ advanced techniques to ensure flawless results that stand the test of time.",
      },
    ],
  },
  why: {
    lead: "With Rosecrest Group Ltd, you’re not just investing in carpentry services.",
    body: "You’re partnering with a team that values integrity, reliability and a commitment to transforming your home into a masterpiece. Discover the difference that expert craftsmanship can make, and trust us for all your carpentry needs.",
    photo: {
      src: "/assets/images/carpentry/floor-refurbishment.png",
      alt: "Sander and freshly cut timber on a carpentry job",
      width: 547,
      height: 250,
    },
  },
  cta: {
    title: "Ready to start your project?",
    text: "Contact us today to discuss your carpentry needs with our expert team.",
  },
  faq: {
    title: "Carpentry in London: your questions",
    items: [
      {
        q: "Are your carpenters qualified?",
        a: "Yes. Our carpenters are City & Guilds qualified.",
      },
      {
        q: "Do you fit and refinish wooden floors?",
        a: "Yes. We install new wooden floors in a variety of woods and styles, and sand, repair and refinish existing floors.",
      },
      {
        q: "Can you build bespoke cabinets and shelving?",
        a: "Yes. We make bespoke cabinetry, shelving units, moulding and trim to fit your space and style.",
      },
      {
        q: "Do you take on small jobs?",
        a: [
          "For smaller jobs or quick fixes, our ",
          { label: "handyman services", href: "/services/handyman" },
          " are usually the best fit.",
        ],
      },
    ],
    related: [
      { label: "Painting and decorating", href: "/services/painting-decorating" },
      { label: "Handyman services", href: "/services/handyman" },
      { label: "Tiling", href: "/services/tiling" },
    ],
  },
};

export default function CarpentryPage() {
  return (
    <>
      <PageJsonLd path="/services/carpentry" />
      <TradePage content={content} />
    </>
  );
}
