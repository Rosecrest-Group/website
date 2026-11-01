"use client";

import { useState } from "react";
import TermsDialog from "@/components/site/TermsDialog";
import { cn } from "@/lib/utils";

/** Inline text button that opens the Terms of Engagement pop-up. */
export default function TermsButton({ className, children }: { className?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "cursor-pointer border-0 bg-transparent p-0 text-left font-[inherit] font-bold text-teal hover:text-teal-dark",
          className,
        )}
      >
        {children}
      </button>
      <TermsDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
