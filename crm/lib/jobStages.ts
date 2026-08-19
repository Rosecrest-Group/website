/** Visible survey job stages after the Torera walkthrough consolidation. */
export const SURVEY_JOB_STAGES = [
  "PAID",
  "ACCESS_REQUESTED",
  "ACCESS_CONFIRMED",
  "INSPECTION_BOOKED",
  "INSPECTION_COMPLETE",
  "REPORT_DELIVERED",
] as const;

export type SurveyJobStage = (typeof SURVEY_JOB_STAGES)[number];

/** Fold removed survey stages onto the 6-step bar. Trade jobs are unchanged. */
export function canonicalSurveyStage(stage: string): string {
  if (stage === "REPORT_DRAFTING" || stage === "REPORT_QC") return "INSPECTION_COMPLETE";
  if (stage === "COMPLETED") return "REPORT_DELIVERED";
  return stage;
}

export function storedSurveyStage(jobType: string, stage: string): string {
  if (jobType === "TRADE_WORK") return stage;
  return canonicalSurveyStage(stage);
}

export function formatJobStageLabel(stage: string, jobType?: string | null): string {
  const value = jobType === "TRADE_WORK" ? stage : canonicalSurveyStage(stage);
  return value.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export const SURVEYOR_SETTABLE_STAGES = ["INSPECTION_COMPLETE", "REPORT_DELIVERED"] as const;

/**
 * Assigned surveyor may set Inspection Complete / Report Delivered once the
 * job is at Inspection Booked or later. Paid / Access stay ops-only.
 */
export function surveyorMaySetSurveyStage(currentStage: string, targetStage: string): boolean {
  const current = canonicalSurveyStage(currentStage);
  const target = canonicalSurveyStage(targetStage);
  const bookedIdx = SURVEY_JOB_STAGES.indexOf("INSPECTION_BOOKED");
  const currentIdx = SURVEY_JOB_STAGES.indexOf(current as SurveyJobStage);
  if (currentIdx < bookedIdx) return false;
  return (SURVEYOR_SETTABLE_STAGES as readonly string[]).includes(target);
}

export function stageMoveEmailWarning(stage: string): string | null {
  if (stage === "ACCESS_REQUESTED") {
    return "This emails the estate agent or vendor to request access.";
  }
  if (stage === "INSPECTION_COMPLETE") {
    return "This emails the client that the inspection is done.";
  }
  if (stage === "REPORT_DELIVERED") {
    return "This emails the client with the report PDF attached.";
  }
  return null;
}
