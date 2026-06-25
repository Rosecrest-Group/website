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

export function isoToDateValue(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function dueDateToIso(dateValue: string) {
  if (!dateValue) return null;
  const [year, month, day] = dateValue.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day, 12, 0, 0).toISOString();
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
