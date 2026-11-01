import { guides } from "@/lib/guides";
import { GUIDE_ROUTES } from "@/lib/site-nav";

export type GuideCard = {
  href: string;
  label: string;
  title: string;
  blurb: string;
  /** Call-back options to pre-tick on the guide page. */
  needs?: string[];
};

/** Topic label and call-back pre-selection for the data-driven guides in lib/guides.ts. */
const LIB_GUIDE_TOPICS: Record<string, { label: string; needs?: string[] }> = {
  "level-1-vs-level-2-vs-level-3-survey": { label: "RICS surveys" },
  "homebuyer-survey-vs-mortgage-valuation": { label: "RICS surveys" },
  "damp-and-mould-inspection-vs-treatment": {
    label: "Damp and mould",
    needs: ["Damp, Mould and Condensation Survey", "Mould treatment"],
  },
  "party-wall-notices-and-awards": { label: "Party wall", needs: ["Party wall"] },
  "housing-disrepair-survey-vs-hhsrs-assessment": {
    label: "Housing disrepair",
    needs: ["Housing disrepair survey", "HHSRS inspection"],
  },
};

/** Every guide, in the order the guides index lists them. */
export const GUIDE_CARDS: GuideCard[] = [
  {
    href: GUIDE_ROUTES.awaabsLaw,
    label: "Social housing",
    title: "Awaab’s Law explained: deadlines, Phase 2 and private landlords",
    blurb:
      "The deadlines social landlords must meet, the hazard groups Phase 2 adds, and what the consultation proposes for private landlords.",
  },
  {
    href: GUIDE_ROUTES.hhsrs,
    label: "Housing standards",
    title: "HHSRS explained: hazards, ratings and inspections",
    blurb:
      "How the revised Housing Health and Safety Rating System scores and bands hazards, and what an HHSRS inspection covers.",
  },
  {
    href: GUIDE_ROUTES.level2vs3,
    label: "RICS surveys",
    title: "Level 2 or Level 3 survey? What each one covers, for London buyers",
    blurb: "How the two RICS surveys differ, so you can pick the right survey for the property you’re buying.",
  },
  ...guides.map((guide) => ({
    href: `/guides/${guide.slug}`,
    label: LIB_GUIDE_TOPICS[guide.slug]?.label ?? "Guide",
    title: guide.title,
    blurb: guide.description,
    needs: LIB_GUIDE_TOPICS[guide.slug]?.needs,
  })),
];
