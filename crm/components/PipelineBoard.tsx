"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { api } from "@/crm/lib/api";
import { LEAD_STAGE_LABELS } from "@/crm/lib/constants";
import PipelineCardView, { formatPounds } from "@/crm/components/PipelineCard";
import type { LeadStage, PipelineBoardColumn, PipelineCard } from "@/crm/types";
import { cn } from "@/lib/utils";

const SPRING = { type: "spring", stiffness: 420, damping: 32, mass: 0.7 } as const;
const DRAG_THRESHOLD = 6;

type DragState = {
  card: PipelineCard;
  fromStage: LeadStage;
  pointerId: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  x: number;
  y: number;
  overStage: LeadStage | null;
};

function money(value: number | null | undefined) {
  return value ?? 0;
}

function moveCard(
  columns: PipelineBoardColumn[],
  leadId: string,
  toStage: LeadStage,
): PipelineBoardColumn[] {
  const from = columns.find((col) => col.cards.some((card) => card.id === leadId));
  const card = from?.cards.find((item) => item.id === leadId);
  if (!from || !card || from.stage === toStage) return columns;
  const amount = money(card.quotedAmount);
  const rottingDelta = card.rotting ? 1 : 0;
  const moved = { ...card, stage: toStage };
  return columns.map((col) => {
    if (col.stage === from.stage) {
      return {
        ...col,
        cards: col.cards.filter((item) => item.id !== leadId),
        count: Math.max(0, col.count - 1),
        quotedAmount: Math.max(0, col.quotedAmount - amount),
        rottingCount: Math.max(0, col.rottingCount - rottingDelta),
      };
    }
    if (col.stage === toStage) {
      return {
        ...col,
        cards: [moved, ...col.cards],
        count: col.count + 1,
        quotedAmount: col.quotedAmount + amount,
        rottingCount: col.rottingCount + rottingDelta,
      };
    }
    return col;
  });
}

function stageAtPoint(x: number, y: number): LeadStage | null {
  const el = document.elementFromPoint(x, y);
  const stage = el?.closest("[data-pipeline-column]")?.getAttribute("data-stage");
  return (stage as LeadStage | null) ?? null;
}

export default function PipelineBoard({
  columns: incoming,
  onMoved,
}: {
  columns: PipelineBoardColumn[];
  onMoved: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const [columns, setColumns] = useState(incoming);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [droppingId, setDroppingId] = useState<string | null>(null);
  const columnsRef = useRef(columns);
  const dragRef = useRef<DragState | null>(null);
  columnsRef.current = columns;
  dragRef.current = drag;

  useEffect(() => {
    if (!dragRef.current) setColumns(incoming);
  }, [incoming]);

  useEffect(() => {
    if (!drag) return;

    function onMove(event: PointerEvent) {
      const current = dragRef.current;
      if (!current || event.pointerId !== current.pointerId) return;
      event.preventDefault();
      setDrag({
        ...current,
        x: event.clientX,
        y: event.clientY,
        overStage: stageAtPoint(event.clientX, event.clientY),
      });
    }

    function onUp(event: PointerEvent) {
      const current = dragRef.current;
      if (!current || event.pointerId !== current.pointerId) return;
      void finishDrag(current, event.clientX, event.clientY);
    }

    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    document.body.classList.add("cursor-grabbing");
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      document.body.classList.remove("cursor-grabbing");
    };
  }, [drag]);

  async function finishDrag(current: DragState, x: number, y: number) {
    const overStage = stageAtPoint(x, y) ?? current.overStage;
    setDrag(null);
    if (!overStage || overStage === current.fromStage) return;
    const snapshot = columnsRef.current;
    setColumns(moveCard(snapshot, current.card.id, overStage));
    setDroppingId(current.card.id);
    try {
      await api.updateLeadStage(current.card.id, overStage);
      onMoved();
    } catch (error) {
      setColumns(snapshot);
      toast.error(error instanceof Error ? error.message : "Could not move lead");
    } finally {
      window.setTimeout(() => setDroppingId(null), 450);
    }
  }

  function beginDrag(card: PipelineCard, fromStage: LeadStage, event: React.PointerEvent<HTMLElement>) {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest("button, a, input, textarea, select")) return;
    const origin = event.currentTarget.closest("[data-pipeline-card]") as HTMLElement | null;
    const box = (origin ?? event.currentTarget).getBoundingClientRect();
    const pointerId = event.pointerId;
    const startX = event.clientX;
    const startY = event.clientY;
    let started = false;

    function onMove(moveEvent: PointerEvent) {
      if (moveEvent.pointerId !== pointerId) return;
      if (!started && Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) < DRAG_THRESHOLD) {
        return;
      }
      if (!started) {
        started = true;
        origin?.setPointerCapture(pointerId);
        const swallowClick = (clickEvent: MouseEvent) => {
          clickEvent.preventDefault();
          clickEvent.stopPropagation();
          window.removeEventListener("click", swallowClick, true);
        };
        window.addEventListener("click", swallowClick, true);
        setDrag({
          card,
          fromStage,
          pointerId,
          offsetX: startX - box.left,
          offsetY: startY - box.top,
          width: box.width,
          height: box.height,
          x: moveEvent.clientX,
          y: moveEvent.clientY,
          overStage: fromStage,
        });
      }
    }

    function onUp(upEvent: PointerEvent) {
      if (upEvent.pointerId !== pointerId) return;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      if (started) origin?.releasePointerCapture(pointerId);
    }

    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }

  return (
    <>
      <div className="flex min-h-[28rem] gap-3 overflow-x-auto pb-2">
        {columns.map((column) => {
          const isOver = drag?.overStage === column.stage && drag.fromStage !== column.stage;
          return (
            <section
              key={column.stage}
              data-pipeline-column
              data-stage={column.stage}
              className={cn(
                "flex w-[17.5rem] shrink-0 flex-col rounded-xl border bg-sidebar/60 transition-[border-color,background-color,box-shadow,transform] duration-200",
                isOver
                  ? "scale-[1.015] border-brand bg-brand-muted/40 shadow-[0_0_0_4px_rgb(109_40_217_/_0.12)]"
                  : "border-line",
              )}
            >
              <header className="border-b border-line px-3 py-2.5">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="text-sm font-medium text-ink">
                    {LEAD_STAGE_LABELS[column.stage] ?? column.stage}
                  </h2>
                  <span className="text-xs tabular-nums text-ink-muted">{column.count}</span>
                </div>
                <p className="mt-0.5 text-xs tabular-nums text-ink-subtle">
                  {formatPounds(column.quotedAmount)}
                  {column.rottingCount > 0 ? ` · ${column.rottingCount} stale` : ""}
                </p>
              </header>
              <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
                <AnimatePresence initial={false}>
                  {isOver ? (
                    <motion.div
                      key="drop-slot"
                      initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: drag.height }}
                      exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
                      transition={SPRING}
                      className="flex items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-brand bg-brand-muted/60 text-xs font-medium text-brand"
                    >
                      Drop here
                    </motion.div>
                  ) : null}
                </AnimatePresence>
                {column.cards.length === 0 && !isOver ? (
                  <p className="px-1 py-6 text-center text-xs text-ink-subtle">None</p>
                ) : (
                  <AnimatePresence initial={false}>
                    {column.cards.map((card) => {
                      const isLifted = drag?.card.id === card.id;
                      return (
                        <motion.div
                          key={card.id}
                          data-pipeline-card
                          layout={!reduceMotion && !drag}
                          initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.98 }}
                          animate={{
                            opacity: isLifted ? 0.4 : 1,
                            y: 0,
                            scale: droppingId === card.id ? 1.03 : 1,
                          }}
                          exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
                          transition={SPRING}
                          className={cn(isLifted && "pointer-events-none")}
                          onPointerDown={
                            isLifted ? undefined : (event) => beginDrag(card, column.stage, event)
                          }
                        >
                          {isLifted ? (
                            <div
                              className="rounded-xl border-2 border-dashed border-brand/40 bg-brand-muted/50"
                              style={{ height: drag.height }}
                            />
                          ) : (
                            <PipelineCardView card={card} draggable />
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
                {column.hasMore ? (
                  <p className="px-1 py-2 text-center text-xs text-ink-subtle">+ more in this stage</p>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
      {drag && typeof document !== "undefined"
        ? createPortal(
            <motion.div
              aria-hidden
              initial={reduceMotion ? false : { scale: 1, rotate: 0, opacity: 0.92 }}
              animate={{
                scale: reduceMotion ? 1 : 1.04,
                rotate: reduceMotion ? 0 : 2.5,
                opacity: 1,
              }}
              transition={{ type: "spring", stiffness: 520, damping: 28 }}
              className="pointer-events-none fixed z-[80]"
              style={{
                left: drag.x - drag.offsetX,
                top: drag.y - drag.offsetY,
                width: drag.width,
              }}
            >
              <PipelineCardView card={drag.card} overlay />
            </motion.div>,
            document.body,
          )
        : null}
    </>
  );
}
