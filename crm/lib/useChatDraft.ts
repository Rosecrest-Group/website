"use client";

import { useCallback, useSyncExternalStore } from "react";

const draftKey = (conversationId: string) => `rosecrest-chat-draft:${conversationId}`;
const DRAFT_CHANGE_EVENT = "rosecrest-chat-draft-change";

function readDraft(conversationId: string | null) {
  if (!conversationId || typeof window === "undefined") return "";
  return localStorage.getItem(draftKey(conversationId)) ?? "";
}

function subscribeDrafts(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(DRAFT_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(DRAFT_CHANGE_EVENT, onStoreChange);
  };
}

export function useChatDraft(conversationId: string | null) {
  const draft = useSyncExternalStore(
    subscribeDrafts,
    () => readDraft(conversationId),
    () => "",
  );

  const setDraft = useCallback(
    (value: string) => {
      if (!conversationId || typeof window === "undefined") return;
      if (value.trim()) {
        localStorage.setItem(draftKey(conversationId), value);
      } else {
        localStorage.removeItem(draftKey(conversationId));
      }
      window.dispatchEvent(new Event(DRAFT_CHANGE_EVENT));
    },
    [conversationId],
  );

  const clearDraft = useCallback(() => {
    setDraft("");
  }, [setDraft]);

  return { draft, setDraft, clearDraft };
}
