"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/crm/lib/api";
import type { WorkflowVersion } from "@/crm/types";
import {
  currentStepLabel,
  executionSteps,
  executionSubject,
  formatRelativeTime,
  formatStepSummary,
  statusLabel,
  type WorkflowExecutionRecord,
} from "@/crm/lib/workflowExecution";

type StatusFilter = "all" | "running" | "completed" | "migrated";

type Props = {
  workflowId: string;
  versions: WorkflowVersion[];
  migrateTargetVersionId: string;
  migrateMapping: string;
  migrateReason: string;
  migrateMsg: string;
  refreshToken?: number;
  onMigrateTargetVersionIdChange: (value: string) => void;
  onMigrateMappingChange: (value: string) => void;
  onMigrateReasonChange: (value: string) => void;
  onMigrate: (executionId: string) => void;
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`wf-run-status wf-run-status--${status}`} data-status={status}>
      {statusLabel(status)}
    </span>
  );
}

function RunCard({
  execution,
  onMigrate,
}: {
  execution: WorkflowExecutionRecord;
  onMigrate: (executionId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const subject = executionSubject(execution.context);
  const steps = executionSteps(execution.context);
  const current = currentStepLabel(execution, execution.workflowVersion.nodes);
  const messagingSteps = steps.filter((s) =>
    ["sendEmail", "sendSms", "sendWhatsapp"].includes(s.type)
  );

  return (
    <article className="wf-run-card">
      <div className="wf-run-card-header">
        <div className="wf-run-card-main">
          <div className="wf-run-card-title-row">
            {subject.href ? (
              <Link href={subject.href} className="wf-run-subject-link">
                {subject.label}
              </Link>
            ) : (
              <span className="wf-run-subject">{subject.label}</span>
            )}
            <StatusBadge status={execution.status} />
            {execution.isTestRun && <span className="wf-run-pill">Test run</span>}
          </div>
          {subject.sub && <p className="wf-run-sub">{subject.sub}</p>}
          <p className="wf-run-meta">
            Started {formatRelativeTime(execution.startedAt)} · v{execution.workflowVersion.versionNumber} ·{" "}
            <span className="wf-run-id" title={execution.id}>
              {execution.id.slice(0, 8)}…
            </span>
            {execution.completedAt && ` · finished ${formatRelativeTime(execution.completedAt)}`}
          </p>
        </div>
        {execution.status === "running" && (
          <button type="button" className="wf-btn" onClick={() => onMigrate(execution.id)}>
            Migrate
          </button>
        )}
      </div>

      {current && (
        <div className="wf-run-current">
          <span className="wf-run-current-label">Current step</span>
          <span className="wf-run-current-value">{current.label}</span>
          {current.detail && <span className="wf-run-current-detail">{current.detail}</span>}
        </div>
      )}

      {messagingSteps.length > 0 && (
        <div className="wf-run-messages">
          <span className="wf-run-messages-label">Messages</span>
          <ul className="wf-run-message-list">
            {messagingSteps.map((step) => {
              const summary = formatStepSummary(step);
              return (
                <li key={`${step.nodeId}-${step.at}`}>
                  <i
                    className={`ti ${
                      step.type === "sendEmail"
                        ? "ti-mail"
                        : step.type === "sendSms"
                          ? "ti-message"
                          : "ti-brand-whatsapp"
                    }`}
                  />
                  <span>{summary.label}</span>
                  {summary.detail && <span className="wf-run-message-detail">{summary.detail}</span>}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {steps.length > 0 ? (
        <div className="wf-run-timeline-wrap">
          <button
            type="button"
            className="wf-run-timeline-toggle"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
          >
            {expanded ? "Hide" : "Show"} full timeline ({steps.length} step{steps.length === 1 ? "" : "s"})
            <i className={`ti ti-chevron-${expanded ? "up" : "down"}`} />
          </button>
          {expanded && (
            <ol className="wf-run-timeline">
              {steps.map((step) => {
                const summary = formatStepSummary(step);
                return (
                  <li key={`${step.nodeId}-${step.at}`}>
                    <span className="wf-run-timeline-time">{formatRelativeTime(step.at)}</span>
                    <span className="wf-run-timeline-label">{summary.label}</span>
                    {summary.detail && <span className="wf-run-timeline-detail">{summary.detail}</span>}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      ) : (
        <p className="wf-run-empty-steps">
          No step history yet — new runs will show each action as it completes.
        </p>
      )}

      {execution.error && <p className="wf-run-error">{execution.error}</p>}
      {execution.migratedToExecutionId && (
        <p className="wf-run-meta">Migrated to run {execution.migratedToExecutionId.slice(0, 8)}…</p>
      )}
    </article>
  );
}

export default function WorkflowRunsPanel({
  workflowId,
  versions,
  migrateTargetVersionId,
  migrateMapping,
  migrateReason,
  migrateMsg,
  onMigrateTargetVersionIdChange,
  onMigrateMappingChange,
  onMigrateReasonChange,
  onMigrate,
  refreshToken,
}: Props) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [executions, setExecutions] = useState<WorkflowExecutionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMigration, setShowMigration] = useState(false);

  const loadExecutions = useCallback(async () => {
    const res = await api.listWorkflowExecutions({ workflowId, status: statusFilter });
    setExecutions(res.items as WorkflowExecutionRecord[]);
    setLoading(false);
  }, [workflowId, statusFilter]);

  useEffect(() => {
    setLoading(true);
    loadExecutions().catch(() => setLoading(false));
  }, [loadExecutions, refreshToken]);

  useEffect(() => {
    const timer = setInterval(() => {
      loadExecutions().catch(() => {});
    }, 10000);
    return () => clearInterval(timer);
  }, [loadExecutions]);

  const runningCount = useMemo(
    () => executions.filter((e) => e.status === "running").length,
    [executions]
  );

  return (
    <div className="wf-panel-scroll">
      <div className="wf-runs-intro">
        <div>
          <h2 className="wf-runs-title">Workflow runs</h2>
          <p className="wf-runs-desc">
            See who entered this workflow, which messages were sent, and where each run is now.
            {runningCount > 0 && ` ${runningCount} currently running.`}
          </p>
        </div>
        <div className="wf-runs-filters">
          {(["all", "running", "completed", "migrated"] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              className={`wf-seg-btn${statusFilter === filter ? " active" : ""}`}
              onClick={() => setStatusFilter(filter)}
            >
              {filter === "all" ? "All" : statusLabel(filter)}
            </button>
          ))}
        </div>
      </div>

      <div className="wf-run-migration">
        <button
          type="button"
          className="wf-run-migration-toggle"
          onClick={() => setShowMigration((v) => !v)}
          aria-expanded={showMigration}
        >
          <i className="ti ti-arrows-right-left" />
          Emergency migration
          <i className={`ti ti-chevron-${showMigration ? "up" : "down"}`} />
        </button>
        {showMigration && (
          <div className="wf-version-card flex-col items-stretch gap-3">
            <p className="text-sm" style={{ color: "var(--wf-text-3)" }}>
              Move a running execution to a new version. Provide JSON mapping from old node IDs to new node IDs.
            </p>
            <label className="wf-field-label">Target version</label>
            <select
              className="wf-select"
              value={migrateTargetVersionId}
              onChange={(e) => onMigrateTargetVersionIdChange(e.target.value)}
            >
              {versions.map((v) => (
                <option key={v.id} value={v.id}>
                  v{v.versionNumber}
                </option>
              ))}
            </select>
            <label className="wf-field-label">Node mapping (JSON)</label>
            <textarea
              className="wf-textarea wf-input-mono"
              rows={3}
              placeholder='{"old-node-id": "new-node-id"}'
              value={migrateMapping}
              onChange={(e) => onMigrateMappingChange(e.target.value)}
            />
            <input
              className="wf-input"
              placeholder="Reason for migration"
              value={migrateReason}
              onChange={(e) => onMigrateReasonChange(e.target.value)}
            />
            {migrateMsg && <p className="text-sm">{migrateMsg}</p>}
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: "var(--wf-text-3)" }}>
          Loading runs…
        </p>
      ) : executions.length === 0 ? (
        <div className="wf-run-empty">
          <p className="font-medium">No runs yet</p>
          <p className="text-sm" style={{ color: "var(--wf-text-3)" }}>
            Runs appear when a lead or job triggers this workflow, or when you use Test run.
          </p>
        </div>
      ) : (
        executions.map((execution) => (
          <RunCard key={execution.id} execution={execution} onMigrate={onMigrate} />
        ))
      )}
    </div>
  );
}
