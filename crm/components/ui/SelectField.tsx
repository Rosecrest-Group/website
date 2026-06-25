import type { SelectHTMLAttributes } from "react";

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export default function SelectField({ label, id, className = "", children, ...props }: SelectFieldProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-(--color-tc-40)">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`h-12 w-full min-w-[140px] appearance-none rounded-xl border border-(--color-tc-20) bg-white pl-4 pr-10 text-sm text-(--color-tc-40) outline-none focus:ring-2 focus:ring-(--color-primary)/20 ${className}`}
          {...props}
        >
          {children}
        </select>
        <span
          className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-(--color-tc-30)"
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
