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
      className={`w-64 min-h-screen bg-white border-r border-(--color-tc-20) flex flex-col ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-(--color-tc-20)">
        <div className="flex items-center gap-3">
          {logo || (
            <div className="w-10 h-10 rounded-xl bg-(--color-primary) flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
          )}
          <span className="text-lg font-bold text-(--color-tc-40)">{title}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-colors ${
                active
                  ? "bg-(--color-primary) text-white"
                  : "text-(--color-tc-40) hover:bg-(--color-nc-20)"
              }`}
            >
              <span className={active ? "text-white" : "text-(--color-tc-30)"}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-(--color-primary) text-white"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {footer && (
        <div className="p-4 border-t border-(--color-tc-20)">{footer}</div>
      )}
    </aside>
  );
}
