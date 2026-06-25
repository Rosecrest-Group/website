"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/crm/lib/api";
import { notificationHref } from "@/crm/lib/notificationLinks";
import type { UserNotificationItem } from "@/crm/types";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import CurvedContainer from "@/crm/components/ui/CurvedContainer";

export default function NotificationsView() {
  const [items, setItems] = useState<UserNotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);

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

  return (
    <CrmPageContent>
      <CrmPageHeader
        title="Notifications"
        actions={
          <div className="flex gap-2">
            <SecondaryButton type="button" size="small" onClick={() => setUnreadOnly((v) => !v)}>
              {unreadOnly ? "Show all" : "Unread only"}
            </SecondaryButton>
            <PrimaryButton
              type="button"
              className="w-auto"
              onClick={async () => {
                await api.markAllNotificationsRead();
                void load();
              }}
            >
              Mark all read
            </PrimaryButton>
          </div>
        }
      />
      {loading ? (
          <LoadingSpinner />
        ) : items.length === 0 ? (
          <p className="text-sm text-(--color-tc-30)">No notifications.</p>
        ) : (
          <div className="space-y-3">
            {items.map((n) => (
              <Link key={n.id} href={notificationHref(n)} onClick={() => void api.markNotificationRead(n.id)}>
                <CurvedContainer
                  className={`block p-4 transition hover:bg-(--color-nc-10) ${!n.isRead ? "border-(--color-primary)/30 bg-(--color-primary)/5" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-(--color-tc-40)">{n.title}</p>
                      <p className="mt-1 text-sm text-(--color-tc-30)">{n.body}</p>
                      <p className="mt-2 text-xs text-(--color-tc-30)">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!n.isRead && <span className="size-2 shrink-0 rounded-full bg-(--color-primary)" />}
                  </div>
                </CurvedContainer>
              </Link>
            ))}
          </div>
        )}
    </CrmPageContent>
  );
}
