"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Award, CheckCircle, ChevronRight, Clock, Phone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { sourceSans } from "@/lib/fonts";
import { useRouter } from "next/navigation";

const trust = [
  {
    icon: <CheckCircle className="w-4 h-4 text-[#DBB38E]" />,
    label: "RICS Regulated",
  },
  { icon: <Clock className="w-4 h-4 text-[#DBB38E]" />, label: "24h Response" },
  { icon: <Award className="w-4 h-4 text-[#DBB38E]" />, label: "Independent" },
];

const CPRMoreInfo = () => {
  const router = useRouter();
  return (
    <section className="py-16 px-4" id="more-info">
      <div className="max-w-7xl mx-auto">
        {/* Main Container with rounded background */}
        <div className="bg-linear-to-b from-[#31368B] to-[#1A1D4F] rounded-[24px] lg:rounded-[3rem] p-8 lg:p-12">
          {/* Availability Check Section */}
          <div className="relative rounded-2xl lg:rounded-[24px] overflow-hidden">
            {/* Background Image */}
            <div className="relative sm:h-80 lg:h-134.25 flex justify-center items-center">
              <Image
                src="/assets/images/availability-bg.jpg"
                alt="Property background"
                fill
                className="object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-[#0000004D]" />

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-[85%] backdrop-blur-[20px] bg-[#FFFFFF26] py-8 sm:h-99 rounded-[24px]">
                <h2 className="text-white text-3xl lg:text-6xl mb-4 font-medium leading-tight">
                  Need help quickly?
                </h2>

                <p
                  className={`${sourceSans.className} text-white/90 text-base lg:text-2xl mb-8 max-w-xl`}
                >
                  Speak to our expert team to discuss your requirements or book
                  your inspection today
                </p>

                {/* Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                  <Button
                    size="lg"
                    onClick={() => router.push("/request-inspection")}
                    className="bg-[#DBB38E] hover:bg-[#DBB38E]/90 text-[#151515] px-8 py-6 rounded-full text-base font-medium"
                  >
                    Request a discussion
                  </Button>
                  <Link href="tel:+442045765317">
                    <Button
                      size="lg"
                      variant="outline"
                      className="bg-transparent border border-white/40 hover:bg-white/10 text-white px-8 py-6 rounded-full text-base font-medium backdrop-blur-sm"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      020 4576 5317
                    </Button>
                  </Link>
                </div>

                {/* Trust indicators */}
                <div className="flex flex-wrap items-center justify-center gap-4 text-white/80">
                  {trust.map((item, i) => (
                    <React.Fragment key={i}>
                      <span className="flex items-center gap-1.5">
                        {item.icon}
                        <span className={sourceSans.className}>
                          {item.label}
                        </span>
                      </span>
                      {i < trust.length - 1 && (
                        <span className="text-white/40">•</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Link */}
          <div className="mt-8 text-center">
            <Link
              href="/services"
              className={`${sourceSans.className} inline-flex items-center gap-2 text-white hover:text-white/90 transition-colors text-base lg:text-2xl group`}
            >
              Looking for a different service? View all property services
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CPRMoreInfo;
