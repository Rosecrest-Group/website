import { headers } from "next/headers";

import CrmShell from "@/crm/components/CrmShell";
import DataDumpShell from "@/crm/components/data-dump/DataDumpShell";

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

      <div className="crm-theme min-h-dvh bg-(--color-nc-10) text-(--color-tc-40)">

        {children}

      </div>

    );

  }

  if (isCrmDataDumpRoute(pathname)) {

    return <DataDumpShell>{children}</DataDumpShell>;

  }



  return <CrmShell>{children}</CrmShell>;

}


