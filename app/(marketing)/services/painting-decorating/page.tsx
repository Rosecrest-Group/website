import { getPageMetadata } from "@/lib/page-metadata";
import PageJsonLd from "@/components/common/PageJsonLd";
import TradePage, { type TradeContent } from "@/components/site/trades/TradePage";

export const metadata = getPageMetadata("/services/painting-decorating");

const content: TradeContent = {
  name: "Painting and decorating",
  formName: "Painting and decorating page call back",
  hero: {
    eyebrow: "Painter and decorator in London",
    title: "Decorating and Painting in London",
    intro: [
      "At Rosecrest Group Ltd, our painters and decorators in London believe that every space should tell a story that reflects your unique personality and taste. Our expert decorating team is dedicated to transforming your interiors, guiding you through every step of the process, from selecting the perfect colour palette to the final brushstroke.",
    ],
    photo: {
      src: "/assets/images/painting/final-touches.png",
      alt: "Decorator painting an interior wall with a roller",
      width: 1102,
      height: 500,
    },
  },
  services: {
    eyebrow: "Painting and decorating in London",
    title: "Our Painting and Decorating Services Include",
    columns: 3,
    items: [
      {
        title: "Personalised Consultation",
        body: "We start with a detailed consultation to understand your vision, lifestyle and preferences. Our decorators take the time to listen and provide expert advice, helping you turn your ideas into a cohesive design plan.",
      },
      {
        title: "Colour Palette Selection",
        body: "Choosing the right colours can significantly affect the atmosphere of your home. Our team offers insights into colour psychology and the latest trends, helping you select a palette that enhances your space while reflecting your style. Whether you want soothing neutrals, vibrant accents or bold contrasts, we guide you in making informed choices that work together.",
      },
      {
        title: "Material and Finish Recommendations",
        body: "In addition to colours, we advise on materials and finishes that suit your style and practical needs. From wallpaper and fabrics to paint finishes and textures, we curate options that elevate your décor while ensuring durability and ease of maintenance.",
        note: [
          "We also work with our ",
          { label: "carpentry specialists", href: "/services/carpentry" },
          " to complement your design with custom woodwork and built-in features.",
        ],
      },
      {
        title: "Space Planning and Design",
        body: "Our decorators consider the function and flow of your space to create an inviting environment. We look at furniture placement, lighting and architectural features to design a layout that maximises both aesthetics and comfort.",
        note: [
          "Need help implementing changes? Our ",
          { label: "handyman services", href: "/services/handyman" },
          " can assist with installations and adjustments.",
        ],
      },
      {
        title: "Professional Execution",
        body: "Our commitment to excellence extends to the execution of your project. Our skilled team handles every detail with precision, ensuring that each application, be it paint, wallpaper or decorative elements, is flawlessly completed. We take pride in our meticulous workmanship and attention to detail, delivering results that exceed your expectations.",
      },
      {
        title: "Final Touches and Styling",
        body: "Once the decorating is complete, we help you with the finishing touches that bring your vision to life. From selecting the right accessories to arranging furniture and décor items, we ensure that your space feels complete and personal.",
      },
    ],
    note: [
      "Bring your vision to life with expert decorating and styling. ",
      { label: "Contact us today", href: "#callback" },
      " to start your transformation.",
    ],
  },
  why: {
    lead: "At Rosecrest Group Ltd, we are passionate about creating beautiful environments that resonate with your style.",
    body: "Our decorating team combines creativity, expertise and a commitment to quality, transforming your spaces into stunning reflections of you. Trust us to elevate your home, one brushstroke at a time.",
    photo: {
      src: "/assets/images/painting/palette.png",
      alt: "Colour swatches fanned out during a decorating consultation",
      width: 1102,
      height: 500,
    },
  },
  cta: {
    title: "What is the next step?",
    text: "Contact us today to start your transformation.",
  },
  faq: {
    title: "Painting and decorating in London: your questions",
    items: [
      {
        q: "Can you help us choose colours?",
        a: "Yes. Every project starts with a consultation, and our decorators help you select a colour palette that suits your space and your style.",
      },
      {
        q: "Do you hang wallpaper as well as paint?",
        a: "Yes. Our team applies paint, wallpaper and decorative elements, and advises on finishes, fabrics and textures.",
      },
      {
        q: "Can you help with the final styling?",
        a: "Yes. Once the decorating is complete, we can help select accessories and arrange furniture and décor items.",
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
      { label: "Carpentry", href: "/services/carpentry" },
      { label: "Plastering", href: "/services/plastering" },
      { label: "Handyman services", href: "/services/handyman" },
    ],
  },
};

export default function PaintingDecoratingPage() {
  return (
    <>
      <PageJsonLd path="/services/painting-decorating" />
      <TradePage content={content} />
    </>
  );
}
