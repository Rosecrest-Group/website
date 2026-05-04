import Footer from "@/components/common/Footer";
import CarpentryDescription from "@/fragments/carpentry/CarpentryDesc";
import CarpentryMoreInfo from "@/fragments/carpentry/CarpentryMoreInfo";
import CarpentryServices from "@/fragments/carpentry/CarpentryServices";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import { getPageMetadata } from "@/lib/page-metadata";


export const metadata = getPageMetadata("/services/carpentry");


const Page = () => {
  return (
    <div>
      <JourneyHero>
        <div className="text-center">
          <p className="text-white text-4xl lg:text-5xl tracking-tight leading-16 w-3/4 mx-auto mt-12">
            Carpentry
          </p>
        </div>
      </JourneyHero>
      <CarpentryDescription />
      <CarpentryServices />
      <CarpentryMoreInfo />
      <Footer />
    </div>
  );
};

export default Page;
