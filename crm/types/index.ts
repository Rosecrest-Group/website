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

export interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: unknown;
  ipAddress?: string | null;
  createdAt: string;
  actor?: { id: string; fullName: string; email: string } | null;
}

export interface AdminUserSummary {
  id: string;
  email: string;
  fullName: string;
  credentials?: string | null;
  role: UserRole;
  phone?: string | null;
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
  referencedMessageId?: string | null;
  referencedPreview?: {
    id: string;
    subject: string | null;
    body: string;
    channel: string;
    direction: string;
  } | null;
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
  type: "MESSAGE" | "MENTION" | "ASSIGNMENT" | "REMINDER";
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

export interface DialpadConfig {
  enabled: boolean;
  configured: boolean;
  phoneEnabled: boolean;
  clientId: string | null;
  ctiIframeUrl: string | null;
  ctiOrigin: string;
}

export interface DialpadCallInitiateResult {
  activityId: string;
  to: string;
  customData: string;
}

export type DialpadCallStatus = "live" | "missed" | "voicemail" | "answered";
export type DialpadCallDirection = "inbound" | "outbound";

export interface DialpadCall {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  status: DialpadCallStatus;
  direction: DialpadCallDirection;
  from: string | null;
  to: string | null;
  contactNumber: string | null;
  durationSeconds: number | null;
  recordingUrl: string | null;
  transcript: string | null;
  recapSummary: string | null;
  recapActionItems: string[];
  recapPurposes: string[];
  recapDisposition: string | null;
  outcome: string | null;
  leadId: string | null;
  jobId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  propertyPostcode: string | null;
  author: { id: string; fullName: string } | null;
}

export interface DialpadCallSummary {
  todayCount: number;
  todayMissedCount: number;
  todayVoicemailCount: number;
  todayLiveCount: number;
  todayTalkSeconds: number;
  avgDurationSeconds: number | null;
}

export interface DialpadCallsResult {
  items: DialpadCall[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  summary: DialpadCallSummary;
}

export interface SalesIgniterNote {
  id: string;
  body: string;
  userId: string;
  dateAdded: string;
  contactId: string;
  title?: string;
  color?: string;
  pinned?: boolean;
}

export interface SalesIgniterContactSummary {
  id: string;
  locationId?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  source?: string;
  type?: string;
  dateAdded?: string;
  dateUpdated?: string;
  tags?: string[];
}

export interface SalesIgniterContact extends SalesIgniterContactSummary {
  emailLowerCase?: string;
  timezone?: string;
  dnd?: boolean;
  assignedTo?: string;
  address1?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  website?: string;
  dateUpdated?: string;
  dateOfBirth?: string;
  lastActivity?: string;
  customFields?: Array<{ id: string; value: string }>;
}

export interface SalesIgniterConversation {
  id: string;
  contactId?: string;
  locationId?: string;
  type?: string;
  lastMessageBody?: string;
  lastMessageType?: string;
  lastMessageDate?: string;
  fullName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  unreadCount?: number;
  dateAdded?: string;
  dateUpdated?: string;
}

export interface SalesIgniterOpportunity {
  id: string;
  name: string;
  status?: string;
  monetaryValue?: number;
  pipelineId?: string;
  pipelineStageId?: string;
  pipelineStageName?: string;
  effectiveProbability?: number;
  contactId?: string;
  assignedTo?: string;
  source?: string;
  tags?: string[];
  dateAdded?: string;
  dateUpdated?: string;
  contact?: {
    id?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    tags?: string[];
  };
}

export interface SalesIgniterPipelineStage {
  id: string;
  name: string;
  position?: number;
}

export interface SalesIgniterPipeline {
  id: string;
  name: string;
  stages: SalesIgniterPipelineStage[];
  locationId?: string;
}

export interface DumpOpportunitySyncChunkResult {
  done: boolean;
  upToDate?: boolean;
  startAfterId: string | null;
  startAfter: number | null;
  remoteTotal: number;
  checked: number;
  inserted: number;
  updated: number;
  skipped: number;
  dbTotal: number;
  lastSyncedAt?: string;
}

export interface DumpOpportunitySyncResult {
  remoteTotal: number;
  dbTotal: number;
  inserted: number;
  updated: number;
  skipped: number;
  pagesFetched: number;
  lastSyncedAt: string;
}

export interface DumpOpportunitySyncStatus {
  dbTotal: number;
  lastSyncedAt: string | null;
  lastRemoteTotal: number | null;
  lastInserted: number | null;
  lastSkipped: number | null;
}

export interface DumpContactSyncChunkResult {
  done: boolean;
  upToDate?: boolean;
  page: number;
  remoteTotal: number;
  checked: number;
  inserted: number;
  updated: number;
  skipped: number;
  dbTotal: number;
  lastSyncedAt?: string;
}

export interface DumpContactSyncStatus {
  dbTotal: number;
  lastSyncedAt: string | null;
  lastRemoteTotal: number | null;
  lastInserted: number | null;
  lastSkipped: number | null;
}

export interface DumpInboxThreadsSyncChunkResult {
  done: boolean;
  upToDate?: boolean;
  startAfterDate: string | null;
  checked: number;
  inserted: number;
  updated: number;
  skipped: number;
  dbTotal: number;
  lastSyncedAt?: string;
}

export interface DumpInboxMessagesSyncChunkResult {
  done: boolean;
  upToDate?: boolean;
  conversationExternalId: string | null;
  conversationDone: boolean;
  pendingConversations: number;
  checked: number;
  inserted: number;
  skipped: number;
  dbTotal: number;
  lastSyncedAt?: string;
}

export interface DumpInboxSyncStatus {
  threadTotal: number;
  messageTotal: number;
  pendingConversations: number;
  threads: {
    lastSyncedAt: string | null;
    lastRemoteTotal: number | null;
    lastInserted: number | null;
    lastSkipped: number | null;
  };
  messages: {
    lastSyncedAt: string | null;
    lastInserted: number | null;
    lastSkipped: number | null;
  };
}

export interface SalesIgniterMessage {
  id: string;
  conversationId?: string;
  contactId?: string;
  locationId?: string;
  body?: string;
  html?: string;
  type?: string | number;
  messageType?: string;
  direction?: string;
  status?: string;
  dateAdded?: string;
  contentType?: string;
  subject?: string;
  attachments?: string[];
  from?: string;
  to?: string | string[];
  meta?: Record<string, unknown> & {
    email?: {
      email?: { messageIds?: string[] };
      messageIds?: string[];
    };
    callStatus?: string;
    callDuration?: string | number;
    opportunityId?: string;
    opportunity?: { id?: string; opportunityId?: string };
  };
  emailHydrated?: boolean;
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
  latestLead?: { id: string; source: string; stage: string } | null;
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
  /** Exact purchase value in GBP when the source sent one. */
  propertyValue: number | null;
  bedroomBand: string | null;
  quotedAmount: number | null;
  quotedAt: string | null;
  /** First open of the lead pay URL; null until the customer clicks. */
  paymentLinkClickedAt?: string | null;
  cadenceStopped: boolean;
  createdAt: string;
  updatedAt: string;
  convertedToJobId: string | null;
  /** True when a PAID payment row exists for this lead (Stripe or bank transfer). */
  paid?: boolean;
  lostReason?: string | null;
  lostReasonNote?: string | null;
  customerName?: string;
  customer?: Customer;
  assignedTo?: { id: string; fullName: string; email: string } | null;
  stageLabel?: string;
  tags?: LeadTag[];
}

export type PipelineSlice =
  | "all"
  | "waiting_on_us"
  | "clicked_unpaid"
  | "new_untouched"
  | "stale";

export type PipelineBucket =
  | "waiting_on_us"
  | "clicked_unpaid"
  | "new_untouched"
  | "awaiting_cold"
  | "follow_up_stale"
  | "rest";

export interface PipelineCard {
  id: string;
  stage: LeadStage;
  source: LeadSource;
  quotedAmount: number | null;
  propertyAddress: string;
  propertyPostcode: string;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  assignedTo: { id: string; fullName: string; email: string } | null;
  paymentLinkClickedAt: string | null;
  lastInboundAt: string | null;
  lastOutboundAt: string | null;
  lastHumanTouchAt: string | null;
  stageEnteredAt: string | null;
  createdAt: string;
  rotting: boolean;
  bucket: PipelineBucket;
  reason: string;
  score?: number;
  pWin?: number;
  scoreReasons?: string[];
}

export interface PipelineBoardColumn {
  stage: LeadStage;
  count: number;
  quotedAmount: number;
  rottingCount: number;
  hasMore: boolean;
  cards: PipelineCard[];
}

export interface PipelineBoardResponse {
  totals: { count: number; quotedAmount: number; rottingCount: number };
  columns: PipelineBoardColumn[];
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  author?: { id: string; fullName: string } | null;
}

export interface LeadSignal {
  id: string;
  sourceKind: "MESSAGE" | "CALL" | "NOTE";
  sourceId: string;
  intent: string | null;
  objection: string | null;
  competitorMentioned: boolean;
  statedTimeline: string | null;
  exchangeDate: string | null;
  decisionMakerPresent: boolean | null;
  priceSensitivity: string | null;
  sentiment: string | null;
  explicitStop: boolean;
  nextAction: string | null;
  confidence: number | null;
  modelVersion: string;
  createdAt: string;
}

export interface Message {
  id: string;
  channel: string;
  direction: string;
  body: string;
  subject?: string | null;
  status: string;
  failureReason?: string | null;
  createdAt: string;
  readAt?: string | null;
  deliveredAt?: string | null;
  sentAt?: string | null;
  failedAt?: string | null;
  toAddress?: string;
  fromAddress?: string;
  teamConnectPhoneDocId?: string | null;
  teamConnectMessageId?: string | null;
  replyToMessageId?: string | null;
  author?: { id: string; fullName: string } | null;
}

export interface TeamConnectNumber {
  phoneDocId: string;
  label: string;
  voiceNumber: string;
  smsNumber: string | null;
  smsEnabled: boolean;
  status: string;
}

export interface TeamConnectCallResult {
  success: boolean;
  callId: string;
  callSid: string;
  status: string;
  phoneDocId: string;
  from: string;
  to: string;
  agentPhone: string;
  availableMinutesBefore?: number;
  callLogId?: string;
}

export interface TeamConnectSmsSendResult {
  success: boolean;
  messageId: string;
  status: string;
  from: string;
  to: string;
  phoneDocId: string;
  segmentsUsed: number;
}

export interface CadenceRunInfo {
  id: string;
  status: string;
  currentStep: number;
  nextRunAt: string | null;
  stoppedReason?: string | null;
}

export interface NextWorkflowStep {
  executionId: string;
  workflowId: string;
  workflowName: string;
  trigger?: string;
  status: string;
  label: string;
  detail: string | null;
  recipient: string | null;
  scheduledAt: string | null;
  canSkipWait?: boolean;
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
  /** Shared across the team: true until someone opens the thread. */
  unread?: boolean;
  unreadCount?: number;
  /** Shared across the team: pinned threads stay at the top of the inbox. */
  pinned?: boolean;
  customerEmail?: string | null;
  customerPhone?: string | null;
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

export interface LeadThreadPage {
  items: Message[];
  notes: InternalMessageItem[];
  conversationId: string | null;
  activities: Activity[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface LeadDetail extends Lead {
  activities: Activity[];
  messages: Message[];
  journey: CadenceStep[];
  cadenceRun?: CadenceRunInfo | null;
  nextWorkflowStep?: NextWorkflowStep | null;
  job?: Job | null;
  possibleDuplicateLeads?: PossibleDuplicateLead[];
  /** Partner free-text notes (e.g. Pinlocal survey requirements). */
  intakeMessage?: string | null;
  intakeDocuments?: IntakeDocument[];
  signals?: LeadSignal[];
}

export interface IntakeDocument {
  id: string;
  type: string;
  filename: string;
  storageUrl: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export interface Job {
  id: string;
  jobNumber: string;
  stage: string;
  jobType: JobType;
  surveyLevel: SurveyLevel | null;
  propertyAddress: string;
  propertyPostcode: string;
  bedroomBand?: string | null;
  agreedAmount: number;
  depositAmount: number | null;
  paymentStatus: string;
  reportStatus?: string | null;
  agentName?: string | null;
  agentEmail?: string | null;
  agentPhone?: string | null;
  vendorName?: string | null;
  vendorEmail?: string | null;
  vendorPhone?: string | null;
  accessNotes?: string | null;
  accessDetailsPendingReview?: boolean;
  accessDetailsVerifiedAt?: string | null;
  hasConditionRating3?: boolean | null;
  dataCaptureComplete?: boolean;
  qcOttoReviewComplete?: boolean;
  qcRicsPassConfirmed?: boolean;
  qcLevelDeliverableComplete?: boolean;
  surveyorJobReviewed?: boolean;
  surveyorDiaryConfirmed?: boolean;
  surveyorDesktopResearch?: boolean;
  reviewRequestSentAt?: string | null;
  reportDeliveredAt?: string | null;
  surveyorNotifiedAt?: string | null;
  inspectionDate?: string | null;
  inspectionWindow?: string | null;
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
  assignedTo?: { id: string; fullName: string; email: string; credentials?: string | null } | null;
  leadId?: string | null;
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

export type DashboardPeriod =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "this_month"
  | "last_month"
  | "90d"
  | "all_time";

export interface DashboardComparison {
  label: string;
  leads: number;
  converted: number;
  lost: number;
  revenue: number;
  mrr: number;
  arr: number;
  conversionRate: number;
  acquisitionCost: number;
  opportunity: number;
  avgWonValue: number;
  forecast: number;
  quoteRate: number;
  quoteToWinRate: number;
  deltas: {
    leads: number | null;
    converted: number | null;
    lost: number | null;
    revenue: number | null;
    mrr: number | null;
    arr: number | null;
    conversionRate: number | null;
    acquisitionCost: number | null;
    opportunity: number | null;
    avgWonValue: number | null;
    forecast: number | null;
    quoteRate: number | null;
    quoteToWinRate: number | null;
    costPerLead: number | null;
    costPerConversion: number | null;
    roi: number | null;
    lostRate: number | null;
  };
}

export interface ProductMixRow {
  key: string;
  leads: number;
  quoted: number;
  quoteRate: number;
  won: number;
  winRate: number;
  revenue: number;
  avgWonValue: number;
}

export interface DashboardSales {
  period?: DashboardPeriod;
  since?: string;
  activeLeads: number;
  opportunityValue?: number;
  conversionRate30d: number;
  leadsLast30d: number;
  convertedLast30d: number;
  lostLast30d: number;
  lostRate30d?: number;
  slaBreaches: number;
  jobsAwaitingPayment: number;
  leadsByStage: { stage: string; _count: { id: number } }[];
  avgTimeToPayDays: number;
  avgTimeToQuoteDays?: number;
  avgTimeToWinDays?: number;
  lostByReason?: { reason: string; count: number; value?: number }[];
  timeseries?: {
    granularity: "day" | "week";
    points: {
      bucket: string;
      label: string;
      leads: number;
      quoted: number;
      won: number;
      revenue: number;
      lost: number;
    }[];
  };
  funnelSteps?: {
    key: "created" | "quoted" | "clicked" | "won";
    label: string;
    count: number;
    rateFromPrevious: number;
    rateFromStart: number;
    dropOff: number;
  }[];
  quoteFollowThrough?: {
    quotedCount: number;
    clickedCount: number;
    clickRate: number;
    wonFromClicked: number;
    clickToPayRate: number;
    avgDaysQuoteToClick: number;
    avgDaysClickToPay: number;
    clickedUnpaidCount: number;
    clickedUnpaidValue: number;
    quotedUnclickedCount: number;
    quotedUnclickedValue: number;
  };
  productMix?: {
    byJobType: ProductMixRow[];
    bySurveyLevel: ProductMixRow[];
    byBedroomBand: ProductMixRow[];
  };
  jobsByStage?: { stage: string; _count: { id: number } }[];
  funnelBySource?: {
    source: string;
    leads: number;
    converted: number;
    wonRevenue: number;
    acquisitionCost: number;
    quotedPipeline: number;
    conversionRate: number;
    roi: number | null;
  }[];
  speedToLead?: { cohort: string; leads: number; converted: number; conversionRate: number }[];
  recentLeads?: Lead[];
  totalAcquisitionCost30d?: number;
  revenueLast30d?: number;
  mrr?: number;
  arr?: number;
  quotedCount?: number;
  quoteRate?: number;
  quoteToWinRate?: number;
  avgWonValue?: number;
  forecast?: number;
  costPerLead30d?: number;
  costPerConversion30d?: number;
  roi30d?: number | null;
  comparison?: DashboardComparison | null;
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
  hasMore?: boolean;
}

/**
 * duplicate — same person, same property. Blocks manual creation.
 * possible  — phone matched but email differs. Creates a flagged separate lead.
 * related   — same person, different property. A genuine second job.
 */
export type LeadDuplicateConfidence = "duplicate" | "possible" | "related";

export interface LeadDuplicateMatch {
  leadId: string;
  stage: LeadStage;
  source: LeadSource;
  sourceRef: string | null;
  createdAt: string;
  propertyAddress: string;
  propertyPostcode: string;
  matchedBy: "phone" | "email" | "both";
  confidence: LeadDuplicateConfidence;
  sameProperty: boolean;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

export interface PossibleDuplicateLead {
  leadId: string;
  stage: LeadStage;
  source: LeadSource;
  createdAt: string;
  propertyAddress: string;
  propertyPostcode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface CreateLeadResult {
  leadId: string;
  deduped: boolean;
  duplicateMatch?: LeadDuplicateMatch;
  possibleDuplicateOfLeadId?: string;
}

export interface CreateLeadPayload {
  source?: LeadSource;
  sourceRef?: string;
  forceCreate?: boolean;
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
  /** Bedroom band key (e.g. "2_BED") — used to resolve Flexi-Fee when quotedAmount is omitted. */
  bedrooms?: string;
  quotedAmount?: number;
  marketingOptIn: boolean;
  consent: {
    timestamp: string;
    source: string;
    ipAddress?: string;
  };
}
