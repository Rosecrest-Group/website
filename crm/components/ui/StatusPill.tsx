"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusVariant =
  | "completed"
  | "pending"
  | "in-review"
  | "failed"
  | "new"
  | "awaiting"
  | "paused";

type StatusPillProps = {
  variant: StatusVariant;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
};

const statusConfig: Record<
  StatusVariant,
  {
    badgeVariant:
      | "crmCompleted"
      | "crmPending"
      | "crmInReview"
      | "crmFailed"
      | "crmNew"
      | "crmAwaiting"
      | "crmPaused";
    defaultLabel: string;
    dotClass: string;
  }
> = {
  completed: {
    badgeVariant: "crmCompleted",
    defaultLabel: "Completed",
    dotClass: "bg-emerald-500",
  },
  pending: {
    badgeVariant: "crmPending",
    defaultLabel: "Pending",
    dotClass: "bg-brand",
  },
  "in-review": {
    badgeVariant: "crmInReview",
    defaultLabel: "In review",
    dotClass: "bg-amber-500",
  },
  failed: {
    badgeVariant: "crmFailed",
    defaultLabel: "Failed",
    dotClass: "bg-orange-500",
  },
  new: {
    badgeVariant: "crmNew",
    defaultLabel: "New",
    dotClass: "bg-sky-500",
  },
  awaiting: {
    badgeVariant: "crmAwaiting",
    defaultLabel: "Awaiting",
    dotClass: "bg-teal-500",
  },
  paused: {
    badgeVariant: "crmPaused",
    defaultLabel: "Paused",
    dotClass: "bg-slate-400",
  },
};

export function leadStageToPillVariant(stage: string): StatusVariant {
  switch (stage) {
    case "NEW":
      return "new";
    case "QUOTE_SENT":
      return "in-review";
    case "FOLLOWING_UP":
      return "pending";
    case "AWAITING_PAYMENT":
      return "awaiting";
    case "PAUSED":
      return "paused";
    case "CONVERTED":
      return "completed";
    case "LOST":
      return "failed";
    default:
      return "in-review";
  }
}

export default function StatusPill({
  variant,
  label,
  className = "",
}: StatusPillProps) {
  const config = statusConfig[variant];
  const displayLabel = label || config.defaultLabel;

  return (
    <Badge
      variant={config.badgeVariant}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium leading-none sm:text-xs",
        className,
      )}
    >
      <span
        className={cn("size-1.5 shrink-0 rounded-full", config.dotClass)}
        aria-hidden
      />
      <span className="whitespace-nowrap">{displayLabel}</span>
    </Badge>
  );
}
