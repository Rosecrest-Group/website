import Footer from "@/components/common/Footer";
import JsonLd from "@/components/common/JsonLd";
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
import { getFAQsForRoute } from "@/lib/faqs";
import { sourceSans } from "@/lib/fonts";
import { getPageMetadata } from "@/lib/page-metadata";
import { buildFAQPage, buildService } from "@/lib/schema";

export const metadata = getPageMetadata("/services/epc");

const Page = () => {
  const faqs = getFAQsForRoute("/services/epc") ?? [];
  return (
    <div>
      <JsonLd
        id="epc"
        data={[
          buildService({
            name: "Energy Performance Certificates",
            description: "Domestic and commercial EPCs for landlords, sellers and property owners across London, with fast turnaround. Residential certificates from £33.",
            path: "/services/epc",
            serviceType: "Energy Performance Certificate",
          }),
          buildFAQPage(faqs),
        ]}
      />
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
