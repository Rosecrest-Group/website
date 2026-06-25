"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

const NAV = [
  { id: "overview", label: "Overview" },
  { id: "authentication", label: "Authentication" },
  { id: "request", label: "Request body" },
  { id: "response", label: "Responses" },
  { id: "examples", label: "Code examples" },
  { id: "errors", label: "Errors" },
];

export default function ApiDocsShell({ children }: { children: ReactNode }) {
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const sections = NAV.map((item) => document.getElementById(item.id)).filter(Boolean);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5, 1] }
    );

    sections.forEach((el) => observer.observe(el!));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-dvh bg-white text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-lg font-bold tracking-tight text-slate-900">
              Rosecrest
            </Link>
            <span className="hidden text-slate-300 sm:inline">/</span>
            <span className="hidden text-sm font-medium text-slate-500 sm:inline">API Reference</span>
          </div>
          <Link
            href="/crm/login"
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            CRM login
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:px-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <nav className="sticky top-24 space-y-1">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              On this page
            </p>
            {NAV.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                  active === item.id
                    ? "bg-slate-100 font-medium text-slate-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
}
