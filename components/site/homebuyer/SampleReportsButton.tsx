"use client";

import { useState } from "react";
import { Download, ExternalLink, X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { siteFontClass } from "@/lib/fonts";
import { cn } from "@/lib/utils";

const SAMPLE_REPORTS = [
  {
    title: "Level 1: Home Conditions Survey",
    text: "A sample Level 1 report for a conventional new-build property, showing the format and the condition ratings.",
    href: "/assets/documents/sample-report-level-1.pdf",
  },
  {
    title: "Level 2: Homebuyer Survey",
    text: "A sample Level 2 HomeBuyer Report for a conventional home, showing how defects are rated with the traffic light system.",
    href: "/assets/documents/sample-report-level-2.pdf",
  },
  {
    title: "Level 3: Building Survey",
    text: "A sample Level 3 Building Survey for an older, more complex property, with defect descriptions, repair implications and cost guidance.",
    href: "/assets/documents/sample-report-level-3.pdf",
  },
];

/** Text button that opens the sample report PDFs (view or download) in a pop-up. */
export default function SampleReportsButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          className={cn("cursor-pointer border-0 bg-transparent p-0 text-left font-[inherit]", className)}
        >
          {children}
        </button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-navy-deep/55" />
        <DialogPrimitive.Content
          className={cn(
            siteFontClass,
            "fixed left-1/2 top-1/2 z-[101] flex max-h-[90vh] w-[min(640px,calc(100%-32px))] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-y-auto rounded-[20px] bg-white p-6 text-ink shadow-[0_30px_80px_-20px_rgba(15,30,56,0.5)] outline-none sm:p-8",
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <DialogPrimitive.Title className="text-[26px] font-extrabold leading-[1.15]">
              Sample Report Preview
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label="Close"
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border-0 bg-mist text-ink"
            >
              <X aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={2.2} />
            </DialogPrimitive.Close>
          </div>
          <DialogPrimitive.Description className="text-base text-body">
            View examples of our survey reports.
          </DialogPrimitive.Description>
          {SAMPLE_REPORTS.map((report) => (
            <div key={report.href} className="flex flex-col gap-3 rounded-[16px] border border-line p-5">
              <h3 className="text-lg font-bold leading-[1.3]">{report.title}</h3>
              <p className="text-[15px] text-body">{report.text}</p>
              <div className="flex flex-wrap gap-2.5">
                <a
                  href={report.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal px-[18px] py-2.5 text-[15px] font-bold text-white no-underline hover:bg-teal-dark hover:text-white"
                >
                  View in browser
                  <ExternalLink aria-hidden="true" className="h-4 w-4" />
                </a>
                <a
                  href={report.href}
                  download
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-mist px-[18px] py-2.5 text-[15px] font-bold text-ink no-underline hover:text-ink"
                >
                  Download PDF
                  <Download aria-hidden="true" className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
