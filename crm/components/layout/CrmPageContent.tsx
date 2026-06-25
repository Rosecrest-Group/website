import type { ReactNode } from "react";

export default function CrmPageContent({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className={`space-y-6 p-4 lg:p-8 ${className}`}>{children}</div>
    </div>
  );
}
