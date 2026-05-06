import Footer from "@/components/common/Footer";
import PlumbingDescription from "@/fragments/plumbing/PlumbingDesc";
import PlumbingMoreInfo from "@/fragments/plumbing/PlumbingMoreInfo";
import PlumbingServices from "@/fragments/plumbing/PlumbingServices";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import { getPageMetadata } from "@/lib/page-metadata";


export const metadata = getPageMetadata("/services/plumbing");

const Page = () => {
  return (
    <div>
      <JourneyHero>
        <div className="text-center">
          <p className="text-white text-4xl lg:text-5xl tracking-tight leading-16 w-3/4 mx-auto mt-12">
           Plumbing Services
          </p>
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
