"use client";

import { useRouter } from "next/navigation";
import { GripVertical } from "lucide-react";
import StatusPill, { leadStageToPillVariant } from "@/crm/components/ui/StatusPill";
import PhoneButton from "@/crm/components/PhoneButton";
import { prefetchLead } from "@/crm/lib/leadDetailCache";
import { CRM_BASE_PATH, LEAD_STAGE_LABELS } from "@/crm/lib/constants";
import type { PipelineCard } from "@/crm/types";
import { cn } from "@/lib/utils";

export function formatPounds(value: number | null): string {
  if (value == null) return "No quote";
  return `£${Math.round(value).toLocaleString("en-GB")}`;
}

export function formatWinChance(pWin: number | null | undefined): string | null {
  if (pWin == null || pWin <= 0) return null;
  return `${Math.round(pWin * 100)}%`;
}

function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

export default function PipelineCardView({
  card,
  draggable = false,
  overlay = false,
  lifted = false,
  onDragHandlePointerDown,
}: {
  card: PipelineCard;
  draggable?: boolean;
  overlay?: boolean;
  lifted?: boolean;
  onDragHandlePointerDown?: (event: React.PointerEvent<HTMLElement>) => void;
}) {
  const router = useRouter();
  const href = `${CRM_BASE_PATH}/leads/${card.id}`;
  const winChance = formatWinChance(card.pWin);

  return (
    <article
      onMouseEnter={overlay ? undefined : () => void prefetchLead(card.id)}
      onClick={overlay ? undefined : () => router.push(href)}
      className={cn(
        "rounded-xl border border-brand/30 bg-surface p-3 text-left",
        overlay
          ? "pointer-events-none cursor-grabbing shadow-[0_18px_40px_rgb(63_63_80/0.22)] ring-2 ring-brand/30"
          : cn(
              "cursor-pointer transition-[border-color,box-shadow,transform] duration-200 hover:border-brand hover:shadow-[0_8px_20px_rgb(63_63_80/0.08)]",
              draggable && "cursor-grab active:cursor-grabbing",
            ),
        lifted && "opacity-0",
        draggable && !overlay && "select-none",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-start gap-1">
          {draggable || overlay ? (
            <span
              data-pipeline-drag-handle
              onPointerDown={onDragHandlePointerDown}
              onClick={(event) => event.stopPropagation()}
              className={cn(
                "mt-0.5 -ml-0.5 shrink-0 rounded text-ink-subtle",
                overlay ? "cursor-grabbing" : "cursor-grab hover:text-ink-muted",
              )}
              aria-hidden
            >
              <GripVertical className="size-3.5" />
            </span>
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="truncate text-sm font-medium text-ink">{card.customerName || "Unknown"}</p>
              <p className="shrink-0 text-sm font-semibold tabular-nums text-ink">
                {formatPounds(card.quotedAmount)}
              </p>
            </div>
            <div className="mt-0.5 flex items-baseline justify-between gap-2">
              <p className="min-w-0 truncate text-xs text-ink-muted">
                {card.propertyPostcode || card.propertyAddress}
              </p>
              {winChance ? (
                <p
                  className="shrink-0 text-right text-xs text-ink-subtle tabular-nums"
                  title="Estimated chance they'll instruct"
                >
                  {winChance}
                </p>
              ) : null}
            </div>
            {card.reason && !/£[\d,.]+\s*quoted/i.test(card.reason) ? (
              <p
                className={cn(
                  "mt-0.5 truncate text-xs",
                  card.rotting ? "font-medium text-amber-800" : "text-ink-subtle",
                )}
              >
                {card.reason}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <StatusPill
          variant={leadStageToPillVariant(card.stage)}
          label={LEAD_STAGE_LABELS[card.stage] ?? card.stage}
        />
        {!card.assignedTo ? (
          <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-medium text-orange-800">
            Unassigned
          </span>
        ) : (
          <span className="truncate text-[11px] text-ink-subtle">{firstName(card.assignedTo.fullName)}</span>
        )}
        {card.customerPhone && !overlay ? (
          <div className="ml-auto shrink-0" onClick={(event) => event.stopPropagation()}>
            <PhoneButton
              number={card.customerPhone}
              iconOnly
              context={{ leadId: card.id, customerName: card.customerName }}
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}
