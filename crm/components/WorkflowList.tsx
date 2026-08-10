"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/crm/lib/api";
import type { WorkflowSummary } from "@/crm/types";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import CrmModal from "@/crm/components/ui/CrmModal";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import TextField from "@/crm/components/ui/TextField";
import SelectField from "@/crm/components/ui/SelectField";
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
  canManagePublish,
  publishBusy,
  onPublishChange,
  onDelete,
  onRestore,
  onPurge,
  restoring,
}: {
  wf: WorkflowSummary;
  canManagePublish?: boolean;
  publishBusy?: boolean;
  onPublishChange?: (wf: WorkflowSummary, next: "published" | "unpublished") => void;
  onDelete?: (wf: WorkflowSummary) => void;
  onRestore?: (wf: WorkflowSummary) => void;
  onPurge?: (wf: WorkflowSummary) => void;
  restoring?: boolean;
}) {
  const isPublished = Boolean(wf.isActive && wf.activeVersion);
  const canTogglePublish = Boolean(canManagePublish && !wf.deletedAt && wf.activeVersion && onPublishChange);

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
          {isPublished && <StatusPill variant="completed" label="Published" />}
          {!wf.deletedAt && !isPublished && (
            <StatusPill variant="paused" label={wf.activeVersion ? "Unpublished" : "Draft"} />
          )}
          {wf.deletedAt && <StatusPill variant="failed" label="Deleted" />}
        </div>
      </Link>
      {canTogglePublish && (
        <SelectField
          id={`wf-publish-${wf.id}`}
          aria-label={`Publish status for ${wf.name}`}
          variant="filter"
          disabled={publishBusy}
          className="min-w-[8.5rem]"
          value={isPublished ? "published" : "unpublished"}
          onChange={(e) => {
            const next = e.target.value as "published" | "unpublished";
            if (next === (isPublished ? "published" : "unpublished")) return;
            onPublishChange?.(wf, next);
          }}
        >
          <option value="published">Published</option>
          <option value="unpublished">Unpublished</option>
        </SelectField>
      )}
      {onRestore && (
        <button
          type="button"
          title="Restore workflow"
          aria-label={`Restore ${wf.name}`}
          disabled={restoring}
          className="shrink-0 rounded-[12px] border border-(--color-tc-20) px-3 py-1.5 text-xs font-medium text-(--color-tc-40) transition hover:border-(--color-primary) hover:bg-(--color-nc-10) disabled:opacity-50"
          onClick={() => onRestore(wf)}
        >
          {restoring ? "Restoring…" : "Restore"}
        </button>
      )}
      {onPurge && (
        <button
          type="button"
          title="Purge permanently"
          aria-label={`Purge ${wf.name} permanently`}
          className="shrink-0 rounded-[12px] border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:border-red-400 hover:bg-red-50 hover:text-red-700"
          onClick={() => onPurge(wf)}
        >
          Purge
        </button>
      )}
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
  const [deletedExpanded, setDeletedExpanded] = useState(false);
  const [canPurge, setCanPurge] = useState(false);
  const [canManagePublish, setCanManagePublish] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<WorkflowSummary | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [purgeTarget, setPurgeTarget] = useState<WorkflowSummary | null>(null);
  const [purging, setPurging] = useState(false);
  const [purgeError, setPurgeError] = useState("");
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState("");
  const [unpublishTarget, setUnpublishTarget] = useState<WorkflowSummary | null>(null);
  const [unpublishing, setUnpublishing] = useState(false);
  const [unpublishError, setUnpublishError] = useState("");
  const [publishingId, setPublishingId] = useState<string | null>(null);

  function load() {
    api.listWorkflows(true).then((r) => {
      setActiveItems(r.items.filter((wf) => !wf.deletedAt));
      setDeletedItems(r.items.filter((wf) => wf.deletedAt));
    });
  }

  useEffect(() => {
    load();
    api
      .getMe()
      .then((me) => {
        setCanPurge(me.role === "SUPER_ADMIN");
        setCanManagePublish(me.role === "ADMIN" || me.role === "SUPER_ADMIN");
      })
      .catch(() => {});
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

  async function handlePurge() {
    if (!purgeTarget) return;
    setPurgeError("");
    setPurging(true);
    try {
      await api.purgeWorkflow(purgeTarget.id);
      setPurgeTarget(null);
      load();
    } catch (err) {
      setPurgeError(err instanceof Error ? err.message : "Failed to purge workflow");
    } finally {
      setPurging(false);
    }
  }

  async function handleRestore(workflow: WorkflowSummary) {
    setRestoreError("");
    setRestoringId(workflow.id);
    try {
      await api.restoreWorkflow(workflow.id);
      load();
    } catch (err) {
      setRestoreError(err instanceof Error ? err.message : "Failed to restore workflow");
    } finally {
      setRestoringId(null);
    }
  }

  async function handlePublish(workflow: WorkflowSummary) {
    setPublishingId(workflow.id);
    try {
      if (workflow.activeVersion) {
        await api.activateWorkflow(workflow.id);
        toast.success(`${workflow.name} is published`);
      } else {
        await api.publishWorkflow(workflow.id);
        toast.success(`${workflow.name} is published`);
      }
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to publish workflow");
    } finally {
      setPublishingId(null);
    }
  }

  async function handleUnpublish() {
    if (!unpublishTarget) return;
    setUnpublishError("");
    setUnpublishing(true);
    try {
      await api.unpublishWorkflow(unpublishTarget.id);
      toast.success(`${unpublishTarget.name} unpublished — new runs are paused`);
      setUnpublishTarget(null);
      load();
    } catch (err) {
      setUnpublishError(err instanceof Error ? err.message : "Failed to unpublish workflow");
    } finally {
      setUnpublishing(false);
    }
  }

  function handlePublishChange(workflow: WorkflowSummary, next: "published" | "unpublished") {
    if (next === "unpublished") {
      setUnpublishError("");
      setUnpublishTarget(workflow);
      return;
    }
    void handlePublish(workflow);
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
              canManagePublish={canManagePublish}
              publishBusy={publishingId === wf.id || (unpublishing && unpublishTarget?.id === wf.id)}
              onPublishChange={handlePublishChange}
              onDelete={(target) => {
                setDeleteError("");
                setDeleteTarget(target);
              }}
            />
          ))}
        </div>

        {deletedItems.length > 0 && (
          <div className="space-y-2">
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg py-1 text-left transition hover:bg-(--color-nc-10)"
              onClick={() => setDeletedExpanded((open) => !open)}
              aria-expanded={deletedExpanded}
            >
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-(--color-tc-30) transition-transform ${
                  deletedExpanded ? "" : "-rotate-90"
                }`}
                strokeWidth={2}
                aria-hidden
              />
              <span className="text-lg font-semibold text-(--color-tc-40)">
                Deleted workflows ({deletedItems.length})
              </span>
            </button>
            {deletedExpanded && (
              <>
                <p className="pl-6 text-sm text-(--color-tc-30)">
                  Deleted workflows are kept for reference. Running executions continue to completion.
                  Admins can restore workflows back to the list (unpublished — publish again to go live).
                  {canPurge && " Super admins can purge workflows with no execution history."}
                </p>
                {restoreError && <p className="pl-6 text-sm text-red-600">{restoreError}</p>}
                <div className="space-y-2">
                  {deletedItems.map((wf) => (
                    <WorkflowRow
                      key={wf.id}
                      wf={wf}
                      onRestore={handleRestore}
                      restoring={restoringId === wf.id}
                      onPurge={
                        canPurge
                          ? (target) => {
                              setPurgeError("");
                              setPurgeTarget(target);
                            }
                          : undefined
                      }
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteTarget != null}
        title={`Delete ${deleteTarget?.name ?? "workflow"}?`}
        description="This removes the workflow from the list. Running executions continue to completion. You can restore it later from Deleted workflows. Use Unpublish in the builder if you only want to pause new runs."
        confirmLabel="Delete workflow"
        loading={deleting}
        danger
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        error={deleteError || undefined}
        onConfirm={handleDelete}
      />

      <ConfirmModal
        isOpen={unpublishTarget != null}
        title={`Unpublish ${unpublishTarget?.name ?? "workflow"}?`}
        description="New triggers will stop starting this workflow. Published versions are kept. In-flight runs continue. Publish again when you want it live."
        confirmLabel="Unpublish"
        loading={unpublishing}
        danger
        onCancel={() => {
          if (!unpublishing) setUnpublishTarget(null);
        }}
        error={unpublishError || undefined}
        onConfirm={handleUnpublish}
      />

      <ConfirmModal
        isOpen={purgeTarget != null}
        title={`Purge ${purgeTarget?.name ?? "workflow"} permanently?`}
        description="This permanently removes the workflow and all its versions. It cannot be undone. Workflows with execution history cannot be purged."
        confirmLabel="Purge permanently"
        loading={purging}
        danger
        onCancel={() => {
          if (!purging) setPurgeTarget(null);
        }}
        error={purgeError || undefined}
        onConfirm={handlePurge}
      />
    </CrmPageContent>
  );
}
