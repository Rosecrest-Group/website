import { headers } from "next/headers";

import CrmShell from "@/crm/components/CrmShell";
import DataDumpShell from "@/crm/components/data-dump/DataDumpShell";
import { inter } from "@/lib/fonts";

import { isCrmDataDumpRoute, isCrmPublicRoute } from "@/crm/lib/constants";

import "./crm.css";

export const metadata = {
  title: "Rosecrest CRM",
  description: "Internal CRM for Rosecrest",
};

export default async function CrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = (await headers()).get("x-pathname") ?? "";

  if (isCrmPublicRoute(pathname)) {
    return (
      <div
        className={`crm-theme ${inter.variable} min-h-dvh bg-canvas text-ink`}
      >
        {children}
      </div>
    );
  }

  if (isCrmDataDumpRoute(pathname)) {
    return <DataDumpShell>{children}</DataDumpShell>;
  }

  return <CrmShell>{children}</CrmShell>;
}
