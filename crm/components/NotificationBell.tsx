"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
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
import { useNotificationCount } from "@/crm/lib/useNotificationCount";
import type { UserNotificationItem } from "@/crm/types";

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
  const unreadCount = useNotificationCount();
  const [items, setItems] = useState<UserNotificationItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    void api.listNotifications(true).then((r) => setItems(r.items.slice(0, 8)));
  }, [open, unreadCount]);

  async function markRead(id: string) {
    await api.markNotificationRead(id);
    setItems((prev) => prev.filter((n) => n.id !== id));
  }

  async function markAllRead() {
    await api.markAllNotificationsRead();
    setItems([]);
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
          className="relative inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-(--color-tc-20) bg-white text-(--color-tc-40) shadow-sm transition hover:border-(--color-primary)/30 hover:bg-(--color-nc-10) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary)/25"
        >
          <Bell className="size-[18px] shrink-0 stroke-[1.75]" aria-hidden />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-(--color-primary) px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[min(100vw-2rem,22rem)] overflow-hidden rounded-xl border border-(--color-tc-20) bg-white p-0 shadow-lg"
      >
        <div className="flex items-center justify-between border-b border-(--color-tc-20) bg-(--color-nc-10) px-4 py-3">
          <DropdownMenuLabel className="p-0 text-sm font-semibold text-(--color-tc-40)">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              type="button"
              className="text-xs font-medium text-(--color-primary) hover:underline"
              onClick={() => void markAllRead()}
            >
              Mark all read
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <span className="grid size-10 place-items-center rounded-full bg-(--color-nc-10) text-(--color-tc-30)">
              <Bell className="size-5 stroke-[1.5]" aria-hidden />
            </span>
            <p className="text-sm font-medium text-(--color-tc-40)">You&apos;re all caught up</p>
            <p className="text-xs text-(--color-tc-30)">New mentions and messages will appear here.</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto py-1">
            {items.map((n) => (
              <DropdownMenuItem key={n.id} asChild className="rounded-none px-0 py-0 focus:bg-(--color-nc-10)">
                <Link
                  href={notificationHref(n)}
                  className="flex w-full gap-3 border-b border-(--color-tc-20)/60 px-4 py-3 last:border-0 hover:bg-(--color-nc-10)"
                  onClick={() => void markRead(n.id)}
                >
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-(--color-primary)/10 text-(--color-primary)">
                    <Bell className="size-3.5 stroke-[2]" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block truncate text-sm font-medium text-(--color-tc-40)">
                      {n.title}
                    </span>
                    <span className="mt-0.5 block line-clamp-2 text-xs text-(--color-tc-30)">
                      {n.body}
                    </span>
                    <span className="mt-1 block text-[11px] text-(--color-tc-30)">
                      {formatWhen(n.createdAt)}
                    </span>
                  </span>
                  {!n.isRead && (
                    <span className="mt-2 size-2 shrink-0 rounded-full bg-(--color-primary)" />
                  )}
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        )}

        <DropdownMenuSeparator className="m-0 bg-(--color-tc-20)" />
        <DropdownMenuItem asChild className="rounded-none focus:bg-(--color-nc-10)">
          <Link
            href={`${CRM_BASE_PATH}/notifications`}
            className="justify-center py-3 text-center text-sm font-medium text-(--color-primary) hover:bg-(--color-nc-10)"
          >
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
