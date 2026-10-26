import Footer from "@/components/common/Footer";
import TilingDescription from "@/fragments/tiling/TilingDesc";
import TilingMoreInfo from "@/fragments/tiling/TilingMoreInfo";
import TilingServices from "@/fragments/tiling/TilingServices";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import { getPageMetadata } from "@/lib/page-metadata";
import PageJsonLd from "@/components/common/PageJsonLd";


export const metadata = getPageMetadata("/services/tiling");

const Page = () => {
  return (
    <div>
      <PageJsonLd path="/services/tiling" />
      <JourneyHero>
        <div className="text-center">
          <h1 className="text-white text-4xl lg:text-5xl tracking-tight leading-16 w-3/4 mx-auto mt-12">
            Tiling Services
          </h1>
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
