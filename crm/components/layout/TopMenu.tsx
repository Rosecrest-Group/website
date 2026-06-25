"use client";

import { useState, useEffect, useRef } from "react";
import type { SVGProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/crm/components/ui/Logo";
import ProfileDropdown, { type ProfileMenuItem } from "@/crm/components/ui/ProfileDropdown";

function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.168l3.71-2.94a.75.75 0 1 1 .92 1.19l-4.18 3.31a.75.75 0 0 1-.92 0L5.21 8.42a.75.75 0 0 1 .02-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function UserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SettingsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function LogOutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function DashboardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function HelpIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function BellIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

const financeDropdownItems = [
  { id: "payments", label: "Payments", href: "/db/payments" },
  { id: "create-invoice", label: "Create Invoice", href: "/db/payments/create-invoice" },
  { id: "withdraw", label: "Withdraw", href: "/db/payments/withdraw" },
] as const;

export default function TopMenu() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPaymentsOpen, setIsPaymentsOpen] = useState(false);
  const paymentsDropdownRef = useRef<HTMLDivElement>(null);

  // Close payments dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (paymentsDropdownRef.current && !paymentsDropdownRef.current.contains(event.target as Node)) {
        setIsPaymentsOpen(false);
      }
    };
    if (isPaymentsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isPaymentsOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Close menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsPaymentsOpen(false);
  }, [pathname]);

  const profileMenuItems: ProfileMenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <DashboardIcon className="w-4 h-4" />,
      href: "/db",
    },
    {
      id: "profile",
      label: "My Profile",
      icon: <UserIcon className="w-4 h-4" />,
      href: "/db/profile",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <BellIcon className="w-4 h-4" />,
      href: "/db/notifications",
    },
    {
      id: "settings",
      label: "Settings",
      icon: <SettingsIcon className="w-4 h-4" />,
      href: "/db/settings",
    },
    {
      id: "help",
      label: "Help & Support",
      icon: <HelpIcon className="w-4 h-4" />,
      href: "/db/help",
    },
    {
      id: "logout",
      label: "Logout",
      icon: <LogOutIcon className="w-4 h-4" />,
      variant: "danger",
      onClick: async () => {
        const { logout } = await import('@/crm/lib/api');
        await logout();
        // Use window.location for full page reload to clear all state
        window.location.href = '/login';
      },
    },
  ];

  if (pathname?.startsWith("/login") || pathname?.startsWith("/signup")) return null;

  return (
    <header className="w-full bg-(--color-primary) border-b border-slate-100 relative">
      <div className="absolute inset-0 bg-[url('/PATTERN.png')] bg-cover bg-center bg-no-repeat opacity-50"></div>
      <div className="relative z-10 mx-auto flex h-[90px] max-w-[1440px] items-center justify-between px-4 md:px-14">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <Logo variant="white" size="md" />
            <span className="text-lg font-semibold text-white">Remotah</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-8 text-[16px] font-medium text-white md:flex">
          <Link
            href="/db/find-jobs"
            className="inline-flex items-center gap-1 hover:text-white/80"
          >
            Find jobs <ChevronDownIcon className="h-4 w-4 text-white" />
          </Link>
          <Link href="/db/active-jobs" className="hover:text-white/80">
            Active jobs
          </Link>
          <div ref={paymentsDropdownRef} className="relative inline-block">
            <button
              type="button"
              onClick={() => setIsPaymentsOpen(!isPaymentsOpen)}
              className="inline-flex items-center gap-1 hover:text-white/80 font-medium"
              aria-expanded={isPaymentsOpen}
              aria-haspopup="true"
              aria-label="Finance menu"
            >
              Finance <ChevronDownIcon className="h-4 w-4 text-white" />
            </button>
            {isPaymentsOpen && (
              <div
                className="absolute left-0 top-full mt-2 w-[220px] overflow-hidden bg-white rounded-[20px] shadow-[0_2px_8px_rgba(154,151,151,0.25)] z-50"
                role="menu"
              >
                <div>
                  {financeDropdownItems.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsPaymentsOpen(false)}
                      className="block w-full px-6 py-3 text-left text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                      role="menuitem"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Link href="/db/messages" className="hover:text-white/80">
            Messages
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {/* Desktop: Notifications and Profile */}
          <div className="hidden md:flex items-center">
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full bg-white hover:bg-white/90"
              aria-label="Notifications"
            >
              <img src="/notification-bing.svg" alt="Notifications" className="h-5 w-5" />
            </button>
            <div className="h-6 w-px bg-white/60 mx-4 mr-2" />
            <ProfileDropdown
              trigger={
                <div className="flex items-center gap-3 rounded-full px-2 py-1 hover:bg-white/10">
                  <div className="hidden text-right leading-tight sm:block">
                    <div className="text-xs font-medium text-white">
                      Anwuri Alabi
                    </div>
                  </div>
                  <div className="h-9 w-9 overflow-hidden rounded-full bg-white/20 ring-2 ring-white">
                    <img
                      src="/tempavatar.png"
                      alt="Profile avatar"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              }
              items={profileMenuItems}
              userName="Anwuri Alabi"
              userAvatar="/tempavatar.png"
            />
          </div>

          {/* Mobile: Hamburger Menu */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden grid h-10 w-10 place-items-center rounded-full bg-white hover:bg-white/90 transition-all duration-200"
            aria-label="Open menu"
          >
            <MenuIcon className="h-6 w-6 text-(--color-primary)" />
          </button>
        </div>
      </div>

      {/* Mobile Slide-out Menu */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        {/* Slide-out Panel */}
        <div
          className={`absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-(--color-primary)">
            <div className="flex items-center gap-3">
              <Logo variant="white" size="md" />
              <span className="text-lg font-semibold text-white">Remotah</span>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200"
              aria-label="Close menu"
            >
              <XIcon className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Menu Content */}
          <div className="flex flex-col h-[calc(100%-73px)] overflow-y-auto">
            {/* Navigation Links */}
            <nav className="flex flex-col p-4 border-b border-gray-200">
              <Link
                href="/db/find-jobs"
                className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>Find jobs</span>
                <ChevronDownIcon className="h-4 w-4 text-gray-500 ml-auto" />
              </Link>
              <Link
                href="/db/active-jobs"
                className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>Active jobs</span>
              </Link>
              <Link
                href="/db/payments"
                className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>Finance</span>
                <ChevronDownIcon className="h-4 w-4 text-gray-500 ml-auto" />
              </Link>
              <Link
                href="/db/messages"
                className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>Messages</span>
              </Link>
            </nav>

            {/* Profile Section */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-200 ring-2 ring-gray-300">
                  <img
                    src="/tempavatar.png"
                    alt="Profile avatar"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">Anwuri Alabi</div>
                </div>
              </div>
            </div>

            {/* Profile Menu Items */}
            <div className="flex-1 p-4">
              <div className="space-y-1">
                {profileMenuItems.map((item) => {
                  const isDanger = item.variant === "danger";
                  if (item.href) {
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 ${
                          isDanger
                            ? "text-red-600 hover:bg-red-50"
                            : "text-gray-900 hover:bg-gray-50"
                        }`}
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          if (item.onClick) {
                            item.onClick();
                          }
                        }}
                      >
                        <span className="shrink-0">{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    );
                  }
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        if (item.onClick) {
                          item.onClick();
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 ${
                        isDanger
                          ? "text-red-600 hover:bg-red-50"
                          : "text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notifications Button */}
            <div className="p-4 border-t border-gray-200">
              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                aria-label="Notifications"
              >
                <BellIcon className="h-5 w-5 shrink-0" />
                <span>Notifications</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
