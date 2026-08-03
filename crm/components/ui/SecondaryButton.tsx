import React from "react";

export type SecondaryButtonSize = "large" | "medium" | "small";

export interface SecondaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: SecondaryButtonSize;
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const sizeStyles = {
  large: "h-auto px-4 py-2 text-sm",
  medium: "h-auto px-3 py-2 text-sm",
  small: "h-auto px-3 py-1.5 text-sm",
};

export default function SecondaryButton({
  size = "medium",
  children,
  icon,
  iconPosition = "left",
  className = "",
  ...props
}: SecondaryButtonProps) {
  return (
    <button
      type="button"
      className={`
        flex items-center justify-center gap-2
        ${sizeStyles[size]}
        rounded-lg border border-line bg-sidebar
        font-medium text-ink
        transition-colors duration-200
        hover:bg-line
        disabled:cursor-not-allowed disabled:opacity-50
        ${className}
      `}
      {...props}
    >
      {icon && iconPosition === "left" && <span>{icon}</span>}
      {children}
      {icon && iconPosition === "right" && <span>{icon}</span>}
    </button>
  );
}
