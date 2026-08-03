"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export type DropdownAction = {
  id: string;
  label: string;
  icon: ReactNode;
  variant?: "default" | "danger";
};

type ActionDropdownProps = {
  actions: DropdownAction[];
  onActionClick: (actionId: string) => void;
};

export default function ActionDropdown({ actions, onActionClick }: ActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldOpenUp, setShouldOpenUp] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (!isOpen) return;
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !buttonRef.current) return;
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    setShouldOpenUp(spaceBelow < 220 && buttonRect.top > 220);
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Row actions"
        className={cn(
          "group flex size-8 items-center justify-center rounded-lg border border-transparent text-ink-subtle outline-none transition-all duration-200",
          "hover:border-line hover:bg-sidebar hover:text-ink",
          isOpen && "border-line bg-sidebar text-ink",
        )}
      >
        <MoreHorizontal className="size-4" strokeWidth={1.75} />
      </button>

      {isOpen ? (
        <div
          className={cn(
            "absolute right-0 z-50 w-52 overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-elevated outline-none",
            shouldOpenUp ? "bottom-full mb-2" : "top-full mt-2",
          )}
        >
          {actions.map((action) => {
            const isDanger = action.variant === "danger";
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onActionClick(action.id);
                }}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left outline-none transition-colors duration-150",
                  isDanger ? "hover:bg-orange-50" : "hover:bg-sidebar",
                )}
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-md",
                    isDanger
                      ? "bg-orange-50 text-orange-700"
                      : "bg-brand-muted text-brand",
                  )}
                >
                  {action.icon}
                </span>
                <span
                  className={cn(
                    "text-sm font-normal",
                    isDanger ? "text-orange-700" : "text-ink",
                  )}
                >
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
