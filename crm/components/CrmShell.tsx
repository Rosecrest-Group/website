"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import CrmAuthKeeper from "@/crm/components/CrmAuthKeeper";
import CrmSidebar from "@/crm/components/layout/CrmSidebar";
import NotificationBell from "@/crm/components/NotificationBell";
import { CrmTopBarProvider, useCrmTopBar } from "@/crm/lib/crmTopBarContext";
import { PhoneProvider } from "@/crm/lib/phoneContext";
import DialpadSidebar from "@/crm/components/DialpadSidebar";
import { Toaster } from "sonner";

function CrmShellInner({ children }: { children: React.ReactNode }) {
  const { left: topBarLeft } = useCrmTopBar();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <>
      <div className="crm-theme flex h-dvh overflow-hidden bg-(--color-nc-10) text-(--color-tc-40)">
        {/* Desktop sidebar */}
        <div className="hidden min-h-0 md:flex md:w-64 md:shrink-0">
          <CrmSidebar />
        </div>
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetContent
            side="left"
            className="w-64 max-w-none gap-0 border-(--color-tc-20) bg-white p-0 [&>button]:hidden"
          >
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            <CrmSidebar onNavigate={() => setMobileNavOpen(false)} />
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

        {/* Main content area + Dialpad */}
        <div className="flex h-full min-h-0 min-w-0 flex-1 overflow-hidden">
          <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            {/* Mobile header */}
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-(--color-tc-20) bg-white px-4 py-3 md:hidden">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Button
                  type="button"
                  variant="crmGhost"
                  size="crmIcon"
                  onClick={() => setMobileNavOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu className="size-5" />
                </Button>
                {topBarLeft ? (
                  <div className="min-w-0 truncate">{topBarLeft}</div>
                ) : (
                  <span className="text-sm font-semibold text-(--color-tc-40)">Rosecrest CRM</span>
                )}
              </div>
              <NotificationBell />
            </header>

            {/* Desktop top bar */}
            <div className="hidden shrink-0 items-center justify-between gap-4 border-b border-(--color-tc-20) bg-white px-6 py-3 md:flex">
              <div className="min-w-0 flex-1">{topBarLeft}</div>
              <NotificationBell />
            </div>

            {/* Page content */}
            <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
          </div>

          <DialpadSidebar />
        </div>
      </div>
    </>
  );
}

export default function CrmShell({ children }: { children: React.ReactNode }) {
  return (
    <PhoneProvider>
      <CrmAuthKeeper />
      <Toaster richColors position="top-right" />
      <CrmTopBarProvider>
        <CrmShellInner>{children}</CrmShellInner>
      </CrmTopBarProvider>
    </PhoneProvider>
  );
}
