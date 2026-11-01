import { getPageMetadata } from "@/lib/page-metadata";
import PageJsonLd from "@/components/common/PageJsonLd";
import TradePage, { type TradeContent } from "@/components/site/trades/TradePage";

export const metadata = getPageMetadata("/services/carpet-cleaning");

const content: TradeContent = {
  name: "Carpet cleaning",
  formName: "Carpet cleaning page call back",
  hero: {
    eyebrow: "Carpet cleaning in London",
    title: "Carpet Cleaning Services in London",
    intro: [
      "At Rosecrest Group Ltd, we understand the importance of clean carpets for a healthy and inviting home, which is why we offer expert carpet cleaning across London. Our carpet cleaning services are designed to rejuvenate your carpets, removing dirt, stains and allergens to restore their original beauty. With a commitment to quality and customer satisfaction, our team will ensure your carpets look and feel fresh.",
    ],
    photo: {
      src: "/assets/images/carpet-cleaning/stain-removal.png",
      alt: "Vacuum head deep cleaning a teal carpet",
      width: 547,
      height: 250,
    },
  },
  services: {
    eyebrow: "Carpet and upholstery cleaning",
    title: "Our Carpet Cleaning Services Include",
    columns: 3,
    items: [
      {
        title: "Deep Cleaning",
        body: "Our comprehensive deep cleaning services penetrate deep into carpet fibres, removing embedded dirt, dust and allergens. Using modern equipment and methods, we ensure a thorough clean that revitalises your carpets and extends their lifespan.",
        note: [
          "Explore our full ",
          { label: "deep cleaning services", href: "/services/deep-cleaning" },
          " for a whole-property refresh.",
        ],
      },
      {
        title: "Stain Removal",
        body: "Whether it’s pet stains, wine spills or everyday dirt, our skilled technicians are trained in effective stain removal techniques. We assess each stain and apply targeted treatments to restore your carpets to their original condition without damaging the fibres.",
      },
      {
        title: "Steam Cleaning",
        body: "Our steam cleaning service uses high-temperature water vapour to disinfect and deep clean carpets. This method effectively eliminates bacteria, dust mites and other harmful microorganisms, ensuring a healthier living environment for you and your family.",
      },
      {
        title: "Odour Removal",
        body: "Lingering odours can make your home feel less inviting. Our carpet cleaning experts use specialised products and techniques to neutralise odours trapped in carpet fibres, leaving your home smelling fresh and clean.",
      },
      {
        title: "Upholstery Cleaning",
        body: "In addition to carpets, we offer professional upholstery cleaning to ensure all fabric surfaces in your home are spotless. Our team uses safe and effective methods to clean sofas, chairs and other upholstered furniture, enhancing the overall appearance of your living spaces.",
        note: [
          "Pair this with our ",
          { label: "house clearance services", href: "/services/house-clearance" },
          " for a complete reset of your living spaces.",
        ],
      },
      {
        title: "Regular Maintenance Programmes",
        body: "To keep your carpets looking their best, we offer tailored maintenance programmes that include scheduled cleans and inspections. Regular cleaning not only prolongs the life of your carpets but also helps maintain a clean and healthy home environment.",
        note: ["Learn more about our ", { label: "full range of services", href: "/services" }, "."],
      },
      {
        title: "Eco-Friendly Solutions",
        body: "At Rosecrest, we are committed to sustainability. We use eco-friendly cleaning products and techniques that are safe for your family and pets, giving you peace of mind while effectively cleaning your carpets.",
      },
    ],
  },
  why: {
    lead: "With Rosecrest Group Ltd, you can expect exceptional carpet cleaning services that go beyond surface-level cleaning.",
    body: "Our dedicated team of professionals is committed to restoring the beauty and freshness of your carpets, ensuring that your home remains a welcoming and comfortable place. Trust us to deliver results that enhance the quality of your indoor environment, one carpet at a time.",
    photo: {
      src: "/assets/images/carpet-cleaning/upholstery-cleaning.png",
      alt: "Upholstery cleaning nozzle being run over a fabric sofa",
      width: 547,
      height: 250,
    },
  },
  cta: {
    title: "Ready to refresh your carpets?",
    text: "Contact us today to book a consultation or request a quote.",
  },
  faq: {
    title: "Carpet cleaning in London: your questions",
    items: [
      {
        q: "Do you offer upholstery cleaning in London?",
        a: "Yes. As well as carpets, we clean sofas, chairs and other upholstered furniture using safe and effective methods.",
      },
      {
        q: "Can you remove pet stains and odours?",
        a: "Yes. We assess each stain and apply targeted treatments, and use specialised products to neutralise odours trapped in carpet fibres.",
      },
      {
        q: "Are your cleaning products safe for children and pets?",
        a: "We use eco-friendly cleaning products and techniques that are safe for your family and pets.",
      },
      {
        q: "Can you clean carpets regularly?",
        a: "Yes. We offer tailored maintenance programmes with scheduled cleans and inspections.",
      },
    ],
    related: [
      { label: "Deep cleaning", href: "/services/deep-cleaning" },
      { label: "House clearance", href: "/services/house-clearance" },
      { label: "Handyman services", href: "/services/handyman" },
    ],
  },
};

export default function CarpetCleaningPage() {
  return (
    <>
      <PageJsonLd path="/services/carpet-cleaning" />
      <TradePage content={content} />
    </>
  );
}
