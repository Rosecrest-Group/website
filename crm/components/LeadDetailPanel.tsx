"use client";

import LeadDetail from "@/crm/components/LeadDetail";
import CrmSlidePanel from "@/crm/components/ui/CrmSlidePanel";

export interface LeadDetailPanelProps {
  leadId: string | null;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  hideHeading?: boolean;
  onDeleted?: () => void;
}

export default function LeadDetailPanel({
  leadId,
  isOpen,
  onClose,
  title = "Lead details",
  hideHeading = false,
  onDeleted,
}: LeadDetailPanelProps) {
  function handleDeleted() {
    onDeleted?.();
    onClose();
  }

  return (
    <CrmSlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={hideHeading ? undefined : title}
      description={hideHeading ? undefined : "Lead profile and actions"}
      widthClassName="max-w-4xl"
    >
      {leadId && (
        <LeadDetail
          id={leadId}
          embedded
          onClose={hideHeading ? onClose : undefined}
          onDeleted={handleDeleted}
        />
      )}
    </CrmSlidePanel>
  );
}
