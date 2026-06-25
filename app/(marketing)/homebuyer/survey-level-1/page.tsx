import Footer from "@/components/common/Footer";
import BookingForm from "@/fragments/homebuyer/BookingForm";
import WhatIsIncluded from "@/fragments/homebuyer/survey1/WhatsIncluded";
import SurveyDetails from "@/fragments/homebuyer/SurveyDetails";
import SurveysHaeder from "@/fragments/homebuyer/SurveysHaeder";
import { sourceSans } from "@/lib/fonts";
import { getPageMetadata } from "@/lib/page-metadata";
import { Home } from "lucide-react";


export const metadata = getPageMetadata("/homebuyer/survey-level-1");

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
                RICS Level 1 Survey: Condition Report
              </h3>
              <p
                className={`px-4 py-1 rounded-full text-sm w-fit h-9 flex justify-center items-center  font-medium bg-green-100 text-green-700 ${sourceSans.className}`}
              >
                Best for newer homes
              </p>
              <div className="mt-8 text-lg text-[#4A5565]">
                A straightforward overview of the property&apos;s condition
                using a simple traffic light rating system
              </div>
            </div>
          </div>
        </div>
      </SurveysHaeder>
      <WhatIsIncluded />
      <SurveyDetails
        duration="1-2 hours"
        deliveryTime="same-day"
        features={[
          "Ideal for new builds and standardised properties built within the last 5-10 years",
          "Perfect for obtaining a brief insight of the property condition",
          "Appropriate for unaltered and non-extended property",
          "Not suitable for older, larger or non-traditional properties",
        ]}
      />
      <div className="py-20 lg:py-24">
        <BookingForm
          surveyLevel={1}
          surveyTitle="Level 1 — Home Conditions Survey"
        />
      </div>
      <Footer />
    </div>
  );
};

export default Page;
