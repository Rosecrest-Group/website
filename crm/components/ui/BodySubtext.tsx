import type { ReactNode } from "react";

export type BodySubtextSize = "xs" | "default" | "lg" | "xl";

export type BodySubtextColor = "default" | "primary" | "black";

export type BodySubtextProps = {
  children: ReactNode;
  size?: BodySubtextSize;
  color?: BodySubtextColor;
  className?: string;
};

const sizeClasses: Record<BodySubtextSize, string> = {
  xs: "text-xs sm:text-sm",
  default: "text-sm sm:text-base",
  lg: "text-base sm:text-lg",
  xl: "text-lg sm:text-xl",
};

const colorClasses: Record<BodySubtextColor, string> = {
  default: "text-(--color-nc-60)",
  primary: "text-(--color-primary)",
  black: "text-(--color-tc-40)",
};

export default function BodySubtext({
  children,
  size = "default",
  color = "default",
  className = "",
}: BodySubtextProps) {
  return (
    <p
      className={`${sizeClasses[size]} ${colorClasses[color]} ${className}`}
    >
      {children}
    </p>
  );
}
