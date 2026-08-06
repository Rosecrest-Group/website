import type { ReactNode } from "react";

export default function CrmPageHeader({
  title,
  subtitle,
  actions,
  compact = false,
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-wrap justify-between ${compact ? "items-center gap-2" : "items-start gap-4"}`}
    >
      <div>
        <h1 className="text-base font-medium text-ink">{title}</h1>
        {subtitle != null && subtitle !== "" && (
          <p
            className={`text-sm font-normal text-ink-muted ${compact ? "mt-0.5" : "mt-1"}`}
          >
            {subtitle}
          </p>
        )}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}
