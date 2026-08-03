import type { ReactNode } from "react";
import CurvedContainer from "@/crm/components/ui/CurvedContainer";

export default function CrmPanel({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <CurvedContainer className={className}>
      {title && (
        <div className="border-b border-(--color-line) px-5 py-4 sm:px-6">
          <h2 className="text-base font-medium text-(--color-ink)">{title}</h2>
        </div>
      )}
      <div className="p-5 sm:p-6">{children}</div>
    </CurvedContainer>
  );
}
