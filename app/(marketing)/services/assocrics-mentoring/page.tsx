import Footer from "@/components/common/Footer";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import MentoringDescription from "@/fragments/assocrics-mentoring/MentoringDescription";
import MentoringServices from "@/fragments/assocrics-mentoring/MentoringServices";
import MentoringPricing from "@/fragments/assocrics-mentoring/MentoringPricing";
import MentoringDisclaimer from "@/fragments/assocrics-mentoring/MentoringDisclaimer";
import MentoringMoreInfo from "@/fragments/assocrics-mentoring/MentoringMoreInfo";
import MentoringFAQ from "@/fragments/assocrics-mentoring/MentoringFAQ";
import { sourceSans } from "@/lib/fonts";
import { getPageMetadata } from "@/lib/page-metadata";
import PageJsonLd from "@/components/common/PageJsonLd";

export const metadata = getPageMetadata("/services/assocrics-mentoring");

const Page = () => {
  return (
    <div>
      <PageJsonLd path="/services/assocrics-mentoring" />
      <JourneyHero>
        <h1 className="text-white text-4xl lg:text-5xl tracking-tight leading-16 sm:w-4/5 mx-auto">
          AssocRICS Candidate Mentoring &amp; Counsellor Support
        </h1>
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
