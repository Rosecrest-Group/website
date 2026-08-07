"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, BellRing } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CRM_BASE_PATH } from "@/crm/lib/constants";
import { api } from "@/crm/lib/api";
import { notificationHref } from "@/crm/lib/notificationLinks";
import {
  notificationPermission,
  pushNotificationsSupported,
  registerPushNotifications,
} from "@/crm/lib/pushNotifications";
import { useNotificationCount } from "@/crm/lib/useNotificationCount";

function formatWhen(iso: string) {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function NotificationBell() {
  const { unreadCount, items, setItems, refresh } = useNotificationCount();
  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    if (pushNotificationsSupported()) setPermission(notificationPermission());
  }, []);

  async function enableBrowserNotifications() {
    await registerPushNotifications().catch(() => false);
    setPermission(notificationPermission());
  }

  async function markRead(id: string) {
    await api.markNotificationRead(id);
    setItems((prev) => prev.filter((n) => n.id !== id));
    void refresh();
  }

  async function markAllRead() {
    await api.markAllNotificationsRead();
    setItems([]);
    void refresh();
  }

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) void refresh();
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
          className="group relative flex size-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-ink-muted outline-none transition-all duration-200 hover:bg-sidebar hover:text-ink"
        >
          <Bell className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-medium leading-none text-white ring-2 ring-surface">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="crm-theme w-[min(100vw-2rem,22rem)] overflow-hidden rounded-xl border border-line bg-surface p-0 text-ink shadow-elevated"
      >
        <div className="flex items-center justify-between border-b border-line bg-sidebar px-4 py-3">
          <DropdownMenuLabel className="p-0 text-sm font-medium text-ink">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              type="button"
              className="text-xs font-medium text-brand hover:underline"
              onClick={() => void markAllRead()}
            >
              Mark all read
            </button>
          )}
        </div>

        {permission === "default" ? (
          <button
            type="button"
            onClick={() => void enableBrowserNotifications()}
            className="flex w-full items-start gap-3 border-b border-line bg-brand-muted/40 px-4 py-3 text-left transition-colors hover:bg-brand-muted"
          >
            <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-brand-muted text-brand">
              <BellRing className="size-3.5" strokeWidth={1.75} aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-ink">
                Turn on browser notifications
              </span>
              <span className="block text-xs text-ink-muted">
                Get alerted about new client messages even when the CRM isn&apos;t in front of you.
              </span>
            </span>
          </button>
        ) : null}

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <span className="grid size-10 place-items-center rounded-full bg-sidebar text-ink-subtle">
              <Bell className="size-5" strokeWidth={1.75} aria-hidden />
            </span>
            <p className="text-sm font-medium text-ink">You&apos;re all caught up</p>
            <p className="text-xs text-ink-subtle">New mentions and messages will appear here.</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto py-1">
            {items.map((n) => (
              <DropdownMenuItem
                key={n.id}
                asChild
                className="cursor-pointer rounded-none px-4 py-3 focus:bg-sidebar"
              >
                <Link
                  href={notificationHref(n)}
                  onClick={() => void markRead(n.id)}
                  className="flex flex-col items-start gap-0.5"
                >
                  <span className="text-sm font-medium text-ink">{n.title}</span>
                  {n.body ? (
                    <span className="line-clamp-2 text-xs text-ink-muted">{n.body}</span>
                  ) : null}
                  <span className="text-[11px] text-ink-faint">{formatWhen(n.createdAt)}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        )}

        <DropdownMenuSeparator className="bg-line" />
        <div className="p-1.5">
          <DropdownMenuItem asChild className="cursor-pointer justify-center rounded-lg py-2.5 text-sm font-medium text-brand focus:bg-brand-muted focus:text-brand">
            <Link href={`${CRM_BASE_PATH}/notifications`}>View all</Link>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
