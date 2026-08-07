"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterDropdownOption<T extends string = string> = {
  value: T;
  label: string;
};

type FilterDropdownProps<T extends string = string> = {
  value: T;
  options: FilterDropdownOption<T>[];
  onChange: (value: T) => void;
  "aria-label"?: string;
  className?: string;
};

export default function FilterDropdown<T extends string = string>({
  value,
  options,
  onChange,
  "aria-label": ariaLabel = "Filter",
  className,
}: FilterDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className={cn("relative inline-block", className)}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          "flex h-10 min-w-54 items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 text-sm text-ink outline-none transition-all duration-200",
          "hover:border-brand-light hover:bg-sidebar",
          isOpen && "border-brand-light bg-sidebar shadow-focus",
        )}
      >
        <span className="truncate font-medium">{selected?.label}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-ink-subtle transition-transform duration-200 ease-out",
            isOpen && "rotate-180 text-ink",
          )}
          strokeWidth={1.75}
          aria-hidden
        />
      </button>

      {isOpen ? (
        <div
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          className={cn(
            "absolute top-[calc(100%+0.5rem)] right-0 z-50 w-full min-w-54 origin-top overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-elevated outline-none",
            "animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200",
          )}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm outline-none transition-colors duration-150",
                  isSelected
                    ? "bg-brand-muted text-brand"
                    : "text-ink hover:bg-sidebar",
                )}
              >
                <span className={cn("font-medium", isSelected && "text-brand")}>
                  {option.label}
                </span>
                {isSelected ? (
                  <Check className="size-4 shrink-0 text-brand" strokeWidth={2} aria-hidden />
                ) : (
                  <span className="size-4 shrink-0" aria-hidden />
                )}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
