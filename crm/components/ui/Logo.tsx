import React from "react";

export type LogoVariant = "primary" | "white" | "inverse";
export type LogoSize = "sm" | "md" | "lg" | "xl";

export interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
}

const variantStyles = {
  primary: {
    bg: "bg-(--color-primary)",
    text: "text-white",
  },
  white: {
    bg: "bg-white",
    text: "text-(--color-primary)",
  },
  inverse: {
    bg: "bg-white",
    text: "text-(--color-primary)",
    border: "border border-gray-200",
  },
};

const sizeStyles = {
  sm: {
    container: "w-8 h-8",
    text: "text-base",
    rounded: "rounded-lg",
  },
  md: {
    container: "w-10 h-10",
    text: "text-lg",
    rounded: "rounded-lg",
  },
  lg: {
    container: "w-12 h-12",
    text: "text-xl",
    rounded: "rounded-lg",
  },
  xl: {
    container: "w-16 h-16",
    text: "text-2xl",
    rounded: "rounded-xl",
  },
};

export default function Logo({
  variant = "primary",
  size = "md",
  className = "",
}: LogoProps) {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <div
      className={`
        ${sizeStyle.container}
        ${sizeStyle.rounded}
        ${variantStyle.bg}
        ${variantStyle.text}
        ${variant === "inverse" ? variantStyles.inverse.border : ""}
        flex
        items-center
        justify-center
        shrink-0
        ${className}
      `}
    >
      <span className={`font-semibold ${sizeStyle.text}`}>R</span>
    </div>
  );
}
