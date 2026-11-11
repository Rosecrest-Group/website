// ─────────────────────────────────────────────────────────────
// FAQPage JSON-LD text for the marketing pages that do not emit
// their own FAQPage.
//
// buildPageSchema (lib/schema.ts, rendered by PageJsonLd) adds a
// FAQPage block from getFAQsForRoute(path). Each list below is a
// plain-text copy of the FAQs rendered on that page (link text kept,
// markup dropped), so it MUST be updated whenever the page's visible
// FAQ wording changes: Google treats FAQ structured data that does
// not match the visible page as spam.
//
// Pages that emit their own FAQPage (e.g. /faqs, /legal, /councils,
// /services/stock-condition, the trade pages and the guides) must not
// be listed here, so every page carries exactly one FAQPage.
// ─────────────────────────────────────────────────────────────

export interface FAQItem {
  question: string;
  answer: string;
}

// The Level 2 survey page renders this list directly, so the visible FAQ and
// its FAQPage structured data always match. Shared answers mirror SURVEY_FAQ in
// components/site/homebuyer/survey-sections.tsx; change both together.
export const LEVEL_2_PAGE_FAQ: FAQItem[] = [
  {
    question: "What is a Level 2 survey?",
    answer:
      "A RICS Level 2 survey, also known as the Homebuyer Report, is a visual, non-invasive inspection of a conventional home in reasonable condition. It uses traffic-light condition ratings to show which defects need urgent attention, which need repair, and where further investigation is recommended before you buy.",
  },
  {
    question: "What does a Level 2 survey check?",
    answer:
      "The surveyor inspects accessible building elements inside and out, including walls, ceilings, roofs, gutters, windows and doors, and makes a visual appraisal of services such as heating, electricity, water and drainage. The report rates the condition of each element, identifies urgent repairs and future maintenance, recommends further investigation where needed and includes a Next Steps Action Plan.",
  },
  {
    question: "How long does a Level 2 survey take?",
    answer:
      "The time on site depends on the size of the property. Larger or more complex properties take longer.",
  },
  {
    question: "Is a Level 2 the same as a HomeBuyer Report?",
    answer:
      "Yes. The RICS Level 2 survey is also known as the Homebuyer Report, and many people still use that name.",
  },
  {
    question: "How much does a Level 2 survey cost in London?",
    answer:
      "Our RICS Level 2 survey starts from £330.99 for a studio, including VAT. The final quotation depends on the property’s size, type, location and complexity. HomeOwners Alliance reports that the average Level 2 survey in London cost approximately £590 in August 2026, based on Reallymoving data.",
  },
  {
    question: "Is a Level 2 survey right for my property?",
    answer:
      "A Level 2 suits modern and conventional properties in reasonable condition, typically built in the last 30 years and not significantly altered or extended. For older, larger, altered or non-traditional properties, a Level 3 Building Survey provides a more detailed assessment. The final choice of survey is yours.",
  },
  {
    question: "What is the difference between a Level 2 and a Level 3 survey?",
    answer:
      "A Level 2 (Homebuyer Survey) suits modern and conventional properties, with condition ratings showing the urgency of any defects. A Level 3 (Building Survey) suits older, altered or non-standard buildings and provides a more detailed assessment of the building’s construction, condition and defects, including more extensive advice on repairs and maintenance and repair cost estimates where applicable. Both Level 2 and Level 3 surveys are generally visual and non-invasive. Surveyors inspect accessible areas without opening up the building or carrying out destructive investigations.",
  },
  {
    question: "Can the surveyor tell me whether to buy the property?",
    answer:
      "No. Our surveyors cannot advise whether to proceed with or withdraw from the purchase. As section 8 of our Terms of Engagement puts it: “The report is intended to assist decision-making only. The decision to proceed, renegotiate, or withdraw from a purchase is the Client’s responsibility.”",
  },
  {
    question: "When will I receive my report?",
    answer:
      "As standard, a Level 1 report is delivered within 2 working days, a Level 2 within 3–5 working days and a Level 3 within 5–7 working days of the inspection. Need it sooner? Choose the Express 48-Hour Report option when you check availability and get your fixed price.",
  },
  {
    question: "Will I receive photographs in my report?",
    answer:
      "Yes. Your report includes photographs of the defects identified during the inspection, with the surveyor’s explanation of each one.",
  },
  {
    question: "Can you survey vacant or tenanted properties?",
    answer: "Yes. We arrange access with the estate agent, seller or managing agent.",
  },
];

const routeFAQs: Record<string, FAQItem[]> = {
  "/homebuyer/survey-level-2": LEVEL_2_PAGE_FAQ,
  // Mirrors the FAQ rendered on /homebuyer/survey-level-1; update both together.
  "/homebuyer/survey-level-1": [
    {
      question: "Does a Level 1 survey include advice on repairs?",
      answer:
        "No. The RICS Level 1 Survey does not offer specific advice on repairs or ongoing maintenance. If the surveyor cannot draw conclusions about any part of the property with sufficient confidence, the report will recommend further investigations.",
    },
    {
      question: "How long does a survey take?",
      answer:
        "The duration of the survey depends on the size of the property. A Level 1 typically takes 1–2 hours and a Level 3 typically 2–3 hours. Larger or more complex properties take longer.",
    },
    {
      question: "When will I receive my report?",
      answer:
        "As standard, a Level 1 report is delivered within 2 working days, a Level 2 within 3–5 working days and a Level 3 within 5–7 working days of the inspection. Need it sooner? Choose the Express 48-Hour Report option when you check availability and get your fixed price.",
    },
    {
      question: "Will I receive photographs in my report?",
      answer:
        "Yes. Your report includes photographs of the defects identified during the inspection, with the surveyor’s explanation of each one.",
    },
    {
      question: "Can you survey vacant or tenanted properties?",
      answer:
        "Yes. We arrange access with the estate agent, seller or managing agent.",
    },
    {
      question: "Why do you need the number of bedrooms?",
      answer:
        "Your price is based on the property type and size. Choose the bedrooms and you’ll see your exact price before you book.",
    },
  ],
  // Mirrors the FAQ rendered on /homebuyer/survey-level-3; update both together.
  "/homebuyer/survey-level-3": [
    {
      question: "Does a Level 3 survey include a valuation?",
      answer:
        "No. A valuation is not included with this survey, but a separate, discounted valuation can be provided upon request.",
    },
    {
      question: "What is the difference between a Level 2 and a Level 3 survey?",
      answer:
        "A Level 2 (Homebuyer Survey) suits modern and conventional properties, with condition ratings showing the urgency of any defects. A Level 3 (Building Survey) suits older, altered or non-standard buildings and provides a more detailed assessment of the building’s construction, condition and defects, including more extensive advice on repairs and maintenance and repair cost estimates where applicable. Both Level 2 and Level 3 surveys are generally visual and non-invasive. Surveyors inspect accessible areas without opening up the building or carrying out destructive investigations.",
    },
    {
      question: "Can the surveyor tell me whether to buy the property?",
      answer:
        "No. Our surveyors cannot advise whether to proceed with or withdraw from the purchase. As section 8 of our Terms of Engagement puts it: “The report is intended to assist decision-making only. The decision to proceed, renegotiate, or withdraw from a purchase is the Client’s responsibility.”",
    },
    {
      question: "How long does a survey take?",
      answer:
        "The duration of the survey depends on the size of the property. A Level 1 typically takes 1–2 hours and a Level 3 typically 2–3 hours. Larger or more complex properties take longer.",
    },
    {
      question: "When will I receive my report?",
      answer:
        "As standard, a Level 1 report is delivered within 2 working days, a Level 2 within 3–5 working days and a Level 3 within 5–7 working days of the inspection. Need it sooner? Choose the Express 48-Hour Report option when you check availability and get your fixed price.",
    },
    {
      question: "Can you survey vacant or tenanted properties?",
      answer:
        "Yes. We arrange access with the estate agent, seller or managing agent.",
    },
  ],
  // Mirrors the FAQ rendered on /services/environmental-reports; update both together.
  "/services/environmental-reports": [
    {
      question: "What is an environmental search?",
      answer:
        "A report on the environmental risks affecting a property, backed by national data sources and GIS mapping. Ours covers contaminated land, flood risk, ground stability, radon, nearby environmental hazards and climate-related risk, with a clear, easy-to-understand summary.",
    },
    {
      question: "What does a flood risk report cover?",
      answer:
        "River, surface water, groundwater and coastal flood data, to assess the property’s exposure to flooding and the possible insurance implications.",
    },
    {
      question: "What is a contaminated land report?",
      answer:
        "It identifies past industrial use, potential pollution risks and any remediation requirements for the land.",
    },
    {
      question: "What does a ground stability report check?",
      answer:
        "Risks from subsidence, sinkholes and mining activity.",
    },
    {
      question: "Who needs an environmental report?",
      answer:
        "Buyers and sellers of residential or commercial property, landlords and letting agents, developers and architects, solicitors and conveyancers, and mortgage lenders and insurers.",
    },
    {
      question: "How much does it cost and how long does it take?",
      answer:
        "We offer affordable, fixed-rate pricing, and a fast turnaround is available.",
    },
  ],
  // Mirrors the FAQ rendered on /services/party-wall/notice-generator; update both together.
  "/services/party-wall/notice-generator": [
    {
      question: "Is this a party wall notice template?",
      answer:
        "It works like one: instead of filling in a blank template, you answer the questions above and we prepare the notice from your answers and email it to you.",
    },
    {
      question: "Which party wall notice do I need?",
      answer:
        "It depends on the work. Loft beams, chimney breast removal and other work to a shared wall need a party structure notice. A new wall on the boundary needs a line of junction notice. Excavating within 3 metres of a neighbour’s building and deeper than its foundations (or within 6 metres in some cases) needs a notice of adjacent excavation.",
    },
    {
      question: "What happens after I serve the notice?",
      answer:
        "Your neighbour has 14 days to respond. If they consent in writing, nothing more is needed under the Act. If they dissent, or don’t reply, party wall surveyors prepare a party wall award before the work starts.",
    },
    {
      question: "Can you serve the notice for me?",
      answer:
        "Yes. We advise on, prepare, draft, review and serve notices: £50 per notice. See our party wall surveyors.",
    },
  ],
  // Mirrors SURVEY_FAQ in components/site/homebuyer/survey-sections.tsx
  // plus the areas question on app/(marketing)/homebuyer/page.tsx.
  "/homebuyer": [
    {
      question: "What is the difference between a Level 2 and a Level 3 survey?",
      answer:
        "A Level 2 (Homebuyer Survey) suits modern and conventional properties, with condition ratings showing the urgency of any defects. A Level 3 (Building Survey) suits older, altered or non-standard buildings and provides a more detailed assessment of the building’s construction, condition and defects, including more extensive advice on repairs and maintenance and repair cost estimates where applicable. Both Level 2 and Level 3 surveys are generally visual and non-invasive. Surveyors inspect accessible areas without opening up the building or carrying out destructive investigations.",
    },
    {
      question: "How long does a survey take?",
      answer:
        "The duration of the survey depends on the size of the property. A Level 1 typically takes 1–2 hours and a Level 3 typically 2–3 hours. Larger or more complex properties take longer.",
    },
    {
      question: "When will I receive my report?",
      answer:
        "As standard, a Level 1 report is delivered within 2 working days, a Level 2 within 3–5 working days and a Level 3 within 5–7 working days of the inspection. Need it sooner? Choose the Express 48-Hour Report option when you check availability and get your fixed price.",
    },
    {
      question: "Will I receive photographs in my report?",
      answer:
        "Yes. Your report includes photographs of the defects identified during the inspection, with the surveyor’s explanation of each one.",
    },
    {
      question: "Can you survey vacant or tenanted properties?",
      answer: "Yes. We arrange access with the estate agent, seller or managing agent.",
    },
    {
      question: "Why do you need the number of bedrooms?",
      answer:
        "Your price is based on the property type and size. Choose the bedrooms and you’ll see your exact price before you book.",
    },
    {
      question: "Can the surveyor tell me whether to buy the property?",
      answer:
        "No. Our surveyors cannot advise whether to proceed with or withdraw from the purchase. As section 8 of our Terms of Engagement puts it: “The report is intended to assist decision-making only. The decision to proceed, renegotiate, or withdraw from a purchase is the Client’s responsibility.”",
    },
    {
      question: "Which areas do you cover?",
      answer:
        "We carry out RICS surveys across London and areas within the M25. Check your postcode on our areas we cover page.",
    },
  ],

  "/landlord": [
    {
      question: "What does a damp and mould survey involve?",
      answer:
        "A visual, non-invasive inspection of the accessible affected areas, with photographs and, where appropriate and available, thermal imaging and indicative moisture readings. The report identifies likely causes where supported by the findings and recommends further investigation where necessary. Damp and mould surveys →",
    },
    {
      question: "Does Awaab’s Law apply to private landlords?",
      answer:
        "No. As at November 2026, it applies to councils and housing associations. A consultation on extending it to private rented tenancies runs until 18 December 2026. Your existing duties on repair, fitness for habitation and HHSRS already apply.",
    },
    {
      question: "What is an HHSRS assessment?",
      answer:
        "A formal assessment of hazards in a home under the Housing Health and Safety Rating System, the system councils use to enforce housing standards. The report sets out the hazards found and what needs attention. HHSRS guide →",
    },
    {
      question: "A tenant has sent a letter of claim. What now?",
      answer:
        "Speak to your solicitor early. The pre-action protocol gives you 20 working days to respond, and an independent disrepair survey puts the facts on record. Housing disrepair surveys →",
    },
    {
      question: "Do I need an EPC to let a property?",
      answer:
        "Yes. A valid Energy Performance Certificate is needed before you let a home, and it is valid for 10 years. Energy Performance Certificates →",
    },
    {
      question: "Can you treat mould and arrange repairs as well as report?",
      answer:
        "Yes. Mould treatment is £25 per m² + VAT (work out your cost), and remedial work can be arranged through our trusted trade network. If we’re instructed as an expert witness on a property, we don’t quote for or carry out repairs or mould treatment on it as part of, or alongside, that instruction.",
    },
  ],

  "/services/damp-mould": [
    {
      question: "Do you carry out damp and mould testing?",
      answer:
        "Yes. The Damp, Mould and Condensation Survey is a visual, non-invasive inspection of the accessible affected areas, with thermal imaging and indicative moisture readings where appropriate and available. Readings are indicative, so we consider them together with the building and how the home is used.",
    },
    {
      question: "What’s included in a Damp & Mould Condition Report?",
      answer:
        "The affected areas, the conditions observed, contributing factors, photographs and recommendations for onward action. The report identifies likely causes where supported by the findings and recommends further investigation where necessary.",
    },
    {
      question: "Can you carry out remedial works as well as reports?",
      answer:
        "Yes. Mould treatment is £25 per m² + VAT, subject to exact measurement, and other remedial work can be arranged through our trusted trade network. If we’re instructed as an expert witness on a property, we don’t quote for or carry out repairs or mould treatment on it as part of, or alongside, that instruction.",
    },
    {
      question: "Can you remove black mould?",
      answer:
        "Yes. Black mould removal is part of our mould treatment: we treat the mould, clean the area and apply a stain block. Mould can return if the cause stays, so we recommend a Damp, Mould and Condensation Survey first, then fixing the cause, then a recheck.",
    },
    {
      question: "Is mould treatment the same as wall injection or insulation?",
      answer:
        "No. We treat mould on the surface. Injection and cavity insulation address different problems and aren’t part of this service.",
    },
    {
      question: "Is a condensation survey different from a damp survey?",
      answer:
        "Our Damp, Mould and Condensation Survey covers both. Condensation, penetrating damp and rising damp can look alike on a wall but need different fixes, so the survey assesses the likely cause, where the evidence supports it, before any work is recommended.",
    },
    {
      question: "Who is responsible for mould in a rented property?",
      answer:
        "Landlords must keep a rented home fit for human habitation, which includes serious damp and inadequate ventilation (Landlord and Tenant Act 1985, s9A), and keep the structure and exterior in repair (s11). Tenants should report damp or mould to their landlord in writing. General guidance, not legal advice.",
    },
    {
      question: "What should I do about mould in a council house?",
      answer:
        "Report it to the council or housing association in writing. Since 27 October 2025, Awaab’s Law has required social landlords to investigate damp and mould within set timescales. We carry out Damp, Mould and Condensation Surveys for councils and housing associations. General guidance, not legal advice.",
    },
    {
      question: "How much does a damp survey cost in London?",
      answer:
        "Our Damp, Mould and Condensation Survey starts from £540 including VAT, subject to the property’s circumstances and the agreed scope of inspection. Where treatment is appropriate, mould removal is £25 per m² + VAT, subject to exact measurement.",
    },
    {
      question: "How quickly can you inspect?",
      answer: "Tell us if a tenant complaint or deadline is involved and we’ll offer the earliest date we can.",
    },
  ],

  "/services/cpr-35-reports": [
    {
      question: "What is a CPR 35 expert witness report?",
      answer:
        "A report prepared by an independent expert under Part 35 of the Civil Procedure Rules and its Practice Direction, to help the court with technical matters outside ordinary knowledge. It sets out the facts and assumptions relied upon, the analysis, and the expert’s opinion with the basis for it, together with the expert’s qualifications and declaration.",
    },
    {
      question: "Who do you prepare reports for?",
      answer:
        "Solicitors and legal professionals acting for claimants or defendants in property and building disputes, including housing disrepair claims. Whoever instructs us, our duty is to the court. When we are instructed as an expert witness, our role is independent evidence for the court only.",
    },
    {
      question: "How long does it take to produce an expert report?",
      answer:
        "We confirm an inspection date as soon as access is arranged. Tell us your deadline or any court directions when you enquire and we’ll confirm whether we can meet it.",
    },
    {
      question: "What does a building surveyor expert witness report on?",
      answer:
        "Building defects and poor workmanship, damage from building or renovation works, cracking, movement and structural concerns, damp and water ingress, repair liability and remedial works disputes, and damage to neighbouring property.",
    },
    {
      question: "Will the expert give evidence in court?",
      answer:
        "Yes, if your case requires it. When giving evidence, as in the written report, the expert’s duty is to the court.",
    },
    {
      question: "Do you accept Legal Aid instructions?",
      answer:
        "Yes, subject to scope and approval requirements. We’re happy to discuss Legal Aid matters to confirm eligibility and reporting requirements.",
    },
  ],

  "/services/housing-disrepair": [
    {
      question: "What does a housing disrepair survey include?",
      answer:
        "An on-site inspection, a list of defects measured against relevant UK standards, and a detailed report that outlines responsibilities and includes tailored repair recommendations.",
    },
    {
      question: "Who can instruct a disrepair survey?",
      answer: "Landlords, property owners and managing agents, and solicitors acting for tenants or landlords.",
    },
    {
      question: "A tenant has sent a letter of claim. What now?",
      answer:
        "Speak to your solicitor early. The pre-action protocol gives you 20 working days to respond, and an independent disrepair survey puts the facts on record. General guidance, not legal advice.",
    },
    {
      question: "Do you provide expert reports for disrepair claims?",
      answer:
        "Yes. Where a claim is under the Pre-Action Protocol for Housing Conditions Claims or before the court, solicitors instruct our CPR 35 expert witness reports, which are a separate service. CPR 35 expert witness reports →",
    },
    {
      question: "Does a disrepair survey cover damp and mould?",
      answer:
        "Yes, where damp or mould is part of the disrepair. If damp and mould is the main concern, the Damp, Mould and Condensation Survey may suit you better.",
    },
    {
      question: "How much does a housing disrepair survey cost?",
      answer: "Each project is different, so get in touch for detailed pricing. Ask about our special rates when you call.",
    },
  ],

  "/services/party-wall": [
    {
      question: "What is the Party Wall etc. Act 1996?",
      answer:
        "The law in England and Wales that sets out how building work on or near a shared wall, a boundary or a neighbour’s foundations must be notified and, if the neighbour dissents, settled by party wall surveyors through an award.",
    },
    {
      question: "Do you act for both sides?",
      answer:
        "Yes, as the agreed surveyor, if both owners agree to appoint us. Otherwise we act for either the building owner or the adjoining owner, and the two appointed surveyors work together on the award.",
    },
    {
      question: "How long does the Party Wall process take?",
      answer:
        "Notices are served one to two months before work starts, depending on the work, and your neighbour has 14 days to respond. Simple consent cases take 2 to 6 weeks; cases needing an award typically take 6 to 12 weeks, and complex disputes 3 to 6 months.",
    },
    {
      question: "How much does a party wall surveyor cost?",
      answer:
        "Party wall notices are £50 per notice. A schedule of condition is £450. Surveyor time is £145 per hour, whether we are the agreed surveyor or one owner’s appointed surveyor. Introductory offer: a fixed £1,500. The building owner normally pays the reasonable fees of both surveyors.",
    },
    {
      question: "What is a party wall award?",
      answer:
        "The legal document the surveyors make when a neighbour dissents, or doesn’t reply within 14 days. It sets out how and when the work will proceed, access, protective measures, damage protocols and who pays. It is commonly called a party wall agreement.",
    },
    {
      question: "Do I need a schedule of condition?",
      answer:
        "If your neighbour dissents, a schedule of condition records their property before work starts. If they consent, nothing more is needed under the Act, but a schedule of condition is still sensible protection for both owners, and we can prepare one.",
    },
  ],

  "/services/epc": [
    {
      question: "How long is an EPC valid for?",
      answer:
        "10 years. If you make significant improvements, such as new heating or insulation, a new EPC will show the better rating.",
    },
    {
      question: "Do landlords need an EPC before letting?",
      answer:
        "Yes. A valid EPC must be in place before a rental property is marketed, and tenants must be given a copy. Rented homes must also meet the minimum energy efficiency standard, currently a rating of E or above unless a valid exemption is registered. General guidance, not legal advice.",
    },
    {
      question: "How quickly can I get an EPC?",
      answer: "Fast turnaround is available. Tell us when you need it and we’ll confirm the earliest appointment.",
    },
    {
      question: "Do you provide commercial EPCs in London?",
      answer: "Yes. We assess non-domestic properties, issue the certificate and advise on improving the energy rating.",
    },
    {
      question: "How much is an EPC for a rental property?",
      answer: "Residential EPCs will start from £33. Get in touch for commercial EPC pricing.",
    },
    {
      question: "Can I check whether a property already has an EPC?",
      answer: "Yes. EPCs are lodged on the government’s register, which you can search by postcode on GOV.UK.",
    },
  ],

  "/services/assocrics-mentoring": [
    {
      question: "Who is this service for?",
      answer:
        "Surveying professionals working towards Associate membership of RICS (AssocRICS) who want structured mentoring and developmental feedback.",
    },
    {
      question: "Is this for AssocRICS only?",
      answer: "Yes. This service is for the AssocRICS pathway only.",
    },
    {
      question: "Will Rosecrest write my assessment submissions?",
      answer:
        "No. All assessment documents must be your own original work. We give developmental guidance and feedback on documents you prepare.",
    },
    {
      question: "What is the Official Counsellor Appointment and Governance Fee?",
      answer:
        "A £450 fee (incl. VAT) that applies where Rosecrest formally accepts an appointment as your counsellor. Counsellor approval is an independent professional judgement and cannot be guaranteed or purchased.",
    },
    {
      question: "How do I get started?",
      answer:
        "Book your free 30-minute suitability call. We’ll discuss your pathway, check eligibility and explain the support options.",
    },
    {
      question: "What is AssocRICS?",
      answer:
        "AssocRICS is the Associate grade of membership of RICS. Candidates are assessed on their experience and competencies, and assessment and membership decisions rest with RICS.",
    },
    {
      question: "Can I get an RICS mentor for my AssocRICS assessment?",
      answer:
        "Yes. Our structured mentoring covers pathway and competency mapping, evidence reviews and mock assessments, and, where Rosecrest has formally accepted the appointment, official RICS counsellor support.",
    },
  ],

  "/services/thermographic-surveys": [
    {
      question: "What is a thermographic survey?",
      answer:
        "A thermographic survey, also called a thermal imaging survey, uses infrared imaging to record surface-temperature patterns across the instructed areas of a building. A surveyor interprets patterns that may be associated with heat loss, defective or missing insulation, thermal bridging, air leakage, condensation, moisture and water ingress, and sets out the findings in a written report.",
    },
    {
      question: "What does the price include?",
      answer:
        "The inspection and a written report containing relevant thermal images, corresponding photographs, an explanation of identified anomalies and recommendations for any necessary further investigation. All prices include VAT.",
    },
    {
      question: "Can I add this to a Level 2 or Level 3 survey?",
      answer:
        "Yes. If you are already booking an RICS Level 2 or Level 3 survey, you can add thermography for £175 including VAT.",
    },
    {
      question: "Does thermal imaging see through walls?",
      answer:
        "No. Thermal imaging records surface-temperature patterns and does not see through walls, ceilings, floors or other building elements. A thermal anomaly does not, by itself, establish the presence, cause or extent of a concealed defect.",
    },
    {
      question: "When might further investigation be needed?",
      answer:
        "Where the cause of an anomaly remains uncertain. Findings are interpreted in the context of the building’s construction, environmental conditions, visual observations and any supporting test results, and we may recommend further intrusive or specialist investigation.",
    },
    {
      question: "Is a thermal imaging survey the same as a damp survey?",
      answer:
        "Not quite. Thermal imaging can show surface-temperature patterns associated with moisture, but it does not confirm a cause on its own. If you are dealing with damp or mould, our Damp, Mould and Condensation Survey is a visual, non-invasive inspection with thermal imaging and indicative moisture readings where appropriate and available, and a written report that identifies likely causes where supported by the findings.",
    },
  ],
};

/** FAQs visible on the given route, for its FAQPage JSON-LD; null if it has none here. */
export function getFAQsForRoute(path: string): FAQItem[] | null {
  return routeFAQs[path] ?? null;
}
