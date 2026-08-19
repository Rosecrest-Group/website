"use client";

import { useRef } from "react";
import { Delete, Phone } from "lucide-react";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import { cn } from "@/lib/utils";

const DIAL_KEYS = [
  { digit: "1", letters: "" },
  { digit: "2", letters: "ABC" },
  { digit: "3", letters: "DEF" },
  { digit: "4", letters: "GHI" },
  { digit: "5", letters: "JKL" },
  { digit: "6", letters: "MNO" },
  { digit: "7", letters: "PQRS" },
  { digit: "8", letters: "TUV" },
  { digit: "9", letters: "WXYZ" },
  { digit: "*", letters: "" },
  { digit: "0", letters: "+" },
  { digit: "#", letters: "" },
] as const;

const DIAL_CHARS = /^[0-9+*#\s]$/;

function sanitizeDialInput(value: string) {
  return value.replace(/[^\d+*#\s]/g, "");
}

export default function CallDialer({
  value,
  onChange,
  onCall,
  calling = false,
  disabled = false,
  disabledReason,
}: {
  value: string;
  onChange: (value: string) => void;
  onCall: (number: string) => void;
  calling?: boolean;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const holdTimer = useRef<number | null>(null);
  const skipZeroClick = useRef(false);

  function append(chunk: string) {
    onChange(sanitizeDialInput(`${value}${chunk}`));
  }

  function backspace() {
    onChange(value.slice(0, -1));
  }

  function clearHold() {
    if (holdTimer.current != null) {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }

  function handleZeroDown() {
    skipZeroClick.current = false;
    clearHold();
    holdTimer.current = window.setTimeout(() => {
      holdTimer.current = null;
      skipZeroClick.current = true;
      append("+");
    }, 400);
  }

  function handleZeroClick() {
    if (skipZeroClick.current) {
      skipZeroClick.current = false;
      return;
    }
    append("0");
  }

  function submit() {
    const number = value.trim();
    if (!number || disabled || calling) return;
    onCall(number);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 px-4 pt-4 pb-2">
        <input
          ref={inputRef}
          type="tel"
          inputMode="tel"
          autoComplete="off"
          aria-label="Phone number"
          placeholder="Enter number"
          value={value}
          disabled={disabled || calling}
          onChange={(e) => onChange(sanitizeDialInput(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
              return;
            }
            if (e.key === "Backspace" || e.key === "Delete" || e.key === "Tab") return;
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            if (e.key.length === 1 && !DIAL_CHARS.test(e.key)) e.preventDefault();
          }}
          className="h-12 w-full rounded-xl border border-line bg-sidebar px-4 text-center text-xl font-medium tabular-nums tracking-wide text-ink outline-none placeholder:text-ink-subtle focus:border-brand-light focus:bg-surface focus:ring-2 focus:ring-brand-muted"
        />
      </div>

      <div className="mx-auto flex min-h-0 w-full max-w-xs flex-1 flex-col overflow-hidden px-4 pb-3">
        <div className="grid min-h-0 flex-1 grid-cols-3 grid-rows-4 gap-2">
          {DIAL_KEYS.map((key) => {
            const isZero = key.digit === "0";
            return (
              <button
                key={key.digit}
                type="button"
                disabled={disabled || calling}
                aria-label={isZero ? "0, hold for +" : key.digit}
                onClick={isZero ? handleZeroClick : () => append(key.digit)}
                onPointerDown={isZero ? handleZeroDown : undefined}
                onPointerUp={isZero ? clearHold : undefined}
                onPointerLeave={isZero ? clearHold : undefined}
                onPointerCancel={isZero ? clearHold : undefined}
                className={cn(
                  "flex min-h-0 min-w-0 items-center justify-center",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                <span
                  className={cn(
                    "flex aspect-square h-full max-h-full w-auto max-w-full flex-col items-center justify-center rounded-full border border-line bg-sidebar text-ink transition-colors",
                    "hover:border-line-strong hover:bg-line"
                  )}
                >
                  <span className="text-lg font-medium leading-none">{key.digit}</span>
                  {key.letters ? (
                    <span className="mt-0.5 text-[9px] font-medium tracking-[0.16em] text-ink-subtle">
                      {key.letters}
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex shrink-0 items-center justify-center gap-3">
          <button
            type="button"
            aria-label="Delete last digit"
            disabled={disabled || calling || !value}
            onClick={backspace}
            className="flex size-11 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-sidebar hover:text-ink disabled:opacity-30"
          >
            <Delete className="size-5" strokeWidth={1.75} />
          </button>
          <PrimaryButton
            type="button"
            className="h-11 min-w-32 gap-2 rounded-full px-5"
            disabled={disabled || calling || !value.trim()}
            title={disabled ? disabledReason : "Place call"}
            onClick={submit}
          >
            <Phone className="size-4" strokeWidth={1.75} />
            {calling ? "Calling…" : "Call"}
          </PrimaryButton>
          <span className="size-11" aria-hidden />
        </div>

        {disabled && disabledReason ? (
          <p className="mt-1 shrink-0 text-center text-[11px] text-ink-subtle">{disabledReason}</p>
        ) : (
          <p className="mt-1 shrink-0 text-center text-[11px] text-ink-faint">Hold 0 for +</p>
        )}
      </div>
    </div>
  );
}
