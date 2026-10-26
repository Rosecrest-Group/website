"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { recordPageView } from "@/lib/attribution";

export default function AttributionTracker() {
  const pathname = usePathname();

  useEffect(() => {
    recordPageView();
  }, [pathname]);

  return null;
}
