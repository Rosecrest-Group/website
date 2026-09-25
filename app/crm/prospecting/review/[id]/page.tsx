"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/crm/lib/api";
import type { ProspectCard } from "@/crm/types/prospecting";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import CrmPanel from "@/crm/components/ui/CrmPanel";
import CurvedContainer from "@/crm/components/ui/CurvedContainer";
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
    <div className="min-w-0">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink wrap-break-word">{children}</dd>
    </div>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="border-t border-line px-5 py-4 first:border-t-0 sm:px-6">
      <h3 className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</h3>
      <div className="mt-2">{children}</div>
    </section>
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

  async function review(action: "approve" | "reject") {
    setBusy(true);
    try {
      const result = await api.reviewProspectingOpportunity(id, { action, reason: reason || undefined });
      if (action === "approve" && result.leadId) {
        router.push(`/crm/leads/${result.leadId}`);
        return;
      }
      if (action === "approve") {
        router.push("/crm/prospecting/funnels");
        return;
      }
      router.push("/crm/prospecting/review");
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
        subtitle={view ? `${view.laneLabel} · ${view.workflowLabel}` : "Public contract"}
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
  onReview: (action: "approve" | "reject") => void;
}) {
  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <aside className="space-y-6 xl:sticky xl:top-0 xl:col-start-2 xl:row-start-1">
        <CrmPanel title="Review">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill variant={view.decisionVariant} label={view.decisionLabel} />
            <StatusPill variant={view.standingVariant} label={view.standingLabel} />
          </div>
          {view.scoreDisplay ? (
            <div className="mt-3">
              <p className="text-sm font-medium tabular-nums text-ink">
                {view.scoreDisplay}
                {view.scoreBand ? ` · ${view.scoreBand}` : ""}
              </p>
              {view.scoreBreakdown ? <p className="mt-1 text-sm text-ink-muted">{view.scoreBreakdown}</p> : null}
            </div>
          ) : (
            <div className="mt-3">
              <Unknown>Score not evaluated yet.</Unknown>
            </div>
          )}
          <div className="mt-4 border-t border-line pt-4">
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
          <div className="mt-4 border-t border-line pt-4">
            {view.decisionReason ? <p className="text-sm text-ink">{view.decisionReason}</p> : <Unknown>No reason stored.</Unknown>}
            <div className="mt-4">
              <TextField
                label="Review note"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Optional reason / override note"
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <PrimaryButton
                type="button"
                className="w-full"
                disabled={busy || card.decision === "do_not_contact"}
                onClick={() => onReview("approve")}
              >
                Approve
              </PrimaryButton>
              <SecondaryButton className="w-full" disabled={busy} onClick={() => onReview("reject")}>
                Reject
              </SecondaryButton>
            </div>
          </div>
        </CrmPanel>
      </aside>

      <div className="min-w-0 space-y-6 xl:col-start-1 xl:row-start-1">
        <CrmPanel title="Identity">
          <dl className="grid gap-4 sm:grid-cols-2">
            {view.identity.map((field) => (
              <Field key={field.label} label={field.label}>
                {field.value}
              </Field>
            ))}
          </dl>
        </CrmPanel>

        <CurvedContainer>
          <div className="border-b border-line px-5 py-4 sm:px-6">
            <h2 className="text-base font-medium text-ink">Opportunity</h2>
          </div>
          <Section label="Need">
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
          </Section>
          <Section label="Offer">
            <p className="text-sm text-ink">{view.offer}</p>
          </Section>
          <Section label="Value">
            {view.value === "Unknown" ? <Unknown>Unknown</Unknown> : <p className="text-sm text-ink">{view.value}</p>}
          </Section>
          <Section label="Buyers">
            {view.buyers.length ? (
              <ul className="space-y-2 text-sm text-ink">
                {view.buyers.map((buyer) => (
                  <li key={buyer.id} className="wrap-break-word">
                    {buyer.line}
                  </li>
                ))}
              </ul>
            ) : (
              <Unknown>{view.buyersEmpty}</Unknown>
            )}
          </Section>
        </CurvedContainer>

        <CrmPanel title="Framework / procurement">
          <dl className="grid gap-4 sm:grid-cols-3">
            <Field label="Framework">{view.framework}</Field>
            <Field label="Procurement">{view.procurement}</Field>
            <Field label="Network">{view.network}</Field>
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
      </div>
    </div>
  );
}
