import { useCallback, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type { Dispatch, SetStateAction } from "react";
import type { Edge, Node } from "@xyflow/react";

type Snapshot = { nodes: Node[]; edges: Edge[] };

const MAX_HISTORY = 50;

function serialize(snap: Snapshot, sanitizeNodes: (n: Node[]) => Node[], sanitizeEdges: (e: Edge[]) => Edge[]) {
  return JSON.stringify({ nodes: sanitizeNodes(snap.nodes), edges: sanitizeEdges(snap.edges) });
}

function cloneSnapshot(snap: Snapshot): Snapshot {
  return structuredClone(snap);
}

export function useWorkflowHistory(
  nodes: Node[],
  edges: Edge[],
  setNodes: Dispatch<SetStateAction<Node[]>>,
  setEdges: Dispatch<SetStateAction<Edge[]>>,
  attachNodeCallbacks: (nodes: Node[]) => Node[],
  sanitizeNodes: (nodes: Node[]) => Node[],
  sanitizeEdges: (edges: Edge[]) => Edge[]
) {
  const latestRef = useRef<Snapshot>({ nodes, edges });
  latestRef.current = { nodes, edges };

  const pastRef = useRef<Snapshot[]>([]);
  const futureRef = useRef<Snapshot[]>([]);
  const baselineRef = useRef<Snapshot | null>(null);
  const applyingRef = useRef(false);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateFlags = useCallback(() => {
    setCanUndo(pastRef.current.length > 0);
    setCanRedo(futureRef.current.length > 0);
  }, []);

  const snapshot = useCallback((): Snapshot => {
    return cloneSnapshot({
      nodes: sanitizeNodes(latestRef.current.nodes),
      edges: sanitizeEdges(latestRef.current.edges),
    });
  }, [sanitizeNodes, sanitizeEdges]);

  const apply = useCallback(
    (snap: Snapshot) => {
      applyingRef.current = true;
      const cloned = cloneSnapshot(snap);
      flushSync(() => {
        setNodes(attachNodeCallbacks(cloned.nodes));
        setEdges(cloned.edges);
      });
      applyingRef.current = false;
    },
    [setNodes, setEdges, attachNodeCallbacks]
  );

  const commit = useCallback(() => {
    if (applyingRef.current) return;

    const current = snapshot();

    if (baselineRef.current === null) {
      baselineRef.current = current;
      return;
    }

    if (serialize(current, sanitizeNodes, sanitizeEdges) === serialize(baselineRef.current, sanitizeNodes, sanitizeEdges)) {
      return;
    }

    pastRef.current.push(baselineRef.current);
    if (pastRef.current.length > MAX_HISTORY) pastRef.current.shift();
    baselineRef.current = current;
    futureRef.current = [];
    updateFlags();
  }, [snapshot, sanitizeNodes, sanitizeEdges, updateFlags]);

  const undo = useCallback(() => {
    if (applyingRef.current) return;
    if (pastRef.current.length === 0) return;

    futureRef.current.unshift(snapshot());
    const previous = pastRef.current.pop()!;
    baselineRef.current = previous;
    apply(previous);
    updateFlags();
  }, [snapshot, apply, updateFlags]);

  const redo = useCallback(() => {
    if (applyingRef.current) return;
    if (futureRef.current.length === 0) return;

    pastRef.current.push(snapshot());
    const next = futureRef.current.shift()!;
    baselineRef.current = next;
    apply(next);
    updateFlags();
  }, [snapshot, apply, updateFlags]);

  const resetHistory = useCallback(
    (initialNodes: Node[], initialEdges: Edge[]) => {
      pastRef.current = [];
      futureRef.current = [];
      baselineRef.current = cloneSnapshot({
        nodes: sanitizeNodes(initialNodes),
        edges: sanitizeEdges(initialEdges),
      });
      applyingRef.current = false;
      updateFlags();
    },
    [sanitizeNodes, sanitizeEdges, updateFlags]
  );

  return { commit, undo, redo, canUndo, canRedo, resetHistory };
}
