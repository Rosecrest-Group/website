export type VerticalDividerVariant = "subtle" | "default" | "prominent" | "primary";
export type VerticalDividerThickness = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

type VerticalDividerProps = {
  variant?: VerticalDividerVariant;
  thickness?: VerticalDividerThickness;
  height?: string;
  borderClassName?: string;
  className?: string;
};

const variantColorClass: Record<VerticalDividerVariant, string> = {
  subtle: "bg-slate-200",
  default: "bg-gray-300",
  prominent: "bg-gray-400",
  primary: "bg-(--color-primary)",
};

const thicknessWidthClass: Record<VerticalDividerThickness, string> = {
  1: "w-px min-w-px",
  2: "w-[2px] min-w-[2px]",
  3: "w-[3px] min-w-[3px]",
  4: "w-[4px] min-w-[4px]",
  5: "w-[5px] min-w-[5px]",
  6: "w-[6px] min-w-[6px]",
  7: "w-[7px] min-w-[7px]",
  8: "w-[8px] min-w-[8px]",
  9: "w-[9px] min-w-[9px]",
  10: "w-[10px] min-w-[10px]",
};

export default function VerticalDivider({
  variant = "default",
  thickness = 1,
  height,
  borderClassName,
  className = "",
}: VerticalDividerProps) {
  let colorClass = variantColorClass[variant];
  if (borderClassName) {
    if (borderClassName.startsWith("bg-")) {
      colorClass = borderClassName;
    } else if (borderClassName.startsWith("border-")) {
      colorClass = borderClassName.replace("border-", "bg-");
    } else {
      colorClass = `bg-${borderClassName}`;
    }
  }

  const widthClass = thicknessWidthClass[thickness];
  
  // Use provided height, or skip default if self-stretch is used
  const usesSelfStretch = className.includes("self-stretch");
  
  // Handle empty string as undefined to use default
  const effectiveHeight = height && height.trim() !== "" ? height : undefined;
  // Use fixed height (540px = 90% of 600px) so it doesn't change with content
  const heightClass = effectiveHeight ?? (usesSelfStretch ? "" : "h-[540px]");

  return (
    <div
      className={`${widthClass} shrink-0 ${heightClass} ${colorClass} ${className}`.trim()}
      aria-hidden
    />
  );
}