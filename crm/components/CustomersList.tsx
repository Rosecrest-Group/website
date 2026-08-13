"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy } from "lucide-react";
import { api } from "@/crm/lib/api";
import { getListPageCache, setListPageCache } from "@/crm/lib/listPageCache";
import type { Customer } from "@/crm/types";
import { LEAD_SOURCES } from "@/crm/lib/constants";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import Table, { type Column } from "@/crm/components/ui/Table";
import SelectField from "@/crm/components/ui/SelectField";
import StatusPill, { leadStageToPillVariant } from "@/crm/components/ui/StatusPill";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";

function CopyValue({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy(event: MouseEvent) {
    event.stopPropagation();
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <span className="truncate text-sm text-ink-muted">{value}</span>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-md p-1 text-ink-muted hover:bg-sidebar hover:text-ink"
        aria-label={`Copy ${value}`}
      >
        {copied ? <Check className="size-3.5 text-brand" /> : <Copy className="size-3.5" />}
      </button>
    </span>
  );
}

function contactStatus(row: Customer): { label: string; stage: string | null } {
  const stage = row.latestLead?.stage ?? null;
  if (!stage) return { label: "—", stage: null };
  if (stage === "CONVERTED") return { label: "Won", stage };
  if (stage === "LOST") return { label: "Lost", stage };
  return { label: "Active", stage };
}

export default function CustomersList({
  initialData = null,
}: {
  initialData?: { items: Customer[]; total: number } | null;
}) {
  const router = useRouter();
  const seed = initialData ?? getListPageCache<{ items: Customer[]; total: number }>("customers:default");
  const [customers, setCustomers] = useState<Customer[]>(() => seed?.items ?? []);
  const [total, setTotal] = useState(() => seed?.total ?? 0);
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("");
  const [leadStatus, setLeadStatus] = useState("");
  const [loading, setLoading] = useState(() => !seed);
  const skipInitialFetch = useRef(Boolean(seed));

  useEffect(() => {
    if (skipInitialFetch.current && !search && !source && !leadStatus) {
      skipInitialFetch.current = false;
      return;
    }
    skipInitialFetch.current = false;
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (source) params.source = source;
    if (leadStatus) params.leadStatus = leadStatus;
    const timer = setTimeout(() => {
      api
        .listCustomers(Object.keys(params).length ? params : undefined)
        .then((res) => {
          setCustomers(res.items);
          setTotal(res.total);
          if (!search && !source && !leadStatus) setListPageCache("customers:default", res);
        })
        .finally(() => setLoading(false));
    }, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [search, source, leadStatus]);

  const columns: Column<Customer & Record<string, unknown>>[] = [
    {
      key: "firstName",
      header: "Name",
      render: (_, row) => (
        <span className="text-sm font-medium text-ink">
          {row.firstName} {row.lastName}
        </span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (value) =>
        value ? <CopyValue value={value as string} /> : <span className="text-sm text-ink-muted">—</span>,
    },
    {
      key: "phone",
      header: "Phone",
      render: (value) =>
        value ? <CopyValue value={value as string} /> : <span className="text-sm text-ink-muted">—</span>,
    },
    {
      key: "latestLead",
      header: "Source",
      render: (_, row) => (
        <span className="text-sm text-ink-muted">{row.latestLead?.source ?? "—"}</span>
      ),
    },
    {
      key: "stage",
      header: "Status",
      render: (_, row) => {
        const status = contactStatus(row);
        if (!status.stage) return <span className="text-sm text-ink-muted">—</span>;
        return (
          <StatusPill
            variant={leadStageToPillVariant(status.stage)}
            label={status.label}
          />
        );
      },
    },
  ];

  return (
    <CrmPageContent>
      <CrmPageHeader title="Contacts" subtitle={`${total} total`} />

      {loading && customers.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <Table
          title="All contacts"
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search contacts…"
          toolbarExtra={
            <div className="flex flex-wrap items-center gap-2">
              <SelectField
                variant="filter"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              >
                <option value="">All sources</option>
                {LEAD_SOURCES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </SelectField>
              <SelectField
                variant="filter"
                value={leadStatus}
                onChange={(e) => setLeadStatus(e.target.value)}
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </SelectField>
            </div>
          }
          columns={columns}
          data={customers as (Customer & Record<string, unknown>)[]}
          getRowKey={(r) => r.id}
          onRowClick={(row) => {
            const leadId = row.latestLead?.id;
            router.push(leadId ? `/crm/leads/${leadId}` : `/crm/customers/${row.id}`);
          }}
          emptyMessage="No contacts"
          totalCount={total}
        />
      )}
    </CrmPageContent>
  );
}
