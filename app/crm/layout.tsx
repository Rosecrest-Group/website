import CrmRouteFrame from "@/crm/components/CrmRouteFrame";
import { inter } from "@/lib/fonts";

import "./crm.css";

export const metadata = {
  title: "Rosecrest CRM",
  description: "Internal CRM for Rosecrest",
};

export default function CrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`crm-theme ${inter.variable} min-h-dvh bg-canvas text-ink`}>
      <CrmRouteFrame>{children}</CrmRouteFrame>
    </div>
  );
}
