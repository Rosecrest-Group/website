import Footer from "@/components/common/Footer";
import CarpetDescription from "@/fragments/carpet-cleaning/CarpetDesc";
import CarpetMoreInfo from "@/fragments/carpet-cleaning/CarpetMoreInfo";
import CarpetServices from "@/fragments/carpet-cleaning/CarpetServices";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import { getPageMetadata } from "@/lib/page-metadata";


export const metadata = getPageMetadata("/services/carpet-cleaning");

const Page = () => {
  return (
    <div>
      <JourneyHero>
        <div className="text-center">
          <p className="text-white text-4xl lg:text-5xl tracking-tight leading-16 w-3/4 mx-auto mt-12">
            Carpet Cleaning Services
          </p>
        </div>
      </JourneyHero>
      <CarpetDescription />
      <CarpetServices />
      <CarpetMoreInfo />
      <Footer />
    </div>
  );
};

export default Page;
