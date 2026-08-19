"use client";

import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckSquare,
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

function isActive(pathname: string, href: string) {
  if (href === CRM_BASE_PATH) return pathname === CRM_BASE_PATH;
  return pathname.startsWith(href);
}

export default function CrmSidebar({
  onNavigate,
  onClose,
  footer,
  className,
  "aria-hidden": ariaHidden,
  initialUser,
}: {
  onNavigate?: () => void;
  onClose?: () => void;
  footer?: ReactNode;
  className?: string;
  "aria-hidden"?: boolean;
  initialUser?: ApiUser | null;
}) {
  const pathname = usePathname();
  const teamChatUnread = useTeamChatUnreadCount();
  const teamChatHref = `${CRM_BASE_PATH}/conversations`;
  const inboxUnread = useInboxUnreadCount();
  const inboxHref = `${CRM_BASE_PATH}/inbox`;
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

  const navSections = navSectionsForRole(user?.role);

  return (
    <aside
      aria-hidden={ariaHidden}
      className={cn(
        "flex h-full w-60 shrink-0 flex-col border-r border-line bg-sidebar px-4 pt-8 pb-4",
        className,
      )}
    >
      <div className="mb-8 flex items-center justify-between gap-2.5 px-1">
        <Link
          href={CRM_BASE_PATH}
          onClick={onNavigate}
          className="flex min-w-0 items-center"
        >
          <Image
            src="/assets/svgs/logo-blue.svg"
            alt="Rosecrest"
            width={350}
            height={54}
            className="h-7 w-auto max-w-full object-contain object-left"
            priority
          />
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
              <p className="mb-1.5 px-2.5 text-[11px] font-medium uppercase tracking-wide text-ink-faint">
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
                      {badge !== undefined && badge > 0 ? (
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none text-white",
                            active ? "bg-brand" : "bg-ink",
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

      {footer ?? <SidebarFooter user={user} />}
    </aside>
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

function SidebarFooter({ user: userProp }: { user?: ApiUser | null }) {
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
        <div className="flex items-center gap-2 rounded-xl px-1 py-1 transition-colors duration-200 hover:bg-black/3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand to-brand-deep text-xs font-medium tracking-wide text-white shadow-[0_4px_12px_rgb(109_40_217/0.25)]">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium leading-tight text-ink">
                {user?.fullName ?? "Loading…"}
              </p>
              {user?.email ? (
                <p className="mt-0.5 truncate text-xs font-normal text-ink-subtle" title={user.email}>
                  {user.email}
                </p>
              ) : null}
            </div>
          </div>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="group flex size-8 shrink-0 items-center justify-center rounded-lg border border-transparent text-ink-subtle outline-none transition-all duration-200 hover:border-line hover:bg-sidebar hover:text-ink"
              aria-label="Account menu"
            >
              <ChevronUp className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" strokeWidth={1.75} />
            </button>
          </DropdownMenuTrigger>
        </div>
        <DropdownMenuContent
          side="top"
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
