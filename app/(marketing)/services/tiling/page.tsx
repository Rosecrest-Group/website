import { getPageMetadata } from "@/lib/page-metadata";
import PageJsonLd from "@/components/common/PageJsonLd";
import TradePage, { type TradeContent } from "@/components/site/trades/TradePage";

export const metadata = getPageMetadata("/services/tiling");

const content: TradeContent = {
  name: "Tiling",
  formName: "Tiling page call back",
  hero: {
    eyebrow: "Tiler in London",
    title: "Tiling Services in London",
    intro: [
      "At Rosecrest Group Ltd, our tilers in London believe that quality tiling is an essential element of beautiful and functional interiors. Our professional tiling services provide the perfect blend of durability and aesthetic appeal, ensuring that every project is completed to the highest standard.",
      "Whether you’re renovating a kitchen, updating a bathroom or adding stylish flooring, our skilled team is dedicated to delivering flawless results that enhance your home.",
    ],
    photo: {
      src: "/assets/images/tiling/hero.png",
      alt: "Tiler laying large-format floor tiles in a London bathroom",
      width: 539,
      height: 548,
      framed: true,
    },
  },
  services: {
    eyebrow: "Tiling services in London",
    title: "Our Tiling Services Include",
    columns: 3,
    items: [
      {
        title: "Floor Tiling",
        body: "Transform your floors with our comprehensive floor tiling services. We work with a wide range of materials, including ceramic, porcelain, natural stone and more, to create stunning surfaces that are not only beautiful but also resistant to wear and tear. Our team ensures precise installation and careful attention to detail, guaranteeing a seamless finish.",
      },
      {
        title: "Wall Tiling",
        body: [
          "Whether it’s a splashback in the kitchen or a feature wall in the living room, often installed alongside our expert ",
          { label: "plumbing services", href: "/services/plumbing" },
          ", our wall tiling services add character and elegance to any space. We help you choose the right tiles and design patterns to complement your interior style, providing a striking visual impact that enhances your home’s décor.",
        ],
      },
      {
        title: "Bathroom and Kitchen Tiling",
        body: "We specialise in tiling for wet areas such as bathrooms and kitchens, focusing on both style and functionality. Our team is experienced in creating waterproof and slip-resistant surfaces that are ideal for these high-traffic areas, ensuring safety and longevity.",
      },
      {
        title: "Custom Designs and Patterns",
        body: "Elevate your interiors with bespoke tiling designs tailored to your vision. From intricate mosaics to geometric patterns, we collaborate with you to create unique installations that reflect your personal style. Our expert craftsmen bring your ideas to life with precision and creativity.",
      },
      {
        title: "Tiling Repairs and Maintenance",
        body: [
          "Keep your tiled surfaces looking their best with our repair and maintenance services. We address issues such as cracked tiles, damaged grout or loose tiles, restoring their beauty and functionality, alongside our trusted ",
          { label: "handyman services", href: "/services/handyman" },
          " for everyday home maintenance. Regular maintenance ensures the longevity of your tiles and keeps your home in pristine condition.",
        ],
      },
      {
        title: "Professional Installation and Expertise",
        body: "At Rosecrest, our tiling experts are committed to delivering high-quality workmanship. We take the time to prepare surfaces properly, ensuring a solid foundation for your tiles. With our extensive knowledge and experience, you can trust us to complete your tiling project efficiently and with exceptional results.",
      },
    ],
  },
  why: {
    lead: "By choosing Rosecrest Group Ltd for your tiling needs, you are ensuring that your spaces are not only visually stunning but also built to withstand the test of time.",
    body: "Let us help you create beautiful, functional areas in your home that reflect your unique style.",
    photo: {
      src: "/assets/images/tiling/wall.png",
      alt: "Metro wall tiles fitted below exposed brickwork",
      width: 547,
      height: 250,
    },
  },
  cta: {
    title: "Ready to transform your space with custom tiling?",
    text: "Contact us today for a free consultation and quote.",
  },
  faq: {
    title: "Tiling in London: your questions",
    items: [
      {
        q: "What tiles do you work with?",
        a: "A wide range, including ceramic, porcelain and natural stone, for floors, walls, splashbacks and feature walls.",
      },
      {
        q: "Can you tile bathrooms and other wet areas?",
        a: "Yes. We specialise in bathroom and kitchen tiling, creating waterproof and slip-resistant surfaces for these high-traffic areas.",
      },
      {
        q: "Do you repair cracked tiles and grout?",
        a: "Yes. We fix cracked tiles, damaged grout and loose tiles, restoring both the look and the function of the surface.",
      },
      {
        q: "Is the quote free?",
        a: "Yes. Contact us for a free consultation and quote for your tiling project.",
      },
    ],
    related: [
      { label: "Plumbing", href: "/services/plumbing" },
      { label: "Handyman services", href: "/services/handyman" },
      { label: "Carpentry and flooring", href: "/services/carpentry" },
    ],
  },
};

export default function TilingPage() {
  return (
    <>
      <PageJsonLd path="/services/tiling" />
      <TradePage content={content} />
    </>
  );
}
