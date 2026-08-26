"use client";

import { useEffect, useRef, useState, type CSSProperties, type DragEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { api } from "@/crm/lib/api";
import {
  canBypassJobQc,
  canEditInspectionDate,
  canManageJobAccessDetails,
  canMutateLeads,
  canTickJobQc,
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
import { ArrowLeft, Building2, CalendarDays, CheckSquare, ClipboardList, FileText, KeyRound, Loader2, Upload, UserRound, Wallet } from "lucide-react";
import {
  canonicalSurveyStage,
  formatJobStageLabel,
  stageMoveEmailWarning,
  SURVEY_JOB_STAGES,
  surveyorMaySetSurveyStage,
} from "@/crm/lib/jobStages";
import { isJobQcComplete, QC_INCOMPLETE_MESSAGE, QC_TICKS } from "@/crm/lib/jobQc";
import { doneTopProgress, startTopProgress } from "@/crm/lib/topProgress";
import { cn } from "@/lib/utils";

const DOC_TYPE_LABELS: Record<string, string> = {
  REPORT: "Report",
  ACTION_PLAN: "Action plan",
  COSTING: "Costing",
  OTHER: "Other",
};

const DOC_FILE_ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.gif";
const DROP_SPRING = { type: "spring", stiffness: 420, damping: 32, mass: 0.7 } as const;

function JobDocumentsFields({
  docType,
  docFile,
  docError,
  uploadingDoc,
  documents,
  showUpload,
  onTypeChange,
  onFileChange,
  onUpload,
}: {
  docType: string;
  docFile: File | null;
  docError: string | null;
  uploadingDoc: boolean;
  documents: JobDocument[];
  showUpload: boolean;
  onTypeChange: (type: string) => void;
  onFileChange: (file: File | null) => void;
  onUpload: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCount = useRef(0);
  const [dragOver, setDragOver] = useState(false);
  const reduceMotion = useReducedMotion();

  function isFileDrag(e: DragEvent) {
    return Array.from(e.dataTransfer.types).includes("Files");
  }

  function onDragEnter(e: DragEvent) {
    if (uploadingDoc || !isFileDrag(e)) return;
    e.preventDefault();
    e.stopPropagation();
    dragCount.current += 1;
    setDragOver(true);
  }

  function onDragOver(e: DragEvent) {
    if (uploadingDoc || !isFileDrag(e)) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  }

  function onDragLeave(e: DragEvent) {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    e.stopPropagation();
    dragCount.current = Math.max(0, dragCount.current - 1);
    if (dragCount.current === 0) setDragOver(false);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragCount.current = 0;
    setDragOver(false);
    if (uploadingDoc) return;
    const file = e.dataTransfer.files?.[0];
    if (file) onFileChange(file);
  }

  return (
    <div className="space-y-4">
      {showUpload && (
        <div className="space-y-3">
          <input
            ref={inputRef}
            id="job-document-file"
            type="file"
            accept={DOC_FILE_ACCEPT}
            className="sr-only"
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
          />
          <motion.div
            role="button"
            tabIndex={uploadingDoc ? -1 : 0}
            aria-disabled={uploadingDoc}
            onClick={() => {
              if (!uploadingDoc) inputRef.current?.click();
            }}
            onKeyDown={(e) => {
              if (uploadingDoc) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            animate={
              reduceMotion
                ? undefined
                : { scale: dragOver ? 1.015 : 1 }
            }
            transition={DROP_SPRING}
            className={cn(
              "flex min-h-[8.5rem] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-[border-color,background-color,box-shadow] duration-200",
              uploadingDoc ? "cursor-not-allowed opacity-60" : "cursor-pointer",
              dragOver
                ? "border-brand bg-brand-muted/40 shadow-[0_0_0_4px_rgb(109_40_217_/_0.12)]"
                : "border-line bg-surface hover:border-brand-light hover:bg-brand-muted/20",
            )}
          >
            <span
              className={cn(
                "flex size-10 items-center justify-center rounded-lg transition-colors duration-200",
                dragOver ? "bg-brand text-white" : "bg-brand-muted text-brand",
              )}
            >
              <Upload className="size-5" aria-hidden />
            </span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={dragOver ? "over" : docFile ? "file" : "idle"}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="space-y-0.5"
              >
                {dragOver ? (
                  <span className="block text-sm font-medium text-brand">Drop here</span>
                ) : docFile ? (
                  <>
                    <span className="block text-sm font-medium text-ink">{docFile.name}</span>
                    <span className="block text-xs text-ink-muted">Click or drop another file to replace</span>
                  </>
                ) : (
                  <>
                    <span className="block text-sm font-medium text-ink">Drop a file here, or click to browse</span>
                    <span className="block text-xs text-ink-muted">PDF, Word, Excel, or image</span>
                  </>
                )}
              </motion.span>
            </AnimatePresence>
          </motion.div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <SelectField
              label="Type"
              value={docType}
              onChange={(e) => onTypeChange(e.target.value)}
              className="min-w-[11rem]"
            >
              <option value="REPORT">Report</option>
              <option value="ACTION_PLAN">Action plan</option>
              <option value="COSTING">Costing</option>
              <option value="OTHER">Other</option>
            </SelectField>
            <PrimaryButton
              type="button"
              className="ml-auto w-auto shrink-0 px-6"
              onClick={onUpload}
              disabled={!docFile || uploadingDoc}
            >
              {uploadingDoc ? "Uploading…" : "Upload"}
            </PrimaryButton>
          </div>
        </div>
      )}
      {docError && <p className="text-sm text-red-600">{docError}</p>}
      {documents.length > 0 ? (
        <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
          {documents.map((d) => (
            <li key={d.id}>
              <a
                href={d.storageUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-ink transition-colors hover:bg-sidebar hover:text-brand"
              >
                <FileText className="size-4 shrink-0 text-brand" aria-hidden />
                <span className="min-w-0 flex-1 truncate">{d.filename}</span>
                <span className="shrink-0 text-xs text-ink-muted">
                  {DOC_TYPE_LABELS[d.type] ?? d.type}
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        showUpload ? null : <p className="text-sm text-ink-muted">No documents yet</p>
      )}
    </div>
  );
}

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
function surveyStagePanels(stage: string) {
  const canonical = canonicalSurveyStage(stage);
  const is = (...stages: string[]) => stages.includes(canonical);

  return {
    startAccessRequest: is("PAID"),
    surveyor: is("ACCESS_REQUESTED"),
    accessEditor: is("ACCESS_REQUESTED"),
    accessReadOnly: is("ACCESS_CONFIRMED"),
    accessNotesEditor: is("ACCESS_CONFIRMED"),
    showAccessNotes: is("ACCESS_CONFIRMED"),
    preSiteCheckpoints: is("INSPECTION_BOOKED"),
    inspectionDetails: is("INSPECTION_BOOKED"),
    inspectionDetailsProposed: is("ACCESS_REQUESTED"),
    dataCapture: is("DATA_UPLOAD"),
    qcChecks: is("REPORT_QC"),
    documents: is("REPORT_DELIVERED"),
    documentsUpload: is("REPORT_DELIVERED"),
    reviewRequest: is("REPORT_DELIVERED"),
    paymentsHistory: is("REPORT_DELIVERED"),
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
  const [stageError, setStageError] = useState<string | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [accessSaved, setAccessSaved] = useState(false);
  const [savingAccess, setSavingAccess] = useState(false);
  const [confirmingAccess, setConfirmingAccess] = useState(false);
  const [pendingStage, setPendingStage] = useState<string | null>(null);
  const [stageSaving, setStageSaving] = useState(false);
  const [justMovedStage, setJustMovedStage] = useState<string | null>(null);
  const [pendingSurveyorId, setPendingSurveyorId] = useState<string | null>(null);
  const [assigningSurveyor, setAssigningSurveyor] = useState(false);
  const [assignSurveyorError, setAssignSurveyorError] = useState<string | null>(null);
  const [notifyingSurveyor, setNotifyingSurveyor] = useState(false);
  const [issueReportOpen, setIssueReportOpen] = useState(false);
  const [issuingReport, setIssuingReport] = useState(false);
  const [issueReportError, setIssueReportError] = useState<string | null>(null);

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
  const canTickQc = role ? canTickJobQc(role) : false;
  const bypassQc = role ? canBypassJobQc(role) : false;

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
  const panels = surveyStagePanels(job.stage);
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

  async function requestStageMove(stage: string) {
    if (!job) return;
    if (job.jobType === "TRADE_WORK") {
      if (job.stage === stage) return;
      setStageError(null);
      setPendingStage(stage);
      return;
    }
    if (canonicalSurveyStage(job.stage) === stage) return;
    setStageError(null);
    if (stage === "REPORT_QC" && role === "SURVEYOR" && !job.dataCaptureComplete) {
      setStageError("Tick data upload before moving to Quality Control");
      return;
    }
    if (stage === "REPORT_DELIVERED" && !bypassQc && !isJobQcComplete(job)) {
      setStageError(QC_INCOMPLETE_MESSAGE);
      return;
    }
    setPendingStage(stage);
  }

  async function confirmStageMove() {
    if (!pendingStage || stageSaving) return;
    const stage = pendingStage;
    setStageSaving(true);
    startTopProgress();
    try {
      await api.updateJobStage(id, stage);
      setPendingStage(null);
      setJustMovedStage(stage);
      toast.success(`Moved to ${formatJobStageLabel(stage, job?.jobType)}`);
      window.setTimeout(() => setJustMovedStage(null), 1400);
      await reload();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not update stage";
      setStageError(msg);
      toast.error(msg);
    } finally {
      doneTopProgress();
      setStageSaving(false);
    }
  }

  async function updateTradeStage(stage: string) {
    void requestStageMove(stage);
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
      await api.updateJob(id, {
        ...accessDetailsPayload(),
        inspectionDate: inspectionDate.trim()
          ? new Date(`${inspectionDate}T12:00:00.000Z`).toISOString()
          : null,
        inspectionWindow: normalizeInspectionWindow(inspectionWindow) || null,
      });
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
      setAccessError(e instanceof Error ? e.message : "Could not request access");
    } finally {
      setConfirmingAccess(false);
    }
  }

  async function notifySurveyor() {
    setAccessError(null);
    setAccessSaved(false);
    setNotifyingSurveyor(true);
    try {
      await api.updateJob(id, accessDetailsPayload());
      await api.notifyJobSurveyor(id, { accessNotes: accessForm.accessNotes });
      toast.success("Surveyor notified");
      await reload();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not notify surveyor";
      setAccessError(msg);
      toast.error(msg);
    } finally {
      setNotifyingSurveyor(false);
    }
  }

  function surveyorName(surveyorId: string) {
    if (!surveyorId) return "Unassigned";
    return (
      surveyors.find((s) => s.id === surveyorId)?.fullName ??
      job?.assignedTo?.fullName ??
      "this surveyor"
    );
  }

  function requestAssignSurveyor(surveyorId: string) {
    if ((job?.assignedTo?.id ?? "") === surveyorId) return;
    setAssignSurveyorError(null);
    setPendingSurveyorId(surveyorId);
    startTopProgress();
  }

  async function confirmAssignSurveyor() {
    if (pendingSurveyorId === null || assigningSurveyor) return;
    const surveyorId = pendingSurveyorId;
    setAssigningSurveyor(true);
    startTopProgress();
    try {
      await api.updateJob(id, { assignedToId: surveyorId || null });
      toast.success(surveyorId ? `Assigned ${surveyorName(surveyorId)}` : "Surveyor unassigned");
      await reload();
      setPendingSurveyorId(null);
      setAssignSurveyorError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not assign surveyor";
      setAssignSurveyorError(msg);
      toast.error(msg);
    } finally {
      doneTopProgress();
      setAssigningSurveyor(false);
    }
  }

  async function toggleDataCapture() {
    await api.updateJob(id, { dataCaptureComplete: !job?.dataCaptureComplete });
    reload();
  }

  async function toggleQcField(
    field: "qcOttoReviewComplete" | "qcRicsPassConfirmed" | "qcLevelDeliverableComplete",
    value: boolean
  ) {
    if (!canTickQc) return;
    setJob((j) => (j ? { ...j, [field]: value } : j));
    try {
      await api.updateJob(id, { [field]: value });
      await reload();
    } catch (e) {
      await reload();
      toast.error(e instanceof Error ? e.message : "Could not update QC check");
    }
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

  async function confirmIssueReport() {
    if (issuingReport) return;
    setIssuingReport(true);
    setIssueReportError(null);
    startTopProgress();
    try {
      await api.issueJobReport(id);
      setIssueReportOpen(false);
      toast.success("Report sent to the client");
      await reload();
    } catch (e) {
      setIssueReportError(e instanceof Error ? e.message : "Could not send the report");
    } finally {
      doneTopProgress();
      setIssuingReport(false);
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
          <h1 className="flex flex-wrap items-baseline gap-x-2 text-2xl font-bold leading-none text-(--color-tc-40)">
            <span>{job.jobNumber}</span>
            {job.leadId ? (
              <>
                <span className="font-normal">—</span>
                <Link
                  href={`/crm/leads/${job.leadId}`}
                  className="font-medium text-brand hover:underline"
                >
                  View lead
                </Link>
              </>
            ) : null}
          </h1>
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
          {showMoney && (
            <StatusPill variant={paymentStatusVariant(job.paymentStatus)} label={job.paymentStatus} />
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
                    style={
                      job.stage === s
                        ? activeStageStyle
                        : justMovedStage === s
                          ? { boxShadow: "0 0 0 2px var(--color-primary)" }
                          : undefined
                    }
                    className="w-auto"
                    onClick={() => updateTradeStage(s)}
                    disabled={job.stage === s}
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
            <CrmPanel title="Survey workflow">
              <div className="space-y-6">
                {stageError && <p className="text-sm text-red-600">{stageError}</p>}

                <section className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-ink">Stage</h3>
                    <p className="text-xs text-ink-muted">
                      {canManageAccess || role === "SURVEYOR"
                        ? "Click a step to move the job — you’ll confirm before it saves"
                        : "Current job stage"}
                    </p>
                  </div>
                  <div className="overflow-x-auto pb-5">
                    <ol className="flex min-w-max items-stretch gap-1.5">
                      {SURVEY_STAGES.map((s, i) => {
                        const currentIndex = surveyStageIndex(job.stage);
                        const isCurrent = canonicalSurveyStage(job.stage) === s;
                        const isDone = currentIndex > i;
                        const surveyorCanClick =
                          role === "SURVEYOR" && surveyorMaySetSurveyStage(job.stage, s);
                        const canClick = !isCurrent && (canManageAccess || surveyorCanClick);
                        const needsDataCaptureFirst =
                          s === "REPORT_QC" && role === "SURVEYOR" && !job.dataCaptureComplete;
                        const justMoved = justMovedStage === s && isCurrent;
                        return (
                          <li key={s} className="flex items-stretch gap-1.5">
                            <button
                              type="button"
                              onClick={() => canClick && void requestStageMove(s)}
                              disabled={!canClick}
                              title={
                                isCurrent
                                  ? "Current stage"
                                  : !canClick
                                  ? "Ops moves this stage."
                                  : needsDataCaptureFirst
                                    ? "Tick data upload first"
                                  : undefined
                              }
                              className={[
                                "flex h-14 shrink-0 flex-col justify-center whitespace-nowrap rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors",
                                isCurrent
                                  ? "border-brand bg-brand text-white shadow-sm"
                                  : isDone
                                    ? "border-brand-light/40 bg-brand-muted text-brand"
                                    : "border-line bg-surface text-ink-muted",
                                canClick ? "hover:border-brand-light hover:text-ink" : "",
                                !canClick ? "cursor-not-allowed" : "",
                                justMoved ? "ring-2 ring-brand ring-offset-2" : "",
                                needsDataCaptureFirst && !isCurrent
                                  ? "opacity-60"
                                  : "",
                              ].join(" ")}
                            >
                              <span className="block tabular-nums text-[10px] opacity-70">
                                {String(i + 1).padStart(2, "0")}
                              </span>
                              <span className="mt-0.5 block whitespace-nowrap leading-snug">
                                {formatJobStageLabel(s)}
                              </span>
                            </button>
                            {i < SURVEY_STAGES.length - 1 && (
                              <span
                                className={`hidden h-px w-3 shrink-0 self-center sm:block ${
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
                  {panels.startAccessRequest && canManageAccess && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-sidebar/40 px-4 py-3">
                      <p className="text-xs text-ink-muted">
                        Paid is complete. Start the access request when you are ready to assign a surveyor and contact.
                      </p>
                      <PrimaryButton
                        type="button"
                        className="w-auto shrink-0 px-6"
                        onClick={() => void requestStageMove("ACCESS_REQUESTED")}
                      >
                        Start access request
                      </PrimaryButton>
                    </div>
                  )}
                  {canonicalSurveyStage(job.stage) === "REPORT_DELIVERED" && !job.reportDeliveredAt && !hasReportDocument && (
                    <p className="text-xs text-amber-700">
                      Upload a Report on this stage, then submit it to send it to the client.
                    </p>
                  )}
                </section>

                {canManageAccess && job.accessDetailsPendingReview && (
                  <div className="rounded-xl border border-amber-300 bg-amber-50/50 p-4">
                    <p className="text-sm text-amber-900">
                      Client reply was parsed into the contact fields. Verify and confirm to request access.
                    </p>
                    {accessError && <p className="mt-2 text-sm text-red-600">{accessError}</p>}
                  </div>
                )}

                {(panels.surveyor || panels.accessEditor || panels.accessReadOnly) && (
                <div
                  className={`grid gap-6 ${
                    panels.surveyor && (panels.accessEditor || panels.accessReadOnly)
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
                            value={pendingSurveyorId ?? job.assignedTo?.id ?? ""}
                            disabled={assigningSurveyor || pendingSurveyorId !== null}
                            className={pendingSurveyorId !== null ? "border-brand-light ring-2 ring-brand-muted" : undefined}
                            onChange={(e) => requestAssignSurveyor(e.target.value)}
                          >
                            <option value="">Unassigned</option>
                            {surveyors.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.fullName}
                              </option>
                            ))}
                          </SelectField>
                          {(pendingSurveyorId !== null || assigningSurveyor) && (
                            <p className="flex items-center gap-1.5 text-xs text-brand">
                              <Loader2 className="size-3.5 animate-spin" aria-hidden />
                              {assigningSurveyor ? "Saving assignment…" : "Confirm to assign"}
                            </p>
                          )}
                          {!job.assignedTo && pendingSurveyorId === null && (
                            <p className="text-xs text-amber-700">Assign a surveyor before requesting access.</p>
                          )}
                          {job.assignedTo && !assigningSurveyor && (
                            <p className="text-xs text-ink-muted">
                              Booking details go out when you notify the surveyor.
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
                    (panels.accessEditor || panels.accessReadOnly) &&
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
                )}

                {panels.accessNotesEditor && (
                <section className="space-y-2 rounded-xl border border-line bg-sidebar/40 p-4 sm:p-5">
                  <h3 className="text-sm font-medium text-ink">Inspection</h3>
                  <dl className="grid gap-3 text-sm sm:grid-cols-3">
                    <div>
                      <dt className="text-xs text-ink-muted">Surveyor</dt>
                      <dd className="flex flex-wrap items-center gap-2 text-ink">
                        <span>{job.assignedTo?.fullName ?? "Unassigned"}</span>
                        {job.surveyorNotifiedAt ? (
                          <StatusPill variant="completed" label="Surveyor notified" />
                        ) : null}
                      </dd>
                    </div>
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
                </section>
                )}

                {panels.accessEditor && canManageAccess && panels.inspectionDetailsProposed && (
                <section className="space-y-4 rounded-xl border border-line bg-sidebar/40 p-4 sm:p-5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-brand-muted text-brand">
                      <CalendarDays className="size-4" aria-hidden />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-ink">Proposed inspection</h3>
                      <p className="text-xs text-ink-muted">
                        Required before the access request email to the agent
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

                {panels.accessNotesEditor && canManageAccess && (
                <section className="space-y-3 rounded-xl border border-line bg-sidebar/40 p-4 sm:p-5">
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
                  <section className="space-y-2 rounded-xl border border-line bg-sidebar/40 p-4 sm:p-5">
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
                        Save a draft anytime. Request access when ready to email the contact.
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
                      {confirmingAccess ? "Requesting…" : "Request Access"}
                    </PrimaryButton>
                  </div>
                </div>
                )}

                {panels.accessNotesEditor && canManageAccess && (
                <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    {job.surveyorNotifiedAt ? (
                      <p className="text-xs text-emerald-700">
                        Surveyor notified {new Date(job.surveyorNotifiedAt).toLocaleString()}
                      </p>
                    ) : (
                      <p className="text-xs text-ink-muted">
                        Save a draft anytime. Notify the surveyor when access notes are ready.
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
                      disabled={savingAccess || notifyingSurveyor}
                    >
                      {savingAccess ? "Saving…" : "Save draft"}
                    </SecondaryButton>
                    {job.surveyorNotifiedAt ? (
                      <>
                        <PrimaryButton type="button" className="w-auto px-6" disabled>
                          Surveyor notified
                        </PrimaryButton>
                        <SecondaryButton
                          type="button"
                          size="small"
                          className="w-auto"
                          onClick={notifySurveyor}
                          disabled={savingAccess || notifyingSurveyor || !job.assignedTo}
                        >
                          {notifyingSurveyor ? "Notifying…" : "Notify again"}
                        </SecondaryButton>
                      </>
                    ) : (
                      <PrimaryButton
                        type="button"
                        className="w-auto px-6"
                        onClick={notifySurveyor}
                        disabled={savingAccess || notifyingSurveyor || !job.assignedTo}
                      >
                        {notifyingSurveyor ? "Notifying…" : "Notify Surveyor"}
                      </PrimaryButton>
                    )}
                  </div>
                </div>
                )}
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
                        <h3 className="text-sm font-medium text-ink">Inspection</h3>
                        <p className="text-xs text-ink-muted">Booked date and arrival window for the site visit</p>
                      </div>
                    </div>
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
                  </section>
                  )}
                </div>
                )}

                {panels.qcChecks && (
                <section className="space-y-4 rounded-xl border border-line bg-sidebar/40 p-4 sm:p-5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-brand-muted text-brand">
                      <CheckSquare className="size-4" aria-hidden />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-ink">QC before report submission</h3>
                      <p className="text-xs text-ink-muted">
                        All three must be checked before moving to Submit Report.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {QC_TICKS.map((tick) => (
                      <label
                        key={tick.field}
                        className={`flex items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink ${canTickQc ? "cursor-pointer" : "cursor-not-allowed opacity-80"}`}
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(job[tick.field])}
                          disabled={!canTickQc}
                          onChange={(e) => void toggleQcField(tick.field, e.target.checked)}
                          className="size-4 rounded border-line text-brand focus:ring-brand-muted"
                        />
                        {tick.label}
                      </label>
                    ))}
                  </div>
                </section>
                )}

                {(panels.dataCapture || panels.documents || panels.paymentsHistory) && (
                <div
                  className={`grid gap-6 ${
                    !panels.dataCapture && showMoney && panels.paymentsHistory && panels.documents
                      ? "lg:grid-cols-2"
                      : "lg:grid-cols-1"
                  }`}
                >
                  {panels.dataCapture && (
                  <section className="space-y-5 rounded-xl border border-line bg-sidebar/40 p-4 sm:p-5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-brand-muted text-brand">
                        <ClipboardList className="size-4" aria-hidden />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-ink">Data upload</h3>
                        <p className="text-xs text-ink-muted">
                          Tick when inspection data is in the reporting software. Data upload must be done by 5pm on the day of inspection.
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

                  {showMoney && panels.paymentsHistory && (
                  <section className="space-y-4 rounded-xl border border-line bg-sidebar/40 p-4 sm:p-5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-brand-muted text-brand">
                        <Wallet className="size-4" aria-hidden />
                      </div>
                      <h3 className="text-sm font-medium text-ink">Payments history</h3>
                    </div>
                    {(job.payments ?? []).length === 0 ? (
                      <p className="text-sm text-ink-muted">No payments recorded</p>
                    ) : (
                      <div className="space-y-2">
                        {job.payments!.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface px-3 py-2.5"
                          >
                            <span className="text-sm font-medium tabular-nums text-ink">£{p.amount}</span>
                            <StatusPill variant={paymentStatusVariant(p.status)} label={p.status} />
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                  )}

                  {panels.documents && !panels.dataCapture && (
                  <section className="space-y-4 rounded-xl border border-line bg-sidebar/40 p-4 sm:p-5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-brand-muted text-brand">
                        <FileText className="size-4" aria-hidden />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-ink">Report</h3>
                        <p className="text-xs text-ink-muted">
                          {job.reportDeliveredAt
                            ? "Report has been sent to the client."
                            : "Upload the report here, then submit to email it to the client."}
                        </p>
                      </div>
                    </div>
                    <JobDocumentsFields
                      docType={docType}
                      docFile={docFile}
                      docError={docError}
                      uploadingDoc={uploadingDoc}
                      documents={documents}
                      showUpload={Boolean(panels.documentsUpload) && !job.reportDeliveredAt}
                      onTypeChange={setDocType}
                      onFileChange={(file) => {
                        setDocError(null);
                        setDocFile(file);
                      }}
                      onUpload={uploadDocument}
                    />
                    {canManageAccess && !job.reportDeliveredAt && (
                      <div className="flex justify-end">
                        <PrimaryButton
                          type="button"
                          className="w-auto shrink-0 px-6"
                          disabled={!hasReportDocument}
                          onClick={() => {
                            setIssueReportError(null);
                            setIssueReportOpen(true);
                          }}
                        >
                          Submit report
                        </PrimaryButton>
                      </div>
                    )}
                    {canManageAccess && job.reportDeliveredAt && (
                      <p className="text-xs text-emerald-700">
                        Sent {new Date(job.reportDeliveredAt).toLocaleString()}
                      </p>
                    )}
                    {!canManageAccess && !job.reportDeliveredAt && (
                      <p className="text-xs text-ink-muted">Ops sends this report to the client after you upload it.</p>
                    )}
                  </section>
                  )}
                </div>
                )}

                {panels.reviewRequest && canManageAccess && job.reportDeliveredAt && (
                  <section className="flex flex-col gap-3 rounded-xl border border-line bg-sidebar/40 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
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
                  </section>
                )}
              </div>
            </CrmPanel>
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
        isOpen={pendingSurveyorId !== null}
        title={
          pendingSurveyorId === ""
            ? "Unassign surveyor?"
            : `Assign ${pendingSurveyorId ? surveyorName(pendingSurveyorId) : "surveyor"}?`
        }
        description={
          pendingSurveyorId === ""
            ? `This removes ${job?.assignedTo?.fullName ?? "the surveyor"} from the job. You’ll need to assign someone before requesting access.`
            : job?.assignedTo && job.assignedTo.id !== pendingSurveyorId
              ? `This replaces ${job.assignedTo.fullName} with ${surveyorName(pendingSurveyorId ?? "")}. No email is sent yet.`
              : `This assigns ${surveyorName(pendingSurveyorId ?? "")} to the job. No email is sent yet — booking details go out when you notify the surveyor.`
        }
        confirmLabel={pendingSurveyorId === "" ? "Unassign" : "Assign surveyor"}
        loading={assigningSurveyor}
        error={assignSurveyorError ?? undefined}
        onConfirm={() => void confirmAssignSurveyor()}
        onCancel={() => {
          if (assigningSurveyor) return;
          setPendingSurveyorId(null);
          setAssignSurveyorError(null);
          doneTopProgress();
        }}
      />

      <ConfirmModal
        isOpen={Boolean(pendingStage)}
        title={pendingStage ? `Move to ${formatJobStageLabel(pendingStage, job?.jobType)}?` : "Move stage?"}
        description={
          pendingStage
            ? [
                `This moves the job to ${formatJobStageLabel(pendingStage, job?.jobType)}.`,
                stageMoveEmailWarning(pendingStage),
              ]
                .filter(Boolean)
                .join(" ")
            : undefined
        }
        confirmLabel="Move stage"
        loading={stageSaving}
        error={stageError ?? undefined}
        onConfirm={() => void confirmStageMove()}
        onCancel={() => {
          if (stageSaving) return;
          setPendingStage(null);
        }}
      />

      <ConfirmModal
        isOpen={issueReportOpen}
        title="Send report to client?"
        description={
          job
            ? [
                job.customer?.email
                  ? `This emails ${[job.customer.firstName, job.customer.lastName].filter(Boolean).join(" ") || "the client"} at ${job.customer.email} with the uploaded report attached.`
                  : "This emails the client with the uploaded report attached.",
                "The Report Issued workflow also copies anyone already on that send, including the monitoring inbox.",
              ].join(" ")
            : undefined
        }
        confirmLabel="Send report"
        loading={issuingReport}
        error={issueReportError ?? undefined}
        onConfirm={() => void confirmIssueReport()}
        onCancel={() => {
          if (issuingReport) return;
          setIssueReportOpen(false);
          setIssueReportError(null);
        }}
      />

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
