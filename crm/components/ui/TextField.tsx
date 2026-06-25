import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  inline?: boolean;
}

const inputClassName =
  "rounded-xl border border-(--color-tc-20) bg-white text-sm text-(--color-tc-40) outline-none placeholder:text-(--color-tc-30) focus:ring-2 focus:ring-(--color-primary)/20";

export default function TextField({
  label,
  id,
  className = "",
  inline = false,
  ...props
}: TextFieldProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  if (inline && label) {
    return (
      <div className="flex items-center gap-3">
        <label htmlFor={inputId} className="shrink-0 text-sm font-medium text-(--color-tc-40)">
          {label}
        </label>
        <input
          id={inputId}
          className={cn("h-9 min-w-0 flex-1 px-3", inputClassName, className)}
          {...props}
        />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-(--color-tc-40)">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn("h-12 w-full px-4", inputClassName, className)}
        {...props}
      />
    </div>
  );
}
