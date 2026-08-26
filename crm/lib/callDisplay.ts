import type { DialpadCall, DialpadCallStatus } from "@/crm/types";

export function formatCallDuration(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}m ${String(secs).padStart(2, "0")}s`;
}

export function formatTalkTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  if (total < 60) return `${total}s`;
  return `${mins}m`;
}

export function callDisplayName(call: Pick<DialpadCall, "customerName" | "contactNumber">): string {
  return call.customerName?.trim() || call.contactNumber || "Unknown caller";
}

export function phonesLooselyMatch(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false;
  const da = a.replace(/\D/g, "").slice(-10);
  const db = b.replace(/\D/g, "").slice(-10);
  return da.length >= 8 && da === db;
}

export function parseCallDirection(raw: unknown): DialpadCall["direction"] | null {
  if (typeof raw !== "string") return null;
  const text = raw.trim().toLowerCase();
  if (!text) return null;
  if (text === "inbound" || text === "incoming" || text === "in") return "inbound";
  if (text === "outbound" || text === "outgoing" || text === "out") return "outbound";
  if (text.includes("inbound") || text.includes("incoming")) return "inbound";
  if (text.includes("outbound") || text.includes("outgoing")) return "outbound";
  return null;
}

export function resolveCallDirection(
  meta: Record<string, unknown> | null | undefined,
  customerPhone?: string | null,
  description?: string | null
): DialpadCall["direction"] {
  const record = meta ?? {};
  const explicit = parseCallDirection(record.direction);
  if (explicit) return explicit;

  const from = typeof record.from === "string" ? record.from : null;
  const to = typeof record.to === "string" ? record.to : null;
  if (customerPhone && phonesLooselyMatch(from, customerPhone)) return "inbound";
  if (customerPhone && phonesLooselyMatch(to, customerPhone)) return "outbound";

  const nested =
    record.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata)
      ? (record.metadata as Record<string, unknown>)
      : null;
  const nestedDirection = parseCallDirection(nested?.direction);
  if (nestedDirection) return nestedDirection;

  const desc = (description ?? "").trim().toLowerCase();
  if (desc.startsWith("inbound")) return "inbound";
  if (desc.startsWith("outbound")) return "outbound";

  return "outbound";
}

export function callDirectionLabel(direction: DialpadCall["direction"]): "Incoming" | "Outgoing" {
  return direction === "outbound" ? "Outgoing" : "Incoming";
}

export function callStatusLabel(
  call: Pick<DialpadCall, "status" | "direction" | "outcome">
): string {
  if (call.status === "live") {
    return call.direction === "outbound" ? "Outgoing call…" : "Incoming call…";
  }
  if (call.status === "voicemail") {
    return call.direction === "outbound" ? "Outgoing voicemail" : "Incoming voicemail";
  }
  if (call.status === "missed") {
    const outcome = call.outcome ?? "";
    if (outcome === "busy") return "Busy";
    if (outcome === "cancelled" || outcome === "canceled") return "Cancelled";
    return call.direction === "outbound" ? "No answer" : "Missed call";
  }
  return call.direction === "outbound" ? "Outgoing call" : "Incoming call";
}

export function callStatusTone(
  status: DialpadCallStatus,
  direction: DialpadCall["direction"] = "inbound"
): {
  icon: string;
  tile: string;
  ring: string;
} {
  if (status === "missed") {
    return {
      icon: "text-rose-700",
      tile: "bg-rose-50",
      ring: "ring-rose-200",
    };
  }
  if (status === "live") {
    return {
      icon: "text-amber-700",
      tile: "bg-amber-50",
      ring: "ring-amber-200",
    };
  }
  if (status === "voicemail") {
    return {
      icon: "text-brand",
      tile: "bg-brand-muted",
      ring: "ring-brand-light/50",
    };
  }
  if (direction === "outbound") {
    return {
      icon: "text-sky-700",
      tile: "bg-sky-50",
      ring: "ring-sky-200",
    };
  }
  return {
    icon: "text-emerald-700",
    tile: "bg-emerald-50",
    ring: "ring-emerald-200",
  };
}
