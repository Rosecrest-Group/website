"use client";

import LeadDetail from "@/crm/components/LeadDetail";
import CrmSlidePanel from "@/crm/components/ui/CrmSlidePanel";

export interface LeadDetailPanelProps {
  leadId: string | null;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  onDeleted?: () => void;
}

export default function LeadDetailPanel({
  leadId,
  isOpen,
  onClose,
  title = "Lead details",
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
      title={title}
      description="Full lead profile, activity, and actions"
      widthClassName="max-w-5xl"
    >
      {leadId && <LeadDetail id={leadId} embedded onDeleted={handleDeleted} />}
    </CrmSlidePanel>
  );
}
