"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: ReactNode;
  badge?: string | number;
}

export interface AdminSidebarProps {
  items: SidebarItem[];
  title?: string;
  logo?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export default function AdminSidebar({
  items,
  title = "Admin",
  logo,
  footer,
  className = "",
}: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`flex min-h-screen w-60 flex-col border-r border-(--color-line) bg-(--color-nc-20) ${className}`}
    >
      <div className="border-b border-(--color-line) px-4 pt-8 pb-4">
        <div className="flex items-center gap-2.5 px-1">
          {logo || (
            <div className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-(--color-brand) to-(--color-brand-deep) shadow-[0_4px_12px_rgb(109_40_217/0.35)]">
              <span className="text-sm font-semibold tracking-tight text-white">R</span>
            </div>
          )}
          <span className="text-sm font-semibold tracking-tight text-(--color-ink)">{title}</span>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 p-4">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`group flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-all duration-200 ${
                active
                  ? "bg-white font-medium text-(--color-ink) shadow-[0_0_0_1px_var(--color-line)]"
                  : "font-normal text-(--color-ink-muted) hover:bg-black/4 hover:text-(--color-ink)"
              }`}
            >
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-md ${
                  active
                    ? "bg-(--color-brand-muted) text-(--color-brand)"
                    : "text-(--color-ink-subtle) group-hover:bg-white/60 group-hover:text-(--color-ink)"
                }`}
              >
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && (
                <span className="rounded-full bg-(--color-brand) px-1.5 py-0.5 text-[10px] font-medium leading-none text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {footer && (
        <div className="border-t border-(--color-line) p-4">{footer}</div>
      )}
    </aside>
  );
}
