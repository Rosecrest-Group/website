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
      ? "bg-[#f6f6f6]"
      : variant === "primary"
        ? "bg-(--color-primary)"
        : "bg-white";
  const borderStyle = variant === "grey" ? "border-[0.5px]" : "border";
  const borderClasses = showBorderAndShadow ? `${borderStyle} border-(--color-tc-20)` : "";
  const shadowClass = showBorderAndShadow ? "shadow-sm" : "";

  return (
    <div className={cn("rounded-2xl", borderClasses, bgColor, shadowClass, className)}>
      {children}
    </div>
  );
}

