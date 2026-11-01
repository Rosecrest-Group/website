export type SurveyLevel = 1 | 2 | 3;

// Keep in sync with components/homebuyer/BookingModal.tsx and
// api/src/config/stripePaymentCatalog.ts (FLEXi_FEE_INC_VAT).
// The bedroom labels are sent to the CRM as-is, so they must match the catalog.
const PRICES: Record<SurveyLevel, Record<string, number>> = {
  1: {
    Studio: 280.99,
    "1 Bedroom": 313.99,
    "2 Bedroom": 368.99,
    "3 Bedroom": 396.49,
    "4 Bedroom": 440.49,
    "5 Bedroom": 478.99,
    "6 Bedroom": 511.99,
    "7 Bedroom": 566.99,
    "8 Bedroom": 621.99,
    "9 Bedroom": 676.99,
    "10+ Bedroom": 731.99,
  },
  2: {
    Studio: 330.99,
    "1 Bedroom": 363.99,
    "2 Bedroom": 418.99,
    "3 Bedroom": 446.49,
    "4 Bedroom": 490.49,
    "5 Bedroom": 528.99,
    "6 Bedroom": 561.99,
    "7 Bedroom": 616.99,
    "8 Bedroom": 671.99,
    "9 Bedroom": 726.99,
    "10+ Bedroom": 781.99,
  },
  3: {
    Studio: 550.99,
    "1 Bedroom": 611.49,
    "2 Bedroom": 666.49,
    "3 Bedroom": 693.99,
    "4 Bedroom": 737.99,
    "5 Bedroom": 776.49,
    "6 Bedroom": 809.49,
    "7 Bedroom": 864.49,
    "8 Bedroom": 919.49,
    "9 Bedroom": 974.49,
    "10+ Bedroom": 1029.49,
  },
};

export const EXPRESS_FEE = 200;

export const BEDROOM_OPTIONS = [
  { value: "Studio", label: "Studio" },
  { value: "1 Bedroom", label: "1" },
  { value: "2 Bedroom", label: "2" },
  { value: "3 Bedroom", label: "3" },
  { value: "4 Bedroom", label: "4" },
  { value: "5 Bedroom", label: "5" },
  { value: "6 Bedroom", label: "6" },
  { value: "7 Bedroom", label: "7" },
  { value: "8 Bedroom", label: "8" },
  { value: "9 Bedroom", label: "9" },
  { value: "10+ Bedroom", label: "10+" },
];

export const SURVEY_LABELS: Record<SurveyLevel, string> = {
  1: "Level 1: Home Conditions Survey",
  2: "Level 2: Homebuyer Survey",
  3: "Level 3: Building Survey",
};

/** Standard report turnaround, as shown in step 4 of "What happens next". */
export const REPORT_TURNAROUND: Record<SurveyLevel, string> = {
  1: "2 working days",
  2: "3–5 working days",
  3: "5–7 working days",
};

/** Price for a level and bedroom count; before bedrooms are chosen, the 1 bedroom ("from") price. */
export function surveyPrice(level: SurveyLevel, bedrooms: string): number {
  const prices = PRICES[level];
  return prices[bedrooms] ?? prices["1 Bedroom"];
}

export function formatPounds(amount: number): string {
  return `£${amount.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function levelFromSurveyType(surveyType: string): SurveyLevel {
  if (surveyType === "level-1") return 1;
  if (surveyType === "level-3") return 3;
  return 2;
}
