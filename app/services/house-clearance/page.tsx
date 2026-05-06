import Footer from "@/components/common/Footer";
import HouseClearanceDescription from "@/fragments/house-clearance/HouseClearanceDesc";
import HouseClearanceMoreInfo from "@/fragments/house-clearance/HouseClearanceMoreInfo";
import HouseClearanceServices from "@/fragments/house-clearance/HouseClearanceServices";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import { getPageMetadata } from "@/lib/page-metadata";


export const metadata = getPageMetadata("/services/house-clearance");

const Page = () => {
  return (
    <div>
      <JourneyHero>
        <div className="text-center">
          <p className="text-white text-4xl lg:text-5xl tracking-tight leading-16 sm:w-3/4 mx-auto mt-12">
            House Clearance Services
          </p>
        </div>
      </JourneyHero>
      <HouseClearanceDescription />
      <HouseClearanceServices />
      <HouseClearanceMoreInfo />
      <Footer />
    </div>
  );
};

export default Page;
