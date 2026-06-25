"use client";

import { useCallback, useEffect, useState } from "react";

const draftKey = (conversationId: string) => `rosecrest-chat-draft:${conversationId}`;

export function useChatDraft(conversationId: string | null) {
  const [draft, setDraftState] = useState("");

  useEffect(() => {
    if (!conversationId || typeof window === "undefined") {
      setDraftState("");
      return;
    }
    setDraftState(localStorage.getItem(draftKey(conversationId)) ?? "");
  }, [conversationId]);

  const setDraft = useCallback(
    (value: string) => {
      setDraftState(value);
      if (!conversationId || typeof window === "undefined") return;
      if (value.trim()) {
        localStorage.setItem(draftKey(conversationId), value);
      } else {
        localStorage.removeItem(draftKey(conversationId));
      }
    },
    [conversationId]
  );

  const clearDraft = useCallback(() => {
    setDraftState("");
    if (conversationId && typeof window !== "undefined") {
      localStorage.removeItem(draftKey(conversationId));
    }
  }, [conversationId]);

  return { draft, setDraft, clearDraft };
}
