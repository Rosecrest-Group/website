import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  /** `filter` = Mullr pill listbox used in table toolbars */
  variant?: "default" | "filter";
}

export default function SelectField({
  label,
  id,
  className = "",
  children,
  variant = "default",
  ...props
}: SelectFieldProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn(variant === "filter" ? "" : "space-y-1.5")}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            "w-full appearance-none border border-line bg-surface text-sm text-ink outline-none transition-all duration-200",
            variant === "filter"
              ? "min-w-[10.5rem] rounded-full py-2 pr-9 pl-3.5 hover:border-brand-light hover:bg-sidebar focus:border-brand-light"
              : "min-w-[140px] rounded-lg py-2.5 pl-3 pr-10 focus:border-brand-light focus:ring-2 focus:ring-brand-muted",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <span
          className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-ink-subtle"
          aria-hidden
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>
    </div>
  );
}
