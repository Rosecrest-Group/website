import type { Edge, Node } from "@xyflow/react";
import {
  autoLayoutWorkflow,
  type LayoutEdge,
  type LayoutNode,
} from "@/lib/workflowAutoLayout";

export type { LayoutEdge, LayoutNode } from "@/lib/workflowAutoLayout";
export { autoLayoutWorkflow };

export function autoLayoutReactFlow(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
  return autoLayoutWorkflow(nodes as LayoutNode[], edges as LayoutEdge[]) as {
    nodes: Node[];
    edges: Edge[];
  };
}
