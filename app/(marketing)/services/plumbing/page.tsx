import { getPageMetadata } from "@/lib/page-metadata";
import PageJsonLd from "@/components/common/PageJsonLd";
import TradePage, { type TradeContent } from "@/components/site/trades/TradePage";

export const metadata = getPageMetadata("/services/plumbing");

const content: TradeContent = {
  name: "Plumbing",
  formName: "Plumbing page call back",
  hero: {
    eyebrow: "Plumber in London",
    title: "Plumbing Services in London",
    intro: [
      "Looking for a plumber in London? At Rosecrest Group Ltd we provide reliable, professional plumbing services across London and the M25. From responsive repairs to planned installations and ongoing maintenance, our skilled team delivers quality workmanship to residential and commercial properties.",
      "Whether you’re dealing with an urgent leak, upgrading fixtures or need a full installation, we are committed to getting the job done efficiently and to the highest standard.",
    ],
    photo: {
      src: "/assets/images/plumbing/hero.png",
      alt: "Plumber repairing the pipework under a kitchen sink in London",
      width: 539,
      height: 548,
      framed: true,
    },
  },
  services: {
    eyebrow: "Plumbing services",
    title: "Our Plumbing Services Include",
    columns: 3,
    items: [
      {
        title: "Installation and Replacement",
        body: [
          "Whether you’re upgrading your kitchen or bathroom fixtures, or installing new plumbing systems for a renovation, followed by ",
          { label: "plastering", href: "/services/plastering" },
          " and ",
          { label: "painting", href: "/services/painting-decorating" },
          " as needed, our team is equipped to handle all types of installations. We work with high-quality materials and the latest technologies to ensure that your new plumbing components function flawlessly and meet your specific needs.",
        ],
      },
      {
        title: "Repairs and Maintenance",
        body: "Plumbing issues can arise unexpectedly, and our team is ready to tackle them with expertise and efficiency. From leaking taps and blocked drains to broken pipes and water heater faults, we provide prompt repair services to minimise disruption to your daily life. Regular maintenance checks can also help prevent future issues and prolong the life of your plumbing systems.",
      },
      {
        title: "Drainage Solutions",
        body: "Proper drainage is crucial for maintaining the integrity of your home. We offer comprehensive drainage services, including unblocking drains, installing drainage systems and conducting thorough inspections to ensure everything is functioning correctly. Our proactive approach helps prevent water damage and promotes a healthy living environment.",
      },
      {
        title: "Bathroom and Kitchen Plumbing",
        body: [
          "Our plumbers specialise in bathroom and kitchen plumbing, ensuring that all installations and repairs are completed to the highest standards. From sinks and toilets to showers and dishwashers, we manage every aspect of your plumbing system to create efficient and stylish spaces that can be maintained easily with our ",
          { label: "deep cleaning services", href: "/services/deep-cleaning" },
          ".",
        ],
      },
      {
        title: "Emergency Plumbing Services",
        body: "Plumbing emergencies can happen at any time. That’s why our team is available for emergency plumbing services to address urgent issues quickly and effectively. We understand the importance of a swift response, and our skilled plumbers are always on call to help restore your plumbing systems as soon as possible.",
      },
      {
        title: "Water Quality Solutions",
        body: "Clean and safe water is essential for your home. We offer water quality solutions, including installation and maintenance of filtration systems, to ensure that you have access to fresh, clean water. Our team can assess your water quality needs and recommend the best solutions for your household.",
      },
    ],
  },
  why: {
    lead: "With Rosecrest Group Ltd, you can expect professionalism, reliability and exceptional service in all your plumbing needs.",
    body: "Our experienced plumbers provide quality workmanship and ensure your plumbing systems function efficiently. Let us help you maintain a comfortable and hassle-free home with our comprehensive plumbing services.",
    photo: {
      src: "/assets/images/plumbing/bathroom.png",
      alt: "Plumber beside newly fitted sink pipework in a London home",
      width: 547,
      height: 250,
    },
  },
  cta: {
    title: "Have a plumbing issue or project in mind?",
    text: "Get in touch with our team for expert advice and fast, reliable service.",
  },
  faq: {
    title: "Plumbing in London: your questions",
    items: [
      {
        q: "Do you offer an emergency plumber in London?",
        a: "Yes. Our team is available for emergency plumbing to deal with urgent leaks and failures quickly, for homes and businesses.",
      },
      {
        q: "Do you work on commercial properties?",
        a: "Yes. We carry out plumbing repairs, installations and maintenance for both residential and commercial properties.",
      },
      {
        q: "Can you unblock and inspect drains?",
        a: "Yes. Our drainage services include unblocking drains, installing drainage systems and thorough inspections to check everything is working correctly.",
      },
      {
        q: "Which areas do you cover?",
        a: [
          "London and areas within the M25. ",
          { label: "Check your postcode", href: "/areas-we-cover" },
          " or call us to confirm.",
        ],
      },
    ],
    related: [
      { label: "Plastering", href: "/services/plastering" },
      { label: "Tiling", href: "/services/tiling" },
      { label: "Deep cleaning", href: "/services/deep-cleaning" },
    ],
  },
};

export default function PlumbingPage() {
  return (
    <>
      <PageJsonLd path="/services/plumbing" />
      <TradePage content={content} />
    </>
  );
}
