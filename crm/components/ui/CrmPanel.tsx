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
        <div className="border-b border-(--color-tc-20) px-6 py-4">
          <h2 className="text-base font-semibold text-(--color-tc-40)">{title}</h2>
        </div>
      )}
      <div className="p-6">{children}</div>
    </CurvedContainer>
  );
}
