"use client";

import { useEffect, useRef } from "react";
import { api } from "@/crm/lib/api";

export type CollaborationEventHandler = (event: {
  type: string;
  conversationId?: string;
  messageId?: string;
  userId?: string;
  userName?: string;
  isTyping?: boolean;
  status?: string;
}) => void;

export function useCollaborationRealtime(onEvent: CollaborationEventHandler, enabled = true) {
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    let es: EventSource | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const connect = () => {
      if (cancelled) return;
      es = new EventSource(api.getCollaborationEventsUrl(), { withCredentials: true });

      const handle = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data as string);
          handlerRef.current({ type: event.type, ...data });
        } catch {
          // ignore malformed events
        }
      };

      es.addEventListener("message.new", handle);
      es.addEventListener("message.updated", handle);
      es.addEventListener("message.deleted", handle);
      es.addEventListener("reaction.updated", handle);
      es.addEventListener("conversation.updated", handle);
      es.addEventListener("conversation.read", handle);
      es.addEventListener("typing", handle);
      es.addEventListener("presence", handle);
      es.addEventListener("pin.updated", handle);

      es.onerror = () => {
        es?.close();
        if (!cancelled) {
          retryTimer = setTimeout(connect, 5000);
        }
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      es?.close();
    };
  }, [enabled]);
}
