import Footer from "@/components/common/Footer";
import BookingForm from "@/fragments/homebuyer/BookingForm";
import WhyLevel3 from "@/fragments/homebuyer/survey3/WhyLevel3";
import SurveyDetails from "@/fragments/homebuyer/SurveyDetails";
import SurveyOverview from "@/fragments/homebuyer/SurveyOverview";
import SurveysHaeder from "@/fragments/homebuyer/SurveysHaeder";
import { sourceSans } from "@/lib/fonts";
import { getPageMetadata } from "@/lib/page-metadata";
import { Home } from "lucide-react";


export const metadata = getPageMetadata("/homebuyer/survey-level-3");

const Page = () => {
  return (
    <div>
      <SurveysHaeder>
        <div className="flex items-start justify-between my-8 px-1">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="bg-[#262A6F] rounded-lg grid place-items-center h-16 w-16 shrink-0">
              <Home className="w-8 h-8 text-white" />
            </div>

            {/* Title and Badge */}
            <div className="flex flex-col items-start">
              <h3 className="text-xl lg:text-[48px] leading-9 font-bold text-gray-900 mb-4">
                RICS Level 3 Survey: Building Survey
              </h3>
              <p
                className={`px-4 py-1 rounded-full text-sm w-fit h-9 flex justify-center items-center  font-medium bg-[#F3E8FF] text-[#8200DB] ${sourceSans.className}`}
              >
                Most comprehensive
              </p>
            </div>
          </div>
        </div>
      </SurveysHaeder>
      <SurveyOverview
        surveyLevel={3}
        title="What is the RICS Level 3 Survey?"
        description="The RICS Level 3 Survey, also known as a Building Survey, provides an in-depth inspection of the property, including any significant defects and fixtures. This detailed report is designed to help buyers make informed decisions about whether to proceed with their purchase. While our surveyors cannot advise on whether to proceed or withdraw from a purchase, this survey is particularly recommended for older or heritage buildings, which may have structural concerns or restrictions on modifications."
        includedTitle="What's included in a Building Survey?"
        includedItems={[
          {
            title: "Comprehensive inspection with a detailed, thorough report",
            description:
              "A full analysis of the property's construction and condition, examining all accessible areas including roofs, floors, walls, and services.",
          },
          {
            title:
              "Identification of visible defects and assessment of potential future problems",
            description:
              "Detailed analysis of current issues and expert predictions about potential problems if repairs aren't addressed promptly.",
          },
          {
            title: "Optional estimated repair costs for identified issues",
            description:
              "Budget planning assistance with estimated costs for necessary repairs and maintenance work.",
          },
        ]}
        note="A valuation is not included with this survey, but a separate, discounted valuation can be provided upon request."
      />
      <SurveyDetails
        duration="2-3 hours"
        deliveryTime="next-day"
        features={[
          "Ideal for older, altered or non-standard buildings",
          "Perfect for heritage and listed properties",
          "Full defect analysis with repair implications and optional costings",
          "For buyers who want certainty and comprehensive information",
          "Recommended for properties requiring significant renovation or restoration",
        ]}
      />
      <WhyLevel3 />
      <div className="py-20 lg:py-24">
        <BookingForm
          surveyLevel={3}
          surveyTitle="Level 3 — Building Survey"
        />
      </div>
      <Footer />
    </div>
  );
};

export default Page;
