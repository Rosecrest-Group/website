"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Phone, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { sourceSans } from "@/lib/fonts";
import { OpenBookingModal } from "@/types/homebuyer";
import TermsModal from "@/components/common/TermsModal";
import SampleReportsModal from "@/components/common/SampleReportsModal";
import { Reveal } from "@/components/common/Reveal";

interface MoreInfoProps {
  onOpenBooking: OpenBookingModal;
}

const MoreInfo = ({ onOpenBooking }: MoreInfoProps) => {
  const [termsOpen, setTermsOpen] = useState(false);
  const [samplesOpen, setSamplesOpen] = useState(false);
  
  return (
    <>
      <section className="py-16 lg:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <Reveal animation="fade-up" duration={600}>
            <div className="bg-linear-to-b from-[#31368B] to-[#1A1D4F] rounded-[24px] lg:rounded-[3rem] p-8 lg:p-12">
              {/* Need more information section */}
              <div className="mb-12">
                <Reveal animation="fade-up" duration={500} delay={100}>
                  <h2 className="text-white text-3xl lg:text-4xl font-bold text-center mb-8 lg:mb-12">
                    Need more information?
                  </h2>
                </Reveal>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-auto mb-12">
                  {/* Sample Report — opens modal */}
                  <button
                    onClick={() => setSamplesOpen(true)}
                    className="bg-white rounded-3xl p-8 flex flex-col items-center text-center hover:shadow-lg transition-shadow group border border-[#E5E7EB]"
                  >
                    <div className="bg-linear-to-b from-[#262A6F] to-[#1A1D4F] rounded-xl p-4 mb-4 group-hover:scale-110 transition-transform">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-[#101828] leading-7 text-xl font-bold mb-2">
                      Sample Report Preview
                    </h3>
                    <p
                      className={`${sourceSans.className} text-[#4A5565] text-sm lg:text-base`}
                    >
                      View examples of our survey reports
                    </p>
                  </button>

                  {/* Terms of Engagement — opens modal */}
                  <button
                    onClick={() => setTermsOpen(true)}
                    className="bg-white rounded-3xl p-8 flex flex-col items-center text-center hover:shadow-lg transition-shadow group border border-[#E5E7EB]"
                  >
                    <div className="bg-linear-to-b from-[#262A6F] to-[#1A1D4F] rounded-xl p-4 mb-4 group-hover:scale-110 transition-transform">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-[#101828] leading-7 text-xl font-bold mb-2">
                      Terms Of Engagement
                    </h3>
                    <p
                      className={`${sourceSans.className} text-[#4A5565] text-sm lg:text-base`}
                    >
                      View our terms of engagement
                    </p>
                  </button>

                  {/* Speak with team */}
                  <Link
                    href="/contact"
                    className="bg-white rounded-3xl p-8 flex flex-col items-center text-center hover:shadow-lg transition-shadow group border border-[#E5E7EB]"
                  >
                    <div className="bg-linear-to-b from-[#262A6F] to-[#1A1D4F] rounded-xl p-4 mb-4 group-hover:scale-110 transition-transform">
                      <Phone className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-[#101828] leading-7 text-xl font-bold mb-2">
                      Speak with our team
                    </h3>
                    <p
                      className={`${sourceSans.className} text-[#4A5565] text-sm lg:text-base`}
                    >
                      For more information
                    </p>
                  </Link>
                </div>
              </div>

              {/* Availability Check Section */}
              <Reveal animation="zoom-in" duration={600} delay={150}>
                <div className="relative rounded-2xl lg:rounded-[24px] overflow-hidden">
                  <div className="relative h-80 lg:h-115.75 flex justify-center items-center">
                    <Image
                      src="/assets/images/availability-bg.jpg"
                      alt="Property background"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-[#0000004D]" />

                    <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-[85%] backdrop-blur-[20px] bg-[#FFFFFF26] py-8 sm:h-87.5 rounded-[24px]">
                      <Reveal animation="fade-up" duration={500} delay={300}>
                        <h2 className="text-white text-xl lg:text-5xl mb-6 font-medium max-w-3xl leading-tight">
                          Ready to check availability and get a fixed price?
                        </h2>
                      </Reveal>

                      <Reveal animation="fade-up" duration={500} delay={420}>
                        <Button
                          size="lg"
                          className="bg-[#DBB38E] h-12 hover:bg-[#DBB38E]/90 text-[#151515] px-8 py-6 rounded-full text-base lg:text-lg mb-12 leading-7"
                          onClick={() =>
                            onOpenBooking()
                          }
                        >
                          Check Availability & Fixed Price
                        </Button>
                      </Reveal>

                      <Reveal animation="fade" duration={400} delay={520}>
                        <p className="text-white text-sm">
                          Takes less than 60 seconds.
                        </p>
                      </Reveal>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Footer Link */}
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

      <TermsModal isOpen={termsOpen} onClose={() => setTermsOpen(false)} />
      <SampleReportsModal
        isOpen={samplesOpen}
        onClose={() => setSamplesOpen(false)}
      />
    </>
  );
};

export default MoreInfo;
