"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useEnquiryStore } from "@/store/enquiry-store";
import ContactForm from "@/components/common/ContactForm";

const EnquiryModal = () => {
  const router = useRouter();
  const { isOpen, context, closeEnquiry } = useEnquiryStore();

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Close modal, then navigate. We push to /thank-you so conversion tracking
  // fires on a real pageview rather than relying on DOM-based triggers.
  const handleSuccess = () => {
    closeEnquiry();
    router.push("/thank-you");
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && closeEnquiry()}
    >
      <div className="relative w-full sm:max-w-2xl bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col">

        {/* Drag handle — mobile only */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Close button */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={closeEnquiry}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable form */}
        <div className="overflow-y-auto flex-1 px-6 py-6 sm:px-8 scrollbar-hide">
          <ContactForm
            compact
            title="Request an Inspection"
            subtitle={
              context
                ? context
                : "Tell us a little about your situation and we'll direct your enquiry to the right team member."
            }
            prefillHelpWith={context}
            submitLabel="Submit Enquiry"
            onSuccess={handleSuccess}
          />
        </div>

      </div>
    </div>
  );
};

export default EnquiryModal;