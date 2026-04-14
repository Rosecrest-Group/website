"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { sourceSans } from "@/lib/fonts";

const expertServices = [
  "Building defects and poor workmanship",
  "Damage arising from building or renovation works",
  "Cracking, movement and structural concerns",
  "Damp, water ingress and associated damage",
  "Repair liability and remedial works disputes",
  "Neighbouring property damage and related building issues",
];

const reportIncludes = [
  "Relevant material facts",
  "Assumptions relied upon",
  "Technical analysis",
  "Independent expert opinion",
  "Basis of conclusions reached",
  "Expert qualifications and declaration",
];

const CPRDescription = () => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-[#FBF7F4]">
      {/* Intro — two column */}
      <div className="grid lg:grid-cols-2 px-2 sm:px-0 py-12 lg:py-20 gap-8 items-center max-w-7xl mx-auto">
        {/* Left Column */}
        <div className="flex flex-col justify-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-[#101828] mb-5 leading-tight">
            CPR 35 Expert Witness Inspections Explained
          </h2>

          <p className={`${sourceSans.className} text-base lg:text-lg text-[#4A5565] leading-8 mb-4 w-[90%]`}>
            We provide expert witness inspections and building reports prepared
            in accordance with{" "}
            <span className="font-semibold text-[#101828]">CPR Part 35</span>{" "}
            and the associated Practice Direction. In these matters, the
            expert&apos;s overriding duty is to the court — to provide an
            independent, impartial, and professionally reasoned opinion on
            technical building issues to assist the judge in determining the
            dispute.
          </p>

          <p className={`${sourceSans.className} text-base lg:text-lg text-[#4A5565] leading-8 mb-4 w-[90%]`}>
            Each instruction is approached carefully and objectively. Our
            reports set out the relevant facts, assumptions relied upon, the
            analysis undertaken, and the expert opinion reached — together with
            the basis for that opinion and the expert&apos;s qualifications. Reports
            are prepared clearly and professionally so they can properly assist
            the court in understanding technical matters that fall outside
            ordinary knowledge.
          </p>

          <p className={`${sourceSans.className} text-base lg:text-lg text-[#4A5565] leading-8 mb-8 w-[90%]`}>
            Whether the dispute concerns the cause of damage, the standard of
            works carried out, or the extent of necessary repairs, we provide
            focused building inspections and expert reporting to support legal
            proceedings with clarity and independence.
          </p>

          <div>
            <Button
              size="lg"
              onClick={() => scrollTo("more-info")}
              className="bg-[#262A6F] hover:bg-[#262A6F]/90 text-white px-8 py-6 text-base rounded-full"
            >
              Make an enquiry
            </Button>
          </div>
        </div>

        {/* Right Column - Image */}
        <div className="relative flex justify-end">
          <Image
            src="/assets/images/cpr.png"
            alt="CPR Part 35 expert witness inspection"
            height={578}
            width={573}
            className="object-cover rounded-2xl"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>

      {/* Two-column list section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-0 pb-12 lg:pb-20">
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Expert services */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-8">
            <h3 className="text-lg font-bold text-[#101828] mb-5">
              Our CPR Part 35 expert services may include:
            </h3>
            <ul className="space-y-3">
              {expertServices.map((item) => (
                <li
                  key={item}
                  className={`${sourceSans.className} flex items-start gap-3 text-[#4A5565] text-sm lg:text-base`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#262A6F] shrink-0 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Report includes */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-8">
            <h3 className="text-lg font-bold text-[#101828] mb-5">
              What our reports include:
            </h3>
            <ul className="space-y-3">
              {reportIncludes.map((item) => (
                <li
                  key={item}
                  className={`${sourceSans.className} flex items-start gap-3 text-[#4A5565] text-sm lg:text-base`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DBB38E] shrink-0 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Closing CTA line */}
        <p className={`${sourceSans.className} text-center text-[#4A5565] text-base lg:text-lg mt-8 font-medium`}>
          If you require an expert witness inspection or CPR Part 35 building
          report,{" "}
          <button
            onClick={() => scrollTo("more-info")}
            className="text-[#262A6F] underline underline-offset-2 hover:text-[#262A6F]/80 transition-colors"
          >
            contact us to discuss your matter
          </button>
          .
        </p>
      </div>
    </div>
  );
};

export default CPRDescription;