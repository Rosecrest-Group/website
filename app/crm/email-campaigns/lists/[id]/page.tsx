"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/crm/lib/api";
import type { ContactListDetail, ContactListMemberRow } from "@/crm/types/prospecting";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import TextField from "@/crm/components/ui/TextField";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import Table, { type Column } from "@/crm/components/ui/Table";
import ConfirmModal from "@/crm/components/ui/ConfirmModal";

export default function ContactListDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const [list, setList] = useState<ContactListDetail | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [removing, setRemoving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [cloning, setCloning] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const detail = await api.getContactList(id, { page, limit: 50 });
    setList(detail);
    setName(detail.name);
  }, [id, page]);

  useEffect(() => {
    setLoading(true);
    void load()
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load list"))
      .finally(() => setLoading(false));
  }, [load]);

  async function rename() {
    if (!list || name.trim() === list.name || renaming) return;
    setRenaming(true);
    setRenameError(null);
    try {
      const updated = await api.updateContactList(list.id, name.trim());
      setList({ ...list, name: updated.name, updatedAt: updated.updatedAt });
      setName(updated.name);
      toast.success("List renamed.");
    } catch (err) {
      setRenameError(err instanceof Error ? err.message : "Could not rename");
    } finally {
      setRenaming(false);
    }
  }

  async function removeSelected() {
    if (!list || selectedIds.length === 0 || removing) return;
    setRemoving(true);
    try {
      await api.removeContactListMembers(list.id, selectedIds);
      setSelectedIds([]);
      toast.success("Removed from list.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove");
    } finally {
      setRemoving(false);
    }
  }

  async function exportCsv() {
    if (!list || exporting) return;
    setExporting(true);
    try {
      const file = await api.exportContactList(list.id);
      const blob = new Blob([file.csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.filename;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("List exported.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not export");
    } finally {
      setExporting(false);
    }
  }

  async function cloneList() {
    if (!list || cloning) return;
    setCloning(true);
    try {
      const cloned = await api.cloneContactList(list.id);
      toast.success(`${cloned.name} created.`);
      router.push(`/crm/email-campaigns/lists/${cloned.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not clone");
    } finally {
      setCloning(false);
    }
  }

  async function confirmDelete() {
    if (!list || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.deleteContactList(list.id);
      toast.success("List deleted. Companies were kept.");
      router.push("/crm/email-campaigns/lists");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Could not delete");
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<ContactListMemberRow>[] = [
    {
      key: "name",
      header: "Company",
      render: (_value, row) => row.name,
    },
    {
      key: "contactCount",
      header: "Contacts",
      render: (value) => String(value ?? 0),
    },
    {
      key: "companyNumber",
      header: "Company number",
      render: (value) => (value ? String(value) : "—"),
    },
    {
      key: "domain",
      header: "Domain",
      render: (value) => (value ? String(value) : "—"),
    },
  ];

  if (loading && !list) {
    return (
      <CrmPageContent>
        <LoadingSpinner />
      </CrmPageContent>
    );
  }

  if (error && !list) {
    return (
      <CrmPageContent>
        <p className="text-sm text-orange-700">{error}</p>
      </CrmPageContent>
    );
  }

  if (!list) return null;

  const dirty = name.trim() !== list.name && name.trim().length > 0;

  return (
    <CrmPageContent>
      <p>
        <Link href="/crm/email-campaigns/lists" className="text-sm text-ink-muted hover:text-ink">
          ← Lists
        </Link>
      </p>
      <CrmPageHeader
        title={list.name}
        subtitle={`${list.memberCount} compan${list.memberCount === 1 ? "y" : "ies"}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <SecondaryButton
              type="button"
              className="w-auto"
              onClick={() => router.push(`/crm/email-campaigns/lists/${list.id}/import`)}
            >
              Import
            </SecondaryButton>
            <SecondaryButton type="button" className="w-auto" disabled={exporting} onClick={() => void exportCsv()}>
              {exporting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {exporting ? "Exporting…" : "Export"}
            </SecondaryButton>
            <SecondaryButton type="button" className="w-auto" disabled={cloning} onClick={() => void cloneList()}>
              {cloning ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {cloning ? "Cloning…" : "Clone"}
            </SecondaryButton>
            <SecondaryButton type="button" className="w-auto" onClick={() => { setDeleteOpen(true); setDeleteError(null); }}>
              Delete
            </SecondaryButton>
          </div>
        }
      />
      {error ? <p className="text-sm text-orange-700">{error}</p> : null}
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1">
          <TextField
            label="List name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={renaming}
          />
        </div>
        <PrimaryButton type="button" className="w-auto" disabled={!dirty || renaming} onClick={() => void rename()}>
          {renaming ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {renaming ? "Saving…" : "Save name"}
        </PrimaryButton>
      </div>
      {renameError ? <p className="text-sm text-orange-700">{renameError}</p> : null}
      <Table
        title="Companies"
        columns={columns}
        data={list.members}
        totalCount={list.total}
        page={page}
        pageSize={50}
        onPageChange={setPage}
        loading={loading}
        selectable
        selectedKeys={selectedIds}
        onSelectionChange={(keys) => setSelectedIds(keys.map(String))}
        emptyMessage="No companies in this list. Import a spreadsheet or add firms from Find Firms."
        toolbarExtra={
          selectedIds.length > 0 ? (
            <PrimaryButton type="button" className="w-auto" disabled={removing} onClick={() => void removeSelected()}>
              {removing ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {removing ? "Removing…" : `Remove (${selectedIds.length})`}
            </PrimaryButton>
          ) : null
        }
        getRowKey={(row) => row.id}
        onRowClick={(row) => {
          if (row.accountId) router.push(`/crm/companies/${row.accountId}`);
          else if (row.customerId) router.push(`/crm/customers/${row.customerId}`);
        }}
      />
      <ConfirmModal
        isOpen={deleteOpen}
        title="Delete this list?"
        description="Companies stay in the CRM. Only this list name and its memberships are removed."
        confirmLabel="Delete list"
        danger
        loading={deleting}
        error={deleteError ?? undefined}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteOpen(false)}
      />
    </CrmPageContent>
  );
}
