import Footer from "@/components/common/Footer";
import CPRDescription from "@/fragments/cpr/CPRDescription";
import CPRFAQ from "@/fragments/cpr/CPRFAQ";
import DINTestimonials from "@/fragments/cpr/DINTestimonials";
import ExpertWitness from "@/fragments/cpr/ExpertWitness";
import CPRMoreInfo from "@/fragments/cpr/MoreInfo";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import { sourceSans } from "@/lib/fonts";
import { getPageMetadata } from "@/lib/page-metadata";

export const metadata = getPageMetadata("/services/cpr-35-reports");

const Page = () => {
  return (
    <div>
      <JourneyHero>
        <p className="text-white text-4xl lg:text-5xl tracking-tight leading-16">
          Expert Witness CPR 35 Rules & Inspections
        </p>
        <p
          className={`${sourceSans.className} mt-10 max-w-230 mx-auto text-white text-xl lg:text-2xl leading-relaxed`}
        >
          A Part 35 Compliant Expert Witness report should include both facts
          and assumptions used by the Expert. It should also include any
          analysis and the Expert’s opinion on the matter.
        </p>
      </JourneyHero>
      <CPRDescription />
      <ExpertWitness />
      <DINTestimonials />
      <CPRMoreInfo />
      <CPRFAQ />
      <Footer />
    </div>
  );
};

export default Page;
