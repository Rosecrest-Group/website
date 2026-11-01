import { getPageMetadata } from "@/lib/page-metadata";
import PageJsonLd from "@/components/common/PageJsonLd";
import TradePage, { type TradeContent } from "@/components/site/trades/TradePage";

export const metadata = getPageMetadata("/services/house-clearance");

const content: TradeContent = {
  name: "House clearance",
  formName: "House clearance page call back",
  hero: {
    eyebrow: "House clearance in London",
    title: "House Clearance Services in London",
    intro: [
      "At Rosecrest Group Ltd, we understand that clearing out a home in London can be a daunting task, whether you’re downsizing, decluttering or dealing with the estate of a loved one. Our expert house clearance services are designed to make the process smooth, efficient and stress-free. With a commitment to professionalism and care, we handle all aspects of house clearance, ensuring that your space is left clean and organised.",
    ],
    photo: {
      src: "/assets/images/house-clearance/hero.png",
      alt: "Clearance team moving boxes and loading a trolley",
      width: 539,
      height: 548,
      framed: true,
    },
  },
  services: {
    eyebrow: "House clearance services",
    title: "Our House Clearance Services Include",
    columns: 3,
    items: [
      {
        title: "Comprehensive Clearance",
        body: "Our team specialises in full house clearances, handling everything from furniture and appliances to personal belongings and unwanted items. We work quickly and efficiently, ensuring that your home is cleared in a timely manner while respecting your wishes and property.",
      },
      {
        title: "Single Item Removals",
        body: "If you only need to remove a few specific items, we offer flexible single item removal services. Whether it’s a piece of furniture, an appliance or any other item, we’re here to help with prompt and reliable service.",
      },
      {
        title: "Estate Clearance",
        body: "Dealing with the belongings of a loved one can be emotionally challenging. Our sensitive estate clearance services are designed to help you through this difficult time. We handle all aspects of the clearance process with compassion and respect, ensuring that items are handled appropriately and in accordance with your wishes.",
      },
      {
        title: "Eco-Friendly Disposal",
        body: "At Rosecrest, we prioritise sustainable practices. We strive to recycle and donate as many items as possible, reducing waste and ensuring that usable items find new homes. Our eco-friendly disposal methods align with our commitment to protecting the environment.",
      },
      {
        title: "Cleaning and Tidying Services",
        body: [
          "After the clearance is complete, we offer ",
          { label: "deep cleaning", href: "/services/deep-cleaning" },
          " and tidying services to leave your space looking its best. Our team ensures that the cleared areas are thoroughly cleaned, making the move to a new setup seamless and pleasant.",
        ],
      },
      {
        title: "Flexible Scheduling",
        body: "We understand that every situation is unique, which is why we offer flexible scheduling to accommodate your needs. Whether you require a same-day clearance or prefer to schedule in advance, we work around your timeline to ensure a hassle-free experience.",
      },
      {
        title: "Professional and Friendly Team",
        body: "Our dedicated team of clearance specialists is trained to handle your belongings with care and respect. We approach each job with professionalism and a friendly manner, ensuring that you feel supported throughout the process.",
      },
    ],
  },
  why: {
    lead: "With Rosecrest Group Ltd, you can trust that your house clearance will be handled efficiently and compassionately.",
    body: "Our goal is to ease the burden of clearing out your space, allowing you to focus on what truly matters. Let us help you reclaim your home with our comprehensive house clearance services, tailored to meet your specific needs.",
    photo: {
      src: "/assets/images/house-clearance/comprehensive-clearance.png",
      alt: "Packed and taped boxes ready for removal during a house clearance",
      width: 547,
      height: 250,
    },
  },
  cta: {
    title: "Ready to book your clearance?",
    text: "Contact us today for a free quote.",
  },
  faq: {
    title: "House clearance in London: your questions",
    items: [
      {
        q: "Do you offer same-day house clearance?",
        a: "Yes. You can book a same-day clearance or schedule one in advance, and we work around your timeline.",
      },
      {
        q: "Can you clear a property after a bereavement?",
        a: "Yes. Our estate clearance service is handled with compassion and respect, and items are dealt with in accordance with your wishes.",
      },
      {
        q: "What happens to the items you remove?",
        a: "We recycle and donate as many items as possible, so usable items find new homes and less goes to waste.",
      },
      {
        q: "Do you clean the property afterwards?",
        a: [
          "Yes. After the clearance we can ",
          { label: "deep clean", href: "/services/deep-cleaning" },
          " and tidy the cleared areas. Contact us for a free quote.",
        ],
      },
    ],
    related: [
      { label: "Deep cleaning", href: "/services/deep-cleaning" },
      { label: "Carpet cleaning", href: "/services/carpet-cleaning" },
      { label: "Handyman services", href: "/services/handyman" },
    ],
  },
};

export default function HouseClearancePage() {
  return (
    <>
      <PageJsonLd path="/services/house-clearance" />
      <TradePage content={content} />
    </>
  );
}
