import type { Edge, Node } from "@xyflow/react";
import type { MessageTemplate } from "@/crm/types";
import { nodeDisplayLabel, WORKFLOW_NODE_META_BY_TYPE } from "@/crm/lib/workflowNodeMeta";

export type WorkflowValidationIssue = {
  nodeId?: string;
  message: string;
  severity: "error" | "warning";
};

const SEND_NODE_TYPES = new Set(["sendEmail", "sendSms", "sendWhatsapp"]);

const CHANNEL_BY_NODE_TYPE: Record<string, MessageTemplate["channel"]> = {
  sendEmail: "EMAIL",
  sendSms: "SMS",
  sendWhatsapp: "WHATSAPP",
};

function nodeType(node: Node): string {
  return String(node.type ?? node.data.nodeType ?? "");
}

function nodeLabel(node: Node): string {
  return nodeDisplayLabel(node) || WORKFLOW_NODE_META_BY_TYPE[nodeType(node)]?.label || nodeType(node);
}

export function validateWorkflowDraft(
  nodes: Node[],
  edges: Edge[],
  templates: MessageTemplate[]
): WorkflowValidationIssue[] {
  const issues: WorkflowValidationIssue[] = [];
  const templateById = new Map(templates.map((t) => [t.id, t]));

  const triggers = nodes.filter((n) => nodeType(n) === "trigger");
  const ends = nodes.filter((n) => nodeType(n) === "end");

  if (triggers.length !== 1) {
    issues.push({
      message: "A workflow must have exactly one Trigger node",
      severity: "error",
    });
  }
  if (ends.length < 1) {
    issues.push({
      message: "A workflow must have at least one End node",
      severity: "error",
    });
  }

  const incoming = new Map<string, number>();
  const outgoing = new Map<string, number>();
  for (const edge of edges) {
    incoming.set(edge.target, (incoming.get(edge.target) ?? 0) + 1);
    outgoing.set(edge.source, (outgoing.get(edge.source) ?? 0) + 1);
  }

  for (const node of nodes) {
    const type = nodeType(node);
    const label = nodeLabel(node);

    if (type === "trigger") continue;

    if ((incoming.get(node.id) ?? 0) === 0) {
      issues.push({
        nodeId: node.id,
        message: `${label} is not connected to the workflow`,
        severity: "error",
      });
    }
    if (type !== "end" && (outgoing.get(node.id) ?? 0) === 0) {
      issues.push({
        nodeId: node.id,
        message: `${label} has no next step`,
        severity: "error",
      });
    }

    if (type === "branch") {
      const branchEdges = edges.filter((e) => e.source === node.id);
      const handles = new Set(branchEdges.map((e) => e.sourceHandle));
      if (!handles.has("true")) {
        issues.push({
          nodeId: node.id,
          message: `${label} has no true-path connection`,
          severity: "warning",
        });
      }
      if (!handles.has("false")) {
        issues.push({
          nodeId: node.id,
          message: `${label} has no false-path connection`,
          severity: "warning",
        });
      }
    }

    if (!SEND_NODE_TYPES.has(type)) continue;

    const templateId = String((node.data as Record<string, unknown>).templateId ?? "").trim();
    const expectedChannel = CHANNEL_BY_NODE_TYPE[type];

    if (!templateId) {
      issues.push({
        nodeId: node.id,
        message: `${label} requires a message template`,
        severity: "error",
      });
      continue;
    }

    const template = templateById.get(templateId);
    if (!template) {
      issues.push({
        nodeId: node.id,
        message: `${label} uses a template that no longer exists — select another`,
        severity: "error",
      });
      continue;
    }

    if (expectedChannel && template.channel !== expectedChannel) {
      issues.push({
        nodeId: node.id,
        message: `${label} must use a ${expectedChannel} template`,
        severity: "error",
      });
    }

    if (!template.isActive) {
      issues.push({
        nodeId: node.id,
        message: `${label} uses an inactive template (${template.name})`,
        severity: "error",
      });
    }
  }

  return issues;
}

export function formatValidationIssues(issues: WorkflowValidationIssue[]): string {
  return issues.map((i) => i.message).join("; ");
}
