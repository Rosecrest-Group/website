"use client";

import { useEffect, useState } from "react";
import { api } from "@/crm/lib/api";
import {
  buildTaskPayload,
  emptyTaskForm,
  type TaskFormState,
} from "@/crm/lib/taskForm";
import type { Task } from "@/crm/types";
import CrmModal from "@/crm/components/ui/CrmModal";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import TaskFormFields from "@/crm/components/TaskFormFields";

export default function CreateTaskModal({
  isOpen,
  onClose,
  onCreated,
  teamMembers,
  initialLead,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (task: Task) => void;
  teamMembers: Array<{ id: string; fullName: string }>;
  initialLead?: { id: string; label: string } | null;
}) {
  const [form, setForm] = useState<TaskFormState>(emptyTaskForm);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      ...emptyTaskForm,
      leadId: initialLead?.id ?? "",
      leadLabel: initialLead?.label ?? "",
    });
    setError("");
  }, [isOpen, initialLead?.id, initialLead?.label]);

  function handleClose() {
    if (creating) return;
    onClose();
  }

  async function handleCreate() {
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }

    setCreating(true);
    setError("");
    try {
      const task = await api.createTask(buildTaskPayload(form));
      onCreated?.(task);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create task");
    } finally {
      setCreating(false);
    }
  }

  return (
    <CrmModal
      isOpen={isOpen}
      title="New task"
      description={
        initialLead
          ? "This task will be linked to the current lead."
          : "Create a task and assign it to a team member."
      }
      onClose={handleClose}
      closeDisabled={creating}
      size="lg"
      footer={
        <>
          <SecondaryButton type="button" className="w-auto" disabled={creating} onClick={handleClose}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="button" className="w-auto px-6" disabled={creating} onClick={() => void handleCreate()}>
            {creating ? "Creating…" : "Create task"}
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <TaskFormFields
          form={form}
          onChange={(patch) => setForm((current) => ({ ...current, ...patch }))}
          teamMembers={teamMembers}
          dueDatePlacement="up"
          disabled={creating}
          wide
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </CrmModal>
  );
}
