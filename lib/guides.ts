import type { FAQItem } from "@/lib/faqs";

// ─────────────────────────────────────────────────────────────
// "Which one do I need?" guides at /guides/[slug].
// Rosecrest prices, turnarounds and scope must match the service pages
// and lib/faqs.ts; legal facts must match the cited legislation.
// ─────────────────────────────────────────────────────────────

export type GuideTable = {
  caption: string;
  columns: string[];
  rows: string[][];
};

export type GuideSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  table?: GuideTable;
};

export type Guide = {
  slug: string;
  /** Short label for cards, breadcrumbs and llms.txt. */
  name: string;
  title: string;
  metaTitle: string;
  description: string;
  updated: string;
  intro: string[];
  comparison?: GuideTable;
  sections: GuideSection[];
  faqs: FAQItem[];
  related: { label: string; href: string }[];
};

export const guides: Guide[] = [
  {
    slug: "level-1-vs-level-2-vs-level-3-survey",
    name: "Level 1 vs Level 2 vs Level 3 survey",
    title: "RICS Level 1 vs Level 2 vs Level 3 survey: which do you need?",
    metaTitle: "Level 1 vs Level 2 vs Level 3 Survey: Which Do You Need? | Rosecrest",
    description:
      "Compare RICS Level 1, 2 and 3 home surveys: what each covers, which properties they suit, time on site and report turnaround, from London surveyors.",
    updated: "2026-10-25",
    intro: [
      "RICS Home Surveys come in three levels. Each looks at the same parts of the property, in more depth as the level goes up. The right choice depends mostly on the age, construction and condition of the property, and on how much you plan to change it.",
      "In short: a Level 1 suits new and nearly new homes, a Level 2 suits most conventional homes in reasonable condition, and a Level 3 suits older, altered, larger or non-standard properties.",
    ],
    comparison: {
      caption: "RICS Level 1, 2 and 3 surveys compared",
      columns: ["", "Level 1", "Level 2", "Level 3"],
      rows: [
        ["Also called", "Condition Report", "HomeBuyer Report", "Building Survey"],
        [
          "Best for",
          "New builds and standard, unaltered homes built within the last 5–10 years",
          "Conventional homes in reasonable condition, typically built within the last 30 years",
          "Older, altered, extended, listed, heritage or non-standard properties",
        ],
        [
          "Depth",
          "A brief overview of condition, with traffic-light ratings",
          "A detailed visual inspection: defects, how urgent they are, and advice on repairs and further investigation",
          "A full analysis of construction and condition, including what may happen if defects aren't repaired",
        ],
        ["Repair cost estimates", "No", "No", "Optional"],
        [
          "Valuation",
          "Ask us",
          "Can be added for an extra fee",
          "Not included; a separate, discounted valuation on request",
        ],
        ["Time on site", "Typically 1–2 hours", "Typically 2–3 hours", "Depends on the size and complexity of the property"],
        [
          "Report delivered",
          "Within 2 working days of the inspection",
          "Within 5 working days (typically 3–5)",
          "Within 5–7 working days",
        ],
        ["Express 48-hour report", "Available", "Available", "Available"],
      ],
    },
    sections: [
      {
        heading: "When a Level 1 is enough",
        paragraphs: [
          "A Level 1 Condition Report gives a brief view of the property's condition and rates each part with a traffic light. It suits new builds and standardised homes that haven't been altered or extended.",
          "It isn't suitable for older, larger or non-traditional properties, because it doesn't go into enough depth to explain the problems those buildings tend to have.",
        ],
      },
      {
        heading: "Why most buyers choose a Level 2",
        paragraphs: [
          "The Level 2 HomeBuyer Report is the most common choice for standard homes. The surveyor inspects the building inside and out, including walls, ceilings, roofs, gutters, windows and doors, and gives a visual appraisal of services such as heating, electricity, water and drainage.",
          "The report flags urgent repairs and future maintenance, and notes planning, building control or other legal matters for your conveyancer. Where the surveyor can't reach a confident conclusion about part of the property, it recommends further investigation.",
          "You can add a valuation, a gas safety check or an Electrical Installation Condition Report (EICR) to a Level 2 for an extra fee.",
        ],
      },
      {
        heading: "When to choose a Level 3",
        paragraphs: [
          "Choose a Level 3 Building Survey for older or heritage buildings, listed properties, homes that have been altered or extended, and anything you plan to renovate. It examines all accessible areas in more depth, explains defects and their likely consequences, and can include estimated repair costs to help you budget.",
          "A valuation isn't included, but a separate, discounted valuation can be provided on request.",
        ],
      },
      {
        heading: "Things to know whichever level you choose",
        bullets: [
          "Our surveyors can't advise whether to go ahead with or withdraw from a purchase. The report gives you the information to decide.",
          "If you're worried about heat loss, insulation or damp, a thermographic survey can be added to a Level 2 or Level 3 for £175 including VAT.",
          "Every level is available with an Express 48-hour report if you're working to a tight timeline.",
        ],
      },
    ],
    faqs: [
      {
        question: "Should I get a Level 2 or a Level 3 survey for a Victorian house?",
        answer:
          "Usually a Level 3. Victorian and other period homes are older, often altered or extended, and built differently from modern homes, which is what a Level 3 Building Survey is designed for. A Level 2 suits conventional homes in reasonable condition, typically built within the last 30 years.",
      },
      {
        question: "Can I get my survey report faster?",
        answer:
          "Yes. At every level you can choose the Express 48-Hour Report when you check availability and get your fixed price.",
      },
      {
        question: "Does a homebuyer survey include a valuation?",
        answer:
          "Not as standard. A valuation can be added to a Level 2 HomeBuyer Report for an extra fee, and a separate, discounted valuation can be provided with a Level 3 Building Survey on request.",
      },
      {
        question: "Which areas do you survey?",
        answer:
          "All 33 London boroughs and areas within or close to the M25, including parts of Surrey, Kent, Hertfordshire and Essex.",
      },
    ],
    related: [
      { label: "RICS Level 1 Condition Report", href: "/homebuyer/survey-level-1" },
      { label: "RICS Level 2 HomeBuyer Report", href: "/homebuyer/survey-level-2" },
      { label: "RICS Level 3 Building Survey", href: "/homebuyer/survey-level-3" },
      { label: "Thermographic surveys", href: "/services/thermographic-surveys" },
    ],
  },
  {
    slug: "homebuyer-survey-vs-mortgage-valuation",
    name: "Homebuyer survey vs mortgage valuation",
    title: "Homebuyer survey vs mortgage valuation: what's the difference?",
    metaTitle: "Homebuyer Survey vs Mortgage Valuation: What's the Difference? | Rosecrest",
    description:
      "A mortgage valuation protects your lender; a homebuyer survey protects you. What each checks, who it's for, and how to get a valuation with your survey.",
    updated: "2026-10-25",
    intro: [
      "If you're buying with a mortgage, your lender will arrange a valuation. It's easy to assume that checks the property for problems. It doesn't, at least not in any detail. A valuation and a survey answer different questions for different people.",
    ],
    comparison: {
      caption: "Mortgage valuation and homebuyer survey compared",
      columns: ["", "Mortgage valuation", "Homebuyer survey (RICS Level 1–3)"],
      rows: [
        ["Who it's for", "Your lender", "You, the buyer"],
        [
          "Question it answers",
          "Is the property good enough security for the loan?",
          "What condition is the property in, and what needs repairing?",
        ],
        [
          "Inspection",
          "Focused on value; often brief, and sometimes done without a visit",
          "A visual inspection of the building inside and out, in more depth at each level",
        ],
        [
          "Defects and repairs",
          "Not reported in detail",
          "Defects rated by urgency, with advice on repairs and further investigation",
        ],
        ["Who arranges it", "The lender", "You choose and instruct the surveyor"],
      ],
    },
    sections: [
      {
        heading: "What a mortgage valuation is for",
        paragraphs: [
          "A mortgage valuation is carried out for the lender, to check that the property is suitable security for the loan. It isn't designed to find defects, and it won't tell you what repairs the property needs.",
        ],
      },
      {
        heading: "What a homebuyer survey adds",
        paragraphs: [
          "A survey is carried out for you. The surveyor inspects the property's condition, rates defects by how urgent they are, and tells you where further investigation is needed. That gives you the facts to renegotiate, budget for repairs or ask more questions before you commit.",
          "Which level you need depends on the property: a Level 1 for new or nearly new homes, a Level 2 for most conventional homes, and a Level 3 for older, altered or non-standard properties.",
        ],
      },
      {
        heading: "Getting a valuation with your survey",
        paragraphs: [
          "With Rosecrest you can add a valuation to a Level 2 HomeBuyer Report for an extra fee. With a Level 3 Building Survey, a separate, discounted valuation can be provided on request. Your lender will normally still arrange its own valuation for the mortgage.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do I need a survey if my lender has done a valuation?",
        answer:
          "A survey isn't a legal requirement, but the lender's valuation doesn't check the property's condition for you. A survey is how you find out about defects and repairs before you commit to buying.",
      },
      {
        question: "Which survey level should I choose?",
        answer:
          "A Level 1 for new or nearly new homes, a Level 2 for most conventional homes in reasonable condition, and a Level 3 for older, altered, extended or non-standard properties.",
      },
      {
        question: "How quickly will I get my survey report?",
        answer:
          "A Level 1 within 2 working days of the inspection, a Level 2 within 5 working days and a Level 3 within 5–7 working days. An Express 48-hour report is available at every level.",
      },
    ],
    related: [
      { label: "Homebuyer surveys", href: "/homebuyer" },
      { label: "Level 1 vs Level 2 vs Level 3 survey", href: "/guides/level-1-vs-level-2-vs-level-3-survey" },
      { label: "RICS Level 2 HomeBuyer Report", href: "/homebuyer/survey-level-2" },
      { label: "RICS Level 3 Building Survey", href: "/homebuyer/survey-level-3" },
    ],
  },
  {
    slug: "damp-and-mould-inspection-vs-treatment",
    name: "Damp and mould: inspection vs treatment",
    title: "Damp and mould: why get an inspection before treatment?",
    metaTitle: "Damp & Mould Inspection vs Treatment: Find the Cause First | Rosecrest",
    description:
      "Condensation, penetrating damp or rising damp? Why a damp and mould inspection comes before treatment, what the report covers, and what each costs.",
    updated: "2026-10-25",
    intro: [
      "Damp and mould are symptoms. The same patch of black mould can come from condensation, a leak, rain getting in through a defect, or moisture rising from the ground, and each needs a different fix. Treating the mould without finding the cause usually means it comes back.",
    ],
    comparison: {
      caption: "Damp and mould inspection and treatment compared",
      columns: ["", "Inspection and report", "Treatment"],
      rows: [
        [
          "What it does",
          "Finds the type of damp, where it comes from and what's contributing to it",
          "Treats mould and the affected surfaces",
        ],
        [
          "What you get",
          "Photographs, findings and clear recommendations for remedial action",
          "Treated areas, priced by the size of the affected area",
        ],
        ["Rosecrest price", "Fast-track inspection at a fixed £450", "£25 per m², quoted after the survey"],
        [
          "When to use it",
          "First, whenever the cause isn't certain or a tenant has raised a complaint",
          "Once the cause is understood",
        ],
      ],
    },
    sections: [
      {
        heading: "The common types of damp",
        bullets: [
          "Condensation: moist indoor air settling on cold surfaces, often linked to ventilation, heating and how rooms are used.",
          "Penetrating damp: water getting in from outside through defects in roofs, gutters, walls or windows.",
          "Rising damp: ground moisture rising through walls without an effective damp-proof course.",
          "Leaks: water escaping from plumbing, drainage or appliances.",
        ],
      },
      {
        heading: "What a damp and mould inspection covers",
        paragraphs: [
          "Our surveyors inspect the affected areas on site, identify the damp and mould conditions, and look at contributing factors such as ventilation or structural issues. Where appropriate we use moisture meters and thermal imaging to assess the extent of the problem.",
          "The report includes photographs and clear recommendations for remedial action.",
        ],
      },
      {
        heading: "Landlords, tenants and Awaab's Law",
        paragraphs: [
          "Damp and mould complaints need prompt, documented action. Awaab's Law sets timescales for social landlords to investigate and fix hazards such as damp and mould. An independent inspection gives you a dated record of the condition, the likely cause and the action needed.",
        ],
      },
      {
        heading: "Inspection and treatment from one team",
        paragraphs: [
          "Because we offer both, we can inspect, report and then treat, with the treatment quote based on what the inspection found.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is black mould always caused by condensation?",
        answer:
          "No. Condensation is a common cause, but mould can also follow a leak, rain getting in through a defect, or rising damp. An inspection finds which it is, so the fix addresses the cause.",
      },
      {
        question: "How much does a damp and mould inspection cost?",
        answer:
          "Our fast-track damp and mould inspection is a fixed £450. Mould treatment is priced separately at £25 per m² of affected area.",
      },
      {
        question: "Can you carry out the treatment as well as the report?",
        answer:
          "Yes. In addition to independent inspection and reporting, we offer mould treatment and remediation. A treatment quote can be provided after the survey.",
      },
    ],
    related: [
      { label: "Damp and mould surveys", href: "/services/damp-mould" },
      { label: "Landlords: disrepair and Awaab's Law", href: "/landlord" },
      { label: "Thermographic surveys", href: "/services/thermographic-surveys" },
      { label: "Housing disrepair survey vs HHSRS assessment", href: "/guides/housing-disrepair-survey-vs-hhsrs-assessment" },
    ],
  },
  {
    slug: "party-wall-notices-and-awards",
    name: "Party wall notices and awards explained",
    title: "Do I need a party wall agreement? Notices, awards and surveyors explained",
    metaTitle: "Do I Need a Party Wall Agreement? Notices & Awards Explained | Rosecrest",
    description:
      "When the Party Wall etc. Act 1996 applies, which notice to serve and when, what happens if your neighbour doesn't reply, and agreed vs two surveyors.",
    updated: "2026-10-25",
    intro: [
      "If you're building on or near a wall you share with a neighbour, the Party Wall etc. Act 1996 probably applies. What people call a \"party wall agreement\" is usually one of two things: the neighbour's written consent to your notice, or a party wall award made by surveyors.",
    ],
    sections: [
      {
        heading: "Work that usually needs a notice",
        bullets: [
          "Work to a party wall itself, such as cutting into it to insert beams for a loft conversion or extension, raising it, or underpinning it.",
          "Building a new wall on or at the boundary line.",
          "Excavating within 3 metres of a neighbouring building and deeper than its foundations, or within 6 metres for some deeper excavations.",
        ],
      },
      {
        heading: "Which notice, and how much warning",
        table: {
          caption: "Party wall notice periods",
          columns: ["Notice", "Typical work", "Minimum notice"],
          rows: [
            ["Party structure notice", "Work to an existing party wall", "2 months"],
            ["Line of junction notice", "A new wall on or at the boundary", "1 month"],
            ["Notice of adjacent excavation", "Excavating near a neighbouring building", "1 month"],
          ],
        },
      },
      {
        heading: "What happens after you serve notice",
        paragraphs: [
          "Your neighbour (the adjoining owner) can consent in writing or dissent. If they don't respond within 14 days, a dispute is treated as having arisen.",
          "A dispute doesn't mean a falling-out. It means surveyors are appointed to settle how the work is done in a party wall award, commonly misnamed the party wall agreement.",
        ],
      },
      {
        heading: "Agreed surveyor or two surveyors?",
        table: {
          caption: "Party wall surveyor appointments compared",
          columns: ["", "Agreed surveyor", "Two surveyors"],
          rows: [
            [
              "Who acts",
              "One impartial surveyor acts for both owners",
              "Each owner appoints their own surveyor",
            ],
            [
              "When it's used",
              "Both owners consent to sharing a surveyor",
              "Either owner has concerns about impartiality",
            ],
            [
              "If they disagree",
              "Not applicable",
              "The two surveyors select a third surveyor, who is only called on if they can't agree",
            ],
          ],
        },
        paragraphs: [
          "Either way, the surveyors' work includes site visits, a schedule of condition recording the neighbouring property before work starts, and drafting the award.",
        ],
      },
      {
        heading: "How long it takes",
        paragraphs: [
          "Straightforward cases can finish in a few weeks. Where an award is needed it typically takes 6–8 weeks, so serve notice well before you plan to start.",
        ],
      },
      {
        heading: "Serving the notice yourself",
        paragraphs: [
          "You can serve a notice yourself. Our free party wall notice generator produces one from your details, or we can prepare and serve notices for you.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is a party wall agreement a legal requirement?",
        answer:
          "Serving notice is a legal requirement for work covered by the Party Wall etc. Act 1996. After notice, the outcome is either your neighbour's written consent or a party wall award prepared by surveyors.",
      },
      {
        question: "What if my neighbour doesn't reply to the notice?",
        answer:
          "If the adjoining owner doesn't respond within 14 days, a dispute is treated as having arisen and surveyors are appointed to prepare a party wall award.",
      },
      {
        question: "Can one surveyor act for both sides?",
        answer:
          "Yes, as an Agreed Surveyor, provided both owners consent. Where one owner has concerns about impartiality, each appoints their own surveyor.",
      },
      {
        question: "How long does a party wall award take?",
        answer:
          "Where an award is needed it typically takes 6–8 weeks, though this varies with the works and how the adjoining owner responds.",
      },
    ],
    related: [
      { label: "Party wall surveyor", href: "/services/party-wall" },
      { label: "Free party wall notice generator", href: "/services/party-wall/notice-generator" },
      { label: "Starting work without a party wall agreement", href: "/blog/start-building-without-party-wall-agreement" },
      { label: "The Party Wall Act 1996 explained", href: "/blog/ultimate-guide-party-wall-act-1996" },
    ],
  },
  {
    slug: "housing-disrepair-survey-vs-hhsrs-assessment",
    name: "Housing disrepair survey vs HHSRS assessment",
    title: "Housing disrepair survey vs HHSRS assessment: what's the difference?",
    metaTitle: "Housing Disrepair Survey vs HHSRS Assessment Explained | Rosecrest",
    description:
      "How a housing disrepair survey, an HHSRS hazard assessment and a CPR 35 expert report differ, and which one tenants, landlords and solicitors need.",
    updated: "2026-10-25",
    intro: [
      "Disrepair surveys, HHSRS assessments and expert witness reports often look at the same damp wall or broken boiler, but they answer different questions for different purposes.",
    ],
    comparison: {
      caption: "Disrepair survey, HHSRS assessment and CPR 35 report compared",
      columns: ["", "Disrepair survey", "HHSRS assessment", "CPR 35 expert report"],
      rows: [
        [
          "Question it answers",
          "What is in disrepair, and what needs repairing?",
          "Does the property's condition create a hazard to health or safety, and how serious is it?",
          "What is an independent expert's opinion on the matters in dispute?",
        ],
        [
          "Based on",
          "The property's condition against UK housing standards",
          "The Housing Health and Safety Rating System under the Housing Act 2004",
          "Civil Procedure Rules Part 35, which govern expert evidence",
        ],
        [
          "Typical use",
          "Claims, disputes and scoping repairs",
          "Compliance checks, landlord risk management and enforcement",
          "Civil court proceedings",
        ],
        [
          "Typical client",
          "Tenants, landlords, solicitors, housing providers",
          "Landlords, councils, housing providers",
          "Solicitors and legal teams for claimants or defendants",
        ],
      ],
    },
    sections: [
      {
        heading: "Housing disrepair surveys",
        paragraphs: [
          "A disrepair survey records the condition of the property, identifies defects against UK housing standards and sets out the repairs needed. It's the starting point for most disrepair claims, and for landlords who want an independent scope of works.",
        ],
      },
      {
        heading: "HHSRS assessments",
        paragraphs: [
          "The Housing Health and Safety Rating System is the risk-based method used to assess hazards in homes. It covers 29 hazards, including damp and mould, excess cold, falls and fire. Hazards are rated Category 1, the most serious, where councils have a duty to act, or Category 2.",
        ],
      },
      {
        heading: "CPR 35 expert witness reports",
        paragraphs: [
          "A CPR 35 report is prepared in accordance with Civil Procedure Rules Part 35. It gives the court an independent, impartial assessment of the property matter, and the expert's duty is to the court rather than to the party paying for the report.",
        ],
      },
      {
        heading: "Which one do you need?",
        bullets: [
          "A tenant or landlord who wants to know what's wrong and what to fix: a housing disrepair survey.",
          "A landlord or housing provider checking compliance or responding to a hazard: an HHSRS assessment.",
          "A solicitor with a claim heading to court: a CPR 35 expert witness report.",
          "Damp and mould specifically: a damp and mould inspection.",
        ],
      },
    ],
    faqs: [
      {
        question: "Who do you prepare disrepair and expert reports for?",
        answer:
          "Tenants, landlords, housing providers, councils and solicitors. Our CPR 35 expert witness reports are prepared for claimants and defendants in civil litigation.",
      },
      {
        question: "How long does a CPR 35 expert report take?",
        answer:
          "It depends on the complexity of the case. In most cases we aim to deliver a draft report within 10–15 working days of instruction and site inspection. Urgent instructions can be discussed.",
      },
      {
        question: "Not sure which report you need?",
        answer:
          "Tell us what the report is for when you get in touch and we'll recommend the right inspection.",
      },
    ],
    related: [
      { label: "Housing disrepair surveys", href: "/services/housing-disrepair" },
      { label: "CPR 35 expert witness reports", href: "/services/cpr-35-reports" },
      { label: "Landlords: disrepair and Awaab's Law", href: "/landlord" },
      { label: "Legal professionals", href: "/legal" },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return guides.find((guide) => guide.slug === slug);
}
