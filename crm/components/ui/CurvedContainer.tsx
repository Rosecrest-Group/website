import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function CurvedContainer({
  children,
  variant = "white",
  showBorderAndShadow = true,
  className = "",
}: {
  children: ReactNode;
  variant?: "white" | "grey" | "primary";
  showBorderAndShadow?: boolean;
  className?: string;
}) {
  const bgColor =
    variant === "grey"
      ? "bg-sidebar"
      : variant === "primary"
        ? "bg-brand text-white"
        : "bg-surface";
  const borderClasses = showBorderAndShadow ? "border border-line" : "";

  return (
    <div className={cn("overflow-hidden rounded-xl", borderClasses, bgColor, className)}>
      {children}
    </div>
  );
}
