import React from "react";

export type BackButtonVariant = "white" | "grey" | "primary";

export interface BackButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: BackButtonVariant;
  size?: "sm" | "md" | "lg";
  ariaLabel?: string;
}

const variantStyles = {
  white: {
    bg: "bg-white",
    border: "border border-gray-300",
    text: "text-slate-500",
    hover: "hover:bg-slate-50",
  },
  grey: {
    bg: "bg-gray-100",
    border: "border border-gray-300",
    text: "text-gray-700",
    hover: "hover:bg-gray-200",
  },
  primary: {
    bg: "bg-(--color-primary)",
    border: "border border-(--color-primary)",
    text: "text-white",
    hover: "hover:opacity-90",
  },
};

const sizeStyles = {
  sm: {
    size: "h-8 w-8",
    icon: "w-4 h-4",
    rounded: "rounded-lg",
  },
  md: {
    size: "h-10 w-10",
    icon: "w-5 h-5",
    rounded: "rounded-xl",
  },
  lg: {
    size: "h-12 w-12",
    icon: "w-6 h-6",
    rounded: "rounded-xl",
  },
};

export default function BackButton({
  variant = "white",
  size = "md",
  className = "",
  ariaLabel = "Go back",
  ...props
}: BackButtonProps) {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <button
      type="button"
      className={`
        ${sizeStyle.size}
        ${sizeStyle.rounded}
        shrink-0
        ${variantStyle.bg}
        ${variantStyle.border}
        ${variantStyle.text}
        ${variantStyle.hover}
        flex
        items-center
        justify-center
        transition-colors
        ${className}
      `}
      aria-label={ariaLabel}
      {...props}
    >
      <img 
        src="/arrow-left.svg" 
        alt="Go back" 
        className={sizeStyle.icon}
      />
    </button>
  );
}
