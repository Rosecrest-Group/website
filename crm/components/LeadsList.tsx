"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/crm/lib/api";
import type { Lead, LeadStage } from "@/crm/types";
import { LEAD_STAGE_LABELS, SURVEY_LEVEL_LABELS } from "@/crm/lib/constants";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import SearchInput from "@/crm/components/admin/SearchInput";
import SelectField from "@/crm/components/ui/SelectField";
import Table, { type Column } from "@/crm/components/ui/Table";
import StatusPill, { leadStageToPillVariant } from "@/crm/components/ui/StatusPill";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";

const STAGES: LeadStage[] = [
  "NEW",
  "QUOTE_SENT",
  "FOLLOWING_UP",
  "AWAITING_PAYMENT",
  "PAUSED",
  "CONVERTED",
  "LOST",
];

export default function LeadsList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (stage) params.stage = stage;
    api
      .listLeads(params)
      .then((res) => {
        setLeads(res.items);
        setTotal(res.total);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [stage]);

  const columns: Column<Lead & Record<string, unknown>>[] = [
    {
      key: "customerName",
      header: "Customer",
      render: (_, row) => (
        <Link
          href={`/crm/leads/${row.id}`}
          className="font-medium text-(--color-primary) hover:underline"
        >
          {row.customerName ??
            (row.customer ? `${row.customer.firstName} ${row.customer.lastName}` : "—")}
        </Link>
      ),
    },
    {
      key: "propertyPostcode",
      header: "Property",
      render: (value) => <span className="text-(--color-tc-30)">{(value as string) || "—"}</span>,
    },
    {
      key: "stage",
      header: "Stage",
      render: (value) => (
        <StatusPill
          variant={leadStageToPillVariant(value as string)}
          label={LEAD_STAGE_LABELS[value as string] ?? (value as string)}
        />
      ),
    },
    {
      key: "surveyLevel",
      header: "Survey",
      render: (value) =>
        value ? SURVEY_LEVEL_LABELS[value as string] ?? (value as string) : "—",
    },
    { key: "source", header: "Source" },
    {
      key: "assignedTo",
      header: "Owner",
      render: (value) => {
        const a = value as Lead["assignedTo"];
        return a?.fullName ?? "—";
      },
    },
  ];

  return (
    <CrmPageContent>
      <CrmPageHeader
        title="Leads"
        subtitle={`${total} total`}
        actions={<PrimaryButton href="/crm/leads/new">New lead</PrimaryButton>}
      />

      <div className="flex flex-wrap items-end gap-3">
        <SearchInput
          className="max-w-md flex-1 min-w-[200px]"
          placeholder="Search name, email, address…"
          value={search}
          onChange={setSearch}
        />
        <SelectField value={stage} onChange={(e) => setStage(e.target.value)}>
          <option value="">All stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {LEAD_STAGE_LABELS[s]}
            </option>
          ))}
        </SelectField>
        <SecondaryButton type="button" onClick={load}>
          Search
        </SecondaryButton>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <LoadingSpinner />
      ) : leads.length === 0 ? (
        <p className="text-center text-(--color-tc-30)">No leads found</p>
      ) : (
        <Table columns={columns} data={leads as (Lead & Record<string, unknown>)[]} getRowKey={(r) => r.id} />
      )}
    </CrmPageContent>
  );
}
