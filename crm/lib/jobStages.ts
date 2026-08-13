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
