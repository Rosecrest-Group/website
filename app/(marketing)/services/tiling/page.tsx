import Footer from "@/components/common/Footer";
import TilingDescription from "@/fragments/tiling/TilingDesc";
import TilingMoreInfo from "@/fragments/tiling/TilingMoreInfo";
import TilingServices from "@/fragments/tiling/TilingServices";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import { getPageMetadata } from "@/lib/page-metadata";


export const metadata = getPageMetadata("/services/tiling");

const Page = () => {
  return (
    <div>
      <JourneyHero>
        <div className="text-center">
          <p className="text-white text-4xl lg:text-5xl tracking-tight leading-16 w-3/4 mx-auto mt-12">
            Tiling Services
          </p>
        </div>
      </JourneyHero>
      <TilingDescription />
      <TilingServices />
      <TilingMoreInfo />
      <Footer />
    </div>
  );
};

export default Page;
