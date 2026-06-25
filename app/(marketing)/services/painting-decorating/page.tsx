import Footer from "@/components/common/Footer";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import PaintDescription from "@/fragments/painting-decorating/PaintDescription";
import PaintingServices from "@/fragments/painting-decorating/PaintingServices";
import WhyChooseSection from "@/fragments/painting-decorating/WhyRosecrest";
import { getPageMetadata } from "@/lib/page-metadata";


export const metadata = getPageMetadata("/services/painting-decorating");

const Page = () => {
  return (
    <div>
      <JourneyHero>
        <div className="text-center">
          <p className="text-white text-4xl lg:text-5xl tracking-tight leading-16 w-3/4 mx-auto mt-12">
            Decorating and Painting
          </p>
        </div>
      </JourneyHero>
      <PaintDescription />
      <PaintingServices />
      <WhyChooseSection />
      <Footer />
    </div>
  );
};

export default Page;
