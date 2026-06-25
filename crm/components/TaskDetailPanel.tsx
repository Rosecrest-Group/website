"use client";

import { useEffect, useState } from "react";
import { api } from "@/crm/lib/api";
import {
  buildTaskPayload,
  taskToFormState,
  type TaskFormState,
} from "@/crm/lib/taskForm";
import type { Task } from "@/crm/types";
import CrmSlidePanel from "@/crm/components/ui/CrmSlidePanel";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import TaskFormFields from "@/crm/components/TaskFormFields";

export interface TaskDetailPanelProps {
  task: Task | null;
  teamMembers: Array<{ id: string; fullName: string }>;
  onClose: () => void;
  onUpdated: (task: Task) => void;
  onDeleted: (taskId: string) => void;
}

export default function TaskDetailPanel({
  task,
  teamMembers,
  onClose,
  onUpdated,
  onDeleted,
}: TaskDetailPanelProps) {
  const [form, setForm] = useState<TaskFormState | null>(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (task) {
      setForm(taskToFormState(task));
      setFormError("");
    } else {
      setForm(null);
    }
  }, [task?.id, task?.updatedAt]);

  function patchForm(patch: Partial<TaskFormState>) {
    setForm((current) => (current ? { ...current, ...patch } : current));
  }

  async function handleSave() {
    if (!task || !form) return;
    if (!form.title.trim()) {
      setFormError("Title is required");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      const updated = await api.updateTask(task.id, buildTaskPayload(form, true));
      onUpdated(updated);
      setForm(taskToFormState(updated));
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to save task");
    } finally {
      setSaving(false);
    }
  }

  async function handleComplete() {
    if (!task || task.status === "DONE") return;
    setSaving(true);
    setFormError("");
    try {
      const updated = await api.completeTask(task.id);
      onUpdated(updated);
      setForm(taskToFormState(updated));
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to complete task");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!task) return;
    setDeleting(true);
    setFormError("");
    try {
      await api.deleteTask(task.id);
      onDeleted(task.id);
      onClose();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to delete task");
    } finally {
      setDeleting(false);
    }
  }

  const busy = saving || deleting;

  return (
    <CrmSlidePanel
      isOpen={Boolean(task)}
      onClose={onClose}
      closeDisabled={busy}
      title="Task details"
      description={task ? "Edit task details inline." : undefined}
      widthClassName="max-w-lg"
      footer={
        task && form ? (
          <>
            <SecondaryButton
              type="button"
              className="w-auto text-red-600 hover:text-red-700"
              disabled={busy}
              onClick={() => void handleDelete()}
            >
              {deleting ? "Deleting…" : "Delete"}
            </SecondaryButton>
            {form.status === "OPEN" && (
              <SecondaryButton type="button" className="w-auto" disabled={busy} onClick={() => void handleComplete()}>
                Mark done
              </SecondaryButton>
            )}
            <PrimaryButton type="button" className="w-auto px-6" disabled={busy} onClick={() => void handleSave()}>
              {saving ? "Saving…" : "Save changes"}
            </PrimaryButton>
          </>
        ) : undefined
      }
    >
      {task && form && (
        <>
          <TaskFormFields
            form={form}
            onChange={patchForm}
            teamMembers={teamMembers}
            showStatus
            leadLink={form.leadId ? `/crm/leads/${form.leadId}` : null}
            dueDatePlacement="down"
            disabled={busy}
          />
          {formError && <p className="mt-4 text-sm text-red-600">{formError}</p>}
          <p className="mt-6 text-xs text-(--color-tc-30)">
            Created by {task.createdBy.fullName} ·{" "}
            {new Date(task.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </>
      )}
    </CrmSlidePanel>
  );
}
