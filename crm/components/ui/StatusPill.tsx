"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ReactElement, ReactNode } from "react";

type StatusVariant = "completed" | "pending" | "in-review" | "failed";

type StatusPillProps = {
  variant: StatusVariant;
  label?: string;
  icon?: ReactNode;
  className?: string;
};

const statusConfig: Record<
  StatusVariant,
  {
    badgeVariant: "crmCompleted" | "crmPending" | "crmInReview" | "crmFailed";
    icon: ReactElement;
    defaultLabel: string;
  }
> = {
  completed: {
    badgeVariant: "crmCompleted",
    defaultLabel: "Completed",
    icon: (
      <img
        src="/verify.svg"
        alt="Completed"
        className="h-4 w-4 shrink-0 md:h-[18px] md:w-[18px]"
      />
    ),
  },
  pending: {
    badgeVariant: "crmPending",
    defaultLabel: "Pending",
    icon: (
      <img
        src="/hour-glass.svg"
        alt="Pending"
        className="h-4 w-4 shrink-0 md:h-[18px] md:w-[18px]"
      />
    ),
  },
  "in-review": {
    badgeVariant: "crmInReview",
    defaultLabel: "In review",
    icon: (
      <img
        src="/timer.svg"
        alt="In review"
        className="h-4 w-4 shrink-0 md:h-[18px] md:w-[18px]"
      />
    ),
  },
  failed: {
    badgeVariant: "crmFailed",
    defaultLabel: "Failed",
    icon: (
      <svg
        className="h-4 w-4 shrink-0 md:h-[18px] md:w-[18px]"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
};

export function leadStageToPillVariant(stage: string): StatusVariant {
  if (stage === "CONVERTED") return "completed";
  if (stage === "LOST") return "failed";
  if (stage === "AWAITING_PAYMENT" || stage === "FOLLOWING_UP") return "pending";
  return "in-review";
}

export default function StatusPill({ variant, label, icon, className = "" }: StatusPillProps) {
  const config = statusConfig[variant];
  const displayLabel = label || config.defaultLabel;
  const displayIcon = icon !== undefined ? icon : config.icon;

  return (
    <Badge
      variant={config.badgeVariant}
      className={cn("inline-flex items-center justify-center gap-1.5 leading-none", className)}
    >
      {displayIcon}
      <span className="whitespace-nowrap">{displayLabel}</span>
    </Badge>
  );
}
