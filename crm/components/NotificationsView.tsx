"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/crm/lib/api";
import { notificationHref } from "@/crm/lib/notificationLinks";
import type { UserNotificationItem } from "@/crm/types";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SelectField from "@/crm/components/ui/SelectField";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import StatusPill from "@/crm/components/ui/StatusPill";
import Table, { type Column } from "@/crm/components/ui/Table";

const TYPE_LABELS: Record<UserNotificationItem["type"], string> = {
  MESSAGE: "Message",
  MENTION: "Mention",
  ASSIGNMENT: "Assignment",
};

const TYPE_PILL: Record<
  UserNotificationItem["type"],
  "awaiting" | "pending" | "in-review"
> = {
  MESSAGE: "awaiting",
  MENTION: "pending",
  ASSIGNMENT: "in-review",
};

function formatWhen(iso: string) {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function NotificationsView() {
  const router = useRouter();
  const [items, setItems] = useState<UserNotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [markingAll, setMarkingAll] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.listNotifications(unreadOnly);
      setItems(r.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [unreadOnly]);

  const filtered = search.trim()
    ? items.filter((n) => {
        const q = search.toLowerCase();
        return (
          n.title.toLowerCase().includes(q) ||
          n.body.toLowerCase().includes(q) ||
          TYPE_LABELS[n.type].toLowerCase().includes(q)
        );
      })
    : items;

  const unreadCount = items.filter((n) => !n.isRead).length;

  async function openNotification(n: UserNotificationItem) {
    if (!n.isRead) {
      await api.markNotificationRead(n.id);
      setItems((prev) =>
        prev.map((item) =>
          item.id === n.id ? { ...item, isRead: true, readAt: new Date().toISOString() } : item
        )
      );
    }
    router.push(notificationHref(n));
  }

  const columns: Column<UserNotificationItem & Record<string, unknown>>[] = [
    {
      key: "title",
      header: "Notification",
      render: (_, row) => (
        <div className="min-w-0 max-w-md">
          <p className={`text-sm ${row.isRead ? "font-normal text-ink" : "font-medium text-ink"}`}>
            {row.title}
          </p>
          {row.body ? (
            <p className="mt-0.5 line-clamp-2 text-xs text-ink-muted">{row.body}</p>
          ) : null}
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (value) => {
        const type = value as UserNotificationItem["type"];
        return (
          <StatusPill
            variant={TYPE_PILL[type] ?? "paused"}
            label={TYPE_LABELS[type] ?? String(value)}
          />
        );
      },
    },
    {
      key: "isRead",
      header: "Status",
      render: (value) =>
        value ? (
          <StatusPill variant="completed" label="Read" />
        ) : (
          <StatusPill variant="new" label="Unread" />
        ),
    },
    {
      key: "createdAt",
      header: "When",
      align: "right",
      render: (value) => (
        <span className="text-sm text-ink-muted tabular-nums">{formatWhen(value as string)}</span>
      ),
    },
  ];

  return (
    <CrmPageContent>
      <CrmPageHeader
        title="Notifications"
        subtitle={
          unreadCount > 0
            ? `${unreadCount} unread`
            : items.length > 0
              ? "You're all caught up"
              : undefined
        }
        actions={
          <PrimaryButton
            type="button"
            className="w-auto"
            disabled={markingAll || unreadCount === 0}
            onClick={async () => {
              setMarkingAll(true);
              try {
                await api.markAllNotificationsRead();
                await load();
              } finally {
                setMarkingAll(false);
              }
            }}
          >
            Mark all read
          </PrimaryButton>
        }
      />

      {loading && items.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <Table
          title="All notifications"
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search notifications…"
          toolbarExtra={
            <SelectField
              variant="filter"
              value={unreadOnly ? "unread" : "all"}
              onChange={(e) => setUnreadOnly(e.target.value === "unread")}
            >
              <option value="all">All</option>
              <option value="unread">Unread only</option>
            </SelectField>
          }
          columns={columns}
          data={filtered as (UserNotificationItem & Record<string, unknown>)[]}
          getRowKey={(r) => r.id}
          onRowClick={(row) => void openNotification(row)}
          rowClassName={(row) => (!row.isRead ? "bg-brand-muted/40" : "")}
          emptyMessage={
            unreadOnly ? "No unread notifications" : "No notifications yet"
          }
          totalCount={filtered.length}
          loading={loading}
        />
      )}
    </CrmPageContent>
  );
}
