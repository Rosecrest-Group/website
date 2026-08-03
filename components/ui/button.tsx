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
          "min-w-0 h-auto rounded-lg bg-brand px-4 py-1.5 text-sm font-medium text-white shadow-none transition-colors duration-200 hover:bg-brand-deep",
        crmOutline:
          "min-w-0 h-auto rounded-lg border border-line-strong bg-surface px-4 py-1.5 text-sm font-medium text-ink shadow-none transition-colors duration-200 hover:bg-sidebar",
        crmGhost:
          "min-w-0 rounded-lg text-ink-subtle shadow-none transition-colors duration-200 hover:bg-sidebar hover:text-ink",
        crmNav:
          "group min-w-0 h-auto w-full justify-start gap-2 rounded-lg px-2 py-1.5 text-sm font-normal text-ink-muted shadow-none transition-all duration-200 hover:bg-black/4 hover:text-ink",
        crmNavActive:
          "group min-w-0 h-auto w-full justify-start gap-2 rounded-lg bg-white px-2 py-1.5 text-sm font-medium text-ink shadow-[0_0_0_1px_var(--color-line)] hover:bg-white",
        crmLink:
          "min-w-0 h-auto p-0 text-sm font-medium text-brand underline-offset-4 shadow-none hover:text-brand-deep hover:underline",
      },
      size: {
        default: "h-12 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-8 text-base",
        icon: "h-9 w-9",
        crmIcon:
          "h-9 w-9 min-w-0 rounded-lg border border-line bg-surface p-2 text-ink-muted hover:bg-sidebar hover:text-ink",
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
