import type { ReactNode } from "react";

export type BodyHeadingSize = "default" | "lg" | "xl";

export type BodyHeadingProps = {
  children: ReactNode;
  size?: BodyHeadingSize;
  className?: string;
};

const sizeClasses: Record<BodyHeadingSize, string> = {
  default: "text-[16px] sm:text-[18px]",
  lg: "text-[18px] sm:text-[20px]",
  xl: "text-[20px] sm:text-[24px]",
};

export default function BodyHeading({
  children,
  size = "default",
  className = "",
}: BodyHeadingProps) {
  return (
    <span
      className={`${sizeClasses[size]} font-medium text-(--color-ink) ${className}`}
    >
      {children}
    </span>
  );
}
