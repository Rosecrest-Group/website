"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { sourceSans } from "@/lib/fonts";
import { useEnquiryStore } from "@/store/enquiry-store";
import { Reveal } from "@/components/common/Reveal";

const badges = [
  "Surveyor-led",
  "Evidence-based",
  "Written report included",
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

const ThermoDescription = () => {
  const { openEnquiry } = useEnquiryStore();

  return (
    <div className="bg-[#FBF7F4]">
      <div className="grid lg:grid-cols-2 px-4 sm:px-6 py-12 lg:py-20 gap-8 items-center max-w-7xl mx-auto">
        <Reveal animation="fade-right" duration={600}>
          <div className="flex flex-col justify-center">
            <div
              className={`${sourceSans.className} text-base lg:text-xl text-[#4A5565] leading-8 w-full lg:w-[90%] space-y-4 mb-6`}
            >
              <p>
                Rosecrest Group Ltd provides non-invasive thermographic surveys
                using infrared imaging to identify surface-temperature patterns
                that may be associated with heat loss, defective or missing
                insulation, thermal bridging, air leakage, condensation, moisture
                and water ingress.
              </p>
              <p>
                Our survey combines thermal images with corresponding
                conventional photographs, professional interpretation and
                practical recommendations. Where appropriate, findings may also
                be considered alongside visual observations and moisture
                readings.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-6">
              {badges.map((badge, index) => (
                <span key={badge} className="flex items-center gap-1.5">
                  <div
                    className={`flex items-center gap-1.5 text-[#4A5565] ${sourceSans.className}`}
                  >
                    <CheckCircle
                      className="w-4 h-4 text-[#DBB38E]"
                      strokeWidth={1.5}
                    />
                    <span className="text-sm">{badge}</span>
                  </div>
                  {index < badges.length - 1 && (
                    <div className="w-1 h-1 rounded-full bg-[#4A5565]/40" />
                  )}
                </span>
              ))}
            </div>

            <div>
              <Button
                size="lg"
                onClick={() => {
                  trackCta("Request thermographic survey quote");
                  openEnquiry("Thermographic Building Survey");
                }}
                className="bg-[#262A6F] hover:bg-[#262A6F]/90 text-white px-8 py-6 text-base rounded-full"
              >
                Request a thermographic survey quote
              </Button>
            </div>
          </div>
        </Reveal>

        <Reveal animation="fade-left" duration={700} delay={150}>
          <div className="relative flex justify-end">
            <Image
              src="/assets/images/damp-mould-survey.png"
              alt="Surveyor inspecting a residential building exterior"
              height={548}
              width={539}
              className="object-cover rounded-2xl"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default ThermoDescription;
