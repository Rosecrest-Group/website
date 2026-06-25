"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/crm/lib/api";
import type { WorkflowSummary } from "@/crm/types";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import CrmModal from "@/crm/components/ui/CrmModal";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import TextField from "@/crm/components/ui/TextField";
import StatusPill from "@/crm/components/ui/StatusPill";
import ConfirmModal from "@/crm/components/ui/ConfirmModal";

const DEFAULT_WORKFLOW_TRIGGER = "lead.created";

function defaultTriggerNode(trigger: string) {
  return {
    id: "trigger-1",
    type: "trigger",
    position: { x: 0, y: 120 },
    data: { triggerType: trigger },
  };
}

function WorkflowRow({
  wf,
  onDelete,
}: {
  wf: WorkflowSummary;
  onDelete?: (wf: WorkflowSummary) => void;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border border-(--color-tc-20) px-4 py-3 transition hover:bg-(--color-nc-10) ${
        wf.deletedAt ? "bg-(--color-nc-10)/50 opacity-80" : "bg-white"
      }`}
    >
      <Link href={`/crm/workflows/${wf.id}`} className="flex min-w-0 flex-1 items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-medium text-(--color-tc-40)">{wf.name}</p>
          <p className="truncate text-xs text-(--color-tc-30)">{wf.description ?? wf.trigger}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <StatusPill variant="in-review" label={wf.trigger} />
          {wf.activeVersion && (
            <StatusPill variant="completed" label={`v${wf.activeVersion.versionNumber}`} />
          )}
          {!wf.isActive && <StatusPill variant="pending" label="Inactive" />}
          {wf.deletedAt && <StatusPill variant="failed" label="Deleted" />}
        </div>
      </Link>
      {onDelete && (
        <button
          type="button"
          title="Delete workflow"
          aria-label="Delete workflow"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-red-200 text-red-600 transition hover:border-red-400 hover:bg-red-50 hover:text-red-700"
          onClick={() => onDelete(wf)}
        >
          <Trash2 className="h-4 w-4" strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

export default function WorkflowList() {
  const router = useRouter();
  const [activeItems, setActiveItems] = useState<WorkflowSummary[]>([]);
  const [deletedItems, setDeletedItems] = useState<WorkflowSummary[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<WorkflowSummary | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  function load() {
    api.listWorkflows(true).then((r) => {
      setActiveItems(r.items.filter((wf) => !wf.deletedAt));
      setDeletedItems(r.items.filter((wf) => wf.deletedAt));
    });
  }

  useEffect(() => {
    load();
  }, []);

  function closeCreate() {
    if (creating) return;
    setShowCreate(false);
    setCreateError("");
    setCreateName("");
    setCreateDescription("");
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreateError("");
    setCreating(true);

    const name = createName.trim();
    const description = createDescription.trim();

    if (!name) {
      setCreateError("Name is required.");
      setCreating(false);
      return;
    }

    try {
      const wf = await api.createWorkflow({
        name,
        description: description || undefined,
        trigger: DEFAULT_WORKFLOW_TRIGGER,
      });
      await api.saveWorkflowDraft(wf.id, {
        nodes: [defaultTriggerNode(DEFAULT_WORKFLOW_TRIGGER)],
        edges: [],
      });
      router.push(`/crm/workflows/${wf.id}`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create workflow");
      setCreating(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteError("");
    setDeleting(true);
    try {
      await api.deleteWorkflow(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete workflow");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <CrmPageContent>
      <CrmPageHeader
        title="Workflows"
        subtitle="Automations triggered by leads, jobs, and payments"
        actions={
          <PrimaryButton
            type="button"
            className="w-auto"
            onClick={() => {
              setCreateError("");
              setShowCreate(true);
            }}
          >
            New workflow
          </PrimaryButton>
        }
      />

      <CrmModal
        isOpen={showCreate}
        title="New workflow"
        description="Give your automation a name. You can set the trigger in the builder."
        onClose={closeCreate}
        closeDisabled={creating}
        size="md"
        footer={
          <>
            <SecondaryButton type="button" className="w-auto" disabled={creating} onClick={closeCreate}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" form="create-workflow-form" disabled={creating || !createName.trim()} className="w-auto px-6">
              {creating ? "Creating…" : "Create & open builder"}
            </PrimaryButton>
          </>
        }
      >
        <form id="create-workflow-form" onSubmit={handleCreate} className="space-y-4">
          <TextField
            id="wf-name"
            label="Name"
            required
            placeholder="e.g. Payment confirmation"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            autoFocus
          />
          <TextField
            id="wf-description"
            label="Description"
            placeholder="Optional — what this flow does"
            value={createDescription}
            onChange={(e) => setCreateDescription(e.target.value)}
          />
          {createError && <p className="text-sm text-red-600">{createError}</p>}
          <p className="text-xs text-(--color-tc-30)">Requires Admin role.</p>
        </form>
      </CrmModal>

      <div className="space-y-6">
        <div className="space-y-2">
          {activeItems.length === 0 && (
            <p className="rounded-xl border border-dashed border-(--color-tc-20) px-4 py-8 text-center text-sm text-(--color-tc-30)">
              No active workflows yet. Click <strong>New workflow</strong> to get started.
            </p>
          )}
          {activeItems.map((wf) => (
            <WorkflowRow
              key={wf.id}
              wf={wf}
              onDelete={(target) => {
                setDeleteError("");
                setDeleteTarget(target);
              }}
            />
          ))}
        </div>

        {deletedItems.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-(--color-tc-40)">Deleted workflows</h2>
            <p className="text-sm text-(--color-tc-30)">
              Deactivated workflows are kept for reference. Running executions continue to completion.
            </p>
            {deletedItems.map((wf) => (
              <WorkflowRow key={wf.id} wf={wf} />
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteTarget != null}
        title={`Delete ${deleteTarget?.name ?? "workflow"}?`}
        description="This deactivates the workflow and hides it from the list. Any running executions will continue to completion."
        confirmLabel="Delete workflow"
        loading={deleting}
        danger
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        error={deleteError || undefined}
        onConfirm={handleDelete}
      />
    </CrmPageContent>
  );
}
