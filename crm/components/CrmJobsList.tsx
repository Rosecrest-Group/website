"use client";

import { useEffect, useState, type SyntheticEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/crm/lib/api";
import { getCachedCurrentUser } from "@/crm/lib/currentUserCache";
import { getListPageCache, setListPageCache } from "@/crm/lib/listPageCache";
import { canMutateLeads, canViewJobMoney } from "@/crm/lib/rbac";
import type { Job, UserRole } from "@/crm/types";
import { cn } from "@/lib/utils";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import Table, { type Column } from "@/crm/components/ui/Table";
import SelectField from "@/crm/components/ui/SelectField";
import ActionDropdown from "@/crm/components/ui/ActionDropdown";
import StatusPill, { jobStageToPillVariant } from "@/crm/components/ui/StatusPill";
import ConfirmModal from "@/crm/components/ui/ConfirmModal";
import { formatJobStageLabel, isCompletedJobsListStage } from "@/crm/lib/jobStages";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";

type SurveyorOption = { id: string; fullName: string };

type JobsListCache = { items: Job[]; completedItems?: Job[] };

function stopRowClick(event: SyntheticEvent) {
  event.stopPropagation();
}

function AssignedSurveyorCell({
  job,
  surveyors,
  canAssign,
  saving,
  onAssign,
}: {
  job: Job;
  surveyors: SurveyorOption[];
  canAssign: boolean;
  saving: boolean;
  onAssign: (jobId: string, assignedToId: string) => void;
}) {
  if (!canAssign) {
    return (
      <span className="block truncate text-sm text-ink-muted">
        {job.assignedTo?.fullName ?? "Unassigned"}
      </span>
    );
  }

  const options =
    job.assignedTo && !surveyors.some((s) => s.id === job.assignedTo?.id)
      ? [{ id: job.assignedTo.id, fullName: job.assignedTo.fullName }, ...surveyors]
      : surveyors;

  return (
    <div
      onClick={stopRowClick}
      onPointerDown={stopRowClick}
      onMouseDown={stopRowClick}
      onKeyDown={stopRowClick}
    >
      <SelectField
        aria-label={`Assigned surveyor for ${job.jobNumber}`}
        value={job.assignedTo?.id ?? ""}
        disabled={saving}
        className="min-w-0 py-1.5 pl-2.5 pr-8 text-sm"
        onChange={(e) => onAssign(job.id, e.target.value)}
      >
        <option value="">Unassigned</option>
        {options.map((s) => (
          <option key={s.id} value={s.id}>
            {s.fullName}
          </option>
        ))}
      </SelectField>
    </div>
  );
}

export default function CrmJobsList({
  initialData = null,
}: {
  initialData?: JobsListCache | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stage = searchParams.get("stage") ?? "";
  const seed =
    !stage ? (initialData ?? getListPageCache<JobsListCache>("jobs:default")) : null;
  const [jobs, setJobs] = useState<Job[]>(() => seed?.items ?? []);
  const [completedJobs, setCompletedJobs] = useState<Job[]>(() => seed?.completedItems ?? []);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(() => !seed);
  const [completedOpen, setCompletedOpen] = useState(() =>
    Boolean(stage && isCompletedJobsListStage(stage)),
  );
  const [role, setRole] = useState<UserRole | null>(
    () => getCachedCurrentUser()?.role ?? null,
  );
  const [surveyors, setSurveyors] = useState<SurveyorOption[]>([]);
  const [savingJobId, setSavingJobId] = useState<string | null>(null);
  const [pendingAssign, setPendingAssign] = useState<{
    jobId: string;
    assignedToId: string;
  } | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [pendingComplete, setPendingComplete] = useState<Job | null>(null);
  const [completeError, setCompleteError] = useState<string | null>(null);

  useEffect(() => {
    api.getMe().then((me) => setRole(me.role)).catch(() => setRole(null));
    api
      .listSurveyors()
      .then((res) => setSurveyors(res.items))
      .catch(() => setSurveyors([]));
    if (seed && !stage && seed.completedItems) return;
    setLoading(true);
    const params: Record<string, string> = { limit: "50", page: "1" };
    if (stage) params.stage = stage;
    Promise.all([
      api.listJobs({ ...params, section: "active" }),
      api.listJobs({ ...params, section: "completed" }),
    ])
      .then(([activeRes, completedRes]) => {
        setJobs(activeRes.items);
        setCompletedJobs(completedRes.items);
        if (!stage) {
          setListPageCache("jobs:default", {
            items: activeRes.items,
            completedItems: completedRes.items,
          });
        }
      })
      .finally(() => setLoading(false));
  }, [seed, stage]);

  const leadName = (job: Job) =>
    job.customer
      ? `${job.customer.firstName} ${job.customer.lastName}`.trim()
      : "";

  function matchesSearch(job: Job, q: string) {
    return (
      job.jobNumber?.toLowerCase().includes(q) ||
      leadName(job).toLowerCase().includes(q) ||
      job.assignedTo?.fullName?.toLowerCase().includes(q) ||
      job.propertyAddress?.toLowerCase().includes(q) ||
      job.propertyPostcode?.toLowerCase().includes(q) ||
      job.stage?.toLowerCase().includes(q)
    );
  }

  const q = search.trim().toLowerCase();
  const filteredActive = q ? jobs.filter((job) => matchesSearch(job, q)) : jobs;
  const filteredCompleted = q
    ? completedJobs.filter((job) => matchesSearch(job, q))
    : completedJobs;

  const showMoney = role ? canViewJobMoney(role) : false;
  const canAssign = role ? canMutateLeads(role) : false;

  useEffect(() => {
    if (stage || loading) return;
    setListPageCache("jobs:default", { items: jobs, completedItems: completedJobs });
  }, [jobs, completedJobs, stage, loading]);

  function findJob(jobId: string) {
    return jobs.find((j) => j.id === jobId) ?? completedJobs.find((j) => j.id === jobId);
  }

  function replaceJob(jobId: string, next: Job | ((current: Job) => Job)) {
    const apply = (list: Job[]) =>
      list.map((j) => {
        if (j.id !== jobId) return j;
        return typeof next === "function" ? next(j) : next;
      });
    setJobs((list) => apply(list));
    setCompletedJobs((list) => apply(list));
  }

  function surveyorName(surveyorId: string) {
    if (!surveyorId) return "Unassigned";
    return (
      surveyors.find((s) => s.id === surveyorId)?.fullName ??
      findJob(pendingAssign?.jobId ?? "")?.assignedTo?.fullName ??
      "this surveyor"
    );
  }

  function requestAssignSurveyor(jobId: string, assignedToId: string) {
    const job = findJob(jobId);
    if ((job?.assignedTo?.id ?? "") === assignedToId) return;
    setAssignError(null);
    setPendingAssign({ jobId, assignedToId });
  }

  const pendingJob = pendingAssign ? findJob(pendingAssign.jobId) : undefined;
  const pendingSurveyorLabel = pendingAssign
    ? surveyorName(pendingAssign.assignedToId)
    : "surveyor";
  const replacing =
    Boolean(pendingJob?.assignedTo) &&
    pendingJob?.assignedTo?.id !== pendingAssign?.assignedToId;

  async function confirmAssignSurveyor() {
    if (!pendingAssign || savingJobId) return;
    const { jobId, assignedToId } = pendingAssign;
    const nextId = assignedToId || null;
    const nextName = nextId ? surveyorName(nextId) : null;

    setSavingJobId(jobId);
    try {
      const updated = await api.updateJob(jobId, {
        assignedToId: nextId,
        skipAssignmentTrigger: true,
      });
      replaceJob(jobId, (current) => ({
        ...current,
        assignedTo: updated.assignedTo ?? null,
      }));
      toast.success(nextId ? `Assigned ${nextName}` : "Surveyor unassigned");
      setPendingAssign(null);
      setAssignError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not change surveyor";
      setAssignError(msg);
      toast.error(msg);
    } finally {
      setSavingJobId(null);
    }
  }

  function requestMoveToCompleted(job: Job) {
    if (isCompletedJobsListStage(job.stage, job.jobType) || savingJobId === job.id) return;
    setCompleteError(null);
    setPendingComplete(job);
  }

  async function confirmMoveToCompleted() {
    if (!pendingComplete || savingJobId) return;
    const job = pendingComplete;
    const previous = job;

    setSavingJobId(job.id);
    setJobs((list) => list.filter((j) => j.id !== job.id));
    setCompletedJobs((list) => [{ ...job, stage: "INSPECTION_COMPLETE" }, ...list]);

    try {
      const updated = await api.updateJobStage(job.id, "INSPECTION_COMPLETE", {
        skipTrigger: true,
      });
      setCompletedJobs((list) => list.map((j) => (j.id === job.id ? updated : j)));
      toast.success(`Moved ${job.jobNumber} to completed`);
      setPendingComplete(null);
      setCompleteError(null);
    } catch (e) {
      setCompletedJobs((list) => list.filter((j) => j.id !== job.id));
      setJobs((list) => [previous, ...list]);
      const msg = e instanceof Error ? e.message : "Could not move job";
      setCompleteError(msg);
      toast.error(msg);
    } finally {
      setSavingJobId(null);
    }
  }

  function jobColumns(opts: { showMoveAction: boolean }): Column<Job & Record<string, unknown>>[] {
    return [
      {
        key: "jobNumber",
        header: "Job #",
        width: "9.5rem",
        render: (value) => (
          <span className="text-sm font-medium text-ink tabular-nums">{value as string}</span>
        ),
      },
      {
        key: "customer",
        header: "Lead",
        className: "min-w-0 overflow-hidden",
        render: (_, row) => (
          <span className="block truncate text-sm font-medium text-ink">
            {leadName(row) || "—"}
          </span>
        ),
      },
      {
        key: "assignedTo",
        header: "Assigned to",
        className: "min-w-0 overflow-hidden",
        width: "13rem",
        render: (_, row) => (
          <AssignedSurveyorCell
            job={row}
            surveyors={surveyors}
            canAssign={canAssign}
            saving={savingJobId === row.id || pendingAssign?.jobId === row.id}
            onAssign={requestAssignSurveyor}
          />
        ),
      },
      {
        key: "propertyAddress",
        header: "Property",
        className: "min-w-0 overflow-hidden",
        render: (value) => (
          <span
            title={(value as string) || undefined}
            className="block truncate text-sm text-ink-muted"
          >
            {(value as string) || "—"}
          </span>
        ),
      },
      {
        key: "stage",
        header: "Stage",
        width: "12rem",
        render: (value, row) => (
          <StatusPill
            variant={jobStageToPillVariant(value as string)}
            label={formatJobStageLabel(value as string, row.jobType)}
          />
        ),
      },
      ...(showMoney
        ? [
            {
              key: "agreedAmount",
              header: "Amount",
              align: "right" as const,
              width: "6.5rem",
              render: (value: unknown) => (
                <span className="text-sm font-medium text-ink tabular-nums">
                  £{value as number}
                </span>
              ),
            } satisfies Column<Job & Record<string, unknown>>,
          ]
        : []),
      ...(opts.showMoveAction && canAssign
        ? [
            {
              key: "actions",
              header: "",
              width: "3.5rem",
              className: "w-14",
              render: (_: unknown, row: Job & Record<string, unknown>) => (
                <div onClick={stopRowClick} onPointerDown={stopRowClick} onMouseDown={stopRowClick}>
                  <ActionDropdown
                    ariaLabel={`Actions for ${row.jobNumber}`}
                    actions={[
                      {
                        id: "move-completed",
                        label: "Move to completed",
                        icon: <CheckCircle className="h-4 w-4" />,
                      },
                    ]}
                    onActionClick={(actionId) => {
                      if (actionId === "move-completed") requestMoveToCompleted(row);
                    }}
                  />
                </div>
              ),
            } satisfies Column<Job & Record<string, unknown>>,
          ]
        : []),
    ];
  }

  const showCompletedSection = !loading || completedJobs.length > 0;

  return (
    <CrmPageContent className="space-y-4 py-3 sm:py-4 lg:py-4">
      <CrmPageHeader compact title="Jobs" subtitle="Fulfilment pipeline" />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <Table
            title="All jobs"
            fixedLayout
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search jobs…"
            columns={jobColumns({ showMoveAction: true })}
            data={filteredActive as (Job & Record<string, unknown>)[]}
            getRowKey={(r) => r.id}
            onRowClick={(row) => router.push(`/crm/jobs/${row.id}`)}
            emptyMessage="No jobs yet — convert a lead to create one"
            totalCount={filteredActive.length}
          />

          {showCompletedSection && (
            <section className="overflow-hidden rounded-xl border border-line bg-surface">
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-3 text-left sm:px-5 sm:py-4"
                onClick={() => setCompletedOpen((open) => !open)}
                aria-expanded={completedOpen}
              >
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-ink-subtle transition-transform",
                    !completedOpen && "-rotate-90",
                  )}
                  strokeWidth={1.75}
                  aria-hidden
                />
                <span className="text-base font-medium text-ink">Completed</span>
                <span className="text-sm text-ink-subtle">{filteredCompleted.length}</span>
              </button>
              {completedOpen ? (
                <Table
                  className="rounded-none border-0 border-t border-line"
                  fixedLayout
                  columns={jobColumns({ showMoveAction: false })}
                  data={filteredCompleted as (Job & Record<string, unknown>)[]}
                  getRowKey={(r) => r.id}
                  onRowClick={(row) => router.push(`/crm/jobs/${row.id}`)}
                  emptyMessage="No completed jobs"
                  totalCount={filteredCompleted.length}
                />
              ) : null}
            </section>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={pendingAssign !== null}
        title={
          pendingAssign?.assignedToId === ""
            ? "Unassign surveyor?"
            : `Assign ${pendingSurveyorLabel}?`
        }
        description={
          pendingAssign?.assignedToId === ""
            ? `This removes ${pendingJob?.assignedTo?.fullName ?? "the surveyor"} from ${pendingJob?.jobNumber ?? "the job"}. No email is sent.`
            : replacing
              ? `This replaces ${pendingJob?.assignedTo?.fullName} with ${pendingSurveyorLabel} on ${pendingJob?.jobNumber ?? "the job"}. No email is sent.`
              : `This assigns ${pendingSurveyorLabel} to ${pendingJob?.jobNumber ?? "the job"}. No email is sent.`
        }
        confirmLabel={pendingAssign?.assignedToId === "" ? "Unassign" : "Assign surveyor"}
        loading={savingJobId === pendingAssign?.jobId}
        error={assignError ?? undefined}
        onConfirm={() => void confirmAssignSurveyor()}
        onCancel={() => {
          if (savingJobId) return;
          setPendingAssign(null);
          setAssignError(null);
        }}
      />

      <ConfirmModal
        isOpen={pendingComplete !== null}
        title="Move to completed?"
        description={`This sets ${pendingComplete?.jobNumber ?? "the job"} to Inspection Completed and moves it into Completed. No email is sent.`}
        confirmLabel="Move to completed"
        loading={savingJobId === pendingComplete?.id}
        error={completeError ?? undefined}
        onConfirm={() => void confirmMoveToCompleted()}
        onCancel={() => {
          if (savingJobId) return;
          setPendingComplete(null);
          setCompleteError(null);
        }}
      />
    </CrmPageContent>
  );
}
