"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/crm/lib/api";
import type { ProspectingStatus, ProspectAccountRow } from "@/crm/types/prospecting";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import CrmPanel from "@/crm/components/ui/CrmPanel";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import TextField from "@/crm/components/ui/TextField";
import SelectField from "@/crm/components/ui/SelectField";
import StatusPill from "@/crm/components/ui/StatusPill";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import Table, { type Column } from "@/crm/components/ui/Table";
import { standingVariant } from "@/crm/components/prospecting/ProspectingListClient";

const LANES = [
  { id: "", label: "Any lane" },
  { id: "estate_agency_sales", label: "Estate agency — sales" },
  { id: "estate_agency_lettings", label: "Estate agency — lettings" },
  { id: "public_social_housing", label: "Public / social housing" },
  { id: "legal_expert", label: "Legal / expert" },
  { id: "development_party_wall", label: "Development / party wall" },
  { id: "mortgage_lending", label: "Mortgage lending" },
  { id: "property_operators", label: "Property operators" },
];

export default function FindFirmsPage() {
  const [status, setStatus] = useState<ProspectingStatus | null>(null);
  const [query, setQuery] = useState("");
  const [lane, setLane] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [accounts, setAccounts] = useState<ProspectAccountRow[]>([]);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setStatus(await api.getProspectingStatus());
    const listed = await api.listProspectingAccounts({ search: query || undefined });
    setAccounts(listed.items);
    setTotal(listed.total);
  }, [query]);

  useEffect(() => {
    void load().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Could not load prospecting");
    });
  }, [load]);

  async function startRun() {
    setStarting(true);
    try {
      await api.startProspectingRun("manual", { query: query || undefined, lane: lane || undefined });
      await load();
      window.setTimeout(() => {
        void load().catch(() => undefined);
      }, 8000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not queue a run");
    } finally {
      setStarting(false);
    }
  }

  const columns: Column<ProspectAccountRow>[] = [
    { key: "legalName", header: "Organisation" },
    { key: "companyNumber", header: "Company no." },
    { key: "lane", header: "Lane" },
    {
      key: "standingGrade",
      header: "Standing",
      render: (value) => (
        <StatusPill variant={standingVariant(String(value ?? "unknown"))} label={String(value ?? "unknown")} />
      ),
    },
  ];

  return (
    <CrmPageContent>
      <CrmPageHeader
        title="Find Firms"
        subtitle="Search UK organisations by name or company number. A run writes Companies House facts, Gazette standing, and a review card."
        actions={
          <PrimaryButton type="button" onClick={() => void startRun()} disabled={starting}>
            {starting ? "Queuing…" : "Queue a run"}
          </PrimaryButton>
        }
      />
      {error ? <p className="text-sm text-ink-muted">{error}</p> : null}
      {!status && !error ? <LoadingSpinner /> : null}
      {status ? (
        <CrmPanel title="Pipeline">
          <div className="flex flex-wrap items-center gap-3 text-sm text-ink">
            <StatusPill variant={status.ready ? "completed" : "pending"} label={status.ready ? "Ready" : "Seeding"} />
            <span className="text-ink-muted">
              {status.sources.length} source{status.sources.length === 1 ? "" : "s"} configured
            </span>
            {status.latestRun ? (
              <span className="text-ink-muted">
                Last run {status.latestRun.kind} · {status.latestRun.status}
              </span>
            ) : (
              <span className="text-ink-muted">No runs yet</span>
            )}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <TextField
              label="Name or company number"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Rosecrest or 12345678"
            />
            <SelectField label="Lane" value={lane} onChange={(e) => setLane(e.target.value)}>
              {LANES.map((item) => (
                <option key={item.id || "any"} value={item.id}>
                  {item.label}
                </option>
              ))}
            </SelectField>
          </div>
        </CrmPanel>
      ) : null}
      <Table
        title="Accounts"
        columns={columns}
        data={accounts}
        totalCount={total}
        emptyMessage="No organisations yet. Enter a search and queue a run."
        getRowKey={(row) => row.id}
      />
    </CrmPageContent>
  );
}
