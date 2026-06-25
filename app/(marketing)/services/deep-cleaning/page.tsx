import Footer from "@/components/common/Footer";
import DeepCleaningDescription from "@/fragments/deep-cleaning/DeepCleaningDesc";
import DeepCleaningMoreInfo from "@/fragments/deep-cleaning/DeepCleaningMoreInfo";
import DeepCleaningServices from "@/fragments/deep-cleaning/DeepCleaningServices";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import { getPageMetadata } from "@/lib/page-metadata";


export const metadata = getPageMetadata("/services/deep-cleaning");

const Page = () => {
  return (
    <div>
      <JourneyHero>
        <div className="text-center">
          <p className="text-white text-4xl lg:text-5xl tracking-tight leading-16 w-3/4 mx-auto mt-12">
            Deep Cleaning
          </p>
        </div>
      </JourneyHero>
      <DeepCleaningDescription />
      <DeepCleaningServices />
      <DeepCleaningMoreInfo />
      <Footer />
    </div>
  );
};

export default Page;
