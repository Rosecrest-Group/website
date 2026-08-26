"use client";

import type { ReactNode } from "react";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export const THREAD_PANES = ["messages", "internal", "activity"] as const;
export type ThreadPane = (typeof THREAD_PANES)[number];
export const THREAD_PANE_LABEL: Record<ThreadPane, string> = {
  messages: "Messages",
  internal: "Internal notes",
  activity: "Activity",
};

const PANE_TRANSITION = { type: "tween", duration: 0.38, ease: [0.32, 0.72, 0, 1] } as const;

function paneTransition(reduceMotion: boolean | null) {
  return reduceMotion ? { duration: 0 } : PANE_TRANSITION;
}

export default function SlidingPaneTabs<T extends string>({
  id,
  panes,
  labels,
  value,
  onChange,
}: {
  id: string;
  panes: readonly T[];
  labels: Record<T, string>;
  value: T;
  onChange: (pane: T) => void;
}) {
  const reduceMotion = useReducedMotion();
  const transition = paneTransition(reduceMotion);

  return (
    <LayoutGroup id={id}>
      <div className="flex items-center gap-0.5 rounded-lg bg-sidebar p-0.5">
        {panes.map((pane) => {
          const isActive = value === pane;
          return (
            <button
              key={pane}
              type="button"
              onClick={() => onChange(pane)}
              className={cn(
                "relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                isActive ? "text-ink" : "text-ink-muted hover:text-ink"
              )}
            >
              {isActive ? (
                <motion.span
                  layoutId={`${id}-pill`}
                  className="absolute inset-0 rounded-md bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
                  transition={transition}
                />
              ) : null}
              <span className="relative z-10">{labels[pane]}</span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

export function SlidingPane<T extends string>({
  panes,
  pane,
  active,
  children,
  className,
  slideInOnMount = false,
}: {
  panes: readonly T[];
  pane: T;
  active: T;
  children: ReactNode;
  className?: string;
  slideInOnMount?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const isActive = pane === active;
  const offset = `${(panes.indexOf(pane) - panes.indexOf(active)) * 100}%`;

  return (
    <motion.div
      className={cn(
        "absolute inset-0 flex min-h-0 w-full flex-col overflow-hidden",
        isActive ? "z-10" : "pointer-events-none",
        className
      )}
      initial={slideInOnMount && !reduceMotion ? { x: "100%" } : false}
      animate={
        reduceMotion
          ? { x: 0, opacity: isActive ? 1 : 0 }
          : { x: offset, opacity: 1 }
      }
      transition={paneTransition(reduceMotion)}
      inert={!isActive}
      aria-hidden={!isActive}
    >
      {children}
    </motion.div>
  );
}
