"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";

export interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  debounceMs?: number;
  className?: string;
  /** Mullr table search = pill + brand circular affordance (default). Header = rounded-lg sidebar fill. */
  variant?: "table" | "header";
}

export default function SearchInput({
  placeholder = "Search...",
  value: controlledValue,
  onChange,
  onSearch,
  debounceMs = 300,
  className = "",
  variant = "table",
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(controlledValue || "");

  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  useEffect(() => {
    if (!onSearch) return;
    const timer = setTimeout(() => {
      onSearch(internalValue);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [internalValue, debounceMs, onSearch]);

  if (variant === "header") {
    return (
      <div className={`relative ${className}`}>
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-subtle"
          strokeWidth={1.75}
          aria-hidden
        />
        <input
          type="search"
          placeholder={placeholder}
          value={internalValue}
          onChange={(e) => {
            setInternalValue(e.target.value);
            onChange?.(e.target.value);
          }}
          className="w-full rounded-lg border border-line bg-sidebar py-2 pr-9 pl-9 text-sm text-ink outline-none transition-colors placeholder:text-ink-subtle focus:border-brand-light focus:bg-surface focus:ring-2 focus:ring-brand-muted"
        />
      </div>
    );
  }

  return (
    <div className={`relative flex min-w-0 items-center ${className}`}>
      <input
        type="search"
        placeholder={placeholder}
        value={internalValue}
        onChange={(e) => {
          setInternalValue(e.target.value);
          onChange?.(e.target.value);
        }}
        className="w-full rounded-full border border-line bg-surface py-2 pl-4 pr-11 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-brand-light"
      />
      <span className="pointer-events-none absolute right-1 flex size-8 items-center justify-center rounded-full bg-brand text-white">
        <Search className="size-3.5" strokeWidth={1.75} />
      </span>
    </div>
  );
}
