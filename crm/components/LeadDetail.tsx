"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/crm/lib/api";
import type { CadenceStep, LeadDetail as LeadDetailType } from "@/crm/types";
import { LEAD_STAGE_LABELS, LOST_REASON_OPTIONS, SURVEY_LEVEL_LABELS } from "@/crm/lib/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ArrowLeft, ChevronRight } from "lucide-react";
import PhoneButton from "@/crm/components/PhoneButton";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPanel from "@/crm/components/ui/CrmPanel";
import CurvedContainer from "@/crm/components/ui/CurvedContainer";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import StatusPill, { leadStageToPillVariant } from "@/crm/components/ui/StatusPill";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import TextField from "@/crm/components/ui/TextField";
import SelectField from "@/crm/components/ui/SelectField";
import ConfirmModal from "@/crm/components/ui/ConfirmModal";
import InternalConversationPanel, { prefetchInternalThread } from "@/crm/components/InternalConversationPanel";
import LeadMessageThread from "@/crm/components/LeadMessageThread";
import ActivityFeed from "@/crm/components/ActivityFeed";
import LeadTags from "@/crm/components/LeadTags";
import { useCrmTopBar } from "@/crm/lib/crmTopBarContext";

function formatRelative(dateStr: string) {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function nextWorkflowStepText(lead: LeadDetailType, currentStep?: CadenceStep): string {
  if (lead.cadenceStopped || lead.stage === "LOST" || lead.stage === "CONVERTED") {
    return "No further messages scheduled";
  }
  if (currentStep?.name) return currentStep.name;
  if (lead.cadenceRun?.nextRunAt) return "Scheduled follow-up";
  return "Workflow will send the next message on schedule";
}

export default function LeadDetail({
  id,
  embedded = false,
  onDeleted,
}: {
  id: string;
  embedded?: boolean;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const { setLeft: setTopBar } = useCrmTopBar();
  const [lead, setLead] = useState<LeadDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("messages");
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showMarkLost, setShowMarkLost] = useState(false);
  const [lostReason, setLostReason] = useState(LOST_REASON_OPTIONS[0]?.value ?? "OTHER");
  const [lostReasonNote, setLostReasonNote] = useState("");
  const [markingLost, setMarkingLost] = useState(false);
  const [stoppingAutomation, setStoppingAutomation] = useState(false);
  const [moveToPaidConfirmOpen, setMoveToPaidConfirmOpen] = useState(false);
  const [movingToPaid, setMovingToPaid] = useState(false);
  const [moveToPaidError, setMoveToPaidError] = useState<string | null>(null);

  function reload(options?: { silent?: boolean }) {
    if (!options?.silent) setLoading(true);
    api
      .getLead(id)
      .then((l) => {
        setLead(l);
        prefetchInternalThread({ leadId: l.id });
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => {
        if (!options?.silent) setLoading(false);
      });
  }

  useEffect(() => {
    reload();
  }, [id]);

  useEffect(() => {
    if (embedded) return;
    const customer = lead?.customer;
    const name = customer ? `${customer.firstName} ${customer.lastName}` : undefined;
    setTopBar(<LeadDetailBreadcrumb name={name} />);
    return () => setTopBar(null);
  }, [embedded, lead, setTopBar]);

  async function stopAutomation() {
    setStoppingAutomation(true);
    try {
      await api.stopCadence(id);
      reload({ silent: true });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setStoppingAutomation(false);
    }
  }

  async function markLost() {
    setMarkingLost(true);
    try {
      await api.markLeadLost(id, lostReason, lostReasonNote.trim() || undefined);
      setShowMarkLost(false);
      setLostReasonNote("");
      reload({ silent: true });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setMarkingLost(false);
    }
  }
  async function convert() {
    if (movingToPaid || !lead || lead.stage === "CONVERTED") return;
    const amount = lead.quotedAmount ?? 0;
    if (!amount || amount <= 0) {
      setMoveToPaidError("Set a quoted amount before moving to paid.");
      return;
    }
    setMovingToPaid(true);
    setMoveToPaidError(null);
    try {
      const result = await api.convertLead(id, amount);
      setMoveToPaidConfirmOpen(false);
      router.push(`/crm/jobs/${result.job.id}`);
    } catch (e) {
      setMoveToPaidError(e instanceof Error ? e.message : "Failed to move to paid");
    } finally {
      setMovingToPaid(false);
    }
  }

  async function deleteLead() {
    setDeleting(true);
    try {
      await api.deleteLead(id);
      if (embedded) {
        onDeleted?.();
      } else {
        router.push("/crm/leads");
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete lead");
      setDeleting(false);
    }
  }

  const currentStep = lead?.journey.find((s) => s.status === "current");
  const nextRun = lead?.cadenceRun?.nextRunAt;
  const canStopAutomation =
    lead &&
    lead.stage !== "CONVERTED" &&
    lead.stage !== "LOST" &&
    !lead.cadenceStopped;
  const canMarkLost = lead && lead.stage !== "CONVERTED" && lead.stage !== "LOST";

  const contentWrapperClass = embedded ? "space-y-6" : "";

  if (loading) {
    return embedded ? (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    ) : (
      <CrmPageContent>
        <LoadingSpinner />
      </CrmPageContent>
    );
  }

  if (error || !lead) {
    return embedded ? (
      <div>
        <p className="text-red-600">{error || "Lead not found"}</p>
      </div>
    ) : (
      <CrmPageContent>
        <p className="text-red-600">{error || "Lead not found"}</p>
        <SecondaryButton type="button" className="mt-4 w-auto" onClick={() => router.push("/crm/leads")}>
          Back to leads
        </SecondaryButton>
      </CrmPageContent>
    );
  }

  const customer = lead.customer;
  const initials = customer
    ? `${customer.firstName[0]}${customer.lastName[0]}`
    : "??";

  const possibleDuplicates = lead.possibleDuplicateLeads ?? [];

  const detailBody = (
    <>
      {possibleDuplicates.length > 0 && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium">
            Possible duplicate — this phone number is shared with{" "}
            {possibleDuplicates.length === 1 ? "another lead" : `${possibleDuplicates.length} other leads`}
          </p>
          <ul className="mt-2 space-y-1.5">
            {possibleDuplicates.map((related) => (
              <li key={related.leadId} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>
                  {related.customerName} · {related.customerEmail} · {related.propertyAddress},{" "}
                  {related.propertyPostcode}
                </span>
                <Link
                  href={`/crm/leads/${related.leadId}`}
                  className="font-medium underline underline-offset-2"
                >
                  Open lead
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs opacity-80">
            The email addresses differ, so these were kept separate. Mark one as lost if it is a duplicate.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="space-y-6">
          <CurvedContainer className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3.5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-brand-light/35 bg-brand-muted text-sm font-semibold text-brand">
                  {initials}
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">
                    Lead
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <h1 className="text-lg font-medium tracking-tight break-words text-ink">
                      {customer ? `${customer.firstName} ${customer.lastName}` : "Lead"}
                    </h1>
                    <StatusPill
                      variant={leadStageToPillVariant(lead.stage)}
                      label={LEAD_STAGE_LABELS[lead.stage] ?? lead.stage}
                    />
                  </div>
                </div>
              </div>

              {customer?.phone && (
                <PhoneButton
                  number={customer.phone}
                  className="shrink-0"
                  context={{
                    leadId: lead.id,
                    customerName: customer
                      ? `${customer.firstName} ${customer.lastName}`
                      : undefined,
                  }}
                />
              )}
            </div>

            <div className="mt-2 flex items-center justify-between gap-3 pl-[3.375rem]">
              <p className="font-mono text-xs text-ink-subtle break-all">
                {lead.id}
              </p>
              <p className="text-xs font-medium text-brand">{lead.source}</p>
            </div>

            <div className="mt-4 grid gap-x-6 gap-y-3 border-t border-line pt-4 sm:grid-cols-2">
              {customer?.email && (
                <div className="min-w-0 sm:col-span-2">
                  <p className="text-xs text-ink-muted">Email</p>
                  <p className="mt-0.5 text-sm font-medium break-all text-ink" title={customer.email}>
                    {customer.email}
                  </p>
                </div>
              )}
              {customer?.phone && (
                <div className="min-w-0">
                  <p className="text-xs text-ink-muted">Phone</p>
                  <p className="mt-0.5 text-sm font-medium text-ink">{customer.phone}</p>
                </div>
              )}
              <div className="min-w-0 sm:col-span-2">
                <p className="text-xs text-ink-muted">Property</p>
                <p className="mt-0.5 text-sm font-medium break-words text-ink">
                  {lead.propertyAddress}, {lead.propertyPostcode}
                </p>
              </div>
            </div>

            {lead.stage !== "CONVERTED" && (
              <div className="mt-4 border-t border-line pt-4">
                <PrimaryButton
                  type="button"
                  className="!h-auto w-full !px-4 !py-1.5"
                  disabled={movingToPaid}
                  onClick={() => {
                    setMoveToPaidError(null);
                    setMoveToPaidConfirmOpen(true);
                  }}
                >
                  {movingToPaid ? "Moving…" : "Move to paid"}
                </PrimaryButton>
              </div>
            )}
          </CurvedContainer>

          <div className="grid gap-px overflow-hidden rounded-xl border border-(--color-tc-20) bg-(--color-tc-20) grid-cols-2">
            {[
              {
                label: "Survey level",
                value: lead.surveyLevel
                  ? `${SURVEY_LEVEL_LABELS[lead.surveyLevel]} · Homebuyer`
                  : "—",
                sub: lead.quotedAmount ? `£${lead.quotedAmount} quoted` : "",
              },
              {
                label: "Payment status",
                value: lead.stage === "CONVERTED" ? "Paid" : "Unpaid",
                sub: "Stripe link sent · not clicked",
                warn: lead.stage !== "CONVERTED",
              },
              {
                label: "Owner",
                value: lead.assignedTo?.fullName ?? "Unassigned",
                sub: lead.assignedTo ? `Assigned ${formatRelative(lead.createdAt)}` : "",
              },
              {
                label: "Stage",
                value: LEAD_STAGE_LABELS[lead.stage] ?? lead.stage,
                sub: "Pipeline stage",
              },
            ].map((cell) => (
              <div key={cell.label} className="bg-white px-4 py-4">
                <p className="text-xs text-(--color-tc-30)">{cell.label}</p>
                <p
                  className={cn(
                    "mt-1 font-semibold text-(--color-tc-40)",
                    cell.warn && "text-amber-700"
                  )}
                >
                  {cell.value}
                </p>
                {cell.sub && <p className="mt-0.5 text-xs text-(--color-tc-30)">{cell.sub}</p>}
              </div>
            ))}
          </div>

          <CrmPanel title="Next workflow step">
            <p className="font-medium text-(--color-tc-40)">{nextWorkflowStepText(lead, currentStep)}</p>
            {nextRun && (
              <p className="mt-2 text-xs text-(--color-tc-30)">
                Next: {new Date(nextRun).toLocaleString()}
              </p>
            )}
          </CrmPanel>

          <LeadTags
            leadId={lead.id}
            tags={lead.tags ?? []}
            onChange={(tags) => setLead((prev) => (prev ? { ...prev, tags } : prev))}
          />

          <CrmPanel title="Lead origin">
            <div className="space-y-2 text-sm">
              <Row label="Source" value={lead.source} />
              <Row label="Source ref" value={lead.sourceRef ?? "—"} />
              <Row label="Received" value={formatRelative(lead.createdAt)} />
            </div>
          </CrmPanel>

          <CrmPanel title="Quick actions">
            <div className="flex flex-col gap-2">
              {canStopAutomation && (
                <SecondaryButton
                  type="button"
                  size="small"
                  className="w-full justify-start"
                  onClick={stopAutomation}
                  disabled={stoppingAutomation}
                >
                  {stoppingAutomation ? "Stopping…" : "Stop automation"}
                </SecondaryButton>
              )}
              {canMarkLost && (
                <SecondaryButton
                  type="button"
                  size="small"
                  className="w-full justify-start"
                  onClick={() => {
                    setLostReason(LOST_REASON_OPTIONS[0]?.value ?? "OTHER");
                    setLostReasonNote("");
                    setShowMarkLost(true);
                  }}
                >
                  Mark as lost
                </SecondaryButton>
              )}
              {lead.stage !== "CONVERTED" && (
                <SecondaryButton
                  type="button"
                  size="small"
                  className="w-full justify-start border-red-200 text-red-600 hover:border-red-400 hover:bg-red-50 hover:text-red-700"
                  onClick={() => {
                    setDeleteConfirm("");
                    setShowDelete(true);
                  }}
                >
                  Delete lead
                </SecondaryButton>
              )}
            </div>
          </CrmPanel>
        </div>

        <div className="min-w-0 lg:sticky lg:top-6 lg:self-start">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 h-auto w-full justify-start rounded-none border-b border-(--color-tc-20) bg-transparent p-0">
              <TabsTrigger
                value="messages"
                className="rounded-none border-b-2 border-transparent px-4 py-2 text-(--color-tc-30) data-[state=active]:border-(--color-primary) data-[state=active]:bg-transparent data-[state=active]:text-(--color-primary) data-[state=active]:shadow-none"
              >
                Messages ({lead.messages.length})
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="rounded-none border-b-2 border-transparent px-4 py-2 text-(--color-tc-30) data-[state=active]:border-(--color-primary) data-[state=active]:bg-transparent data-[state=active]:text-(--color-primary) data-[state=active]:shadow-none"
              >
                Activity ({lead.activities.length})
              </TabsTrigger>
              <TabsTrigger
                value="internal"
                className="rounded-none border-b-2 border-transparent px-4 py-2 text-(--color-tc-30) data-[state=active]:border-(--color-primary) data-[state=active]:bg-transparent data-[state=active]:text-(--color-primary) data-[state=active]:shadow-none"
              >
                Internal
              </TabsTrigger>
            </TabsList>
            <TabsContent value="messages" className="mt-0">
              <LeadMessageThread
                leadId={lead.id}
                customerName={
                  customer ? `${customer.firstName} ${customer.lastName}` : "Customer"
                }
                messages={lead.messages}
                callActivities={lead.activities.filter((a) => a.type.includes("call"))}
                onSent={() => reload({ silent: true })}
              />
            </TabsContent>
            <TabsContent value="activity" className="mt-0">
              <ActivityFeed
                activities={lead.activities}
                leadName={
                  lead.customerName ??
                  (lead.customer
                    ? `${lead.customer.firstName} ${lead.customer.lastName}`
                    : undefined)
                }
              />
            </TabsContent>
            <TabsContent value="internal" className="mt-0">
              <InternalConversationPanel
                leadId={lead.id}
                title={
                  customer
                    ? `Lead · ${customer.firstName} ${customer.lastName} · ${lead.propertyPostcode}`
                    : `Lead · ${lead.propertyPostcode}`
                }
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {showMarkLost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-(--color-tc-40)">Mark as lost</h2>
            <p className="mt-2 text-sm text-(--color-tc-30)">
              This stops nurture workflows and moves the lead to Lost.
            </p>
            <div className="mt-4 space-y-3">
              <SelectField
                label="Reason"
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
              >
                {LOST_REASON_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectField>
              <TextField
                id="lost-reason-note"
                label="Note (optional)"
                value={lostReasonNote}
                onChange={(e) => setLostReasonNote(e.target.value)}
                placeholder="Any extra context for the team"
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <SecondaryButton
                type="button"
                className="w-auto"
                disabled={markingLost}
                onClick={() => {
                  setShowMarkLost(false);
                  setLostReasonNote("");
                }}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton
                type="button"
                className="w-auto px-6"
                disabled={markingLost}
                onClick={markLost}
              >
                {markingLost ? "Saving…" : "Mark as lost"}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-(--color-tc-40)">Delete lead</h2>
            <p className="mt-2 text-sm text-(--color-tc-30)">
              This permanently removes the lead and its activity history. This cannot be undone.
            </p>
            <p className="mt-3 text-sm text-(--color-tc-40)">
              Type{" "}
              <span className="font-semibold">{customer?.firstName ?? "the lead's first name"}</span>{" "}
              to confirm.
            </p>
            <div className="mt-3">
              <TextField
                id="delete-lead-confirm"
                label="First name"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={customer?.firstName ?? ""}
                autoComplete="off"
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <SecondaryButton
                type="button"
                className="w-auto"
                disabled={deleting}
                onClick={() => {
                  setShowDelete(false);
                  setDeleteConfirm("");
                }}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton
                type="button"
                className="w-auto bg-red-600 px-6 hover:bg-red-700"
                disabled={
                  deleting ||
                  deleteConfirm.trim().toLowerCase() !== (customer?.firstName ?? "").trim().toLowerCase()
                }
                onClick={deleteLead}
              >
                {deleting ? "Deleting…" : "Delete lead"}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={moveToPaidConfirmOpen}
        title="Move to paid?"
        description={
          lead
            ? `Record a bank transfer of £${lead.quotedAmount ?? "—"} for ${customer?.firstName ?? ""} ${customer?.lastName ?? ""} — ${lead.propertyAddress}, ${lead.propertyPostcode}. This creates the job as paid and stops nurture.`
                .replace(/\s+/g, " ")
                .trim()
            : undefined
        }
        confirmLabel="Move to paid"
        loading={movingToPaid}
        error={moveToPaidError ?? undefined}
        onConfirm={() => void convert()}
        onCancel={() => {
          if (movingToPaid) return;
          setMoveToPaidConfirmOpen(false);
          setMoveToPaidError(null);
        }}
      />
    </>
  );

  if (embedded) {
    return <div className={contentWrapperClass}>{detailBody}</div>;
  }

  return <CrmPageContent>{detailBody}</CrmPageContent>;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-(--color-tc-30)">{label}</span>
      <span className="text-right font-medium text-(--color-tc-40)">{value}</span>
    </div>
  );
}

function LeadDetailBreadcrumb({ name }: { name?: string }) {
  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-sm">
      <Link
        href="/crm/leads"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-1.5 py-1 text-(--color-tc-30) transition-colors hover:bg-(--color-nc-10) hover:text-(--color-tc-40)"
      >
        <ArrowLeft className="size-3.5" />
        Leads
      </Link>
      <ChevronRight className="size-3.5 shrink-0 text-(--color-tc-20)" aria-hidden />
      <span className="shrink-0 text-(--color-tc-30)">Active</span>
      {name ? (
        <>
          <ChevronRight className="size-3.5 shrink-0 text-(--color-tc-20)" aria-hidden />
          <span className="truncate font-medium text-(--color-tc-40)">{name}</span>
        </>
      ) : null}
    </nav>
  );
}
