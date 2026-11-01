import { getPageMetadata } from "@/lib/page-metadata";
import PageJsonLd from "@/components/common/PageJsonLd";
import TradePage, { type TradeContent } from "@/components/site/trades/TradePage";

export const metadata = getPageMetadata("/services/plastering");

const content: TradeContent = {
  name: "Plastering",
  formName: "Plastering page call back",
  hero: {
    eyebrow: "Plasterer in London",
    title: "Plastering Services in London",
    intro: [
      "At Rosecrest Group Ltd, our plasterers in London understand that quality plastering is the foundation of any beautiful interior. Our professional plastering services are designed to deliver impeccable finishes, whether you’re undertaking a new installation or simply refreshing existing surfaces. With a commitment to precision and craftsmanship, we ensure that every project results in a smooth, durable and visually appealing finish that enhances the overall aesthetic of your space.",
    ],
    photo: {
      src: "/assets/images/plastering/hero.png",
      alt: "Plasterer skimming a wall in a London home",
      width: 539,
      height: 548,
      framed: true,
    },
  },
  services: {
    eyebrow: "Plastering services",
    title: "Our Plastering Services Include",
    columns: 3,
    items: [
      {
        title: "New Installations",
        body: "If you’re renovating or building from the ground up, our expert plasterers provide top-notch installation services for walls and ceilings. We use the latest techniques and high-quality materials to create a flawless surface that is ready for painting or other finishes.",
      },
      {
        title: "Repair and Restoration",
        body: "Cracks, holes and uneven surfaces can detract from the beauty of your home. Our team specialises in repairing and restoring plaster to its original condition. We carefully assess the damage, prepare the area and apply the necessary treatments to ensure a seamless repair that blends perfectly with existing surfaces.",
      },
      {
        title: "Skimming and Resurfacing",
        body: "For a fresh look, our skimming and resurfacing services can breathe new life into your interiors. We apply a thin layer of plaster to smooth out walls and ceilings, hiding imperfections and creating a uniform surface. This process not only enhances aesthetics but also improves the durability of your walls.",
      },
      {
        title: "Decorative Plastering",
        body: "Elevate your interiors with our decorative plastering techniques. From ornate cornices and ceiling roses to textured finishes, we can add unique features that reflect your personal style. Our skilled craftsmen are experienced in various decorative plastering methods, creating stunning focal points in any room.",
      },
      {
        title: "Sustainable Practices",
        body: "At Rosecrest, we are committed to environmentally friendly practices. We use eco-conscious materials and techniques that minimise waste and promote sustainability without compromising quality. Our plastering services aim to create healthy living spaces that are both beautiful and environmentally responsible.",
      },
      {
        title: "Attention to Detail and Professionalism",
        body: "We pride ourselves on our meticulous attention to detail and dedication to customer satisfaction. Our plasterers are highly trained professionals who approach every project with care and precision. We keep work areas clean, respect your home and deliver results on time.",
      },
    ],
  },
  why: {
    lead: "By choosing Rosecrest for your plastering needs, you are investing in quality, durability and exceptional service.",
    body: "We set the stage for beautiful interiors, ensuring that your walls and ceilings provide the perfect backdrop for your design vision. Let us help you create spaces that are not only visually stunning but also built to last.",
    photo: {
      src: "/assets/images/plastering/skimming.png",
      alt: "Plasterer finishing a freshly skimmed wall",
      width: 547,
      height: 250,
    },
  },
  cta: {
    title: "Ready to transform your space with expert plastering?",
    text: "Contact us today to discuss your project.",
  },
  faq: {
    title: "Plastering in London: your questions",
    items: [
      {
        q: "Do you have plasterers near me?",
        a: [
          "If your property is in London or within the M25, yes. ",
          { label: "Check your postcode", href: "/areas-we-cover" },
          " or call us and we’ll confirm.",
        ],
      },
      {
        q: "Can you skim over damaged or uneven walls?",
        a: "Yes. We repair cracks, holes and uneven areas first, then skim the walls and ceilings with a thin layer of plaster to hide imperfections and leave a uniform surface.",
      },
      {
        q: "Do you do decorative plasterwork?",
        a: "Yes, including ornate cornices, ceiling roses and textured finishes.",
      },
      {
        q: "Is the finish ready to paint?",
        a: [
          "Yes. New plastering is left as a flawless surface ready for painting or other finishes, and our ",
          { label: "painting and decorating team", href: "/services/painting-decorating" },
          " can follow on.",
        ],
      },
    ],
    related: [
      { label: "Painting and decorating", href: "/services/painting-decorating" },
      { label: "Carpentry", href: "/services/carpentry" },
      { label: "Handyman services", href: "/services/handyman" },
    ],
  },
};

export default function PlasteringPage() {
  return (
    <>
      <PageJsonLd path="/services/plastering" />
      <TradePage content={content} />
    </>
  );
}
