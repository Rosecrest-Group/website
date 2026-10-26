import Footer from "@/components/common/Footer";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import StockDescription from "@/fragments/stock-condition/StockDescription";
import StockIncludes from "@/fragments/stock-condition/StockIncludes";
import WhyChooseSection from "@/fragments/stock-condition/WhyRosecrest";
import { getPageMetadata } from "@/lib/page-metadata";
import PageJsonLd from "@/components/common/PageJsonLd";


export const metadata = getPageMetadata("/services/stock-condition");

const Page = () => {
  return (
    <div>
      <PageJsonLd path="/services/stock-condition" />
      <JourneyHero>
        <div className="text-center">
          <h1 className="text-white text-4xl lg:text-5xl tracking-tight leading-16 w-3/4 mx-auto mt-12">
            Stock Condition Surveys
          </h1>
        </div>
      </JourneyHero>
      <StockDescription />
      <StockIncludes />
      <WhyChooseSection />
      <Footer />
    </div>
  );
};

export default Page;
