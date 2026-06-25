import Footer from "@/components/common/Footer";
import JsonLd from "@/components/common/JsonLd";
import CPRDescription from "@/fragments/cpr/CPRDescription";
import CPRFAQ from "@/fragments/cpr/CPRFAQ";
import DINTestimonials from "@/fragments/cpr/DINTestimonials";
import ExpertWitness from "@/fragments/cpr/ExpertWitness";
import CPRMoreInfo from "@/fragments/cpr/MoreInfo";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import { getFAQsForRoute } from "@/lib/faqs";
import { sourceSans } from "@/lib/fonts";
import { getPageMetadata } from "@/lib/page-metadata";
import { buildFAQPage, buildService } from "@/lib/schema";

export const metadata = getPageMetadata("/services/cpr-35-reports");

const Page = () => {
  const faqs = getFAQsForRoute("/services/cpr-35-reports") ?? [];
  return (
    <div>
      <JsonLd
        id="cpr-35"
        data={[
          buildService({
            name: "CPR-35 Expert Witness Reports",
            description:
              "Independent CPR-35 compliant expert witness reports for property disputes, prepared by RICS-regulated surveyors for solicitors and legal teams.",
            path: "/services/cpr-35-reports",
            serviceType: "Expert Witness Report",
          }),
          buildFAQPage(faqs),
        ]}
      />
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
