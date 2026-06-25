"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type StatsCardIconTint = "primary" | "success" | "info" | "warning" | "danger";

export interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  /** Preferred: soft tinted icon background */
  iconTint?: StatsCardIconTint;
  /** @deprecated Use iconTint instead */
  iconBgColor?: string;
  trend?: {
    value: number;
    label?: string;
    isPositive?: boolean;
  };
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
  variant?: "white" | "grey";
}

const ICON_TINTS: Record<
  StatsCardIconTint,
  { text: string; bg: string; accent: string; trendPositive: string; trendNegative: string }
> = {
  primary: {
    text: "text-(--color-primary)",
    bg: "bg-(--color-primary)/8",
    accent: "bg-(--color-primary)",
    trendPositive: "bg-emerald-50 text-emerald-700",
    trendNegative: "bg-rose-50 text-rose-700",
  },
  success: {
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    accent: "bg-emerald-500",
    trendPositive: "bg-emerald-50 text-emerald-700",
    trendNegative: "bg-rose-50 text-rose-700",
  },
  info: {
    text: "text-blue-700",
    bg: "bg-blue-50",
    accent: "bg-blue-500",
    trendPositive: "bg-emerald-50 text-emerald-700",
    trendNegative: "bg-rose-50 text-rose-700",
  },
  warning: {
    text: "text-amber-700",
    bg: "bg-amber-50",
    accent: "bg-amber-500",
    trendPositive: "bg-emerald-50 text-emerald-700",
    trendNegative: "bg-rose-50 text-rose-700",
  },
  danger: {
    text: "text-rose-700",
    bg: "bg-rose-50",
    accent: "bg-rose-500",
    trendPositive: "bg-emerald-50 text-emerald-700",
    trendNegative: "bg-rose-50 text-rose-700",
  },
};

function resolveIconTint(
  iconTint?: StatsCardIconTint,
  iconBgColor?: string,
): (typeof ICON_TINTS)[StatsCardIconTint] {
  if (iconTint) return ICON_TINTS[iconTint];

  if (iconBgColor?.includes("emerald")) return ICON_TINTS.success;
  if (iconBgColor?.includes("blue")) return ICON_TINTS.info;
  if (iconBgColor?.includes("amber") || iconBgColor?.includes("orange")) return ICON_TINTS.warning;
  if (iconBgColor?.includes("rose")) return ICON_TINTS.danger;

  return ICON_TINTS.primary;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  iconTint,
  iconBgColor,
  trend,
  action,
  className = "",
  variant = "white",
}: StatsCardProps) {
  const tint = resolveIconTint(iconTint, iconBgColor);
  const hasFooter = Boolean(subtitle || trend || action);
  const isClickable = Boolean(action?.href);

  const CardContent = (
    <div
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-(--color-tc-20) transition-all duration-200",
        "shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.04)]",
        variant === "grey" ? "bg-(--color-nc-20)" : "bg-white",
        isClickable &&
          "hover:-translate-y-0.5 hover:border-(--color-tc-30) hover:shadow-[0_4px_20px_rgba(0,0,0,0.10)]",
        className,
      )}
    >
      <div className="flex flex-1 flex-col p-5">
        {/* Icon + title */}
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[13px] font-medium text-(--color-tc-30)">{title}</h3>
          {icon && (
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                "[&_svg]:h-5 [&_svg]:w-5 [&_svg]:stroke-current [&_svg]:stroke-[1.5px]",
                "transition-transform duration-200",
                tint.bg,
                tint.text,
                isClickable && "group-hover:scale-110",
              )}
            >
              {icon}
            </div>
          )}
        </div>

        {/* Value */}
        <p className="mt-3 text-[36px] font-bold leading-none tracking-tight text-(--color-tc-40) tabular-nums">
          {value}
        </p>

        {/* Footer */}
        {hasFooter && (
          <div className="mt-auto flex items-center gap-2 border-t border-(--color-tc-20) pt-3 text-[12px]">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-semibold",
                  trend.isPositive ? tint.trendPositive : tint.trendNegative,
                )}
              >
                {trend.isPositive ? (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 15l-6-6-6 6" />
                  </svg>
                ) : (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                )}
                {trend.value > 0 ? "+" : ""}
                {trend.value}%
              </span>
            )}

            {(subtitle || trend?.label) && (
              <span className="text-(--color-tc-30)">{subtitle || trend?.label}</span>
            )}

            {action && !action.href && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  action.onClick?.();
                }}
                className="ml-auto font-semibold text-(--color-primary) hover:underline"
              >
                {action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (action?.href) {
    return (
      <Link href={action.href} className="block h-full outline-none">
        {CardContent}
      </Link>
    );
  }

  return CardContent;
}
