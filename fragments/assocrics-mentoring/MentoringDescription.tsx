"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { sourceSans } from "@/lib/fonts";
import { useEnquiryStore } from "@/store/enquiry-store";
import { Reveal } from "@/components/common/Reveal";

const badges = [
  "AssocRICS pathway support",
  "Structured mentoring",
  "Developmental feedback",
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

const MentoringDescription = () => {
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
                Rosecrest Group Ltd provides structured mentoring and counsellor
                support for surveying professionals working towards Associate
                membership of RICS.
              </p>
              <p>
                Our support is tailored to each candidate&apos;s pathway,
                experience and development needs.
              </p>
            </div>

            <div className="rounded-2xl border border-[#DBB38E]/40 bg-white px-5 py-4 mb-6">
              <p
                className={`${sourceSans.className} text-sm lg:text-base text-[#4A5565] leading-relaxed`}
              >
                <span className="font-semibold text-[#101828]">
                  Scope note:{" "}
                </span>
                This service currently relates to AssocRICS candidates. Rosecrest
                must not be advertised as providing official MRICS/APC counselling
                or sign-off unless the appointed counsellor is MRICS or FRICS.
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
                  trackCta("Book free suitability call");
                  openEnquiry("AssocRICS Mentoring — free suitability call");
                }}
                className="bg-[#262A6F] hover:bg-[#262A6F]/90 text-white px-8 py-6 text-base rounded-full"
              >
                Book your free 30-minute suitability call
              </Button>
            </div>
          </div>
        </Reveal>

        <Reveal animation="fade-left" duration={700} delay={150}>
          <div className="relative flex justify-end">
            <Image
              src="/assets/images/legal-professionals.png"
              alt="Surveying professionals in discussion"
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

export default MentoringDescription;
