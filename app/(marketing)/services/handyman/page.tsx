import { getPageMetadata } from "@/lib/page-metadata";
import PageJsonLd from "@/components/common/PageJsonLd";
import TradePage, { type TradeContent } from "@/components/site/trades/TradePage";

export const metadata = getPageMetadata("/services/handyman");

const content: TradeContent = {
  name: "Handyman",
  formName: "Handyman page call back",
  hero: {
    eyebrow: "Handyman in London",
    title: "Handyman Services in London",
    intro: [
      "At Rosecrest Group Ltd, our skilled handymen are ready to tackle a wide range of home improvement and repair projects in London, no matter the size. Serving homes across the capital, we are committed to delivering quality workmanship, reliability and efficient solutions that keep your home in top shape. From quick repairs to complex installations, you can trust Rosecrest for results that exceed expectations.",
    ],
    photo: {
      src: "/assets/images/handyman/general-repairs.png",
      alt: "Handyman arriving at a London kitchen with a toolbox",
      width: 547,
      height: 250,
    },
  },
  services: {
    eyebrow: "Handyman and property maintenance",
    title: "Our Comprehensive Handyman Services Include",
    columns: 3,
    items: [
      {
        title: "General Repairs and Maintenance",
        body: "From fixing leaking taps to patching plasterboard, our team handles everyday repairs with precision and attention to detail. We help keep your home functioning smoothly, addressing issues promptly and effectively.",
      },
      {
        title: "Furniture Assembly and Installation",
        body: "Whether it’s new furniture from a store or a custom piece, our handymen assemble and install everything securely, saving you time and hassle. We ensure that each item is properly placed and ready for use.",
      },
      {
        title: "Painting and Decorating",
        body: "Refresh the look of your home with our professional painting and decorating services. Our handymen are experienced in interior and exterior painting, wallpapering and touch-ups, bringing new life to your living spaces.",
        note: ["See our ", { label: "painting and decorating services", href: "/services/painting-decorating" }, "."],
      },
      {
        title: "Shelving and Storage Solutions",
        body: [
          "Need additional storage or functional shelving? We install shelves, cabinets and other storage and ",
          { label: "carpentry solutions", href: "/services/carpentry" },
          " that blend seamlessly with your home’s design, providing both style and practicality.",
        ],
      },
      {
        title: "Home Installations",
        body: "From hanging artwork and mirrors to mounting TVs and blinds, we take care of all those finishing touches that make your house feel like home. Our handymen work with precision to ensure every installation is secure and perfectly aligned.",
      },
      {
        title: "Reliable and Efficient Service",
        body: "At Rosecrest, we understand the importance of trust and dependability. Our handymen are punctual, respectful of your space and committed to completing each project on time and to your satisfaction.",
      },
    ],
  },
  why: {
    lead: "With Rosecrest Group Ltd, you have a dedicated team of professionals ready to assist with all your handyman needs.",
    body: "We bring experience, skill and a commitment to excellence, so you can enjoy a home that’s both beautiful and functional. For handyman services you can count on, choose Rosecrest in London.",
    photo: {
      src: "/assets/images/handyman/shelving.png",
      alt: "Wall-mounted shelving and pendant lights installed in a London home",
      width: 547,
      height: 250,
    },
  },
  cta: {
    title: "Need help around the house?",
    text: "Contact us to book a reliable handyman today.",
  },
  faq: {
    title: "Handyman services in London: your questions",
    items: [
      {
        q: "What jobs can your handymen help with?",
        a: "Everyday repairs and maintenance, furniture assembly, shelving and storage, painting touch-ups and wallpapering, and installations such as artwork, mirrors, TVs and blinds.",
      },
      {
        q: "Do you offer property maintenance in London?",
        a: "Yes. As well as one-off jobs, our team handles everyday repairs and maintenance to keep your home functioning smoothly.",
      },
      {
        q: "Can you mount a TV or hang mirrors?",
        a: "Yes. We hang artwork and mirrors and mount TVs and blinds, making sure each installation is secure and perfectly aligned.",
      },
      {
        q: "What if the job is bigger?",
        a: [
          "For larger projects, our ",
          { label: "carpentry", href: "/services/carpentry" },
          ", ",
          { label: "plumbing", href: "/services/plumbing" },
          " and ",
          { label: "decorating", href: "/services/painting-decorating" },
          " teams can take it on.",
        ],
      },
    ],
    related: [
      { label: "Carpentry", href: "/services/carpentry" },
      { label: "Painting and decorating", href: "/services/painting-decorating" },
      { label: "Plumbing", href: "/services/plumbing" },
    ],
  },
};

export default function HandymanPage() {
  return (
    <>
      <PageJsonLd path="/services/handyman" />
      <TradePage content={content} />
    </>
  );
}
