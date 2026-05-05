"use client";

import dynamic from "next/dynamic";

const GoogleTagManager = dynamic(
  () => import("@/components/analytics/GoogleTagManager"),
  { ssr: false },
);

/** Loads GTM only in the browser (avoids Turbopack/dev SSR touching `window`). */
export default function GoogleTagManagerRoot() {
  return <GoogleTagManager />;
}
