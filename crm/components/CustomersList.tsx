"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/crm/lib/api";
import type { Customer } from "@/crm/types";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import SearchInput from "@/crm/components/admin/SearchInput";
import Table, { type Column } from "@/crm/components/ui/Table";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";

export default function CustomersList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api
      .listCustomers(search ? { search } : undefined)
      .then((res) => {
        setCustomers(res.items);
        setTotal(res.total);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const columns: Column<Customer & Record<string, unknown>>[] = [
    {
      key: "firstName",
      header: "Name",
      render: (_, row) => (
        <Link
          href={`/crm/customers/${row.id}`}
          className="font-medium text-(--color-primary) hover:underline"
        >
          {row.firstName} {row.lastName}
        </Link>
      ),
    },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "customerType", header: "Type", className: "text-(--color-tc-30)" },
    {
      key: "id",
      header: "Leads",
      render: (_, row) => row._count?.leads ?? 0,
    },
    {
      key: "id",
      header: "Jobs",
      render: (_, row) => row._count?.jobs ?? 0,
    },
  ];

  return (
    <CrmPageContent>
      <CrmPageHeader title="Customers" subtitle={`${total} total`} />

      <div className="flex flex-wrap items-end gap-3">
        <SearchInput
          className="max-w-md flex-1 min-w-[200px]"
          placeholder="Search…"
          value={search}
          onChange={setSearch}
        />
        <SecondaryButton type="button" onClick={load}>
          Search
        </SecondaryButton>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : customers.length === 0 ? (
        <p className="text-center text-(--color-tc-30)">No customers</p>
      ) : (
        <Table
          columns={columns}
          data={customers as (Customer & Record<string, unknown>)[]}
          getRowKey={(r) => r.id}
        />
      )}
    </CrmPageContent>
  );
}
