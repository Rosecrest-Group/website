"use client";

import { useSyncExternalStore } from "react";
import { sourceSans } from "@/lib/fonts";
import { isJourneyOptedOut, setJourneyOptOut, subscribeJourneyOptOut } from "@/lib/attribution";

export default function JourneyOptOut() {
  const optedOut = useSyncExternalStore(subscribeJourneyOptOut, isJourneyOptedOut, () => null);
  const remembering = optedOut === false;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
      <div className="flex items-center justify-between gap-4 px-5 py-4 bg-white">
        <span className="font-semibold text-[#101828] text-base">Statistics: pages you visit</span>
        <button
          type="button"
          role="switch"
          aria-checked={remembering}
          aria-label="Remember the pages I visit on this browser"
          disabled={optedOut === null}
          onClick={() => setJourneyOptOut(remembering)}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
            remembering ? "bg-[#262A6F]" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
              remembering ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
      <div className="px-5 pb-4 border-t border-gray-100 bg-white">
        <p className={`${sourceSans.className} text-sm text-[#4A5565] mt-3`}>
          We remember the pages you view on this browser for up to 180 days so that, if you send us an enquiry, we
          can see which pages you read beforehand. Turning this off deletes that history straight away and stops us
          storing it. We then only see the pages from the visit in which you enquire.
        </p>
        <p className={`${sourceSans.className} text-sm font-semibold text-[#101828] mt-2`} aria-live="polite">
          {optedOut === null ? "" : remembering ? "On for this browser" : "Off for this browser"}
        </p>
      </div>
    </div>
  );
}
