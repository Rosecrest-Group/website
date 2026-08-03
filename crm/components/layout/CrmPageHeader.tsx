import type { ReactNode } from "react";

export default function CrmPageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-base font-medium text-ink">{title}</h1>
        {subtitle != null && subtitle !== "" && (
          <p className="mt-1 text-sm font-normal text-ink-muted">{subtitle}</p>
        )}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}
