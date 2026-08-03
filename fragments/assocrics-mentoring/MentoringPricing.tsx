"use client";

import { Button } from "@/components/ui/button";
import { sourceSans } from "@/lib/fonts";
import { useEnquiryStore } from "@/store/enquiry-store";
import { Reveal } from "@/components/common/Reveal";
import { CheckCircle, Star } from "lucide-react";

const pricing = [
  { service: "Initial 30-minute suitability call", price: "Free" },
  {
    service: "One-hour pathway and competency consultation",
    price: "£120 incl. VAT",
  },
  {
    service: "Pay-as-you-go mentoring (per hour)",
    price: "£120 incl. VAT",
  },
  {
    service: "Mock Associate assessment with feedback",
    price: "£240 incl. VAT",
  },
  { service: "Submission compliance review", price: "£360 incl. VAT" },
  {
    service: "Re-review following candidate amendments",
    price: "£180 incl. VAT",
  },
  { service: "Monthly mentoring — one meeting", price: "£275 incl. VAT" },
  { service: "Monthly mentoring — two meetings", price: "£395 incl. VAT" },
  {
    service: "Official Counsellor Appointment and Governance Fee",
    price: "£450 incl. VAT",
  },
  {
    service: "Referred-candidate review and recovery plan",
    price: "£295 incl. VAT",
  },
];

const packageIncludes = [
  "Initial eligibility and suitability assessment.",
  "Pathway and competency mapping.",
  "Two one-hour meetings each month.",
  "Written actions following each meeting.",
  "Review of competency evidence and CPD.",
  "Developmental comments on candidate-prepared documents.",
  "Ethics and professional-practice preparation.",
  "One mock assessment.",
  "Continuing monitoring of assessment readiness.",
];

function trackCta(label: string) {
  if (typeof window === "undefined") return;
  const w = window as Window & { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({
    event: "service_enquiry_cta",
    service: "AssocRICS Mentoring",
    cta_label: label,
  });
}

const MentoringPricing = () => {
  const { openEnquiry } = useEnquiryStore();

  return (
    <section className="bg-[#FBF7F4] py-16 lg:py-24 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Reveal animation="fade-up" duration={600}>
          <h2 className="text-3xl lg:text-5xl font-bold text-[#101828] text-center mb-4 leading-tight">
            Pricing
          </h2>
          <p
            className={`${sourceSans.className} text-[#4A5565] text-base lg:text-lg text-center max-w-2xl mx-auto mb-10 lg:mb-14 leading-relaxed`}
          >
            All prices include VAT.
          </p>
        </Reveal>

        <Reveal animation="fade-up" duration={600} delay={100}>
          <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-sm mb-10 lg:mb-14">
            <table className="w-full min-w-[520px] text-left">
              <thead>
                <tr className="bg-[#262A6F] text-white">
                  <th className="px-5 py-4 text-sm font-semibold">Service</th>
                  <th className="px-5 py-4 text-sm font-semibold text-right whitespace-nowrap">
                    Price (incl. VAT)
                  </th>
                </tr>
              </thead>
              <tbody>
                {pricing.map((row, index) => (
                  <tr
                    key={row.service}
                    className={
                      index % 2 === 0 ? "bg-white" : "bg-[#FBF7F4]/70"
                    }
                  >
                    <td
                      className={`${sourceSans.className} px-5 py-4 text-sm lg:text-base text-[#4A5565]`}
                    >
                      {row.service}
                    </td>
                    <td className="px-5 py-4 text-sm lg:text-base font-semibold text-[#101828] text-right whitespace-nowrap">
                      {row.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        <Reveal animation="fade-up" duration={600} delay={150}>
          <div className="relative overflow-hidden rounded-[24px] border-2 border-[#DBB38E] bg-white p-8 lg:p-12">
            <div className="absolute -top-16 -right-12 w-40 h-40 rounded-full bg-[#DBB38E]/15 pointer-events-none" />

            <div className="relative flex flex-wrap items-start justify-between gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#262A6F] text-white px-3 py-1 text-xs font-medium mb-4">
                  <Star className="w-3.5 h-3.5 text-[#DBB38E]" />
                  Featured package
                </div>
                <h3 className="text-2xl lg:text-4xl font-bold text-[#101828] mb-3 leading-tight">
                  AssocRICS Guided Candidate Programme
                </h3>
                <p
                  className={`${sourceSans.className} text-lg lg:text-xl text-[#4A5565]`}
                >
                  <span className="font-semibold text-[#262A6F]">
                    £395 incl. VAT
                  </span>{" "}
                  per month, with a minimum three-month commitment.
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => {
                  trackCta("Enquire Guided Candidate Programme");
                  openEnquiry(
                    "AssocRICS Guided Candidate Programme — £395/month"
                  );
                }}
                className="bg-[#262A6F] hover:bg-[#262A6F]/90 text-white px-8 py-6 text-base rounded-full shrink-0"
              >
                Enquire about this package
              </Button>
            </div>

            <div className="relative grid sm:grid-cols-2 gap-3 lg:gap-4">
              {packageIncludes.map((item) => (
                <div key={item} className="flex gap-3 items-start">
                  <CheckCircle className="w-5 h-5 text-[#262A6F] shrink-0 mt-0.5" />
                  <p
                    className={`${sourceSans.className} text-sm lg:text-base text-[#4A5565] leading-relaxed`}
                  >
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default MentoringPricing;
