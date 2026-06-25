import { CRM_BASE_PATH } from "@/crm/lib/constants";
import type { UserNotificationItem } from "@/crm/types";

export function notificationHref(n: UserNotificationItem) {
  if (n.conversationId) {
    const qs = n.messageId
      ? `?conversationId=${n.conversationId}&messageId=${n.messageId}`
      : `?conversationId=${n.conversationId}`;
    return `${CRM_BASE_PATH}/conversations${qs}`;
  }
  if (n.taskId) return `${CRM_BASE_PATH}/tasks?taskId=${n.taskId}`;
  if (n.leadId) return `${CRM_BASE_PATH}/leads/${n.leadId}`;
  if (n.jobId) return `${CRM_BASE_PATH}/jobs/${n.jobId}`;
  return `${CRM_BASE_PATH}/notifications`;
}
