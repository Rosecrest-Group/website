// ─────────────────────────────────────────────────────────────
// Single source of truth for all FAQ content.
// Used by:
//   1. The /faqs page (renders all categories grouped by section)
//   2. Service/sector pages with their own FAQ blocks
//   3. FAQPage JSON-LD schema (auto-generated from the same data)
//
// Editing any answer here updates both the rendered UI AND the
// schema simultaneously, so they can never drift apart.
// ─────────────────────────────────────────────────────────────

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQCategory {
  id: FAQCategoryId;
  title: string;
  questions: FAQItem[];
}

export type FAQCategoryId =
  | "general"
  | "surveys"
  | "damp"
  | "cpr35"
  | "partyWall"
  | "epc"
  | "trades"
  | "pricing"
  | "assocrics"
  | "thermographic";

// ─────────────────────────────────────────────────────────────
// Categories
// ─────────────────────────────────────────────────────────────
export const faqs: Record<FAQCategoryId, FAQCategory> = {
  general: {
    id: "general",
    title: "General FAQs",
    questions: [
      {
        question: "Who are Rosecrest Group Ltd?",
        answer:
          "Rosecrest Group Ltd is a RICS-regulated property services firm delivering professional inspection, surveying, compliance and trade services across London and the M25 corridor. We work with homeowners, landlords, housing associations, local authorities, solicitors and commercial clients.",
      },
      {
        question: "What areas do you cover?",
        answer:
          "We cover all 33 London boroughs and areas within or close to the M25, including parts of Surrey, Kent, Hertfordshire and Essex. If your property is near or outside the M25 boundary, please contact us to confirm availability.",
      },
      {
        question: "Are you insured and accredited?",
        answer:
          "Yes. We are regulated by RICS, hold Constructionline Gold accreditation, are SafeContractor approved, and carry comprehensive professional indemnity insurance.",
      },
      {
        question: "How do I book a survey or inspection?",
        answer:
          "You can book online through our website, call us directly on 020 4576 5317, or submit an enquiry via our contact page. We will confirm availability, scope and pricing before confirming your appointment.",
      },
    ],
  },

  surveys: {
    id: "surveys",
    title: "RICS Level 2 & 3 Home Surveys",
    questions: [
      {
        question: "What is the difference between a Level 2 and a Level 3 survey?",
        answer:
          "A Level 2 (HomeBuyer Report) is suitable for conventional properties in good condition. A Level 3 (Building Survey) provides an in-depth analysis suitable for older, extended, or non-standard properties.",
      },
      {
        question: "How long does a survey take?",
        answer:
          "A Level 2 survey typically takes 2–3 hours on site; a Level 3 can take half a day or more depending on the size and complexity of the property.",
      },
      {
        question: "Will I receive photographs in my report?",
        answer:
          "Yes. All reports include clear photographs of defects and RICS condition ratings (1–3).",
      },
      {
        question: "Can you survey vacant or tenanted properties?",
        answer:
          "Yes. We can inspect occupied, vacant, or tenanted homes as long as access is arranged in advance.",
      },
    ],
  },

  damp: {
    id: "damp",
    title: "Damp, Mould & Condensation Services",
    questions: [
      {
        question: "Do you carry out damp and mould testing?",
        answer:
          "Yes. Our surveyors carry out on-site inspections to identify damp, mould and condensation issues. Where appropriate, we use moisture meters and thermal imaging to assess the extent of the problem and identify contributing factors.",
      },
      {
        question: "What's included in a Damp & Mould Condition Report?",
        answer:
          "Our report includes an on-site inspection of affected areas, identification of damp and mould conditions, analysis of contributing factors such as ventilation or structural issues, detailed photographic evidence, and clear recommendations for remedial action.",
      },
      {
        question: "Can you carry out remedial works as well as reports?",
        answer:
          "Yes. In addition to independent inspection and reporting, we offer mould treatment and remediation services. Remedial works are priced separately based on the size of the affected area, and a treatment quote can be provided following the survey.",
      },
    ],
  },

  cpr35: {
    id: "cpr35",
    title: "CPR 35 Expert Witness Reports",
    questions: [
      {
        question: "What is a CPR-35 Expert Witness Report?",
        answer:
          "A CPR-35 Expert Witness Report is a formal document prepared in accordance with Civil Procedure Rules Part 35, which governs expert evidence in civil proceedings. It provides an independent, impartial assessment of a property matter to assist the court in reaching a fair decision.",
      },
      {
        question: "Who do you prepare reports for?",
        answer:
          "We prepare expert witness reports for solicitors, legal teams, claimants and defendants involved in civil litigation. Our reports cover property disputes including disrepair claims, boundary disputes, defect analysis and valuation disagreements.",
      },
      {
        question: "How long does it take to produce an expert report?",
        answer:
          "Timescales depend on the complexity of the case and the volume of evidence to review. In most cases we aim to deliver a draft report within 10–15 working days of instruction and site inspection. Urgent instructions can be accommodated — please contact us to discuss your deadline.",
      },
    ],
  },

  partyWall: {
    id: "partyWall",
    title: "Party Wall & Boundary Services",
    questions: [
      {
        question: "What is the Party Wall etc. Act 1996?",
        answer:
          "The Party Wall etc. Act 1996 provides a framework for preventing and resolving disputes in relation to party walls, boundary walls and excavations near neighbouring buildings. It requires building owners to notify adjoining owners before carrying out certain types of work.",
      },
      {
        question: "Do you act for both sides?",
        answer:
          "As an Agreed Surveyor we can act for both the building owner and the adjoining owner, provided both parties consent. Where one party has concerns about impartiality, we will act solely for the appointing party and a separate surveyor will be appointed by the other side.",
      },
      {
        question: "How long does the Party Wall process take?",
        answer:
          "The timeline varies depending on the complexity of the works and whether the adjoining owner consents or dissents. In straightforward cases the process can be completed in a few weeks. Where a Party Wall Award is required, it typically takes 6–8 weeks, though this can vary.",
      },
    ],
  },

  epc: {
    id: "epc",
    title: "Energy Performance Certificates (EPCs)",
    questions: [
      {
        question: "How long is an EPC valid for?",
        answer:
          "An Energy Performance Certificate is valid for 10 years from the date it was issued. After this period, a new assessment must be carried out if you are selling or renting the property.",
      },
      {
        question: "Do landlords need an EPC before letting?",
        answer:
          "Yes. Landlords are legally required to have a valid EPC with a rating of E or above before letting a property to new tenants. Failure to comply can result in financial penalties.",
      },
      {
        question: "How quickly can I get an EPC?",
        answer:
          "In most cases we can arrange an assessment within 1–2 working days, with the certificate issued shortly after the visit. Contact us if you need an urgent EPC.",
      },
    ],
  },

  trades: {
    id: "trades",
    title: "Building And Maintenance Services",
    questions: [
      {
        question: "What types of works do you carry out?",
        answer:
          "Our trade teams carry out plumbing, carpentry, plastering, painting and decorating, tiling, damp and mould remediation, deep cleaning, carpet cleaning, house clearance and general handyman services.",
      },
      {
        question: "Are your operatives qualified?",
        answer:
          "Yes. All our trade operatives are qualified and experienced in their respective disciplines. Where required, they hold relevant industry certifications and our work is overseen by our management team.",
      },
      {
        question: "Can you handle larger contracts?",
        answer:
          "Yes. We work with landlords, housing associations, local authorities and managing agents on both individual instructions and larger programmes of work. Please contact us to discuss your requirements.",
      },
    ],
  },

  pricing: {
    id: "pricing",
    title: "Pricing & Payment",
    questions: [
      {
        question: "How are fees calculated?",
        answer:
          "Fees vary depending on the type of service, the size and complexity of the property, and the scope of the instruction. Many of our survey services are offered at fixed prices — for example, our Damp & Mould inspection is fixed at £450. For trade works, quotes are provided based on the specific scope required.",
      },
      {
        question: "Do you charge VAT?",
        answer:
          "Yes, VAT is applicable to our services where required by HMRC regulations. All prices quoted will clearly state whether VAT is included or applicable at the standard rate.",
      },
      {
        question: "What payment methods are accepted?",
        answer:
          "We accept payment by bank transfer and major debit and credit cards. Payment terms are confirmed at the point of instruction. For ongoing or programme work, staged payment arrangements may be available.",
      },
    ],
  },

  assocrics: {
    id: "assocrics",
    title: "AssocRICS Mentoring & Counsellor Support",
    questions: [
      {
        question: "Who is this service for?",
        answer:
          "This service is for surveying professionals working towards Associate membership of RICS (AssocRICS). Support is tailored to each candidate’s pathway, experience and development needs.",
      },
      {
        question: "Is this for AssocRICS only?",
        answer:
          "Yes. This service is for the AssocRICS pathway only — supporting surveying professionals working towards Associate membership of RICS.",
      },
      {
        question: "Will Rosecrest write my assessment submissions?",
        answer:
          "No. All assessment documents must remain the candidate’s own original work. Rosecrest may provide developmental feedback, identify gaps, test competence and assist with spelling, grammar and compliance. We do not write, rewrite or generate competency statements, case studies or assessment submissions for candidates.",
      },
      {
        question: "What is the Official Counsellor Appointment and Governance Fee?",
        answer:
          "Where Rosecrest has formally accepted an official RICS counsellor appointment, a fee of £450 including VAT applies. Counsellor approval is an independent professional judgment and cannot be guaranteed or purchased. Rosecrest will only confirm readiness when the counsellor is professionally satisfied that the candidate has demonstrated the required competence.",
      },
      {
        question: "How do I get started?",
        answer:
          "Start with a free 30-minute suitability call. We can then discuss pathway mapping, pay-as-you-go mentoring, monthly packages or the AssocRICS Guided Candidate Programme.",
      },
    ],
  },

  thermographic: {
    id: "thermographic",
    title: "Thermographic Building Surveys",
    questions: [
      {
        question: "What is a thermographic survey?",
        answer:
          "A thermographic survey (also called a thermal-imaging building survey) is a non-invasive inspection using infrared imaging to identify surface-temperature patterns that may be associated with heat loss, defective or missing insulation, thermal bridging, air leakage, condensation, moisture and water ingress.",
      },
      {
        question: "What does the price include?",
        answer:
          "Each survey price includes the inspection and a written report containing relevant thermal images, corresponding photographs, an explanation of identified anomalies and recommendations for any necessary further investigation.",
      },
      {
        question: "Can I add this to a Level 2 or Level 3 survey?",
        answer:
          "Yes. Thermographic surveying is available as an add-on to an RICS Level 2 or Level 3 survey for £175 including VAT.",
      },
      {
        question: "Does thermal imaging see through walls?",
        answer:
          "No. Thermal imaging records surface-temperature patterns and does not see through walls, ceilings, floors or other building elements. A thermal anomaly does not, by itself, conclusively establish the presence, cause or extent of a concealed defect.",
      },
      {
        question: "When might further investigation be needed?",
        answer:
          "Findings are interpreted in the context of the building’s construction, environmental conditions, visual observations and any supporting test results. Further intrusive or specialist investigation may be recommended where the cause remains uncertain.",
      },
    ],
  },
};

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/** Get all categories in display order — used by /faqs page. */
export function getAllFAQCategories(): FAQCategory[] {
  return [
    faqs.general,
    faqs.surveys,
    faqs.damp,
    faqs.cpr35,
    faqs.partyWall,
    faqs.epc,
    faqs.assocrics,
    faqs.thermographic,
    faqs.trades,
    faqs.pricing,
  ];
}

/**
 * Map of route → which FAQ category appears on that page.
 * Used by service/sector pages to pull their relevant FAQs and
 * by the schema layer to know which FAQs to include in JSON-LD.
 */
const routeToCategory: Record<string, FAQCategoryId> = {
  "/homebuyer": "surveys",
  "/services/damp-mould": "damp",
  "/services/cpr-35-reports": "cpr35",
  "/services/party-wall": "partyWall",
  "/services/epc": "epc",
  "/services/assocrics-mentoring": "assocrics",
  "/services/thermographic-surveys": "thermographic",
};

/** Returns FAQs visible on the given route, or null if none. */
export function getFAQsForRoute(path: string): FAQItem[] | null {
  const categoryId = routeToCategory[path];
  if (!categoryId) return null;
  return faqs[categoryId].questions;
}