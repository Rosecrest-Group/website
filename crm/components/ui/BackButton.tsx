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
    bg: "bg-(--color-surface)",
    border: "border border-(--color-line)",
    text: "text-(--color-ink-muted)",
    hover: "hover:bg-(--color-nc-20)",
  },
  grey: {
    bg: "bg-(--color-nc-20)",
    border: "border border-(--color-line)",
    text: "text-(--color-ink)",
    hover: "hover:bg-(--color-line)",
  },
  primary: {
    bg: "bg-(--color-brand)",
    border: "border border-(--color-brand)",
    text: "text-white",
    hover: "hover:bg-(--color-brand-deep)",
  },
};

const sizeStyles = {
  sm: {
    size: "h-8 w-8",
    icon: "w-4 h-4",
    rounded: "rounded-lg",
  },
  md: {
    size: "h-9 w-9",
    icon: "w-4 h-4",
    rounded: "rounded-lg",
  },
  lg: {
    size: "h-10 w-10",
    icon: "w-5 h-5",
    rounded: "rounded-lg",
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
