"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import CrmAuthKeeper from "@/crm/components/CrmAuthKeeper";
import CrmRoleGuard from "@/crm/components/CrmRoleGuard";
import CrmGlobalSearch from "@/crm/components/CrmGlobalSearch";
import CrmSidebar from "@/crm/components/layout/CrmSidebar";
import NotificationBell from "@/crm/components/NotificationBell";
import { CrmTopBarProvider, useCrmTopBar } from "@/crm/lib/crmTopBarContext";
import { seedCurrentUser } from "@/crm/lib/currentUserCache";
import { PhoneProvider } from "@/crm/lib/phoneContext";
import { ensurePushRegistered } from "@/crm/lib/pushNotifications";
import DialpadSidebar from "@/crm/components/DialpadSidebar";
import { inter } from "@/lib/fonts";
import type { ApiUser } from "@/crm/types";
import { Toaster } from "sonner";

function CrmTopPanel({ left }: { left?: ReturnType<typeof useCrmTopBar>["left"] }) {
  return (
    <header className="flex shrink-0 flex-col gap-3 border-b border-line bg-surface px-4 py-3 sm:gap-4 sm:px-6 lg:flex-row lg:items-center lg:px-12">
      <div className="hidden min-w-0 flex-1 lg:block">{left}</div>
      <div className="flex min-w-0 flex-1 justify-center lg:px-2">
        <CrmGlobalSearch />
      </div>
      <div className="hidden shrink-0 items-center gap-2 lg:flex">
        <NotificationBell />
      </div>
    </header>
  );
}

function CrmShellInner({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser?: ApiUser | null;
}) {
  const { left: topBarLeft } = useCrmTopBar();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();
  const isWorkflowBuilder = /^\/crm\/workflows\/[^/]+/.test(pathname);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  // Anywhere in the CRM, not just Team Chat — client messages notify too now.
  useEffect(() => {
    void ensurePushRegistered().catch(() => false);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  return (
    <div className={`crm-theme ${inter.variable} flex h-dvh w-full overflow-hidden bg-surface text-ink`}>
      <div className="hidden min-h-0 lg:flex">
        <CrmSidebar initialUser={initialUser} />
      </div>

      <button
        type="button"
        aria-label="Close menu"
        aria-hidden={!mobileNavOpen}
        tabIndex={mobileNavOpen ? 0 : -1}
        className={[
          "fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ease-out lg:hidden",
          mobileNavOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={() => setMobileNavOpen(false)}
      />
      <CrmSidebar
        aria-hidden={!mobileNavOpen}
        className={[
          "fixed inset-y-0 left-0 z-50 shadow-[8px_0_32px_rgb(63_63_80/0.12)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform lg:hidden",
          mobileNavOpen ? "translate-x-0" : "pointer-events-none -translate-x-full",
        ].join(" ")}
        onNavigate={() => setMobileNavOpen(false)}
        onClose={() => setMobileNavOpen(false)}
        initialUser={initialUser}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3 lg:hidden">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
              className="flex size-9 items-center justify-center rounded-lg border border-line bg-surface text-ink-muted outline-none transition-colors hover:bg-sidebar hover:text-ink"
            >
              <Menu className="size-5" strokeWidth={1.75} />
            </button>
            {topBarLeft ? (
              <div className="min-w-0 truncate">{topBarLeft}</div>
            ) : (
              <span className="text-sm font-semibold tracking-tight text-ink">Rosecrest</span>
            )}
          </div>
          <NotificationBell />
        </header>

        {!isWorkflowBuilder && <CrmTopPanel left={topBarLeft} />}

        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>

      <DialpadSidebar />
    </div>
  );
}

export default function CrmShell({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser?: ApiUser | null;
}) {
  if (initialUser) seedCurrentUser(initialUser);

  return (
    <PhoneProvider initialUser={initialUser}>
      <CrmAuthKeeper />
      <CrmRoleGuard initialRole={initialUser?.role ?? null} />
      <Toaster richColors position="top-right" />
      <CrmTopBarProvider>
        <CrmShellInner initialUser={initialUser}>{children}</CrmShellInner>
      </CrmTopBarProvider>
    </PhoneProvider>
  );
}
