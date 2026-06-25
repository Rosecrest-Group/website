import { api } from "@/crm/lib/api";
import type { InternalMessageItem } from "@/crm/types";
import type { Paginated } from "@/crm/types";

export type ConversationMessagesPage = Paginated<InternalMessageItem> & {
  lastPage: number;
  hasOlder: boolean;
};

export async function fetchLatestConversationMessages(
  conversationId: string
): Promise<ConversationMessagesPage> {
  const latest = await api.listConversationMessages(conversationId, { latest: true });
  const lastPage = latest.lastPage ?? latest.page;
  const hasOlder = latest.hasOlder ?? lastPage > 1;
  return { ...latest, lastPage, hasOlder };
}

export async function fetchOlderConversationMessages(
  conversationId: string,
  page: number
) {
  return api.listConversationMessages(conversationId, page);
}
