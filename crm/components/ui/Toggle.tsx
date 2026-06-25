"use client";

export type ToggleProps = {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  "aria-label": string;
  className?: string;
};

export default function Toggle({
  checked = false,
  onCheckedChange,
  disabled = false,
  "aria-label": ariaLabel,
  className = "",
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-0 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary)/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-(--color-primary)" : "bg-gray-200"
      } ${className}`}
    >
      <span
        className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform mt-0.5 ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
