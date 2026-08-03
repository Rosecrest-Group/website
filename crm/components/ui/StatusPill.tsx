"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusVariant = "completed" | "pending" | "in-review" | "failed";

type StatusPillProps = {
  variant: StatusVariant;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
};

const statusConfig: Record<
  StatusVariant,
  {
    badgeVariant: "crmCompleted" | "crmPending" | "crmInReview" | "crmFailed";
    defaultLabel: string;
  }
> = {
  completed: { badgeVariant: "crmCompleted", defaultLabel: "Completed" },
  pending: { badgeVariant: "crmPending", defaultLabel: "Pending" },
  "in-review": { badgeVariant: "crmInReview", defaultLabel: "In review" },
  failed: { badgeVariant: "crmFailed", defaultLabel: "Failed" },
};

export function leadStageToPillVariant(stage: string): StatusVariant {
  if (stage === "CONVERTED") return "completed";
  if (stage === "LOST") return "failed";
  if (stage === "AWAITING_PAYMENT" || stage === "FOLLOWING_UP") return "pending";
  return "in-review";
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
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          variant === "completed" && "bg-emerald-500",
          variant === "pending" && "bg-brand",
          variant === "in-review" && "bg-amber-500",
          variant === "failed" && "bg-orange-500",
        )}
        aria-hidden
      />
      <span className="whitespace-nowrap">{displayLabel}</span>
    </Badge>
  );
}
