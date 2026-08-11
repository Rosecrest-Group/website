"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/crm/lib/api";
import type { InternalConversationSummary } from "@/crm/types";
import {
  getCachedConversationThread,
  setCachedConversationThread,
} from "@/crm/lib/conversationMessageCache";
import { fetchLatestConversationMessages } from "@/crm/lib/conversationMessages";
import {
  cacheRecordThread,
  ensureRecordThread,
  peekRecordThread,
} from "@/crm/lib/recordThread";
import CrmPanel from "@/crm/components/ui/CrmPanel";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import ConversationThread from "@/crm/components/ConversationThread";

const userCache: { current: { id: string; fullName: string } | null } = { current: null };

export default function InternalConversationPanel({
  leadId,
  jobId,
  title = "Internal discussion",
}: {
  leadId?: string;
  jobId?: string;
  title?: string;
}) {
  const cachedThread = peekRecordThread({ leadId, jobId });
  const cachedUser = userCache.current;

  const [conversation, setConversation] = useState<InternalConversationSummary | null>(
    cachedThread ?? null
  );
  const [currentUser, setCurrentUser] = useState<{ id: string; fullName: string } | null>(
    cachedUser
  );
  const [loading, setLoading] = useState(!cachedThread || !cachedUser);
  const loadedRef = useRef(false);

  const load = useCallback(async () => {
    if (loadedRef.current && conversation && currentUser) return;
    loadedRef.current = true;

    try {
      const [me, thread] = await Promise.all([
        userCache.current ? Promise.resolve(userCache.current) : api.getMe(),
        ensureRecordThread({ leadId, jobId }),
      ]);

      if (!userCache.current) {
        userCache.current = { id: me.id, fullName: me.fullName };
      }
      setCurrentUser(userCache.current);
      setConversation(thread);

      if (!getCachedConversationThread(thread.id)) {
        void fetchLatestConversationMessages(thread.id);
      }
    } finally {
      setLoading(false);
    }
  }, [leadId, jobId, conversation, currentUser]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading || !conversation || !currentUser) {
    return (
      <CrmPanel title={title}>
        <LoadingSpinner />
      </CrmPanel>
    );
  }

  return (
    <CrmPanel title={title}>
      <p className="mb-3 text-xs text-(--color-tc-30)">
        Internal only — not visible to customers. Use @name, @here, or @operations to mention teammates.
      </p>
      <div className="overflow-hidden rounded-xl border border-(--color-tc-20)">
        <ConversationThread
          embedded
          conversation={conversation}
          currentUser={currentUser}
          onConversationChange={(next) => {
            setConversation(next);
            cacheRecordThread({ leadId, jobId }, next);
          }}
        />
      </div>
    </CrmPanel>
  );
}

// Export for prefetching from LeadDetail/JobDetail
export function prefetchInternalThread(params: { leadId?: string; jobId?: string }) {
  if (peekRecordThread(params)) return;

  if (!userCache.current) {
    void api.getMe().then((me) => {
      userCache.current = { id: me.id, fullName: me.fullName };
    });
  }

  void ensureRecordThread(params).then((thread) => {
    if (!getCachedConversationThread(thread.id)) {
      void fetchLatestConversationMessages(thread.id).then((r) => {
        setCachedConversationThread(thread.id, {
          messages: r.items,
          pinned: [],
          page: r.lastPage,
          hasMore: r.hasOlder,
        });
      });
    }
  });
}
