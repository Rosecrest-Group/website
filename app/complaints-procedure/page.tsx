"use client";

import JourneyHero from "@/fragments/journeys/JourneyHero";
import { sourceSans } from "@/lib/fonts";
import Footer from "@/components/common/Footer";
import { Mail, Phone, Globe, CheckCircle2, Clock, MessageSquare, Shield, ChevronRight } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Speak to Us",
    subtitle: "Informal Resolution",
    description:
      "In many cases, concerns can be resolved quickly and efficiently by speaking with a member of our team. If you are unhappy with any aspect of our service, we encourage you to contact us in the first instance so we can try to resolve the issue informally.",
  },
  {
    number: "02",
    title: "Submit a Formal Complaint",
    subtitle: "Written Complaint",
    description:
      "If your concern cannot be resolved informally, or you remain dissatisfied, you may submit a formal written complaint. This ensures we fully understand your concerns and can investigate them thoroughly.",
    details: [
      "Your full name",
      "Property address (if applicable)",
      "Details of your complaint",
      "Any supporting documents",
    ],
  },
  {
    number: "03",
    title: "Independent Review",
    subtitle: "CEDR Escalation",
    description:
      "If you are not satisfied with our final response, you may refer the matter to our independent redress provider, the Centre for Effective Dispute Resolution (CEDR), who provide a free and impartial dispute resolution service for consumers.",
    note: "Please note: CEDR does not deal with residential agency complaints.",
  },
];

const timeline = [
  { icon: Clock, label: "Acknowledgement", value: "Within 7 calendar days" },
  { icon: MessageSquare, label: "Written Response", value: "Within 28 calendar days" },
  { icon: CheckCircle2, label: "Updates Provided", value: "If more time is needed" },
];

const commitments = [
  "Treat your complaint seriously and respectfully",
  "Investigate fairly and impartially",
  "Keep clear records at every stage in line with RICS requirements",
  "Aim to resolve matters as quickly as possible",
];

const Page = () => {
  return (
    <div className="bg-[#FBF7F4]">
      <JourneyHero>
        <p className="text-white text-4xl lg:text-5xl tracking-tight leading-tight font-bold">
          Complaints Procedure
        </p>
        <p
          className={`${sourceSans.className} mt-6 mx-auto text-white/90 text-base lg:text-xl leading-relaxed max-w-2xl`}
        >
          We take all complaints seriously and handle them promptly, fairly, and
          transparently — in line with RICS professional standards.
        </p>
      </JourneyHero>

      <div className="max-w-4xl mx-auto px-4 py-16 lg:py-24 space-y-12">

        {/* Intro */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-8">
          <p className={`${sourceSans.className} text-[#4A5565] text-base lg:text-lg leading-relaxed`}>
            At Rosecrest Group Ltd, we are committed to providing a high standard of service to all our clients. However, if something goes wrong, we want to hear from you. All complaints are handled and documented in accordance with{" "}
            <span className="font-semibold text-[#262A6F]">RICS professional standards</span>{" "}
            and regulatory requirements, ensuring a structured, consistent, and fair process at every stage.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="flex items-start gap-6 p-8">
                {/* Step number */}
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-[#262A6F] flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{step.number}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`${sourceSans.className} text-xs font-semibold text-[#DBB38E] uppercase tracking-widest mb-1`}>
                    Step {index + 1}
                  </p>
                  <h2 className="text-xl lg:text-2xl font-bold text-[#101828] mb-1">
                    {step.title}
                  </h2>
                  <p className={`${sourceSans.className} text-sm text-[#6A7282] mb-4`}>
                    {step.subtitle}
                  </p>
                  <p className={`${sourceSans.className} text-[#4A5565] leading-relaxed`}>
                    {step.description}
                  </p>

                  {step.details && (
                    <div className="mt-5">
                      <p className={`${sourceSans.className} text-sm font-semibold text-[#101828] mb-3`}>
                        Please include the following in your complaint:
                      </p>
                      <ul className="space-y-2">
                        {step.details.map((detail) => (
                          <li key={detail} className={`${sourceSans.className} flex items-center gap-2.5 text-sm text-[#4A5565]`}>
                            <ChevronRight className="w-4 h-4 text-[#262A6F] shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {step.note && (
                    <p className={`${sourceSans.className} mt-4 text-sm text-[#6A7282] italic border-l-2 border-[#DBB38E] pl-4`}>
                      {step.note}
                    </p>
                  )}
                </div>
              </div>

              {/* Email CTA — only on Step 2 */}
              {index === 1 && (
                <div className="border-t border-gray-100 bg-[#F8F9FF] px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className={`${sourceSans.className} text-sm font-semibold text-[#101828]`}>
                      Submit your complaint by email
                    </p>
                    <p className={`${sourceSans.className} text-sm text-[#6A7282] mt-0.5`}>
                      Send your written complaint with all relevant details to:
                    </p>
                  </div>
                  <Link
                    href="mailto:rge@rosecrestgroupltd.co.uk"
                    className="inline-flex items-center gap-2.5 bg-[#262A6F] text-white text-sm font-semibold px-5 py-3 rounded-xl hover:bg-[#1e2258] transition-colors shrink-0"
                  >
                    <Mail className="w-4 h-4" />
                    rge@rosecrestgroupltd.co.uk
                  </Link>
                </div>
              )}

              {/* CEDR details — Step 3 */}
              {index === 2 && (
                <div className="border-t border-gray-100 bg-[#F8F9FF] px-8 py-5">
                  <p className={`${sourceSans.className} text-sm font-semibold text-[#101828] mb-3`}>
                    CEDR Contact Details
                  </p>
                  <div className="space-y-2">
                    <p className={`${sourceSans.className} text-sm text-[#4A5565]`}>
                      Centre for Effective Dispute Resolution<br />
                      100 St Paul&apos;s Churchyard, London, EC4M 8BU
                    </p>
                    <div className="flex flex-wrap gap-4 pt-1">
                      <Link
                        href="tel:02075366000"
                        className={`${sourceSans.className} inline-flex items-center gap-2 text-sm text-[#262A6F] hover:underline`}
                      >
                        <Phone className="w-4 h-4" />
                        020 7536 6000
                      </Link>
                      <Link
                        href="https://www.cedr.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${sourceSans.className} inline-flex items-center gap-2 text-sm text-[#262A6F] hover:underline`}
                      >
                        <Globe className="w-4 h-4" />
                        www.cedr.com
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-8">
          <h2 className="text-xl font-bold text-[#101828] mb-6">What Happens Next?</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {timeline.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col items-start gap-3 p-5 rounded-xl bg-[#F8F9FF] border border-[#E8ECFF]">
                <div className="w-10 h-10 rounded-xl bg-[#262A6F] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-[#101828] text-sm">{label}</p>
                  <p className={`${sourceSans.className} text-sm text-[#6A7282] mt-0.5`}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Our Commitment */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#262A6F] flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#101828]">Our Commitment to You</h2>
          </div>
          <ul className="space-y-3">
            {commitments.map((item) => (
              <li key={item} className={`${sourceSans.className} flex items-start gap-3 text-[#4A5565]`}>
                <CheckCircle2 className="w-5 h-5 text-[#262A6F] shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
          <p className={`${sourceSans.className} mt-6 text-sm text-[#6A7282] border-t border-gray-100 pt-5`}>
            All complaints are reviewed internally to help us improve our services and prevent similar issues in the future.
          </p>
        </div>

        {/* Final CTA */}
        <div className="bg-[#262A6F] rounded-2xl px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-white text-xl font-bold mb-1">Ready to submit a complaint?</h2>
            <p className={`${sourceSans.className} text-white/80 text-sm`}>
              We will acknowledge your complaint within 7 calendar days.
            </p>
          </div>
          <Link
            href="mailto:rge@rosecrestgroupltd.co.uk"
            className="inline-flex items-center gap-2.5 bg-[#DBB38E] text-[#101828] text-sm font-bold px-6 py-3.5 rounded-xl hover:bg-[#c9a07c] transition-colors shrink-0"
          >
            <Mail className="w-4 h-4" />
            Email Us Now
          </Link>
        </div>

        <p className={`${sourceSans.className} text-xs text-[#9CA3AF] text-center`}>
          © {new Date().getFullYear()} Rosecrest Group Ltd. All rights reserved.
        </p>
      </div>

      <Footer />
    </div>
  );
};

export default Page;