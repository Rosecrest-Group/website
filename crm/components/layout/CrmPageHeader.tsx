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
        <h1 className="text-2xl font-bold text-(--color-tc-40)">{title}</h1>
        {subtitle != null && subtitle !== "" && (
          <p className="mt-1 text-(--color-tc-30)">{subtitle}</p>
        )}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}
