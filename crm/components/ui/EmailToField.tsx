"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { EmailToKind, EmailToOption } from "@/crm/lib/emailCompose";
import { cn } from "@/lib/utils";

export type { EmailToKind, EmailToOption };

export type EmailToFieldProps = {
  id?: string;
  options: EmailToOption[];
  kind: EmailToKind;
  otherEmail: string;
  onKindChange: (kind: EmailToKind) => void;
  onOtherEmailChange: (email: string) => void;
  className?: string;
  disabled?: boolean;
};

const EASE = [0.16, 1, 0.3, 1] as const;

function optionLabel(option: EmailToOption): string {
  const who = option.name?.trim() || option.label;
  return option.email.trim() ? `${option.label} · ${who} · ${option.email}` : `${option.label} · ${who}`;
}

export default function EmailToField({
  id = "email-to",
  options,
  kind,
  otherEmail,
  onKindChange,
  onOtherEmailChange,
  className,
  disabled = false,
}: EmailToFieldProps) {
  const showOther = kind === "other";
  const otherInputRef = useRef<HTMLInputElement>(null);
  const wasOtherRef = useRef(showOther);
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: EASE };

  useEffect(() => {
    if (showOther && !wasOtherRef.current) {
      const frame = requestAnimationFrame(() => otherInputRef.current?.focus());
      wasOtherRef.current = true;
      return () => cancelAnimationFrame(frame);
    }
    wasOtherRef.current = showOther;
  }, [showOther]);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <label htmlFor={id} className="shrink-0 text-sm font-medium text-ink">
        To
      </label>
      <div className="flex min-w-0 flex-1 items-center overflow-hidden">
        <motion.div
          className="relative min-w-0"
          initial={false}
          animate={
            showOther
              ? { flexGrow: 0, flexShrink: 0, flexBasis: "8.5rem", maxWidth: "8.5rem" }
              : { flexGrow: 1, flexShrink: 1, flexBasis: "0%", maxWidth: "100%" }
          }
          transition={transition}
        >
          <select
            id={id}
            disabled={disabled}
            value={kind}
            onChange={(e) => onKindChange(e.target.value as EmailToKind)}
            className="h-9 w-full appearance-none rounded-lg border border-line bg-surface py-0 pl-3 pr-9 text-sm text-ink outline-none transition-colors focus:border-brand-light focus:ring-2 focus:ring-brand-muted disabled:opacity-60"
          >
            {options.map((option) => (
              <option key={option.kind} value={option.kind}>
                {optionLabel(option)}
              </option>
            ))}
            <option value="other">Other…</option>
          </select>
          <span
            className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-ink-subtle"
            aria-hidden
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </motion.div>

        <AnimatePresence initial={false}>
          {showOther ? (
            <motion.div
              key="other-address"
              initial={{ opacity: 0, maxWidth: 0, marginLeft: 0 }}
              animate={{ opacity: 1, maxWidth: 640, marginLeft: 8 }}
              exit={{ opacity: 0, maxWidth: 0, marginLeft: 0 }}
              transition={transition}
              className="min-w-0 flex-1 overflow-hidden"
            >
              <input
                ref={otherInputRef}
                id={`${id}-other`}
                type="email"
                value={otherEmail}
                onChange={(e) => onOtherEmailChange(e.target.value)}
                placeholder="email@example.com"
                autoComplete="off"
                disabled={disabled}
                aria-label="To address"
                className="h-9 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-brand-light focus:ring-2 focus:ring-brand-muted disabled:opacity-60"
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
