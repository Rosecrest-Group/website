"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Inbox, Menu, Target, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import CrmAuthKeeper from "@/crm/components/CrmAuthKeeper";
import { CRM_BASE_PATH, DATA_DUMP_NAV_ITEMS } from "@/crm/lib/constants";
import { inter } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

const NAV_ICONS: Record<string, LucideIcon> = {
  Contacts: Users,
  Opportunities: Target,
  Inbox: Inbox,
};

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function DataDumpSidebar({
  onNavigate,
  onClose,
  className,
  "aria-hidden": ariaHidden,
}: {
  onNavigate?: () => void;
  onClose?: () => void;
  className?: string;
  "aria-hidden"?: boolean;
}) {
  const pathname = usePathname();

  return (
    <aside
      aria-hidden={ariaHidden}
      className={cn(
        "flex h-full w-60 shrink-0 flex-col border-r border-line bg-sidebar px-4 pt-8 pb-4",
        className,
      )}
    >
      <div className="mb-8 flex items-center justify-between gap-2.5 px-1">
        <Link href={CRM_BASE_PATH} onClick={onNavigate} className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-brand to-brand-deep shadow-[0_4px_12px_rgb(109_40_217/0.35)]">
            <span className="text-sm font-semibold tracking-tight text-white">S</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-ink">Sales Igniter</span>
        </Link>
      </div>

      <p className="mb-1.5 px-2.5 text-[11px] font-medium uppercase tracking-wide text-ink-faint">
        Menu
      </p>
      <nav className="flex flex-1 flex-col overflow-y-auto">
        {DATA_DUMP_NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = NAV_ICONS[item.label] ?? Users;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-all duration-200",
                active
                  ? "bg-white font-medium text-ink shadow-[0_0_0_1px_var(--color-line)]"
                  : "font-normal text-ink-muted hover:bg-black/4 hover:text-ink",
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-md transition-colors duration-200",
                  active
                    ? "bg-brand-muted text-brand"
                    : "text-ink-subtle group-hover:bg-white/60 group-hover:text-ink",
                )}
              >
                <Icon className="size-[14px]" strokeWidth={1.75} />
              </span>
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      {onClose ? null : null}
    </aside>
  );
}

export default function DataDumpShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  return (
    <>
      <CrmAuthKeeper />
      <Toaster richColors position="top-right" />
      <div className={`crm-theme ${inter.variable} flex h-dvh w-full overflow-hidden bg-surface text-ink`}>
        <div className="hidden min-h-0 lg:flex">
          <DataDumpSidebar />
        </div>

        <button
          type="button"
          aria-label="Close menu"
          className={[
            "fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ease-out lg:hidden",
            mobileNavOpen ? "opacity-100" : "pointer-events-none opacity-0",
          ].join(" ")}
          onClick={() => setMobileNavOpen(false)}
        />
        <DataDumpSidebar
          className={[
            "fixed inset-y-0 left-0 z-50 shadow-[8px_0_32px_rgb(63_63_80/0.12)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden",
            mobileNavOpen ? "translate-x-0" : "pointer-events-none -translate-x-full",
          ].join(" ")}
          onNavigate={() => setMobileNavOpen(false)}
          onClose={() => setMobileNavOpen(false)}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <header className="flex shrink-0 items-center gap-3 border-b border-line bg-surface px-4 py-3 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
              className="flex size-9 items-center justify-center rounded-lg border border-line bg-surface text-ink-muted"
            >
              <Menu className="size-5" strokeWidth={1.75} />
            </button>
            <span className="text-sm font-semibold tracking-tight text-ink">Data dump</span>
          </header>
          <main className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-12 lg:py-10">
            <div className="space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </>
  );
}
