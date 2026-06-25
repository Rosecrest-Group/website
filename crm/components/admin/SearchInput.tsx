"use client";

import { useEffect, useState } from "react";

export interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  debounceMs?: number;
  className?: string;
}

export default function SearchInput({
  placeholder = "Search...",
  value: controlledValue,
  onChange,
  onSearch,
  debounceMs = 300,
  className = "",
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(controlledValue || "");

  // Sync internal value with controlled value
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  // Debounced search
  useEffect(() => {
    if (!onSearch) return;

    const timer = setTimeout(() => {
      onSearch(internalValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [internalValue, debounceMs, onSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  return (
    <div className={`relative ${className}`}>
      <span
        className="pointer-events-none absolute inset-y-0 left-4 grid place-items-center text-slate-500"
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </span>
      <input
        type="search"
        placeholder={placeholder}
        value={internalValue}
        onChange={handleChange}
        className="h-12 w-full rounded-xl bg-white pl-12 pr-4 text-sm text-slate-700 placeholder:text-slate-400 outline-none border border-(--color-tc-20) focus:ring-2 focus:ring-(--color-primary)/20"
      />
    </div>
  );
}
