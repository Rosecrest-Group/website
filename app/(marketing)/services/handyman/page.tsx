import Footer from "@/components/common/Footer";
import HandymanDescription from "@/fragments/handyman/HandymanDesc";
import HandymanMoreInfo from "@/fragments/handyman/HandymanMoreInfo";
import HandymanServices from "@/fragments/handyman/HandymanServices";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import { getPageMetadata } from "@/lib/page-metadata";
import PageJsonLd from "@/components/common/PageJsonLd";


export const metadata = getPageMetadata("/services/handyman");

const Page = () => {
  return (
    <div>
      <PageJsonLd path="/services/handyman" />
      <JourneyHero>
        <div className="text-center">
          <h1 className="text-white text-4xl lg:text-5xl tracking-tight leading-16 w-3/4 mx-auto mt-12">
            Handyman Services
          </h1>
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
