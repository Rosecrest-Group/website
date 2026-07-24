"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  MiniMap,
  MarkerType,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Connection,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "@/crm/styles/workflow-builder.css";

import Link from "next/link";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/crm/components/ui/ConfirmModal";
import { api } from "@/crm/lib/api";
import { diffWorkflowVersions } from "@/crm/lib/workflowDiff";
import {
  createWorkflowNode,
  enrichCreateTaskAssigneeNames,
  enrichTemplateNames,
  normalizeLoadedNode,
} from "@/crm/lib/workflowNodeMeta";
import type { MessageTemplate, WorkflowDetail, WorkflowVersion } from "@/crm/types";
import WorkflowNodeConfig from "@/crm/components/WorkflowNodeConfig";
import WorkflowRunsPanel from "@/crm/components/WorkflowRunsPanel";
import WorkflowCustomNode from "@/crm/components/workflow/WorkflowCustomNode";
import WorkflowPalette, { DRAG_TYPE } from "@/crm/components/workflow/WorkflowPalette";
import { WORKFLOW_NODE_META } from "@/crm/lib/workflowNodeMeta";
import { formatValidationIssues, validateWorkflowDraft } from "@/crm/lib/workflowValidate";
import { autoLayoutWorkflow } from "@/crm/lib/workflowAutoLayout";
import { useWorkflowHistory } from "@/crm/lib/useWorkflowHistory";

const nodeTypes = Object.fromEntries(WORKFLOW_NODE_META.map((m) => [m.type, WorkflowCustomNode]));

type Tab = "canvas" | "versions" | "migrate";

function serializeGraph(nodes: Node[], edges: Edge[]) {
  return JSON.stringify({ nodes, edges });
}

function sanitizeNodesForSave(nodes: Node[]): Node[] {
  return nodes.map(({ id, type, position, data }) => {
    const clean = { ...(data as Record<string, unknown>) };
    delete clean.onDuplicate;
    delete clean.onDelete;
    delete clean.nodeType;
    return { id, type, position: { x: position.x, y: position.y }, data: clean };
  });
}

function sanitizeEdgesForSave(edges: Edge[]): Edge[] {
  return edges.map(({ id, source, target, sourceHandle, targetHandle, type, data, markerEnd }) => ({
    id,
    source,
    target,
    ...(sourceHandle != null ? { sourceHandle } : {}),
    ...(targetHandle != null ? { targetHandle } : {}),
    ...(type != null ? { type } : {}),
    ...(data != null ? { data } : {}),
    ...(markerEnd != null ? { markerEnd } : {}),
  }));
}

function validationDetailsMessage(err: unknown): string | null {
  const details = (err as Error & { details?: Array<{ message?: string }> }).details;
  if (!Array.isArray(details) || !details.length) return null;
  return details.map((d) => d.message).filter(Boolean).join("; ");
}

function isKeyboardEditingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  ) {
    return true;
  }
  if (target.isContentEditable) return true;
  return Boolean(target.closest('[role="dialog"]'));
}

function WorkflowBuilderInner({ id }: { id: string }) {
  const router = useRouter();
  const [workflow, setWorkflow] = useState<WorkflowDetail | null>(null);
  const [versions, setVersions] = useState<WorkflowVersion[]>([]);
  const [tab, setTab] = useState<Tab>("canvas");
  const [changeNote, setChangeNote] = useState("");
  const [showPublish, setShowPublish] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [inFlight, setInFlight] = useState(0);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [teamMembers, setTeamMembers] = useState<Array<{ id: string; fullName: string }>>([]);
  const [diffFromId, setDiffFromId] = useState("");
  const [diffToId, setDiffToId] = useState("");
  const [runningCount, setRunningCount] = useState(0);
  const [migrateTargetVersionId, setMigrateTargetVersionId] = useState("");
  const [migrateMapping, setMigrateMapping] = useState("");
  const [migrateReason, setMigrateReason] = useState("");
  const [migrateMsg, setMigrateMsg] = useState("");
  const [testRunning, setTestRunning] = useState(false);
  const [testRunError, setTestRunError] = useState("");
  const [showTestRun, setShowTestRun] = useState(false);
  const [testRunLeadId, setTestRunLeadId] = useState("");
  const [testRunJobId, setTestRunJobId] = useState("");
  const [testRunSendLive, setTestRunSendLive] = useState(true);
  const [runsRefreshToken, setRunsRefreshToken] = useState(0);
  const [draggingPalette, setDraggingPalette] = useState(false);
  const [showMinimap, setShowMinimap] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [saving, setSaving] = useState(false);
  const [graphLoaded, setGraphLoaded] = useState(false);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const configCommitTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const deleteNodeRef = useRef<(nodeId: string) => void>(() => {});
  const duplicateNodeRef = useRef<(nodeId: string) => void>(() => {});
  const { screenToFlowPosition, zoomIn, zoomOut, fitView } = useReactFlow();

  const selectedNode = useMemo(
    () => (selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) ?? null : null),
    [nodes, selectedNodeId]
  );

  const unsavedChanges = useMemo(() => {
    if (!savedSnapshot) return 0;
    return serializeGraph(nodes, edges) === savedSnapshot ? 0 : 1;
  }, [nodes, edges, savedSnapshot]);

  const validationIssues = useMemo(
    () => validateWorkflowDraft(nodes, edges, templates),
    [nodes, edges, templates]
  );
  const blockingErrors = useMemo(
    () => validationIssues.filter((issue) => issue.severity === "error"),
    [validationIssues]
  );
  const canPublishOrTest = blockingErrors.length === 0 && nodes.length > 0;

  const attachNodeCallbacks = useCallback(
    (rawNodes: Node[]): Node[] =>
      rawNodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          onDuplicate: (nodeId: string) => duplicateNodeRef.current(nodeId),
          onDelete: (nodeId: string) => deleteNodeRef.current(nodeId),
        },
      })),
    []
  );

  const { commit, undo, redo, canUndo, canRedo, resetHistory } = useWorkflowHistory(
    nodes,
    edges,
    setNodes,
    setEdges,
    attachNodeCallbacks,
    sanitizeNodesForSave,
    sanitizeEdgesForSave
  );

  const mutateGraph = useCallback(
    (update: () => void) => {
      flushSync(update);
      commit();
    },
    [commit]
  );

  const commitConfigDebounced = useCallback(() => {
    if (configCommitTimerRef.current) clearTimeout(configCommitTimerRef.current);
    configCommitTimerRef.current = setTimeout(() => {
      commit();
      configCommitTimerRef.current = undefined;
    }, 300);
  }, [commit]);

  const flushConfigCommit = useCallback(() => {
    if (configCommitTimerRef.current) {
      clearTimeout(configCommitTimerRef.current);
      configCommitTimerRef.current = undefined;
      commit();
    }
  }, [commit]);

  const deleteNode = useCallback(
    (nodeId: string) => {
      mutateGraph(() => {
        setNodes((nds) => nds.filter((n) => n.id !== nodeId));
        setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
        setSelectedNodeId((prev) => (prev === nodeId ? null : prev));
      });
    },
    [mutateGraph, setNodes, setEdges]
  );

  const duplicateNode = useCallback(
    (nodeId: string) => {
      mutateGraph(() => {
        setNodes((nds) => {
          const orig = nds.find((n) => n.id === nodeId);
          if (!orig) return nds;
          const nodeType = String(orig.type ?? orig.data.nodeType);
          const dup = createWorkflowNode(nodeType, orig.position.x + 24, orig.position.y + 24);
          dup.data = {
            ...structuredClone(orig.data),
            onDuplicate: (id: string) => duplicateNodeRef.current(id),
            onDelete: (id: string) => deleteNodeRef.current(id),
          };
          setSelectedNodeId(dup.id);
          return [...nds, dup];
        });
      });
    },
    [mutateGraph, setNodes]
  );

  deleteNodeRef.current = deleteNode;
  duplicateNodeRef.current = duplicateNode;

  const deleteEdge = useCallback(
    (edgeId: string) => {
      mutateGraph(() => {
        setEdges((eds) => eds.filter((e) => e.id !== edgeId));
        setSelectedEdgeId((prev) => (prev === edgeId ? null : prev));
      });
    },
    [mutateGraph, setEdges]
  );

  const load = useCallback(async () => {
    setGraphLoaded(false);
    const [wf, vers, tpls, runningExecs, mentions] = await Promise.all([
      api.getWorkflow(id),
      api.listWorkflowVersions(id),
      api.listTemplates(),
      api.listWorkflowExecutions({ workflowId: id, status: "running" }),
      api.getMentionSuggestions().catch(() => ({ users: [] as Array<{ id: string; fullName: string }> })),
    ]);

    setTemplates(tpls.items);
    setTeamMembers(mentions.users.map((u) => ({ id: u.id, fullName: u.fullName })));
    setWorkflow(wf);
    setVersions(vers.items);

    const members = mentions.users.map((u) => ({ id: u.id, fullName: u.fullName }));
    const draftNodesRaw = wf.draftNodes as Node[] | null | undefined;
    const draftEdgesRaw = wf.draftEdges as Edge[] | null | undefined;
    const activeNodes = (wf.activeVersion?.nodes as Node[] | null) ?? [];
    const activeEdges = (wf.activeVersion?.edges as Edge[] | null) ?? [];
    const emptyDraftOverwroteActive =
      Array.isArray(draftNodesRaw) && draftNodesRaw.length === 0 && activeNodes.length > 0;

    const sourceNodes = emptyDraftOverwroteActive ? activeNodes : (draftNodesRaw ?? activeNodes);
    const sourceEdges = emptyDraftOverwroteActive ? activeEdges : (draftEdgesRaw ?? activeEdges);

    const draftNodes = enrichTemplateNames(
      enrichCreateTaskAssigneeNames(sourceNodes.map(normalizeLoadedNode), members),
      tpls.items
    );
    const draftEdges = sourceEdges;

    const normalized = attachNodeCallbacks(draftNodes);
    setNodes(normalized);
    setEdges(draftEdges);
    setSavedSnapshot(serializeGraph(normalized, draftEdges));
    resetHistory(normalized, draftEdges);

    if (emptyDraftOverwroteActive) {
      api
        .saveWorkflowDraft(id, { nodes: sanitizeNodesForSave(normalized), edges: draftEdges })
        .then(() => setSavedSnapshot(serializeGraph(normalized, draftEdges)))
        .catch(() => {});
    }

    setInFlight(vers.items.reduce((s, v) => s + v.inFlight, 0));
    setRunningCount(runningExecs.items.length);
    setDiffFromId((prev) => prev || (vers.items.length >= 2 ? vers.items[1].id : ""));
    setDiffToId((prev) => prev || (vers.items.length >= 1 ? vers.items[0].id : ""));
    setMigrateTargetVersionId((prev) => prev || wf.activeVersionId || "");
    setGraphLoaded(true);
  }, [id, setNodes, setEdges, attachNodeCallbacks, resetHistory]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (selectedNodeId && !nodes.some((n) => n.id === selectedNodeId)) {
      setSelectedNodeId(null);
    }
    if (selectedEdgeId && !edges.some((e) => e.id === selectedEdgeId)) {
      setSelectedEdgeId(null);
    }
  }, [nodes, edges, selectedNodeId, selectedEdgeId]);

  useEffect(() => {
    if (!graphLoaded || unsavedChanges === 0) return;

    const timer = setInterval(() => {
      setSaving(true);
      api
        .saveWorkflowDraft(id, { nodes: sanitizeNodesForSave(nodes), edges })
        .then(() => setSavedSnapshot(serializeGraph(nodes, edges)))
        .catch(() => {})
        .finally(() => setSaving(false));
    }, 5000);
    return () => clearInterval(timer);
  }, [id, nodes, edges, graphLoaded, unsavedChanges]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isKeyboardEditingTarget(e.target)) return;
      if ((e.key === "Delete" || e.key === "Backspace") && (selectedNodeId || selectedEdgeId)) {
        if (selectedNodeId) deleteNode(selectedNodeId);
        if (selectedEdgeId) deleteEdge(selectedEdgeId);
        e.preventDefault();
      }
      if (e.key === "Escape") {
        setSelectedNodeId(null);
        setSelectedEdgeId(null);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        flushConfigCommit();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        flushConfigCommit();
        redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedNodeId, selectedEdgeId, deleteNode, deleteEdge, undo, redo, flushConfigCommit]);

  useEffect(() => {
    return () => {
      if (configCommitTimerRef.current) clearTimeout(configCommitTimerRef.current);
    };
  }, []);

  const versionDiff = useMemo(() => {
    const from = versions.find((v) => v.id === diffFromId);
    const to = versions.find((v) => v.id === diffToId);
    if (!from?.nodes || !to?.nodes) return null;
    return diffWorkflowVersions(
      from.nodes as Node[],
      (from.edges ?? []) as Edge[],
      to.nodes as Node[],
      (to.edges ?? []) as Edge[]
    );
  }, [versions, diffFromId, diffToId]);

  const onConnect = useCallback(
    (connection: Connection) => {
      mutateGraph(() => {
        setEdges((eds) =>
          addEdge(
            {
              ...connection,
              type: "default",
              markerEnd: { type: MarkerType.ArrowClosed, color: "#A1A1AA", width: 16, height: 16 },
            },
            eds
          )
        );
      });
    },
    [mutateGraph, setEdges]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData(DRAG_TYPE);
      if (!type) return;
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      mutateGraph(() => {
        const node = createWorkflowNode(type, position.x - 96, position.y - 39);
        node.data = {
          ...node.data,
          onDuplicate: (id: string) => duplicateNodeRef.current(id),
          onDelete: (id: string) => deleteNodeRef.current(id),
        };
        setNodes((nds) => [...nds, node]);
        setSelectedNodeId(node.id);
        setSelectedEdgeId(null);
        setDraggingPalette(false);
      });
    },
    [screenToFlowPosition, mutateGraph, setNodes]
  );

  async function saveDraftNow() {
    setSaving(true);
    try {
      await api.saveWorkflowDraft(id, { nodes: sanitizeNodesForSave(nodes), edges });
      setSavedSnapshot(serializeGraph(nodes, edges));
    } finally {
      setSaving(false);
    }
  }

  const applyAutoLayout = useCallback(() => {
    mutateGraph(() => {
      const result = autoLayoutWorkflow(nodes, edges);
      setNodes(result.nodes);
      setEdges(result.edges);
    });
  }, [mutateGraph, nodes, edges, setNodes, setEdges]);

  async function publish() {
    if (!canPublishOrTest) {
      setPublishError(formatValidationIssues(blockingErrors));
      return;
    }
    setPublishing(true);
    setPublishError("");
    try {
      await api.saveWorkflowDraft(id, { nodes: sanitizeNodesForSave(nodes), edges });
      setSavedSnapshot(serializeGraph(nodes, edges));
      await api.publishWorkflow(id, changeNote);
      setShowPublish(false);
      setChangeNote("");
      load();
    } catch (err) {
      let message = err instanceof Error ? err.message : "Failed to publish workflow";
      const details = validationDetailsMessage(err);
      if (details) message = `${message}: ${details}`;
      setPublishError(message);
    } finally {
      setPublishing(false);
    }
  }

  async function deleteWorkflow() {
    setDeleteError("");
    setDeleting(true);
    try {
      await api.deleteWorkflow(id);
      router.push("/crm/workflows");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete workflow");
      setDeleting(false);
    }
  }

  async function restoreVersion(versionId: string) {
    await api.restoreWorkflowVersion(id, versionId);
    load();
  }

  async function activateVersion(versionId: string) {
    await api.activateWorkflowVersion(id, versionId);
    load();
  }

  async function runTestRun() {
    if (!canPublishOrTest) {
      setTestRunError(formatValidationIssues(blockingErrors));
      return;
    }
    setTestRunError("");
    setTestRunning(true);
    try {
      const leadId = testRunLeadId.trim() || undefined;
      const jobId = testRunJobId.trim() || undefined;
      const hasTarget = Boolean(leadId || jobId);
      await api.saveWorkflowDraft(id, { nodes: sanitizeNodesForSave(nodes), edges });
      setSavedSnapshot(serializeGraph(nodes, edges));
      await api.testRunWorkflow(id, {
        leadId,
        jobId,
        sendLiveMessages: hasTarget ? testRunSendLive : false,
      });
      setShowTestRun(false);
      setRunsRefreshToken((t) => t + 1);
      setTab("migrate");
    } catch (err) {
      let message = err instanceof Error ? err.message : "Test run failed";
      const details = validationDetailsMessage(err);
      if (details) message = `${message}: ${details}`;
      setTestRunError(message);
    } finally {
      setTestRunning(false);
    }
  }

  async function runMigration(executionId: string) {
    let mapping: Record<string, string> = {};
    try {
      mapping = JSON.parse(migrateMapping || "{}");
    } catch {
      setMigrateMsg("Mapping must be valid JSON");
      return;
    }
    if (!migrateTargetVersionId) {
      setMigrateMsg("Select target version");
      return;
    }
    await api.migrateWorkflowExecution(executionId, {
      targetVersionId: migrateTargetVersionId,
      mapping,
      reason: migrateReason || undefined,
    });
    setMigrateMsg("Migration complete");
    load();
  }

  const nextVersionNumber = (workflow?.activeVersion?.versionNumber ?? 0) + 1;

  if (!workflow) {
    return (
      <div className="wf-builder">
        <div className="flex flex-1 items-center justify-center" style={{ color: "var(--wf-text-3)" }}>
          Loading workflow…
        </div>
      </div>
    );
  }

  return (
    <div className={`wf-builder${draggingPalette ? " dragging-palette" : ""}`}>
      <header className="wf-topbar">
        <div className="wf-topbar-left">
          <Link href="/crm/workflows" className="wf-back-btn" title="Back">
            <i className="ti ti-arrow-left" />
          </Link>
          <div className="wf-workflow-meta">
            <span className="wf-workflow-title">{workflow.name}</span>
            {workflow.activeVersion && (
              <span className="wf-workflow-version">v{workflow.activeVersion.versionNumber} active</span>
            )}
            {(unsavedChanges > 0 || saving) && (
              <span className="wf-draft-pill">
                <span className="wf-draft-pill-dot" />
                Draft v{nextVersionNumber}
                {unsavedChanges > 0 ? " · unsaved" : saving ? " · saving…" : ""}
              </span>
            )}
          </div>
        </div>

        <div className="wf-topbar-center hidden lg:flex">
          <div className="wf-topbar-segment">
            {(
              [
                ["canvas", "Builder"],
                ["versions", "Versions"],
                ["migrate", runningCount > 0 ? `Runs (${runningCount} active)` : "Runs"],
              ] as const
            ).map(([t, label]) => (
              <button
                key={t}
                type="button"
                className={`wf-seg-btn${tab === t ? " active" : ""}`}
                onClick={() => setTab(t)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="wf-topbar-right">
          <button
            type="button"
            className="wf-btn wf-btn-ghost wf-btn-icon"
            title="Undo (Ctrl+Z)"
            disabled={!canUndo}
            onClick={() => {
              flushConfigCommit();
              undo();
            }}
          >
            <i className="ti ti-arrow-back-up" />
          </button>
          <button
            type="button"
            className="wf-btn wf-btn-ghost wf-btn-icon"
            title="Redo (Ctrl+Y)"
            disabled={!canRedo}
            onClick={() => {
              flushConfigCommit();
              redo();
            }}
          >
            <i className="ti ti-arrow-forward-up" />
          </button>
          <div className="wf-divider-v" />
          <button
            type="button"
            className="wf-btn"
            title="Auto-layout: fork-tree for branches, serpentine for linear flows"
            onClick={() => {
              flushConfigCommit();
              applyAutoLayout();
            }}
          >
            <i className="ti ti-layout-distribute-horizontal" />
            Auto-layout
          </button>
          <button
            type="button"
            className="wf-btn"
            disabled={testRunning}
            title="Run a test execution"
            onClick={() => {
              setTestRunError("");
              setShowTestRun(true);
            }}
          >
            <i className="ti ti-player-play" />
            Test run
          </button>
          <button type="button" className="wf-btn" onClick={saveDraftNow}>
            <i className="ti ti-device-floppy" />
            Save draft
          </button>
          <button
            type="button"
            className="wf-btn wf-btn-primary"
            onClick={() => {
              setPublishError("");
              setShowPublish(true);
            }}
          >
            <i className="ti ti-rocket" />
            Publish v{nextVersionNumber}
          </button>
          {!workflow.deletedAt && (
            <>
              <div className="wf-divider-v" />
              <button
                type="button"
                className="wf-btn wf-btn-danger wf-btn-icon"
                title="Delete workflow"
                aria-label="Delete workflow"
                onClick={() => {
                  setDeleteError("");
                  setShowDelete(true);
                }}
              >
                <i className="ti ti-trash" />
              </button>
            </>
          )}
        </div>
      </header>

      {testRunError && (
        <p className="wf-run-error wf-test-run-error" role="alert">
          {testRunError}
        </p>
      )}

      {tab === "versions" && (
        <div className="wf-panel-scroll">
          {versions.map((v) => (
            <div key={v.id} className="wf-version-card">
              <div>
                <p className="font-medium">
                  v{v.versionNumber} {workflow.activeVersionId === v.id && "(active)"}
                </p>
                <p className="text-xs" style={{ color: "var(--wf-text-3)" }}>
                  {v.inFlight} in-flight · {v.completed} completed · {v.changeNote ?? "No note"}
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" className="wf-btn" onClick={() => restoreVersion(v.id)}>
                  Restore as draft
                </button>
                <button type="button" className="wf-btn" onClick={() => activateVersion(v.id)}>
                  Make active
                </button>
              </div>
            </div>
          ))}

          {versions.length >= 2 && versionDiff && (
            <div className="wf-version-card flex-col items-stretch">
              <h2 className="font-medium">Version diff</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <select className="wf-select" value={diffFromId} onChange={(e) => setDiffFromId(e.target.value)}>
                  {versions.map((v) => (
                    <option key={v.id} value={v.id}>
                      From v{v.versionNumber}
                    </option>
                  ))}
                </select>
                <select className="wf-select" value={diffToId} onChange={(e) => setDiffToId(e.target.value)}>
                  {versions.map((v) => (
                    <option key={v.id} value={v.id}>
                      To v{v.versionNumber}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="font-medium text-green-700">+ {versionDiff.addedNodes.length} nodes</p>
                </div>
                <div>
                  <p className="font-medium text-red-700">− {versionDiff.removedNodes.length} nodes</p>
                </div>
                <div>
                  <p className="font-medium">~ {versionDiff.changedNodes.length} changed</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--wf-text-3)" }}>
                    Edges: +{versionDiff.addedEdges.length} / −{versionDiff.removedEdges.length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "migrate" && (
        <WorkflowRunsPanel
          workflowId={id}
          versions={versions}
          refreshToken={runsRefreshToken}
          migrateTargetVersionId={migrateTargetVersionId}
          migrateMapping={migrateMapping}
          migrateReason={migrateReason}
          migrateMsg={migrateMsg}
          onMigrateTargetVersionIdChange={setMigrateTargetVersionId}
          onMigrateMappingChange={setMigrateMapping}
          onMigrateReasonChange={setMigrateReason}
          onMigrate={runMigration}
        />
      )}

      {tab === "canvas" && (
        <div className={`wf-workspace${selectedNode ? " has-selection" : ""}`}>
          <WorkflowPalette onDragStart={() => setDraggingPalette(true)} onDragEnd={() => setDraggingPalette(false)} />

          <div className="wf-canvas-wrap" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges.map((e) => ({
                ...e,
                selected: e.id === selectedEdgeId,
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: e.id === selectedEdgeId ? "#18181B" : "#A1A1AA",
                  width: 16,
                  height: 16,
                },
              }))}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeDragStop={commit}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={(_, node) => {
                setSelectedNodeId(node.id);
                setSelectedEdgeId(null);
              }}
              onEdgeClick={(_, edge) => {
                setSelectedEdgeId(edge.id);
                setSelectedNodeId(null);
              }}
              onPaneClick={() => {
                setSelectedNodeId(null);
                setSelectedEdgeId(null);
              }}
              defaultEdgeOptions={{
                type: "default",
                markerEnd: { type: MarkerType.ArrowClosed, color: "#A1A1AA", width: 16, height: 16 },
              }}
              fitView
              proOptions={{ hideAttribution: true }}
              deleteKeyCode={null}
            >
              <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="rgba(0,0,0,0.07)" />
              {showMinimap && (
                <MiniMap
                  nodeColor="#E8E5DD"
                  maskColor="rgba(24,24,27,0.06)"
                  style={{ position: "absolute", bottom: 60, right: 16, width: 140, height: 90 }}
                />
              )}
            </ReactFlow>

            {nodes.length === 0 && (
              <div className="wf-empty-state">
                <div className="wf-empty-state-icon">
                  <i className="ti ti-vector-bezier" />
                </div>
                <div className="wf-empty-state-title">Empty canvas</div>
                <div className="wf-empty-state-text">Drag a Trigger from the palette to start</div>
              </div>
            )}

            <div className="wf-canvas-overlay wf-canvas-status">
              <div className="wf-canvas-stat">
                <i className="ti ti-stack-2" />
                <span>
                  <strong>{nodes.length}</strong> nodes
                </span>
              </div>
              <div className="wf-canvas-stat">
                <i className="ti ti-vector-bezier" />
                <span>
                  <strong>{edges.length}</strong> connections
                </span>
              </div>
              {inFlight > 0 && (
                <div className="wf-canvas-stat">
                  <i className="ti ti-circle-dot" />
                  <span>
                    <strong>{inFlight}</strong> running
                  </span>
                </div>
              )}
            </div>

            <div className="wf-canvas-overlay wf-canvas-controls">
              <button type="button" className="wf-canvas-ctrl-btn" title="Zoom in" onClick={() => zoomIn()}>
                <i className="ti ti-plus" />
              </button>
              <button type="button" className="wf-canvas-ctrl-btn" title="Zoom out" onClick={() => zoomOut()}>
                <i className="ti ti-minus" />
              </button>
              <button type="button" className="wf-canvas-ctrl-btn" title="Fit to view" onClick={() => fitView({ padding: 0.2 })}>
                <i className="ti ti-maximize" />
              </button>
              <button
                type="button"
                className="wf-canvas-ctrl-btn"
                title="Mini-map"
                onClick={() => setShowMinimap((v) => !v)}
              >
                <i className="ti ti-map" />
              </button>
            </div>
          </div>

          {selectedNode && (
            <WorkflowNodeConfig
              node={selectedNode}
              templates={templates}
              teamMembers={teamMembers}
              workflowTrigger={workflow.trigger}
              onTemplateCreated={(template) => {
                setTemplates((list) =>
                  [...list, template].sort((a, b) => a.name.localeCompare(b.name))
                );
              }}
              onChange={(nodeId, data) => {
                setNodes((nds) =>
                  nds.map((n) =>
                    n.id === nodeId
                      ? {
                          ...n,
                          data: {
                            ...data,
                            onDuplicate: (id: string) => duplicateNodeRef.current(id),
                            onDelete: (id: string) => deleteNodeRef.current(id),
                          },
                        }
                      : n
                  )
                );
                commitConfigDebounced();
              }}
              onClose={() => {
                flushConfigCommit();
                setSelectedNodeId(null);
              }}
              onDuplicate={duplicateNode}
              onDelete={deleteNode}
              onPositionChange={(nodeId, x, y) => {
                setNodes((nds) => nds.map((n) => (n.id === nodeId ? { ...n, position: { x, y } } : n)));
                commitConfigDebounced();
              }}
            />
          )}
        </div>
      )}

      {showTestRun && (
        <div className="wf-modal-backdrop">
          <div className="wf-modal">
            <h2 className="wf-modal-title">Test run</h2>
            <p className="mt-2 text-sm" style={{ color: "var(--wf-text-2)" }}>
              Walk through this workflow on a real lead or job. With a lead/job ID, messages and tasks run
              for real so you can verify templates and delivery. Leave both blank for a dry run on sample data.
            </p>
            {blockingErrors.length > 0 && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                <p className="font-medium">Cannot run test until these are fixed:</p>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  {blockingErrors.map((issue) => (
                    <li key={`${issue.nodeId ?? "global"}-${issue.message}`}>
                      {issue.message}
                      {issue.nodeId && (
                        <button
                          type="button"
                          className="wf-link-btn ml-1"
                          onClick={() => {
                            setSelectedNodeId(issue.nodeId!);
                            setShowTestRun(false);
                          }}
                        >
                          Select node
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <label className="wf-field-label mt-4">Lead ID (optional)</label>
            <input
              className="wf-input wf-input-mono"
              placeholder="e.g. clx… from /crm/leads/…"
              value={testRunLeadId}
              onChange={(e) => {
                setTestRunLeadId(e.target.value);
                if (e.target.value.trim()) setTestRunSendLive(true);
              }}
              disabled={testRunning}
            />
            <label className="wf-field-label mt-3">Job ID (optional)</label>
            <input
              className="wf-input wf-input-mono"
              placeholder="e.g. clx… from /crm/jobs/…"
              value={testRunJobId}
              onChange={(e) => {
                setTestRunJobId(e.target.value);
                if (e.target.value.trim()) setTestRunSendLive(true);
              }}
              disabled={testRunning}
            />
            <label className="wf-test-run-live mt-4 flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={testRunSendLive}
                onChange={(e) => setTestRunSendLive(e.target.checked)}
                disabled={testRunning || (!testRunLeadId.trim() && !testRunJobId.trim())}
              />
              <span>
                <span className="font-medium">Send real messages and run actions</span>
                <span className="block text-xs" style={{ color: "var(--wf-text-3)" }}>
                  {testRunLeadId.trim() || testRunJobId.trim()
                    ? "SMS, email, tasks, and webhooks will execute against this record."
                    : "Add a lead or job ID to enable live sends."}
                </span>
              </span>
            </label>
            {testRunError && (
              <p className="mt-3 text-sm" style={{ color: "var(--wf-danger, #dc2626)" }}>
                {testRunError}
              </p>
            )}
            <div className="wf-modal-actions">
              <button
                type="button"
                className="wf-btn"
                onClick={() => {
                  setShowTestRun(false);
                  setTestRunError("");
                }}
                disabled={testRunning}
              >
                Cancel
              </button>
              <button
                type="button"
                className="wf-btn wf-btn-primary"
                onClick={() => void runTestRun()}
                disabled={testRunning || !canPublishOrTest}
              >
                {testRunning ? "Running…" : "Run test"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPublish && (
        <div className="wf-modal-backdrop">
          <div className="wf-modal">
            <h2 className="wf-modal-title">Publish {workflow.name}?</h2>
            {inFlight > 0 && (
              <p className="mt-2 text-sm" style={{ color: "var(--wf-text-2)" }}>
                {inFlight} executions are currently running. They will continue on their pinned version.
              </p>
            )}
            {blockingErrors.length > 0 && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                <p className="font-medium">Cannot publish until these are fixed:</p>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  {blockingErrors.map((issue) => (
                    <li key={`${issue.nodeId ?? "global"}-${issue.message}`}>{issue.message}</li>
                  ))}
                </ul>
              </div>
            )}
            <input
              className="wf-input mt-4"
              placeholder="Change note (optional)"
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              disabled={publishing}
            />
            {publishError && (
              <p className="mt-3 text-sm" style={{ color: "var(--wf-danger, #dc2626)" }}>
                {publishError}
              </p>
            )}
            <div className="wf-modal-actions">
              <button type="button" className="wf-btn" onClick={() => setShowPublish(false)} disabled={publishing}>
                Cancel
              </button>
              <button type="button" className="wf-btn wf-btn-primary" onClick={publish} disabled={publishing || !canPublishOrTest}>
                {publishing ? "Publishing…" : `Publish v${nextVersionNumber}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showDelete}
        title={`Delete ${workflow.name}?`}
        description={
          inFlight > 0
            ? `This deactivates the workflow and hides it from the list. ${inFlight} running execution${inFlight === 1 ? "" : "s"} will continue to completion.`
            : "This deactivates the workflow and hides it from the list. Any running executions will continue to completion."
        }
        confirmLabel="Delete workflow"
        loading={deleting}
        danger
        error={deleteError || undefined}
        onCancel={() => {
          if (!deleting) setShowDelete(false);
        }}
        onConfirm={deleteWorkflow}
      />
    </div>
  );
}

export default function WorkflowBuilder({ id }: { id: string }) {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderInner id={id} />
    </ReactFlowProvider>
  );
}
