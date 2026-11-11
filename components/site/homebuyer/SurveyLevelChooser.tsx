"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { TextLink } from "@/components/site/primitives";

// Each statement comes from what the Level 2 and Level 3 pages already say each survey is
// designed for. Change the wording here only if those pages change.
const SIGNS = [
  { id: "age", label: "It was built more than about 30 years ago" },
  { id: "altered", label: "It has been extended or altered" },
  { id: "construction", label: "It is listed, a heritage property or of non-standard construction" },
  { id: "size", label: "It is larger than a typical home" },
  { id: "renovation", label: "It needs significant renovation or restoration" },
] as const;

type SignId = (typeof SIGNS)[number]["id"];

/** "Level 2 or Level 3?" check on the Level 2 page. A guide only; the buyer chooses. */
export default function SurveyLevelChooser() {
  const [ticked, setTicked] = useState<Set<SignId>>(new Set());
  const level3 = ticked.size > 0;

  const toggle = (id: SignId) =>
    setTicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-16">
      <fieldset className="m-0 rounded-[18px] border border-line bg-white p-6 sm:p-[30px]">
        <legend className="sr-only">Tick anything that applies to the property</legend>
        <p className="text-[17px] font-bold text-ink">Tick anything that applies to the property:</p>
        <ul className="m-0 mt-4 flex list-none flex-col gap-3 p-0">
          {SIGNS.map((sign) => {
            const checked = ticked.has(sign.id);
            return (
              <li key={sign.id}>
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-[12px] border px-4 py-3 text-base text-body",
                    checked ? "border-teal bg-teal-tint" : "border-line bg-white",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(sign.id)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-[2px] flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border peer-focus-visible:ring-2 peer-focus-visible:ring-teal",
                      checked ? "border-teal bg-teal text-white" : "border-line bg-white",
                    )}
                  >
                    {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                  </span>
                  <span>{sign.label}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div
        aria-live="polite"
        className={cn(
          "flex flex-col gap-3 rounded-[18px] border p-6 sm:p-[30px]",
          level3 ? "border-line bg-white" : "border-teal bg-teal-tint",
        )}
      >
        <span className="text-[13px] font-bold uppercase tracking-[0.06em] text-muted-ink">Our guide</span>
        {level3 ? (
          <>
            <h3 className="text-[22px] font-bold leading-[1.25]">A Level 3 Building Survey may suit better</h3>
            <p className="text-[17px] text-body">
              A Level 3 is designed for older, altered or non-standard buildings. It provides a more detailed
              assessment of the building’s construction, condition and defects, including more extensive advice on
              repairs and maintenance and repair cost estimates where applicable.
            </p>
            <TextLink href="/homebuyer/survey-level-3" className="self-start text-[15px]">
              About the Level 3 Building Survey →
            </TextLink>
          </>
        ) : (
          <>
            <h3 className="text-[22px] font-bold leading-[1.25]">A Level 2 fits this kind of property</h3>
            <p className="text-[17px] text-body">
              A Level 2 is designed for modern and conventional homes in reasonable condition, typically built in
              the last 30 years and not significantly altered or extended.
            </p>
            <TextLink href="#price" className="self-start text-[15px]">
              Get your Level 2 price →
            </TextLink>
          </>
        )}
        <p className="text-sm text-muted-ink">
          This is a guide based on what each survey is designed for. The final choice of survey is yours.
        </p>
      </div>
    </div>
  );
}
