"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Trash2 } from "lucide-react";
import { api } from "@/crm/lib/api";
import { TASK_STATUS_LABELS } from "@/crm/lib/constants";
import {
  buildTaskPayload,
  emptyTaskForm,
  type TaskFormState,
} from "@/crm/lib/taskForm";
import type { Task, TaskStatus } from "@/crm/types";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import SearchInput from "@/crm/components/admin/SearchInput";
import SelectField from "@/crm/components/ui/SelectField";
import Table, { type Column } from "@/crm/components/ui/Table";
import StatusPill from "@/crm/components/ui/StatusPill";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import CrmModal from "@/crm/components/ui/CrmModal";
import ActionDropdown from "@/crm/components/ui/ActionDropdown";
import ConfirmModal from "@/crm/components/ui/ConfirmModal";
import TaskFormFields from "@/crm/components/TaskFormFields";
import TaskDetailPanel from "@/crm/components/TaskDetailPanel";
import { cn } from "@/lib/utils";

function taskStatusToPillVariant(status: TaskStatus): "completed" | "pending" {
  return status === "DONE" ? "completed" : "pending";
}

function formatDueDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function TasksList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [teamMembers, setTeamMembers] = useState<Array<{ id: string; fullName: string }>>([]);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<TaskFormState>(emptyTaskForm);
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (status) params.status = status;
    if (assigneeFilter) params.assigneeId = assigneeFilter;

    api
      .listTasks(params)
      .then((res) => {
        setTasks(res.items);
        setTotal(res.total);
        setError("");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load tasks"))
      .finally(() => setLoading(false));
  }, [search, status, assigneeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    api.getMentionSuggestions().then((res) => {
      setTeamMembers(res.users.map((u) => ({ id: u.id, fullName: u.fullName })));
    }).catch(() => {});
  }, []);

  const openTaskPanel = useCallback(
    (task: Task) => {
      setSelectedTask(task);
      router.replace(`/crm/tasks?taskId=${task.id}`, { scroll: false });
    },
    [router]
  );

  const closeTaskPanel = useCallback(() => {
    setSelectedTask(null);
    router.replace("/crm/tasks", { scroll: false });
  }, [router]);

  useEffect(() => {
    const taskId = searchParams.get("taskId");
    if (!taskId) {
      setSelectedTask(null);
      return;
    }
    if (selectedTask?.id === taskId) return;

    const existing = tasks.find((t) => t.id === taskId);
    if (existing) {
      setSelectedTask(existing);
      return;
    }

    api
      .getTask(taskId)
      .then(setSelectedTask)
      .catch(() => {
        setSelectedTask(null);
        router.replace("/crm/tasks", { scroll: false });
      });
  }, [searchParams, tasks, selectedTask?.id, router]);

  function openCreateModal() {
    setCreateForm(emptyTaskForm);
    setCreateError("");
    setCreateOpen(true);
  }

  function closeCreateModal() {
    if (creating) return;
    setCreateOpen(false);
    setCreateForm(emptyTaskForm);
    setCreateError("");
  }

  async function handleCreate() {
    if (!createForm.title.trim()) {
      setCreateError("Title is required");
      return;
    }

    setCreating(true);
    setCreateError("");
    try {
      await api.createTask(buildTaskPayload(createForm));
      closeCreateModal();
      load();
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Failed to create task");
    } finally {
      setCreating(false);
    }
  }

  function handleTaskUpdated(updated: Task) {
    setTasks((current) => current.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTask(updated);
  }

  function handleTaskDeleted(taskId: string) {
    setTasks((current) => current.filter((t) => t.id !== taskId));
    setTotal((current) => Math.max(0, current - 1));
    if (selectedTask?.id === taskId) setSelectedTask(null);
  }

  async function handleComplete(task: Task) {
    if (task.status === "DONE") return;
    setActionLoadingId(task.id);
    try {
      const updated = await api.completeTask(task.id);
      handleTaskUpdated(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to complete task");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await api.deleteTask(deleteTarget.id);
      handleTaskDeleted(deleteTarget.id);
      setDeleteTarget(null);
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Failed to delete task");
    } finally {
      setDeleting(false);
    }
  }

  function handleRowAction(task: Task, actionId: string) {
    if (actionId === "complete") void handleComplete(task);
    else if (actionId === "delete") setDeleteTarget(task);
  }

  const columns: Column<Task & Record<string, unknown>>[] = [
    {
      key: "title",
      header: "Task",
      render: (_, row) => (
        <div>
          <p
            className={cn(
              "font-medium",
              row.status === "DONE" ? "text-(--color-tc-30) line-through" : "text-(--color-tc-40)"
            )}
          >
            {row.title}
          </p>
          {row.description && (
            <p className="mt-0.5 max-w-md truncate text-xs text-(--color-tc-30)">{row.description}</p>
          )}
        </div>
      ),
    },
    {
      key: "assignee",
      header: "Assignee",
      render: (_, row) => (
        <span className="text-(--color-tc-30)">{row.assignee?.fullName ?? "Unassigned"}</span>
      ),
    },
    {
      key: "lead",
      header: "Lead",
      render: (_, row) => {
        if (!row.lead) return <span className="text-(--color-tc-30)">—</span>;
        return (
          <Link
            href={`/crm/leads/${row.lead.id}`}
            className="text-(--color-primary) hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {row.lead.customerName ?? row.lead.propertyPostcode ?? "View lead"}
          </Link>
        );
      },
    },
    {
      key: "dueAt",
      header: "Due",
      render: (value) => (
        <span className="text-(--color-tc-30)">{formatDueDate(value as string | null)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value) => (
        <StatusPill
          variant={taskStatusToPillVariant(value as TaskStatus)}
          label={TASK_STATUS_LABELS[value as string] ?? (value as string)}
        />
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (_, row) => {
        const actions = [
          ...(row.status === "OPEN"
            ? [
                {
                  id: "complete",
                  label: "Mark done",
                  icon: <Check className="h-4 w-4" />,
                },
              ]
            : []),
          {
            id: "delete",
            label: "Delete",
            icon: <Trash2 className="h-4 w-4" />,
            variant: "danger" as const,
          },
        ];

        return (
          <div onClick={(e) => e.stopPropagation()}>
            <ActionDropdown
              actions={actions}
              onActionClick={(actionId) => handleRowAction(row, actionId)}
            />
          </div>
        );
      },
    },
  ];

  return (
    <CrmPageContent>
      <CrmPageHeader
        title="Tasks"
        subtitle={`${total} total`}
        actions={
          <PrimaryButton type="button" onClick={openCreateModal}>
            New task
          </PrimaryButton>
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <SearchInput
          className="max-w-md min-w-[200px] flex-1"
          placeholder="Search tasks…"
          value={search}
          onChange={setSearch}
        />
        <SelectField value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="DONE">Done</option>
        </SelectField>
        <SelectField value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}>
          <option value="">All assignees</option>
          {teamMembers.map((member) => (
            <option key={member.id} value={member.id}>
              {member.fullName}
            </option>
          ))}
        </SelectField>
        <SecondaryButton type="button" onClick={load}>
          Search
        </SecondaryButton>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <LoadingSpinner />
      ) : tasks.length === 0 ? (
        <p className="text-center text-(--color-tc-30)">No tasks found</p>
      ) : (
        <Table
          columns={columns}
          data={tasks as (Task & Record<string, unknown>)[]}
          getRowKey={(r) => r.id}
          onRowClick={(row) => openTaskPanel(row)}
          rowClassName={(row) =>
            selectedTask?.id === row.id ? "bg-(--color-nc-10) hover:bg-(--color-nc-10)" : ""
          }
        />
      )}

      {actionLoadingId && <p className="text-xs text-(--color-tc-30)">Updating task…</p>}

      <TaskDetailPanel
        task={selectedTask}
        teamMembers={teamMembers}
        onClose={closeTaskPanel}
        onUpdated={handleTaskUpdated}
        onDeleted={handleTaskDeleted}
      />

      <CrmModal
        isOpen={createOpen}
        title="New task"
        description="Create a task and assign it to a team member."
        onClose={closeCreateModal}
        closeDisabled={creating}
        footer={
          <>
            <SecondaryButton type="button" className="w-auto" disabled={creating} onClick={closeCreateModal}>
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
            form={createForm}
            onChange={(patch) => setCreateForm((f) => ({ ...f, ...patch }))}
            teamMembers={teamMembers}
            dueDatePlacement="up"
            disabled={creating}
          />
          {createError && <p className="text-sm text-red-600">{createError}</p>}
        </div>
      </CrmModal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete task"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.title}"? This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        danger
        loading={deleting}
        error={deleteError}
        onConfirm={() => void handleDelete()}
        onCancel={() => {
          if (deleting) return;
          setDeleteTarget(null);
          setDeleteError("");
        }}
      />
    </CrmPageContent>
  );
}
