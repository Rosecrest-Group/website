import type { Node } from "@xyflow/react";
import { LEAD_SOURCES, SURVEY_LEVELS } from "@/crm/lib/constants";

export type WorkflowPaletteColor = "slate" | "blue" | "amber" | "emerald" | "violet" | "rose";

export type WorkflowNodeMeta = {
  type: string;
  label: string;
  icon: string;
  palette: WorkflowPaletteColor;
  section: "Triggers" | "Messaging" | "Logic" | "Actions";
};

export const WORKFLOW_NODE_META: WorkflowNodeMeta[] = [
  { type: "trigger", label: "Trigger", icon: "ti-bolt", palette: "amber", section: "Triggers" },
  { type: "sendEmail", label: "Send email", icon: "ti-mail", palette: "blue", section: "Messaging" },
  { type: "sendSms", label: "Send SMS", icon: "ti-message", palette: "blue", section: "Messaging" },
  { type: "sendWhatsapp", label: "WhatsApp", icon: "ti-brand-whatsapp", palette: "emerald", section: "Messaging" },
  { type: "wait", label: "Wait", icon: "ti-clock", palette: "slate", section: "Logic" },
  { type: "branch", label: "Branch", icon: "ti-arrows-split", palette: "violet", section: "Logic" },
  { type: "updateRecord", label: "Update field", icon: "ti-edit", palette: "slate", section: "Actions" },
  { type: "createTask", label: "Create task", icon: "ti-checklist", palette: "slate", section: "Actions" },
  { type: "webhook", label: "Webhook", icon: "ti-webhook", palette: "slate", section: "Actions" },
  { type: "end", label: "End", icon: "ti-flag", palette: "rose", section: "Actions" },
];

export const WORKFLOW_NODE_META_BY_TYPE = Object.fromEntries(
  WORKFLOW_NODE_META.map((m) => [m.type, m])
) as Record<string, WorkflowNodeMeta>;

export function defaultNodeData(type: string): Record<string, unknown> {
  switch (type) {
    case "trigger":
      return { triggerType: "lead.created", filter: "" };
    case "sendEmail":
      return { templateId: "", templateName: "", attachmentDocumentTypes: [] };
    case "sendSms":
    case "sendWhatsapp":
      return { templateId: "", templateName: "" };
    case "wait":
      return { durationHours: 48, durationDays: 0, durationMinutes: 0, workingHoursOnly: false };
    case "branch":
      return { condition: "", trueLabel: "True", falseLabel: "False" };
    case "updateRecord":
      return { fieldPath: "lead.stage", value: "" };
    case "createTask":
      return { title: "", description: "", assignee: "OPS", assigneeUserId: "", assigneeUserName: "", dueIn: 24 };
    case "webhook":
      return { url: "", method: "POST", body: "" };
    case "end":
      return { reason: "" };
    default:
      return { label: type };
  }
}

export function createWorkflowNode(type: string, x: number, y: number): Node {
  return {
    id: `${type}-${Date.now()}`,
    type,
    position: { x, y },
    data: defaultNodeData(type),
  };
}

function waitSummary(data: Record<string, unknown>): string {
  const parts: string[] = [];
  const days = Number(data.durationDays ?? 0);
  const hours = Number(data.durationHours ?? 0);
  const minutes = Number(data.durationMinutes ?? 0);
  if (days) parts.push(`${days} day${days === 1 ? "" : "s"}`);
  if (hours) parts.push(`${hours} hour${hours === 1 ? "" : "s"}`);
  if (minutes) parts.push(`${minutes} min`);
  return parts.length ? `Wait ${parts.join(" ")}` : "Wait";
}

export function nodeDisplayLabel(node: Node): string {
  const type = String(node.type ?? node.data.nodeType ?? "trigger");
  const data = node.data as Record<string, unknown>;

  switch (type) {
    case "trigger":
      return String(data.triggerType ?? "lead.created");
    case "sendEmail":
      return "Send email";
    case "sendSms":
      return "Send SMS";
    case "sendWhatsapp":
      return "WhatsApp template";
    case "wait":
      return waitSummary(data);
    case "branch":
      return data.trueLabel ? String(data.trueLabel) : "Branch";
    case "updateRecord":
      return data.fieldPath ? `Set ${data.fieldPath}` : "Update field";
    case "createTask":
      return String(data.title || "Create task");
    case "webhook":
      return `${String(data.method ?? "POST")} webhook`;
    case "end":
      return String(data.reason || "End cadence");
    default:
      return WORKFLOW_NODE_META_BY_TYPE[type]?.label ?? type;
  }
}

export function nodeDisplayDetail(node: Node): string {
  const type = String(node.type ?? node.data.nodeType ?? "trigger");
  const data = node.data as Record<string, unknown>;

  switch (type) {
    case "trigger": {
      if (!data.filter) return "on event";
      const filter = String(data.filter);
      const sourceMatches = [...filter.matchAll(/lead\.source\s*==\s*'([^']+)'/g)];
      const levelMatches = [...filter.matchAll(/lead\.surveyLevel\s*==\s*'([^']+)'/g)];
      const parts: string[] = [];
      if (sourceMatches.length > 0) {
        const labels = [...new Set(sourceMatches.map((m) => m[1]))].map(
          (value) => LEAD_SOURCES.find((s) => s.value === value)?.label ?? value
        );
        if (labels.length === 1) parts.push(labels[0]);
        else if (labels.length <= 3) parts.push(labels.join(", "));
        else parts.push(`${labels.slice(0, 2).join(", ")} +${labels.length - 2}`);
      }
      if (levelMatches.length > 0) {
        const labels = [...new Set(levelMatches.map((m) => m[1]))].map(
          (value) => SURVEY_LEVELS.find((s) => s.value === value)?.label ?? value
        );
        parts.push(labels.join(", "));
      }
      if (parts.length > 0) return parts.join(" · ");
      return `filter: ${filter}`;
    }
    case "sendEmail": {
      const template =
        data.templateName ? String(data.templateName) : data.templateId ? String(data.templateId) : "";
      const attachments = Array.isArray(data.attachmentDocumentTypes)
        ? data.attachmentDocumentTypes.map(String).filter(Boolean)
        : [];
      if (attachments.length === 0) return template;
      const attachmentLabel = `Attach ${attachments
        .map((type) =>
          type === "REPORT" ? "report" : type === "ACTION_PLAN" ? "action plan" : type === "COSTING" ? "costing" : type.toLowerCase()
        )
        .join(", ")}`;
      return template ? `${template} · ${attachmentLabel}` : attachmentLabel;
    }
    case "sendSms":
    case "sendWhatsapp":
      return data.templateName ? String(data.templateName) : data.templateId ? String(data.templateId) : "";
    case "wait":
      return data.workingHoursOnly ? "working hours only" : "calendar time";
    case "branch":
      return String(data.condition ?? "");
    case "updateRecord":
      return data.value ? `→ ${data.value}` : "";
    case "createTask": {
      const assignee = String(data.assignee ?? "");
      if (assignee === "TEAM_MEMBER" && data.assigneeUserId) {
        const name = String(data.assigneeUserName ?? "").trim();
        return name ? `assignee: ${name}` : "assignee: Team member";
      }
      if (assignee === "OPS") return "assignee: Operations team";
      if (assignee === "SURVEYOR_ASSIGNED") return "assignee: Assigned surveyor";
      if (assignee === "MANAGER") return "assignee: Line manager";
      return assignee ? `assignee: ${assignee}` : "";
    }
    case "webhook":
      return String(data.url ?? "");
    case "end":
      return String(data.reason ?? "");
    default:
      return "";
  }
}

export function enrichCreateTaskAssigneeNames(
  nodes: Node[],
  teamMembers: Array<{ id: string; fullName: string }>
): Node[] {
  if (!teamMembers.length) return nodes;

  const byId = new Map(teamMembers.map((m) => [m.id, m.fullName]));
  return nodes.map((node) => {
    const type = String(node.type ?? node.data?.nodeType ?? "");
    if (type !== "createTask") return node;

    const data = node.data as Record<string, unknown>;
    if (String(data.assignee ?? "") !== "TEAM_MEMBER") return node;

    const userId = String(data.assigneeUserId ?? "");
    const name = userId ? byId.get(userId) : undefined;
    if (!name || data.assigneeUserName === name) return node;

    return { ...node, data: { ...data, assigneeUserName: name } };
  });
}

const MESSAGE_NODE_TYPES = new Set(["sendEmail", "sendSms", "sendWhatsapp"]);

export function enrichTemplateNames(
  nodes: Node[],
  templates: Array<{ id: string; name: string }>
): Node[] {
  if (!templates.length) return nodes;

  const byId = new Map(templates.map((t) => [t.id, t.name]));
  return nodes.map((node) => {
    const type = String(node.type ?? node.data?.nodeType ?? "");
    if (!MESSAGE_NODE_TYPES.has(type)) return node;

    const data = node.data as Record<string, unknown>;
    const templateId = String(data.templateId ?? "");
    const name = templateId ? byId.get(templateId) : undefined;
    if (!name || data.templateName === name) return node;

    return { ...node, data: { ...data, templateName: name } };
  });
}

export function normalizeLoadedNode(node: Node): Node {
  const nodeType = String(node.type ?? node.data?.nodeType ?? "trigger");
  return {
    ...node,
    type: nodeType,
    data: { ...node.data },
  };
}
