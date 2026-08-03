import type { ReactNode } from "react";

export default function CrmPageContent({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
      <div
        className={`space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-12 lg:py-10 ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
