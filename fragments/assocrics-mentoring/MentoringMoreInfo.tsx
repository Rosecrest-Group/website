"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Phone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { sourceSans } from "@/lib/fonts";
import { useEnquiryStore } from "@/store/enquiry-store";
import { Reveal } from "@/components/common/Reveal";
import { PHONE, PHONE_HREF } from "@/lib/constants";

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

const MentoringMoreInfo = () => {
  const { openEnquiry } = useEnquiryStore();

  return (
    <section className="py-16 px-4" id="more-info">
      <div className="max-w-7xl mx-auto">
        <Reveal animation="fade-up" duration={600}>
          <div className="bg-linear-to-b from-[#31368B] to-[#1A1D4F] rounded-[24px] lg:rounded-[3rem] p-8 lg:p-12">
            <Reveal animation="zoom-in" duration={600} delay={150}>
              <div className="relative rounded-2xl lg:rounded-[24px] overflow-hidden">
                <div className="relative sm:h-80 lg:h-134.25 flex justify-center items-center">
                  <Image
                    src="/assets/images/availability-bg.jpg"
                    alt="Professional mentoring discussion"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-[#0000004D]" />

                  <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-[85%] backdrop-blur-[20px] bg-[#FFFFFF26] py-8 sm:h-99 rounded-[24px]">
                    <Reveal animation="fade-up" duration={500} delay={300}>
                      <h2 className="text-white text-3xl lg:text-5xl mb-4 font-medium leading-tight">
                        Start with a free suitability call
                      </h2>
                    </Reveal>

                    <Reveal animation="fade-up" duration={500} delay={400}>
                      <p
                        className={`${sourceSans.className} text-white/90 text-base lg:text-xl mb-8 max-w-xl`}
                      >
                        Book your free 30-minute suitability call to discuss your
                        AssocRICS pathway and how Rosecrest can support your
                        development.
                      </p>
                    </Reveal>

                    <Reveal animation="fade-up" duration={500} delay={500}>
                      <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                        <Button
                          size="lg"
                          onClick={() => {
                            trackCta("Get Started Now");
                            openEnquiry(
                              "AssocRICS Mentoring — free suitability call"
                            );
                          }}
                          className="bg-[#DBB38E] hover:bg-[#DBB38E]/90 text-[#151515] px-8 py-6 rounded-full text-base font-medium"
                        >
                          Book your free suitability call
                        </Button>
                        <Link href={PHONE_HREF}>
                          <Button
                            size="lg"
                            variant="outline"
                            className="bg-transparent border border-white/40 hover:bg-white/10 text-white px-8 py-6 rounded-full text-base font-medium backdrop-blur-sm"
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            {PHONE}
                          </Button>
                        </Link>
                      </div>
                    </Reveal>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal animation="fade-up" duration={500} delay={100}>
              <div className="mt-8 text-center">
                <Link
                  href="/services"
                  className={`${sourceSans.className} inline-flex items-center gap-2 text-white hover:text-white/90 transition-colors text-base lg:text-2xl group`}
                >
                  Looking for a different service? View all property services
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </Reveal>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default MentoringMoreInfo;
