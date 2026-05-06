import Footer from "@/components/common/Footer";
import HousingContact from "@/fragments/housing-disrepair/HousingContact";
import HousingDisrepairIncludes from "@/fragments/housing-disrepair/HousingIncludes";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import { sourceSans } from "@/lib/fonts";
import { getPageMetadata } from "@/lib/page-metadata";


export const metadata = getPageMetadata("/services/housing-disrepair");

const Page = () => {
  return (
    <div>
      <JourneyHero>
        <p className="text-white text-4xl lg:text-5xl tracking-tight leading-16">
          Housing Disrepair Surveys
        </p>
        <p
          className={`${sourceSans.className} mt-10 mx-auto text-white text-xl lg:text-2xl leading-relaxed`}
        >
          Is your property showing signs of wear and tear? <br />
          Our expert Chartered Surveyors inspect properties to identify issues
          against UK Legislation standards.
        </p>
      </JourneyHero>
      <HousingDisrepairIncludes />
      <HousingContact />
      <Footer />
    </div>
  );
};

export default Page;
