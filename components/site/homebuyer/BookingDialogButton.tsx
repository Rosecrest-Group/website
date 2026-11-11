"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { siteFontClass } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import SurveyBookingForm from "@/components/site/homebuyer/SurveyBookingForm";
import type { SurveyLevel } from "@/components/site/homebuyer/pricing";

/** A button that opens the survey booking form ("Check Availability & Get a Fixed Price") in a pop-up. */
export default function BookingDialogButton({
  level = 2,
  bedrooms,
  className,
  children,
}: {
  level?: SurveyLevel;
  /** Property size to pre-select in the form (a bedroom value from the price list). */
  bedrooms?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button type="button" className={cn("cursor-pointer border-0", className)}>
          {children}
        </button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-navy-deep/55" />
        <DialogPrimitive.Content
          className={cn(
            siteFontClass,
            "fixed left-1/2 top-1/2 z-[101] flex max-h-[92vh] w-[min(1120px,calc(100%-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[22px] bg-mist text-ink shadow-[0_30px_80px_-20px_rgba(15,30,56,0.5)] outline-none",
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-line bg-white px-5 py-5 sm:px-8">
            <div className="flex flex-col gap-1">
              <DialogPrimitive.Title className="text-[22px] font-extrabold leading-[1.15] md:text-[28px]">
                Check Availability &amp; Get a Fixed Price
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-[15px] text-body">
                Provide a few details and we’ll instantly show your survey price. Takes less than 60 seconds.
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close
              aria-label="Close"
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border-0 bg-mist text-ink"
            >
              <X aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={2.2} />
            </DialogPrimitive.Close>
          </div>
          <div className="overflow-y-auto p-3 sm:p-6">
            <SurveyBookingForm
              level={level}
              initialBedrooms={bedrooms}
              formName="Survey booking pop-up"
              onClose={() => setOpen(false)}
            />
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
