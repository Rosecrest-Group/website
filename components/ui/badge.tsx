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
          "rounded-full border-0 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 sm:text-xs",
        crmPending:
          "rounded-full border-0 bg-brand-muted px-2.5 py-1 text-[11px] font-medium text-brand sm:text-xs",
        crmInReview:
          "rounded-full border-0 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800 sm:text-xs",
        crmFailed:
          "rounded-full border-0 bg-orange-50 px-2.5 py-1 text-[11px] font-medium text-orange-700 sm:text-xs",
        crmNav:
          "min-w-5 rounded-full border-0 bg-brand px-1.5 py-0.5 text-center text-[10px] font-medium leading-none text-white",
        crmNavActive:
          "min-w-5 rounded-full border-0 bg-brand px-1.5 py-0.5 text-center text-[10px] font-medium leading-none text-white",
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
