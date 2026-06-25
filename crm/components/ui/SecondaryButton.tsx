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
  large: {
    fontSize: "text-lg", // 18px
    padding: "py-[27px] px-[14px]",
    height: "h-[50px]",
  },
  medium: {
    fontSize: "text-base", // 16px
    padding: "py-[24px] px-[12px]",
    height: "h-[48px]",
  },
  small: {
    fontSize: "text-sm", // 14px
    padding: "py-[21px] px-[10px]",
    height: "h-[40px]",
  },
};

export default function SecondaryButton({
  size = "medium",
  children,
  icon,
  iconPosition = "left",
  className = "",
  ...props
}: SecondaryButtonProps) {
  const styles = sizeStyles[size];

  return (
    <button
      type="button"
      className={`
        flex
        items-center
        justify-center
        ${styles.height}
        ${styles.fontSize}
        ${styles.padding}
        rounded-[12px]
        border-[0.5px]
        border-(--color-nc-40)
        bg-white
        font-bold
        text-(--color-primary)
        transition-all
        hover:border-(--color-primary)
        hover:bg-slate-50
        hover:text-(--color-primary)
        active:border-(--color-primary)
        active:bg-slate-100
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      <span className="flex items-center justify-center gap-2">
        {icon && iconPosition === "left" && <span>{icon}</span>}
        {children}
        {icon && iconPosition === "right" && <span>{icon}</span>}
      </span>
    </button>
  );
}
