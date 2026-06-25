import Footer from "@/components/common/Footer";
import BookingForm from "@/fragments/homebuyer/BookingForm";
import AdditionalServices from "@/fragments/homebuyer/survey2/AdditionalServices";
import WhatIsIncluded2 from "@/fragments/homebuyer/survey2/WhatsIncluded";
import SurveyDetails from "@/fragments/homebuyer/SurveyDetails";
import SurveysHaeder from "@/fragments/homebuyer/SurveysHaeder";
import { sourceSans } from "@/lib/fonts";
import { getPageMetadata } from "@/lib/page-metadata";
import { Home } from "lucide-react";

export const metadata = getPageMetadata("/homebuyer/survey-level-2");

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
                RICS Level 2 Survey: Homebuyer Report
              </h3>
              <p
                className={`px-4 py-1 rounded-full text-sm w-fit h-9 flex justify-center items-center  font-medium bg-blue-100 text-blue-700 ${sourceSans.className}`}
              >
                Most common choice
              </p>
            </div>
          </div>
        </div>
      </SurveysHaeder>
      <WhatIsIncluded2 />
      <SurveyDetails
        duration="2-3 hours"
        deliveryTime="next-day"
        features={[
          "Ideal for modern and conventional properties built in the last 30 years",
          "Most popular choice for standard residential properties",
          "Appropriate for unaltered and non-extended property",
          "Not suitable for older, larger or non-traditional properties",
        ]}
      />
      <AdditionalServices />
      <div className="py-20 lg:py-24">
        <BookingForm
          surveyLevel={2}
          surveyTitle="Level 2 — Homebuyer Survey"
        />
      </div>
      <Footer />
    </div>
  );
};

export default Page;
