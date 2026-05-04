import JourneyHero from "@/fragments/journeys/JourneyHero";
import { sourceSans } from "@/lib/fonts";
import Footer from "@/components/common/Footer";
import EnvironmentalDescription from "@/fragments/environmental-reports/EnvironmentalDesc";
import EnvironmentalWhoNeeds from "@/fragments/environmental-reports/EnvironmentalWhoNeeds";
import EnvironmentalWhyChoose from "@/fragments/environmental-reports/EnvironmentalWhyChoose";
import EnvironmentalMoreInfo from "@/fragments/environmental-reports/EnvironmentalMoreInfo";
import { getPageMetadata } from "@/lib/page-metadata";


export const metadata = getPageMetadata("/services/environmental-reports");

const Page = () => {
  return (
    <div>
      <JourneyHero>
        <p className="text-white text-4xl lg:text-5xl tracking-tight leading-16">
          Environmental Reports
        </p>
        <p className={`${sourceSans.className} mt-10 mx-auto text-white text-xl lg:text-2xl leading-relaxed`}>
          Professional. Insightful. Risk-Aware.
        </p>
      </JourneyHero>

      <EnvironmentalDescription />
      <EnvironmentalWhoNeeds />
      <EnvironmentalWhyChoose />
      <EnvironmentalMoreInfo />

      <Footer />
    </div>
  );
};

export default Page;