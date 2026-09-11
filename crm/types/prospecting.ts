export type ProspectingRunKind =
  | "weekly"
  | "daily_procurement"
  | "refetch"
  | "manual";

export type ProspectingRunStatus =
  | "queued"
  | "running"
  | "paused"
  | "completed"
  | "failed";

export type ProspectingRunSummary = {
  id: string;
  kind: ProspectingRunKind;
  status: ProspectingRunStatus;
  startedAt: string | null;
  finishedAt: string | null;
  triggeredBy: string | null;
  createdAt: string;
  report?: unknown;
};

export type ProspectingStatus = {
  module: "prospecting";
  ready: boolean;
  sources: { id: string; enabled: boolean; lastHealthyAt: string | null }[];
  latestRun: ProspectingRunSummary | null;
};

export type ProspectingListResponse<T> = {
  items: T[];
  total: number;
  page?: number;
  limit?: number;
};

export type ProspectOpportunityRow = {
  id: string;
  legalName: string;
  companyNumber: string | null;
  standingGrade: string;
  lane: string;
  workflow: string;
  status: string;
  decision: string | null;
  scoreTotal: number | null;
  scoreBand: string | null;
  createdAt?: string;
  updatedAt: string;
};

export type ProspectAccountRow = {
  id: string;
  legalName: string;
  companyNumber: string | null;
  lane: string;
  standingGrade: string;
  status: string;
  suppressed: boolean;
};

export type ProspectContactRow = {
  id: string;
  legalName: string;
  personName: string | null;
  roleTitle: string | null;
  buyerRoleKey: string | null;
  email: string | null;
  confidence: string;
  sourceScope: string | null;
};

export type ProspectSignalRow = {
  id: string;
  legalName: string;
  family: string;
  summary: string;
  urgency: string;
  confidence: string;
  occurredOn: string;
  sourceUrl: string;
};

export type ProspectProcurementRow = {
  ocid: string;
  title: string | null;
  status: string | null;
  commercialTool: string | null;
  totalValueExVat: number | null;
  portalUrl: string | null;
  endsOn: string | null;
  currentNoticeId: string | null;
  currentNoticeType: string | null;
  lotCount: number;
  supplierCount: number;
  contactEmail: string | null;
  opportunityId: string | null;
};

export type ProspectNetworkRow = {
  id: string;
  name: string;
  networkType: string;
  memberCount: number;
  reachNote: string | null;
};

export type ProspectResultRow = {
  id: string;
  legalName: string;
  status: string;
  decision: string | null;
  jobNumber: string | null;
  paid: boolean;
  amount: number | null;
};

export type ProspectCard = {
  opportunityId: string;
  accountId: string;
  legalName: string;
  lane: string;
  workflow: string;
  status: string;
  decision: string | null;
  decisionReason: string | null;
  standingGrade: string;
  scoreDisplay: string | null;
  scoreBand: string | null;
  needStatement: string | null;
  script: string;
  outreachAllowed: boolean;
  chips: {
    fieldPath: string;
    label: string;
    value: unknown;
    confidence: string;
    sourceId: string;
    sourceUrl: string;
    stale?: boolean;
  }[];
  gates: { gate: string; result: string; reason: string }[];
  scores: { component: string; points: number; maxPoints: number; rationale: string }[];
  contacts: {
    id: string;
    personName: string | null;
    roleTitle: string | null;
    email: string | null;
    confidence: string;
    sourceScope: string | null;
    suppressed: boolean;
  }[];
  checks: { checkType: string; outcome: string; checkedAt: string }[];
  planning: {
    reference: string | null;
    status: string | null;
    portalConfirmed: boolean;
    portalCheck: "confirmed" | "unconfirmed" | "not_checked" | null;
    historyCount: number;
    vote: string | null;
    constraints: string[];
    team: string[];
    documents: number;
    adjoiningOwners: number | null;
    officerExcerpt: string | null;
    s106Excerpt: string | null;
  } | null;
  fca: {
    frn: string | null;
    status: string | null;
    authorised: boolean;
    arCount: number;
    principalFrn: string | null;
    permissions: string[];
    postcode: string | null;
    phone: string | null;
    website: string | null;
    addressLine: string | null;
  } | null;
  sra: {
    sraNumber: string | null;
    status: string | null;
    authorised: boolean;
    practiceAreas: string[];
    publishedDecisionCount: number;
    outcome: string | null;
  } | null;
  identity: {
    previousNames: { name: string; from: string | null; to: string | null }[];
    charges: {
      outstanding: number;
      satisfied: number;
      total: number;
      ordinaryDebentureOnly: boolean;
      adverseCharges: boolean;
      items: {
        charge_code: string | null;
        status: string | null;
        chargee: string | null;
        created_on: string | null;
      }[];
    } | null;
  };
  procurement: {
    ocid: string;
    title: string | null;
    status: string | null;
    currentNoticeId: string | null;
    currentNoticeType: string | null;
    currentNoticePublishedAt: string | null;
    totalValueExVat: number | null;
    portalUrl: string | null;
    contact: { name: string; email: string | null; sourceScope: string | null } | null;
    lots: {
      lotRef: string;
      title: string | null;
      valueExVat: number | null;
      startDate: string | null;
      endDate: string | null;
    }[];
    suppliers: {
      supplierName: string;
      companyNumber: string | null;
      email: string | null;
      lotRef: string | null;
    }[];
    superseded: {
      field: string;
      value: unknown;
      noticeId: string;
      supersededByNoticeId: string;
    }[];
  } | null;
};

export type ProspectingAdminConfig = {
  sources: { id: string; name: string; enabled: boolean; authorityTier: number; lastHealthyAt: string | null }[];
  services: { id: string; name: string; family: string; active: boolean; laneDefaults: string[] }[];
  coverage: { id: string; name: string; kind: string; active: boolean }[];
  buyerRoles: { key: string; label: string; titles: string[]; departmental?: boolean }[];
};
