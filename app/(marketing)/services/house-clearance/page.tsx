import Footer from "@/components/common/Footer";
import HouseClearanceDescription from "@/fragments/house-clearance/HouseClearanceDesc";
import HouseClearanceMoreInfo from "@/fragments/house-clearance/HouseClearanceMoreInfo";
import HouseClearanceServices from "@/fragments/house-clearance/HouseClearanceServices";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import { getPageMetadata } from "@/lib/page-metadata";
import PageJsonLd from "@/components/common/PageJsonLd";


export const metadata = getPageMetadata("/services/house-clearance");

const Page = () => {
  return (
    <div>
      <PageJsonLd path="/services/house-clearance" />
      <JourneyHero>
        <div className="text-center">
          <h1 className="text-white text-4xl lg:text-5xl tracking-tight leading-16 sm:w-3/4 mx-auto mt-12">
            House Clearance Services
          </h1>
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
