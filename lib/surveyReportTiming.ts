export type HomebuyerSurveyLevel = 1 | 2 | 3;

export type SurveyReportTiming = {
  heading: string;
  paragraphs: string[];
  /** Step 4 on the quote, when Express 48-hour delivery is not selected. */
  standardStep: string;
};

/**
 * Customer-facing report turnaround.
 * Level 2 wording is the promise used at quotation.
 * Level 1 and Level 3 match the initial quote emails so the site and the quote do not disagree.
 */
export const surveyReportTiming: Record<HomebuyerSurveyLevel, SurveyReportTiming> = {
  1: {
    heading: "When will I receive my report?",
    paragraphs: [
      "The duration of the survey depends on the size of the property, but typically takes 1-2 hours.",
      "Your Level 1 Condition Report will be delivered within 2 working days of the inspection as standard.",
      "Need it sooner? Choose our Express 48-Hour Report option when you check availability and get your fixed price, ideal if you're working to a tight purchase timeline.",
    ],
    standardStep:
      "Receive your report – delivered within 2 working days of the inspection",
  },
  2: {
    heading: "When will I receive my report?",
    paragraphs: [
      "Your detailed Level 2 HomeBuyer Report will be delivered within 5 working days of the inspection as standard.",
      "Need it sooner? Choose our Express 48-Hour Report option when you check availability and get your fixed price, ideal if you're working to a tight purchase timeline.",
    ],
    standardStep:
      "Receive your report – delivered within 3 - 5 working days of the inspection",
  },
  3: {
    heading: "When will I receive my report?",
    paragraphs: [
      "The duration of the survey depends on the size of the property, but typically takes 2-3 hours.",
      "Your Level 3 Building Survey will be delivered within 5–7 working days of the inspection as standard.",
      "Need it sooner? Choose our Express 48-Hour Report option when you check availability and get your fixed price, ideal if you're working to a tight purchase timeline.",
    ],
    standardStep:
      "Receive your report – delivered within 5–7 working days of the inspection",
  },
};

export const EXPRESS_REPORT_STEP =
  "Receive your report – delivered within 48 hours of the inspection";

export function homebuyerLevelFromType(surveyType: string): HomebuyerSurveyLevel {
  if (surveyType === "level-1") return 1;
  if (surveyType === "level-3") return 3;
  return 2;
}

export function reportDeliveryStep(surveyType: string, express: boolean): string {
  if (express) return EXPRESS_REPORT_STEP;
  return surveyReportTiming[homebuyerLevelFromType(surveyType)].standardStep;
}
