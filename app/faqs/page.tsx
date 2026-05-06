import Footer from "@/components/common/Footer";
import FAQSection from "@/components/faqs/FAQSection";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import { sourceSans } from "@/lib/fonts";
import { getPageMetadata } from "@/lib/page-metadata";
import { getAllFAQCategories } from "@/lib/faqs";
import JsonLd from "@/components/common/JsonLd";
import { buildFAQPage } from "@/lib/schema";

export const metadata = getPageMetadata("/faqs");

const Page = () => {
  const categories = getAllFAQCategories();

  // Flatten every visible Q&A on this page into a single FAQPage schema.
  // Source is identical to what's rendered below — guaranteed parity.
  const allQuestions = categories.flatMap((c) => c.questions);

  return (
    <div>
      <JsonLd data={buildFAQPage(allQuestions)} id="faqs" />

      <JourneyHero>
        <p className="text-white text-4xl lg:text-5xl tracking-tight leading-16">
          Frequently Asked Questions
        </p>
        <p
          className={`${sourceSans.className} mt-4 mx-auto text-white text-base lg:text-xl leading-relaxed max-w-3xl`}
        >
          Here are answers to the most common questions about our property
          surveys, valuations, and reports.
        </p>
      </JourneyHero>

      <div>
        <div className="max-w-7xl mx-auto px-4 py-16 lg:py-24 space-y-20">
          {categories.map((category) => (
            <FAQSection
              key={category.id}
              title={category.title}
              questions={category.questions}
            />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Page;