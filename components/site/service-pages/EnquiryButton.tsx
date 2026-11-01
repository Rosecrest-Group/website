"use client";

import { useEnquiryStore } from "@/store/enquiry-store";
import { buttonClass } from "@/components/site/primitives";
import { cn } from "@/lib/utils";

type Variant = Parameters<typeof buttonClass>[0];
type Size = Parameters<typeof buttonClass>[1];

/**
 * Button that opens the global "Request a call back" pop-up with a context line,
 * optionally pushing a `service_enquiry_cta` event to the GTM dataLayer first.
 */
export default function EnquiryButton({
  context,
  track,
  variant = "primary",
  size = "md",
  className,
  children,
}: {
  /** Shown in the pop-up and recorded as the lead's form name. */
  context: string;
  /** dataLayer event fields, e.g. { service: "AssocRICS Mentoring", label: "Book free suitability call" }. */
  track?: { service: string; label: string };
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}) {
  const openEnquiry = useEnquiryStore((s) => s.openEnquiry);

  return (
    <button
      type="button"
      onClick={() => {
        if (track && typeof window !== "undefined") {
          const w = window as Window & { dataLayer?: Record<string, unknown>[] };
          w.dataLayer = w.dataLayer || [];
          w.dataLayer.push({ event: "service_enquiry_cta", service: track.service, cta_label: track.label });
        }
        openEnquiry(context);
      }}
      className={cn(buttonClass(variant, size), "cursor-pointer border-0", variant === "outline" && "border", className)}
    >
      {children}
    </button>
  );
}
