import Footer from "@/components/common/Footer";
import PlasteringDescription from "@/fragments/plastering/PlasteringDesc";
import PlasteringMoreInfo from "@/fragments/plastering/PlasteringMoreInfo";
import PlasteringServices from "@/fragments/plastering/PlasteringServices";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import { getPageMetadata } from "@/lib/page-metadata";
import PageJsonLd from "@/components/common/PageJsonLd";


export const metadata = getPageMetadata("/services/plastering");

const Page = () => {
  return (
    <div>
      <PageJsonLd path="/services/plastering" />
      <JourneyHero>
        <div className="text-center">
          <h1 className="text-white text-4xl lg:text-5xl tracking-tight leading-16 sm:w-3/4 mx-auto mt-12">
           Plastering Services
          </h1>
        </div>
      </JourneyHero>
      <PlasteringDescription />
      <PlasteringServices />
      <PlasteringMoreInfo />
      <Footer />
    </div>
  );
};

export default Page;
