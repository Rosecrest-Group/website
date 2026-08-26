/** QC required before Submit Report. Ops/admin may bypass. */

export const QC_TICKS = [
  { field: "qcOttoReviewComplete" as const, label: "Technical review completed" },
  { field: "qcRicsPassConfirmed" as const, label: "95% RICS pass rate" },
  { field: "qcLevelDeliverableComplete" as const, label: "Repair costings verified" },
];

export function qcDeliverableLabel(_surveyLevel?: string | null): string {
  return "Repair costings verified";
}

export function isJobQcComplete(job: {
  surveyLevel?: string | null;
  qcOttoReviewComplete?: boolean | null;
  qcRicsPassConfirmed?: boolean | null;
  qcLevelDeliverableComplete?: boolean | null;
}): boolean {
  return Boolean(
    job.qcOttoReviewComplete && job.qcRicsPassConfirmed && job.qcLevelDeliverableComplete
  );
}

export const QC_INCOMPLETE_MESSAGE =
  "Complete the QC checks before moving to Submit Report";
