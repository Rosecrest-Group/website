/** Visible survey job stages from JOB FLOW.docx. */
export const SURVEY_JOB_STAGES = [
  "PAID",
  "ACCESS_REQUESTED",
  "ACCESS_CONFIRMED",
  "INSPECTION_BOOKED",
  "INSPECTION_COMPLETE",
  "DATA_UPLOAD",
  "REPORT_QC",
  "REPORT_DELIVERED",
] as const;

export type SurveyJobStage = (typeof SURVEY_JOB_STAGES)[number];

export const SURVEY_STAGE_LABELS: Record<string, string> = {
  PAID: "Paid",
  ACCESS_REQUESTED: "Access Requested",
  ACCESS_CONFIRMED: "Surveyor Assigned",
  INSPECTION_BOOKED: "Inspection Booked",
  INSPECTION_COMPLETE: "Inspection Completed",
  DATA_UPLOAD: "Data Upload",
  REPORT_QC: "Quality Control",
  REPORT_DELIVERED: "Submit Report",
};

/** Fold removed survey stages onto the 8-step bar. Trade jobs are unchanged. */
export function canonicalSurveyStage(stage: string): string {
  if (stage === "REPORT_DRAFTING") return "DATA_UPLOAD";
  if (stage === "COMPLETED") return "REPORT_DELIVERED";
  return stage;
}

export function storedSurveyStage(jobType: string, stage: string): string {
  if (jobType === "TRADE_WORK") return stage;
  return canonicalSurveyStage(stage);
}

export function formatJobStageLabel(stage: string, jobType?: string | null): string {
  const value = jobType === "TRADE_WORK" ? stage : canonicalSurveyStage(stage);
  return (
    SURVEY_STAGE_LABELS[value] ??
    value.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export const SURVEYOR_SETTABLE_STAGES = [
  "INSPECTION_COMPLETE",
  "DATA_UPLOAD",
  "REPORT_QC",
  "REPORT_DELIVERED",
] as const;

/**
 * Assigned surveyor may set Inspection Completed / Data Upload / QC / Submit
 * Report once the job is at Inspection Booked or later. Paid / Access stay ops-only.
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
  if (stage === "INSPECTION_BOOKED") {
    return "This emails the client a confirmation, with the surveyor in copy.";
  }
  if (stage === "INSPECTION_COMPLETE") {
    return "This emails the client that the inspection is done.";
  }
  return null;
}
