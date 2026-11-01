"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useEnquiryStore } from "@/store/enquiry-store";
import { checkCoverage } from "@/lib/coverage";
import { normalizeUkPostcode } from "@/lib/ukPostcode";
import { PHONE, PHONE_HREF } from "@/lib/constants";
import { fieldClass } from "@/components/site/CallbackForm";
import { buttonClass } from "@/components/site/primitives";
import { cn } from "@/lib/utils";

// Full postcode (SW9 0UA) or just the outward code (SW9).
const POSTCODE_LIKE = /^[A-Z]{1,2}\d[A-Z\d]?(\s*\d[A-Z]{2})?$/i;

type Outcome =
  | { kind: "covered"; area: string; title: string; body: string; query: string }
  | { kind: "outside"; query: string }
  | { kind: "invalid" };

function evaluate(raw: string): Outcome | null {
  const query = normalizeUkPostcode(raw);
  if (!query) return null;
  const { result, area } = checkCoverage(query);

  if (result === "covered" || result === "edge") {
    const name = area ?? "London";
    const body =
      name === "London"
        ? `${query} is in London, where we cover all 32 boroughs and the City of London.`
        : `${query} is in one of the ${name} areas we cover within and around the M25.`;
    return { kind: "covered", area: name, title: `Great news, we cover ${name}.`, body, query };
  }

  // Town and borough names are also accepted above; anything else must look like a postcode.
  if (!POSTCODE_LIKE.test(query)) return { kind: "invalid" };
  return { kind: "outside", query };
}

const smallButton = cn(buttonClass("primary", "sm"), "min-h-0 rounded-[10px] py-[11px]");
const callLink = "whitespace-nowrap text-[15px] font-bold text-ink no-underline hover:text-teal";

/** "Check if we cover your area" postcode checker. Hands off to the enquiry pop-up with the postcode. */
export default function AreasWeCoverClient() {
  const [input, setInput] = useState("");
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const { openEnquiry } = useEnquiryStore();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOutcome(evaluate(input));
  };

  return (
    <div className="flex flex-col gap-3.5 rounded-[22px] bg-white p-6 shadow-[0_24px_50px_-30px_rgba(15,30,56,0.4)] md:p-[30px]">
      <h2 className="text-2xl font-extrabold leading-[1.2]">Check if we cover your area</h2>
      <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
        <label htmlFor="pc-input" className="text-[15px] text-body">
          Enter your postcode to confirm coverage and availability.
        </label>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <input
            id="pc-input"
            type="text"
            autoComplete="postal-code"
            placeholder="e.g. SW9 0UA"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setOutcome(null);
            }}
            className={cn(fieldClass, "min-w-0 flex-grow bg-white px-4 py-3.5 uppercase placeholder:normal-case")}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className={cn(buttonClass("primary", "md"), "cursor-pointer border-0 py-3.5 disabled:opacity-60")}
          >
            Check Coverage
          </button>
        </div>
      </form>

      <div role="status" aria-live="polite">
        {outcome?.kind === "covered" && (
          <div className="flex flex-col gap-2 rounded-[14px] border border-teal-line bg-teal-tint px-5 py-[18px]">
            <b className="flex items-start gap-2.5 text-lg">
              <Check aria-hidden="true" className="mt-1 h-[18px] w-[18px] shrink-0 text-teal" strokeWidth={2.4} />
              <span>{outcome.title}</span>
            </b>
            <span className="text-[15px] text-body">{outcome.body}</span>
            <span className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-2.5">
              <button
                type="button"
                onClick={() => openEnquiry(`Property inspection — ${outcome.area}`, outcome.query)}
                className={cn(smallButton, "cursor-pointer border-0")}
              >
                Request an inspection
              </button>
              <a href={PHONE_HREF} className={callLink}>
                Call {PHONE}
              </a>
            </span>
          </div>
        )}

        {outcome?.kind === "outside" && (
          <div className="flex flex-col gap-2 rounded-[14px] border border-[#F5D9A0] bg-[#FFF6E3] px-5 py-[18px]">
            <b className="text-lg">Outside our standard coverage</b>
            <span className="text-[15px] text-body">
              We primarily cover London and areas within the M25, but we may still be able to assist. Try another
              postcode or get in touch.
            </span>
            <span className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-2.5">
              <button
                type="button"
                onClick={() => openEnquiry(`Coverage query — outside M25: ${outcome.query}`, outcome.query)}
                className={cn(smallButton, "cursor-pointer border-0")}
              >
                Get in touch
              </button>
              <a href={PHONE_HREF} className={callLink}>
                Call {PHONE}
              </a>
            </span>
          </div>
        )}

        {outcome?.kind === "invalid" && (
          <span className="block text-[15px] font-semibold text-[#9A3412]">
            Please enter a valid UK postcode, for example SW9 0UA.
          </span>
        )}
      </div>
    </div>
  );
}
