"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/crm/lib/api";
import type { ContactListRow } from "@/crm/types/prospecting";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import TextField from "@/crm/components/ui/TextField";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import Table, { type Column } from "@/crm/components/ui/Table";
import CrmModal from "@/crm/components/ui/CrmModal";

export default function ContactListsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ContactListRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const listed = await api.listContactLists({ page, limit: 50 });
    setRows(listed.items);
    setTotal(listed.total);
  }, [page]);

  useEffect(() => {
    setLoading(true);
    void load()
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load lists"))
      .finally(() => setLoading(false));
  }, [load]);

  async function create() {
    if (!name.trim() || creating) return;
    setCreating(true);
    setCreateError(null);
    try {
      const list = await api.createContactList(name.trim());
      setCreateOpen(false);
      setName("");
      toast.success(`${list.name} created.`);
      router.push(`/crm/email-campaigns/lists/${list.id}`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Could not create list");
    } finally {
      setCreating(false);
    }
  }

  const columns: Column<ContactListRow>[] = [
    { key: "name", header: "List" },
    {
      key: "memberCount",
      header: "Companies",
      render: (value) => String(value ?? 0),
    },
    {
      key: "updatedAt",
      header: "Updated",
      render: (value) => new Date(String(value)).toLocaleString("en-GB"),
    },
  ];

  return (
    <CrmPageContent>
      <CrmPageHeader
        title="Lists"
        subtitle="Named groups of companies from Find Firms. People live on the company."
        actions={
          <PrimaryButton type="button" onClick={() => { setCreateOpen(true); setCreateError(null); setName(""); }}>
            Create list
          </PrimaryButton>
        }
      />
      {error ? <p className="text-sm text-orange-700">{error}</p> : null}
      {loading && !rows.length ? (
        <LoadingSpinner />
      ) : (
        <Table
          title="Lists"
          columns={columns}
          data={rows}
          totalCount={total}
          page={page}
          pageSize={50}
          onPageChange={setPage}
          loading={loading}
          emptyMessage="No lists yet. Create one, or add firms from Find Firms."
          getRowKey={(row) => row.id}
          onRowClick={(row) => router.push(`/crm/email-campaigns/lists/${row.id}`)}
        />
      )}
      <CrmModal
        isOpen={createOpen}
        title="Create list"
        onClose={creating ? () => undefined : () => setCreateOpen(false)}
        closeDisabled={creating}
        footer={
          <>
            <SecondaryButton type="button" className="w-auto" disabled={creating} onClick={() => setCreateOpen(false)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="button" className="w-auto min-w-32" disabled={!name.trim() || creating} onClick={() => void create()}>
              {creating ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {creating ? "Creating…" : "Create list"}
            </PrimaryButton>
          </>
        }
      >
        <TextField
          label="List name"
          value={name}
          disabled={creating}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Croydon solicitors"
        />
        {createError ? <p className="mt-3 text-sm text-orange-700">{createError}</p> : null}
      </CrmModal>
    </CrmPageContent>
  );
}
