"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/crm/lib/api";
import type { ProspectCard } from "@/crm/types/prospecting";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import CrmPanel from "@/crm/components/ui/CrmPanel";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import StatusPill from "@/crm/components/ui/StatusPill";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import TextField from "@/crm/components/ui/TextField";
import Table, { type Column } from "@/crm/components/ui/Table";
import { toSalesCard, type SalesCardView, type SalesGateRow } from "./salesCardView";

function Unknown({ children = "Unknown" }: { children?: ReactNode }) {
  return <p className="text-sm text-ink-muted">{children}</p>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink">{children}</dd>
    </div>
  );
}

const gateColumns: Column<SalesGateRow>[] = [
  { key: "gateLabel", header: "Gate", width: "28%" },
  {
    key: "resultLabel",
    header: "Result",
    width: "18%",
    render: (_value, row) => <StatusPill variant={row.resultVariant} label={row.resultLabel} />,
  },
  { key: "reason", header: "Reason" },
];

export default function ProspectingReviewDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const [card, setCard] = useState<ProspectCard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setCard(await api.getProspectingCard(id));
  }

  useEffect(() => {
    void load().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Could not load card");
    });
  }, [id]);

  async function review(action: "approve" | "reject" | "escalate" | "override") {
    setBusy(true);
    try {
      await api.reviewProspectingOpportunity(id, { action, reason: reason || undefined });
      await load();
      if (action === "approve") router.push("/crm/prospecting/funnels");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Review failed");
    } finally {
      setBusy(false);
    }
  }

  if (!card && !error) return <LoadingSpinner />;

  const view = card ? toSalesCard(card) : null;

  return (
    <CrmPageContent>
      <CrmPageHeader
        title={view?.title ?? "Prospect card"}
        subtitle={view ? `${view.laneLabel} · ${view.workflowLabel}` : "Sales card"}
        actions={
          view ? (
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill variant={view.decisionVariant} label={view.decisionLabel} />
              <StatusPill variant={view.standingVariant} label={view.standingLabel} />
              {view.scoreDisplay ? (
                <span className="text-sm tabular-nums text-ink">
                  {view.scoreDisplay}
                  {view.scoreBand ? ` · ${view.scoreBand}` : ""}
                </span>
              ) : null}
            </div>
          ) : undefined
        }
      />
      {error ? <p className="text-sm text-ink-muted">{error}</p> : null}
      {view && card ? (
        <SalesCardBody view={view} card={card} reason={reason} setReason={setReason} busy={busy} onReview={review} />
      ) : null}
    </CrmPageContent>
  );
}

function SalesCardBody({
  view,
  card,
  reason,
  setReason,
  busy,
  onReview,
}: {
  view: SalesCardView;
  card: ProspectCard;
  reason: string;
  setReason: (value: string) => void;
  busy: boolean;
  onReview: (action: "approve" | "reject" | "escalate" | "override") => void;
}) {
  return (
    <div className="space-y-6">
      <CrmPanel title="Identity">
        <dl className="grid gap-4 sm:grid-cols-2">
          {view.identity.map((field) => (
            <Field key={field.label} label={field.label}>
              {field.value}
            </Field>
          ))}
        </dl>
      </CrmPanel>

      <div>
        <h2 className="mb-3 text-base font-medium text-ink">Gates</h2>
        <Table
          columns={gateColumns}
          data={view.gates}
          compact
          fixedLayout
          getRowKey={(row) => row.gate}
          emptyMessage="No gates evaluated yet."
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CrmPanel title="Need" className="h-full">
          {view.needKind === "signals" ? (
            <ol className="list-decimal space-y-1 pl-5 text-sm text-ink">
              {view.needLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
          ) : view.needKind === "search-only" ? (
            <Unknown>{view.needLines[0]}</Unknown>
          ) : (
            <Unknown>No buying signal this pass.</Unknown>
          )}
        </CrmPanel>

        <CrmPanel title="Offer" className="h-full">
          <p className="text-sm text-ink">{view.offer}</p>
        </CrmPanel>

        <CrmPanel title="Buyers" className="h-full">
          {view.buyers.length ? (
            <ul className="space-y-2 text-sm text-ink">
              {view.buyers.map((buyer) => (
                <li key={buyer.id}>{buyer.line}</li>
              ))}
            </ul>
          ) : (
            <Unknown>{view.buyersEmpty}</Unknown>
          )}
        </CrmPanel>

        <CrmPanel title="Value" className="h-full">
          {view.value === "Unknown" ? <Unknown>Unknown</Unknown> : <p className="text-sm text-ink">{view.value}</p>}
        </CrmPanel>
      </div>

      <CrmPanel title="Framework / procurement">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Field label="Framework">{view.framework}</Field>
          <Field label="Procurement">{view.procurement}</Field>
          <Field label="Network">{view.network}</Field>
        </dl>
      </CrmPanel>

      <div className="grid gap-6 lg:grid-cols-2">
        <CrmPanel title="Standing" className="h-full">
          <div className="space-y-3">
            <StatusPill variant={view.standingVariant} label={view.standingLabel} />
            {view.standingLines.length ? (
              <ul className="space-y-1.5 text-sm text-ink">
                {view.standingLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : (
              <Unknown>No standing checks stored yet.</Unknown>
            )}
          </div>
        </CrmPanel>

        <CrmPanel title="Score" className="h-full">
          {view.scoreDisplay ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-ink">
                {view.scoreDisplay}
                {view.scoreBand ? ` · ${view.scoreBand}` : ""}
              </p>
              {view.scoreBreakdown ? <p className="text-sm text-ink-muted">{view.scoreBreakdown}</p> : null}
            </div>
          ) : (
            <Unknown>Score not evaluated yet.</Unknown>
          )}
        </CrmPanel>
      </div>

      <CrmPanel title="Decision">
        <div className="flex flex-wrap items-center gap-3">
          <StatusPill variant={view.decisionVariant} label={view.decisionLabel} />
        </div>
        {view.decisionReason ? <p className="mt-3 text-sm text-ink">{view.decisionReason}</p> : <Unknown>No reason stored.</Unknown>}
        <div className="mt-4 max-w-md">
          <TextField
            label="Review note"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Optional reason / override note"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <PrimaryButton type="button" disabled={busy || card.decision === "do_not_contact"} onClick={() => onReview("approve")}>
            Approve & route
          </PrimaryButton>
          <SecondaryButton disabled={busy} onClick={() => onReview("escalate")}>
            Escalate
          </SecondaryButton>
          <SecondaryButton disabled={busy} onClick={() => onReview("override")}>
            Override
          </SecondaryButton>
          <SecondaryButton disabled={busy} onClick={() => onReview("reject")}>
            Reject
          </SecondaryButton>
        </div>
      </CrmPanel>
    </div>
  );
}
