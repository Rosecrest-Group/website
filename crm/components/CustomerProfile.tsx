"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/crm/lib/api";
import type { Customer, Job, Lead } from "@/crm/types";
import { LEAD_STAGE_LABELS } from "@/crm/lib/constants";
import { canAccessProspecting } from "@/crm/lib/rbac";
import { getCachedCurrentUser } from "@/crm/lib/currentUserCache";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPanel from "@/crm/components/ui/CrmPanel";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import StatusPill, { leadStageToPillVariant } from "@/crm/components/ui/StatusPill";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import AddToListModal, { membershipToast } from "@/crm/components/prospecting/AddToListModal";
import { toast } from "sonner";

type CustomerWithHistory = Customer & { leads: Lead[]; jobs: Job[] };

export default function CustomerProfile({ id }: { id: string }) {
  const [customer, setCustomer] = useState<CustomerWithHistory | null>(null);
  const [error, setError] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const canEditLists = canAccessProspecting(getCachedCurrentUser()?.role ?? "READ_ONLY");

  useEffect(() => {
    api
      .getCustomer(id)
      .then(setCustomer)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, [id]);

  if (error) {
    return (
      <CrmPageContent>
        <p className="text-red-600">{error}</p>
        <SecondaryButton type="button" className="mt-4 w-auto" onClick={() => window.history.back()}>
          Back
        </SecondaryButton>
      </CrmPageContent>
    );
  }

  if (!customer) {
    return (
      <CrmPageContent>
        <LoadingSpinner />
      </CrmPageContent>
    );
  }

  return (
    <CrmPageContent>
      <Link
        href="/crm/customers"
        className="inline-flex items-center gap-1 text-sm text-(--color-tc-30) hover:text-(--color-tc-40)"
      >
        ← Contacts
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-(--color-tc-40)">
          {customer.firstName} {customer.lastName}
        </h1>
        <p className="mt-1 text-sm text-(--color-tc-30)">
          {customer.email} · {customer.phone} · {customer.customerType}
          {customer.accountId ? (
            <>
              {" · "}
              <Link href={`/crm/companies/${customer.accountId}`} className="text-brand hover:underline">
                Company
              </Link>
            </>
          ) : null}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CrmPanel title={`Leads (${customer.leads.length})`}>
          {customer.leads.length === 0 ? (
            <p className="text-sm text-(--color-tc-30)">No leads</p>
          ) : (
            <div className="space-y-3">
              {customer.leads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/crm/leads/${lead.id}`}
                  className="flex items-center justify-between rounded-xl border border-(--color-tc-20) p-3 transition hover:bg-(--color-nc-10)"
                >
                  <span className="text-sm font-medium">{lead.propertyPostcode}</span>
                  <StatusPill
                    variant={leadStageToPillVariant(lead.stage)}
                    label={LEAD_STAGE_LABELS[lead.stage] ?? lead.stage}
                  />
                </Link>
              ))}
            </div>
          )}
        </CrmPanel>

        <CrmPanel title={`Jobs (${customer.jobs.length})`}>
          {customer.jobs.length === 0 ? (
            <p className="text-sm text-(--color-tc-30)">No jobs</p>
          ) : (
            <div className="space-y-3">
              {customer.jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between rounded-xl border border-(--color-tc-20) p-3"
                >
                  <Link
                    href={`/crm/jobs/${job.id}`}
                    className="font-mono text-sm text-(--color-primary) hover:underline"
                  >
                    {job.jobNumber}
                  </Link>
                  <StatusPill variant="in-review" label={job.stage.replace(/_/g, " ")} />
                </div>
              ))}
            </div>
          )}
        </CrmPanel>
      </div>

      <CrmPanel title="List memberships">
        {customer.listMemberships && customer.listMemberships.length > 0 ? (
          <div className="space-y-2">
            {customer.listMemberships.map((row) =>
              canEditLists ? (
                <Link
                  key={row.id}
                  href={`/crm/email-campaigns/lists/${row.id}`}
                  className="flex items-center justify-between rounded-xl border border-(--color-tc-20) p-3 text-sm font-medium text-ink transition hover:bg-(--color-nc-10)"
                >
                  {row.name}
                </Link>
              ) : (
                <p
                  key={row.id}
                  className="rounded-xl border border-(--color-tc-20) p-3 text-sm font-medium text-ink"
                >
                  {row.name}
                </p>
              ),
            )}
          </div>
        ) : (
          <p className="text-sm text-(--color-tc-30)">Not on a list</p>
        )}
        {canEditLists ? (
          <PrimaryButton type="button" className="mt-4 w-auto" onClick={() => setAddOpen(true)}>
            Add to list
          </PrimaryButton>
        ) : null}
      </CrmPanel>

      {customer.notes && <CrmPanel title="Notes"><p className="text-sm text-(--color-tc-30)">{customer.notes}</p></CrmPanel>}
      <AddToListModal
        open={addOpen}
        customerIds={[customer.id]}
        onClose={() => setAddOpen(false)}
        onAdded={(result) => {
          setAddOpen(false);
          toast.success(membershipToast(result));
          void api.getCustomer(id).then(setCustomer);
        }}
      />
    </CrmPageContent>
  );
}
