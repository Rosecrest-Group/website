"use client";

import { useEffect, useState } from "react";
import type { Node } from "@xyflow/react";
import type { MessageTemplate } from "@/crm/types";
import { LEAD_SOURCES, SURVEY_LEVELS, WORKFLOW_TRIGGERS } from "@/crm/lib/constants";
import { WORKFLOW_NODE_META_BY_TYPE } from "@/crm/lib/workflowNodeMeta";
import WorkflowTemplateEditor from "@/crm/components/workflow/WorkflowTemplateEditor";
import WorkflowTemplatePreviewModal from "@/crm/components/workflow/WorkflowTemplatePreviewModal";
import WorkflowTagSelect, {
  WF_TAG_COLORS,
  type WorkflowTagSelectOption,
} from "@/crm/components/workflow/WorkflowTagSelect";

const EMAIL_ATTACHMENT_DOCUMENT_TYPES = [
  { value: "REPORT", label: "Report" },
  { value: "ACTION_PLAN", label: "Action plan" },
  { value: "COSTING", label: "Costing" },
] as const;

/** Preset CC targets for sendEmail nodes (stored as merge/context path in `ccPath`). */
const EMAIL_CC_PRESETS = [
  { value: "", label: "None" },
  { value: "job.surveyorEmail", label: "Assigned surveyor" },
  { value: "job.agentEmail", label: "Estate agent" },
] as const;

const LEAD_SOURCE_TAG_OPTIONS: WorkflowTagSelectOption[] = LEAD_SOURCES.map((source, index) => ({
  ...source,
  color: WF_TAG_COLORS[index % WF_TAG_COLORS.length],
}));

const SURVEY_LEVEL_TAG_OPTIONS: WorkflowTagSelectOption[] = SURVEY_LEVELS.map((level) => ({
  ...level,
  color:
    (
      {
        LEVEL_1: "blue",
        LEVEL_2: "emerald",
        LEVEL_3: "violet",
        CPR_35: "amber",
      } as const
    )[level.value as "LEVEL_1" | "LEVEL_2" | "LEVEL_3" | "CPR_35"] ?? "slate",
}));

const LEAD_SOURCE_EQ_RE = /lead\.source\s*==\s*'([^']+)'/g;
const SURVEY_LEVEL_EQ_RE = /lead\.surveyLevel\s*==\s*'([^']+)'/g;

function parseEqualityValues(filter: string, pattern: RegExp): string[] {
  const values: string[] = [];
  for (const match of filter.matchAll(new RegExp(pattern))) {
    if (match[1] && !values.includes(match[1])) values.push(match[1]);
  }
  return values;
}

/** True when every clause is a lead.source / lead.surveyLevel equality joined by || / &&. */
function isStructuredLeadFilter(filter: string): boolean {
  const trimmed = filter.trim();
  if (!trimmed) return true;
  const remainder = trimmed
    .replace(new RegExp(LEAD_SOURCE_EQ_RE), "")
    .replace(new RegExp(SURVEY_LEVEL_EQ_RE), "")
    .replace(/\|\|/g, "")
    .replace(/&&/g, "")
    .replace(/[()]/g, "")
    .trim();
  return remainder.length === 0;
}

function parseLeadSourceFilter(filter: string): string[] {
  if (!isStructuredLeadFilter(filter)) return [];
  return parseEqualityValues(filter, LEAD_SOURCE_EQ_RE);
}

function parseSurveyLevelFilter(filter: string): string[] {
  if (!isStructuredLeadFilter(filter)) return [];
  return parseEqualityValues(filter, SURVEY_LEVEL_EQ_RE);
}

/**
 * Build a filter the evaluator can run. AND binds tighter than OR, so when both
 * dimensions are set we expand to DNF: (s1 && l1) || (s1 && l2) || (s2 && l1) …
 */
function buildLeadCreatedFilter(sources: string[], surveyLevels: string[]): string {
  if (sources.length === 0 && surveyLevels.length === 0) return "";
  if (sources.length === 0) {
    return surveyLevels.map((level) => `lead.surveyLevel == '${level}'`).join(" || ");
  }
  if (surveyLevels.length === 0) {
    return sources.map((source) => `lead.source == '${source}'`).join(" || ");
  }
  const clauses: string[] = [];
  for (const source of sources) {
    for (const level of surveyLevels) {
      clauses.push(`lead.source == '${source}' && lead.surveyLevel == '${level}'`);
    }
  }
  return clauses.join(" || ");
}

type Props = {
  node: Node;
  templates: MessageTemplate[];
  teamMembers: Array<{ id: string; fullName: string }>;
  workflowTrigger: string;
  onChange: (nodeId: string, data: Record<string, unknown>) => void;
  onTemplateCreated: (template: MessageTemplate) => void;
  onClose: () => void;
  onDuplicate: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onPositionChange: (nodeId: string, x: number, y: number) => void;
};

function messageChannel(nodeType: string): "EMAIL" | "SMS" | "WHATSAPP" | null {
  if (nodeType === "sendEmail") return "EMAIL";
  if (nodeType === "sendSms") return "SMS";
  if (nodeType === "sendWhatsapp") return "WHATSAPP";
  return null;
}

export default function WorkflowNodeConfig({
  node,
  templates,
  teamMembers,
  workflowTrigger,
  onChange,
  onTemplateCreated,
  onClose,
  onDuplicate,
  onDelete,
  onPositionChange,
}: Props) {
  const nodeType = String(node.type ?? node.data.nodeType ?? "trigger");
  const meta = WORKFLOW_NODE_META_BY_TYPE[nodeType];
  const data = node.data as Record<string, unknown>;
  const triggerType = String(data.triggerType ?? "");
  const update = (patch: Record<string, unknown>) => onChange(node.id, { ...data, ...patch });
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [positionExpanded, setPositionExpanded] = useState(false);
  const channel = messageChannel(nodeType);
  const selectedTemplateId = String(data.templateId ?? "").trim();
  const selectedTemplate = selectedTemplateId
    ? templates.find((t) => t.id === selectedTemplateId) ?? null
    : null;
  const selectedLeadSources =
    nodeType === "trigger" && triggerType === "lead.created"
      ? parseLeadSourceFilter(String(data.filter ?? ""))
      : [];
  const selectedSurveyLevels =
    nodeType === "trigger" && triggerType === "lead.created"
      ? parseSurveyLevelFilter(String(data.filter ?? "")).slice(0, 1)
      : [];
  const setLeadCreatedFilter = (sources: string[], surveyLevels: string[]) =>
    update({ filter: buildLeadCreatedFilter(sources, surveyLevels) });
  const attachmentDocumentTypes = Array.isArray(data.attachmentDocumentTypes)
    ? data.attachmentDocumentTypes.map(String)
    : [];
  const toggleAttachmentDocumentType = (docType: string) => {
    const next = attachmentDocumentTypes.includes(docType)
      ? attachmentDocumentTypes.filter((value) => value !== docType)
      : [...attachmentDocumentTypes, docType];
    update({ attachmentDocumentTypes: next });
  };

  useEffect(() => {
    setPositionExpanded(false);
    setShowTemplatePreview(false);
  }, [node.id]);

  useEffect(() => {
    if (nodeType !== "createTask") return;
    if (String(data.assignee ?? "") !== "TEAM_MEMBER") return;
    const userId = String(data.assigneeUserId ?? "");
    if (!userId || data.assigneeUserName) return;
    const member = teamMembers.find((m) => m.id === userId);
    if (member) update({ assigneeUserName: member.fullName });
  }, [nodeType, data.assignee, data.assigneeUserId, data.assigneeUserName, teamMembers, node.id]);

  useEffect(() => {
    if (!channel) return;
    const templateId = String(data.templateId ?? "");
    if (!templateId || data.templateName) return;
    const template = templates.find((t) => t.id === templateId);
    if (template) update({ templateName: template.name });
  }, [channel, data.templateId, data.templateName, templates, node.id]);

  if (!meta) return null;

  return (
    <aside className="wf-config-panel">
      <div className="wf-config-header">
        <div className="wf-config-icon-lg" data-palette={meta.palette}>
          <i className={`ti ${meta.icon}`} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="wf-config-name">{meta.label}</div>
          <div className="wf-config-id">
            {node.id} · {nodeType}
          </div>
        </div>
        <button type="button" className="wf-config-close" onClick={onClose} aria-label="Close">
          <i className="ti ti-x" />
        </button>
      </div>

      <div className="wf-config-body">
        {nodeType === "trigger" && (
          <>
            <div className="wf-field">
              <div className="wf-field-label">Trigger event</div>
              <select
                className="wf-select"
                value={triggerType}
                onChange={(e) => update({ triggerType: e.target.value })}
              >
                {WORKFLOW_TRIGGERS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label} ({t.value})
                  </option>
                ))}
                {!WORKFLOW_TRIGGERS.some((t) => t.value === triggerType) && triggerType ? (
                  <option value={triggerType}>{triggerType}</option>
                ) : null}
              </select>
              <div className="wf-field-help">Which platform event starts this workflow.</div>
            </div>
            {triggerType === "lead.created" ? (
              <>
                <div className="wf-field">
                  <div className="wf-field-label">
                    Lead sources{" "}
                    <span style={{ textTransform: "none", letterSpacing: 0, color: "var(--wf-text-3)" }}>
                      optional
                    </span>
                  </div>
                  <WorkflowTagSelect
                    ariaLabel="Lead sources"
                    options={LEAD_SOURCE_TAG_OPTIONS}
                    selected={selectedLeadSources}
                    placeholder="Type to add a source…"
                    onChange={(sources) => setLeadCreatedFilter(sources, selectedSurveyLevels)}
                  />
                  <div className="wf-field-help">
                    Run only when the lead comes from one of the selected sources. Leave as Any source to
                    allow every source.
                  </div>
                </div>
                <div className="wf-field">
                  <div className="wf-field-label">
                    Survey level{" "}
                    <span style={{ textTransform: "none", letterSpacing: 0, color: "var(--wf-text-3)" }}>
                      optional
                    </span>
                  </div>
                  <WorkflowTagSelect
                    ariaLabel="Survey level"
                    options={SURVEY_LEVEL_TAG_OPTIONS}
                    selected={selectedSurveyLevels}
                    placeholder="Type to choose a level…"
                    multiple={false}
                    onChange={(surveyLevels) => setLeadCreatedFilter(selectedLeadSources, surveyLevels)}
                  />
                  <div className="wf-field-help">
                    Run only for one survey level. Leave empty to allow every level.
                  </div>
                </div>
              </>
            ) : (
              <div className="wf-field">
                <div className="wf-field-label">
                  Condition filter{" "}
                  <span style={{ textTransform: "none", letterSpacing: 0, color: "var(--wf-text-3)" }}>
                    optional
                  </span>
                </div>
                <input
                  className="wf-input"
                  type="text"
                  value={String(data.filter ?? "")}
                  onChange={(e) => update({ filter: e.target.value })}
                  placeholder="e.g. job.stage == 'INSPECTION_COMPLETE'"
                />
                <div className="wf-field-help">
                  Expression evaluated against job/lead context. Leave empty to run on every trigger.
                </div>
              </div>
            )}
          </>
        )}

        {(nodeType === "sendEmail" || nodeType === "sendSms" || nodeType === "sendWhatsapp") && (
          <>
            <div className="wf-field">
              <div className="wf-field-label-row">
                <div className="wf-field-label">
                  Template <span className="wf-field-required">Required</span>
                </div>
                <button
                  type="button"
                  className="wf-link-btn"
                  onClick={() => setShowTemplateEditor(true)}
                >
                  <i className="ti ti-plus" />
                  Add new
                </button>
              </div>
              <div className="wf-template-picker-row">
                <select
                  className="wf-select wf-template-select"
                  value={selectedTemplateId}
                  onChange={(e) => {
                    const templateId = e.target.value;
                    const template = templates.find((t) => t.id === templateId);
                    update({
                      templateId,
                      templateName: template?.name ?? "",
                    });
                  }}
                >
                  <option value="">Select template…</option>
                  {templates
                    .filter((t) => t.channel === channel)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                </select>
                {selectedTemplate && (
                  <button
                    type="button"
                    className="wf-link-btn wf-template-view-btn"
                    onClick={() => setShowTemplatePreview(true)}
                  >
                    View
                  </button>
                )}
              </div>
              {!selectedTemplateId && (
                <div className="wf-field-help wf-field-help--error">
                  Choose a template before publishing or running a test.
                </div>
              )}
            </div>
            {channel && (
              <WorkflowTemplatePreviewModal
                open={showTemplatePreview}
                templateId={selectedTemplateId || null}
                templateName={selectedTemplate?.name ?? String(data.templateName ?? "Template")}
                channel={channel}
                onClose={() => setShowTemplatePreview(false)}
              />
            )}
            {channel && (
              <WorkflowTemplateEditor
                open={showTemplateEditor}
                channel={channel}
                workflowTrigger={workflowTrigger}
                onClose={() => setShowTemplateEditor(false)}
                onCreated={(template) => {
                  onTemplateCreated(template);
                  update({ templateId: template.id, templateName: template.name });
                }}
              />
            )}
            {nodeType === "sendEmail" && (
              <>
                <div className="wf-field">
                  <div className="wf-field-label">
                    CC{" "}
                    <span style={{ textTransform: "none", letterSpacing: 0, color: "var(--wf-text-3)" }}>
                      optional
                    </span>
                  </div>
                  <select
                    className="wf-select"
                    value={String(data.ccPath ?? "")}
                    onChange={(e) => {
                      const ccPath = e.target.value.trim();
                      if (ccPath) {
                        update({ ccPath });
                      } else {
                        const { ccPath: _removed, ...rest } = data;
                        onChange(node.id, rest);
                      }
                    }}
                  >
                    {EMAIL_CC_PRESETS.map((preset) => (
                      <option key={preset.value || "none"} value={preset.value}>
                        {preset.label}
                      </option>
                    ))}
                    {/* Preserve unknown paths from seeds/scripts until edited */}
                    {(() => {
                      const current = String(data.ccPath ?? "").trim();
                      const known = EMAIL_CC_PRESETS.some((p) => p.value === current);
                      if (!current || known) return null;
                      return (
                        <option value={current}>
                          Custom: {current}
                        </option>
                      );
                    })()}
                  </select>
                  <div className="wf-field-help">
                    Carbon-copy this address when the email sends. Use for templates that say the
                    surveyor (or agent) has been copied.
                  </div>
                </div>
                <div className="wf-field">
                  <div className="wf-field-label">
                    Attachments{" "}
                    <span style={{ textTransform: "none", letterSpacing: 0, color: "var(--wf-text-3)" }}>
                      optional
                    </span>
                  </div>
                  <div className="wf-source-checklist" role="group" aria-label="Email attachments">
                    {EMAIL_ATTACHMENT_DOCUMENT_TYPES.map((docType) => {
                      const checked = attachmentDocumentTypes.includes(docType.value);
                      return (
                        <label key={docType.value} className="wf-checkbox-row">
                          <div
                            className={`wf-checkbox ${checked ? "checked" : ""}`}
                            onClick={() => toggleAttachmentDocumentType(docType.value)}
                            role="checkbox"
                            aria-checked={checked}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === " " || e.key === "Enter") {
                                e.preventDefault();
                                toggleAttachmentDocumentType(docType.value);
                              }
                            }}
                          />
                          <span className="wf-checkbox-label">{docType.label}</span>
                        </label>
                      );
                    })}
                  </div>
                  <div className="wf-field-help">
                    Attach matching job documents when this email sends. Leave unchecked for a normal
                    email with no files.
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {nodeType === "wait" && (
          <div className="wf-field">
            <div className="wf-field-label">Duration</div>
            <div className="wf-input-row">
              <input
                className="wf-input wf-input-mono"
                type="number"
                min={0}
                value={Number(data.durationDays ?? 0)}
                onChange={(e) => update({ durationDays: Number(e.target.value) })}
                placeholder="Days"
              />
              <input
                className="wf-input wf-input-mono"
                type="number"
                min={0}
                value={Number(data.durationHours ?? 0)}
                onChange={(e) => update({ durationHours: Number(e.target.value) })}
                placeholder="Hours"
              />
              <input
                className="wf-input wf-input-mono"
                type="number"
                min={0}
                value={Number(data.durationMinutes ?? 0)}
                onChange={(e) => update({ durationMinutes: Number(e.target.value) })}
                placeholder="Min"
              />
            </div>
            <label className="wf-checkbox-row" style={{ marginTop: 10 }}>
              <div
                className={`wf-checkbox ${data.workingHoursOnly ? "checked" : ""}`}
                onClick={() => update({ workingHoursOnly: !data.workingHoursOnly })}
                role="checkbox"
                aria-checked={Boolean(data.workingHoursOnly)}
                tabIndex={0}
              />
              <span className="wf-checkbox-label">Working hours only (skip nights & weekends)</span>
            </label>
            <div className="wf-field-help">
              {data.workingHoursOnly
                ? "Delay is counted in working time only (e.g. 2 days ≈ 2 workdays). Resumes via QStash."
                : "Calendar delay (includes nights/weekends). Resumes via QStash."}
            </div>
          </div>
        )}

        {nodeType === "branch" && (
          <>
            <div className="wf-field">
              <div className="wf-field-label">Condition expression</div>
              <textarea
                className="wf-textarea wf-input-mono"
                value={String(data.condition ?? "")}
                onChange={(e) => update({ condition: e.target.value })}
                placeholder="e.g. lead.paymentStatus == 'PAID'"
              />
              <div className="wf-field-help">
                Evaluates against the execution context using lead.*, customer.*, job.* paths.
                Inbound SMS/WhatsApp replies (STOP, NO) update customer state and stop cadence —
                use a Wait node before branching on reply intent once reply triggers are enabled.
              </div>
            </div>
            <div className="wf-field">
              <div className="wf-field-label">Path labels</div>
              <div className="wf-input-row">
                <input
                  className="wf-input"
                  value={String(data.trueLabel ?? "True")}
                  onChange={(e) => update({ trueLabel: e.target.value })}
                  placeholder="True label"
                />
                <input
                  className="wf-input"
                  value={String(data.falseLabel ?? "False")}
                  onChange={(e) => update({ falseLabel: e.target.value })}
                  placeholder="False label"
                />
              </div>
            </div>
          </>
        )}

        {nodeType === "updateRecord" && (
          <>
            <div className="wf-field">
              <div className="wf-field-label">Field to update</div>
              <input
                className="wf-input wf-input-mono"
                value={String(data.fieldPath ?? "")}
                onChange={(e) => update({ fieldPath: e.target.value })}
                placeholder="lead.stage"
              />
            </div>
            <div className="wf-field">
              <div className="wf-field-label">New value</div>
              <input
                className="wf-input wf-input-mono"
                value={String(data.value ?? "")}
                onChange={(e) => update({ value: e.target.value })}
              />
            </div>
          </>
        )}

        {nodeType === "createTask" && (
          <>
            <div className="wf-field">
              <div className="wf-field-label">Assign to</div>
              <select
                className="wf-select"
                value={String(data.assignee ?? "OPS")}
                onChange={(e) => {
                  const assignee = e.target.value;
                  const patch: Record<string, unknown> = { assignee };
                  if (assignee !== "TEAM_MEMBER") {
                    patch.assigneeUserId = "";
                    patch.assigneeUserName = "";
                  }
                  update(patch);
                }}
              >
                <option value="OPS">Operations team</option>
                <option value="SURVEYOR_ASSIGNED">Assigned surveyor</option>
                <option value="MANAGER">Line manager</option>
                <option value="TEAM_MEMBER">Team member</option>
              </select>
            </div>
            {String(data.assignee ?? "OPS") === "TEAM_MEMBER" && (
              <div className="wf-field">
                <div className="wf-field-label">Team member</div>
                <select
                  className="wf-select"
                  value={String(data.assigneeUserId ?? "")}
                  onChange={(e) => {
                    const userId = e.target.value;
                    const member = teamMembers.find((m) => m.id === userId);
                    update({
                      assigneeUserId: userId,
                      assigneeUserName: member?.fullName ?? "",
                    });
                  }}
                >
                  <option value="">Select team member…</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.fullName}
                    </option>
                  ))}
                </select>
                <div className="wf-field-help">
                  They will receive a notification and see this task in their task list.
                </div>
              </div>
            )}
            <div className="wf-field">
              <div className="wf-field-label">Title</div>
              <input
                className="wf-input"
                value={String(data.title ?? "")}
                onChange={(e) => update({ title: e.target.value })}
              />
            </div>
            <div className="wf-field">
              <div className="wf-field-label">Description</div>
              <textarea
                className="wf-textarea"
                rows={3}
                value={String(data.description ?? "")}
                onChange={(e) => update({ description: e.target.value })}
              />
            </div>
            <div className="wf-field">
              <div className="wf-field-label">Due in (working hours)</div>
              <input
                className="wf-input wf-input-mono"
                type="number"
                min={1}
                value={Number(data.dueIn ?? 24)}
                onChange={(e) => update({ dueIn: Number(e.target.value) })}
              />
            </div>
          </>
        )}

        {nodeType === "webhook" && (
          <>
            <div className="wf-field">
              <div className="wf-field-label">URL</div>
              <input
                className="wf-input wf-input-mono"
                value={String(data.url ?? "")}
                onChange={(e) => update({ url: e.target.value })}
              />
            </div>
            <div className="wf-field">
              <div className="wf-field-label">Method</div>
              <select
                className="wf-select"
                value={String(data.method ?? "POST")}
                onChange={(e) => update({ method: e.target.value })}
              >
                {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="wf-field">
              <div className="wf-field-label">Body template</div>
              <textarea
                className="wf-textarea wf-input-mono"
                value={String(data.body ?? "")}
                onChange={(e) => update({ body: e.target.value })}
                placeholder='{"leadId":"{{lead.id}}"}'
              />
              <div className="wf-field-help">JSON with merge fields. Retries 3× on 5xx.</div>
            </div>
          </>
        )}

        {nodeType === "end" && (
          <div className="wf-field">
            <div className="wf-field-label">End reason</div>
            <input
              className="wf-input"
              value={String(data.reason ?? "")}
              onChange={(e) => update({ reason: e.target.value })}
              placeholder="Cadence complete"
            />
            <div className="wf-field-help">Optional label recorded when the execution completes.</div>
          </div>
        )}

        <div className="wf-section-divider" />
        <div className="wf-position-section">
          <button
            type="button"
            className="wf-section-collapse-trigger"
            onClick={() => setPositionExpanded((open) => !open)}
            aria-expanded={positionExpanded}
          >
            <i className={`ti ${positionExpanded ? "ti-chevron-down" : "ti-chevron-right"}`} aria-hidden />
            <span className="wf-section-heading">Position</span>
            {!positionExpanded ? (
              <span className="wf-section-collapse-hint">
                {Math.round(node.position.x)}, {Math.round(node.position.y)}
              </span>
            ) : null}
          </button>
          {positionExpanded ? (
            <div className="wf-field">
              <div className="wf-input-row">
                <input
                  className="wf-input wf-input-mono"
                  type="number"
                  value={Math.round(node.position.x)}
                  onChange={(e) =>
                    onPositionChange(node.id, Number(e.target.value) || 0, node.position.y)
                  }
                />
                <input
                  className="wf-input wf-input-mono"
                  type="number"
                  value={Math.round(node.position.y)}
                  onChange={(e) =>
                    onPositionChange(node.id, node.position.x, Number(e.target.value) || 0)
                  }
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="wf-config-footer">
        <button type="button" className="wf-btn" onClick={() => onDuplicate(node.id)}>
          <i className="ti ti-copy" />
          Duplicate
        </button>
        <button type="button" className="wf-btn" onClick={() => onDelete(node.id)}>
          <i className="ti ti-trash" />
          Delete
        </button>
      </div>
    </aside>
  );
}
