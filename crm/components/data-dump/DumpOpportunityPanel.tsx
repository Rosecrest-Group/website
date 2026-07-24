"use client";

import { contactDisplayName, DetailField } from "@/crm/components/data-dump/shared";
import { formatOpportunityMoney } from "@/crm/components/data-dump/opportunityLink";
import CrmSlidePanel from "@/crm/components/ui/CrmSlidePanel";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import type { SalesIgniterOpportunity } from "@/crm/types";

type DumpOpportunityPanelProps = {
  opportunity: SalesIgniterOpportunity | null;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
};

export function DumpOpportunityDetails({ opportunity }: { opportunity: SalesIgniterOpportunity }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      <DetailField label="Status" value={opportunity.status} />
      <DetailField label="Value" value={formatOpportunityMoney(opportunity.monetaryValue)} />
      <DetailField label="Pipeline" value={opportunity.pipelineId} />
      <DetailField
        label="Stage"
        value={opportunity.pipelineStageName ?? opportunity.pipelineStageId}
      />
      <DetailField label="Stage ID" value={opportunity.pipelineStageId} />
      <DetailField
        label="Win probability"
        value={
          opportunity.effectiveProbability != null
            ? `${opportunity.effectiveProbability}%`
            : undefined
        }
      />
      <DetailField label="Source" value={opportunity.source} />
      <DetailField label="Assigned to" value={opportunity.assignedTo} />
      <DetailField label="Tags" value={opportunity.tags?.join(", ")} />
      <DetailField
        label="Contact"
        value={
          opportunity.contact
            ? contactDisplayName(opportunity.contact)
            : opportunity.contactId ?? undefined
        }
      />
      <DetailField label="Contact email" value={opportunity.contact?.email ?? undefined} />
      <DetailField label="Contact phone" value={opportunity.contact?.phone ?? undefined} />
      <DetailField
        label="Added"
        value={
          opportunity.dateAdded
            ? new Date(opportunity.dateAdded).toLocaleString("en-GB")
            : undefined
        }
      />
      <DetailField
        label="Updated"
        value={
          opportunity.dateUpdated
            ? new Date(opportunity.dateUpdated).toLocaleString("en-GB")
            : undefined
        }
      />
    </dl>
  );
}

export default function DumpOpportunityPanel({
  opportunity,
  loading = false,
  error = null,
  onClose,
}: DumpOpportunityPanelProps) {
  return (
    <CrmSlidePanel
      isOpen={opportunity != null || loading || Boolean(error)}
      onClose={onClose}
      title={opportunity?.name ?? "Opportunity"}
      description={opportunity?.id}
      widthClassName="max-w-xl"
    >
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <p className="text-sm text-red-700">{error}</p>
      ) : opportunity ? (
        <DumpOpportunityDetails opportunity={opportunity} />
      ) : null}
    </CrmSlidePanel>
  );
}
