"use client";
import Image from "next/image";
import { sourceSans } from "@/lib/fonts";
import { Reveal } from "@/components/common/Reveal";

const AboutDescription = () => {
  return (
    <div className="bg-[#FBF7F4]">
      <div className="grid lg:grid-cols-2 px-2 sm:px-0 py-12 lg:py-20 gap-8 lg:gap-16 items-center max-w-7xl mx-auto">
        {/* Left Column - Text */}
        <Reveal animation="fade-right" duration={600}>
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl lg:text-5xl font-bold text-[#101828] mb-8 leading-tight">
              Property insight. Professional certainty. Delivered correctly.
            </h2>

            <div
              className={`${sourceSans.className} text-base lg:text-lg text-[#4A5565] leading-relaxed space-y-5 w-[90%]`}
            >
              <p>
                At Rosecrest Group Ltd, we provide professional, compliant, and
                evidence-based property services across London, the M25
                corridor, and surrounding regions.
              </p>
              <p>
                We work with homeowners, landlords, managing agents, developers,
                and commercial clients by first taking the time to understand
                their objectives, concerns, and requirements. This ensures that
                any inspections, advice, or building services are correctly
                scoped and aligned with the clients’ intended outcomes.
              </p>
              <p>
                Operating within a RICS-regulated firm framework, our services
                are delivered by skilled surveyors and qualified trade
                professionals, providing clear inspections, regulated advice,
                and practical building solutions.
              </p>
              <p>
                Our purpose is simple: to help clients understand their
                buildings, manage risk, and protect long-term value through
                accurate assessment, accountable delivery, and a strong
                commitment to client satisfaction.
              </p>
            </div>
          </div>
        </Reveal>

        {/* Right Column - Image */}
        <Reveal animation="fade-left" duration={700} delay={150}>
          <div className="relative flex justify-end">
            <Image
              src="/assets/images/about.png"
              alt="Rosecrest surveyor conducting a property inspection"
              height={578}
              width={573}
              className="object-cover rounded-[24px]"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default AboutDescription;
