import Footer from "@/components/common/Footer";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import InstructionProcess from "@/fragments/legal/InstructionProcess";
import LegalAidInstructions from "@/fragments/legal/LegalAid";
import LegalDesc from "@/fragments/legal/LegalDisc";
import LegalMoreInfo from "@/fragments/legal/LegalMoreInfo";
import ProfessionalStandardsLegal from "@/fragments/legal/LegalProfessionalStandards";
import LegalServices from "@/fragments/legal/LegalServices";
import MLATestimonials from "@/fragments/legal/MLATestimonials";
import { sourceSans } from "@/lib/fonts";
import { getPageMetadata } from "@/lib/page-metadata";

export const metadata = getPageMetadata("/legal");

const Page = () => {
  return (
    <div>
      <JourneyHero>
        <div className="text-center">
          <p className="text-white text-3xl lg:text-5xl tracking-tight leading-16 sm:w-3/5 mx-auto mt-4">
            Independent Property Inspection and Expert Reporting for Legal
            Matters
          </p>
          <p
            className={`${sourceSans.className} mt-4 mx-auto text-white text-base lg:text-xl leading-relaxed max-w-5xl`}
          >
            Independent inspections and professional reports prepared to support
            legal claims, housing disputes and formal proceedings with clear,
            evidence-based findings.
          </p>
        </div>
      </JourneyHero>
      <LegalDesc />
      <LegalServices />
      <ProfessionalStandardsLegal />
      <InstructionProcess />
      <LegalAidInstructions />
      <MLATestimonials />
      <LegalMoreInfo />
      <Footer />
    </div>
  );
};

export default Page;
