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
  | { kind: "email"; email: string }
  | { kind: "contactList"; id: string; label: string };

export type CampaignAttachment = {
  url: string;
  filename: string;
};

/** A lead kept on an older audience. New audiences use selections. */
export type CampaignRecipient = {
  id: string;
  label: string;
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
  /** When true, named lists in selections skip people already sent on an earlier campaign to that list. */
  excludePreviousListSends?: boolean;
  recipients: CampaignRecipient[];
  selections: CampaignSelection[];
  attachments: CampaignAttachment[];
  timing?: CampaignTiming;
};

export type CampaignRecipientEvent =
  | "all"
  | "queued"
  | "sent"
  | "delivered"
  | "opened"
  | "clicked"
  | "replied"
  | "bounced"
  | "unsubscribed"
  | "not_sent";

export type CampaignRecipientRow = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  leadId: string | null;
  customerId: string | null;
  lists: string[];
  statusKey: string;
  statusLabel: string;
  failureReason: string | null;
  events: Exclude<CampaignRecipientEvent, "all">[];
};

export type CampaignRecipientCounts = Record<Exclude<CampaignRecipientEvent, "all">, number>;

export type CampaignRecipientPage = {
  items: CampaignRecipientRow[];
  total: number;
  page: number;
  limit: number;
  audienceCount: number;
  counts: CampaignRecipientCounts;
};

export type CampaignRecipientMessage = {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  subject: string | null;
  body: string;
  status: string;
  createdAt: string;
  sentAt: string | null;
};

export type CampaignRecipientCall = {
  id: string;
  status: string;
  toNumber: string;
  createdAt: string;
  durationSeconds: number | null;
};

export type CampaignRecipientActivity = {
  id: string;
  type: string;
  description: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  author: { id: string; fullName: string } | null;
};

export type CampaignRecipientDetail = {
  id: string;
  campaignId: string;
  campaignName: string;
  email: string;
  name: string;
  phone: string | null;
  leadId: string | null;
  customerId: string | null;
  lists: string[];
  optedOut: boolean;
  replyToMessageId: string | null;
  suggestedSubject: string;
  address: string | null;
  postcode: string | null;
  tags: Array<{ id: string; name: string; color: string }>;
  messages: CampaignRecipientMessage[];
  calls: CampaignRecipientCall[];
  activities: CampaignRecipientActivity[];
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
