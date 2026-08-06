"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { api } from "@/crm/lib/api";
import { canMutateLeads } from "@/crm/lib/rbac";
import type { Job, JobDocument, SnaggingItem, UserRole } from "@/crm/types";
import PhoneButton from "@/crm/components/PhoneButton";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPanel from "@/crm/components/ui/CrmPanel";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import StatusPill from "@/crm/components/ui/StatusPill";
import TextField from "@/crm/components/ui/TextField";
import SelectField from "@/crm/components/ui/SelectField";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import ConfirmModal from "@/crm/components/ui/ConfirmModal";
import InternalConversationPanel, { prefetchInternalThread } from "@/crm/components/InternalConversationPanel";
import { ArrowLeft, Building2, CalendarDays, CheckSquare, ClipboardList, FileText, KeyRound, UserRound, Wallet } from "lucide-react";

function paymentStatusVariant(status: string): "completed" | "pending" | "in-review" | "failed" {
  if (status === "PAID") return "completed";
  if (status === "FAILED" || status === "REFUNDED") return "failed";
  return "pending";
}

export default function JobDetail({ id }: { id: string }) {
  const [job, setJob] = useState<
    (Job & { payments?: { id: string; amount: number; status: string; paidAt?: string | null }[] }) | null
  >(null);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [markPaidConfirmOpen, setMarkPaidConfirmOpen] = useState(false);
  const [markPaidError, setMarkPaidError] = useState<string | null>(null);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [docType, setDocType] = useState("REPORT");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [snagDesc, setSnagDesc] = useState("");
  const [workStart, setWorkStart] = useState("");
  const [workEnd, setWorkEnd] = useState("");
  const [surveyors, setSurveyors] = useState<{ id: string; fullName: string }[]>([]);
  const [role, setRole] = useState<UserRole | null>(null);
  const [accessForm, setAccessForm] = useState({
    agentName: "",
    agentEmail: "",
    agentPhone: "",
    vendorName: "",
    vendorEmail: "",
    vendorPhone: "",
    accessNotes: "",
  });
  const [inspectionDate, setInspectionDate] = useState("");
  const [stageError, setStageError] = useState<string | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [accessSaved, setAccessSaved] = useState(false);
  const [savingAccess, setSavingAccess] = useState(false);
  const [confirmingAccess, setConfirmingAccess] = useState(false);

  function reload(silent = true) {
    if (!silent) setLoading(true);
    return api
      .getJob(id)
      .then((j) => {
        setJob(j);
        setWorkStart(j.workStartDate?.slice(0, 10) ?? "");
        setWorkEnd(j.workEndDate?.slice(0, 10) ?? "");
        setInspectionDate(j.inspectionDate?.slice(0, 10) ?? "");
        setAccessForm({
          agentName: j.agentName ?? "",
          agentEmail: j.agentEmail ?? "",
          agentPhone: j.agentPhone ?? "",
          vendorName: j.vendorName ?? "",
          vendorEmail: j.vendorEmail ?? "",
          vendorPhone: j.vendorPhone ?? "",
          accessNotes: j.accessNotes ?? "",
        });
        prefetchInternalThread({ jobId: j.id });
      })
      .finally(() => {
        if (!silent) setLoading(false);
      });
  }

  useEffect(() => {
    reload(false);
    api.getMe().then((me) => setRole(me.role)).catch(() => setRole(null));
    api.listSurveyors().then((r) => setSurveyors(r.items)).catch(() => {});
  }, [id]);

  const canAssignSurveyor = role ? canMutateLeads(role) : false;

  async function createLink() {
    const r = await api.createPaymentLink(id);
    setPaymentLink(r.url);
    reload();
  }

  async function markPaid() {
    if (markingPaid || job?.paymentStatus === "PAID") return;
    setMarkingPaid(true);
    setMarkPaidError(null);
    try {
      await api.markJobPaid(id);
      setMarkPaidConfirmOpen(false);
      await reload();
    } catch (e) {
      setMarkPaidError(e instanceof Error ? e.message : "Could not mark as paid");
    } finally {
      setMarkingPaid(false);
    }
  }

  async function uploadDocument() {
    if (!docFile) return;
    setUploadingDoc(true);
    setDocError(null);
    try {
      const type = job?.jobType === "TRADE_WORK" ? "RAMS" : docType;
      await api.uploadJobDocument(id, docFile, type);
      setDocFile(null);
      reload();
    } catch (e) {
      setDocError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploadingDoc(false);
    }
  }

  async function addSnaggingItem() {
    if (!snagDesc.trim()) return;
    const items: SnaggingItem[] = [
      ...(job?.snaggingItems ?? []),
      { id: crypto.randomUUID(), description: snagDesc.trim(), status: "open" },
    ];
    await api.updateSnagging(id, items);
    setSnagDesc("");
    reload();
  }

  async function toggleSnag(item: SnaggingItem) {
    const items = (job?.snaggingItems ?? []).map((s) =>
      s.id === item.id
        ? { ...s, status: s.status === "open" ? ("resolved" as const) : ("open" as const) }
        : s
    );
    await api.updateSnagging(id, items);
    reload();
  }

  async function signOff() {
    await api.signOffJob(id);
    reload();
  }

  if (loading) {
    return (
      <CrmPageContent>
        <LoadingSpinner />
      </CrmPageContent>
    );
  }

  if (!job) {
    return (
      <CrmPageContent>
        <p className="text-red-600">Job not found</p>
      </CrmPageContent>
    );
  }

  const isTrade = job.jobType === "TRADE_WORK";
  const documents = (job.documents ?? []) as JobDocument[];
  const activeStageStyle: CSSProperties = {
    backgroundColor: "var(--color-primary)",
    borderColor: "var(--color-primary)",
    color: "#ffffff",
  };
  const TRADE_STAGES = [
    "WORK_SCHEDULED",
    "WORK_IN_PROGRESS",
    "WORK_COMPLETE",
    "SNAGGING",
    "COMPLETED",
  ] as const;

  const SURVEY_STAGES = [
    "PAID",
    "ACCESS_REQUESTED",
    "ACCESS_CONFIRMED",
    "INSPECTION_BOOKED",
    "INSPECTION_COMPLETE",
    "REPORT_DRAFTING",
    "REPORT_QC",
    "REPORT_DELIVERED",
    "COMPLETED",
  ] as const;

  async function updateTradeStage(stage: string) {
    const previous = job;
    setJob((j) => (j ? { ...j, stage } : j));
    try {
      await api.updateJobStage(id, stage);
      await reload();
    } catch {
      setJob(previous);
    }
  }

  async function saveWorkDates() {
    await api.updateJob(id, {
      ...(workStart ? { workStartDate: new Date(workStart).toISOString() } : {}),
      ...(workEnd ? { workEndDate: new Date(workEnd).toISOString() } : {}),
    });
    reload();
  }

  async function saveAccessDetails() {
    setAccessError(null);
    setAccessSaved(false);
    setSavingAccess(true);
    try {
      await api.updateJob(id, accessForm);
      await reload();
      setAccessSaved(true);
    } catch (e) {
      setAccessError(e instanceof Error ? e.message : "Could not save access details");
    } finally {
      setSavingAccess(false);
    }
  }

  async function confirmAccessDetails() {
    setAccessError(null);
    setAccessSaved(false);
    setConfirmingAccess(true);
    try {
      await api.updateJob(id, accessForm);
      await api.confirmJobAccessDetails(id);
      await reload();
    } catch (e) {
      setAccessError(e instanceof Error ? e.message : "Could not confirm access details");
    } finally {
      setConfirmingAccess(false);
    }
  }

  async function assignSurveyor(surveyorId: string) {
    await api.updateJob(id, { assignedToId: surveyorId || null });
    reload();
  }

  async function updateSurveyStage(stage: string) {
    setStageError(null);
    const previous = job;
    setJob((j) => (j ? { ...j, stage } : j));
    try {
      await api.updateJobStage(id, stage);
      await reload();
    } catch (e) {
      setJob(previous);
      const msg = e instanceof Error ? e.message : "Could not update stage";
      setStageError(msg);
    }
  }

  async function saveInspectionDetails() {
    await api.updateJob(id, {
      ...(inspectionDate ? { inspectionDate: new Date(inspectionDate).toISOString() } : {}),
    });
    reload();
  }

  async function toggleDataCapture() {
    await api.updateJob(id, { dataCaptureComplete: !job?.dataCaptureComplete });
    reload();
  }

  async function toggleSurveyorCheckpoint(
    field: "surveyorJobReviewed" | "surveyorDiaryConfirmed" | "surveyorDesktopResearch",
    value: boolean
  ) {
    setJob((j) => (j ? { ...j, [field]: value } : j));
    try {
      await api.updateJob(id, { [field]: value });
      await reload();
    } catch (e) {
      await reload();
      alert(e instanceof Error ? e.message : "Could not update checkpoint");
    }
  }

  async function sendReviewRequest() {
    try {
      await api.sendJobReviewRequest(id);
      await reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not send review request");
    }
  }

  return (
    <CrmPageContent>
      <Link
        href="/crm/jobs"
        className="mb-2 inline-flex items-center gap-1 text-sm text-(--color-tc-30) hover:text-(--color-tc-40)"
      >
        <ArrowLeft className="size-4" /> Jobs
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--color-tc-40)">{job.jobNumber}</h1>
          <p className="mt-1 text-sm text-(--color-tc-30)">
            {job.propertyAddress}, {job.propertyPostcode}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusPill variant={paymentStatusVariant(job.paymentStatus)} label={job.paymentStatus} />
          {job.customer?.phone && (
            <PhoneButton
              number={job.customer.phone}
              variant="primary"
              context={{
                jobId: job.id,
                customerName: `${job.customer.firstName} ${job.customer.lastName}`,
              }}
            />
          )}
        </div>
      </div>

      <div className="space-y-6">
        {isTrade && (
          <CrmPanel title="Trade workflow">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-(--color-tc-30)">Stage:</span>
                {TRADE_STAGES.map((s) => (
                  <SecondaryButton
                    key={s}
                    type="button"
                    size="small"
                    style={job.stage === s ? activeStageStyle : undefined}
                    className="w-auto"
                    onClick={() => updateTradeStage(s)}
                  >
                    {s.replace(/_/g, " ")}
                  </SecondaryButton>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  label="Work start"
                  id="workStart"
                  type="date"
                  value={workStart}
                  onChange={(e) => setWorkStart(e.target.value)}
                />
                <TextField
                  label="Work end"
                  id="workEnd"
                  type="date"
                  value={workEnd}
                  onChange={(e) => setWorkEnd(e.target.value)}
                />
              </div>
              <SecondaryButton type="button" size="small" className="w-auto" onClick={saveWorkDates}>
                Save schedule
              </SecondaryButton>
              {job.completionSignedAt && (
                <p className="text-xs text-emerald-700">
                  Signed off {new Date(job.completionSignedAt).toLocaleString()}
                </p>
              )}
            </div>
          </CrmPanel>
        )}

        {/* Setup: Payment (+ Surveyor for survey jobs) */}
        <div className={`grid gap-6 ${isTrade ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
          <CrmPanel title="Payment">
            <div className="space-y-3">
              <p className="text-sm text-(--color-tc-40)">
                Agreed amount: <strong>£{job.agreedAmount}</strong>
              </p>
              {(job.stripePaymentLinkUrl || paymentLink) && (
                <div className="rounded-lg bg-(--color-nc-10) p-3 text-xs break-all text-(--color-tc-30)">
                  {job.stripePaymentLinkUrl ?? paymentLink}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {job.paymentStatus !== "PAID" && (
                  <>
                    <PrimaryButton type="button" className="w-auto px-6" onClick={createLink}>
                      Get payment link
                    </PrimaryButton>
                    <SecondaryButton
                      type="button"
                      size="small"
                      className="w-auto"
                      onClick={() => {
                        setMarkPaidError(null);
                        setMarkPaidConfirmOpen(true);
                      }}
                      disabled={markingPaid}
                    >
                      Mark paid (bank transfer)
                    </SecondaryButton>
                  </>
                )}
              </div>
            </div>
          </CrmPanel>

          {!isTrade && (
            <CrmPanel title="Surveyor assignment">
              {canAssignSurveyor ? (
                <>
                  <SelectField
                    label="Assigned surveyor"
                    value={job.assignedTo?.id ?? ""}
                    onChange={(e) => assignSurveyor(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {surveyors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName}
                      </option>
                    ))}
                  </SelectField>
                  {!job.assignedTo && (
                    <p className="mt-2 text-xs text-amber-700">Assign a surveyor before requesting access.</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-ink-muted">
                  {job.assignedTo?.fullName ?? "Unassigned"}
                </p>
              )}
            </CrmPanel>
          )}

          {isTrade && (
            <>
              <CrmPanel title="Payments history">
                {(job.payments ?? []).length === 0 ? (
                  <p className="text-sm text-(--color-tc-30)">No payments recorded</p>
                ) : (
                  <div className="space-y-0">
                    {job.payments!.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between border-b border-(--color-tc-20) py-2 text-sm last:border-0"
                      >
                        <span className="text-(--color-tc-40)">£{p.amount}</span>
                        <StatusPill variant={paymentStatusVariant(p.status)} label={p.status} />
                      </div>
                    ))}
                  </div>
                )}
              </CrmPanel>

              <CrmPanel title="Documents (RAMS)">
                <div className="space-y-3">
                  {documents.map((d) => (
                    <a
                      key={d.id}
                      href={d.storageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-sm text-(--color-primary) hover:underline"
                    >
                      {d.filename} ({d.type})
                    </a>
                  ))}
                  <div className="space-y-2 border-t border-(--color-tc-20) pt-3">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.gif"
                      onChange={(e) => {
                        setDocError(null);
                        setDocFile(e.target.files?.[0] ?? null);
                      }}
                      className="block w-full text-sm text-(--color-tc-40) file:mr-3 file:rounded-xl file:border file:border-(--color-tc-20) file:bg-(--color-primary) file:px-4 file:py-2 file:text-white hover:file:opacity-90"
                    />
                    {docError && <p className="text-sm text-red-600">{docError}</p>}
                    <SecondaryButton
                      type="button"
                      size="small"
                      className="w-auto"
                      onClick={uploadDocument}
                      disabled={!docFile || uploadingDoc}
                    >
                      {uploadingDoc ? "Uploading…" : "Upload document"}
                    </SecondaryButton>
                  </div>
                </div>
              </CrmPanel>
            </>
          )}
        </div>

        {!isTrade && (
          <>
            {job.accessDetailsPendingReview && (
              <CrmPanel title="Access details — review required" className="border-amber-300 bg-amber-50/50">
                <p className="mb-3 text-sm text-amber-900">
                  Client reply was parsed into the fields below. Verify and confirm to request access from the estate agent.
                </p>
                <PrimaryButton
                  type="button"
                  className="w-auto px-6"
                  onClick={confirmAccessDetails}
                  disabled={savingAccess || confirmingAccess}
                >
                  {confirmingAccess ? "Confirming…" : "Confirm access details"}
                </PrimaryButton>
                {accessError && <p className="mt-2 text-sm text-red-600">{accessError}</p>}
              </CrmPanel>
            )}

            <CrmPanel title="Access details">
              <div className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <section className="space-y-4 rounded-xl border border-line bg-sidebar/40 p-4 sm:p-5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-brand-muted text-brand">
                        <Building2 className="size-4" aria-hidden />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-ink">Estate agent</h3>
                        <p className="text-xs text-ink-muted">Who to contact for access</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <TextField
                        label="Name"
                        value={accessForm.agentName}
                        onChange={(e) => setAccessForm({ ...accessForm, agentName: e.target.value })}
                      />
                      <TextField
                        label="Email"
                        type="email"
                        value={accessForm.agentEmail}
                        onChange={(e) => setAccessForm({ ...accessForm, agentEmail: e.target.value })}
                      />
                      <TextField
                        label="Phone"
                        type="tel"
                        value={accessForm.agentPhone}
                        onChange={(e) => setAccessForm({ ...accessForm, agentPhone: e.target.value })}
                      />
                    </div>
                  </section>

                  <section className="space-y-4 rounded-xl border border-line bg-sidebar/40 p-4 sm:p-5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-brand-muted text-brand">
                        <UserRound className="size-4" aria-hidden />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-ink">Vendor / occupant</h3>
                        <p className="text-xs text-ink-muted">On-site contact if known</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <TextField
                        label="Name"
                        value={accessForm.vendorName}
                        onChange={(e) => setAccessForm({ ...accessForm, vendorName: e.target.value })}
                      />
                      <TextField
                        label="Email"
                        type="email"
                        value={accessForm.vendorEmail}
                        onChange={(e) => setAccessForm({ ...accessForm, vendorEmail: e.target.value })}
                      />
                      <TextField
                        label="Phone"
                        type="tel"
                        value={accessForm.vendorPhone}
                        onChange={(e) => setAccessForm({ ...accessForm, vendorPhone: e.target.value })}
                      />
                    </div>
                  </section>
                </div>

                <section className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-brand-muted text-brand">
                      <KeyRound className="size-4" aria-hidden />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-ink">Access notes</h3>
                      <p className="text-xs text-ink-muted">Keys, alarms, parking, preferred times</p>
                    </div>
                  </div>
                  <textarea
                    id="access-notes"
                    rows={4}
                    value={accessForm.accessNotes}
                    onChange={(e) => setAccessForm({ ...accessForm, accessNotes: e.target.value })}
                    placeholder="e.g. Keysafe code, dog on site, call agent 30 mins before…"
                    className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-brand-light focus:ring-2 focus:ring-brand-muted"
                  />
                </section>

                <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    {job.accessDetailsVerifiedAt ? (
                      <p className="text-xs text-emerald-700">
                        Verified {new Date(job.accessDetailsVerifiedAt).toLocaleString()}
                      </p>
                    ) : (
                      <p className="text-xs text-ink-muted">
                        Save a draft anytime. Confirm when ready to request access.
                      </p>
                    )}
                    {accessSaved && !accessError && (
                      <p className="text-xs text-emerald-700">Draft saved.</p>
                    )}
                    {accessError && <p className="text-sm text-red-600">{accessError}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <SecondaryButton
                      type="button"
                      size="small"
                      className="w-auto"
                      onClick={saveAccessDetails}
                      disabled={savingAccess || confirmingAccess}
                    >
                      {savingAccess ? "Saving…" : "Save draft"}
                    </SecondaryButton>
                    <PrimaryButton
                      type="button"
                      className="w-auto px-6"
                      onClick={confirmAccessDetails}
                      disabled={savingAccess || confirmingAccess}
                    >
                      {confirmingAccess ? "Confirming…" : "Confirm & request access"}
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            </CrmPanel>

            <CrmPanel title="Survey workflow">
              <div className="space-y-6">
                {stageError && <p className="text-sm text-red-600">{stageError}</p>}

                <section className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-ink">Stage</h3>
                    <p className="text-xs text-ink-muted">Click a step to move the job forward</p>
                  </div>
                  <div className="overflow-x-auto pb-1">
                    <ol className="flex min-w-max items-stretch gap-1.5">
                      {SURVEY_STAGES.map((s, i) => {
                        const currentIndex = SURVEY_STAGES.indexOf(
                          job.stage as (typeof SURVEY_STAGES)[number]
                        );
                        const isCurrent = job.stage === s;
                        const isDone = currentIndex > i;
                        return (
                          <li key={s} className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => updateSurveyStage(s)}
                              className={[
                                "rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors",
                                isCurrent
                                  ? "border-brand bg-brand text-white shadow-sm"
                                  : isDone
                                    ? "border-brand-light/40 bg-brand-muted text-brand"
                                    : "border-line bg-surface text-ink-muted hover:border-brand-light hover:text-ink",
                              ].join(" ")}
                            >
                              <span className="block tabular-nums text-[10px] opacity-70">
                                {String(i + 1).padStart(2, "0")}
                              </span>
                              <span className="mt-0.5 block max-w-[7.5rem] leading-snug">
                                {s
                                  .replace(/_/g, " ")
                                  .toLowerCase()
                                  .replace(/\b\w/g, (c) => c.toUpperCase())}
                              </span>
                            </button>
                            {i < SURVEY_STAGES.length - 1 && (
                              <span
                                className={`hidden h-px w-3 shrink-0 sm:block ${
                                  isDone || isCurrent ? "bg-brand-light" : "bg-line"
                                }`}
                                aria-hidden
                              />
                            )}
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                </section>

                <div className="grid gap-6 lg:grid-cols-2">
                  <section className="space-y-4 rounded-xl border border-line bg-sidebar/40 p-4 sm:p-5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-brand-muted text-brand">
                        <CheckSquare className="size-4" aria-hidden />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-ink">Pre-site checkpoints</h3>
                        <p className="text-xs text-ink-muted">
                          Required before attending. Ops is alerted if these stay unticked.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {(
                        [
                          ["surveyorJobReviewed", "Job reviewed"],
                          ["surveyorDiaryConfirmed", "Diary confirmed"],
                          ["surveyorDesktopResearch", "Desktop research completed"],
                        ] as const
                      ).map(([field, label]) => (
                        <label
                          key={field}
                          className="flex cursor-pointer items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink"
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(job[field])}
                            onChange={(e) => toggleSurveyorCheckpoint(field, e.target.checked)}
                            className="size-4 rounded border-line text-brand focus:ring-brand-muted"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </section>

                  <section className="flex flex-col space-y-4 rounded-xl border border-line bg-sidebar/40 p-4 sm:p-5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-brand-muted text-brand">
                        <CalendarDays className="size-4" aria-hidden />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-ink">Inspection</h3>
                        <p className="text-xs text-ink-muted">Booked date for the site visit</p>
                      </div>
                    </div>
                    <TextField
                      label="Inspection date"
                      type="date"
                      value={inspectionDate}
                      onChange={(e) => setInspectionDate(e.target.value)}
                    />
                    <div className="mt-auto flex justify-end border-t border-line pt-3">
                      <SecondaryButton
                        type="button"
                        size="small"
                        className="w-auto"
                        onClick={saveInspectionDetails}
                      >
                        Save date
                      </SecondaryButton>
                    </div>
                  </section>
                </div>

                <section className="space-y-4 rounded-xl border border-line bg-sidebar/40 p-4 sm:p-5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-brand-muted text-brand">
                      <ClipboardList className="size-4" aria-hidden />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-ink">After inspection</h3>
                      <p className="text-xs text-ink-muted">Mark when site data is captured</p>
                    </div>
                  </div>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink">
                    <input
                      type="checkbox"
                      checked={Boolean(job.dataCaptureComplete)}
                      onChange={toggleDataCapture}
                      className="size-4 rounded border-line text-brand focus:ring-brand-muted"
                    />
                    Data capture complete (photos, notes, checklist)
                  </label>
                </section>

                {(job.stage === "COMPLETED" || job.stage === "REPORT_DELIVERED") && (
                  <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">Review request</p>
                      <p className="text-xs text-ink-muted">
                        Manual only — send if report issued and there is no complaint, query, or refund.
                      </p>
                      {job.reviewRequestSentAt && (
                        <p className="mt-1 text-xs text-emerald-700">
                          Sent {new Date(job.reviewRequestSentAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                    {!job.reviewRequestSentAt && (
                      <PrimaryButton type="button" className="w-auto shrink-0 px-6" onClick={sendReviewRequest}>
                        Send review request
                      </PrimaryButton>
                    )}
                  </div>
                )}
              </div>
            </CrmPanel>

            <div className="grid gap-6 lg:grid-cols-2">
              <CrmPanel title="Payments history">
                {(job.payments ?? []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-sidebar/40 px-4 py-8 text-center">
                    <Wallet className="size-5 text-ink-faint" aria-hidden />
                    <p className="text-sm text-ink-muted">No payments recorded</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {job.payments!.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-line bg-sidebar/40 px-3 py-2.5"
                      >
                        <span className="text-sm font-medium tabular-nums text-ink">£{p.amount}</span>
                        <StatusPill variant={paymentStatusVariant(p.status)} label={p.status} />
                      </div>
                    ))}
                  </div>
                )}
              </CrmPanel>

              <CrmPanel title="Documents">
                <div className="space-y-4">
                  {documents.length > 0 ? (
                    <ul className="space-y-2">
                      {documents.map((d) => (
                        <li key={d.id}>
                          <a
                            href={d.storageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2.5 rounded-lg border border-line bg-sidebar/40 px-3 py-2.5 text-sm text-ink transition-colors hover:border-brand-light hover:text-brand"
                          >
                            <FileText className="size-4 shrink-0 text-brand" aria-hidden />
                            <span className="min-w-0 truncate">
                              {d.filename}
                              <span className="ml-1.5 text-xs text-ink-muted">({d.type})</span>
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-sidebar/40 px-4 py-6 text-center">
                      <FileText className="size-5 text-ink-faint" aria-hidden />
                      <p className="text-sm text-ink-muted">No documents yet</p>
                    </div>
                  )}

                  <div className="space-y-3 border-t border-line pt-4">
                    <SelectField
                      label="Document type"
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                    >
                      <option value="REPORT">Report</option>
                      <option value="ACTION_PLAN">Action plan</option>
                      <option value="COSTING">Costing</option>
                      <option value="OTHER">Other</option>
                    </SelectField>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.gif"
                      onChange={(e) => {
                        setDocError(null);
                        setDocFile(e.target.files?.[0] ?? null);
                      }}
                      className="block w-full text-sm text-ink file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:opacity-90"
                    />
                    {docError && <p className="text-sm text-red-600">{docError}</p>}
                    <div className="flex justify-end">
                      <SecondaryButton
                        type="button"
                        size="small"
                        className="w-auto"
                        onClick={uploadDocument}
                        disabled={!docFile || uploadingDoc}
                      >
                        {uploadingDoc ? "Uploading…" : "Upload"}
                      </SecondaryButton>
                    </div>
                  </div>
                </div>
              </CrmPanel>
            </div>
          </>
        )}

        {isTrade && (
          <CrmPanel title="Snagging & sign-off">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-(--color-tc-30)">
                Work: {job.workStartDate ? new Date(job.workStartDate).toLocaleDateString() : "TBC"}
                {job.workEndDate ? ` → ${new Date(job.workEndDate).toLocaleDateString()}` : ""}
              </p>
              {job.stage !== "COMPLETED" && (
                <PrimaryButton type="button" className="w-auto px-6" onClick={signOff}>
                  Sign off complete
                </PrimaryButton>
              )}
            </div>
            <div className="space-y-3">
              {(job.snaggingItems ?? []).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl bg-(--color-nc-10) px-3 py-2 text-sm"
                >
                  <span
                    className={
                      item.status === "resolved" ? "text-(--color-tc-30) line-through" : "text-(--color-tc-40)"
                    }
                  >
                    {item.description}
                  </span>
                  <SecondaryButton type="button" size="small" className="w-auto" onClick={() => toggleSnag(item)}>
                    {item.status === "open" ? "Resolve" : "Reopen"}
                  </SecondaryButton>
                </div>
              ))}
              <div className="flex gap-2">
                <TextField
                  className="flex-1"
                  placeholder="New snagging item"
                  value={snagDesc}
                  onChange={(e) => setSnagDesc(e.target.value)}
                />
                <SecondaryButton type="button" size="small" className="w-auto shrink-0" onClick={addSnaggingItem}>
                  Add
                </SecondaryButton>
              </div>
            </div>
          </CrmPanel>
        )}
      </div>

      <InternalConversationPanel
        jobId={job.id}
        title={
          job.customer
            ? `Job · ${job.jobNumber} · ${job.customer.firstName} ${job.customer.lastName}`
            : `Job · ${job.jobNumber}`
        }
      />
      <ConfirmModal
        isOpen={markPaidConfirmOpen}
        title="Mark as paid?"
        description={
          job
            ? `Record a bank transfer of £${job.agreedAmount} for ${job.customer?.firstName ?? ""} ${job.customer?.lastName ?? ""} — ${job.propertyAddress}, ${job.propertyPostcode}. This marks the job paid and stops lead nurture.`
                .replace(/\s+/g, " ")
                .trim()
            : undefined
        }
        confirmLabel="Mark as paid"
        loading={markingPaid}
        error={markPaidError ?? undefined}
        onConfirm={() => void markPaid()}
        onCancel={() => {
          if (markingPaid) return;
          setMarkPaidConfirmOpen(false);
          setMarkPaidError(null);
        }}
      />
    </CrmPageContent>
  );
}
