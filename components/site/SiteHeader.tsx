"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import { PHONE, PHONE_HREF } from "@/lib/constants";
import { LANE_LINKS, MAIN_NAV_LINKS, SURVEY_SERVICE_COLUMNS, TRADE_SERVICE_LINKS } from "@/lib/site-nav";
import { cn } from "@/lib/utils";
import { buttonClass } from "@/components/site/primitives";

function Logo() {
  return (
    <Link href="/" aria-label="Rosecrest Group Ltd, home" className="flex shrink-0 items-center no-underline">
      <Image
        src="/assets/images/brand/rosecrest-logo.webp"
        alt="Rosecrest Group Ltd"
        width={500}
        height={74}
        priority
        className="block h-[26px] w-auto sm:h-[30px]"
      />
    </Link>
  );
}

/** Homepage header: no menu, the lane selector on the page does the routing. */
function HomeHeader() {
  return (
    <header className="relative z-30 border-b border-line bg-white">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-x-4 px-gutter py-[18px] sm:gap-x-8">
        <Logo />
        <div className="flex items-center gap-x-[22px]">
          <span className="hidden flex-col leading-[1.25] sm:flex">
            <a href={PHONE_HREF} className="text-[17px] font-extrabold text-ink no-underline hover:text-ink">
              {PHONE}
            </a>
            <span className="text-[13px] text-muted-ink">Mon to Fri, 8am to 5pm</span>
          </span>
          <a href="#callback" className={buttonClass("primary", "sm")}>
            <span className="sm:hidden">Call back</span>
            <span className="hidden sm:inline">Request a call back</span>
          </a>
        </div>
      </div>
    </header>
  );
}

function ServicesMenu({ id, onNavigate }: { id: string; onNavigate: () => void }) {
  const linkClass = "block py-[7px] text-[15px] font-semibold text-ink no-underline hover:text-teal";
  return (
    <div
      id={id}
      className="absolute inset-x-0 top-full z-50 border-t border-line bg-white shadow-menu"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a")) onNavigate();
      }}
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-gutter pt-8">
        <div className="flex flex-wrap gap-x-12 gap-y-7">
          <div className="flex min-w-0 flex-[2_1_540px] flex-col gap-2.5">
            <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-teal">Survey services</span>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-x-10">
              {SURVEY_SERVICE_COLUMNS.map((column, i) => (
                <div key={i}>
                  {column.map((link) => (
                    <Link key={link.href} href={link.href} className={linkClass}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-2.5">
            <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-teal">Trade services</span>
            <div>
              {TRADE_SERVICE_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-mist">
        <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-x-6 gap-y-2.5 px-gutter py-4 text-[15px] text-body">
          <span>Not sure which service you need? Our trusted advisors will point you to the right one.</span>
          <span className="flex flex-wrap items-center gap-x-[22px] gap-y-2.5">
            <Link href="/services" className="font-bold text-teal no-underline hover:text-teal-dark">
              All services →
            </Link>
            <a href={PHONE_HREF} className="font-bold text-ink no-underline hover:text-ink">
              {PHONE}
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}

function MobileMenu({ id, pathname, onNavigate }: { id: string; pathname: string; onNavigate: () => void }) {
  const groupTitle = "text-xs font-extrabold uppercase tracking-[0.08em] text-teal";
  const linkClass = (active: boolean) =>
    cn("block py-2 text-base font-semibold no-underline", active ? "text-teal" : "text-ink hover:text-teal");
  return (
    <div
      id={id}
      className="absolute inset-x-0 top-full z-50 max-h-[calc(100vh-72px)] overflow-y-auto border-t border-line bg-white shadow-menu lg:hidden"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a")) onNavigate();
      }}
    >
      <div className="flex flex-col gap-6 px-gutter py-6">
        <div className="flex flex-col gap-1">
          <span className={groupTitle}>Who we help</span>
          {LANE_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(pathname.startsWith(link.href))}>
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-1">
          <span className={groupTitle}>Survey services</span>
          {SURVEY_SERVICE_COLUMNS.flat().map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(pathname === link.href)}>
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-1">
          <span className={groupTitle}>Trade services</span>
          {TRADE_SERVICE_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(pathname === link.href)}>
              {link.label}
            </Link>
          ))}
          <Link href="/services" className="block py-2 text-base font-bold text-teal no-underline">
            All services →
          </Link>
        </div>
        <div className="flex flex-col gap-1 border-t border-line pt-5">
          {MAIN_NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(pathname.startsWith(link.href))}>
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-3 border-t border-line pt-5">
          <Link href="/request-inspection" className={buttonClass("primary", "md")}>
            Request an inspection
          </Link>
          <a href={PHONE_HREF} className={buttonClass("outline", "md")}>
            <Phone aria-hidden="true" className="h-[18px] w-[18px]" />
            Call {PHONE}
          </a>
          <span className="text-center text-[13px] text-muted-ink">Mon to Fri, 8am to 5pm</span>
        </div>
      </div>
    </div>
  );
}

/** Header on every page after the homepage: menu bar, services dropdown and the four lanes. */
function InnerHeader({ pathname }: { pathname: string }) {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const servicesId = useId();
  const mobileId = useId();
  const anyOpen = servicesOpen || mobileOpen;

  // Menus close on navigation because SiteHeader keys this component by pathname.
  useEffect(() => {
    if (!anyOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setServicesOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [anyOpen]);

  const servicesActive = pathname.startsWith("/services");

  return (
    <>
    <header className="relative z-30 border-b border-line bg-white">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-x-8 gap-y-3 px-gutter py-4">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-x-[26px] whitespace-nowrap text-[15px] lg:flex">
          <button
            type="button"
            aria-expanded={servicesOpen}
            aria-controls={servicesId}
            onClick={() => setServicesOpen((open) => !open)}
            className={cn(
              "flex cursor-pointer items-center gap-1.5 border-0 bg-transparent py-2 font-bold",
              servicesOpen || servicesActive ? "text-teal" : "text-ink",
            )}
          >
            Services
            <ChevronDown
              aria-hidden="true"
              className={cn("h-3.5 w-3.5 transition-transform", servicesOpen && "rotate-180")}
              strokeWidth={2.5}
            />
          </button>
          {MAIN_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname.startsWith(link.href) ? "page" : undefined}
              className={cn(
                "py-2 font-semibold no-underline hover:text-teal",
                pathname.startsWith(link.href) ? "text-teal" : "text-ink",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-x-5 gap-y-2.5">
          <a
            href={PHONE_HREF}
            className="hidden whitespace-nowrap font-bold text-ink no-underline hover:text-ink xl:inline"
          >
            {PHONE}
          </a>
          <a
            href={PHONE_HREF}
            aria-label={`Call ${PHONE}`}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-line text-ink lg:hidden"
          >
            <Phone aria-hidden="true" className="h-5 w-5" />
          </a>
          <Link href="/request-inspection" className={cn(buttonClass("primary", "sm"), "hidden sm:inline-flex")}>
            Request an inspection
          </Link>
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-controls={mobileId}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((open) => !open)}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-line bg-white text-ink lg:hidden"
          >
            {mobileOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <nav aria-label="Who we help" className="hidden border-t border-line bg-mist lg:block">
        <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center gap-x-[30px] whitespace-nowrap px-gutter text-[15px]">
          <span className="text-[13px] font-bold uppercase tracking-[0.06em] text-muted-ink">Who we help</span>
          {LANE_LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-12 items-center border-b-[3px] px-0.5 font-semibold no-underline hover:text-teal",
                  active ? "border-teal text-teal" : "border-transparent text-ink",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
      {servicesOpen && <ServicesMenu id={servicesId} onNavigate={() => setServicesOpen(false)} />}
      {mobileOpen && <MobileMenu id={mobileId} pathname={pathname} onNavigate={() => setMobileOpen(false)} />}
    </header>
    {/* Dims the page under an open menu; the header (z-30) stays above it. */}
    {anyOpen && (
      <div
        aria-hidden="true"
        onClick={() => {
          setServicesOpen(false);
          setMobileOpen(false);
        }}
        className="fixed inset-0 z-20 bg-navy-deep/35"
      />
    )}
    </>
  );
}

export default function SiteHeader() {
  const pathname = usePathname() ?? "/";
  if (pathname === "/") return <HomeHeader />;
  return <InnerHeader key={pathname} pathname={pathname} />;
}
