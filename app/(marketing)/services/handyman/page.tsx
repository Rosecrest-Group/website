import Footer from "@/components/common/Footer";
import HandymanDescription from "@/fragments/handyman/HandymanDesc";
import HandymanMoreInfo from "@/fragments/handyman/HandymanMoreInfo";
import HandymanServices from "@/fragments/handyman/HandymanServices";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import { getPageMetadata } from "@/lib/page-metadata";


export const metadata = getPageMetadata("/services/handyman");

const Page = () => {
  return (
    <div>
      <JourneyHero>
        <div className="text-center">
          <p className="text-white text-4xl lg:text-5xl tracking-tight leading-16 w-3/4 mx-auto mt-12">
            Handyman Services
          </p>
        </div>
      </JourneyHero>
      <HandymanDescription />
      <HandymanServices />
      <HandymanMoreInfo />
      <Footer />
    </div>
  );
};

export default Page;
