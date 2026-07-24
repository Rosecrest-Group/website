"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import CrmAuthKeeper from "@/crm/components/CrmAuthKeeper";
import DataDumpSidebar from "@/crm/components/data-dump/DataDumpSidebar";
import { Toaster } from "sonner";

export default function DataDumpShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <>
      <CrmAuthKeeper />
      <Toaster richColors position="top-right" />
      <div className="crm-theme flex h-dvh overflow-hidden bg-(--color-nc-10) text-(--color-tc-40)">
        <div className="hidden min-h-0 md:flex md:w-64 md:shrink-0">
          <DataDumpSidebar />
        </div>

        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetContent
            side="left"
            className="w-64 max-w-none gap-0 border-(--color-tc-20) bg-white p-0 [&>button]:hidden"
          >
            <SheetTitle className="sr-only">Data dump navigation</SheetTitle>
            <DataDumpSidebar onNavigate={() => setMobileNavOpen(false)} />
            <Button
              type="button"
              variant="crmGhost"
              size="crmIcon"
              className="absolute right-3 top-5"
              aria-label="Close menu"
              onClick={() => setMobileNavOpen(false)}
            >
              <X className="size-5" />
            </Button>
          </SheetContent>
        </Sheet>

        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <header className="flex shrink-0 items-center gap-3 border-b border-(--color-tc-20) bg-white px-4 py-3 md:hidden">
            <Button
              type="button"
              variant="crmGhost"
              size="crmIcon"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
            <span className="text-sm font-semibold text-(--color-tc-40)">Sales Igniter data dump</span>
          </header>

          <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
        </div>
      </div>
    </>
  );
}
