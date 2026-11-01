"use client";

import { Download, X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { siteFontClass } from "@/lib/fonts";
import { cn } from "@/lib/utils";

const TERMS = [
  {
    label: "Surveys and professional services (PDF)",
    href: "/assets/documents/terms-survey.pdf",
    download: "Rosecrest-Terms-of-Engagement-Surveys.pdf",
    primary: true,
  },
  {
    label: "Trade services (PDF)",
    href: "/assets/documents/terms-trades.pdf",
    download: "Rosecrest-Terms-of-Engagement-Trades.pdf",
    primary: false,
  },
];

export default function TermsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-navy-deep/55" />
        <DialogPrimitive.Content
          className={cn(
            siteFontClass,
            "fixed left-1/2 top-1/2 z-[101] flex w-[min(520px,calc(100%-32px))] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-[20px] bg-white p-6 text-ink shadow-[0_30px_80px_-20px_rgba(15,30,56,0.5)] outline-none sm:p-8",
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <DialogPrimitive.Title className="text-[26px] font-extrabold leading-[1.15]">
              Terms of Engagement
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label="Close"
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border-0 bg-mist text-ink"
            >
              <X aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={2.2} />
            </DialogPrimitive.Close>
          </div>
          <DialogPrimitive.Description className="text-base text-body">
            Download the terms that apply to your service. Please read them before you book.
          </DialogPrimitive.Description>
          {TERMS.map((doc) => (
            <a
              key={doc.href}
              href={doc.href}
              download={doc.download}
              className={cn(
                "flex min-h-[52px] items-center justify-between gap-3 rounded-xl px-[18px] py-3.5 text-base font-bold no-underline",
                doc.primary
                  ? "bg-teal text-white hover:bg-teal-dark hover:text-white"
                  : "border border-line bg-mist text-ink hover:text-ink",
              )}
            >
              {doc.label}
              <Download aria-hidden="true" className="h-[18px] w-[18px]" />
            </a>
          ))}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
