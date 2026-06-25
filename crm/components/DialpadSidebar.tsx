"use client";

import { getDialpadCtiUrl } from "@/crm/lib/dialpad";

export default function DialpadSidebar({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;

  const clientId = process.env.NEXT_PUBLIC_DIALPAD_CLIENT_ID;
  const src = getDialpadCtiUrl(clientId);

  return (
    <aside className="flex w-[320px] shrink-0 flex-col border-l border-(--color-tc-20) bg-white">
      <div className="border-b border-(--color-tc-20) px-4 py-3">
        <p className="text-sm font-medium text-(--color-tc-40)">Phone</p>
        <p className="text-xs text-(--color-tc-30)">Dialpad CTI</p>
        <p className="mt-2 text-[10px] leading-snug text-(--color-tc-30)">
          Sign in below to enable click-to-call. Calls may be recorded for quality and training.
        </p>
      </div>
      <iframe
        id="dialpad-cti-iframe"
        title="Dialpad"
        src={src}
        className="h-full min-h-[480px] w-full flex-1 border-0"
        allow="microphone"
      />
    </aside>
  );
}
