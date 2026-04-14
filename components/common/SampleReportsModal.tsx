"use client";

import React from "react";
import { X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sourceSans } from "@/lib/fonts";

interface SampleReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_REPORTS = [
  {
    id: "level-1",
    title: "Level 1 — Home Condition Survey",
    description:
      "A sample Level 1 report for a conventional new-build property. Ideal for understanding the format and condition ratings used in our most basic survey.",
    pdfUrl: "/assets/documents/sample-report-level-1.pdf",
  },
  {
    id: "level-2",
    title: "Level 2 — HomeBuyer Survey",
    description:
      "A sample Level 2 HomeBuyer Report for a conventional residential property. Shows how defects are rated and reported with our traffic light system.",
    pdfUrl: "/assets/documents/sample-report-level-2.pdf",
  },
  {
    id: "level-3",
    title: "Level 3 — Building Survey",
    description:
      "A sample Level 3 Building Survey for an older, more complex property. Demonstrates the depth of analysis, defect descriptions, repair implications and cost guidance included.",
    pdfUrl: "/assets/documents/sample-report-level-3.pdf",
  },
];

const SampleReportsModal = ({ isOpen, onClose }: SampleReportsModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-7 pb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg md:text-3xl font-bold text-[#101828]">
                Sample Report Previews
              </h2>
              <p
                className={`text-sm text-[#4A5565] mt-1 ${sourceSans.className}`}
              >
                View or download examples of our RICS survey reports
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors shrink-0 mt-0.5"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="h-px bg-[#F3F4F6]" />

        {/* Report cards */}
        <div className="px-8 py-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {SAMPLE_REPORTS.map((report) => (
            <div key={report.id}>
              {report.pdfUrl ? (
                <div className="border border-[#EDEEF0] rounded-[14px] p-6">
                  <div className="flex gap-4 items-start">
                    <div className="bg-[#262A6F] rounded-xl p-3 shrink-0 h-10 w-10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col gap-4 px-2 flex-1">
                      <h3 className="text-base md:text-xl font-bold text-[#101828] leading-snug">
                        {report.title}
                      </h3>
                      <p
                        className={`text-sm md:text-base text-[#4A5565] leading-relaxed ${sourceSans.className}`}
                      >
                        {report.description}
                      </p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <Button
                          asChild
                          size="lg"
                          className="bg-[#262A6F] hover:bg-[#262A6F]/90 text-white rounded-full h-11 px-5 text-sm font-semibold"
                        >
                          <a href={report.pdfUrl} download>
                            Download PDF
                          </a>
                        </Button>
                        <Button
                          asChild
                          size="lg"
                          variant="outline"
                          className="rounded-full h-11 px-5 text-sm font-semibold border-[#262A6F] text-[#262A6F] hover:bg-[#262A6F]/5"
                        >
                          <a
                            href={report.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View in Browser
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div></div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className={`px-8 py-4 border-t border-[#F3F4F6] text-center text-sm text-[#6A7282] ${sourceSans.className}`}
        >
          These are anonymised sample reports for illustration purposes only.
        </div>
      </div>
    </div>
  );
};

export default SampleReportsModal;
