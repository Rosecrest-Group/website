import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "text-foreground",
        success: "border-transparent bg-emerald-100 text-emerald-800",
        warning: "border-transparent bg-amber-100 text-amber-800",
        destructive: "border-transparent bg-red-100 text-red-800",
        crmCompleted:
          "rounded-full border-0 bg-emerald-50 px-3.5 py-1 text-[11px] font-semibold text-emerald-700 md:text-[12px]",
        crmPending:
          "rounded-full border-0 bg-blue-50 px-3.5 py-1 text-[11px] font-semibold text-blue-700 md:text-[12px]",
        crmInReview:
          "rounded-full border-0 bg-amber-50 px-3.5 py-1 text-[11px] font-semibold text-amber-700 md:text-[12px]",
        crmFailed:
          "rounded-full border-0 bg-rose-50 px-3.5 py-1 text-[11px] font-semibold text-rose-700 md:text-[12px]",
        crmNav:
          "min-w-5 rounded-full border-0 bg-(--color-primary) px-2 py-0.5 text-center text-[11px] font-semibold text-white",
        crmNavActive:
          "min-w-5 rounded-full border-0 bg-white/20 px-2 py-0.5 text-center text-[11px] font-semibold text-white",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
