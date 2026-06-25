import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  href?: string;
}

export default function PrimaryButton({
  children,
  className = "",
  href,
  ...props
}: PrimaryButtonProps) {
  if (href) {
    return (
      <Button variant="crm" className={cn(className)} asChild>
        <Link href={href}>{children}</Link>
      </Button>
    );
  }

  return (
    <Button type="button" variant="crm" className={cn(className)} {...props}>
      {children}
    </Button>
  );
}
