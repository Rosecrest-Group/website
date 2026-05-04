import Footer from "@/components/common/Footer";
import AfterAssessment from "@/fragments/epc/AfterAssessment";
import AssessmentDuration from "@/fragments/epc/AssessmentDuration";
import CommercialEPC from "@/fragments/epc/CommercialEPC";
import EPCAssessmentAreas from "@/fragments/epc/EPCAssessmentAreas";
import EPCAssessmentProcess from "@/fragments/epc/EPCAssesssment";
import EPCDescription from "@/fragments/epc/EPCDescription";
import EPCFAQ from "@/fragments/epc/EPCFAQs";
import EPCHero from "@/fragments/epc/EPCHero";
import EPCStepByStep from "@/fragments/epc/EPCSteps";
import GetStarted from "@/fragments/epc/GetStarted";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import { sourceSans } from "@/lib/fonts";
import { getPageMetadata } from "@/lib/page-metadata";


export const metadata = getPageMetadata("/services/epc");

const Page = () => {
  return (
    <div>
      <JourneyHero>
        <p className="text-white text-4xl lg:text-5xl tracking-tight leading-16">
          Energy Performance Certificate (EPC)
        </p>
        <p
          className={`${sourceSans.className} mt-10 mx-auto text-white text-xl lg:text-2xl leading-relaxed`}
        >
          Residential EPCs will start FROM £33
        </p>
      </JourneyHero>
      <EPCHero />
      <EPCDescription />
      <EPCAssessmentProcess />
      <EPCAssessmentAreas />
      <AfterAssessment />
      <AssessmentDuration />
      <CommercialEPC />
      <EPCStepByStep />
      <GetStarted />
      <EPCFAQ />
      <Footer />
    </div>
  );
};

export default Page;
