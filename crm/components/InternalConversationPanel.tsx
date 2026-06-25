"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/crm/lib/api";
import type { InternalConversationSummary } from "@/crm/types";
import {
  getCachedConversationThread,
  setCachedConversationThread,
} from "@/crm/lib/conversationMessageCache";
import { fetchLatestConversationMessages } from "@/crm/lib/conversationMessages";
import CrmPanel from "@/crm/components/ui/CrmPanel";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import ConversationThread from "@/crm/components/ConversationThread";

// Simple in-memory cache for record threads
const threadCache = new Map<string, InternalConversationSummary>();
const userCache: { current: { id: string; fullName: string } | null } = { current: null };

function getThreadCacheKey(leadId?: string, jobId?: string) {
  return leadId ? `lead:${leadId}` : jobId ? `job:${jobId}` : "";
}

export default function InternalConversationPanel({
  leadId,
  jobId,
  title = "Internal discussion",
}: {
  leadId?: string;
  jobId?: string;
  title?: string;
}) {
  const cacheKey = getThreadCacheKey(leadId, jobId);
  const cachedThread = threadCache.get(cacheKey);
  const cachedUser = userCache.current;
  
  const [conversation, setConversation] = useState<InternalConversationSummary | null>(cachedThread ?? null);
  const [currentUser, setCurrentUser] = useState<{ id: string; fullName: string } | null>(cachedUser);
  const [loading, setLoading] = useState(!cachedThread || !cachedUser);
  const loadedRef = useRef(false);

  const load = useCallback(async () => {
    if (loadedRef.current && conversation && currentUser) return;
    loadedRef.current = true;

    try {
      // Start both requests in parallel
      const [me, list] = await Promise.all([
        userCache.current ? Promise.resolve(userCache.current) : api.getMe(),
        threadCache.get(cacheKey) 
          ? Promise.resolve({ items: [threadCache.get(cacheKey)!] })
          : api.listConversations({
              ...(leadId ? { leadId } : {}),
              ...(jobId ? { jobId } : {}),
              kind: "RECORD_THREAD",
            }),
      ]);

      // Cache user
      if (!userCache.current) {
        userCache.current = { id: me.id, fullName: me.fullName };
      }
      setCurrentUser(userCache.current);

      // Get or create thread
      let thread = list.items[0] ?? null;
      if (!thread) {
        thread = await api.createConversation({
          kind: "RECORD_THREAD",
          leadId,
          jobId,
        });
      }

      // Cache thread
      threadCache.set(cacheKey, thread);
      setConversation(thread);

      // Prefetch messages in background (don't await)
      if (!getCachedConversationThread(thread.id)) {
        void fetchLatestConversationMessages(thread.id);
      }
    } finally {
      setLoading(false);
    }
  }, [leadId, jobId, cacheKey, conversation, currentUser]);

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
          onConversationChange={setConversation}
        />
      </div>
    </CrmPanel>
  );
}

// Export for prefetching from LeadDetail/JobDetail
export function prefetchInternalThread(params: { leadId?: string; jobId?: string }) {
  const key = getThreadCacheKey(params.leadId, params.jobId);
  if (threadCache.has(key)) return;

  // Prefetch user
  if (!userCache.current) {
    void api.getMe().then((me) => {
      userCache.current = { id: me.id, fullName: me.fullName };
    });
  }

  // Prefetch thread
  void api
    .listConversations({
      ...(params.leadId ? { leadId: params.leadId } : {}),
      ...(params.jobId ? { jobId: params.jobId } : {}),
      kind: "RECORD_THREAD",
    })
    .then((list) => {
      const thread = list.items[0];
      if (thread) {
        threadCache.set(key, thread);
        // Also prefetch messages
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
      }
    });
}
