import Footer from "@/components/common/Footer";
import PlumbingDescription from "@/fragments/plumbing/PlumbingDesc";
import PlumbingMoreInfo from "@/fragments/plumbing/PlumbingMoreInfo";
import PlumbingServices from "@/fragments/plumbing/PlumbingServices";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import { getPageMetadata } from "@/lib/page-metadata";
import PageJsonLd from "@/components/common/PageJsonLd";


export const metadata = getPageMetadata("/services/plumbing");

const Page = () => {
  return (
    <div>
      <PageJsonLd path="/services/plumbing" />
      <JourneyHero>
        <div className="text-center">
          <h1 className="text-white text-4xl lg:text-5xl tracking-tight leading-16 w-3/4 mx-auto mt-12">
           Plumbing Services
          </h1>
        </div>
      </JourneyHero>
      <PlumbingDescription />
      <PlumbingServices />
      <PlumbingMoreInfo />
      <Footer />
    </div>
  );
};

export default Page;
