"use client";

import { usePathname } from "next/navigation";
import CrmShell from "@/crm/components/CrmShell";
import DataDumpShell from "@/crm/components/data-dump/DataDumpShell";
import { isCrmDataDumpRoute, isCrmPublicRoute } from "@/crm/lib/constants";

/**
 * Chooses the CRM chrome on the client so the server layout never reads
 * `headers()` / `/auth/me`. That keeps the shell mounted across page changes
 * instead of blocking every navigation on a Railway round-trip.
 */
export default function CrmRouteFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";

  if (isCrmPublicRoute(pathname)) {
    return children;
  }

  if (isCrmDataDumpRoute(pathname)) {
    return <DataDumpShell>{children}</DataDumpShell>;
  }

  return <CrmShell>{children}</CrmShell>;
}
