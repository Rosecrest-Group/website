/** QC required before surveyor upload / Report Delivered. Ops/admin may bypass. */

export function qcDeliverableLabel(surveyLevel?: string | null): string | null {
  if (surveyLevel === "LEVEL_2") return "Next Steps Action Plan reviewed";
  if (surveyLevel === "LEVEL_3") return "Repair costings verified";
  if (surveyLevel === "CPR_35") return "CPR-35 supporting documents complete";
  return null;
}

export function isJobQcComplete(job: {
  surveyLevel?: string | null;
  qcOttoReviewComplete?: boolean | null;
  qcRicsPassConfirmed?: boolean | null;
  qcLevelDeliverableComplete?: boolean | null;
}): boolean {
  if (!job.qcOttoReviewComplete || !job.qcRicsPassConfirmed) return false;
  if (qcDeliverableLabel(job.surveyLevel) && !job.qcLevelDeliverableComplete) return false;
  return true;
}

export const QC_INCOMPLETE_MESSAGE =
  "Complete the QC checks before uploading or moving to Report Delivered";
