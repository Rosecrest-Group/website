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
  | "assigned"
  | "upload"
  | "qc"
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
      | "crmAssigned"
      | "crmUpload"
      | "crmQc"
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
  assigned: {
    badgeVariant: "crmAssigned",
    defaultLabel: "Assigned",
    dotClass: "bg-indigo-500",
  },
  upload: {
    badgeVariant: "crmUpload",
    defaultLabel: "Upload",
    dotClass: "bg-blue-500",
  },
  qc: {
    badgeVariant: "crmQc",
    defaultLabel: "QC",
    dotClass: "bg-rose-500",
  },
  paused: {
    badgeVariant: "crmPaused",
    defaultLabel: "On hold",
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

export function jobStageToPillVariant(stage: string): StatusVariant {
  switch (stage) {
    case "PENDING_PAYMENT":
      return "paused";
    case "PAID":
    case "WORK_SCHEDULED":
      return "new";
    case "ACCESS_REQUESTED":
    case "WORK_IN_PROGRESS":
      return "pending";
    case "ACCESS_CONFIRMED":
      return "assigned";
    case "INSPECTION_BOOKED":
    case "SNAGGING":
      return "in-review";
    case "INSPECTION_COMPLETE":
    case "WORK_COMPLETE":
      return "awaiting";
    case "DATA_UPLOAD":
    case "REPORT_DRAFTING":
      return "upload";
    case "REPORT_QC":
      return "qc";
    case "REPORT_DELIVERED":
    case "COMPLETED":
      return "completed";
    case "CANCELLED":
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
