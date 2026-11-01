"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useEnquiryStore } from "@/store/enquiry-store";
import { siteFontClass } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import CallbackForm from "@/components/site/CallbackForm";

/**
 * Pop-up call-back form opened from anywhere with `useEnquiryStore().openEnquiry(context, postcode)`.
 * The form sends the visitor to /thank-you on success; the route change closes this dialog.
 */
const EnquiryModal = () => {
  const { isOpen, context, postcode, closeEnquiry } = useEnquiryStore();
  const pathname = usePathname();

  // The layout persists across navigation, so close on any route change (e.g. to /thank-you).
  useEffect(() => {
    closeEnquiry();
  }, [pathname, closeEnquiry]);
  const contextLine = [context, postcode && `postcode ${postcode.toUpperCase()}`].filter(Boolean).join(", ");

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && closeEnquiry()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-navy-deep/55" />
        <DialogPrimitive.Content
          className={cn(
            siteFontClass,
            "fixed inset-x-0 bottom-0 z-[101] flex max-h-[94vh] flex-col overflow-hidden rounded-t-[20px] bg-white text-ink shadow-[0_30px_80px_-20px_rgba(15,30,56,0.5)] outline-none sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[min(640px,calc(100%-32px))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[20px]",
          )}
        >
          <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-6 sm:px-8 sm:pt-8">
            <div className="flex flex-col gap-1.5">
              <DialogPrimitive.Title className="text-[26px] font-extrabold leading-[1.15]">
                Request a call back
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-base text-body">
                {context
                  ? `About: ${context}. We’ll call back within one business day.`
                  : "Tell us what’s going on and we’ll point you to the right service."}
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close
              aria-label="Close"
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border-0 bg-mist text-ink"
            >
              <X aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={2.2} />
            </DialogPrimitive.Close>
          </div>
          <div className="overflow-y-auto px-6 pb-6 pt-4 sm:px-8 sm:pb-8">
            <CallbackForm formName={context || "Enquiry pop-up"} context={contextLine || undefined} />
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default EnquiryModal;
