"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { sourceSans } from "@/lib/fonts";
import { useEnquiryStore } from "@/store/enquiry-store";
import { Reveal } from "@/components/common/Reveal";

type PriceRow = {
  service: ReactNode;
  price: string;
};

const pricing: PriceRow[] = [
  {
    service: (
      <>
        Add-on to an{" "}
        <Link
          href="/homebuyer/survey-level-2"
          className="text-[#262A6F] underline underline-offset-2 hover:text-[#1A1D4F]"
        >
          RICS Level 2
        </Link>{" "}
        or{" "}
        <Link
          href="/homebuyer/survey-level-3"
          className="text-[#262A6F] underline underline-offset-2 hover:text-[#1A1D4F]"
        >
          Level 3
        </Link>{" "}
        survey
      </>
    ),
    price: "£175 incl. VAT",
  },
  {
    service: "Apartment or small flat heat-loss survey",
    price: "£325 incl. VAT",
  },
  {
    service: "House with up to three bedrooms",
    price: "£395 incl. VAT",
  },
  {
    service: "Four- or five-bedroom house",
    price: "£475 incl. VAT",
  },
  {
    service: "Targeted damp, moisture or leak investigation",
    price: "From £425 incl. VAT",
  },
  {
    service: "Roof or water-ingress thermographic investigation",
    price: "From £475 incl. VAT",
  },
  {
    service: "Larger or more complex residential property",
    price: "From £575 incl. VAT",
  },
  {
    service: "Commercial thermographic survey",
    price: "Bespoke quotation",
  },
  {
    service:
      "Additional attendance where the original environmental conditions were unsuitable",
    price: "£150 incl. VAT",
  },
];

function trackCta(label: string) {
  if (typeof window === "undefined") return;
  const w = window as Window & { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({
    event: "service_enquiry_cta",
    service: "Thermographic Survey",
    cta_label: label,
  });
}

const ThermoPricing = () => {
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
            All prices include VAT. Each survey includes the inspection and a
            written report.
          </p>
        </Reveal>

        <Reveal animation="fade-up" duration={600} delay={100}>
          <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-sm mb-8">
            <table className="w-full min-w-[560px] text-left">
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
                    key={index}
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

        <Reveal animation="fade-up" duration={500} delay={150}>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => {
                trackCta("Request quote from pricing");
                openEnquiry("Thermographic Building Survey");
              }}
              className="bg-[#262A6F] hover:bg-[#262A6F]/90 text-white px-8 py-6 text-base rounded-full"
            >
              Request a thermographic survey quote
            </Button>
            <Link
              href="/homebuyer"
              className={`${sourceSans.className} text-[#262A6F] text-sm lg:text-base underline underline-offset-2 hover:text-[#1A1D4F]`}
            >
              Already booking a Level 2 or Level 3 survey? Add thermography for
              £175
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default ThermoPricing;
