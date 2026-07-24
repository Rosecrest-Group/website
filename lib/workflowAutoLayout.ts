/** Shared workflow canvas auto-layout (CRM builder + API seed scripts). */

export type LayoutNode = { id: string; type: string; position: { x: number; y: number } };
export type LayoutEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  type?: string;
  [key: string]: unknown;
};

const H_SPACING = 340;
const V_SPACING = 220;
const ORIGIN_X = 0;
const ORIGIN_Y = 300;
const SERPENTINE_COLS = 5;
const HORIZONTAL_ROW_MAX = 6;

export function serpentinePosition(
  index: number,
  opts: { cols?: number; hSpacing?: number; vSpacing?: number; originX?: number; originY?: number } = {}
): { x: number; y: number } {
  const cols = opts.cols ?? SERPENTINE_COLS;
  const hSpacing = opts.hSpacing ?? H_SPACING;
  const vSpacing = opts.vSpacing ?? V_SPACING;
  const originX = opts.originX ?? ORIGIN_X;
  const originY = opts.originY ?? ORIGIN_Y;

  const row = Math.floor(index / cols);
  const col = index % cols;
  const x =
    row % 2 === 0 ? originX + col * hSpacing : originX + (cols - 1 - col) * hSpacing;
  const y = originY + row * vSpacing;

  return { x, y };
}

function linearNodeOrder(nodes: LayoutNode[], edges: LayoutEdge[]): string[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const trigger = nodes.find((n) => n.type === "trigger");
  if (!trigger) return nodes.map((n) => n.id);

  const order: string[] = [];
  const visited = new Set<string>();
  let current: string | undefined = trigger.id;

  while (current && !visited.has(current)) {
    visited.add(current);
    order.push(current);
    const node = byId.get(current);
    if (!node || node.type === "end") break;
    if (node.type === "branch") break;

    const out = edges.find(
      (e) => e.source === current && (!e.sourceHandle || e.sourceHandle === "out")
    );
    current = out?.target;
  }

  for (const n of nodes) {
    if (!visited.has(n.id)) order.push(n.id);
  }
  return order;
}

function layoutForkSubtree(
  startId: string,
  depth: number,
  lane: number,
  nodes: LayoutNode[],
  edges: LayoutEdge[],
  positions: Map<string, { x: number; y: number }>,
  visited: Set<string>
) {
  if (visited.has(startId)) return;
  visited.add(startId);

  const node = nodes.find((n) => n.id === startId);
  if (!node) return;

  positions.set(startId, { x: ORIGIN_X + depth * H_SPACING, y: ORIGIN_Y + lane * V_SPACING });

  if (node.type === "branch") {
    const trueEdge = edges.find((e) => e.source === startId && e.sourceHandle === "true");
    const falseEdge = edges.find((e) => e.source === startId && e.sourceHandle === "false");
    if (trueEdge) layoutForkSubtree(trueEdge.target, depth + 1, lane, nodes, edges, positions, visited);
    if (falseEdge) layoutForkSubtree(falseEdge.target, depth + 1, lane + 1, nodes, edges, positions, visited);
    return;
  }

  const out = edges.find(
    (e) => e.source === startId && (!e.sourceHandle || e.sourceHandle === "out")
  );
  if (out) layoutForkSubtree(out.target, depth + 1, lane, nodes, edges, positions, visited);
}

/** Fork-tree for branches; horizontal row for short linear flows; serpentine for long drips. */
export function autoLayoutWorkflow<T extends LayoutNode>(
  nodes: T[],
  edges: LayoutEdge[]
): { nodes: T[]; edges: LayoutEdge[] } {
  const hasBranch = nodes.some((n) => n.type === "branch");

  if (!hasBranch) {
    const order = linearNodeOrder(nodes, edges);
    const indexById = new Map(order.map((id, index) => [id, index]));

    if (nodes.length <= HORIZONTAL_ROW_MAX) {
      return {
        nodes: nodes.map((node) => {
          const index = indexById.get(node.id);
          return index !== undefined
            ? { ...node, position: { x: ORIGIN_X + index * H_SPACING, y: ORIGIN_Y } }
            : node;
        }),
        edges,
      };
    }

    return {
      nodes: nodes.map((node) => {
        const index = indexById.get(node.id);
        return index !== undefined
          ? {
              ...node,
              position: serpentinePosition(index, {
                cols: SERPENTINE_COLS,
                hSpacing: H_SPACING,
                vSpacing: V_SPACING,
                originX: ORIGIN_X,
                originY: ORIGIN_Y,
              }),
            }
          : node;
      }),
      edges,
    };
  }

  const positions = new Map<string, { x: number; y: number }>();
  const trigger = nodes.find((n) => n.type === "trigger");
  if (trigger) {
    layoutForkSubtree(trigger.id, 0, 0, nodes, edges, positions, new Set());
  }

  const maxLane = Math.max(
    0,
    ...[...positions.values()].map((p) => Math.round((p.y - ORIGIN_Y) / V_SPACING))
  );
  const yOffset = maxLane > 0 ? -(maxLane * V_SPACING) / 2 : 0;

  const laidOutNodes = nodes.map((node) => {
    const pos = positions.get(node.id);
    if (!pos) return node;
    return { ...node, position: { x: pos.x, y: pos.y + yOffset } };
  });

  const laidOutEdges = edges.map((edge) => {
    if (nodes.find((n) => n.id === edge.source)?.type === "branch") {
      return { ...edge, type: "smoothstep" };
    }
    return edge;
  });

  return { nodes: laidOutNodes, edges: laidOutEdges };
}
