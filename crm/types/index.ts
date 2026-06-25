export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "OPS"
  | "SURVEYOR"
  | "TRADE_OPERATIVE"
  | "QC"
  | "FINANCE"
  | "READ_ONLY";

export type LeadStage =
  | "NEW"
  | "QUOTE_SENT"
  | "FOLLOWING_UP"
  | "AWAITING_PAYMENT"
  | "PAUSED"
  | "CONVERTED"
  | "LOST";

export type LeadSource =
  | "PINLOCAL"
  | "COMPARE_MY_MOVE"
  | "REALLYMOVING"
  | "GET_A_SURVEYOR"
  | "WEBSITE"
  | "WEBSITE_CONTACT_FORM"
  | "PARTY_WALL_TOOL"
  | "DIRECT_PHONE"
  | "DIRECT_EMAIL"
  | "REFERRAL"
  | "OTHER"
  | "DIRECT";

export type SurveyLevel = "LEVEL_1" | "LEVEL_2" | "LEVEL_3" | "CPR_35";

export type CustomerType = "HOMEBUYER" | "LANDLORD" | "LEGAL" | "COUNCIL" | "TRADE";

export type JobType =
  | "RICS_SURVEY"
  | "CPR_35_REPORT"
  | "DAMP_MOULD"
  | "STOCK_CONDITION"
  | "HOUSING_DISREPAIR"
  | "EPC"
  | "ENVIRONMENTAL"
  | "PARTY_WALL"
  | "TRADE_WORK"
  | "OTHER";

export interface ApiUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string | null;
  phoneEnabled?: boolean;
  dialpadUserId?: string | null;
  avatarUrl?: string | null;
  twoFAEnabled?: boolean;
}

export interface AdminUserSummary {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phoneEnabled: boolean;
  dialpadUserId: string | null;
  isActive?: boolean;
  createdAt?: string;
}

export type InternalConversationKind = "DIRECT" | "GROUP" | "BROADCAST" | "RECORD_THREAD";

export interface InternalConversationSummary {
  id: string;
  kind: InternalConversationKind;
  title: string;
  leadId?: string | null;
  jobId?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: { id: string; fullName: string; email: string };
  participants: Array<{
    userId: string;
    lastReadAt: string | null;
    isMuted?: boolean;
    isArchived?: boolean;
    user: { id: string; fullName: string; email: string; role: UserRole; avatarUrl?: string | null };
  }>;
  lastMessage: {
    id: string;
    body: string;
    createdAt: string;
    authorId: string;
  } | null;
  unread: boolean;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: Array<{ id: string; fullName: string }>;
  reactedByMe: boolean;
}

export interface MessageAttachment {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  isImage: boolean;
}

export interface InternalMessageItem {
  id: string;
  body: string;
  createdAt: string;
  editedAt?: string | null;
  deletedAt?: string | null;
  pinnedAt?: string | null;
  isUrgent?: boolean;
  isDeleted?: boolean;
  author: { id: string; fullName: string; email: string; avatarUrl?: string | null };
  parentMessageId?: string | null;
  parentPreview?: { id: string; authorName: string; body: string } | null;
  mentions: Array<{
    kind: "USER" | "ROLE";
    alias?: string | null;
    userId?: string | null;
    role?: UserRole | null;
    user?: { id: string; fullName: string } | null;
  }>;
  reactions: MessageReaction[];
  attachments: MessageAttachment[];
}

export interface ReadReceiptDetail {
  userId: string;
  fullName: string;
  avatarUrl?: string | null;
  readAt: string | null;
  hasRead: boolean;
}

export interface ChatSearchResults {
  conversations: InternalConversationSummary[];
  messages: InternalMessageItem[];
}

export interface MentionSuggestion {
  users: Array<{
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
    mention: string;
  }>;
  groups: Array<{
    alias: string;
    role: string;
    label: string;
  }>;
}

export interface UserNotificationItem {
  id: string;
  type: "MESSAGE" | "MENTION" | "ASSIGNMENT";
  title: string;
  body: string;
  conversationId?: string | null;
  messageId?: string | null;
  leadId?: string | null;
  jobId?: string | null;
  taskId?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface DialpadIntegrationStatus {
  clientIdConfigured: boolean;
  webhookSecretConfigured: boolean;
  ctiUrl: string;
  voiceWebhookUrl: string;
  phoneEnabledUserCount: number;
}

export interface Customer {
  id: string;
  customerType: CustomerType;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string | null;
  address?: string | null;
  postcode?: string | null;
  marketingOptIn: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { leads: number; jobs: number };
}

export interface LeadTag {
  id: string;
  name: string;
  color: string;
}

export interface Lead {
  id: string;
  source: LeadSource;
  sourceRef: string | null;
  stage: LeadStage;
  jobType: JobType;
  surveyLevel: SurveyLevel | null;
  propertyAddress: string;
  propertyPostcode: string;
  propertyValueBand: string | null;
  quotedAmount: number | null;
  quotedAt: string | null;
  cadenceStopped: boolean;
  createdAt: string;
  updatedAt: string;
  convertedToJobId: string | null;
  customerName?: string;
  customer?: Customer;
  assignedTo?: { id: string; fullName: string; email: string } | null;
  stageLabel?: string;
  tags?: LeadTag[];
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  author?: { id: string; fullName: string } | null;
}

export interface Message {
  id: string;
  channel: string;
  direction: string;
  body: string;
  subject?: string | null;
  status: string;
  createdAt: string;
  readAt?: string | null;
  deliveredAt?: string | null;
  sentAt?: string | null;
  toAddress?: string;
  fromAddress?: string;
}

export interface CadenceRunInfo {
  id: string;
  status: string;
  currentStep: number;
  nextRunAt: string | null;
  stoppedReason?: string | null;
}

export interface MessageTemplate {
  id: string;
  name: string;
  channel: string;
  trigger: string;
  subject?: string | null;
  body: string;
  isActive: boolean;
  customerType?: string | null;
  surveyLevel?: string | null;
}

export interface InboxThread {
  threadKey: string;
  customerName: string;
  propertyPostcode?: string | null;
  lastMessage: Message;
  messageCount: number;
  leadId?: string | null;
}

export interface WorkflowSummary {
  id: string;
  name: string;
  description?: string | null;
  trigger: string;
  isActive: boolean;
  deletedAt?: string | null;
  activeVersionId?: string | null;
  activeVersion?: { id: string; versionNumber: number; publishedAt: string; nodes?: unknown; edges?: unknown } | null;
}

export interface WorkflowVersion {
  id: string;
  versionNumber: number;
  changeNote?: string | null;
  publishedAt: string;
  inFlight: number;
  completed: number;
  nodes?: unknown;
  edges?: unknown;
}

export interface WorkflowDetail extends WorkflowSummary {
  draftNodes?: unknown;
  draftEdges?: unknown;
  draftUpdatedAt?: string | null;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  status: string;
  paidAt?: string | null;
}

export interface CadenceStep {
  name: string;
  status: "completed" | "current" | "upcoming";
  detail?: string;
  time?: string;
}

export interface LeadDetail extends Lead {
  activities: Activity[];
  messages: Message[];
  journey: CadenceStep[];
  cadenceRun?: CadenceRunInfo | null;
  job?: Job | null;
}

export interface Job {
  id: string;
  jobNumber: string;
  stage: string;
  jobType: JobType;
  surveyLevel: SurveyLevel | null;
  propertyAddress: string;
  propertyPostcode: string;
  agreedAmount: number;
  depositAmount: number | null;
  paymentStatus: string;
  reportStatus?: string | null;
  inspectionDate?: string | null;
  reportInternalDeadline?: string | null;
  reportClientDeadline?: string | null;
  workStartDate?: string | null;
  workEndDate?: string | null;
  completionSignedAt?: string | null;
  snaggingItems?: SnaggingItem[] | null;
  stripePaymentLinkUrl?: string | null;
  payments?: PaymentRecord[];
  documents?: JobDocument[];
  createdAt: string;
  customer?: Customer;
  assignedTo?: { id: string; fullName: string; email: string } | null;
}

export interface SnaggingItem {
  id: string;
  description: string;
  status: "open" | "resolved";
  photoUrl?: string;
}

export interface JobDocument {
  id: string;
  type: string;
  filename: string;
  storageUrl: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export interface DashboardSales {
  activeLeads: number;
  conversionRate30d: number;
  leadsLast30d: number;
  convertedLast30d: number;
  lostLast30d: number;
  slaBreaches: number;
  jobsAwaitingPayment: number;
  leadsByStage: { stage: string; _count: { id: number } }[];
  avgTimeToPayDays: number;
}

export interface DashboardOps {
  jobsByStage: { stage: string; _count: { id: number } }[];
  inspectionsThisWeek: number;
  reportsInQc: number;
  tradeInProgress: number;
  unassignedJobs: number;
}

export interface DashboardSla {
  atRisk: {
    id: string;
    jobNumber: string;
    customer: string;
    propertyAddress: string;
    assignee: string;
    reportInternalDeadline?: string | null;
    reportClientDeadline?: string | null;
    reportStatus?: string | null;
  }[];
  late: number;
  overdue: number;
  recentEvents: {
    id: string;
    threshold: number;
    slaType: string;
    triggeredAt: string;
    job?: { jobNumber: string; propertyAddress: string };
  }[];
}

export interface DashboardFinance {
  totalRevenue: number;
  outstanding: number;
  paymentCount: number;
  unpaidJobCount: number;
  revenueByType: { jobType: string; total: number }[];
  recentPayments: {
    id: string;
    amount: number;
    paidAt?: string | null;
    jobNumber?: string;
    jobType?: string;
  }[];
}

export interface WebhookEventSummary {
  id: string;
  provider: string;
  externalId: string;
  status: string;
  receivedAt: string;
  processedAt?: string | null;
  error?: string | null;
  retryCount: number;
  ageWarning?: boolean;
  resultJson?: unknown;
}

export type TaskStatus = "OPEN" | "DONE";

export interface TaskLeadSummary {
  id: string;
  propertyAddress: string;
  propertyPostcode: string;
  customerName: string | null;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assigneeId: string | null;
  assignee: { id: string; fullName: string; email: string } | null;
  leadId: string | null;
  lead: TaskLeadSummary | null;
  createdById: string;
  createdBy: { id: string; fullName: string; email: string };
  dueAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  assigneeId?: string | null;
  leadId?: string | null;
  dueAt?: string | null;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string | null;
  assigneeId?: string | null;
  leadId?: string | null;
  dueAt?: string | null;
  status?: TaskStatus;
}

export interface DashboardMyTasks {
  assignedToMe: Task[];
  createdByMe: Task[];
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateLeadPayload {
  source?: LeadSource;
  sourceRef?: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    customerType: CustomerType;
    company?: string;
    address?: string;
    postcode?: string;
  };
  jobType: JobType;
  surveyLevel?: SurveyLevel;
  propertyAddress: string;
  propertyPostcode: string;
  propertyValueBand?: string;
  quotedAmount?: number;
  marketingOptIn: boolean;
  consent: {
    timestamp: string;
    source: string;
    ipAddress?: string;
  };
}
