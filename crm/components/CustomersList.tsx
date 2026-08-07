"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api } from "@/crm/lib/api";
import type { Customer } from "@/crm/types";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import Table, { type Column } from "@/crm/components/ui/Table";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";

export default function CustomersList({
  initialData = null,
}: {
  initialData?: { items: Customer[]; total: number } | null;
}) {
  const [customers, setCustomers] = useState<Customer[]>(() => initialData?.items ?? []);
  const [total, setTotal] = useState(() => initialData?.total ?? 0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(() => !initialData);
  const skipInitialFetch = useRef(Boolean(initialData));

  useEffect(() => {
    if (skipInitialFetch.current && !search) {
      skipInitialFetch.current = false;
      return;
    }
    skipInitialFetch.current = false;
    setLoading(true);
    const timer = setTimeout(() => {
      api
        .listCustomers(search ? { search } : undefined)
        .then((res) => {
          setCustomers(res.items);
          setTotal(res.total);
        })
        .finally(() => setLoading(false));
    }, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [search]);

  const columns: Column<Customer & Record<string, unknown>>[] = [
    {
      key: "firstName",
      header: "Name",
      render: (_, row) => (
        <div>
          <Link
            href={`/crm/customers/${row.id}`}
            className="text-sm font-medium text-ink hover:text-brand"
          >
            {row.firstName} {row.lastName}
          </Link>
          {row.email ? (
            <p className="mt-0.5 text-xs text-ink-subtle">{row.email}</p>
          ) : null}
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (value) => (
        <span className="text-sm text-ink-muted">{(value as string) || "—"}</span>
      ),
    },
    {
      key: "customerType",
      header: "Type",
      render: (value) => (
        <span className="text-sm text-ink-muted">{(value as string) || "—"}</span>
      ),
    },
    {
      key: "id",
      header: "Leads",
      align: "right",
      render: (_, row) => (
        <span className="text-sm font-medium text-ink tabular-nums">
          {row._count?.leads ?? 0}
        </span>
      ),
    },
    {
      key: "id",
      header: "Jobs",
      align: "right",
      render: (_, row) => (
        <span className="text-sm font-medium text-ink tabular-nums">
          {row._count?.jobs ?? 0}
        </span>
      ),
    },
  ];

  return (
    <CrmPageContent>
      <CrmPageHeader title="Customers" subtitle={`${total} total`} />

      {loading && customers.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <Table
          title="All customers"
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search customers…"
          columns={columns}
          data={customers as (Customer & Record<string, unknown>)[]}
          getRowKey={(r) => r.id}
          emptyMessage="No customers"
          totalCount={total}
        />
      )}
    </CrmPageContent>
  );
}
