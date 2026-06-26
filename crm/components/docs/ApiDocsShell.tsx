"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

type NavItem = { id: string; label: string };

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Lead intake",
    items: [
      { id: "overview", label: "Overview" },
      { id: "authentication", label: "Authentication" },
      { id: "request", label: "Request body" },
      { id: "response", label: "Responses" },
      { id: "examples", label: "Code examples" },
      { id: "errors", label: "Errors" },
    ],
  },
  {
    title: "Communications",
    items: [
      { id: "communications", label: "Overview" },
      { id: "comm-request", label: "Request body" },
      { id: "comm-examples", label: "Code examples" },
      { id: "comm-response", label: "Responses" },
    ],
  },
];

const NAV = NAV_SECTIONS.flatMap((section) => section.items);

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
        <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
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

      <nav className="sticky top-[65px] z-10 border-b border-slate-100 bg-white/95 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-[90rem] items-center gap-2 overflow-x-auto px-4 py-3 sm:px-6">
          {NAV_SECTIONS.map((section, sectionIndex) => (
            <div key={section.title} className="flex shrink-0 items-center gap-2">
              {sectionIndex > 0 && (
                <span className="mx-1 h-4 w-px shrink-0 bg-slate-200" aria-hidden />
              )}
              <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {section.title}
              </span>
              {section.items.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    active === item.id
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </nav>

      <div className="mx-auto flex w-full max-w-[90rem] min-w-0 gap-10 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <aside className="hidden w-56 shrink-0 lg:sticky lg:top-24 lg:block lg:self-start">
          <nav className="max-h-[calc(100dvh-7rem)] space-y-5 overflow-y-auto overscroll-contain pr-2">
            {NAV_SECTIONS.map((section, sectionIndex) => (
              <div key={section.title}>
                {sectionIndex > 0 && <div className="mb-4 border-t border-slate-200" />}
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {section.title}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => (
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
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 overflow-x-hidden pb-16">{children}</main>
      </div>
    </div>
  );
}
