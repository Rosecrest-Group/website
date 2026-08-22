"use client";

import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckSquare,
  ChevronLeft,
  ChevronUp,
  Clock,
  FileText,
  Files,
  GitBranch,
  Inbox,
  LayoutDashboard,
  Phone,
  LogOut,
  MessagesSquare,
  PoundSterling,
  ScrollText,
  Settings,
  Target,
  User,
  UserCog,
  UserPlus,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CRM_BASE_PATH, CRM_LEGACY_PATH } from "@/crm/lib/constants";
import { api, logout } from "@/crm/lib/api";
import { canAccessAdminSettings, navSectionsForRole } from "@/crm/lib/rbac";
import { useInboxUnreadCount } from "@/crm/lib/useInboxUnreadCount";
import { useTeamChatUnreadCount } from "@/crm/lib/useTeamChatUnreadCount";
import { getCachedApiUser } from "@/crm/lib/currentUserCache";
import type { ApiUser } from "@/crm/types";
import { cn } from "@/lib/utils";

const NAV_ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  inbox: Inbox,
  calls: Phone,
  conversations: MessagesSquare,
  team: UserCog,
  customers: Users,
  leads: UserPlus,
  jobs: FileText,
  tasks: CheckSquare,
  schedule: CalendarDays,
  workflows: GitBranch,
  templates: Files,
  analytics: BarChart3,
  revenue: PoundSterling,
  slas: Clock,
  settings: Settings,
  "audit-log": ScrollText,
  documentation: BookOpen,
  "legacy-contacts": Users,
  "legacy-opportunities": Target,
  "legacy-inbox": Inbox,
};

const HREF_ICON: Record<string, string> = {
  [CRM_BASE_PATH]: "dashboard",
  [`${CRM_BASE_PATH}/inbox`]: "inbox",
  [`${CRM_BASE_PATH}/calls`]: "calls",
  [`${CRM_BASE_PATH}/conversations`]: "conversations",
  [`${CRM_BASE_PATH}/settings/team`]: "team",
  [`${CRM_BASE_PATH}/customers`]: "customers",
  [`${CRM_BASE_PATH}/leads`]: "leads",
  [`${CRM_BASE_PATH}/jobs`]: "jobs",
  [`${CRM_BASE_PATH}/tasks`]: "tasks",
  [`${CRM_BASE_PATH}/schedule`]: "schedule",
  [`${CRM_BASE_PATH}/workflows`]: "workflows",
  [`${CRM_BASE_PATH}/templates`]: "templates",
  [`${CRM_BASE_PATH}/analytics`]: "analytics",
  [`${CRM_BASE_PATH}/revenue`]: "revenue",
  [`${CRM_BASE_PATH}/slas`]: "slas",
  [`${CRM_BASE_PATH}/settings/audit-log`]: "audit-log",
  [`${CRM_BASE_PATH}/settings/integrations`]: "settings",
  [`${CRM_BASE_PATH}/documentation`]: "documentation",
  [`${CRM_LEGACY_PATH}/contacts`]: "legacy-contacts",
  [`${CRM_LEGACY_PATH}/opportunities`]: "legacy-opportunities",
  [`${CRM_LEGACY_PATH}/inbox`]: "legacy-inbox",
};

const SIDEBAR_COLLAPSED_KEY = "crm.sidebar.collapsed";
const SIDEBAR_COLLAPSE_EASE = "duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]";

function isActive(pathname: string, href: string) {
  if (href === CRM_BASE_PATH) return pathname === CRM_BASE_PATH;
  return pathname.startsWith(href);
}

function readSidebarCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

function writeSidebarCollapsed(collapsed: boolean) {
  try {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? "1" : "0");
  } catch {
    /* private mode / quota */
  }
}

export default function CrmSidebar({
  onNavigate,
  onClose,
  footer,
  className,
  collapsible = false,
  "aria-hidden": ariaHidden,
  initialUser,
}: {
  onNavigate?: () => void;
  onClose?: () => void;
  footer?: ReactNode;
  className?: string;
  collapsible?: boolean;
  "aria-hidden"?: boolean;
  initialUser?: ApiUser | null;
}) {
  const pathname = usePathname();
  const teamChatUnread = useTeamChatUnreadCount();
  const teamChatHref = `${CRM_BASE_PATH}/conversations`;
  const inboxUnread = useInboxUnreadCount();
  const inboxHref = `${CRM_BASE_PATH}/inbox`;
  const [collapsed, setCollapsed] = useState(false);
  const [collapseReady, setCollapseReady] = useState(false);
  const [user, setUser] = useState<ApiUser | null>(
    () => initialUser ?? getCachedApiUser(),
  );

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
      return;
    }
    api.getMe().then(setUser).catch(() => setUser(null));
  }, [initialUser]);

  useEffect(() => {
    if (!collapsible) return;
    setCollapsed(readSidebarCollapsed());
  }, [collapsible]);

  useEffect(() => {
    if (!collapsible) return;
    const id = requestAnimationFrame(() => setCollapseReady(true));
    return () => cancelAnimationFrame(id);
  }, [collapsible]);

  const railCollapsed = collapsible && collapsed;
  const navSections = navSectionsForRole(user?.role);

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current;
      writeSidebarCollapsed(next);
      return next;
    });
  };

  const inner = (
    <>
      <div className="mb-8 flex items-center justify-between gap-2.5 px-1">
        <Link
          href={CRM_BASE_PATH}
          onClick={onNavigate}
          className="relative flex h-8 min-w-0 items-center"
        >
          <Image
            src="/assets/svgs/logo-blue.svg"
            alt="Rosecrest"
            width={350}
            height={54}
            className={cn(
              "h-7 w-auto max-w-full object-contain object-left transition-opacity duration-200",
              railCollapsed && "opacity-0",
            )}
            priority
          />
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute left-0 flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-brand to-brand-deep text-xs font-semibold tracking-tight text-white shadow-[0_4px_12px_rgb(109_40_217/0.25)] transition-opacity duration-200",
              railCollapsed ? "opacity-100" : "opacity-0",
            )}
          >
            R
          </span>
        </Link>

        {onClose ? (
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-ink-subtle outline-none transition-colors hover:bg-sidebar hover:text-ink"
          >
            <X className="size-4" strokeWidth={1.75} />
          </button>
        ) : null}
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <nav className="flex flex-col gap-5 pb-2">
          {navSections.map((section) => (
            <div key={section.title}>
              <p
                aria-hidden={railCollapsed}
                className={cn(
                  "overflow-hidden px-2.5 text-[11px] font-medium uppercase tracking-wide whitespace-nowrap text-ink-faint transition-[max-height,margin,opacity] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  railCollapsed ? "mb-0 max-h-0 opacity-0" : "mb-1.5 max-h-6 opacity-100",
                )}
              >
                {section.title}
              </p>
              <div className="flex flex-col">
                {section.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  const iconName = HREF_ICON[item.href] ?? "dashboard";
                  const Icon = NAV_ICONS[iconName] ?? LayoutDashboard;
                  const liveUnread =
                    item.href === teamChatHref
                      ? teamChatUnread
                      : item.href === inboxHref
                        ? inboxUnread
                        : 0;
                  const badge = liveUnread > 0 ? liveUnread : item.badge;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      title={railCollapsed ? item.label : undefined}
                      className={cn(
                        "group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors duration-200",
                        active
                          ? "bg-white font-medium text-ink shadow-[0_0_0_1px_var(--color-line)]"
                          : "font-normal text-ink-muted hover:bg-black/4 hover:text-ink",
                      )}
                    >
                      <span
                        className={cn(
                          "relative flex size-6 shrink-0 items-center justify-center rounded-md transition-colors duration-200",
                          active
                            ? "bg-brand-muted text-brand"
                            : "text-ink-subtle group-hover:bg-white/60 group-hover:text-ink",
                        )}
                      >
                        <Icon className="size-[14px]" strokeWidth={1.75} />
                        {badge !== undefined && badge > 0 ? (
                          <span
                            className={cn(
                              "absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-brand transition-opacity duration-200",
                              railCollapsed ? "opacity-100" : "opacity-0",
                            )}
                          />
                        ) : null}
                      </span>
                      <span
                        className={cn(
                          "min-w-0 flex-1 truncate whitespace-nowrap transition-opacity duration-200",
                          railCollapsed && "opacity-0",
                        )}
                      >
                        {item.label}
                      </span>
                      {badge !== undefined && badge > 0 ? (
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none whitespace-nowrap text-white transition-opacity duration-200",
                            active ? "bg-brand" : "bg-ink",
                            railCollapsed && "opacity-0",
                          )}
                        >
                          {badge > 99 ? "99+" : badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {footer ?? <SidebarFooter user={user} collapsed={railCollapsed} />}
    </>
  );

  const sidebar = (
    <aside
      aria-hidden={ariaHidden}
      className={cn(
        "flex h-full min-w-0 shrink-0 flex-col overflow-hidden border-r border-line bg-sidebar",
        !collapsible && "w-60 px-4 pt-8 pb-4",
        collapsible && "h-full w-full",
        className,
      )}
    >
      {collapsible ? (
        <div className="flex h-full w-60 shrink-0 flex-col px-4 pt-8 pb-4">{inner}</div>
      ) : (
        inner
      )}
    </aside>
  );

  if (!collapsible) return sidebar;

  return (
    <div
      className={cn(
        "relative flex h-full min-h-0 shrink-0",
        collapseReady && `transition-[width] ${SIDEBAR_COLLAPSE_EASE}`,
        railCollapsed ? "w-16" : "w-60",
      )}
    >
      {sidebar}
      <button
        type="button"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        onClick={toggleCollapsed}
        className="absolute top-9 right-0 z-20 flex size-6 translate-x-1/2 items-center justify-center rounded-full border border-line bg-surface text-ink-subtle shadow-[0_1px_2px_rgb(63_63_80/0.08)] outline-none transition-colors hover:bg-sidebar hover:text-ink"
      >
        <ChevronLeft
          className={cn(
            `size-3.5 transition-transform ${SIDEBAR_COLLAPSE_EASE}`,
            collapsed && "rotate-180",
          )}
          strokeWidth={1.75}
        />
      </button>
    </div>
  );
}

function userInitials(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function SidebarFooter({
  user: userProp,
  collapsed = false,
}: {
  user?: ApiUser | null;
  collapsed?: boolean;
}) {
  const [user, setUser] = useState<ApiUser | null>(
    () => userProp ?? getCachedApiUser(),
  );

  useEffect(() => {
    if (userProp) {
      setUser(userProp);
      return;
    }
    api.getMe().then(setUser).catch(() => setUser(null));
  }, [userProp]);

  const showAdminLinks = user ? canAccessAdminSettings(user.role) : false;
  const initials = user ? userInitials(user.fullName) : "·";

  return (
    <div className="relative mt-auto shrink-0 border-t border-line pt-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Account menu"
            className="group flex w-full items-center gap-2 rounded-xl px-1 py-1 text-left outline-none transition-colors duration-200 hover:bg-black/3"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand to-brand-deep text-xs font-medium tracking-wide text-white shadow-[0_4px_12px_rgb(109_40_217/0.25)]">
                {initials}
              </div>
              <div
                className={cn(
                  "min-w-0 transition-opacity duration-200",
                  collapsed && "opacity-0",
                )}
              >
                <p className="truncate text-sm font-medium leading-tight whitespace-nowrap text-ink">
                  {user?.fullName ?? "Loading…"}
                </p>
                {user?.email ? (
                  <p className="mt-0.5 truncate text-xs font-normal whitespace-nowrap text-ink-subtle" title={user.email}>
                    {user.email}
                  </p>
                ) : null}
              </div>
            </div>
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg border border-transparent text-ink-subtle transition-opacity duration-200",
                collapsed && "opacity-0",
              )}
            >
              <ChevronUp className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" strokeWidth={1.75} />
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side={collapsed ? "right" : "top"}
          align="end"
          sideOffset={10}
          className="crm-theme w-52 rounded-xl border border-line bg-surface p-1.5 text-ink shadow-elevated"
        >
          <DropdownMenuLabel className="px-3 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-wide text-ink-faint">
            Account
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem asChild className="cursor-pointer gap-3 rounded-lg px-3 py-2.5 text-sm">
              <Link href={`${CRM_BASE_PATH}/settings/profile`}>
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-brand-muted text-brand">
                  <User className="size-3.5" strokeWidth={1.75} />
                </span>
                My profile
              </Link>
            </DropdownMenuItem>
            {showAdminLinks ? (
              <>
                <DropdownMenuItem asChild className="cursor-pointer gap-3 rounded-lg px-3 py-2.5 text-sm">
                  <Link href={`${CRM_BASE_PATH}/settings/team`}>
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-brand-muted text-brand">
                      <Users className="size-3.5" strokeWidth={1.75} />
                    </span>
                    Team
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer gap-3 rounded-lg px-3 py-2.5 text-sm">
                  <Link href={`${CRM_BASE_PATH}/settings/integrations`}>
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-brand-muted text-brand">
                      <Settings className="size-3.5" strokeWidth={1.75} />
                    </span>
                    Integrations
                  </Link>
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-line" />
          <DropdownMenuItem
            className="cursor-pointer gap-3 rounded-lg px-3 py-2.5 text-sm text-orange-700 focus:bg-orange-50 focus:text-orange-700"
            onClick={() => logout()}
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-orange-50 text-orange-700">
              <LogOut className="size-3.5" strokeWidth={1.75} />
            </span>
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
