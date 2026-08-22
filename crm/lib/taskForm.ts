import type { Task } from "@/crm/types";

export type TaskFormState = {
  title: string;
  description: string;
  assigneeId: string;
  leadId: string;
  leadLabel: string;
  dueAt: string;
  status: "OPEN" | "DONE";
};

export const emptyTaskForm: TaskFormState = {
  title: "",
  description: "",
  assigneeId: "",
  leadId: "",
  leadLabel: "",
  dueAt: "",
  status: "OPEN",
};

const pad = (n: number) => n.toString().padStart(2, "0");

/** Local `YYYY-MM-DDTHH:mm` for the due-date picker. */
export function isoToDateValue(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function dueDateToIso(dateValue: string) {
  if (!dateValue) return null;
  const [datePart, timePart] = dateValue.split("T");
  const [year, month, day] = (datePart ?? "").split("-").map(Number);
  if (!year || !month || !day) return null;
  const [hour, minute] = (timePart || "09:00").split(":").map(Number);
  return new Date(year, month - 1, day, hour || 0, minute || 0, 0).toISOString();
}

export function isTaskOverdue(iso: string | null, status?: "OPEN" | "DONE") {
  if (!iso || status === "DONE") return false;
  const due = new Date(iso);
  if (Number.isNaN(due.getTime())) return false;
  return due.getTime() < Date.now();
}

export function formatTaskDueAt(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const dateLabel = d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const hour24 = d.getHours();
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${dateLabel}, ${hour12}:${pad(d.getMinutes())} ${period}`;
}

export function leadToTaskLabel(lead: {
  customerName?: string | null;
  propertyPostcode?: string | null;
  propertyAddress?: string | null;
  customer?: { firstName: string; lastName: string } | null;
}) {
  const name =
    lead.customerName?.trim() ||
    (lead.customer ? `${lead.customer.firstName} ${lead.customer.lastName}` : "Lead");
  return [name, lead.propertyPostcode, lead.propertyAddress].filter(Boolean).join(" · ");
}

export function taskToFormState(task: Task): TaskFormState {
  const lead = task.lead;
  const leadLabel = lead
    ? [lead.customerName ?? "Lead", lead.propertyPostcode, lead.propertyAddress]
        .filter(Boolean)
        .join(" · ")
    : "";

  return {
    title: task.title,
    description: task.description ?? "",
    assigneeId: task.assigneeId ?? "",
    leadId: task.leadId ?? "",
    leadLabel,
    dueAt: isoToDateValue(task.dueAt),
    status: task.status,
  };
}

export function buildTaskPayload(form: TaskFormState, includeStatus = false) {
  return {
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    assigneeId: form.assigneeId || null,
    leadId: form.leadId || null,
    dueAt: dueDateToIso(form.dueAt),
    ...(includeStatus ? { status: form.status } : {}),
  };
}
