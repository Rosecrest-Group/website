"use client";



import type {

  ApiUser,

  CreateLeadPayload,
  CreateLeadResult,
  LeadDuplicateMatch,

  Customer,

  DashboardFinance,

  DashboardOps,

  DashboardSla,

  DashboardSales,

  InboxThread,

  Job,

  JobDocument,

  Lead,

  LeadDetail,

  LeadTag,

  Message,

  MessageTemplate,

  Paginated,

  SnaggingItem,

  WebhookEventSummary,

  WorkflowDetail,

  WorkflowSummary,

  WorkflowVersion,

  AdminUserSummary,

  DialpadIntegrationStatus,
  DialpadConfig,
  DialpadCallInitiateResult,

  InternalConversationSummary,

  InternalMessageItem,
  MessageReaction,

  MentionSuggestion,

  UserNotificationItem,
  ChatSearchResults,
  ReadReceiptDetail,

  Task,
  CreateTaskPayload,
  UpdateTaskPayload,
  DashboardMyTasks,
  TeamConnectNumber,
  TeamConnectCallResult,
  TeamConnectSmsSendResult,
  SalesIgniterNote,
  SalesIgniterContact,
  SalesIgniterContactSummary,
  SalesIgniterConversation,
  SalesIgniterMessage,
  SalesIgniterOpportunity,
  SalesIgniterPipeline,
  DumpOpportunitySyncChunkResult,
  DumpOpportunitySyncResult,
  DumpOpportunitySyncStatus,
  DumpContactSyncChunkResult,
  DumpContactSyncStatus,
  DumpInboxThreadsSyncChunkResult,
  DumpInboxMessagesSyncChunkResult,
  DumpInboxSyncStatus,

} from "@/crm/types";

import { clearRememberMe, getRememberMe, setRememberMe } from "./auth";
import { clearCrmSession, markCrmSession } from "./session";



const API_BASE = process.env.NEXT_PUBLIC_CRM_API_URL ?? "/api/v1";



type ApiResult<T> = { ok: true; data: T } | { ok: false; error: { code: string; message: string; details?: unknown } };



async function request<T>(

  path: string,

  options: RequestInit = {},

  retry = true

): Promise<T> {

  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers: Record<string, string> = {

    ...(isFormData ? {} : { "Content-Type": "application/json" }),

    ...(options.headers as Record<string, string>),

  };



  const res = await fetch(`${API_BASE}${path}`, { ...options, headers, credentials: "include" });

  const text = await res.text();
  let json: ApiResult<T>;
  try {
    json = JSON.parse(text) as ApiResult<T>;
  } catch {
    const preview = text.trim().slice(0, 160);
    throw new Error(
      res.ok
        ? "Invalid API response"
        : `Request failed (${res.status})${preview ? `: ${preview}` : ""}`
    );
  }



  if (!json.ok) {

    if (json.error.code === "UNAUTHORIZED" && retry) {

      const refreshed = await refreshSession();

      if (refreshed) return request<T>(path, options, false);

      await clearCrmSession();
      clearRememberMe();

      if (typeof window !== "undefined") window.location.href = "/crm/login";

    }

    const err = new Error(json.error.message) as Error & { code?: string; details?: unknown };
    err.code = json.error.code;
    if (json.error.details !== undefined) err.details = json.error.details;
    throw err;

  }



  return json.data;

}



export async function login(email: string, password: string, rememberMe = true) {

  setRememberMe(rememberMe);

  const res = await fetch(`${API_BASE}/auth/login`, {

    method: "POST",

    headers: { "Content-Type": "application/json" },

    credentials: "include",

    body: JSON.stringify({ email, password, rememberMe }),

  });

  const json = (await res.json()) as ApiResult<{

    user: ApiUser;

    requires2fa?: boolean;

    factorId?: string;

    challengeId?: string;

  }>;

  if (!json.ok) throw new Error(json.error.message);

  if (!json.data.requires2fa) {
    await markCrmSession(rememberMe);
  }

  return json.data;

}



export async function requestForgotPassword(email: string) {

  const res = await fetch(`${API_BASE}/auth/forgot-password`, {

    method: "POST",

    headers: { "Content-Type": "application/json" },

    body: JSON.stringify({ email }),

  });

  const json = (await res.json()) as ApiResult<{ sent: boolean }>;

  if (!json.ok) throw new Error(json.error.message);

  return json.data;

}



export async function resetPassword(accessToken: string, refreshToken: string, password: string) {

  const res = await fetch(`${API_BASE}/auth/reset-password`, {

    method: "POST",

    headers: { "Content-Type": "application/json" },

    body: JSON.stringify({ accessToken, refreshToken, password }),

  });

  const json = (await res.json()) as ApiResult<{ reset: boolean }>;

  if (!json.ok) throw new Error(json.error.message);

  return json.data;

}



export async function refreshSession(): Promise<boolean> {

  try {

    const res = await fetch(`${API_BASE}/auth/refresh`, {

      method: "POST",

      credentials: "include",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({ rememberMe: getRememberMe() }),

    });

    const json = (await res.json()) as ApiResult<{ refreshed: boolean }>;

    if (!json.ok) return false;

    await markCrmSession(getRememberMe());

    return true;

  } catch {

    return false;

  }

}



export async function logout() {
  const { clearCurrentUserCache } = await import("@/crm/lib/currentUserCache");

  try {
    await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" });
  } catch {
    // ignore network errors during logout
  }

  clearCurrentUserCache();
  await clearCrmSession();
  clearRememberMe();

  if (typeof window !== "undefined") window.location.href = "/crm/login";

}



export const api = {

  getMe: () => request<ApiUser>("/auth/me"),

  updateProfile: (payload: { fullName?: string; phone?: string | null }) =>
    request<ApiUser>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  uploadAvatar: (image: string) =>
    request<ApiUser>("/auth/me/avatar", {
      method: "POST",
      body: JSON.stringify({ image }),
    }),

  removeAvatar: () =>
    request<ApiUser>("/auth/me/avatar", {
      method: "DELETE",
    }),

  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    request<{ changed: boolean }>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getDashboard: () => request<DashboardSales>("/dashboards/sales"),

  getDashboardOps: () => request<DashboardOps>("/dashboards/ops"),

  getDashboardSla: () => request<DashboardSla>("/dashboards/sla"),

  getDashboardFinance: (days = 30) => request<DashboardFinance>(`/dashboards/finance?days=${days}`),

  runSlaMonitor: () => request<{ processed: number; checked: number }>("/dashboards/sla/run-monitor", { method: "POST" }),

  downloadExport: async (type: string) => {
    const res = await fetch(`${API_BASE}/dashboards/export/${type}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Export failed");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },

  listWebhookEvents: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params)}` : "";
    return request<Paginated<WebhookEventSummary>>(`/admin/webhook-events${qs}`);
  },

  getWebhookEvent: (id: string) => request<WebhookEventSummary>(`/admin/webhook-events/${id}`),

  replayWebhookEvent: (id: string, mode: "dry-run" | "safe" | "full") =>
    request<unknown>(`/admin/webhook-events/${id}/replay?mode=${mode}`, { method: "POST" }),

  getWebhookValidationSummary: (days = 1) =>
    request<{ since: string; items: { provider: string; count: number }[] }>(
      `/admin/webhook-events/validation-summary?days=${days}`
    ),

  runWebhookArchive: () =>
    request<{ archived: number }>("/admin/webhook-events/archive-run", { method: "POST" }),

  getDialpadIntegrationStatus: () => request<DialpadIntegrationStatus>("/admin/integrations/dialpad"),

  getDialpadConfig: () => request<DialpadConfig>("/dialpad/config"),

  initiateDialpadCall: (payload: { to: string; leadId?: string; jobId?: string }) =>
    request<DialpadCallInitiateResult>("/dialpad/calls/initiate", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  linkDialpadUser: (dialpadUserId: string) =>
    request<ApiUser>("/dialpad/me/link", {
      method: "PATCH",
      body: JSON.stringify({ dialpadUserId }),
    }),

  getDataDumpStatus: () =>
    request<{
      configured: boolean;
      tokenConfigured: boolean;
      locationConfigured: boolean;
      requiredScopes: Array<{ scope: string; usedFor: string; endpoints: readonly string[] }>;
    }>("/data-dump/status"),

  listSalesIgniterContacts: (params?: { query?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.query) qs.set("query", params.query);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    const q = qs.toString();
    return request<{
      contacts: SalesIgniterContactSummary[];
      total: number;
      page: number;
      limit: number;
    }>(`/data-dump/contacts${q ? `?${q}` : ""}`);
  },

  getSalesIgniterContact: (contactId: string) =>
    request<{ contact: SalesIgniterContact }>(
      `/data-dump/contacts/${encodeURIComponent(contactId)}`
    ),

  getSalesIgniterContactNotes: (contactId: string) =>
    request<{ contactId: string; notes: SalesIgniterNote[] }>(
      `/data-dump/contacts/${encodeURIComponent(contactId)}/notes`
    ),

  getSalesIgniterContactMessages: (contactId: string) =>
    request<{
      contactId: string;
      conversations: SalesIgniterConversation[];
      messages: SalesIgniterMessage[];
    }>(`/data-dump/contacts/${encodeURIComponent(contactId)}/messages`),

  listDumpContacts: () =>
    request<{
      contacts: SalesIgniterContactSummary[];
      total: number;
      sync: DumpContactSyncStatus;
    }>("/data-dump/contacts/db"),

  getDumpContactSyncStatus: () =>
    request<DumpContactSyncStatus>("/data-dump/contacts/sync/status"),

  syncDumpContacts: (params?: { page?: number; reset?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.reset) qs.set("reset", "true");
    const q = qs.toString();
    return request<DumpContactSyncChunkResult>(
      `/data-dump/contacts/sync${q ? `?${q}` : ""}`,
      { method: "POST" }
    );
  },

  listSalesIgniterOpportunities: (params?: {
    query?: string;
    limit?: number;
    startAfterId?: string;
    startAfter?: number;
    contactId?: string;
    status?: string;
    all?: boolean;
    mapStages?: boolean;
  }) => {
    const qs = new URLSearchParams();
    if (params?.query) qs.set("query", params.query);
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.startAfterId) qs.set("startAfterId", params.startAfterId);
    if (params?.startAfter != null) qs.set("startAfter", String(params.startAfter));
    if (params?.contactId) qs.set("contactId", params.contactId);
    if (params?.status) qs.set("status", params.status);
    if (params?.all) qs.set("all", "true");
    if (params?.mapStages === false) qs.set("mapStages", "false");
    const q = qs.toString();
    return request<{
      opportunities: SalesIgniterOpportunity[];
      total: number;
      startAfterId?: string | null;
      startAfter?: number | null;
      limit?: number;
      fetchedAll?: boolean;
      pagesFetched?: number;
      pipelines?: SalesIgniterPipeline[];
      stageLookup?: Record<string, { stageName: string; pipelineName: string }>;
    }>(`/data-dump/opportunities${q ? `?${q}` : ""}`);
  },

  getSalesIgniterOpportunity: (opportunityId: string) =>
    request<{ opportunity: SalesIgniterOpportunity }>(
      `/data-dump/opportunities/${encodeURIComponent(opportunityId)}`
    ),

  listDumpOpportunities: () =>
    request<{
      opportunities: SalesIgniterOpportunity[];
      total: number;
      sync: DumpOpportunitySyncStatus;
    }>("/data-dump/opportunities/db"),

  getDumpOpportunitySyncStatus: () =>
    request<DumpOpportunitySyncStatus>("/data-dump/opportunities/sync/status"),

  syncDumpOpportunities: (params?: {
    startAfterId?: string;
    startAfter?: number;
    reset?: boolean;
  }) => {
    const qs = new URLSearchParams();
    if (params?.startAfterId) qs.set("startAfterId", params.startAfterId);
    if (params?.startAfter != null) qs.set("startAfter", String(params.startAfter));
    if (params?.reset) qs.set("reset", "true");
    const q = qs.toString();
    return request<DumpOpportunitySyncChunkResult>(
      `/data-dump/opportunities/sync${q ? `?${q}` : ""}`,
      { method: "POST" }
    );
  },

  listSalesIgniterPipelines: () =>
    request<{
      pipelines: SalesIgniterPipeline[];
      stageLookup: Record<string, { stageName: string; pipelineName: string }>;
    }>("/data-dump/pipelines"),

  listSalesIgniterInboxThreads: (params?: {
    query?: string;
    limit?: number;
    startAfterDate?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.query) qs.set("query", params.query);
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.startAfterDate) qs.set("startAfterDate", params.startAfterDate);
    const q = qs.toString();
    return request<{
      threads: SalesIgniterConversation[];
      limit: number;
    }>(`/data-dump/inbox${q ? `?${q}` : ""}`);
  },

  listDumpInboxThreads: () =>
    request<{
      threads: SalesIgniterConversation[];
      total: number;
      sync: DumpInboxSyncStatus;
    }>("/data-dump/inbox/db"),

  getDumpInboxSyncStatus: () =>
    request<DumpInboxSyncStatus>("/data-dump/inbox/sync/status"),

  syncDumpInboxThreads: (params?: { startAfterDate?: string; reset?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.startAfterDate) qs.set("startAfterDate", params.startAfterDate);
    if (params?.reset) qs.set("reset", "true");
    const q = qs.toString();
    return request<DumpInboxThreadsSyncChunkResult>(
      `/data-dump/inbox/sync/threads${q ? `?${q}` : ""}`,
      { method: "POST" }
    );
  },

  syncDumpInboxMessages: (params?: { reset?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.reset) qs.set("reset", "true");
    const q = qs.toString();
    return request<DumpInboxMessagesSyncChunkResult>(
      `/data-dump/inbox/sync/messages${q ? `?${q}` : ""}`,
      { method: "POST" }
    );
  },

  listDumpConversationMessages: (conversationId: string) =>
    request<{ conversationId: string; messages: SalesIgniterMessage[] }>(
      `/data-dump/inbox/db/${encodeURIComponent(conversationId)}/messages`
    ),

  getSalesIgniterConversationMessages: (conversationId: string) =>
    request<{ conversationId: string; messages: SalesIgniterMessage[] }>(
      `/data-dump/conversations/${encodeURIComponent(conversationId)}/messages`
    ),

  listAdminUsers: (includeInactive = false) =>
    request<{ items: AdminUserSummary[] }>(
      `/admin/users${includeInactive ? "?includeInactive=true" : ""}`
    ),

  inviteTeamUser: (payload: { email: string; fullName: string; role: string }) =>
    request<AdminUserSummary>("/admin/users/invite", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateTeamUser: (
    id: string,
    payload: { role?: string; isActive?: boolean; fullName?: string; credentials?: string | null }
  ) =>
    request<AdminUserSummary>(`/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  updateUserPhone: (
    id: string,
    body: { phoneEnabled?: boolean; dialpadUserId?: string | null }
  ) => request<AdminUserSummary>(`/admin/users/${id}/phone`, { method: "PATCH", body: JSON.stringify(body) }),

  listWorkflowExecutions: (params?: { workflowId?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.workflowId) qs.set("workflowId", params.workflowId);
    if (params?.status) qs.set("status", params.status);
    const q = qs.toString();
    return request<{
      items: Array<{
        id: string;
        status: string;
        currentNodeId: string | null;
        triggeredBy: string;
        context: Record<string, unknown>;
        startedAt: string;
        completedAt: string | null;
        error: string | null;
        isTestRun: boolean;
        migratedToExecutionId: string | null;
        workflowVersion: {
          id: string;
          versionNumber: number;
          workflowId: string;
          nodes: unknown;
        };
      }>;
    }>(`/admin/workflow-executions${q ? `?${q}` : ""}`);
  },

  migrateWorkflowExecution: (
    executionId: string,
    payload: { targetVersionId: string; mapping: Record<string, string>; reason?: string }
  ) =>
    request<unknown>(`/admin/workflow-executions/${executionId}/migrate`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  bulkMigrateWorkflowExecutions: (payload: {
    executionIds: string[];
    targetVersionId: string;
    mapping: Record<string, string>;
    reason: string;
  }) =>
    request<{ migrated: number }>("/admin/workflow-executions/bulk-migrate", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  lookupCustomerByPhone: (phone: string) =>
    request<{
      customers: Array<{
        id: string;
        firstName: string;
        lastName: string;
        leads?: { id: string }[];
        jobs?: { id: string }[];
      }>;
    }>(`/customers/lookup/phone?phone=${encodeURIComponent(phone)}`),



  listLeads: (params?: Record<string, string>) => {

    const qs = params ? `?${new URLSearchParams(params)}` : "";

    return request<Paginated<Lead> & { stageLabels?: Record<string, string> }>(`/leads${qs}`);

  },

  getLead: (id: string) => request<LeadDetail>(`/leads/${id}`),

  checkLeadDuplicates: (params: {
    email: string;
    phone: string;
    propertyAddress?: string;
    propertyPostcode?: string;
  }) =>
    request<{ matches: LeadDuplicateMatch[] }>(
      `/leads/duplicate-check?${new URLSearchParams(
        Object.entries(params).filter(([, value]) => Boolean(value)) as [string, string][]
      )}`
    ),

  createLead: (payload: CreateLeadPayload) =>

    request<CreateLeadResult>("/intake/leads/DIRECT", {

      method: "POST",

      body: JSON.stringify({ ...payload, source: payload.source ?? "DIRECT", sourceRef: payload.sourceRef ?? `manual-${Date.now()}` }),

    }),

  updateLeadStage: (id: string, stage: string) =>

    request<Lead>(`/leads/${id}/stage`, { method: "POST", body: JSON.stringify({ stage }) }),

  markLeadLost: (id: string, lostReason: string, lostReasonNote?: string) =>

    request<Lead>(`/leads/${id}/mark-lost`, { method: "POST", body: JSON.stringify({ lostReason, lostReasonNote }) }),

  convertLead: (id: string, agreedAmount: number) =>

    request<{ lead: Lead; job: Job }>(`/leads/${id}/convert-to-job`, { method: "POST", body: JSON.stringify({ agreedAmount }) }),

  stopCadence: (id: string, reason?: string) =>

    request<Lead>(`/leads/${id}/stop-cadence`, { method: "POST", body: JSON.stringify({ reason }) }),

  pauseCadence: (id: string) => request<{ paused: boolean }>(`/leads/${id}/pause-cadence`, { method: "POST" }),

  resumeCadence: (id: string) => request<{ resumed: boolean }>(`/leads/${id}/resume-cadence`, { method: "POST" }),

  deleteLead: (id: string) => request<{ deleted: boolean; id: string }>(`/leads/${id}`, { method: "DELETE" }),

  listTags: (search?: string) => {
    const qs = search ? `?${new URLSearchParams({ search })}` : "";
    return request<{ items: LeadTag[] }>(`/tags${qs}`);
  },

  addLeadTag: (leadId: string, payload: { tagId?: string; name?: string; color?: string }) =>
    request<Lead>(`/leads/${leadId}/tags`, { method: "POST", body: JSON.stringify(payload) }),

  removeLeadTag: (leadId: string, tagId: string) =>
    request<Lead>(`/leads/${leadId}/tags/${tagId}`, { method: "DELETE" }),



  listCustomers: (params?: Record<string, string>) => {

    const qs = params ? `?${new URLSearchParams(params)}` : "";

    return request<Paginated<Customer>>(`/customers${qs}`);

  },

  getCustomer: (id: string) =>

    request<Customer & { leads: Lead[]; jobs: Job[] }>(`/customers/${id}`),



  listJobs: (params?: Record<string, string>) => {

    const qs = params ? `?${new URLSearchParams(params)}` : "";

    return request<Paginated<Job>>(`/jobs${qs}`);

  },

  getJob: (id: string) => request<Job & { payments?: { id: string; amount: number; status: string; paidAt?: string | null }[] }>(`/jobs/${id}`),

  createPaymentLink: (id: string) => request<{ url: string; id: string }>(`/jobs/${id}/payment-link`, { method: "POST" }),

  markJobPaid: (id: string, amount?: number) =>

    request<Job>(`/jobs/${id}/mark-paid`, { method: "POST", body: JSON.stringify({ amount }) }),

  updateJob: (id: string, payload: Record<string, unknown>) =>
    request<Job>(`/jobs/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),

  updateJobStage: (id: string, stage: string) =>
    request<Job>(`/jobs/${id}/stage`, { method: "POST", body: JSON.stringify({ stage }) }),

  confirmJobAccessDetails: (id: string) =>
    request<Job>(`/jobs/${id}/confirm-access-details`, { method: "POST" }),

  sendJobReviewRequest: (id: string) =>
    request<Job>(`/jobs/${id}/send-review-request`, { method: "POST" }),

  listSurveyors: () =>
    request<{ items: { id: string; fullName: string; email: string }[] }>("/jobs/assignees/surveyors"),

  getTradeSchedule: () => request<{ items: Job[] }>("/jobs/schedule"),

  addJobDocument: (id: string, doc: { type: string; filename: string; storageUrl: string; mimeType?: string; sizeBytes?: number }) =>
    request<JobDocument>(`/jobs/${id}/documents`, { method: "POST", body: JSON.stringify(doc) }),

  uploadJobDocument: (id: string, file: File, type: string) => {
    const form = new FormData();
    form.append("file", file);
    form.append("type", type);
    return request<JobDocument>(`/jobs/${id}/documents/upload`, { method: "POST", body: form });
  },

  updateSnagging: (id: string, items: SnaggingItem[]) =>
    request<Job>(`/jobs/${id}/snagging`, { method: "PATCH", body: JSON.stringify({ items }) }),

  signOffJob: (id: string) => request<Job>(`/jobs/${id}/sign-off`, { method: "POST" }),



  listTemplates: () => request<{ items: MessageTemplate[] }>("/templates"),

  getTemplate: (id: string) => request<MessageTemplate>(`/templates/${id}`),

  previewTemplate: (id: string, ctx?: { leadId?: string; jobId?: string }) =>

    request<{ subject: string | null; body: string }>(`/templates/${id}/preview`, { method: "POST", body: JSON.stringify(ctx ?? {}) }),

  updateTemplate: (id: string, payload: Partial<MessageTemplate>) =>
    request<MessageTemplate>(`/templates/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),

  createTemplate: (payload: {
    name: string;
    channel: "EMAIL" | "SMS" | "WHATSAPP";
    trigger: string;
    subject?: string;
    body: string;
  }) => request<MessageTemplate>("/templates", { method: "POST", body: JSON.stringify(payload) }),

  deleteTemplate: (id: string) =>
    request<{ deleted: true }>(`/templates/${id}`, { method: "DELETE" }),



  listMessages: (params?: Record<string, string>) => {

    const qs = params ? `?${new URLSearchParams(params)}` : "";

    return request<Paginated<Message>>(`/messages${qs}`);

  },

  getInbox: () => request<{ items: InboxThread[] }>("/messages/inbox"),

  sendMessage: (payload: {

    channel: "EMAIL" | "SMS" | "WHATSAPP";

    leadId?: string;

    jobId?: string;

    templateId?: string;

    subject?: string;

    body?: string;

    htmlBody?: string;

    mediaUrls?: string[];

    isTransactional?: boolean;

    teamConnectPhoneDocId?: string;

  }) => request<Message>("/messages/send", { method: "POST", body: JSON.stringify(payload) }),

  listTeamConnectNumbers: () =>
    request<{
      enabled: boolean;
      numbers: TeamConnectNumber[];
      defaultPhoneDocId: string | null;
    }>("/teamconnect/numbers"),

  placeTeamConnectCall: (payload: {
    phoneDocId: string;
    to: string;
    agentPhone?: string;
    leadId?: string;
    jobId?: string;
  }) =>
    request<TeamConnectCallResult>("/teamconnect/calls", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  sendTeamConnectSms: (payload: {
    phoneDocId: string;
    to: string;
    message: string;
    leadId?: string;
    jobId?: string;
  }) =>
    request<TeamConnectSmsSendResult>("/teamconnect/sms", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  syncLeadSmsFromTeamConnect: (leadId: string) =>
    request<{ synced: number; deduped: number; total?: number; skipped?: boolean }>(
      `/teamconnect/sms/sync/${leadId}`,
      { method: "POST" }
    ),

  uploadMessageMedia: async (file: File) => {
    const { fileToDataUrl } = await import("@/crm/lib/messageMediaAttachments");
    const image = await fileToDataUrl(file);
    return request<{ url: string; filename: string; mimeType: string }>("/messages/media/upload", {
      method: "POST",
      body: JSON.stringify({ image, filename: file.name }),
    });
  },



  listWorkflows: (showDeleted = false) =>

    request<{ items: WorkflowSummary[] }>(`/workflows${showDeleted ? "?showDeleted=true" : ""}`),

  createWorkflow: (body: { name: string; description?: string; trigger: string }) =>

    request<WorkflowSummary>("/workflows", { method: "POST", body: JSON.stringify(body) }),

  getWorkflow: (id: string) => request<WorkflowDetail>(`/workflows/${id}`),

  saveWorkflowDraft: (id: string, draft: { nodes: unknown; edges: unknown }) =>

    request<{ workflow: WorkflowDetail; warnings: unknown[] }>(`/workflows/${id}/draft`, { method: "PUT", body: JSON.stringify(draft) }),

  publishWorkflow: (id: string, changeNote?: string) =>

    request<unknown>(`/workflows/${id}/publish`, { method: "POST", body: JSON.stringify({ changeNote }) }),

  unpublishWorkflow: (id: string) =>
    request<WorkflowDetail>(`/workflows/${id}/unpublish`, { method: "POST", body: JSON.stringify({}) }),

  activateWorkflow: (id: string) =>
    request<WorkflowDetail>(`/workflows/${id}/activate`, { method: "POST", body: JSON.stringify({}) }),

  listWorkflowVersions: (id: string) => request<{ items: WorkflowVersion[] }>(`/workflows/${id}/versions`),

  restoreWorkflowVersion: (id: string, versionId: string) =>

    request<WorkflowDetail>(`/workflows/${id}/versions/${versionId}/restore`, { method: "POST" }),

  activateWorkflowVersion: (id: string, versionId: string) =>

    request<WorkflowDetail>(`/workflows/${id}/versions/${versionId}/activate`, { method: "POST" }),

  testRunWorkflow: (
    id: string,
    ctx: { leadId?: string; jobId?: string; sendLiveMessages?: boolean }
  ) =>
    request<unknown>(`/workflows/${id}/test-run`, { method: "POST", body: JSON.stringify(ctx) }),

  deleteWorkflow: (id: string) => request<WorkflowSummary>(`/workflows/${id}`, { method: "DELETE" }),

  restoreWorkflow: (id: string) =>
    request<WorkflowSummary>(`/workflows/${id}/restore`, { method: "POST" }),

  purgeWorkflow: (id: string) =>
    request<{ purged: true }>(`/workflows/${id}/purge`, { method: "POST" }),

  listConversations: (params?: { leadId?: string; jobId?: string; kind?: string }) => {
    const qs = params ? `?${new URLSearchParams(params)}` : "";
    return request<{ items: InternalConversationSummary[] }>(`/conversations${qs}`);
  },

  getTeamChatUnreadCount: () => request<{ unreadCount: number }>("/conversations/unread-count"),

  createConversation: (payload: {
    kind: "DIRECT" | "GROUP" | "BROADCAST" | "RECORD_THREAD";
    participantIds?: string[];
    title?: string;
    leadId?: string;
    jobId?: string;
  }) =>
    request<InternalConversationSummary>("/conversations", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getConversation: (id: string) => request<InternalConversationSummary>(`/conversations/${id}`),

  listConversationMessages: (
    id: string,
    pageOrOptions: number | { page?: number; latest?: boolean } = 1
  ) => {
    const params = new URLSearchParams({ limit: "100" });
    if (typeof pageOrOptions === "number") {
      params.set("page", String(pageOrOptions));
    } else {
      if (pageOrOptions.latest) params.set("latest", "true");
      else params.set("page", String(pageOrOptions.page ?? 1));
    }
    return request<
      Paginated<InternalMessageItem> & { lastPage?: number; hasOlder?: boolean }
    >(`/conversations/${id}/messages?${params}`);
  },

  getConversationMessage: (conversationId: string, messageId: string) =>
    request<InternalMessageItem>(`/conversations/${conversationId}/messages/${messageId}`),

  initConversationAttachment: (
    conversationId: string,
    payload: { filename: string; mimeType: string; sizeBytes: number }
  ) =>
    request<{ id: string; signedUrl: string; token: string; storagePath: string }>(
      `/conversations/${conversationId}/attachments/init`,
      { method: "POST", body: JSON.stringify(payload) }
    ),

  uploadConversationAttachment: async (conversationId: string, file: File) => {
    const init = await api.initConversationAttachment(conversationId, {
      filename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    });

    const uploadRes = await fetch(init.signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
        "x-upsert": "true",
      },
      body: file,
    });

    if (!uploadRes.ok) {
      throw new Error("ATTACHMENT_UPLOAD_FAILED");
    }

    return init.id;
  },

  sendConversationMessage: (
    id: string,
    payload: {
      body?: string;
      attachmentIds?: string[];
      parentMessageId?: string;
      isUrgent?: boolean;
    }
  ) =>
    request<InternalMessageItem>(`/conversations/${id}/messages`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  editConversationMessage: (conversationId: string, messageId: string, body: string) =>
    request<InternalMessageItem>(`/conversations/${conversationId}/messages/${messageId}`, {
      method: "PATCH",
      body: JSON.stringify({ body }),
    }),

  deleteConversationMessage: (conversationId: string, messageId: string) =>
    request<{ deleted: boolean }>(`/conversations/${conversationId}/messages/${messageId}`, {
      method: "DELETE",
    }),

  pinConversationMessage: (conversationId: string, messageId: string) =>
    request<{ pinned: boolean }>(
      `/conversations/${conversationId}/messages/${messageId}/pin`,
      { method: "POST" }
    ),

  unpinConversationMessage: (conversationId: string, messageId: string) =>
    request<{ pinned: boolean }>(
      `/conversations/${conversationId}/messages/${messageId}/pin`,
      { method: "DELETE" }
    ),

  getPinnedMessages: (conversationId: string) =>
    request<{ items: InternalMessageItem[] }>(`/conversations/${conversationId}/pinned`),

  getMessageReadReceipts: (conversationId: string, messageId: string) =>
    request<{ receipts: ReadReceiptDetail[] }>(
      `/conversations/${conversationId}/read-receipts/${messageId}`
    ),

  createTaskFromMessage: (
    conversationId: string,
    messageId: string,
    payload?: { title?: string; assigneeId?: string }
  ) =>
    request<{ activityId: string; title: string }>(
      `/conversations/${conversationId}/messages/${messageId}/create-task`,
      { method: "POST", body: JSON.stringify(payload ?? {}) }
    ),

  searchConversations: (q: string) =>
    request<ChatSearchResults>(`/conversations/search?q=${encodeURIComponent(q)}`),

  getOnlineUsers: () => request<{ userIds: string[] }>("/conversations/online"),

  updateConversation: (id: string, payload: { title?: string }) =>
    request<InternalConversationSummary>(`/conversations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  addConversationParticipants: (id: string, userIds: string[]) =>
    request<{ added: number }>(`/conversations/${id}/participants`, {
      method: "POST",
      body: JSON.stringify({ userIds }),
    }),

  removeConversationParticipant: (id: string, userId: string) =>
    request<{ removed: boolean }>(`/conversations/${id}/participants/${userId}`, {
      method: "DELETE",
    }),

  setConversationMuted: (id: string, muted: boolean) =>
    request<{ muted: boolean }>(`/conversations/${id}/mute`, {
      method: "POST",
      body: JSON.stringify({ muted }),
    }),

  setConversationArchived: (id: string, archived: boolean) =>
    request<{ archived: boolean }>(`/conversations/${id}/archive`, {
      method: "POST",
      body: JSON.stringify({ archived }),
    }),

  sendTypingIndicator: (id: string, isTyping: boolean) =>
    request<{ ok: boolean }>(`/conversations/${id}/typing`, {
      method: "POST",
      body: JSON.stringify({ isTyping }),
    }),

  getCollaborationEventsUrl: () => `${API_BASE}/conversations/events`,

  markConversationRead: (id: string) =>
    request<{ readAt: string }>(`/conversations/${id}/read`, { method: "POST" }),

  toggleMessageReaction: (conversationId: string, messageId: string, emoji: string) =>
    request<{ reactions: MessageReaction[] }>(
      `/conversations/${conversationId}/messages/${messageId}/reactions`,
      { method: "POST", body: JSON.stringify({ emoji }) }
    ),

  getMentionSuggestions: (q?: string) => {
    const qs = q ? `?q=${encodeURIComponent(q)}` : "";
    return request<MentionSuggestion>(`/conversations/mention-suggestions${qs}`);
  },

  listNotifications: (unreadOnly = false) =>
    request<{ items: UserNotificationItem[]; unreadCount: number }>(
      `/notifications${unreadOnly ? "?unreadOnly=true" : ""}`
    ),

  getUnreadNotificationCount: () => request<{ unreadCount: number }>("/notifications/unread-count"),

  markNotificationRead: (id: string) =>
    request<{ id: string; isRead: boolean }>(`/notifications/${id}/read`, { method: "POST" }),

  markAllNotificationsRead: () =>
    request<{ updated: number }>("/notifications/read-all", { method: "POST" }),

  getVapidPublicKey: () => request<{ publicKey: string | null }>("/notifications/vapid-public-key"),

  registerPushSubscription: (payload: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
    userAgent?: string;
  }) =>
    request<{ id: string }>("/notifications/push-subscriptions", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  removePushSubscription: (endpoint: string) =>
    request<{ removed: boolean }>("/notifications/push-subscriptions", {
      method: "DELETE",
      body: JSON.stringify({ endpoint }),
    }),

  listTasks: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params)}` : "";
    return request<Paginated<Task>>(`/tasks${qs}`);
  },

  getMyTasks: () => request<DashboardMyTasks>("/tasks/mine"),

  getTask: (id: string) => request<Task>(`/tasks/${id}`),

  createTask: (payload: CreateTaskPayload) =>
    request<Task>("/tasks", { method: "POST", body: JSON.stringify(payload) }),

  updateTask: (id: string, payload: UpdateTaskPayload) =>
    request<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),

  completeTask: (id: string) =>
    request<Task>(`/tasks/${id}/complete`, { method: "POST" }),

  deleteTask: (id: string) =>
    request<{ deleted: boolean }>(`/tasks/${id}`, { method: "DELETE" }),

  listPartners: () =>
    request<{
      items: Array<{
        id: string;
        name: string;
        slug: string;
        isActive: boolean;
        description: string | null;
        contactEmail: string | null;
        createdAt: string;
        lastUsedAt: string | null;
        leadCount: number;
      }>;
    }>("/partners"),

  createPartner: (payload: { name: string; description?: string; contactEmail?: string }) =>
    request<{
      id: string;
      name: string;
      slug: string;
      apiKey: string;
      isActive: boolean;
      description: string | null;
      contactEmail: string | null;
      createdAt: string;
    }>("/partners", { method: "POST", body: JSON.stringify(payload) }),

  getPartner: (id: string) =>
    request<{
      id: string;
      name: string;
      slug: string;
      apiKey: string;
      isActive: boolean;
      description: string | null;
      contactEmail: string | null;
      createdAt: string;
      lastUsedAt: string | null;
      leadCount: number;
    }>(`/partners/${id}`),

  updatePartner: (
    id: string,
    payload: { name?: string; description?: string; contactEmail?: string; isActive?: boolean }
  ) =>
    request<{
      id: string;
      name: string;
      slug: string;
      isActive: boolean;
      description: string | null;
      contactEmail: string | null;
      createdAt: string;
      lastUsedAt: string | null;
      leadCount: number;
    }>(`/partners/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),

  regeneratePartnerKey: (id: string) =>
    request<{ id: string; name: string; apiKey: string }>(`/partners/${id}/regenerate-key`, {
      method: "POST",
    }),

  deletePartner: (id: string) =>
    request<{ deleted: boolean }>(`/partners/${id}`, { method: "DELETE" }),

  getThirdPartyDocs: () =>
    request<{
      endpoint: string;
      authentication: { type: string; header: string; description: string };
      contentType: string;
      requiredFields: Record<string, string>;
      optionalFields: Record<string, string>;
      responses: Record<string, { description: string; body: unknown }>;
      example: { request: { headers: Record<string, string>; body: unknown } };
    }>("/intake/docs/third-party"),

};

