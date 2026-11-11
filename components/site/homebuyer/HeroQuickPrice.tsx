"use client";

import { useId, useState } from "react";
import BookingDialogButton from "@/components/site/homebuyer/BookingDialogButton";
import { buttonClass } from "@/components/site/primitives";
import { formatPounds, surveyPrice, SURVEY_LABELS, type SurveyLevel } from "@/components/site/homebuyer/pricing";

const SIZES = [
  { value: "Studio", label: "Studio" },
  { value: "1 Bedroom", label: "1 bedroom" },
  { value: "2 Bedroom", label: "2 bedrooms" },
  { value: "3 Bedroom", label: "3 bedrooms" },
  { value: "4 Bedroom", label: "4 bedrooms" },
  { value: "5 Bedroom", label: "5 bedrooms" },
  { value: "6 Bedroom", label: "6 bedrooms" },
  { value: "7 Bedroom", label: "7 bedrooms" },
  { value: "8 Bedroom", label: "8 bedrooms" },
  { value: "9 Bedroom", label: "9 bedrooms" },
  { value: "10+ Bedroom", label: "10 or more bedrooms" },
];

/**
 * Hero price card: pick the property size, see the starting price, then open the full
 * booking form in a pop-up. Prices come from the same list as the booking form.
 */
export default function HeroQuickPrice({ level }: { level: SurveyLevel }) {
  const selectId = useId();
  const [bedrooms, setBedrooms] = useState("Studio");
  const price = formatPounds(surveyPrice(level, bedrooms));

  return (
    <div className="flex flex-col gap-4 rounded-[22px] border border-line bg-white p-6 shadow-card sm:p-7">
      <div className="flex flex-col gap-1">
        <span className="text-[13px] font-bold uppercase tracking-[0.06em] text-muted-ink">Instant price</span>
        <h2 className="text-[24px] font-extrabold leading-[1.15]">{SURVEY_LABELS[level]}</h2>
      </div>
      <label htmlFor={selectId} className="text-[15px] font-bold text-ink">
        Property size
      </label>
      <select
        id={selectId}
        value={bedrooms}
        onChange={(e) => setBedrooms(e.target.value)}
        className="h-12 rounded-[12px] border border-line bg-white px-3 text-base text-ink"
      >
        {SIZES.map((size) => (
          <option key={size.value} value={size.value}>
            {size.label}
          </option>
        ))}
      </select>
      <div aria-live="polite" className="flex items-baseline justify-between gap-3 border-t border-line pt-4">
        <span className="text-[15px] text-body">From, VAT included</span>
        <b className="font-display text-[32px] leading-none">{price}</b>
      </div>
      <p className="text-sm text-muted-ink">
        The final quotation depends on the property’s size, type, location and complexity. Payment secures your
        booking.
      </p>
      <BookingDialogButton
        level={level}
        bedrooms={bedrooms}
        className={buttonClass("primary")}
      >
        Check availability &amp; book
      </BookingDialogButton>
    </div>
  );
}
