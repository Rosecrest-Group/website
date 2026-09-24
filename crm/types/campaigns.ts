export type CampaignIndexTab = "draft" | "scheduled" | "sent";

export type CampaignStatus = "DRAFT" | "SCHEDULED" | "SENDING" | "SENT";

export type CampaignListRow = {
  id: string;
  name: string;
  status: CampaignStatus;
  updatedAt: string;
  scheduledAt: string | null;
  sentAt: string | null;
  sentCount: number | null;
  deliveredCount: number | null;
  openedCount: number | null;
  clickedCount: number | null;
  bouncedCount: number | null;
  unsubscribedCount: number | null;
};

export type CampaignLeadFilter = {
  stage: string | null;
  source: string | null;
  search: string;
};

export type CampaignSelection =
  | { kind: "list"; list: "active" | "all" }
  | { kind: "stage"; stage: string }
  | { kind: "source"; source: string }
  | { kind: "lead"; id: string; label: string }
  | { kind: "email"; email: string };

export type CampaignAttachment = {
  url: string;
  filename: string;
};

export type CampaignTiming = {
  mode: "now" | "later" | "usual";
  sendDate: string | null;
  fallbackTime: string | null;
  quietStart: string | null;
  quietEnd: string | null;
};

export type CampaignAudience = {
  include: CampaignLeadFilter;
  exclude: CampaignLeadFilter | null;
  recipients: CampaignRecipient[];
  selections: CampaignSelection[];
  attachments: CampaignAttachment[];
  timing?: CampaignTiming;
};

export type CampaignDetail = CampaignListRow & {
  subject: string;
  previewText: string;
  fromName: string;
  html: string;
  audience: CampaignAudience;
  sendCount: number;
  skipCount: number;
};
