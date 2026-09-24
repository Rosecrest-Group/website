import React from "react";
import { Clock, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { sourceSans } from "@/lib/fonts";

interface SurveyDetailsProps {
  heading: string;
  paragraphs: string[];
  features: string[];
}

const SurveyDetails = ({
  heading,
  paragraphs,
  features,
}: SurveyDetailsProps) => {
  return (
    <section className="px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Duration Info Box */}
        <div className="bg-blue-50 rounded-2xl p-6 lg:p-8">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 rounded-full p-3 shrink-0">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl lg:text-2xl font-medium text-[#101828] mb-3">
                {heading}
              </h3>
              <div className={`${sourceSans.className} text-[#364153] my-6 w-[90%] space-y-4`}>
                {paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <p className={`${sourceSans.className}`}>
                <Link
                  href="/contact"
                  className="font-medium text-[#262A6F] hover:text-[#262A6F]/80 transition-colors"
                >
                  Contact us today for a personalised quote.
                </Link>{" "}
              </p>
            </div>
          </div>
        </div>

        {/* Traffic Light System */}
        <div>
          <h3 className="text-2xl lg:text-3xl font-bold text-[#101828] text-center mb-8">
            The traffic light system for the condition rating
          </h3>

          <div className={`space-y-4 ${sourceSans.className}`}>
            {/* Level 1 - Green */}
            <div className="bg-green-50 rounded-[16.4px] border border-[#B9F8CF] h-20.5 flex items-center px-4 py-4">
              <div className="flex items-start gap-4">
                <div className="bg-[#00C950] rounded-[10px] p-3 shrink-0">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-semibold text-[#101828]">
                      Level 1
                    </span>
                    <span className="bg-[#B9F8CF] text-green-800 text-xs font-medium px-3 py-1 rounded">
                      Green
                    </span>
                  </div>
                  <p className="text-[#364153] text-sm">No action required</p>
                </div>
              </div>
            </div>

            {/* Level 2 - Amber */}
            <div className="bg-[#FFFBEB] border border-[#FEE685] h-20.5 flex items-center px-4 py-4 rounded-[16.4px]">
              <div className="flex items-start gap-4">
                <div className="bg-amber-500 rounded-[10px] p-3 shrink-0">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-semibold text-[#101828]">
                      Level 2
                    </span>
                    <span className="bg-amber-200 text-amber-800 text-xs font-medium px-3 py-1 rounded">
                      Amber
                    </span>
                  </div>
                  <p className="text-[#364153] text-sm">
                    Defects requiring attention and repair that are not urgent.
                  </p>
                </div>
              </div>
            </div>

            {/* Level 3 - Red */}
            <div className="bg-[#FEF2F2] border border-[#FFC9C9] h-20.5 flex items-center px-4 py-4 rounded-[16.4px]">
              <div className="flex items-start gap-4">
                <div className="bg-red-500 rounded-[10px] p-3 shrink-0">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-semibold text-[#101828]">
                      Level 3
                    </span>
                    <span className="bg-red-200 text-red-800 text-xs font-medium px-3 py-1 rounded">
                      Red
                    </span>
                  </div>
                  <p className="text-[#364153] text-sm">
                    Serious defects requiring urgent attention and repair.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-[#F9FAFB] rounded-3xl border border-[#F3F4F6] p-6 lg:p-8">
          <h3 className="text-xl lg:text-2xl text-[#101828] mb-6">
            Key features of this survey
          </h3>

          <ul className="space-y-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-[#DBB38E] shrink-0 mt-0.5" />
                <span
                  className={`${sourceSans.className} text-[#364153] text-sm lg:text-base`}
                >
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default SurveyDetails;
