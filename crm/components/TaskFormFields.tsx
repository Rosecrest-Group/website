"use client";

import Link from "next/link";
import TextField from "@/crm/components/ui/TextField";
import SelectField from "@/crm/components/ui/SelectField";
import CalendarInput from "@/crm/components/ui/CalendarInput";
import LeadSearchPicker from "@/crm/components/ui/LeadSearchPicker";
import StatusPill from "@/crm/components/ui/StatusPill";
import { TASK_STATUS_LABELS } from "@/crm/lib/constants";
import type { TaskFormState } from "@/crm/lib/taskForm";
import type { TaskStatus } from "@/crm/types";

function taskStatusToPillVariant(status: TaskStatus): "completed" | "pending" {
  return status === "DONE" ? "completed" : "pending";
}

export interface TaskFormFieldsProps {
  form: TaskFormState;
  onChange: (patch: Partial<TaskFormState>) => void;
  teamMembers: Array<{ id: string; fullName: string }>;
  showStatus?: boolean;
  leadLink?: string | null;
  dueDatePlacement?: "up" | "down";
  disabled?: boolean;
  wide?: boolean;
}

export default function TaskFormFields({
  form,
  onChange,
  teamMembers,
  showStatus = false,
  leadLink,
  dueDatePlacement = "up",
  disabled = false,
  wide = false,
}: TaskFormFieldsProps) {
  const assigneeField = (
    <SelectField
      label="Assign to"
      value={form.assigneeId}
      disabled={disabled}
      onChange={(e) => onChange({ assigneeId: e.target.value })}
    >
      <option value="">Unassigned</option>
      {teamMembers.map((member) => (
        <option key={member.id} value={member.id}>
          {member.fullName}
        </option>
      ))}
    </SelectField>
  );

  const leadField = (
    <LeadSearchPicker
      value={form.leadId || null}
      displayLabel={form.leadLabel || null}
      placement={dueDatePlacement}
      disabled={disabled}
      onChange={(leadId, leadLabel) =>
        onChange({
          leadId: leadId ?? "",
          leadLabel: leadLabel ?? "",
        })
      }
    />
  );

  const dueDateField = (
    <CalendarInput
      id="task-due-date"
      label="Due date"
      name="dueAt"
      value={form.dueAt}
      placeholder="Select date and time"
      placement={dueDatePlacement}
      includeTime
      onChange={(_name, value) => onChange({ dueAt: value })}
    />
  );

  return (
    <div className="space-y-4">
      {showStatus && (
        <div className="flex items-center justify-between gap-3">
          <SelectField
            label="Status"
            value={form.status}
            disabled={disabled}
            onChange={(e) => onChange({ status: e.target.value as TaskStatus })}
          >
            <option value="OPEN">Open</option>
            <option value="DONE">Done</option>
          </SelectField>
          <StatusPill
            variant={taskStatusToPillVariant(form.status)}
            label={TASK_STATUS_LABELS[form.status]}
          />
        </div>
      )}

      <TextField
        label="Title"
        value={form.title}
        disabled={disabled}
        onChange={(e) => onChange({ title: e.target.value })}
        placeholder="What needs to be done?"
        required
      />

      <div className="space-y-1.5">
        <label htmlFor="task-description" className="text-sm font-medium text-(--color-tc-40)">
          Description
        </label>
        <textarea
          id="task-description"
          value={form.description}
          disabled={disabled}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Optional details…"
          rows={4}
          className="w-full rounded-xl border border-(--color-tc-20) bg-white px-4 py-3 text-sm text-(--color-tc-40) outline-none placeholder:text-(--color-tc-30) focus:ring-2 focus:ring-(--color-primary)/20 disabled:opacity-50"
        />
      </div>

      {wide ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {assigneeField}
          <div>{leadField}</div>
          <div className="sm:col-span-2">{dueDateField}</div>
        </div>
      ) : (
        <>
          {assigneeField}
          {dueDateField}
          {leadField}
          {leadLink && form.leadId && (
            <Link href={leadLink} className="inline-block text-sm text-(--color-primary) hover:underline">
              View linked lead →
            </Link>
          )}
        </>
      )}
    </div>
  );
}
