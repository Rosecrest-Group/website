"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/crm/lib/api";
import type { CrmCompanyDetail } from "@/crm/types";
import { canAccessProspecting } from "@/crm/lib/rbac";
import { getCachedCurrentUser } from "@/crm/lib/currentUserCache";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import CrmPanel from "@/crm/components/ui/CrmPanel";
import ConfirmModal from "@/crm/components/ui/ConfirmModal";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import Table, { type Column } from "@/crm/components/ui/Table";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";

type CompanyContact = CrmCompanyDetail["contacts"][number];

export default function CompanyProfile({ id }: { id: string }) {
  const router = useRouter();
  const [company, setCompany] = useState<CrmCompanyDetail | null>(null);
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const canMutate = canAccessProspecting(getCachedCurrentUser()?.role ?? "READ_ONLY");

  const load = useCallback(() => {
    return api
      .getCompany(id)
      .then(setCompany)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function confirmDelete() {
    if (!company || selectedIds.length === 0 || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const result = await api.deleteCompanyContacts(company.id, selectedIds);
      setSelectedIds([]);
      setDeleteOpen(false);
      if (result.deleted === 1) toast.success("Contact deleted.");
      else if (result.deleted > 1) toast.success(`${result.deleted} contacts deleted.`);
      if (result.blocked.length > 0) {
        toast.error(`Left in place because they have leads or jobs: ${result.blocked.join(", ")}`);
      }
      await load();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Could not delete");
    } finally {
      setDeleting(false);
    }
  }

  if (error) {
    return (
      <CrmPageContent>
        <p className="text-sm text-orange-700">{error}</p>
        <SecondaryButton type="button" className="mt-4 w-auto" onClick={() => window.history.back()}>
          Back
        </SecondaryButton>
      </CrmPageContent>
    );
  }

  if (!company) {
    return (
      <CrmPageContent>
        <LoadingSpinner />
      </CrmPageContent>
    );
  }

  const columns: Column<CompanyContact>[] = [
    {
      key: "firstName",
      header: "Name",
      render: (_value, row) => `${row.firstName} ${row.lastName}`.trim(),
    },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone", render: (value) => (value ? String(value) : "—") },
    {
      key: "roleTitle",
      header: "Role",
      render: (value) => (value ? String(value) : "—"),
    },
  ];

  return (
    <CrmPageContent>
      <p>
        <Link href="/crm/companies" className="text-sm text-ink-muted hover:text-ink">
          ← Companies
        </Link>
      </p>
      <CrmPageHeader
        title={company.legalName}
        subtitle={[company.companyNumber, company.domain].filter(Boolean).join(" · ") || "Company"}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <CrmPanel title="Company">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-ink-muted">Company number</dt>
              <dd className="text-ink">{company.companyNumber ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Domain</dt>
              <dd className="text-ink">{company.domain ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Address</dt>
              <dd className="text-ink">{company.address ?? "—"}</dd>
            </div>
          </dl>
        </CrmPanel>
        <CrmPanel title="Lists">
          {company.lists.length === 0 ? (
            <p className="text-sm text-ink-muted">Not on a list</p>
          ) : (
            <div className="space-y-2">
              {company.lists.map((row) =>
                canMutate ? (
                  <Link
                    key={row.id}
                    href={`/crm/email-campaigns/lists/${row.id}`}
                    className="flex items-center justify-between rounded-xl border border-line p-3 text-sm font-medium text-ink transition hover:bg-sidebar"
                  >
                    {row.name}
                  </Link>
                ) : (
                  <p key={row.id} className="rounded-xl border border-line p-3 text-sm font-medium text-ink">
                    {row.name}
                  </p>
                ),
              )}
            </div>
          )}
        </CrmPanel>
      </div>
      <Table
        title={`Contacts (${company.contactCount})`}
        columns={columns}
        data={company.contacts}
        getRowKey={(row) => row.id}
        onRowClick={(row) => router.push(`/crm/customers/${row.id}`)}
        emptyMessage="No contacts at this company"
        selectable={canMutate}
        selectionSide="right"
        selectedKeys={selectedIds}
        onSelectionChange={(keys) => setSelectedIds(keys.map(String))}
        toolbarExtra={
          canMutate && selectedIds.length > 0 ? (
            <SecondaryButton
              type="button"
              className="w-auto"
              onClick={() => {
                setDeleteOpen(true);
                setDeleteError(null);
              }}
            >
              Delete ({selectedIds.length})
            </SecondaryButton>
          ) : null
        }
      />
      <ConfirmModal
        isOpen={deleteOpen}
        title={selectedIds.length === 1 ? "Delete this contact?" : `Delete ${selectedIds.length} contacts?`}
        description="They are removed from this company. Contacts that already have leads or jobs stay."
        confirmLabel="Delete"
        danger
        loading={deleting}
        error={deleteError ?? undefined}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          if (!deleting) setDeleteOpen(false);
        }}
      />
    </CrmPageContent>
  );
}
