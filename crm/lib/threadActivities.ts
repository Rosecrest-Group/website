import type { Activity } from "@/crm/types";

/** Activity types shown inline in the lead/inbox message thread. */
export function isLeadThreadActivity(activity: Pick<Activity, "type">): boolean {
  return (
    activity.type.includes("call") ||
    activity.type === "cadence.stopped" ||
    activity.type === "payment.received"
  );
}

export function filterLeadThreadActivities<T extends Pick<Activity, "type">>(
  activities: T[]
): T[] {
  return activities.filter(isLeadThreadActivity);
}
