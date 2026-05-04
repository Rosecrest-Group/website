import Footer from "@/components/common/Footer";
import DampMouldDescription from "@/fragments/damp-mould/DampMouldDesc";
import DampMouldFAQ from "@/fragments/damp-mould/DampMouldFAQs";
import DampMouldMoreInfo from "@/fragments/damp-mould/DampMouldMoreInfo";
import DampMouldSurveySection from "@/fragments/damp-mould/DampMouldSection";
import DampMouldServices from "@/fragments/damp-mould/DampMouldServices";
import MouldTreatmentSection from "@/fragments/damp-mould/MouldTreatmentSection";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import { getPageMetadata } from "@/lib/page-metadata";


export const metadata = getPageMetadata("/services/damp-mould");

const Page = () => {
  return (
    <div>
      <JourneyHero>
        <div className="text-center">
          <p className="text-white text-4xl lg:text-5xl tracking-tight leading-16 sm:w-3/4 mx-auto mt-12">
            Damp, Mould & Condensation: Inspection, Reporting & Treatment
            Support
          </p>
        </div>
      </JourneyHero>
      <DampMouldDescription />
      <DampMouldServices />
      <DampMouldSurveySection />
      <MouldTreatmentSection/>
      <DampMouldMoreInfo />
      <DampMouldFAQ />
      <Footer />
    </div>
  );
};

export default Page;
