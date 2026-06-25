"use client";

import type { MessageChannel } from "@/crm/components/ui/ChannelSelector";
import TemplateEditorPanel from "@/crm/components/TemplateEditorPanel";
import type { MessageTemplate } from "@/crm/types";

type Props = {
  open: boolean;
  channel: MessageChannel;
  workflowTrigger: string;
  onClose: () => void;
  onCreated: (template: MessageTemplate) => void;
};

export default function WorkflowTemplateEditor({
  open,
  channel,
  workflowTrigger,
  onClose,
  onCreated,
}: Props) {
  return (
    <TemplateEditorPanel
      isOpen={open}
      mode="create"
      template={null}
      onClose={onClose}
      onSaved={onCreated}
      initialTrigger={workflowTrigger}
      lockChannel={channel}
      hideTrigger
      saveLabel="Save & use template"
    />
  );
}
