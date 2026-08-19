"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal, MoreVertical } from "lucide-react";
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
  icon?: "horizontal" | "vertical";
  size?: "md" | "sm";
  ariaLabel?: string;
};

type MenuPosition = {
  top: number;
  left: number;
  openUp: boolean;
};

const MENU_WIDTH = 208; // w-52
const MENU_GAP = 8;

export default function ActionDropdown({
  actions,
  onActionClick,
  icon = "horizontal",
  size = "md",
  ariaLabel = "Row actions",
}: ActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const Icon = icon === "vertical" ? MoreVertical : MoreHorizontal;
  const compact = size === "sm";
  const estimatedHeight = 16 + actions.length * 46;

  function updatePosition() {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < estimatedHeight && rect.top > estimatedHeight;
    const left = Math.min(
      Math.max(MENU_GAP, rect.right - MENU_WIDTH),
      window.innerWidth - MENU_WIDTH - MENU_GAP,
    );
    setPosition({
      top: openUp ? rect.top - MENU_GAP : rect.bottom + MENU_GAP,
      left,
      openUp,
    });
  }

  useLayoutEffect(() => {
    if (!isOpen) {
      setPosition(null);
      return;
    }
    updatePosition();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (dropdownRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setIsOpen(false);
    }

    function handleReposition() {
      updatePosition();
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [isOpen]);

  return (
    <div
      ref={dropdownRef}
      className="relative inline-block"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        className={cn(
          "flex items-center justify-center rounded-lg border border-transparent text-ink-subtle outline-none transition-all duration-200",
          compact ? "size-6" : "size-8",
          "hover:border-line hover:bg-sidebar hover:text-ink",
          isOpen && "border-line bg-sidebar text-ink",
        )}
      >
        <Icon className={compact ? "size-3.5" : "size-4"} strokeWidth={1.75} />
      </button>

      {isOpen && position
        ? createPortal(
            <div
              ref={menuRef}
              className="crm-theme fixed z-300 w-52 overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-elevated outline-none"
              style={{
                top: position.top,
                left: position.left,
                transform: position.openUp ? "translateY(-100%)" : undefined,
              }}
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
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left outline-none transition-colors duration-150",
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
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
