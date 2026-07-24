"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/crm/lib/api";
import type { LeadDetail as LeadDetailType } from "@/crm/types";
import { LEAD_STAGE_LABELS, SURVEY_LEVEL_LABELS } from "@/crm/lib/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ArrowLeft, ChevronRight, Mail, MapPin, Phone, Radar, Zap } from "lucide-react";
import PhoneButton from "@/crm/components/PhoneButton";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPanel from "@/crm/components/ui/CrmPanel";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import StatusPill, { leadStageToPillVariant } from "@/crm/components/ui/StatusPill";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import TextField from "@/crm/components/ui/TextField";
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

  async function moveStage(stage: string) {
    try {
      await api.updateLeadStage(id, stage);
      reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    }
  }

  async function convert() {
    const amount = lead?.quotedAmount ?? 395;
    try {
      const result = await api.convertLead(id, amount);
      router.push(`/crm/jobs/${result.job.id}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    }
  }

  async function cadenceAction(action: "stop" | "pause" | "resume") {
    try {
      if (action === "stop") await api.stopCadence(id);
      if (action === "pause") await api.pauseCadence(id);
      if (action === "resume") await api.resumeCadence(id);
      reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
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

  const detailBody = (
    <>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-(--color-tc-20)/60 bg-white shadow-sm">
            {(customer?.phone || lead.stage !== "CONVERTED") && (
              <div className="flex flex-wrap items-center justify-end gap-2 border-b border-(--color-tc-20)/50 bg-(--color-nc-10)/50 px-4 py-3 sm:px-5">
                {customer?.phone && (
                  <PhoneButton
                    number={customer.phone}
                    context={{
                      leadId: lead.id,
                      customerName: customer
                        ? `${customer.firstName} ${customer.lastName}`
                        : undefined,
                    }}
                  />
                )}
                {lead.stage !== "CONVERTED" && (
                  <PrimaryButton type="button" className="w-auto min-w-0 gap-2 px-5" onClick={convert}>
                    <Zap className="size-4" />
                    Move to paid
                  </PrimaryButton>
                )}
              </div>
            )}

            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-(--color-primary) text-lg font-semibold tracking-tight text-white shadow-sm ring-4 ring-(--color-primary)/10">
                  {initials}
                </div>

                <div className="min-w-0 flex-1 pt-0.5">
                  <h1 className="text-xl font-semibold tracking-tight break-words text-(--color-tc-40) sm:text-2xl">
                    {customer ? `${customer.firstName} ${customer.lastName}` : "Lead"}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="shrink-0 rounded-md border border-(--color-tc-20)/60 bg-(--color-nc-10) px-2 py-0.5 font-mono text-[11px] text-(--color-tc-30)">
                      ld_{lead.id.slice(0, 8)}
                    </span>
                    <StatusPill
                      variant={leadStageToPillVariant(lead.stage)}
                      label={LEAD_STAGE_LABELS[lead.stage] ?? lead.stage}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-2.5 border-t border-(--color-tc-20)/40 pt-5 sm:grid-cols-2">
                {customer?.email && (
                  <div className="flex min-w-0 items-center gap-3 rounded-xl bg-(--color-nc-10)/50 px-3 py-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-(--color-tc-20)/40 bg-white text-(--color-tc-30)">
                      <Mail className="size-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold tracking-wider text-(--color-tc-20) uppercase">
                        Email
                      </p>
                      <p className="truncate text-sm text-(--color-tc-40)">{customer.email}</p>
                    </div>
                  </div>
                )}
                {customer?.phone && (
                  <div className="flex min-w-0 items-center gap-3 rounded-xl bg-(--color-nc-10)/50 px-3 py-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-(--color-tc-20)/40 bg-white text-(--color-tc-30)">
                      <Phone className="size-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold tracking-wider text-(--color-tc-20) uppercase">
                        Phone
                      </p>
                      <p className="text-sm text-(--color-tc-40)">{customer.phone}</p>
                    </div>
                  </div>
                )}
                <div className="flex min-w-0 items-start gap-3 rounded-xl bg-(--color-nc-10)/50 px-3 py-2.5 sm:col-span-2">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-(--color-tc-20)/40 bg-white text-(--color-tc-30)">
                    <MapPin className="size-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold tracking-wider text-(--color-tc-20) uppercase">
                      Property
                    </p>
                    <p className="text-sm break-words text-(--color-tc-40)">
                      {lead.propertyAddress}, {lead.propertyPostcode}
                    </p>
                  </div>
                </div>
                <div className="flex min-w-0 items-center gap-3 rounded-xl bg-(--color-nc-10)/50 px-3 py-2.5 sm:col-span-2">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-(--color-tc-20)/40 bg-white text-(--color-tc-30)">
                    <Radar className="size-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold tracking-wider text-(--color-tc-20) uppercase">
                      Source
                    </p>
                    <p className="text-sm text-(--color-tc-40)">
                      <span className="font-medium text-(--color-primary)">{lead.source}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <CrmPanel>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-(--color-tc-40)">
                Where {customer?.firstName ?? "lead"} is in the funnel
              </h2>
              <span className="text-xs text-(--color-tc-30)">
                started {formatRelative(lead.createdAt)}
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {lead.journey.map((step, i) => (
                <div
                  key={step.name}
                  className={cn(
                    "min-w-[100px] flex-1 rounded-lg border px-2 py-3 text-center",
                    step.status === "completed" && "border-(--color-tc-20) bg-(--color-nc-10)",
                    step.status === "current" && "border-(--color-primary) bg-(--color-primary) text-white",
                    step.status === "upcoming" && "border-dashed border-(--color-tc-20) bg-white"
                  )}
                >
                  <p
                    className={cn(
                      "text-xs font-medium",
                      step.status === "current" ? "text-white" : "text-(--color-tc-30)"
                    )}
                  >
                    {step.name}
                  </p>
                  {step.status === "current" && (
                    <span className="mt-1 inline-block rounded-full bg-white/20 px-2 py-0.5 text-[10px]">
                      Current step
                    </span>
                  )}
                  {i < lead.journey.length - 1 && <span className="sr-only">→</span>}
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-(--color-tc-30)">
              {lead.cadenceRun?.status === "RUNNING"
                ? `Cadence running — step ${(lead.cadenceRun.currentStep ?? 0) + 1}${nextRun ? ` · next ${new Date(nextRun).toLocaleString()}` : ""}`
                : lead.cadenceStopped
                  ? "Cadence stopped"
                  : "No active cadence"}
            </p>
          </CrmPanel>

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

          <CrmPanel title="Next automated action">
            <p className="font-medium text-(--color-tc-40)">
              {currentStep?.name ?? "No scheduled step"}
            </p>
            {nextRun && (
              <p className="mt-2 text-xs text-(--color-tc-30)">
                Next: {new Date(nextRun).toLocaleString()}
              </p>
            )}
          </CrmPanel>

          <CrmPanel title="Property">
            <div className="space-y-2 text-sm">
              <Row label="Address" value={lead.propertyAddress} />
              <Row label="Postcode" value={lead.propertyPostcode} />
              <Row label="Value band" value={lead.propertyValueBand ?? "—"} />
            </div>
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
              <SecondaryButton
                type="button"
                size="small"
                className="w-full justify-start"
                onClick={() => cadenceAction("pause")}
              >
                Pause cadence
              </SecondaryButton>
              <SecondaryButton
                type="button"
                size="small"
                className="w-full justify-start"
                onClick={() => cadenceAction("resume")}
              >
                Resume cadence
              </SecondaryButton>
              <SecondaryButton
                type="button"
                size="small"
                className="w-full justify-start"
                onClick={() => cadenceAction("stop")}
              >
                Stop cadence
              </SecondaryButton>
              <SecondaryButton
                type="button"
                size="small"
                className="w-full justify-start"
                onClick={() => moveStage("FOLLOWING_UP")}
              >
                Move to Following up
              </SecondaryButton>
              <SecondaryButton
                type="button"
                size="small"
                className="w-full justify-start"
                onClick={() => moveStage("QUOTE_SENT")}
              >
                Move to Quote sent
              </SecondaryButton>
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
