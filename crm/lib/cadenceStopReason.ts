/** Human-readable labels for cadence / workflow stop reason codes (CRM). */
export function humanizeCadenceStopReason(reason: string): string {
  const map: Record<string, string> = {
    customer_replied_opt_out: "Customer opted out of messages",
    customer_replied_wrong_number: "Customer said this is the wrong number",
    customer_replied_no_to_interest: "Customer replied no to interest follow-up",
    payment_received: "Customer paid — nurture stopped",
    manual_stop: "Manually stopped",
    stop_condition: "Stop condition met",
    DND_REQUESTED: "Do not contact requested",
    WRONG_NUMBER: "Wrong number",
    NO_LONGER_NEEDED: "No longer needed",
    CHOSE_COMPETITOR: "Chose competitor",
    TIMING_WRONG: "Timing wrong",
    PROPERTY_FELL_THROUGH: "Property fell through",
    UNRESPONSIVE: "Unresponsive",
    DUPLICATE: "Duplicate",
    OUT_OF_AREA: "Out of area",
    OTHER: "Other",
    TOO_EXPENSIVE: "Too expensive",
  };
  if (map[reason]) return map[reason];
  return reason.replace(/_/g, " ");
}

export function cadenceStopTooltip(activity: {
  description?: string;
  metadata?: Record<string, unknown> | null;
}): string {
  const meta = activity.metadata ?? {};
  if (typeof meta.reasonLabel === "string" && meta.reasonLabel.trim()) return meta.reasonLabel;
  if (typeof meta.reason === "string" && meta.reason.trim()) {
    return humanizeCadenceStopReason(meta.reason);
  }
  if (typeof meta.lostReason === "string" && meta.lostReason.trim()) {
    return humanizeCadenceStopReason(meta.lostReason);
  }
  return activity.description?.trim() || "Cadence stopped";
}
