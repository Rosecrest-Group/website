import Footer from "@/components/common/Footer";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import StockDescription from "@/fragments/stock-condition/StockDescription";
import StockIncludes from "@/fragments/stock-condition/StockIncludes";
import WhyChooseSection from "@/fragments/stock-condition/WhyRosecrest";
import { getPageMetadata } from "@/lib/page-metadata";


export const metadata = getPageMetadata("/services/stock-condition");

const Page = () => {
  return (
    <div>
      <JourneyHero>
        <div className="text-center">
          <p className="text-white text-4xl lg:text-5xl tracking-tight leading-16 w-3/4 mx-auto mt-12">
            Stock Condition Surveys
          </p>
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
