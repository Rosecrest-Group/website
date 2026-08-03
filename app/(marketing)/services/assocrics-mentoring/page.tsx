import Footer from "@/components/common/Footer";
import JsonLd from "@/components/common/JsonLd";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import MentoringDescription from "@/fragments/assocrics-mentoring/MentoringDescription";
import MentoringServices from "@/fragments/assocrics-mentoring/MentoringServices";
import MentoringPricing from "@/fragments/assocrics-mentoring/MentoringPricing";
import MentoringDisclaimer from "@/fragments/assocrics-mentoring/MentoringDisclaimer";
import MentoringMoreInfo from "@/fragments/assocrics-mentoring/MentoringMoreInfo";
import MentoringFAQ from "@/fragments/assocrics-mentoring/MentoringFAQ";
import { getFAQsForRoute } from "@/lib/faqs";
import { sourceSans } from "@/lib/fonts";
import { getPageMetadata } from "@/lib/page-metadata";
import { buildFAQPage, buildService } from "@/lib/schema";

export const metadata = getPageMetadata("/services/assocrics-mentoring");

const Page = () => {
  const faqs = getFAQsForRoute("/services/assocrics-mentoring") ?? [];

  return (
    <div>
      <JsonLd
        id="assocrics-mentoring"
        data={[
          buildService({
            name: "AssocRICS Candidate Mentoring and Counsellor Support",
            description:
              "Structured mentoring and counsellor support for surveying professionals working towards Associate membership of RICS.",
            path: "/services/assocrics-mentoring",
            serviceType: "Professional Mentoring",
          }),
          buildFAQPage(faqs),
        ]}
      />
      <JourneyHero>
        <p className="text-white text-4xl lg:text-5xl tracking-tight leading-16 sm:w-4/5 mx-auto">
          AssocRICS Candidate Mentoring &amp; Counsellor Support
        </p>
        <p
          className={`${sourceSans.className} mt-10 max-w-3xl mx-auto text-white text-xl lg:text-2xl leading-relaxed`}
        >
          Structured mentoring for surveying professionals working towards
          Associate membership of RICS.
        </p>
      </JourneyHero>
      <MentoringDescription />
      <MentoringServices />
      <MentoringPricing />
      <MentoringDisclaimer />
      <MentoringFAQ />
      <MentoringMoreInfo />
      <Footer />
    </div>
  );
};

export default Page;
