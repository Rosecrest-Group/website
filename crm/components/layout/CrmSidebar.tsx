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
  LogOut,
  MessagesSquare,
  PoundSterling,
  Settings,
  User,
  UserCog,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { CRM_BASE_PATH, CRM_NAV_SECTIONS } from "@/crm/lib/constants";
import { api, logout } from "@/crm/lib/api";
import { prefetchCurrentUser } from "@/crm/lib/currentUserCache";
import { useTeamChatUnreadCount } from "@/crm/lib/useTeamChatUnreadCount";
import type { ApiUser } from "@/crm/types";
import { cn } from "@/lib/utils";

const NAV_ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  inbox: Inbox,
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
  documentation: BookOpen,
};

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const Icon = NAV_ICONS[name] ?? LayoutDashboard;

  return (
    <Icon
      className="size-5 shrink-0"
      strokeWidth={active ? 2.25 : 2}
      aria-hidden
    />
  );
}

const HREF_ICON: Record<string, string> = {
  [CRM_BASE_PATH]: "dashboard",
  [`${CRM_BASE_PATH}/inbox`]: "inbox",
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
  [`${CRM_BASE_PATH}/settings/integrations`]: "settings",
  [`${CRM_BASE_PATH}/documentation`]: "documentation",
};

function isActive(pathname: string, href: string) {
  if (href === CRM_BASE_PATH) return pathname === CRM_BASE_PATH;
  return pathname.startsWith(href);
}

export default function CrmSidebar({
  onNavigate,
  footer,
}: {
  onNavigate?: () => void;
  footer?: ReactNode;
}) {
  const pathname = usePathname();
  const teamChatUnread = useTeamChatUnreadCount();
  const teamChatHref = `${CRM_BASE_PATH}/conversations`;

  return (
    <aside className="flex h-full min-h-0 w-64 flex-col overflow-hidden border-r border-(--color-tc-20) bg-white">
      <div className="shrink-0 border-b border-(--color-tc-20) p-6">
        <Link href={CRM_BASE_PATH} onClick={onNavigate} className="block">
          <span className="text-lg font-bold text-(--color-tc-40)">Rosecrest CRM</span>
          <span className="mt-0.5 block text-xs text-(--color-tc-30)">Operations Platform</span>
        </Link>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <nav className="space-y-6 p-4">
          {CRM_NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="mb-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-(--color-tc-30)">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  const icon = HREF_ICON[item.href] ?? "default";
                  const badge =
                    item.href === teamChatHref && teamChatUnread > 0
                      ? teamChatUnread
                      : item.badge;

                  return (
                    <Button
                      key={item.href}
                      variant={active ? "crmNavActive" : "crmNav"}
                      asChild
                    >
                      <Link href={item.href} onClick={onNavigate}>
                        <span className={cn(active ? "text-white" : "text-(--color-tc-30)")}>
                          <NavIcon name={icon} active={active} />
                        </span>
                        <span className="flex-1">{item.label}</span>
                        {badge !== undefined && badge > 0 && (
                          <Badge variant={active ? "crmNavActive" : "crmNav"}>
                            {badge > 99 ? "99+" : badge}
                          </Badge>
                        )}
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {footer ?? <SidebarFooter />}
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

function canAccessAdminSettings(role: ApiUser["role"]) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

function SidebarFooter() {
  const [user, setUser] = useState<ApiUser | null>(null);

  useEffect(() => {
    void prefetchCurrentUser();
    api.getMe().then(setUser).catch(() => setUser(null));
  }, []);

  const showAdminLinks = user ? canAccessAdminSettings(user.role) : false;

  return (
    <div className="shrink-0 border-t border-(--color-tc-20) p-4">
      <div className="rounded-xl bg-(--color-nc-10) p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="group flex w-full items-center gap-3 rounded-lg px-1 py-0.5 text-left transition-colors hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary)/30 data-[state=open]:bg-white/70"
            >
              <Avatar className="size-10">
                {user?.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                ) : null}
                <AvatarFallback className="bg-(--color-primary) text-sm font-semibold text-white">
                  {user ? userInitials(user.fullName) : "·"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-tight text-(--color-tc-40)">
                  {user?.fullName ?? "Loading…"}
                </p>
                {user?.email ? (
                  <p className="mt-0.5 truncate text-xs text-(--color-tc-30)" title={user.email}>
                    {user.email}
                  </p>
                ) : null}
              </div>
              <ChevronUp
                className="size-4 shrink-0 text-(--color-tc-30) transition-transform group-hover:text-(--color-tc-40) group-data-[state=open]:rotate-180"
                aria-hidden
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            sideOffset={10}
            className="w-56 rounded-xl border border-(--color-tc-20) bg-white p-1.5 text-(--color-tc-40) shadow-lg"
          >
            <DropdownMenuLabel className="px-2 py-2 font-normal">
              <div className="flex flex-col gap-0.5">
                <span className="truncate text-sm font-semibold text-(--color-tc-40)">
                  {user?.fullName ?? "Loading…"}
                </span>
                {user?.email ? (
                  <span className="truncate text-xs text-(--color-tc-30)" title={user.email}>
                    {user.email}
                  </span>
                ) : null}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-(--color-tc-20)" />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild className="cursor-pointer gap-2 rounded-lg px-2 py-2 text-sm">
                <Link href={`${CRM_BASE_PATH}/settings/profile`}>
                  <User className="size-4 shrink-0" aria-hidden />
                  My profile
                </Link>
              </DropdownMenuItem>
              {showAdminLinks ? (
                <>
                  <DropdownMenuItem asChild className="cursor-pointer gap-2 rounded-lg px-2 py-2 text-sm">
                    <Link href={`${CRM_BASE_PATH}/settings/team`}>
                      <Users className="size-4 shrink-0" aria-hidden />
                      Team
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer gap-2 rounded-lg px-2 py-2 text-sm">
                    <Link href={`${CRM_BASE_PATH}/settings/partners`}>
                      <Settings className="size-4 shrink-0" aria-hidden />
                      API Partners
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer gap-2 rounded-lg px-2 py-2 text-sm">
                    <Link href={`${CRM_BASE_PATH}/settings/integrations`}>
                      <Settings className="size-4 shrink-0" aria-hidden />
                      Integrations
                    </Link>
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-(--color-tc-20)" />
            <DropdownMenuGroup>
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer gap-2 rounded-lg px-2 py-2 text-sm focus:bg-red-50 focus:text-red-600"
                onClick={() => logout()}
              >
                <LogOut className="size-4 shrink-0" aria-hidden />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
