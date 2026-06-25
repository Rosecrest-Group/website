"use client";

import { memo, useCallback } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import {
  WORKFLOW_NODE_META_BY_TYPE,
  nodeDisplayDetail,
  nodeDisplayLabel,
} from "@/crm/lib/workflowNodeMeta";

export type WorkflowNodeData = {
  nodeType: string;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
  [key: string]: unknown;
};

function WorkflowCustomNode({ id, data, selected, type: nodeType }: NodeProps<Node<WorkflowNodeData>>) {
  const type = String(nodeType ?? data.nodeType ?? "trigger");
  const meta = WORKFLOW_NODE_META_BY_TYPE[type];
  const node = { id, type, position: { x: 0, y: 0 }, data } as Node;

  const handleDuplicate = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      data.onDuplicate?.(id);
    },
    [data, id]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      data.onDelete?.(id);
    },
    [data, id]
  );

  if (!meta) return null;

  const templateId = data.templateId ? String(data.templateId) : "";
  const templateName = data.templateName ? String(data.templateName) : "";
  const label = nodeDisplayLabel(node);
  const detail = nodeDisplayDetail(node);

  return (
    <div className={`wf-node ${selected ? "selected" : ""}`} data-palette={meta.palette}>
      <div className="wf-node-header">
        <div className="wf-node-icon">
          <i className={`ti ${meta.icon}`} />
        </div>
        <div className="wf-node-title">{meta.label}</div>
        <div className="wf-node-actions">
          <button type="button" className="wf-node-action-btn" title="Duplicate" onClick={handleDuplicate}>
            <i className="ti ti-copy" />
          </button>
          <button type="button" className="wf-node-action-btn" title="Delete" onClick={handleDelete}>
            <i className="ti ti-trash" />
          </button>
        </div>
      </div>
      <div className="wf-node-body">
        <div className="wf-node-label">{label}</div>
        {detail ? <div className="wf-node-detail">{detail}</div> : null}
        {templateId ? (
          <div className="wf-node-template">
            <i className="ti ti-template" />
            {templateName || templateId}
          </div>
        ) : null}
      </div>

      {nodeType !== "trigger" ? (
        <Handle type="target" position={Position.Left} id="in" className="wf-port-left" />
      ) : null}

      {nodeType === "branch" ? (
        <>
          <Handle type="source" position={Position.Right} id="true" style={{ top: "35%" }} />
          <span className="wf-port-label true">true</span>
          <Handle type="source" position={Position.Right} id="false" style={{ top: "75%" }} />
          <span className="wf-port-label false">false</span>
        </>
      ) : nodeType !== "end" ? (
        <Handle type="source" position={Position.Right} id="out" />
      ) : null}
    </div>
  );
}

export default memo(WorkflowCustomNode);
