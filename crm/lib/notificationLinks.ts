import { CRM_BASE_PATH } from "@/crm/lib/constants";
import type { UserNotificationItem } from "@/crm/types";

export function notificationHref(n: UserNotificationItem) {
  if (n.conversationId) {
    const qs = n.messageId
      ? `?conversationId=${n.conversationId}&messageId=${n.messageId}`
      : `?conversationId=${n.conversationId}`;
    return `${CRM_BASE_PATH}/conversations${qs}`;
  }
  // A MESSAGE with a lead but no conversation is an inbound client email/SMS/WhatsApp,
  // which lives in the shared inbox rather than on the lead record.
  if (n.type === "MESSAGE" && n.leadId) return `${CRM_BASE_PATH}/inbox?leadId=${n.leadId}`;
  if (n.taskId) return `${CRM_BASE_PATH}/tasks?taskId=${n.taskId}`;
  if (n.leadId) return `${CRM_BASE_PATH}/leads/${n.leadId}`;
  if (n.jobId) return `${CRM_BASE_PATH}/jobs/${n.jobId}`;
  return `${CRM_BASE_PATH}/notifications`;
}

/**
 * Matches the tag the API sends with web push, so a locally raised notification and the
 * pushed one collapse into a single entry instead of stacking up.
 */
export function notificationTag(n: UserNotificationItem) {
  if (n.type === "MESSAGE" && n.leadId && !n.conversationId) return `lead-inbox-${n.leadId}`;
  return n.id;
}
