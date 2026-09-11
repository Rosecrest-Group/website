import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ProspectCard } from "@/crm/types/prospecting";
import { toSalesCard } from "./salesCardView";

function baseCard(overrides: Partial<ProspectCard> = {}): ProspectCard {
  return {
    opportunityId: "o1",
    accountId: "a1",
    legalName: "KINGSLEY NAPLEY LLP",
    lane: "legal_expert",
    workflow: "sales",
    status: "draft",
    decision: "management_review",
    decisionReason: "crm history unknown — cannot route",
    standingGrade: "green",
    scoreDisplay: "48/95",
    scoreBand: "Standard review",
    needStatement: "Discovered via SRA organisation search “Kingsley Napley”",
    script: "Do not call. crm history unknown — cannot route",
    outreachAllowed: false,
    chips: [
      {
        fieldPath: "identity.company_number",
        label: "identity.company_number",
        value: "OC343278",
        confidence: "confirmed",
        sourceId: "companies_house",
        sourceUrl: "https://example",
      },
      {
        fieldPath: "identity.status",
        label: "identity.status",
        value: "active",
        confidence: "confirmed",
        sourceId: "companies_house",
        sourceUrl: "https://example",
      },
      {
        fieldPath: "identity.registered_address",
        label: "identity.registered_address",
        value: {
          address_line_1: "20 Bonhill Street",
          locality: "London",
          postal_code: "EC2A 4DJ",
        },
        confidence: "confirmed",
        sourceId: "companies_house",
        sourceUrl: "https://example",
      },
      {
        fieldPath: "identity.domain",
        label: "identity.domain",
        value: "kingsleynapley.co.uk",
        confidence: "confirmed",
        sourceId: "sra",
        sourceUrl: "https://example",
      },
      {
        fieldPath: "identity.officers",
        label: "identity.officers",
        value: [{ name: "A Partner" }, { name: "Another Partner" }],
        confidence: "confirmed",
        sourceId: "companies_house",
        sourceUrl: "https://example",
      },
    ],
    gates: [{ gate: "legitimacy", result: "pass", reason: "active UK LLP" }],
    scores: [{ component: "need", points: 5, maxPoints: 20, rationale: "need evidence" }],
    contacts: [
      {
        id: "c1",
        personName: "Jane Smith",
        roleTitle: "Partner",
        email: "jane@kingsleynapley.co.uk",
        confidence: "confirmed",
        sourceScope: "org_web",
        suppressed: false,
      },
      {
        id: "c2",
        personName: "Our People",
        roleTitle: null,
        email: null,
        confidence: "inferred",
        sourceScope: "org_web",
        suppressed: false,
      },
      {
        id: "c3",
        personName: null,
        roleTitle: null,
        email: "info@kingsleynapley.co.uk",
        confidence: "generic",
        sourceScope: "org_web",
        suppressed: false,
      },
      {
        id: "c4",
        personName: null,
        roleTitle: null,
        email: "enquiries@kingsleynapley.co.uk",
        confidence: "generic",
        sourceScope: "org_web",
        suppressed: false,
      },
    ],
    checks: [
      { checkType: "gazette_insolvency", outcome: "clear", checkedAt: new Date().toISOString() },
      { checkType: "hse", outcome: "clear", checkedAt: new Date().toISOString() },
    ],
    planning: null,
    fca: null,
    sra: {
      sraNumber: "500046",
      status: "Authorised",
      authorised: true,
      practiceAreas: ["housing", "litigation", "corporate"],
      publishedDecisionCount: 0,
      outcome: "not_checked",
    },
    identity: {
      previousNames: [],
      charges: {
        outstanding: 3,
        satisfied: 1,
        total: 4,
        ordinaryDebentureOnly: true,
        adverseCharges: false,
        items: [],
      },
    },
    procurement: null,
    ...overrides,
  };
}

describe("sales card view", () => {
  it("keeps identity compact and skips officer dumps", () => {
    const view = toSalesCard(baseCard());
    assert.deepEqual(
      view.identity.map((row) => row.label),
      ["Legal name", "Company no.", "Status", "Address", "Domain", "SRA number"],
    );
    assert.equal(view.identity.find((row) => row.label === "Company no.")?.value, "OC343278");
    assert.equal(view.identity.find((row) => row.label === "Address")?.value, "20 Bonhill Street, London, EC2A 4DJ");
    assert.equal(view.identity.find((row) => row.label === "SRA number")?.value, "500046");
    assert.equal(
      view.identity.some((row) => /officer/i.test(row.label)),
      false,
    );
  });

  it("hides search-only need statements and empty access sections", () => {
    const view = toSalesCard(baseCard());
    assert.equal(view.needKind, "search-only");
    assert.match(view.needLines[0] ?? "", /No buying signal/);
    assert.equal(view.offer, "Legal / expert");
    assert.equal(view.value, "Unknown");
    assert.equal(view.framework, "None this pass");
    assert.equal(view.procurement, "None this pass");
    assert.equal(view.network, "None this pass");
  });

  it("keeps named buyers plus one office mailbox", () => {
    const view = toSalesCard(baseCard());
    assert.deepEqual(
      view.buyers.map((row) => row.line),
      ["Jane Smith · Partner · jane@kingsleynapley.co.uk", "info@kingsleynapley.co.uk"],
    );
  });

  it("summarises standing without SRA practice-area dumps", () => {
    const view = toSalesCard(baseCard());
    assert.deepEqual(view.standingLines, [
      "Gazette: Clear",
      "HSE: Clear",
      "SRA authorisation: Authorised",
      "SRA published decisions: Not checked",
    ]);
    assert.equal(view.decisionLabel, "Management review");
    assert.equal(view.scoreBreakdown, "need 5");
  });
});
