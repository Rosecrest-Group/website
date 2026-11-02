"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { sourceSans } from "@/lib/fonts";
import Link from "next/link";
import { Reveal } from "@/components/common/Reveal";
import { useEnquiryStore } from "@/store/enquiry-store";

interface Service {
  badge: string | null;
  title: string;
  description: string;
  features: string[];
  link?: string;       // if set, navigates to a service page
  enquiry?: string;    // if set, opens modal with this context
  cta: string;
}

const services: Service[] = [
  {
    badge: "Clear pricing",
    title: "Damp, Mould & Condensation",
    description:
      "Independent, non-invasive inspections with clear pricing. Suited to tenant complaints and compliance requirements.",
    features: [
      "Damp, Mould and Condensation Survey from £540 incl. VAT, subject to scope",
      "Treatment: £25 per m² transparent pricing",
      "Full booking & cost calculator available",
    ],
    link: "/services/damp-mould",
    cta: "Book Damp & Mould Survey",
  },
  {
    badge: null,
    title: "HHSRS Assessment",
    description:
      "Formal hazard assessment and compliance reporting for Housing Health & Safety standards.",
    features: [
      "Formal hazard assessment",
      "Compliance reporting",
      "Housing Health & Safety Rating System",
    ],
    enquiry: "HHSRS Assessment",
    cta: "Request a discussion",
  },
  {
    badge: null,
    title: "Disrepair & Condition Surveys",
    description:
      "Independent condition assessment and scope of works reporting for property disputes.",
    features: [
      "Independent condition assessment",
      "Scope of works reporting",
      "Evidence for dispute resolution",
    ],
    enquiry: "Disrepair & Condition Survey",
    cta: "Request a discussion",
  },
  {
    badge: null,
    title: "Energy Performance Certificates",
    description:
      "Energy Performance Certificates (EPC) for rental compliance with fast turnaround and 10-year validity.",
    features: [
      "Compliance with rental requirements",
      "Valid for 10 years",
      "Fast turnaround available",
    ],
    enquiry: "Energy Performance Certificate (EPC)",
    cta: "Request a discussion",
  },
];

const remedialCard = {
  title: "Property Support & Remedial Services",
  description1:
    "Where remedial work or property preparation is required, Rosecrest can also assist with a range of practical property services through our trusted trade network.",
  description2:
    "These services can support landlords and property owners in addressing issues identified during inspections or preparing properties for tenants. Services include property preparation, cleaning, maintenance and other specialist trade works.",
  link: "/services?tab=trade",
  cta: "Explore Property Services",
};

const LandlordsServices = () => {
  const { openEnquiry } = useEnquiryStore();

  return (
    <section id="services" className="max-w-7xl mx-auto py-16 px-4">
      {/* Header */}
      <Reveal animation="fade-up" duration={600}>
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#101828] mb-4">
            Services for Landlords And Property Owners
          </h2>
          <p className={`${sourceSans.className} text-[#6A7282] text-base lg:text-lg max-w-150 mx-auto`}>
            Professional inspections, compliance reporting and support services
            to help landlords and owners address tenant complaints and building
            condition issues.
          </p>
        </div>
      </Reveal>

      {/* Services Grid */}
      <Reveal animation="fade-up" duration={600} delay={100}>
        <div className="grid lg:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="relative bg-white border border-gray-200 rounded-4xl p-8 flex flex-col w-full"
            >
              {service.badge && (
                <div className="absolute -top-4 left-8">
                  <span className="inline-block bg-[#DBB38E] text-[#151515] text-sm font-medium px-4 shadow-sm py-1.5 rounded-full">
                    {service.badge}
                  </span>
                </div>
              )}

              <h3 className="text-3xl font-bold text-[#101828] mb-3 mt-2">
                {service.title}
              </h3>

              <p className={`${sourceSans.className} text-[#4A5565] text-xl mb-6 leading-relaxed`}>
                {service.description}
              </p>

              <ul className="space-y-3 mb-8 flex-1">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#DBB38E] shrink-0" />
                    <span className={`${sourceSans.className} text-[#364153] text-base`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Link navigates to service page; enquiry opens modal */}
              {service.link ? (
                <Link href={service.link}>
                  <Button
                    size="lg"
                    className="bg-[#262A6F] hover:bg-[#262A6F]/90 text-white px-5 h-14 py-6 text-base rounded-full flex items-center gap-2 justify-center w-full"
                  >
                    {service.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Button
                  size="lg"
                  onClick={() => openEnquiry(service.enquiry)}
                  className="bg-[#262A6F] hover:bg-[#262A6F]/90 text-white px-5 h-14 py-6 text-base rounded-full flex items-center gap-2 justify-center"
                >
                  {service.cta}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          ))}

          {/* Remedial card — centred as 5th odd item */}
          <div className="lg:col-span-2 lg:w-1/2 lg:mx-auto bg-white border border-gray-200 rounded-4xl p-8 flex flex-col w-full">
            <h3 className="text-3xl font-bold text-[#101828] mb-3 mt-2">
              {remedialCard.title}
            </h3>
            <p className={`${sourceSans.className} text-[#4A5565] text-xl mb-4 leading-relaxed`}>
              {remedialCard.description1}
            </p>
            <p className={`${sourceSans.className} text-[#4A5565] text-base mb-8 leading-relaxed flex-1`}>
              {remedialCard.description2}
            </p>
            <Link href={remedialCard.link}>
              <Button
                size="lg"
                className="bg-[#262A6F] hover:bg-[#262A6F]/90 text-white px-5 h-14 py-6 text-base rounded-full flex items-center gap-2 justify-center"
              >
                {remedialCard.cta}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
};

export default LandlordsServices;