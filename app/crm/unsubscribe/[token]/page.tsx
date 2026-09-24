"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function UnsubscribePage() {
  const params = useParams<{ token: string }>();
  const [state, setState] = useState<"working" | "done" | "missing">("working");

  useEffect(() => {
    const token = params.token;
    if (!token) return;
    let cancelled = false;
    fetch(`/api/v1/campaigns/unsubscribe/${token}`, { method: "POST" })
      .then((response) => {
        if (cancelled) return;
        setState(response.ok ? "done" : "missing");
      })
      .catch(() => {
        if (!cancelled) setState("missing");
      });
    return () => {
      cancelled = true;
    };
  }, [params.token]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md items-center px-6">
      <div className="w-full rounded-xl border border-line bg-surface px-5 py-6">
        <h1 className="text-base font-medium text-ink">Unsubscribe</h1>
        <p className="mt-2 text-sm text-ink-muted">
          {state === "working"
            ? "Removing you from these emails…"
            : state === "done"
              ? "You are unsubscribed. You will not get these campaign emails."
              : "This unsubscribe link is not valid."}
        </p>
      </div>
    </main>
  );
}
