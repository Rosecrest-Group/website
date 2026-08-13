"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { api } from "@/crm/lib/api";
import {
  canEditInspectionDate,
  canManageJobAccessDetails,
  canMutateLeads,
  canTickPreSiteCheckpoints,
  canViewJobMoney,
} from "@/crm/lib/rbac";
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
import { ArrowLeft, Building2, CalendarDays, CheckSquare, ClipboardList, FileText, KeyRound, UserRound, Wallet } from "lucide-react";
import { canonicalSurveyStage, SURVEY_JOB_STAGES } from "@/crm/lib/jobStages";

function paymentStatusVariant(status: string): "completed" | "pending" | "in-review" | "failed" {
  if (status === "PAID") return "completed";
  if (status === "FAILED" || status === "REFUNDED") return "failed";
  return "pending";
}

const SURVEY_STAGES = SURVEY_JOB_STAGES;

const INSPECTION_WINDOWS = ["8am–1pm", "2pm–5pm"] as const;

function normalizeInspectionWindow(value: string): string {
  const compact = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[–—−]/g, "-");
  if (compact === "8am-1pm") return "8am–1pm";
  if (compact === "2pm-5pm") return "2pm–5pm";
  return value.trim();
}

type AccessContactKind = "agent" | "vendor";

function accessContactKindFromJob(job: {
  agentName?: string | null;
  agentEmail?: string | null;
  agentPhone?: string | null;
  vendorName?: string | null;
  vendorEmail?: string | null;
  vendorPhone?: string | null;
}): AccessContactKind {
  if (job.agentName?.trim() || job.agentEmail?.trim() || job.agentPhone?.trim()) return "agent";
  if (job.vendorName?.trim() || job.vendorEmail?.trim() || job.vendorPhone?.trim()) return "vendor";
  return "agent";
}

type SurveyStage = (typeof SURVEY_STAGES)[number];

function surveyStageIndex(stage: string): number {
  if (stage === "PENDING_PAYMENT") return -1;
  return SURVEY_STAGES.indexOf(canonicalSurveyStage(stage) as SurveyStage);
}

/** Which Job Detail panels to show for the current survey stage. */
function surveyStagePanels(stage: string, opts: { hasSurveyor: boolean; accessPendingReview: boolean }) {
  const canonical = canonicalSurveyStage(stage);
  const idx = surveyStageIndex(canonical);
  const is = (...stages: string[]) => stages.includes(canonical);
  const atOrAfter = (s: SurveyStage) => {
    const target = SURVEY_STAGES.indexOf(s);
    return target >= 0 && idx >= target;
  };
  const beforeSite =
    opts.hasSurveyor &&
    (is("PENDING_PAYMENT", "PAID", "ACCESS_REQUESTED", "ACCESS_CONFIRMED", "INSPECTION_BOOKED") ||
      (idx >= 0 && idx < SURVEY_STAGES.indexOf("INSPECTION_COMPLETE")));

  const accessPhase = is("PENDING_PAYMENT", "PAID", "ACCESS_REQUESTED") || opts.accessPendingReview;
  const bookingPhase = is("ACCESS_CONFIRMED", "INSPECTION_BOOKED");
  const inspectionDetails =
    stage === "PENDING_PAYMENT" ||
    (idx >= 0 && idx <= SURVEY_STAGES.indexOf("INSPECTION_BOOKED"));

  return {
    /** Unpaid payment actions stay available until paid regardless of stage. */
    surveyor: idx < SURVEY_STAGES.indexOf("INSPECTION_COMPLETE") || !opts.hasSurveyor,
    accessEditor: accessPhase,
    accessReadOnly: !accessPhase && atOrAfter("ACCESS_CONFIRMED"),
    showAccessNotes: atOrAfter("ACCESS_REQUESTED"),
    /** Torera: checkpoints once assigned, before attending site. */
    preSiteCheckpoints: beforeSite,
    /** Proposed / booked date + arrival window — needed before Access Request email. */
    inspectionDetails,
    inspectionDetailsProposed: accessPhase && !bookingPhase,
    dataCapture: is("INSPECTION_COMPLETE"),
    documents: atOrAfter("INSPECTION_COMPLETE"),
    documentsUpload: atOrAfter("INSPECTION_COMPLETE"),
    reviewRequest: is("REPORT_DELIVERED"),
    paymentsHistory: is("REPORT_DELIVERED"),
    earlierDetails: atOrAfter("INSPECTION_COMPLETE"),
  };
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
  const [accessContactKind, setAccessContactKind] = useState<AccessContactKind>("agent");
  const [inspectionDate, setInspectionDate] = useState("");
  const [inspectionWindow, setInspectionWindow] = useState("");
  const [inspectionError, setInspectionError] = useState<string | null>(null);
  const [savingInspection, setSavingInspection] = useState(false);
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
        setInspectionWindow(normalizeInspectionWindow(j.inspectionWindow ?? ""));
        setAccessForm({
          agentName: j.agentName ?? "",
          agentEmail: j.agentEmail ?? "",
          agentPhone: j.agentPhone ?? "",
          vendorName: j.vendorName ?? "",
          vendorEmail: j.vendorEmail ?? "",
          vendorPhone: j.vendorPhone ?? "",
          accessNotes: j.accessNotes ?? "",
        });
        setAccessContactKind(accessContactKindFromJob(j));
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
  const showMoney = role ? canViewJobMoney(role) : false;
  const canManageAccess = role ? canManageJobAccessDetails(role) : false;
  const canSetInspectionDate = role ? canEditInspectionDate(role) : false;
  const canTickCheckpoints = role ? canTickPreSiteCheckpoints(role) : false;

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
  const hasReportDocument = documents.some((d) => d.type === "REPORT");
  const panels = surveyStagePanels(job.stage, {
    hasSurveyor: Boolean(job.assignedTo),
    accessPendingReview: Boolean(job.accessDetailsPendingReview),
  });
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

  function accessDetailsPayload() {
    if (accessContactKind === "agent") {
      return {
        agentName: accessForm.agentName,
        agentEmail: accessForm.agentEmail,
        agentPhone: accessForm.agentPhone,
        vendorName: "",
        vendorEmail: "",
        vendorPhone: "",
        accessNotes: accessForm.accessNotes,
      };
    }
    return {
      vendorName: accessForm.vendorName,
      vendorEmail: accessForm.vendorEmail,
      vendorPhone: accessForm.vendorPhone,
      agentName: "",
      agentEmail: "",
      agentPhone: "",
      accessNotes: accessForm.accessNotes,
    };
  }

  function switchAccessContactKind(next: AccessContactKind) {
    if (next === accessContactKind) return;
    setAccessForm((form) => {
      if (next === "vendor") {
        return {
          ...form,
          vendorName: form.vendorName || form.agentName,
          vendorEmail: form.vendorEmail || form.agentEmail,
          vendorPhone: form.vendorPhone || form.agentPhone,
        };
      }
      return {
        ...form,
        agentName: form.agentName || form.vendorName,
        agentEmail: form.agentEmail || form.vendorEmail,
        agentPhone: form.agentPhone || form.vendorPhone,
      };
    });
    setAccessContactKind(next);
  }

  async function saveAccessDetails() {
    setAccessError(null);
    setAccessSaved(false);
    setSavingAccess(true);
    try {
      await api.updateJob(id, accessDetailsPayload());
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
    if (!inspectionDate.trim() || !inspectionWindow.trim()) {
      setAccessError(
        "Set and save proposed inspection date and arrival window first — they go in the agent email"
      );
      return;
    }
    setConfirmingAccess(true);
    try {
      await api.updateJob(id, {
        ...accessDetailsPayload(),
        inspectionDate: new Date(`${inspectionDate}T12:00:00.000Z`).toISOString(),
        inspectionWindow: normalizeInspectionWindow(inspectionWindow) || null,
      });
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
    if (stage === "ACCESS_REQUESTED") {
      if (!job?.assignedTo) {
        setStageError("Assign a surveyor before moving to Access Requested");
        return;
      }
      if (!job.inspectionDate || !job.inspectionWindow?.trim()) {
        setStageError(
          "Set proposed inspection date and arrival window before Access Requested — they go in the agent email"
        );
        return;
      }
    }
    if (stage === "REPORT_DELIVERED" && !hasReportDocument) {
      setStageError(
        "Upload a Report document before moving to Report Delivered — it is attached to the client email"
      );
      return;
    }
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
    if (!canSetInspectionDate) return;
    setInspectionError(null);
    setSavingInspection(true);
    try {
      // Noon UTC keeps the calendar day stable across UK timezones.
      const iso = inspectionDate
        ? new Date(`${inspectionDate}T12:00:00.000Z`).toISOString()
        : null;
      await api.updateJob(id, {
        inspectionDate: iso,
        inspectionWindow: normalizeInspectionWindow(inspectionWindow) || null,
      });
      await reload();
    } catch (e) {
      setInspectionError(e instanceof Error ? e.message : "Could not save inspection details");
    } finally {
      setSavingInspection(false);
    }
  }

  async function toggleDataCapture() {
    await api.updateJob(id, { dataCaptureComplete: !job?.dataCaptureComplete });
    reload();
  }

  async function toggleSurveyorCheckpoint(
    field: "surveyorJobReviewed" | "surveyorDiaryConfirmed" | "surveyorDesktopResearch",
    value: boolean
  ) {
    if (!canTickCheckpoints) return;
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
          {showMoney && (
            <p className="mt-1 text-sm text-ink-muted">
              Agreed amount: <span className="font-medium text-ink">£{job.agreedAmount}</span>
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {showMoney && (
            <StatusPill variant={paymentStatusVariant(job.paymentStatus)} label={job.paymentStatus} />
          )}
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

        {/* Payment only while unpaid; surveyor sits with access below. */}
        {(isTrade || (showMoney && job.paymentStatus !== "PAID")) && (
        <div
          className={`grid gap-6 ${isTrade ? "lg:grid-cols-3" : "lg:grid-cols-1"}`}
        >
          {showMoney && (isTrade || job.paymentStatus !== "PAID") && (
            <CrmPanel title="Payment">
              <div className="space-y-3">
                {isTrade && (
                  <p className="text-sm text-(--color-tc-40)">
                    Agreed amount: <strong>£{job.agreedAmount}</strong>
                  </p>
                )}
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
          )}

          {isTrade && showMoney && (
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
          )}

          {isTrade && (
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
          )}
        </div>
        )}

        {!isTrade && (
          <>
            {(panels.surveyor ||
              (panels.accessEditor && canManageAccess) ||
              (!canManageAccess && panels.accessReadOnly)) && (
            <CrmPanel title="Surveyor & access">
              <div className="space-y-6">
                {canManageAccess && job.accessDetailsPendingReview && (
                  <div className="rounded-xl border border-amber-300 bg-amber-50/50 p-4">
                    <p className="text-sm text-amber-900">
                      Client reply was parsed into the contact fields. Verify and confirm to request access.
                    </p>
                    {accessError && <p className="mt-2 text-sm text-red-600">{accessError}</p>}
                  </div>
                )}

                <div
                  className={`grid gap-6 ${
                    panels.surveyor && (panels.accessEditor || panels.accessReadOnly || canManageAccess)
                      ? "lg:grid-cols-2"
                      : "lg:grid-cols-1"
                  }`}
                >
                  {panels.surveyor && (
                    <section className="space-y-4 rounded-xl border border-line bg-sidebar/40 p-4 sm:p-5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-brand-muted text-brand">
                          <UserRound className="size-4" aria-hidden />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-ink">Surveyor</h3>
                          <p className="text-xs text-ink-muted">Assign before requesting access — no email yet</p>
                        </div>
                      </div>
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
                            <p className="text-xs text-amber-700">Assign a surveyor before requesting access.</p>
                          )}
                          {job.assignedTo && (
                            <p className="text-xs text-ink-muted">
                              Booking details go out when you mark Access Confirmed.
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-ink">{job.assignedTo?.fullName ?? "Unassigned"}</p>
                      )}
                    </section>
                  )}

                  {panels.accessEditor && canManageAccess ? (
                    <section className="space-y-4 rounded-xl border border-line bg-sidebar/40 p-4 sm:p-5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-brand-muted text-brand">
                          {accessContactKind === "agent" ? (
                            <Building2 className="size-4" aria-hidden />
                          ) : (
                            <UserRound className="size-4" aria-hidden />
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-ink">Estate agent / vendor</h3>
                          <p className="text-xs text-ink-muted">One contact for access</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <SelectField
                          label="Contact type"
                          value={accessContactKind}
                          onChange={(e) => switchAccessContactKind(e.target.value as AccessContactKind)}
                        >
                          <option value="agent">Estate agent</option>
                          <option value="vendor">Vendor / occupant</option>
                        </SelectField>
                        <TextField
                          label="Name"
                          value={accessContactKind === "agent" ? accessForm.agentName : accessForm.vendorName}
                          onChange={(e) =>
                            setAccessForm(
                              accessContactKind === "agent"
                                ? { ...accessForm, agentName: e.target.value }
                                : { ...accessForm, vendorName: e.target.value }
                            )
                          }
                        />
                        <TextField
                          label="Email"
                          type="email"
                          value={accessContactKind === "agent" ? accessForm.agentEmail : accessForm.vendorEmail}
                          onChange={(e) =>
                            setAccessForm(
                              accessContactKind === "agent"
                                ? { ...accessForm, agentEmail: e.target.value }
                                : { ...accessForm, vendorEmail: e.target.value }
                            )
                          }
                        />
                        <TextField
                          label="Phone"
                          type="tel"
                          value={accessContactKind === "agent" ? accessForm.agentPhone : accessForm.vendorPhone}
                          onChange={(e) =>
                            setAccessForm(
                              accessContactKind === "agent"
                                ? { ...accessForm, agentPhone: e.target.value }
                                : { ...accessForm, vendorPhone: e.target.value }
                            )
                          }
                        />
                      </div>
                    </section>
                  ) : (
                    (job.agentName ||
                      job.agentEmail ||
                      job.agentPhone ||
                      job.vendorName ||
                      job.vendorEmail ||
                      job.vendorPhone) && (
                      <section className="space-y-2 rounded-xl border border-line bg-sidebar/40 p-4 sm:p-5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-brand-muted text-brand">
                            {job.agentName || job.agentEmail || job.agentPhone ? (
                              <Building2 className="size-4" aria-hidden />
                            ) : (
                              <UserRound className="size-4" aria-hidden />
                            )}
                          </div>
                          <h3 className="text-sm font-medium text-ink">
                            {job.agentName || job.agentEmail || job.agentPhone
                              ? "Estate agent"
                              : "Vendor / occupant"}
                          </h3>
                        </div>
                        <dl className="space-y-1.5 text-sm">
                          <div>
                            <dt className="text-xs text-ink-muted">Name</dt>
                            <dd className="text-ink">{job.agentName || job.vendorName || "—"}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-ink-muted">Email</dt>
                            <dd className="text-ink">{job.agentEmail || job.vendorEmail || "—"}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-ink-muted">Phone</dt>
                            <dd className="text-ink">{job.agentPhone || job.vendorPhone || "—"}</dd>
                          </div>
                        </dl>
                      </section>
                    )
                  )}
                </div>

                {panels.accessEditor && canManageAccess && panels.showAccessNotes && (
                <section className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-brand-muted text-brand">
                      <KeyRound className="size-4" aria-hidden />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-ink">Access notes</h3>
                      <p className="text-xs text-ink-muted">Keys, alarms, parking, preferred times — add after you request access</p>
                    </div>
                  </div>
                  <textarea
                    id="access-notes"
                    rows={3}
                    value={accessForm.accessNotes}
                    onChange={(e) => setAccessForm({ ...accessForm, accessNotes: e.target.value })}
                    placeholder="e.g. Keysafe code, dog on site, call agent 30 mins before…"
                    className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-brand-light focus:ring-2 focus:ring-brand-muted"
                  />
                </section>
                )}

                {!canManageAccess && panels.showAccessNotes && job.accessNotes && (
                  <section className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-brand-muted text-brand">
                        <KeyRound className="size-4" aria-hidden />
                      </div>
                      <h3 className="text-sm font-medium text-ink">Access notes</h3>
                    </div>
                    <p className="whitespace-pre-wrap rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink">
                      {job.accessNotes}
                    </p>
                  </section>
                )}

                {panels.accessEditor && canManageAccess && (
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
                )}
              </div>
            </CrmPanel>
            )}

            <CrmPanel title="Survey workflow">
              <div className="space-y-6">
                {stageError && <p className="text-sm text-red-600">{stageError}</p>}

                <section className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-ink">Stage</h3>
                    <p className="text-xs text-ink-muted">
                      {canManageAccess
                        ? "Click a step to move the job forward — only that stage’s tasks show below"
                        : "Current job stage"}
                    </p>
                  </div>
                  <div className="overflow-x-auto pb-1">
                    <ol className="flex min-w-max items-stretch gap-1.5">
                      {SURVEY_STAGES.map((s, i) => {
                        const currentIndex = surveyStageIndex(job.stage);
                        const isCurrent = canonicalSurveyStage(job.stage) === s;
                        const isDone = currentIndex > i;
                        const needsReportFirst = s === "REPORT_DELIVERED" && !hasReportDocument;
                        const needsInspectionFirst =
                          s === "ACCESS_REQUESTED" &&
                          (!job.inspectionDate || !job.inspectionWindow?.trim());
                        return (
                          <li key={s} className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => canManageAccess && updateSurveyStage(s)}
                              disabled={!canManageAccess}
                              title={
                                !canManageAccess
                                  ? "Ops moves the job stage."
                                  : needsReportFirst
                                  ? "Upload a Report document first — it is attached to the client email"
                                  : needsInspectionFirst
                                    ? "Set proposed inspection date and arrival window first"
                                  : undefined
                              }
                              className={[
                                "rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors",
                                isCurrent
                                  ? "border-brand bg-brand text-white shadow-sm"
                                  : isDone
                                    ? "border-brand-light/40 bg-brand-muted text-brand"
                                    : "border-line bg-surface text-ink-muted",
                                canManageAccess && !isCurrent
                                  ? "hover:border-brand-light hover:text-ink"
                                  : "",
                                !canManageAccess ? "cursor-not-allowed" : "",
                                (needsReportFirst || needsInspectionFirst) && !isCurrent
                                  ? "opacity-60"
                                  : "",
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
                  {canManageAccess && panels.documents && !hasReportDocument && (
                      <p className="text-xs text-amber-700">
                        Upload a Report document before Report Delivered — the issued email attaches it
                        automatically.
                      </p>
                    )}
                </section>

                {(panels.preSiteCheckpoints || panels.inspectionDetails) && (
                <div
                  className={`grid gap-6 ${
                    panels.preSiteCheckpoints && panels.inspectionDetails ? "lg:grid-cols-2" : "lg:grid-cols-1"
                  }`}
                >
                  {panels.preSiteCheckpoints && (
                  <section className="space-y-4 rounded-xl border border-line bg-sidebar/40 p-4 sm:p-5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-brand-muted text-brand">
                        <CheckSquare className="size-4" aria-hidden />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-ink">Pre-site checkpoints</h3>
                        <p className="text-xs text-ink-muted">
                          {canTickCheckpoints
                            ? "Tick these before attending site. Ops can see your progress."
                            : "The assigned surveyor marks these before attending site."}
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
                          className={`flex items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink ${
                            canTickCheckpoints ? "cursor-pointer" : "cursor-not-allowed"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(job[field])}
                            disabled={!canTickCheckpoints}
                            onChange={(e) => toggleSurveyorCheckpoint(field, e.target.checked)}
                            className="size-4 rounded border-line text-brand focus:ring-brand-muted disabled:cursor-not-allowed"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </section>
                  )}

                  {panels.inspectionDetails && (
                  <section className="flex flex-col space-y-4 rounded-xl border border-line bg-sidebar/40 p-4 sm:p-5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-brand-muted text-brand">
                        <CalendarDays className="size-4" aria-hidden />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-ink">
                          {panels.inspectionDetailsProposed ? "Proposed inspection" : "Inspection"}
                        </h3>
                        <p className="text-xs text-ink-muted">
                          {canSetInspectionDate
                            ? panels.inspectionDetailsProposed
                              ? "Required before the access request email to the agent"
                              : "Booked date and arrival window for the site visit"
                            : "Set by ops — shown for your diary"}
                        </p>
                      </div>
                    </div>
                    {canSetInspectionDate ? (
                      <>
                        <TextField
                          label="Date"
                          type="date"
                          value={inspectionDate}
                          onChange={(e) => setInspectionDate(e.target.value)}
                        />
                        <SelectField
                          label="Arrival window"
                          value={inspectionWindow}
                          onChange={(e) => setInspectionWindow(e.target.value)}
                        >
                          <option value="">Select window</option>
                          {INSPECTION_WINDOWS.map((window) => (
                            <option key={window} value={window}>
                              {window}
                            </option>
                          ))}
                          {inspectionWindow &&
                            !(INSPECTION_WINDOWS as readonly string[]).includes(inspectionWindow) && (
                              <option value={inspectionWindow}>{inspectionWindow}</option>
                            )}
                        </SelectField>
                        {inspectionError && (
                          <p className="text-sm text-red-600">{inspectionError}</p>
                        )}
                        {!inspectionDate.trim() || !inspectionWindow.trim() ? (
                          <p className="text-xs text-amber-700">
                            Date and arrival window are included in the Access Request and surveyor emails.
                          </p>
                        ) : null}
                        <div className="mt-auto flex justify-end border-t border-line pt-3">
                          <SecondaryButton
                            type="button"
                            size="small"
                            className="w-auto"
                            onClick={saveInspectionDetails}
                            disabled={savingInspection}
                          >
                            {savingInspection ? "Saving…" : "Save"}
                          </SecondaryButton>
                        </div>
                      </>
                    ) : (
                      <dl className="space-y-2 text-sm">
                        <div>
                          <dt className="text-xs text-ink-muted">Date</dt>
                          <dd className="text-ink">
                            {inspectionDate
                              ? new Date(`${inspectionDate}T12:00:00`).toLocaleDateString("en-GB", {
                                  weekday: "long",
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })
                              : "Not set yet"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-ink-muted">Arrival window</dt>
                          <dd className="text-ink">{inspectionWindow.trim() || "Not set yet"}</dd>
                        </div>
                      </dl>
                    )}
                  </section>
                  )}
                </div>
                )}

                {panels.dataCapture && (
                <section className="space-y-4 rounded-xl border border-line bg-sidebar/40 p-4 sm:p-5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-brand-muted text-brand">
                      <ClipboardList className="size-4" aria-hidden />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-ink">After inspection</h3>
                      <p className="text-xs text-ink-muted">
                        Mark when site data is captured on the surveyor’s reporting system. The report PDF is uploaded later.
                      </p>
                    </div>
                  </div>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink">
                    <input
                      type="checkbox"
                      checked={Boolean(job.dataCaptureComplete)}
                      onChange={toggleDataCapture}
                      className="size-4 rounded border-line text-brand focus:ring-brand-muted"
                    />
                    Data captured on surveyor’s reporting system
                  </label>
                </section>
                )}

                {panels.reviewRequest && canManageAccess && (
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

            {panels.earlierDetails && canManageAccess && (
              <details className="rounded-xl border border-line bg-surface">
                <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-ink">
                  Earlier details — surveyor &amp; access
                </summary>
                <div className="space-y-4 border-t border-line px-4 py-4">
                  {!panels.surveyor && (
                  <div>
                    <p className="text-xs text-ink-muted">Surveyor</p>
                    {canAssignSurveyor ? (
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
                    ) : (
                      <p className="text-sm text-ink">{job.assignedTo?.fullName ?? "Unassigned"}</p>
                    )}
                  </div>
                  )}
                  <div className="grid gap-4 text-sm lg:grid-cols-1">
                    <div>
                      <p className="text-xs text-ink-muted">
                        {job.agentName || job.agentEmail || job.agentPhone
                          ? "Estate agent"
                          : "Vendor / occupant"}
                      </p>
                      <p className="text-ink">{job.agentName || job.vendorName || "—"}</p>
                      <p className="text-ink-muted">{job.agentEmail || job.vendorEmail || "—"}</p>
                      <p className="text-ink-muted">{job.agentPhone || job.vendorPhone || "—"}</p>
                    </div>
                  </div>
                  {job.accessNotes && (
                    <div>
                      <p className="text-xs text-ink-muted">Access notes</p>
                      <p className="whitespace-pre-wrap text-sm text-ink">{job.accessNotes}</p>
                    </div>
                  )}
                  {inspectionDate && (
                    <div>
                      <p className="text-xs text-ink-muted">Inspection date</p>
                      <p className="text-sm text-ink">
                        {new Date(`${inspectionDate}T12:00:00`).toLocaleDateString("en-GB", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </details>
            )}

            {(panels.documents || panels.paymentsHistory) && (
            <div className={`grid gap-6 ${showMoney && panels.paymentsHistory ? "lg:grid-cols-2" : "lg:grid-cols-1"}`}>
              {showMoney && panels.paymentsHistory && (
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
              )}

              {panels.documents && (
              <CrmPanel title="Documents">
                <div className="space-y-4">
                  {panels.documentsUpload && (
                    <div className="flex flex-wrap items-end gap-3">
                      <SelectField
                        label="Type"
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                      >
                        <option value="REPORT">Report</option>
                        <option value="ACTION_PLAN">Action plan</option>
                        <option value="COSTING">Costing</option>
                        <option value="OTHER">Other</option>
                      </SelectField>
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <label htmlFor="job-document-file" className="block text-sm font-medium text-ink">
                          File
                        </label>
                        <input
                          id="job-document-file"
                          type="file"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.gif"
                          onChange={(e) => {
                            setDocError(null);
                            setDocFile(e.target.files?.[0] ?? null);
                          }}
                          className="block w-full text-sm text-ink file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:opacity-90"
                        />
                      </div>
                      <SecondaryButton
                        type="button"
                        size="small"
                        className="w-auto shrink-0"
                        onClick={uploadDocument}
                        disabled={!docFile || uploadingDoc}
                      >
                        {uploadingDoc ? "Uploading…" : "Upload"}
                      </SecondaryButton>
                    </div>
                  )}
                  {docError && <p className="text-sm text-red-600">{docError}</p>}

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
                    <p className="text-sm text-ink-muted">No documents yet</p>
                  )}
                </div>
              </CrmPanel>
              )}
            </div>
            )}
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

      <ConfirmModal
        isOpen={showMoney && markPaidConfirmOpen}
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
