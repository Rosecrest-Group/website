import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  inline?: boolean;
}

const inputClassName =
  "rounded-lg border border-line bg-surface text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-brand-light focus:ring-2 focus:ring-brand-muted";

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
        <label htmlFor={inputId} className="shrink-0 text-sm font-medium text-ink">
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
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn("w-full px-3 py-2.5", inputClassName, className)}
        {...props}
      />
    </div>
  );
}
