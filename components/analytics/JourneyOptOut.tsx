"use client";

import { useSyncExternalStore } from "react";
import { isJourneyOptedOut, setJourneyOptOut, subscribeJourneyOptOut } from "@/lib/attribution";

export default function JourneyOptOut() {
  const optedOut = useSyncExternalStore(subscribeJourneyOptOut, isJourneyOptedOut, () => null);
  const remembering = optedOut === false;

  return (
    <div className="mb-3 overflow-hidden rounded-[18px] border border-line">
      <div className="flex items-center justify-between gap-4 px-5 py-4 bg-white">
        <span className="text-base font-semibold text-ink">Statistics: pages you visit</span>
        <button
          type="button"
          role="switch"
          aria-checked={remembering}
          aria-label="Remember the pages I visit on this browser"
          disabled={optedOut === null}
          onClick={() => setJourneyOptOut(remembering)}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
            remembering ? "bg-teal" : "bg-line-strong"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
              remembering ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
      <div className="border-t border-line bg-white px-5 pb-4">
        <p className="mt-3 text-sm text-body">
          We remember the pages you view on this browser for up to 180 days so that, if you send us an enquiry, we
          can see which pages you read beforehand. Turning this off deletes that history straight away and stops us
          storing it. We then only see the pages from the visit in which you enquire.
        </p>
        <p className="mt-2 text-sm font-semibold text-ink" aria-live="polite">
          {optedOut === null ? "" : remembering ? "On for this browser" : "Off for this browser"}
        </p>
      </div>
    </div>
  );
}
