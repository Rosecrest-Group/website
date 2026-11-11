"use client";

import { useId, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { buttonClass } from "@/components/site/primitives";
import { cn } from "@/lib/utils";

const RATE_PER_M2 = 25;
const MIN_M2 = 1;
const MAX_M2 = 200;
const QUICK_PICKS = [2, 5, 10, 20];

const clamp = (value: number) => Math.max(MIN_M2, Math.min(MAX_M2, value));

/** Mould treatment cost calculator: square metres × £25 + VAT. */
export default function MouldEstimator() {
  const [m2, setM2] = useState(4);
  const headingId = useId();
  const cost = (m2 * RATE_PER_M2).toLocaleString("en-GB");

  const stepClass =
    "flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center rounded-[14px] border border-line-strong bg-white text-ink hover:border-teal disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div
      role="group"
      aria-labelledby={headingId}
      className="flex flex-col gap-[18px] rounded-[22px] bg-white p-6 shadow-card md:p-8"
    >
      <span className="text-[13px] font-bold uppercase tracking-[0.06em] text-muted-ink">
        Mould treatment cost calculator
      </span>
      <b id={headingId} className="font-display text-[22px] leading-[1.2]">
        Approximate size of affected area (m²)
      </b>

      <div className="flex items-center gap-3.5">
        <button
          type="button"
          aria-label="Decrease area"
          onClick={() => setM2((v) => clamp(v - 1))}
          disabled={m2 <= MIN_M2}
          className={stepClass}
        >
          <Minus aria-hidden="true" className="h-6 w-6" strokeWidth={2.4} />
        </button>
        <div className="grow rounded-[14px] border border-line-strong p-2.5 text-center">
          <output aria-live="polite" aria-label="Affected area">
            <span className="font-display text-[34px] font-extrabold">{m2}</span>{" "}
            <span className="text-lg text-muted-ink">m²</span>
          </output>
        </div>
        <button
          type="button"
          aria-label="Increase area"
          onClick={() => setM2((v) => clamp(v + 1))}
          disabled={m2 >= MAX_M2}
          className={stepClass}
        >
          <Plus aria-hidden="true" className="h-6 w-6" strokeWidth={2.4} />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-ink">Quick pick:</span>
        {QUICK_PICKS.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={m2 === value}
            onClick={() => setM2(value)}
            className={cn(
              "cursor-pointer rounded-full border px-3.5 py-2 text-sm font-bold text-ink",
              m2 === value ? "border-teal bg-teal-tint" : "border-line-strong bg-white hover:border-teal",
            )}
          >
            {value} m²
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-2xl bg-teal-tint px-[22px] py-5">
        <span className="flex flex-col">
          <span className="text-sm text-body">Estimated treatment cost</span>
          <span className="text-[13px] text-muted-ink">£{RATE_PER_M2} per m² + VAT</span>
        </span>
        <output aria-live="polite" className="flex items-baseline gap-1.5">
          <span className="font-display text-[34px] font-extrabold md:text-[40px]">£{cost}</span>
          <span className="text-sm text-muted-ink">+ VAT</span>
        </output>
      </div>

      <a
        href="#callback"
        data-need="Mould treatment"
        data-detail={`Mould treatment: affected area about ${m2} m² (calculator estimate £${cost} + VAT).`}
        className={cn(buttonClass("primary"), "w-full")}
      >
        Book a Discussion
      </a>
      <span className="text-center text-[13px] text-muted-ink">
        Enter the affected area above for an estimated treatment cost. An estimate only: the price is confirmed after
        exact measurement.
      </span>
    </div>
  );
}
