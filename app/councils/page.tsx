import Footer from "@/components/common/Footer";
import AssetHousingStock from "@/fragments/councils/AssetHousing";
import ClientLogos from "@/fragments/councils/Clientlogos";
import ComplianceRisk from "@/fragments/councils/ComplianceRisk";
import CouncilsDesc from "@/fragments/councils/CouncilsDesc";
import HousingExpertise from "@/fragments/councils/HousingExpertise";
// import HousingStandards from "@/fragments/councils/HousingStandards";
import LegalExpertServices from "@/fragments/councils/LegalServices";
import CouncilMoreInfo from "@/fragments/councils/MoreInfo";
import ProfessionalStandards from "@/fragments/councils/ProfessionalStandards";
import RecentWork from "@/fragments/councils/RecentWork";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import { sourceSans } from "@/lib/fonts";
import { getPageMetadata } from "@/lib/page-metadata";

export const metadata = getPageMetadata("/councils");

const Page = () => {
  return (
    <div>
      <JourneyHero>
        <div className="text-center">
          <p className="text-white text-3xl lg:text-5xl tracking-tight leading-16 sm:w-3/5 mx-auto">
            Inspection, Reporting & Remediation Services for Councils
          </p>
          <p
            className={`${sourceSans.className} mt-4 mx-auto text-white text-base lg:text-xl leading-relaxed max-w-4xl`}
          >
            Independent inspections, compliance assessments and remedial
            services supporting councils, housing associations and public sector
            organisations.
          </p>
        </div>
      </JourneyHero>
      <CouncilsDesc />
      <RecentWork />
      <ClientLogos />
      <HousingExpertise />
      <ComplianceRisk />
      <AssetHousingStock />
      <LegalExpertServices />
      <ProfessionalStandards />
      <CouncilMoreInfo />
      <Footer />
    </div>
  );
};

export default Page;
