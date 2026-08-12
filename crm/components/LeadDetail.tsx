"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/crm/lib/api";
import type { CadenceStep, LeadDetail as LeadDetailType, SurveyLevel } from "@/crm/types";
import { getCachedLead, setCachedLead } from "@/crm/lib/leadDetailCache";
import {
  BEDROOM_BAND_LABELS,
  LEAD_STAGE_LABELS,
  LOST_REASON_OPTIONS,
  PROPERTY_VALUE_BAND_LABELS,
  SURVEY_LEVEL_LABELS,
} from "@/crm/lib/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ArrowLeft, ChevronRight, Maximize2 } from "lucide-react";
import PhoneButton from "@/crm/components/PhoneButton";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPanel from "@/crm/components/ui/CrmPanel";
import CrmModal from "@/crm/components/ui/CrmModal";
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
import { filterLeadThreadActivities } from "@/crm/lib/threadActivities";

function formatRelative(dateStr: string) {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function paymentStatusSub(lead: LeadDetailType): string {
  if (lead.stage === "CONVERTED") return "Payment received";
  if (!lead.quotedAmount) return "No payment link yet";
  if (lead.paymentLinkClickedAt) {
    return `Stripe link sent · clicked ${formatRelative(lead.paymentLinkClickedAt)}`;
  }
  return "Stripe link sent · not clicked";
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
  const [lead, setLead] = useState<LeadDetailType | null>(() => getCachedLead(id));
  const [loading, setLoading] = useState(() => !getCachedLead(id));
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("messages");
  const [messagesMaximized, setMessagesMaximized] = useState(false);
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
  const [moveToPaidAmount, setMoveToPaidAmount] = useState("");
  const [moveToPaidSurveyLevel, setMoveToPaidSurveyLevel] = useState<SurveyLevel>("LEVEL_2");

  function reload(options?: { silent?: boolean }) {
    if (!options?.silent) setLoading(true);
    api
      .getLead(id)
      .then((l) => {
        setCachedLead(id, l);
        setLead(l);
        prefetchInternalThread({ leadId: l.id });
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => {
        if (!options?.silent) setLoading(false);
      });
  }

  useEffect(() => {
    const cached = getCachedLead(id);
    if (cached) {
      setLead(cached);
      setLoading(false);
      setError("");
      prefetchInternalThread({ leadId: cached.id });
      // Refresh in background so hover-prefetch stays fresh
      reload({ silent: true });
      return;
    }
    setLead(null);
    setError("");
    reload();
  }, [id]);

  // Poll while waiting for the customer to open the pay link so the CRM updates without a manual refresh.
  useEffect(() => {
    if (!lead || lead.stage === "CONVERTED" || lead.paymentLinkClickedAt || !lead.quotedAmount) {
      return;
    }
    const timer = window.setInterval(() => reload({ silent: true }), 8000);
    return () => window.clearInterval(timer);
  }, [id, lead?.stage, lead?.paymentLinkClickedAt, lead?.quotedAmount]);

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
    const amount = Number(moveToPaidAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setMoveToPaidError("Enter a valid amount greater than 0.");
      return;
    }
    if (!moveToPaidSurveyLevel) {
      setMoveToPaidError("Select a survey level.");
      return;
    }
    setMovingToPaid(true);
    setMoveToPaidError(null);
    try {
      const result = await api.convertLead(id, amount, {
        surveyLevel: moveToPaidSurveyLevel,
      });
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
              <div className="min-w-0">
                <p className="text-xs text-ink-muted">Bedrooms</p>
                <p className="mt-0.5 text-sm font-medium text-ink">
                  {lead.bedroomBand
                    ? BEDROOM_BAND_LABELS[lead.bedroomBand] ?? lead.bedroomBand
                    : "—"}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-ink-muted">Property value</p>
                <p className="mt-0.5 text-sm font-medium text-ink">
                  {lead.propertyValueBand
                    ? PROPERTY_VALUE_BAND_LABELS[lead.propertyValueBand] ??
                      lead.propertyValueBand
                    : "—"}
                </p>
              </div>
              {lead.intakeMessage ? (
                <div className="min-w-0 sm:col-span-2">
                  <p className="text-xs text-ink-muted">
                    {lead.source === "PINLOCAL"
                      ? "Survey requirements"
                      : "Comments"}
                  </p>
                  <p className="mt-0.5 whitespace-pre-wrap text-sm font-medium text-ink">
                    {lead.intakeMessage}
                  </p>
                </div>
              ) : null}
            </div>

            {lead.stage !== "CONVERTED" && (
              <div className="mt-4 border-t border-line pt-4">
                <PrimaryButton
                  type="button"
                  className="!h-auto w-full !px-4 !py-1.5"
                  disabled={movingToPaid}
                  onClick={() => {
                    setMoveToPaidError(null);
                    setMoveToPaidAmount(
                      lead.quotedAmount != null && lead.quotedAmount > 0
                        ? String(lead.quotedAmount)
                        : ""
                    );
                    setMoveToPaidSurveyLevel(lead.surveyLevel ?? "LEVEL_2");
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
                sub: paymentStatusSub(lead),
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

        <div className="flex min-h-0 min-w-0 flex-col lg:sticky lg:top-3 lg:h-[calc(100dvh-5.5rem)] lg:self-start">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="mb-3 flex shrink-0 items-end gap-2 border-b border-(--color-tc-20)">
              <TabsList className="h-auto min-w-0 flex-1 justify-start rounded-none border-0 bg-transparent p-0">
                <TabsTrigger
                  value="messages"
                  className="h-auto rounded-none border-b-2 border-transparent px-3 py-1.5 text-(--color-tc-30) data-[state=active]:border-(--color-primary) data-[state=active]:bg-transparent data-[state=active]:text-(--color-primary) data-[state=active]:shadow-none"
                >
                  Messages ({lead.messages.length})
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="h-auto rounded-none border-b-2 border-transparent px-3 py-1.5 text-(--color-tc-30) data-[state=active]:border-(--color-primary) data-[state=active]:bg-transparent data-[state=active]:text-(--color-primary) data-[state=active]:shadow-none"
                >
                  Activity ({lead.activities.length})
                </TabsTrigger>
                <TabsTrigger
                  value="internal"
                  className="h-auto rounded-none border-b-2 border-transparent px-3 py-1.5 text-(--color-tc-30) data-[state=active]:border-(--color-primary) data-[state=active]:bg-transparent data-[state=active]:text-(--color-primary) data-[state=active]:shadow-none"
                >
                  Internal
                </TabsTrigger>
              </TabsList>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("messages");
                  setMessagesMaximized(true);
                }}
                className="mb-1.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-sidebar hover:text-ink"
                title="Maximize messages"
                aria-label="Maximize messages"
              >
                <Maximize2 className="size-4" strokeWidth={1.75} />
              </button>
            </div>
            <TabsContent
              value="messages"
              className="mt-0 min-h-0 flex-1 data-[state=active]:flex data-[state=active]:flex-col"
            >
              <LeadMessageThread
                leadId={lead.id}
                customerName={
                  customer ? `${customer.firstName} ${customer.lastName}` : "Customer"
                }
                messages={lead.messages}
                threadActivities={filterLeadThreadActivities(lead.activities)}
                onSent={() => reload({ silent: true })}
                className="h-full min-h-0 flex-1"
              />
            </TabsContent>
            <TabsContent value="activity" className="mt-0 min-h-0 flex-1 overflow-y-auto">
              <ActivityFeed
                activities={lead.activities}
                messages={lead.messages}
                leadName={
                  lead.customerName ??
                  (lead.customer
                    ? `${lead.customer.firstName} ${lead.customer.lastName}`
                    : undefined)
                }
              />
            </TabsContent>
            <TabsContent value="internal" className="mt-0 min-h-0 flex-1 overflow-y-auto">
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
            ? `Record a bank transfer for ${customer?.firstName ?? ""} ${customer?.lastName ?? ""} — ${lead.propertyAddress}, ${lead.propertyPostcode}.`
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
      >
        <p className="mb-4 text-sm text-ink-muted">
          This creates the job as paid and stops nurture.
        </p>
        <div className="space-y-3">
          <SelectField
            label="Survey level"
            value={moveToPaidSurveyLevel}
            disabled={movingToPaid}
            onChange={(e) => {
              setMoveToPaidSurveyLevel(e.target.value as SurveyLevel);
              if (moveToPaidError) setMoveToPaidError(null);
            }}
          >
            {(Object.keys(SURVEY_LEVEL_LABELS) as SurveyLevel[]).map((level) => (
              <option key={level} value={level}>
                {SURVEY_LEVEL_LABELS[level]}
              </option>
            ))}
          </SelectField>
          <div>
            <TextField
              label="Amount (£)"
              type="text"
              inputMode="decimal"
              value={moveToPaidAmount}
              disabled={movingToPaid}
              autoFocus
              placeholder={
                lead?.quotedAmount != null ? String(lead.quotedAmount) : "0.00"
              }
              onChange={(e) => {
                const next = e.target.value.replace(/[^0-9.]/g, "");
                setMoveToPaidAmount(next);
                if (moveToPaidError) setMoveToPaidError(null);
              }}
            />
            {lead?.quotedAmount != null && lead.quotedAmount > 0 ? (
              <p className="mt-1.5 text-xs text-ink-muted">
                Quoted: £{lead.quotedAmount}
                {lead.surveyLevel
                  ? ` · ${SURVEY_LEVEL_LABELS[lead.surveyLevel] ?? lead.surveyLevel}`
                  : ""}
              </p>
            ) : null}
          </div>
        </div>
      </ConfirmModal>

      <CrmModal
        isOpen={messagesMaximized}
        title={
          customer
            ? `Messages · ${customer.firstName} ${customer.lastName}`
            : "Messages"
        }
        onClose={() => setMessagesMaximized(false)}
        size="xl"
        fitScreen
        bodyClassName="p-0"
      >
        <LeadMessageThread
          leadId={lead.id}
          customerName={
            customer ? `${customer.firstName} ${customer.lastName}` : "Customer"
          }
          messages={lead.messages}
          threadActivities={filterLeadThreadActivities(lead.activities)}
          onSent={() => reload({ silent: true })}
          className="h-full min-h-0 max-h-none flex-1 rounded-none border-0"
        />
      </CrmModal>
    </>
  );

  if (embedded) {
    return <div className={contentWrapperClass}>{detailBody}</div>;
  }

  return <CrmPageContent className="!pt-3 sm:!pt-4 lg:!pt-4">{detailBody}</CrmPageContent>;
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
