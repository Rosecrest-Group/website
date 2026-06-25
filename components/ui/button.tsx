import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { sourceSans } from "@/lib/fonts";

const buttonVariants = cva(
  `inline-flex items-center justify-center min-w-[180px] gap-2 whitespace-nowrap rounded-[30px] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 ${sourceSans.className}`,
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:opacity-90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        crm:
          "min-w-0 w-[160px] h-[50px] rounded-xl bg-(--color-primary) text-white text-[14px] font-semibold shadow-none hover:opacity-90",
        crmOutline:
          "min-w-0 h-10 rounded-[12px] border-[0.5px] border-(--color-nc-40) bg-white font-medium text-(--color-primary) shadow-none hover:border-(--color-primary) hover:bg-slate-50",
        crmGhost:
          "min-w-0 rounded-lg text-(--color-tc-40) shadow-none hover:bg-(--color-nc-20)",
        crmNav:
          "min-w-0 w-full justify-start gap-3 rounded-xl px-4 py-3 h-auto text-[15px] font-medium text-(--color-tc-40) shadow-none hover:bg-(--color-nc-20)",
        crmNavActive:
          "min-w-0 w-full justify-start gap-3 rounded-xl px-4 py-3 h-auto text-[15px] font-medium bg-(--color-primary) text-white shadow-none hover:bg-(--color-primary) hover:opacity-90",
        crmLink:
          "min-w-0 h-auto p-0 text-[14px] font-medium text-(--color-primary) underline-offset-4 shadow-none hover:text-(--color-pc-60) hover:underline",
      },
      size: {
        default: "h-12 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-8 text-base",
        icon: "h-9 w-9",
        crmIcon: "h-9 w-9 min-w-0 rounded-lg p-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const isCrmVariant = (variant?: string | null) => variant?.startsWith("crm") ?? false;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          !isCrmVariant(variant) && sourceSans.className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
