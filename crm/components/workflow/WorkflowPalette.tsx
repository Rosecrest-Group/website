"use client";

import { WORKFLOW_NODE_META, type WorkflowNodeMeta } from "@/crm/lib/workflowNodeMeta";

const DRAG_TYPE = "application/reactflow";

type Props = {
  onDragStart?: () => void;
  onDragEnd?: () => void;
};

function groupBySection(items: WorkflowNodeMeta[]) {
  const sections = new Map<string, WorkflowNodeMeta[]>();
  for (const item of items) {
    const list = sections.get(item.section) ?? [];
    list.push(item);
    sections.set(item.section, list);
  }
  return sections;
}

export default function WorkflowPalette({ onDragStart, onDragEnd }: Props) {
  const sections = groupBySection(WORKFLOW_NODE_META);

  return (
    <aside className="wf-palette">
      {Array.from(sections.entries()).map(([section, items]) => (
        <div key={section} className="wf-palette-section">
          <div className="wf-palette-section-label">{section}</div>
          {items.map((item) => (
            <div
              key={item.type}
              className="wf-palette-node"
              draggable
              data-palette={item.palette}
              onDragStart={(e) => {
                e.dataTransfer.setData(DRAG_TYPE, item.type);
                e.dataTransfer.effectAllowed = "copy";
                onDragStart?.();
              }}
              onDragEnd={() => onDragEnd?.()}
            >
              <div className="wf-palette-node-icon">
                <i className={`ti ${item.icon}`} />
              </div>
              <div className="wf-palette-node-label">{item.label}</div>
              <i className="ti ti-grip-vertical wf-palette-node-drag" />
            </div>
          ))}
        </div>
      ))}

      <div className="wf-palette-tip">
        Drag nodes onto the canvas. Connect <kbd>•</kbd> ports with a curve. <kbd>Del</kbd> removes
        selection.
      </div>
    </aside>
  );
}

export { DRAG_TYPE };
