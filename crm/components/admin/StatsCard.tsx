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
    text: "text-brand",
    bg: "bg-brand-muted",
    accent: "bg-brand",
    trendPositive: "bg-emerald-50 text-emerald-700",
    trendNegative: "bg-orange-50 text-orange-700",
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
        "group relative flex h-full flex-col overflow-hidden rounded-xl border border-line transition-all duration-200",
        variant === "grey" ? "bg-sidebar" : "bg-surface",
        isClickable && "hover:border-line-strong hover:bg-sidebar/40",
        className,
      )}
    >
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* Icon + title */}
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xs font-normal text-ink-subtle">{title}</h3>
          {icon && (
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg",
                "[&_svg]:size-4 [&_svg]:stroke-current [&_svg]:stroke-[1.75px]",
                "transition-transform duration-200",
                tint.bg,
                tint.text,
                isClickable && "group-hover:scale-105",
              )}
            >
              {icon}
            </div>
          )}
        </div>

        {/* Value */}
        <p className="mt-1.5 text-sm font-medium tracking-tight text-ink tabular-nums sm:text-2xl sm:leading-none lg:text-[32px]">
          {value}
        </p>

        {/* Footer */}
        {hasFooter && (
          <div className="mt-auto flex items-center gap-2 border-t border-line pt-3 text-xs">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-medium",
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
              <span className="text-ink-subtle">{subtitle || trend?.label}</span>
            )}

            {action && !action.href && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  action.onClick?.();
                }}
                className="ml-auto font-medium text-brand hover:underline"
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
