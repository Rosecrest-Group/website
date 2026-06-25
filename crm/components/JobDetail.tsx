"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/crm/lib/api";
import type { Job, JobDocument, SnaggingItem } from "@/crm/types";
import PhoneButton from "@/crm/components/PhoneButton";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPanel from "@/crm/components/ui/CrmPanel";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import StatusPill from "@/crm/components/ui/StatusPill";
import TextField from "@/crm/components/ui/TextField";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import InternalConversationPanel, { prefetchInternalThread } from "@/crm/components/InternalConversationPanel";
import { ArrowLeft } from "lucide-react";

function paymentStatusVariant(status: string): "completed" | "pending" | "in-review" | "failed" {
  if (status === "PAID") return "completed";
  if (status === "FAILED" || status === "REFUNDED") return "failed";
  return "pending";
}

export default function JobDetail({ id }: { id: string }) {
  const [job, setJob] = useState<
    (Job & { payments?: { id: string; amount: number; status: string; paidAt?: string | null }[] }) | null
  >(null);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [docForm, setDocForm] = useState({ type: "RAMS", filename: "", storageUrl: "" });
  const [snagDesc, setSnagDesc] = useState("");
  const [workStart, setWorkStart] = useState("");
  const [workEnd, setWorkEnd] = useState("");

  function reload() {
    setLoading(true);
    api
      .getJob(id)
      .then((j) => {
        setJob(j);
        setWorkStart(j.workStartDate?.slice(0, 10) ?? "");
        setWorkEnd(j.workEndDate?.slice(0, 10) ?? "");
        prefetchInternalThread({ jobId: j.id });
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    reload();
  }, [id]);

  async function createLink() {
    const r = await api.createPaymentLink(id);
    setPaymentLink(r.url);
    reload();
  }

  async function markPaid() {
    await api.markJobPaid(id);
    reload();
  }

  async function addDocument() {
    if (!docForm.filename || !docForm.storageUrl) return;
    await api.addJobDocument(id, docForm);
    setDocForm({ type: "RAMS", filename: "", storageUrl: "" });
    reload();
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
  const TRADE_STAGES = [
    "WORK_SCHEDULED",
    "WORK_IN_PROGRESS",
    "WORK_COMPLETE",
    "SNAGGING",
    "COMPLETED",
  ] as const;

  async function updateTradeStage(stage: string) {
    await api.updateJobStage(id, stage);
    reload();
  }

  async function saveWorkDates() {
    await api.updateJob(id, {
      ...(workStart ? { workStartDate: new Date(workStart).toISOString() } : {}),
      ...(workEnd ? { workEndDate: new Date(workEnd).toISOString() } : {}),
    });
    reload();
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
          {job.customer?.phone && (
            <div className="mt-2">
              <PhoneButton
                number={job.customer.phone}
                context={{
                  jobId: job.id,
                  customerName: `${job.customer.firstName} ${job.customer.lastName}`,
                }}
              />
            </div>
          )}
        </div>
        <StatusPill variant={paymentStatusVariant(job.paymentStatus)} label={job.paymentStatus} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {isTrade && (
          <CrmPanel title="Trade workflow" className="lg:col-span-2">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-(--color-tc-30)">Stage:</span>
                {TRADE_STAGES.map((s) => (
                  <SecondaryButton
                    key={s}
                    type="button"
                    size="small"
                    className={
                      job.stage === s
                        ? "w-auto border-(--color-primary) bg-(--color-primary) text-white hover:bg-(--color-primary) hover:text-white"
                        : "w-auto"
                    }
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
                    Create payment link
                  </PrimaryButton>
                  <SecondaryButton type="button" size="small" className="w-auto" onClick={markPaid}>
                    Mark paid (bank transfer)
                  </SecondaryButton>
                </>
              )}
            </div>
          </div>
        </CrmPanel>

        {!isTrade && (
          <CrmPanel title="SLA deadlines">
            <div className="space-y-2 text-sm text-(--color-tc-40)">
              <p>
                Inspection:{" "}
                {job.inspectionDate ? new Date(job.inspectionDate).toLocaleDateString() : "Not set"}
              </p>
              <p>
                Internal deadline:{" "}
                {job.reportInternalDeadline
                  ? new Date(job.reportInternalDeadline).toLocaleDateString()
                  : "—"}
              </p>
              <p>
                Client deadline:{" "}
                {job.reportClientDeadline
                  ? new Date(job.reportClientDeadline).toLocaleDateString()
                  : "—"}
              </p>
              {job.reportStatus && (
                <StatusPill variant="in-review" label={job.reportStatus} />
              )}
            </div>
          </CrmPanel>
        )}

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

        {(isTrade || documents.length > 0) && (
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
                <TextField
                  placeholder="Filename"
                  value={docForm.filename}
                  onChange={(e) => setDocForm({ ...docForm, filename: e.target.value })}
                />
                <TextField
                  placeholder="Storage URL"
                  value={docForm.storageUrl}
                  onChange={(e) => setDocForm({ ...docForm, storageUrl: e.target.value })}
                />
                <SecondaryButton type="button" size="small" className="w-auto" onClick={addDocument}>
                  Register document
                </SecondaryButton>
              </div>
            </div>
          </CrmPanel>
        )}

        {isTrade && (
          <CrmPanel title="Snagging & sign-off" className="lg:col-span-2">
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
    </CrmPageContent>
  );
}
