"use client";

import { Inbox, Target, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CRM_BASE_PATH, DATA_DUMP_NAV_ITEMS } from "@/crm/lib/constants";
import { cn } from "@/lib/utils";

const NAV_ICONS: Record<string, LucideIcon> = {
  Contacts: Users,
  Opportunities: Target,
  Inbox: Inbox,
};

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DataDumpSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full min-h-0 w-64 flex-col overflow-hidden border-r border-(--color-tc-20) bg-white">
      <div className="shrink-0 border-b border-(--color-tc-20) p-6">
        <Link href={CRM_BASE_PATH} onClick={onNavigate} className="block">
          <span className="text-lg font-bold text-(--color-tc-40)">Sales Igniter</span>
          <span className="mt-0.5 block text-xs text-(--color-tc-30)">Data migration review</span>
        </Link>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <nav className="space-y-1 p-4">
          {DATA_DUMP_NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = NAV_ICONS[item.label] ?? Users;

            return (
              <Button key={item.href} variant={active ? "crmNavActive" : "crmNav"} asChild>
                <Link href={item.href} onClick={onNavigate}>
                  <span className={cn(active ? "text-white" : "text-(--color-tc-30)")}>
                    <Icon className="size-5 shrink-0" strokeWidth={active ? 2.25 : 2} aria-hidden />
                  </span>
                  <span className="flex-1">{item.label}</span>
                </Link>
              </Button>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
