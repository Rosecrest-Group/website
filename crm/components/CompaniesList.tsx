"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/crm/lib/api";
import type { CrmCompanyRow } from "@/crm/types";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import Table, { type Column } from "@/crm/components/ui/Table";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";

export default function CompaniesList() {
  const router = useRouter();
  const [rows, setRows] = useState<CrmCompanyRow[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [loadedSearch, setLoadedSearch] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params: Record<string, string> = {};
      if (search.trim()) params.search = search.trim();
      api
        .listCompanies(Object.keys(params).length ? params : undefined)
        .then((res) => {
          setRows(res.items);
          setTotal(res.total);
          setError(null);
        })
        .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load companies"))
        .finally(() => setLoadedSearch(search));
    }, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [search]);

  const loading = loadedSearch !== search;

  const columns: Column<CrmCompanyRow>[] = [
    {
      key: "legalName",
      header: "Company",
      render: (value) => <span className="text-sm font-medium text-ink">{String(value)}</span>,
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
    {
      key: "contactCount",
      header: "Contacts",
      render: (value) => String(value ?? 0),
    },
  ];

  return (
    <CrmPageContent>
      <CrmPageHeader title="Companies" subtitle={`${total} total`} />
      {error ? <p className="text-sm text-orange-700">{error}</p> : null}
      {loading && rows.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <Table
          title="All companies"
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search companies…"
          columns={columns}
          data={rows}
          getRowKey={(row) => row.id}
          onRowClick={(row) => router.push(`/crm/companies/${row.id}`)}
          emptyMessage="No companies yet. Add firms from Find Firms."
          totalCount={total}
        />
      )}
    </CrmPageContent>
  );
}
