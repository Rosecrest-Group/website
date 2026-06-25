export type FlowNode = { id: string; type?: string; data?: { label?: string } };
export type FlowEdge = { id: string; source: string; target: string };

export type WorkflowDiff = {
  addedNodes: FlowNode[];
  removedNodes: FlowNode[];
  changedNodes: Array<{ id: string; from: FlowNode; to: FlowNode }>;
  addedEdges: FlowEdge[];
  removedEdges: FlowEdge[];
};

function nodeKey(n: FlowNode) {
  return JSON.stringify({ type: n.type, data: n.data });
}

export function diffWorkflowVersions(
  oldNodes: FlowNode[],
  oldEdges: FlowEdge[],
  newNodes: FlowNode[],
  newEdges: FlowEdge[]
): WorkflowDiff {
  const oldNodeMap = new Map(oldNodes.map((n) => [n.id, n]));
  const newNodeMap = new Map(newNodes.map((n) => [n.id, n]));

  const addedNodes = newNodes.filter((n) => !oldNodeMap.has(n.id));
  const removedNodes = oldNodes.filter((n) => !newNodeMap.has(n.id));
  const changedNodes = newNodes
    .filter((n) => {
      const prev = oldNodeMap.get(n.id);
      return prev && nodeKey(prev) !== nodeKey(n);
    })
    .map((n) => ({ id: n.id, from: oldNodeMap.get(n.id)!, to: n }));

  const edgeKey = (e: FlowEdge) => `${e.source}->${e.target}`;
  const oldEdgeSet = new Set(oldEdges.map(edgeKey));
  const newEdgeSet = new Set(newEdges.map(edgeKey));

  const addedEdges = newEdges.filter((e) => !oldEdgeSet.has(edgeKey(e)));
  const removedEdges = oldEdges.filter((e) => !newEdgeSet.has(edgeKey(e)));

  return { addedNodes, removedNodes, changedNodes, addedEdges, removedEdges };
}
