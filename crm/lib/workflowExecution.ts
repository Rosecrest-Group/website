import type { Node } from "@xyflow/react";
import { nodeDisplayDetail, nodeDisplayLabel } from "@/crm/lib/workflowNodeMeta";

export type WorkflowExecutionStep = {
  nodeId: string;
  type: string;
  at: string;
  label?: string;
  detail?: string;
  skipped?: boolean;
  branchResult?: boolean;
};

export type WorkflowExecutionRecord = {
  id: string;
  status: string;
  currentNodeId: string | null;
  triggeredBy: string;
  context: Record<string, unknown>;
  startedAt: string;
  completedAt: string | null;
  error: string | null;
  isTestRun: boolean;
  migratedToExecutionId: string | null;
  workflowVersion: {
    id: string;
    versionNumber: number;
    workflowId: string;
    nodes: unknown;
  };
};

export function executionSubject(context: Record<string, unknown>): {
  label: string;
  href?: string;
  sub?: string;
} {
  const customer = context.customer as { firstName?: string; lastName?: string; email?: string } | undefined;
  const lead = context.lead as { propertyPostcode?: string; propertyAddress?: string } | undefined;
  const job = context.job as { jobNumber?: string } | undefined;

  if (customer?.firstName || customer?.lastName) {
    const name = [customer.firstName, customer.lastName].filter(Boolean).join(" ");
    const leadId = context.leadId as string | undefined;
    return {
      label: name || "Unknown contact",
      href: leadId ? `/crm/leads/${leadId}` : undefined,
      sub: customer.email || lead?.propertyPostcode || undefined,
    };
  }

  if (job?.jobNumber) {
    const jobId = context.jobId as string | undefined;
    return {
      label: `Job ${job.jobNumber}`,
      href: jobId ? `/crm/jobs/${jobId}` : undefined,
    };
  }

  const entityType = String(context.entityType ?? "record");
  const entityId = String(context.entityId ?? "");
  return {
    label: entityId ? `${entityType} ${entityId.slice(0, 8)}…` : "Unknown trigger",
  };
}

export function executionSteps(context: Record<string, unknown>): WorkflowExecutionStep[] {
  const steps = context._executionSteps;
  return Array.isArray(steps) ? (steps as WorkflowExecutionStep[]) : [];
}

export function resolveNodeFromVersion(versionNodes: unknown, nodeId: string | null): Node | null {
  if (!nodeId || !Array.isArray(versionNodes)) return null;
  const raw = (versionNodes as Node[]).find((n) => n.id === nodeId);
  return raw ?? null;
}

export function currentStepLabel(
  execution: WorkflowExecutionRecord,
  versionNodes: unknown
): { label: string; detail?: string } | null {
  if (!execution.currentNodeId) return null;
  const steps = executionSteps(execution.context);
  const lastStep = steps[steps.length - 1];
  // Engine advances currentNodeId to the next node while waiting; still show the wait step.
  if (execution.status === "running" && lastStep?.type === "wait") {
    return {
      label: lastStep.label ?? "Waiting",
      detail: lastStep.detail,
    };
  }

  const node = resolveNodeFromVersion(versionNodes, execution.currentNodeId);
  if (!node) {
    return { label: execution.currentNodeId };
  }

  if (execution.status === "running") {
    const alreadyRan = steps.some((s) => s.nodeId === execution.currentNodeId);
    const prefix = alreadyRan ? "Waiting at" : "Next up";
    return {
      label: `${prefix}: ${nodeDisplayLabel(node)}`,
      detail: nodeDisplayDetail(node) || undefined,
    };
  }

  return {
    label: nodeDisplayLabel(node),
    detail: nodeDisplayDetail(node) || undefined,
  };
}

export function formatStepSummary(step: WorkflowExecutionStep): { label: string; detail?: string } {
  let label = step.label ?? step.type;
  let detail = step.detail;

  if (step.type === "branch" && step.branchResult !== undefined) {
    detail = [detail, step.branchResult ? "→ true path" : "→ false path"].filter(Boolean).join(" · ");
  }
  if (step.skipped) {
    detail = [detail, "skipped (dry run)"].filter(Boolean).join(" · ");
  }

  return { label, detail: detail || undefined };
}

export function formatRelativeTime(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleString();
}

export function statusLabel(status: string): string {
  switch (status) {
    case "running":
      return "Running";
    case "completed":
      return "Completed";
    case "migrated":
      return "Migrated";
    case "stopped":
      return "Stopped";
    case "failed":
      return "Failed";
    default:
      return status;
  }
}
