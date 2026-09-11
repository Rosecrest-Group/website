import { CRM_BASE_PATH } from "@/crm/lib/constants";

export function conversationOpenPath(opts: {
  id: string;
  leadId?: string | null;
  messageId?: string | null;
}): string {
  if (opts.leadId) return `${CRM_BASE_PATH}/leads/${opts.leadId}?pane=internal`;
  const qs = opts.messageId
    ? `?conversationId=${opts.id}&messageId=${opts.messageId}`
    : `?conversationId=${opts.id}`;
  return `${CRM_BASE_PATH}/conversations${qs}`;
}
