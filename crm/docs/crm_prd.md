# Rosecrest Operations Platform — Engineering PRD

**Audience:** AI engineering agent + human reviewers
**Goal:** A single source of truth complete enough to build the platform end-to-end without further clarification.
**Build approach:** Phase-by-phase, each phase independently testable.

---

## 0. How to read this PRD (agent instructions)

You are building a custom operations platform for Rosecrest Group Ltd, a UK property surveying and trades firm. Read this entire document before writing any code. Then build in the phase order specified in Section 16. Do not skip phases. Do not improvise architecture — every choice has been deliberated.

**Rules of engagement:**
- TypeScript everywhere. Strict mode on.
- No `any` types. Use `unknown` and narrow.
- Every API endpoint has an input validator (Zod) and a typed response.
- Every database write is wrapped in a transaction if it touches more than one table.
- Every external API call has retry logic with exponential backoff.
- Every scheduled job is idempotent (running it twice has no side effect).
- Every email/SMS/WhatsApp send is logged before and after.
- Tests are not optional. Each phase ships with passing tests.
- Commit per logical unit. Never one giant commit.

**Webhook-first architecture (load-bearing principle):**
- **Every input to the platform is a JSON HTTP request.** Lead sources, payments, message delivery events, voice events, and the internal admin UI all enter through API/webhook endpoints. There are no other ingestion paths.
- **Manual lead entry from the UI is a webhook.** When ops staff add a lead via the admin form, the frontend POSTs to the same intake endpoint as Pinlocal does, with `source: 'DIRECT'`. There is no parallel "manual" code path.
- **Every inbound webhook has four guarantees: signature verification, raw payload storage, idempotency check, normalized output.** See Section 6.5 for the full contract.
- **Sources are configuration, not code.** Adding a new lead source (e.g. a new aggregator) means writing a `SourceAdapter` config that maps incoming JSON to internal Lead fields — not writing a new endpoint.
- **The CRM frontend never touches the database.** All CRM domain data flows through the Express API only. See Section 3.1.

**When in doubt:**
1. Re-read the relevant section of this PRD.
2. If still ambiguous, choose the option that is simpler and easier to change later.
3. Document the decision in a `DECISIONS.md` file at the repo root.

---

## 1. Product summary

A lead-to-delivery operations platform that runs the entire lifecycle of every Rosecrest job — from inbound lead through to delivered report or completed trade work — across four customer types (homebuyer, landlord, legal, council) and across surveying and trade services.

**Replaces:** Sales Igniter (current CRM) + manual operational tracking.

**Does not replace:** Dialpad (voice), Stripe (payments), Twilio (messaging carrier), Resend (email carrier). The platform orchestrates these; it does not reinvent them.

**Single sentence:** _Stop losing customers between enquiry and delivery by automating the chasing, booking, tracking, and SLA management in one purpose-built system._

---

## 2. Users and roles

| Role | Description | Access |
|---|---|---|
| **SuperAdmin** | Platform owner (Rosecrest founder/director) | Everything, including system settings, user management, billing |
| **Admin** | Senior management | Everything except billing and user role changes |
| **Ops** | Operations staff handling lead chase, booking, customer comms | All leads + jobs, can edit pipeline stages, can send messages |
| **Surveyor** | Field staff conducting inspections | Only jobs assigned to them, plus today's schedule |
| **Trade Operative** | Trade staff (in-house or subcontractor) | Only trade jobs assigned to them |
| **QC** | Quality control reviewer | Reports in QC stage, can approve/reject/request revisions |
| **Finance** | Accounting / bookkeeping | Read access to all jobs + financial data, export rights |
| **ReadOnly** | Stakeholders, accountants, advisors | Read access, no edit |

**Authentication:** Email + password with 2FA optional (mandatory for Admin/SuperAdmin). Password reset via email. Session via httpOnly cookie + JWT refresh.

**No customer-facing logins in v1.** Customers receive communications via email/SMS/WhatsApp only. No portal.

---

## 3. Tech stack (locked)

| Layer | Tech |
|---|---|
| **Language** | TypeScript 5.x, strict mode |
| **Frontend** | Next.js 14 (App Router), React 18, Tailwind CSS, shadcn/ui components |
| **Frontend hosting** | Netlify (existing client hosting) |
| **Backend API** | Node.js + Express 4.x with TypeScript |
| **Backend hosting** | Railway (autoscale) |
| **Database** | PostgreSQL via Supabase (EU region) |
| **Database access** | Prisma ORM |
| **Auth** | Supabase Auth (email/password + 2FA via TOTP) |
| **File storage** | Supabase Storage |
| **Scheduling / cron** | QStash (Upstash) for delayed HTTP callbacks |
| **In-process queues** | BullMQ + Upstash Redis (only if QStash proves insufficient for cadence — see Section 9) |
| **Email** | Resend |
| **SMS** | Twilio |
| **WhatsApp** | Twilio WhatsApp Business API |
| **Payments** | Stripe (Payment Links + Webhooks) |
| **Voice** | Dialpad (read-only integration — log calls into platform) |
| **Visual workflow builder** | React Flow (`@xyflow/react`) for canvas; custom execution engine |
| **Validation** | Zod everywhere |
| **Testing** | Vitest (unit), Playwright (E2E), Supertest (API) |
| **Logging** | Pino |
| **Error tracking** | Sentry |
| **Monitoring** | Better Stack (Logtail + Uptime) |

**Do not substitute any of these without explicit approval.**

### 3.1 Data access boundary (separation of concerns)

**The CRM frontend must never talk to the database.** Only the Express API may read or write PostgreSQL (via Prisma). This is non-negotiable.

| Layer | May access PostgreSQL / Prisma? | How it gets CRM data |
|---|---|---|
| **CRM frontend** (`app/crm/`, `crm/`) | **No** | HTTP only — `fetch` to `/api/v1/*` with Bearer JWT |
| **Express API** (`api/`) | **Yes** (sole owner) | Prisma → Supabase Postgres |
| **Marketing site** (public Next.js pages) | **No** | Sanity CMS only; not CRM domain data |

**Frontend rules (enforce in code review):**

- No `DATABASE_URL`, `DIRECT_URL`, or `@prisma/client` in the Next.js app or `crm/` package.
- No Supabase JS client queries against Postgres tables (`from('Lead')`, RLS reads of domain tables, etc.) from the browser.
- No Next.js Route Handlers or Server Actions that import Prisma for CRM entities — CRM mutations and reads go through the API.
- All list/detail/create/update flows use the typed API client (`crm/lib/api.ts` → `NEXT_PUBLIC_CRM_API_URL`).
- Manual lead entry POSTs to `POST /api/v1/intake/leads/DIRECT` on the API, not to a Next.js `/api` route.

**API rules:**

- Prisma lives only under `api/` (or `packages/db` consumed exclusively by `api/` and `worker/` in the monorepo layout).
- Supabase Auth credentials (`SUPABASE_URL`, service role, JWT secret) are **server-side only** — configured in `api/.env`, never exposed for direct DB access from the client.
- Login: frontend calls `POST /api/v1/auth/login`; API validates with Supabase Auth and returns a JWT the frontend stores; subsequent requests use `Authorization: Bearer <token>`.

**Allowed frontend exceptions (not Postgres):**

- **Route protection:** `proxy.ts` / middleware may read an auth cookie to redirect unauthenticated users — no domain data.
- **File uploads (future):** Browser may upload to Supabase Storage only via **short-lived signed URLs issued by the API**, never by writing metadata rows directly from the client.

**Current repo layout (this project):**

```
rosecrest/                 # Next.js — marketing + CRM UI at /crm
├── app/crm/               # CRM routes (UI only)
├── crm/                   # CRM components, api client, types (no Prisma)
└── api/                   # Express + Prisma — only layer that touches Postgres
```

Violating this boundary (e.g. adding Prisma to the Next.js app “for speed”) is an architecture regression and must be rejected.

---

## 4. Repository structure

Monorepo using **pnpm workspaces** + **Turborepo**.

```
rosecrest-platform/
├── apps/
│   ├── web/                    # Next.js frontend
│   ├── api/                    # Express backend
│   └── worker/                 # Background job processor (cadence, webhooks)
├── packages/
│   ├── db/                     # Prisma schema + client
│   ├── types/                  # Shared TypeScript types
│   ├── validation/             # Shared Zod schemas
│   ├── integrations/           # Stripe, Twilio, Resend, Dialpad, QStash clients
│   └── ui/                     # Shared React components
├── docs/
│   ├── PRD.md                  # This document
│   ├── DECISIONS.md            # Architecture decisions log
│   └── RUNBOOK.md              # Ops runbook for production issues
├── .github/workflows/          # CI/CD
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## 5. Data model (Prisma schema)

This is the canonical schema. Every other section references these models.

```prisma
// === People & Access ===

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  fullName    String
  role        UserRole
  phone       String?
  isActive    Boolean  @default(true)
  twoFAEnabled Boolean @default(false)

  // Dialpad integration
  phoneEnabled    Boolean @default(false)  // true if Dialpad iframe should load for this user
  dialpadUserId   String? @unique          // Dialpad's internal user ID for SDK event matching

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  assignedLeads     Lead[]   @relation("LeadOwner")
  assignedJobs      Job[]    @relation("JobAssignee")
  authoredActivities Activity[]
}

enum UserRole {
  SUPER_ADMIN
  ADMIN
  OPS
  SURVEYOR
  TRADE_OPERATIVE
  QC
  FINANCE
  READ_ONLY
}

// === Customer & Lead ===

model Customer {
  id            String       @id @default(cuid())
  customerType  CustomerType
  firstName     String
  lastName      String
  email         String
  phone         String
  company       String?
  address       String?
  postcode      String?
  marketingOptIn Boolean     @default(false)
  optInDate     DateTime?
  optOutDate    DateTime?
  notes         String?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  leads Lead[]
  jobs  Job[]

  @@index([email])
  @@index([phone])
}

enum CustomerType {
  HOMEBUYER
  LANDLORD
  LEGAL
  COUNCIL
  TRADE
}

model Lead {
  id             String      @id @default(cuid())
  source         LeadSource
  sourceRef      String?     // External ID from Pinlocal etc.
  customerId     String
  customer       Customer    @relation(fields: [customerId], references: [id])
  assignedToId   String?
  assignedTo     User?       @relation("LeadOwner", fields: [assignedToId], references: [id])
  stage          LeadStage
  jobType        JobType
  surveyLevel    SurveyLevel?
  propertyAddress String
  propertyPostcode String
  propertyValueBand String?
  quotedAmount   Decimal?    @db.Decimal(10,2)
  quotedAt       DateTime?
  lostReason     LostReason?
  lostReasonNote String?
  cadenceState   Json?       // Persisted cadence runtime state
  cadenceStopped Boolean     @default(false)
  cadenceStoppedReason String?
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  convertedToJobId String?   @unique

  activities Activity[]
  messages   Message[]
  job        Job?        @relation(fields: [convertedToJobId], references: [id])

  @@index([stage])
  @@index([source])
  @@index([createdAt])
}

enum LeadSource {
  PINLOCAL
  COMPARE_MY_MOVE
  REALLYMOVING
  GET_A_SURVEYOR
  WEBSITE
  PARTY_WALL_TOOL
  DIRECT_PHONE
  DIRECT_EMAIL
  REFERRAL
  OTHER
}

enum LeadStage {
  NEW
  QUOTE_SENT
  FOLLOWING_UP
  AWAITING_PAYMENT
  PAUSED
  CONVERTED
  LOST
}

enum LostReason {
  TOO_EXPENSIVE
  CHOSE_COMPETITOR
  TIMING_WRONG
  PROPERTY_FELL_THROUGH
  NO_LONGER_NEEDED
  UNRESPONSIVE
  DND_REQUESTED
  DUPLICATE
  WRONG_NUMBER
  OUT_OF_AREA
  OTHER
}

// === Job (the unit of fulfilment) ===

model Job {
  id            String     @id @default(cuid())
  jobNumber     String     @unique  // Human-readable e.g. RSC-2026-00123
  customerId    String
  customer      Customer   @relation(fields: [customerId], references: [id])
  assignedToId  String?
  assignedTo    User?      @relation("JobAssignee", fields: [assignedToId], references: [id])
  jobType       JobType
  surveyLevel   SurveyLevel?
  stage         JobStage
  propertyAddress String
  propertyPostcode String

  // Pricing
  agreedAmount  Decimal    @db.Decimal(10,2)
  depositAmount Decimal?   @db.Decimal(10,2)
  paymentStatus PaymentStatus

  // Access
  vendorName       String?
  vendorEmail      String?
  vendorPhone      String?
  agentName        String?
  agentEmail       String?
  agentPhone       String?
  accessNotes      String?
  occupancyStatus  String?
  keyCollection    String?

  // Inspection
  inspectionDate    DateTime?
  inspectionWindow  String?
  inspectionNotes   String?
  isExpressTurnaround Boolean @default(false)
  isSubcontractor   Boolean   @default(false)

  // Report (for survey jobs)
  reportStatus      ReportStatus?
  reportInternalDeadline DateTime?
  reportClientDeadline   DateTime?
  reportDraftUrl    String?
  reportFinalUrl    String?
  reportDeliveredAt DateTime?

  // Trade work fields (nullable for surveys)
  workStartDate     DateTime?
  workEndDate       DateTime?
  completionSignedAt DateTime?
  snaggingItems     Json?

  // Lead origin
  leadId        String?    @unique
  lead          Lead?      @relation

  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  activities Activity[]
  payments   Payment[]
  messages   Message[]
  documents  Document[]
  slaEvents  SlaEvent[]

  @@index([stage])
  @@index([jobType])
  @@index([inspectionDate])
  @@index([reportClientDeadline])
}

enum JobType {
  RICS_SURVEY
  CPR_35_REPORT
  DAMP_MOULD
  STOCK_CONDITION
  HOUSING_DISREPAIR
  EPC
  ENVIRONMENTAL
  PARTY_WALL
  TRADE_WORK
  OTHER
}

enum SurveyLevel {
  LEVEL_1
  LEVEL_2
  LEVEL_3
  CPR_35
}

enum JobStage {
  PENDING_PAYMENT
  PAID
  ACCESS_REQUESTED
  ACCESS_CONFIRMED
  INSPECTION_BOOKED
  INSPECTION_COMPLETE
  REPORT_DRAFTING
  REPORT_QC
  REPORT_DELIVERED
  WORK_SCHEDULED         // trade
  WORK_IN_PROGRESS       // trade
  WORK_COMPLETE          // trade
  SNAGGING               // trade
  COMPLETED
  CANCELLED
}

enum PaymentStatus {
  UNPAID
  PARTIAL
  PAID
  REFUNDED
  INVOICE_ISSUED
  INVOICE_OVERDUE
}

enum ReportStatus {
  NOT_STARTED
  DRAFTING
  IN_QC
  REVISIONS_REQUESTED
  APPROVED
  DELIVERED
  LATE
  OVERDUE
}

// === Messaging ===

model Message {
  id            String        @id @default(cuid())
  channel       MessageChannel
  direction     MessageDirection
  leadId        String?
  lead          Lead?         @relation(fields: [leadId], references: [id])
  jobId         String?
  job           Job?          @relation(fields: [jobId], references: [id])
  toAddress     String        // email or phone
  fromAddress   String
  subject       String?       // email only
  body          String
  templateId    String?
  template      MessageTemplate? @relation(fields: [templateId], references: [id])
  providerMessageId String?   // Resend ID, Twilio SID, etc.
  status        MessageStatus
  sentAt        DateTime?
  deliveredAt   DateTime?
  failedAt      DateTime?
  failureReason String?
  createdAt     DateTime      @default(now())

  @@index([leadId])
  @@index([jobId])
  @@index([status])
}

enum MessageChannel {
  EMAIL
  SMS
  WHATSAPP
}

enum MessageDirection {
  OUTBOUND
  INBOUND
}

enum MessageStatus {
  QUEUED
  SENT
  DELIVERED
  FAILED
  BOUNCED
  OPT_OUT
}

model MessageTemplate {
  id          String         @id @default(cuid())
  name        String         @unique
  channel     MessageChannel
  customerType CustomerType?
  surveyLevel SurveyLevel?
  trigger     String         // e.g. "lead.created", "lead.followup.48hr"
  subject     String?        // email
  body        String         // supports {{merge_fields}}
  whatsappTemplateName String? // Meta-approved template name
  isActive    Boolean        @default(true)
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  messages    Message[]
}

// === Payments ===

model Payment {
  id            String   @id @default(cuid())
  jobId         String
  job           Job      @relation(fields: [jobId], references: [id])
  amount        Decimal  @db.Decimal(10,2)
  currency      String   @default("GBP")
  stripePaymentIntentId String? @unique
  stripeChargeId String? @unique
  status        String
  paidAt        DateTime?
  failedAt      DateTime?
  refundedAt    DateTime?
  rawWebhook    Json?
  createdAt     DateTime @default(now())
}

// === Workflow / Pipeline Builder ===
// Workflows are versioned. See Section 10.8 for the full version-pinning contract.

model Workflow {
  id              String   @id @default(cuid())
  name            String
  description     String?
  trigger         String   // e.g. "lead.created", "job.payment_received"
  isActive        Boolean  @default(true)
  activeVersionId String?  // pointer to the version new executions use
  activeVersion   WorkflowVersion? @relation("ActiveVersion", fields: [activeVersionId], references: [id])

  // Draft area — admin's in-progress edits, not yet published
  draftNodes      Json?    // null when no draft exists
  draftEdges      Json?
  draftUpdatedAt  DateTime?
  draftUpdatedBy  String?

  versions   WorkflowVersion[] @relation("WorkflowVersions")
  createdBy  String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  deletedAt  DateTime?  // soft-delete only

  @@index([trigger, isActive])
}

model WorkflowVersion {
  id            String   @id @default(cuid())
  workflowId    String
  workflow      Workflow @relation("WorkflowVersions", fields: [workflowId], references: [id])
  versionNumber Int      // auto-incremented per workflow, starts at 1
  nodes         Json     // React Flow nodes — IMMUTABLE once any execution exists
  edges         Json     // React Flow edges — IMMUTABLE
  changeNote    String?  // admin-provided "what changed" message
  publishedBy   String
  publishedAt   DateTime @default(now())

  executions  WorkflowExecution[]
  activeFor   Workflow[] @relation("ActiveVersion")

  @@unique([workflowId, versionNumber])
  @@index([workflowId, publishedAt])
}

model WorkflowExecution {
  id                String   @id @default(cuid())
  workflowVersionId String   // CRITICAL: pinned at execution start, never changes
  workflowVersion   WorkflowVersion @relation(fields: [workflowVersionId], references: [id])
  triggeredBy       String   // entity ID that triggered it (lead, job, etc.)
  status            String   // running, completed, failed, stopped, migrated
  currentNodeId     String?
  context           Json     // runtime state passed between nodes
  startedAt         DateTime @default(now())
  completedAt       DateTime?
  error             String?
  migratedToExecutionId String? // set if admin manually migrated this execution to a new version

  @@index([workflowVersionId, status])
  @@index([status, startedAt])
}

// === SLA Tracking ===

model SlaEvent {
  id          String   @id @default(cuid())
  jobId       String
  job         Job      @relation(fields: [jobId], references: [id])
  slaType     String   // "report_internal_deadline", "report_client_deadline", "access_request"
  threshold   Int      // percentage breached: 50, 80, 100, breach
  triggeredAt DateTime @default(now())
  notifiedTo  String[] // user IDs notified
}

// === Activities & Audit ===

model Activity {
  id          String   @id @default(cuid())
  type        String   // e.g. "lead.created", "stage.changed", "message.sent"
  authorId    String?
  author      User?    @relation(fields: [authorId], references: [id])
  leadId      String?
  lead        Lead?    @relation(fields: [leadId], references: [id])
  jobId       String?
  job         Job?     @relation(fields: [jobId], references: [id])
  description String
  metadata    Json?
  createdAt   DateTime @default(now())

  @@index([leadId])
  @@index([jobId])
  @@index([createdAt])
}

model AuditLog {
  id          String   @id @default(cuid())
  userId      String?
  action      String   // CREATE, UPDATE, DELETE, READ_SENSITIVE
  entityType  String   // "Lead", "Job", "Customer", etc.
  entityId    String
  changes     Json?    // before/after for updates
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())

  @@index([entityType, entityId])
  @@index([userId])
  @@index([createdAt])
}

// === Documents ===

model Document {
  id          String   @id @default(cuid())
  jobId       String
  job         Job      @relation(fields: [jobId], references: [id])
  type        String   // "quotation", "invoice", "report_draft", "report_final", "site_photo", "rams"
  filename    String
  storageUrl  String
  mimeType    String
  sizeBytes   Int
  uploadedBy  String
  createdAt   DateTime @default(now())
}

// === System / Settings ===

model SystemSetting {
  key         String   @id
  value       Json
  description String?
  updatedAt   DateTime @updatedAt
  updatedBy   String?
}
```

---

## 6. API design (Express + Zod)

**Base URL:** `/api/v1`
**Auth:** Bearer JWT in `Authorization` header
**Response envelope:**
```ts
{ ok: true, data: T } | { ok: false, error: { code: string, message: string, details?: any } }
```

### 6.1 Endpoint catalogue (high level)

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/auth/login` | Email + password login |
| `POST` | `/auth/refresh` | Refresh JWT |
| `POST` | `/auth/logout` | Invalidate session |
| `POST` | `/auth/2fa/setup` | Setup TOTP 2FA |
| `POST` | `/auth/2fa/verify` | Verify TOTP code |
| `GET` | `/users/me` | Current user |
| `GET` | `/users` | List users (Admin+) |
| `POST` | `/users` | Create user (Admin+) |
| `PATCH` | `/users/:id` | Update user |
| `GET` | `/leads` | List leads (filters: stage, source, assignee, dateRange) |
| `GET` | `/leads/:id` | Lead detail with messages, activities |
| `POST` | `/leads` | **Deprecated — use `/intake/leads/DIRECT`.** Kept only as a thin wrapper that forwards to the intake pipeline. |
| `PATCH` | `/leads/:id` | Update lead |
| `POST` | `/leads/:id/stage` | Move stage (validates allowed transitions) |
| `POST` | `/leads/:id/stop-cadence` | Stop automation |
| `POST` | `/leads/:id/mark-lost` | Mark lost with reason |
| `POST` | `/leads/:id/convert-to-job` | Promote lead to job |
| `GET` | `/jobs` | List jobs (filters) |
| `GET` | `/jobs/:id` | Job detail |
| `PATCH` | `/jobs/:id` | Update job |
| `POST` | `/jobs/:id/stage` | Move stage |
| `POST` | `/jobs/:id/assign` | Assign surveyor/operative |
| `POST` | `/jobs/:id/inspection` | Set inspection date/window |
| `POST` | `/jobs/:id/report-status` | Update report status |
| `POST` | `/jobs/:id/payments` | Record manual payment |
| `POST` | `/jobs/:id/documents` | Upload document |
| `GET` | `/messages` | Recent messages |
| `POST` | `/messages/send` | Send ad-hoc message (email/SMS/WhatsApp) |
| `GET` | `/templates` | List templates |
| `POST` | `/templates` | Create template |
| `PATCH` | `/templates/:id` | Edit template |
| `GET` | `/workflows` | List workflows |
| `POST` | `/workflows` | Create workflow |
| `GET` | `/workflows/:id` | Get workflow (nodes + edges) |
| `PATCH` | `/workflows/:id` | Update workflow |
| `POST` | `/workflows/:id/activate` | Activate workflow |
| `POST` | `/workflows/:id/test-run` | Test run with sample data |
| `GET` | `/dashboards/sales` | Sales metrics |
| `GET` | `/dashboards/ops` | Operations metrics |
| `GET` | `/dashboards/sla` | SLA metrics |
| `GET` | `/dashboards/finance` | Financial metrics |
| `POST` | `/intake/leads/:source` | Universal lead intake (Pinlocal, Compare My Move, ReallyMoving, DIRECT, etc.) — see Section 6.5 |
| `POST` | `/intake/payments/:provider` | Universal payment events (Stripe, future providers) |
| `POST` | `/intake/messages/:provider` | Universal message delivery events (Resend, Twilio) |
| `POST` | `/intake/voice/:provider` | Universal voice events (Dialpad) |
| `POST` | `/intake/internal/:type` | Internal events (QStash callbacks, system triggers) |
| `GET` | `/admin/webhook-events` | List/filter received webhook events (Admin+) |
| `GET` | `/admin/webhook-events/:id` | Inspect raw payload + processing history |
| `POST` | `/admin/webhook-events/:id/replay` | Reprocess a failed event with current adapter |

### 6.2 Endpoint detail (a representative few — implement the rest with the same pattern)

#### `POST /api/v1/intake/leads/:source`

**Auth:** Source-specific signature verification (see Section 6.5.2).
**Path param:** `source` — must match a registered `SourceAdapter` (`PINLOCAL`, `COMPARE_MY_MOVE`, `REALLYMOVING`, `GET_A_SURVEYOR`, `WEBSITE`, `PARTY_WALL_TOOL`, `DIRECT`, `REFERRAL`).
**Request body:** Raw JSON from the provider. The platform does **not** define this shape — each adapter knows its own source's shape.

**Process** (see Section 6.5.2 for full code):
1. Resolve adapter from `:source`. If unknown → 400.
2. Verify signature via adapter. If invalid → 401.
3. Store raw payload in `WebhookEvent` table.
4. Idempotency check on `(source, externalId)`.
5. Run `adapter.normalize(rawPayload)` → produces `LeadInput`.
6. Upsert Customer (by email + phone).
7. Create Lead with stage = NEW.
8. Create Activity (`lead.created`).
9. Trigger workflow with `lead.created` trigger.
10. Update `WebhookEvent.status = PROCESSED`.

**Response:**
```json
{ "ok": true, "leadId": "clx...", "deduped": false }
```

#### `POST /api/v1/intake/payments/STRIPE`

**Auth:** Stripe webhook signature (`Stripe-Signature` header, verified via `stripe.webhooks.constructEvent`).
**Request body:** Stripe event object.
**Process:**
1. Verify signature. If invalid → 400.
2. Store raw payload in `WebhookEvent`.
3. Idempotency check on `(STRIPE, event.id)`.
4. Run `stripeAdapter.normalize(event)`.
5. Route by event type:
   - `payment_intent.succeeded` → mark Payment as PAID, transition Job stage, trigger workflow `payment.received`
   - `payment_intent.payment_failed` → mark Payment as FAILED, trigger workflow `payment.failed`
   - `charge.refunded` → mark Payment as REFUNDED, alert ops
6. Update `WebhookEvent.status`.

If verification fails, log to AuditLog and return 401 immediately.

---

## 6.5 Webhook-first architecture (the universal intake contract)

This section is load-bearing. Read every line.

### 6.5.1 The principle

Every input to the platform is a JSON HTTP request. There is no other way for data to enter. This includes:

- Lead source webhooks (Pinlocal, Compare My Move, ReallyMoving, Get A Surveyor)
- Self-generated leads (website form, Party Wall tool, ops staff using the admin UI)
- Provider events (Stripe payments, Twilio delivery, Resend events, Dialpad calls)
- Internal events (QStash cadence callbacks)

There is one universal intake endpoint per concern:

| Endpoint | Purpose |
|---|---|
| `POST /api/v1/intake/leads/:source` | All lead creation, regardless of origin |
| `POST /api/v1/intake/payments/:provider` | All payment events |
| `POST /api/v1/intake/messages/:provider` | All message delivery/bounce events |
| `POST /api/v1/intake/voice/:provider` | All call events |
| `POST /api/v1/intake/internal/:type` | Internal events (QStash callbacks, manual triggers) |

The `:source`, `:provider`, `:type` path parameter routes to the correct adapter. The body is the raw JSON the provider sends — never transformed before storage.

### 6.5.2 The four guarantees

Every inbound webhook handler must enforce these four things, in this order, before any business logic runs:

**1. Signature verification.** The request includes a signature header (`X-Signature`, `Stripe-Signature`, `X-Pinlocal-Signature`, etc.). The handler verifies it against a secret stored in env. If verification fails → 401 immediately, log to AuditLog, do not proceed.

**2. Raw payload storage.** The complete raw request (body, headers, source IP) is written to `WebhookEvent` table *before* anything else. If the request is malformed or processing fails downstream, the raw payload is preserved for inspection and replay.

**3. Idempotency check.** Each provider sends an idempotency identifier — Stripe uses `event.id`, Pinlocal uses a request UUID, internal calls generate one. The handler checks `WebhookEvent` for an existing record with the same `(provider, externalId)`. If found and previously processed successfully → return 200 immediately with the original response. If found but previously failed → reprocess. If not found → continue.

**4. Adapter normalization.** The handler invokes the source-specific adapter (a pure function: `rawJson → NormalizedInput`). The adapter is the *only* place that knows about source-specific field names, formats, or quirks. Everything downstream consumes the normalized internal shape.

```ts
// The canonical inbound handler
async function handleIntake(
  source: string,
  rawPayload: unknown,
  headers: Record<string, string>,
  ip: string
) {
  // 1. Signature verification
  await verifySignature(source, rawPayload, headers); // throws 401

  // 2. Raw payload storage (always succeeds, even if processing later fails)
  const event = await db.webhookEvent.create({
    data: {
      provider: source,
      externalId: extractExternalId(source, rawPayload, headers),
      rawBody: rawPayload as Prisma.JsonValue,
      rawHeaders: headers,
      sourceIp: ip,
      status: 'RECEIVED',
    },
  });

  // 3. Idempotency check
  const existing = await db.webhookEvent.findFirst({
    where: {
      provider: source,
      externalId: event.externalId,
      status: 'PROCESSED',
      id: { not: event.id },
    },
  });
  if (existing) {
    await db.webhookEvent.update({
      where: { id: event.id },
      data: { status: 'DUPLICATE', dedupedToId: existing.id },
    });
    return { ok: true, deduped: true, originalEventId: existing.id };
  }

  // 4. Adapter normalization → business logic
  try {
    const adapter = getAdapter(source);
    const normalized = adapter.normalize(rawPayload);
    const result = await processNormalized(source, normalized, event.id);
    await db.webhookEvent.update({
      where: { id: event.id },
      data: { status: 'PROCESSED', processedAt: new Date(), resultJson: result },
    });
    return { ok: true, result };
  } catch (err) {
    await db.webhookEvent.update({
      where: { id: event.id },
      data: {
        status: 'FAILED',
        error: err.message,
        errorStack: err.stack,
      },
    });
    throw err;
  }
}
```

### 6.5.3 SourceAdapter pattern

Each source has an adapter that knows two things: how to extract the idempotency ID, and how to map the raw payload to the internal shape. Adapters live in `packages/integrations/adapters/`.

```ts
interface SourceAdapter<TRaw = unknown, TNormalized = unknown> {
  source: string;                                    // "PINLOCAL", "COMPARE_MY_MOVE", etc.
  verifySignature(payload: TRaw, headers: Headers): boolean;
  extractExternalId(payload: TRaw, headers: Headers): string;
  normalize(payload: TRaw): TNormalized;
}
```

Example: `pinlocalAdapter.ts`
```ts
export const pinlocalAdapter: SourceAdapter<PinlocalPayload, LeadInput> = {
  source: 'PINLOCAL',
  verifySignature(payload, headers) {
    return verifyHmac(
      JSON.stringify(payload),
      headers['x-pinlocal-signature'],
      process.env.PINLOCAL_WEBHOOK_SECRET!
    );
  },
  extractExternalId(payload, headers) {
    return payload.request_id ?? headers['x-pinlocal-request-id'];
  },
  normalize(payload) {
    return {
      source: 'PINLOCAL',
      sourceRef: payload.request_id,
      customer: {
        firstName: payload.contact.first_name,
        lastName: payload.contact.last_name,
        email: payload.contact.email,
        phone: normalizePhone(payload.contact.phone, 'GB'),
        customerType: 'HOMEBUYER',
      },
      jobType: mapJobType(payload.service_type),
      surveyLevel: mapSurveyLevel(payload.survey_level),
      propertyAddress: formatAddress(payload.property),
      propertyPostcode: payload.property.postcode,
      propertyValueBand: bandFromValue(payload.property.estimated_value),
      marketingOptIn: payload.consent?.marketing === true,
    };
  },
};
```

Adding a new source = adding a new adapter file. No endpoint code changes. No core changes. No deploys to other parts of the system.

### 6.5.4 The admin UI is also a webhook client

When ops staff create a lead via the admin form, the frontend sends a POST to `/api/v1/intake/leads/DIRECT` with a JSON body that matches the `directAdapter` schema. The adapter for `DIRECT` is a near-passthrough — it validates the input and assigns `source: 'DIRECT'`. There is no separate "manual create" endpoint, no separate handler, no separate business logic. The only thing the UI knows is that it's calling the same intake URL Pinlocal would.

This means: anything you can do from the UI, you can do from a script, from another system, from a partner integration. The platform is API-complete by construction.

### 6.5.5 Outbound webhooks (workflow builder's Webhook node)

The Webhook node in the workflow builder fires *outbound* webhooks. Contract:

- **Method:** POST (default), configurable (GET, PUT, PATCH, DELETE)
- **URL:** Template string with merge fields (`https://example.com/api/{{job.jobNumber}}`)
- **Headers:** User-defined, with merge field support. Always include `User-Agent: Rosecrest-Platform/1.0` and `X-Rosecrest-Event: <event-name>`.
- **Body:** Template string evaluating to JSON; merged with the workflow execution context.
- **Signing:** Each workflow has an optional shared secret. If set, the platform adds `X-Rosecrest-Signature: <hmac-sha256>` so receivers can verify.
- **Timeout:** 10 seconds.
- **Retry policy:** 3 attempts with exponential backoff (1s, 4s, 16s). Retry on 5xx and network errors; do not retry on 4xx.
- **Logging:** Every attempt logged in `WebhookDelivery` table with request, response, status, latency, retry count.

### 6.5.6 Data model additions

Add these two tables to the Prisma schema:

```prisma
model WebhookEvent {
  id            String   @id @default(cuid())
  provider      String   // "PINLOCAL", "STRIPE", "TWILIO", "DIRECT", etc.
  externalId    String   // idempotency key from provider
  rawBody       Json     // unmodified request body
  rawHeaders    Json     // request headers (sanitized — strip auth headers before storage)
  sourceIp      String?
  status        WebhookStatus
  receivedAt    DateTime @default(now())
  processedAt   DateTime?
  resultJson    Json?    // what the handler produced (lead ID, payment ID, etc.)
  error         String?
  errorStack    String?
  dedupedToId   String?  // if duplicate, points to original event
  retryCount    Int      @default(0)

  @@unique([provider, externalId])
  @@index([status])
  @@index([receivedAt])
}

enum WebhookStatus {
  RECEIVED       // raw payload stored, not yet processed
  PROCESSING     // adapter running
  PROCESSED      // success
  FAILED         // adapter threw, available for retry
  DUPLICATE      // same externalId already processed
  REJECTED       // signature failed or malformed
}

model WebhookDelivery {
  id              String   @id @default(cuid())
  workflowExecutionId String?
  nodeId          String?  // workflow node that triggered this
  url             String
  method          String
  requestBody     Json
  requestHeaders  Json
  responseStatus  Int?
  responseBody    String?  // capped at 64KB
  latencyMs       Int?
  attempt         Int      @default(1)
  status          String   // 'success', 'failed', 'retrying'
  error           String?
  createdAt       DateTime @default(now())

  @@index([workflowExecutionId])
  @@index([status])
}
```

### 6.5.7 Replay and inspection

Because every inbound event is stored raw, the platform exposes:

- `GET /api/v1/admin/webhook-events` — list/filter/search all received events
- `GET /api/v1/admin/webhook-events/:id` — full raw payload + processing history
- `POST /api/v1/admin/webhook-events/:id/replay` — reprocess a previously-failed event with the current adapter code

Replay is essential. When you discover Pinlocal added a new field three weeks ago and you want to update old leads, you fix the adapter and replay the affected events.

### 6.5.8 What this principle buys us

- **One contract for every input.** Maintenance burden stays flat as sources grow.
- **Full auditability.** Every byte that entered the system is on disk.
- **Recoverability.** Bugs in mapping logic don't lose data; replay restores correctness.
- **No special cases.** "What about manual lead entry?" — it's a webhook. "What about partner integrations later?" — it's a webhook. "What about a Zapier customer connecting?" — they call the same endpoint.
- **API-completeness for free.** Every UI action is exposable as a programmatic call without writing new code.

### 6.5.9 Production realities (read carefully — these are where webhook-first systems fail)

The principle in 6.5.1–6.5.8 is correct architecturally. But it has three failure modes that show up only under real production load. Each is addressed below as a hard requirement.

#### A. Replay safety — the side-effect rule

Replay (Section 6.5.7) is powerful: any stored event can be reprocessed against the current adapter. But replay is dangerous if downstream side effects are not idempotent.

**Concrete failure mode:** Pinlocal sends a lead webhook. Adapter creates Lead, fires cadence (sends quotation email). Three weeks later, you fix a mapping bug and replay the webhook. Without idempotency, the customer gets a second quotation email — three weeks after their property purchase already completed.

**Hard requirements for every adapter and downstream handler:**

1. **No adapter directly sends customer-facing communication.** Adapters create domain records (Lead, Payment, Job). Communication is fired by *workflows* triggered by record state changes, not by adapters.
2. **Workflow triggers are guarded by record state, not by event arrival.** A `lead.created` workflow checks the Lead's `cadenceStopped`, `stage`, and `createdAt` fields before sending anything. If the lead was created more than 24 hours ago and replay is happening, the workflow short-circuits.
3. **Replay defaults to "dry run" mode.** The replay endpoint accepts a `?mode=` parameter:
   - `mode=dry-run` (default): re-runs adapter, shows what *would* happen, writes nothing
   - `mode=safe`: re-runs adapter and writes domain records, but suppresses all outbound communication and workflow triggers
   - `mode=full`: re-runs everything including communications — requires `SUPER_ADMIN` role and explicit confirmation header `X-Replay-Confirm: I-understand-side-effects`
4. **Every external write has an idempotency key.** Stripe API calls include `Idempotency-Key` headers. Twilio sends include a custom `MessageSid`-derived key checked against the `Message` table before sending. Resend sends are checked against a `(jobId, templateId, sentDate)` natural key.
5. **Replay UI surfaces the risk.** The admin webhook event browser shows a red warning when an event is more than 72 hours old: *"Replaying this event may fire outbound messages to a customer whose situation has since changed. Use safe mode unless you've verified state."*

This is non-negotiable. A platform that can silently re-send three-week-old emails is worse than one without replay.

#### B. Retention — preventing the WebhookEvent table from eating the database

At Rosecrest's current volume (~50 leads/week × ~5 webhook events per lead lifecycle + Stripe + Twilio + Resend = ~3,000 events/week), the table grows by ~150K events/year. Workable but not free — every event has raw JSON in it, often 5–50KB.

**Retention policy (configurable, defaults below):**

| Provider | Hot storage (Postgres) | Cold storage (Supabase Storage / S3) | Permanent deletion |
|---|---|---|---|
| `PINLOCAL`, `COMPARE_MY_MOVE`, `REALLYMOVING`, `GET_A_SURVEYOR`, `WEBSITE`, `PARTY_WALL_TOOL`, `DIRECT` | 90 days | 6 years (GDPR-compliant record of lead origin) | After 6 years |
| `STRIPE` | 180 days | 7 years (financial records retention requirement) | After 7 years |
| `TWILIO` (delivery events) | 30 days | 1 year | After 1 year |
| `RESEND` (delivery events) | 30 days | 1 year | After 1 year |
| `DIALPAD` (call events) | 90 days | 2 years | After 2 years |
| `QSTASH` (internal callbacks) | 7 days | None — operational only | After 7 days |

**Implementation:**
- Nightly scheduled job (`webhook-event-archiver`) runs at 03:00 UK time
- Events older than hot-storage threshold are written to compressed JSONL files in Supabase Storage, partitioned by `provider/year/month/` (e.g. `pinlocal/2026/05/events.jsonl.gz`)
- After successful write to cold storage, the `rawBody` and `rawHeaders` columns are nulled in Postgres (the WebhookEvent row remains for audit linkage — just without the heavy JSON payload)
- A `archivedAt` and `archiveLocation` column track where the cold copy lives
- Replay endpoint transparently fetches from cold storage if `rawBody` is null but `archiveLocation` is set
- Events past the permanent-deletion threshold are removed from both hot and cold; the WebhookEvent row is retained with `body: null, headers: null, status: 'PURGED'` for audit completeness

**This needs to be in the schema.** Update the WebhookEvent model:

```prisma
model WebhookEvent {
  // ... fields from 6.5.6 ...
  archivedAt      DateTime?
  archiveLocation String?   // e.g. "pinlocal/2026/05/events.jsonl.gz#offset-1247"
  purgedAt        DateTime?

  @@index([receivedAt, status]) // for the archive job to query efficiently
}
```

#### C. The adapter validation contract — preventing partial leads from entering the system

The `DIRECT` adapter is a near-passthrough (Section 6.5.4). That convenience is exactly where bad data leaks in. If the admin UI sends a partial object and the adapter doesn't enforce a strict schema, you end up with leads missing required fields, postcodes in the wrong format, phone numbers without country codes — exactly the data-quality problem Salesforce's mandatory-fields debate was about, just relocated.

**Hard requirement: every adapter outputs `LeadInput` (or `PaymentInput`, `MessageEventInput`, etc.) conforming to a shared Zod schema. The schema is the only contract.**

```ts
// packages/validation/schemas/leadInput.ts — the canonical shape

export const LeadInputSchema = z.object({
  source: z.nativeEnum(LeadSource),
  sourceRef: z.string().min(1).max(200),  // every lead must be traceable to its origin
  customer: z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    email: z.string().email().toLowerCase(),
    phone: z.string().regex(/^\+[1-9]\d{6,14}$/, "Phone must be E.164 format"),
    customerType: z.nativeEnum(CustomerType),
  }),
  jobType: z.nativeEnum(JobType),
  surveyLevel: z.nativeEnum(SurveyLevel).optional(),
  propertyAddress: z.string().min(5).max(500),
  propertyPostcode: z.string().regex(
    /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i,
    "Must be a valid UK postcode"
  ).transform(s => s.toUpperCase().replace(/\s+/g, ' ').trim()),
  propertyValueBand: z.enum([
    "0-250k", "250k-500k", "500k-750k", "750k-1m", "1m-2m", "2m+"
  ]).optional(),
  marketingOptIn: z.boolean(),
  consent: z.object({
    timestamp: z.string().datetime(),
    ipAddress: z.string().ip().optional(),
    source: z.string(),  // form name, webhook, ops staff name
  }),
});

export type LeadInput = z.infer<typeof LeadInputSchema>;
```

**Every adapter ends with this:**

```ts
normalize(rawPayload: unknown): LeadInput {
  // ...source-specific mapping...
  return LeadInputSchema.parse(intermediate);  // throws ZodError if invalid
}
```

**Adapter validation failures are first-class events, not bugs:**

- Failed validation writes the original event to `WebhookEvent` with status `REJECTED` and the full Zod error in the `error` field
- A daily alert summarises validation failures per source (helps spot when Pinlocal silently changes their schema)
- Validation errors do NOT trigger downstream workflows — the lead simply doesn't exist
- Admins can view and replay rejected events after the adapter is fixed

**The DIRECT adapter is the same.** It receives admin UI POSTs that are *already* shaped like `LeadInput` (because the UI form was built against the same schema). It still calls `.parse()` to enforce the contract — defence in depth.

**Mutation endpoints (PATCH /leads/:id, PATCH /jobs/:id) use their own Zod schemas.** These are *partial* schemas — you can update one field — but every field that's present must still conform to the canonical type. There's no path where bad data enters the database.

#### D. One more thing: the schema is versioned

Sources change their payloads over time. Pinlocal will rename a field. ReallyMoving will add a new property type. Without versioning, you'll either break the adapter or accumulate compatibility hacks.

**Each adapter declares a version:**

```ts
export const pinlocalAdapter: SourceAdapter = {
  source: 'PINLOCAL',
  version: '2026-05-01',
  // ...
};
```

When the adapter changes in a breaking way, bump the version and keep the old one available under its version string. Stored WebhookEvents record which adapter version processed them. Replay uses the version that processed the original event by default; an admin can opt to replay with the current version when fixing historical data.

This is the same pattern Stripe uses for its own API versioning, and for the same reason: external integrations can't be assumed stable forever.

---

## 7. Authentication and authorization

### 7.1 Auth flow
1. User logs in with email + password
2. Backend validates against Supabase Auth
3. If 2FA enabled, prompt for TOTP
4. Issue JWT (15min) + Refresh Token (7 days, httpOnly cookie)
5. Frontend stores JWT in memory, refresh handled silently

### 7.2 Authorization (RBAC)
Implement as middleware. Every endpoint declares minimum role:

```ts
router.get('/users',
  requireAuth,
  requireRole(UserRole.ADMIN),
  controller.listUsers
);
```

Role hierarchy (higher includes lower):
```
SUPER_ADMIN > ADMIN > OPS > SURVEYOR | TRADE_OPERATIVE | QC | FINANCE > READ_ONLY
```

For Surveyor/TradeOperative scoping: they only see records where `assignedToId === currentUser.id`. Enforce at query level (Prisma where clause), not at controller.

### 7.3 Audit log
**Every** mutating endpoint writes an AuditLog row with `userId`, `action`, `entityType`, `entityId`, `changes` (before/after diff), `ipAddress`, `userAgent`.

Sensitive read endpoints (full customer data export, DSAR) also log under `READ_SENSITIVE`.

---

## 8. Messaging system

### 8.1 Channels
- **Email:** Resend API. Sender domain configured with SPF/DKIM/DMARC. Default `from: hello@rosecrestgroupltd.co.uk`.
- **SMS:** Twilio Programmable Messaging. UK long-code numbers initially; consider short code if volume exceeds 10K/month.
- **WhatsApp:** Twilio WhatsApp Business API. Every cadence message uses a Meta-approved template.

### 8.2 Template system
Templates stored in `MessageTemplate` table. Body supports merge fields with `{{double_curly_braces}}`. Render via a simple substitution function — no eval, no Handlebars (too heavy). Allowed merge fields documented per template type.

**Standard merge fields:**
- `{{customer.firstName}}`
- `{{customer.lastName}}`
- `{{customer.email}}`
- `{{lead.propertyAddress}}`
- `{{lead.surveyLevel}}`
- `{{lead.quotedAmount}}`
- `{{job.jobNumber}}`
- `{{job.inspectionDate}}`
- `{{job.surveyorName}}`
- `{{links.paymentLink}}`
- `{{links.reportLink}}`

### 8.3 Sending pipeline
For every outbound message:
1. Render template with merge fields → produces final body
2. Check stop conditions (cadenceStopped, marketingOptOut, etc.)
3. Insert Message row with status = QUEUED
4. Send via channel provider
5. Update Message row with providerMessageId and status = SENT
6. On webhook delivery confirmation, update to DELIVERED
7. On bounce/failure, update to BOUNCED/FAILED and (for email) record in suppression list

### 8.4 Working-hours awareness
SMS and WhatsApp respect "working hours" (default Mon-Fri 09:00–17:30 BST/GMT). Messages scheduled outside this window get deferred to the next working window. Email always sends immediately.

This is a system setting (`messaging.working_hours_enabled`, `messaging.working_hours_start`, `messaging.working_hours_end`).

### 8.5 Opt-out handling
- Every email contains an unsubscribe link → toggles `Customer.marketingOptIn = false`
- SMS replies of "STOP" handled by Twilio webhook → same effect
- Marketing-class messages check `marketingOptIn` before sending
- Transactional messages (payment confirmations, report delivery) ignore opt-out

---

## 9. Cadence engine (the follow-up automation)

This is the heart of the platform. Read this section carefully.

### 9.1 What cadence does
When a new lead is created (or another trigger fires), the cadence engine schedules a series of future messages at specific intervals, checking stop conditions before each send.

**Default homebuyer cadence:**
| Step | Delay from lead creation | Channels |
|---|---|---|
| 1 | Immediate | Email (quotation) + SMS + WhatsApp |
| 2 | 48 hours | Email + SMS + WhatsApp |
| 3 | 72 hours | Email + SMS + WhatsApp |
| 4 | 7 days | Email + SMS + WhatsApp |
| 5 | 14 days | Email + SMS + WhatsApp |
| 6 | 21 days | Email + SMS + WhatsApp (final) |

**Stop conditions (checked before each step):**
- `Lead.cadenceStopped === true`
- `Lead.stage` ∈ {`CONVERTED`, `LOST`, `PAUSED`}
- `Customer.marketingOptIn === false`
- Payment received (creates Job, sets cadenceStopped)

### 9.2 Implementation with QStash

QStash schedules HTTP callbacks at specific future times. Architecture:

1. On lead creation, the trigger creates a `CadenceRun` record (extend Lead's `cadenceState` JSON or new table — use new `CadenceRun` table for clarity).
2. Schedule first QStash callback for Step 1 (immediate or near-immediate).
3. The callback hits `POST /api/v1/webhooks/qstash` with a payload `{ leadId, step, cadenceRunId }`.
4. Handler:
   - Load Lead + CadenceRun.
   - Check stop conditions. If stopped, mark CadenceRun as stopped, exit.
   - Render and send the step's messages.
   - Schedule next QStash callback for the next step (if any).
5. Repeat until cadence complete or stopped.

**Critical: QStash callbacks must be idempotent.** Each callback verifies the CadenceRun is still at the expected step before sending. If the same callback fires twice (QStash retries), the second one is a no-op.

```ts
async function handleCadenceStep(payload: CadenceCallbackPayload) {
  const run = await db.cadenceRun.findUnique({ where: { id: payload.cadenceRunId } });
  if (!run) return; // deleted
  if (run.currentStep !== payload.step) return; // already advanced
  if (run.status !== 'RUNNING') return; // stopped

  // ... check stop conditions ...
  // ... send messages ...
  // ... advance step, schedule next ...
}
```

### 9.3 Cadence templates per customer type

Cadence definitions live as records in a `Cadence` table (do NOT hardcode):

```prisma
model Cadence {
  id          String       @id @default(cuid())
  name        String       @unique
  customerType CustomerType
  surveyLevel SurveyLevel?
  trigger     String       // "lead.created" etc.
  steps       Json         // array of step definitions
  isActive    Boolean      @default(true)
}
```

A step is `{ delayHours: number, channels: ('EMAIL' | 'SMS' | 'WHATSAPP')[], templateIds: { email?: string, sms?: string, whatsapp?: string } }`.

### 9.4 Why not BullMQ here?
QStash is simpler to operate (no Redis to manage, no worker process to keep alive) and the cadence is intrinsically one-shot — schedule the next callback at completion of the current one. BullMQ becomes worth it only if we have many short-lived jobs running in parallel or need complex job priorities, which we don't here.

**If QStash limits become an issue (rate limits on free tier, latency for sub-second jobs), revisit with BullMQ + Upstash Redis.** Documented as a known trade-off in DECISIONS.md.

---

## 10. Visual workflow builder

### 10.1 What it is
A drag-and-drop canvas where Admin users build automation flows by connecting nodes. Each node is a discrete operation (Send Email, Wait, Check Condition, Update Field). Edges connect nodes; connectors are bezier curves, not straight lines.

### 10.2 Libraries
- **React Flow (`@xyflow/react`)** — canvas, drag-and-drop, edges, viewport, minimap, controls. Bezier edge type for curved connectors.
- **Custom node components** — each node type is a React component with its own form for configuration.
- **Custom execution engine** — runs workflows server-side, separate from the visual canvas.

### 10.3 Node types (v1)

| Node | Purpose | Configuration |
|---|---|---|
| **Trigger** | Entry point | Trigger type (lead.created, job.stage_changed, etc.) |
| **Send Email** | Send templated email | Template ID, recipient field path |
| **Send SMS** | Send templated SMS | Template ID, phone field path |
| **Send WhatsApp** | Send WhatsApp template | Template ID, phone field path |
| **Wait** | Pause execution | Duration (minutes/hours/days), or until-condition |
| **Branch** | Conditional split | Condition expression (Zod-validated), true/false outputs |
| **Update Record** | Modify lead/job field | Field path + new value (literal or expression) |
| **Create Task** | Create internal task | Assignee, title, description |
| **Webhook** | Call external URL | URL, method, body template |
| **End** | Terminate flow | None |

### 10.4 Data shape

Workflows are versioned (see Section 10.8). The visual graph (nodes + edges) lives on `WorkflowVersion`, not on `Workflow` itself. Admin's unpublished edits live in `Workflow.draftNodes` / `Workflow.draftEdges`.

Both store JSON matching React Flow's format:

```ts
type WorkflowNode = {
  id: string;
  type: 'trigger' | 'sendEmail' | 'sendSms' | 'sendWhatsapp' | 'wait' | 'branch' | 'updateRecord' | 'createTask' | 'webhook' | 'end';
  position: { x: number; y: number };
  data: Record<string, unknown>; // node-specific config
};

type WorkflowEdge = {
  id: string;
  source: string;        // node id
  target: string;        // node id
  sourceHandle?: string; // for branch nodes: 'true' | 'false'
  type: 'bezier';        // curved connector
};
```

### 10.5 Execution engine

Workflow execution lives in the worker app. **Every execution is pinned to a specific `WorkflowVersion` at start and never reads from any other version** — this is the load-bearing rule that makes in-flight edits safe. See Section 10.8 for the full version-pinning contract.

Algorithm:

```
function executeWorkflow(workflowId, triggerContext):
  workflow = load Workflow by id
  if workflow.activeVersionId is null:
    abort: 'Workflow has no published version'
  version = load WorkflowVersion by workflow.activeVersionId   // <-- pin here
  execution = create WorkflowExecution {
    workflowVersionId: version.id,                              // <-- pinned forever
    triggeredBy: triggerContext.entityId,
    status: 'running',
    context: triggerContext,
    currentNodeId: findTriggerNode(version.nodes).id,
  }
  return await runExecution(execution)

function runExecution(execution):
  version = load WorkflowVersion by execution.workflowVersionId  // re-load on resume
  while execution.currentNodeId is not null:
    node = version.nodes[execution.currentNodeId]
    result = await executeNode(node, execution.context)
    execution.context = merge(execution.context, result.contextUpdate)
    if result.shouldWait:
      // Persist state and schedule resume — QStash payload includes executionId only
      // On resume, runExecution re-loads the same version via the pinned id
      schedule QStash callback to resume execution at this point after the wait
      return
    execution.currentNodeId = findNextNode(version.edges, node, result)
  mark execution as completed
```

Wait nodes serialize the execution state and schedule a QStash callback to resume. Branch nodes pick the edge with the matching `sourceHandle`. **The QStash callback never carries the workflow definition itself — only the `executionId`** — because the pinned version is fetched on every resume. This means even if the workflow's active version changes 5 times during a 21-day cadence, the execution continues on the version it started with.

### 10.6 UI requirements

- Sidebar with draggable node palette
- Canvas with pan, zoom, minimap, fit-to-view
- Selecting a node opens a config panel (right side)
- Save button persists nodes + edges
- "Test Run" button executes with sample data and shows visual progress (highlight current node)
- "Activate" / "Deactivate" toggle
- Version history (auto-save on edit, restore previous versions)

### 10.7 Initial seeded workflows

The platform ships with these workflows pre-built (created via migration). They are editable in the visual builder, but launch with sensible defaults that match Section 12.7's operational triggers:

1. **Homebuyer Lead Cadence** — `lead.created` → 6-step cadence (immediate, 48h, 72h, 7d, 14d, 21d)
2. **Payment Received (Stripe)** — Stripe webhook → stop cadence, send acknowledgement, transition to `PAID`, create Request Access task
3. **Payment Received (Manual)** — ops marks bank transfer paid → identical to Stripe path
4. **Access Request After Payment** — Job → `PAID` with no agent details → send agent-details request to customer
5. **Agent Details Captured** — `Job.agentEmail` filled → send access-request to agent; transition to `ACCESS_REQUESTED`
6. **Inspection 24h Reminder (Paid)** — T-24h before inspection on paid jobs → customer + surveyor reminders
7. **Inspection 24h Reminder (Unpaid)** — T-24h before inspection still unpaid → urgent payment reminder + ops alert
8. **Surveyor Assignment** — `Job.assignedToId` changes to surveyor → notify the surveyor
9. **Inspection Complete** — stage → `INSPECTION_COMPLETE` → create Chase Report Upload task
10. **Report Deadline Approaching** — T-4h to internal deadline → reminder to surveyor + ops
11. **Report Late / Overdue** — `reportStatus` → `LATE` or `OVERDUE` → escalation email to surveyor + line manager + senior management; daily reminder until resolved
12. **Report Delivered** — `reportStatus` → `DELIVERED` → send report to customer + log activity
13. **Refund Issued** — Stripe `charge.refunded` or manual refund → confirmation email + finance alert
14. **Lost Reason Logged** — Lead → `LOST`; if DND, set marketingOptIn=false and archive
15. **Review Request** — Job → `COMPLETED` + 3 days → review request email + SMS

### 10.8 Workflow versioning and in-flight execution contract

This section is load-bearing. Workflow editing is one of the highest-risk features in the platform: a careless edit could break automations affecting hundreds of in-flight leads. The version-pinning model below is the industry-standard answer (n8n, Zapier, Make, HubSpot, Salesforce Flow, Microsoft Power Automate, Pipedream all use it). Implement exactly as specified.

#### 10.8.1 The load-bearing rule

**Every workflow execution is pinned to the `WorkflowVersion` it started on. That pinning never changes for the life of the execution.** When admin edits a workflow and publishes a new version, in-flight executions continue running against their original version. Only new executions use the new version.

The reasoning: a customer in the middle of a 21-day cadence should not suddenly experience a different journey because admin changed step 5 yesterday. They started on the old contract; they finish on the old contract.

#### 10.8.2 Data model (already in Section 5)

Three rows are involved on every published edit:
- `Workflow` — durable container; carries a pointer to the currently-active version
- `WorkflowVersion` — immutable snapshot of nodes + edges at publish time
- `WorkflowExecution` — runtime instance, pinned to one `WorkflowVersion` for its full lifetime

`Workflow.draftNodes` / `Workflow.draftEdges` hold admin's in-progress edits before they publish. They are not visible to the runtime engine. Save Draft writes here. Publish converts the draft into a new `WorkflowVersion`.

#### 10.8.3 The lifecycle of a single edit

A complete admin flow:

1. **Admin opens the workflow in the builder.** UI loads `Workflow.activeVersion` (or `draftNodes`/`draftEdges` if a draft exists) into the canvas.
2. **Admin makes changes.** Every change is auto-saved to `Workflow.draftNodes` / `draftEdges` every 5 seconds (debounced) and `draftUpdatedAt` / `draftUpdatedBy` are stamped.
3. **Admin clicks "Publish".** The platform:
   - Validates the draft (Section 10.8.6). If invalid, refuses to publish and shows errors inline on the canvas.
   - Counts in-flight executions on the current `activeVersion`. Shows the count in a confirmation modal.
   - Asks for an optional **change note** (one-line description: "Made 1-week follow-up softer").
   - On confirm: creates a new `WorkflowVersion` row with `versionNumber = max + 1`, the new nodes/edges, the change note, the publisher's user id; updates `Workflow.activeVersionId` to point at the new version; clears `draftNodes` and `draftEdges`.
4. **From this moment forward**, every new execution triggered by `workflow.trigger` uses the new version. In-flight executions on the old version continue undisturbed.
5. **Activity log records the publish event** with diff metadata (which nodes/edges changed).

#### 10.8.4 The confirmation modal

When admin clicks Publish, this is what they see:

> **Publish *Homebuyer lead cadence* v7?**
>
> 247 leads are currently running on v6.
> They will continue on v6 — no change to their journey.
>
> New leads from this point forward will start on v7.
>
> Change note _(optional)_: [______________]
>
> [Cancel] [Save as draft] [Publish v7]

If 0 executions are on the current active version, drop the "247 leads currently running" line. If the workflow has never been published (no active version yet), the modal simply says "Publish v1?" with no in-flight count.

#### 10.8.5 The Versions tab

Each workflow has a Versions tab in the builder showing every published version, newest first:

```
v7 (active)   12 new executions started  ·  published 3h ago by Barisuka  ·  "Made 1-week follow-up softer"
v6            247 in-flight, 1,203 completed  ·  was active 12 days
v5            0 in-flight, 891 completed  ·  was active 47 days
v4            0 in-flight, 423 completed  ·  was active 8 days
...
```

Each version row offers:
- **View** — open the canvas in read-only mode showing this version's nodes/edges
- **Compare to active** — side-by-side diff of nodes/edges changed
- **Restore as draft** — copies this version's nodes/edges into `draftNodes`/`draftEdges` for re-editing
- **Make active** — promotes this version to be `activeVersionId` (one-click rollback). Confirmation required; same modal as publish.

In-flight execution counts are live (computed from `WorkflowExecution` where `workflowVersionId = version.id AND status = 'running'`).

#### 10.8.6 Validation before publish

The publish action runs these checks on the draft. Any failure prevents publishing:

| Check | Message shown if it fails |
|---|---|
| Exactly one Trigger node exists | "A workflow must have exactly one Trigger node" |
| At least one End node exists | "A workflow must have at least one End node" |
| No orphan nodes (every non-trigger node has an incoming edge) | "Node *X* is unreachable — connect it to another node" |
| No dead ends (every non-end node has at least one outgoing edge) | "Node *X* has no next step — connect it or remove it" |
| Branch nodes have exactly two outgoing edges with `sourceHandle = 'true'` and `'false'` | "Branch node *X* needs both a true and false path" |
| Every Branch node's condition expression is valid (Zod-parseable) | "Branch node *X* has an invalid condition" |
| Every Send Email / Send SMS / Send WhatsApp node references a real, active template | "Send node *X* references missing template *id*" |
| No cycles unless explicitly marked as a Loop node | "Workflow contains a cycle: *path*" |
| Total node count ≤ 100 | "Workflow exceeds 100 nodes — split into multiple workflows" |
| Wait node durations are ≤ 90 days | "Wait node *X* exceeds the 90-day maximum" |

Validation runs both as the admin builds (warnings inline, in real time) and at publish (hard block). Inline warnings can be ignored; publish blocks cannot.

#### 10.8.7 Soft-delete semantics

Workflows are never hard-deleted. The Delete action sets `Workflow.deletedAt = now`, `Workflow.isActive = false`. In-flight executions on any version continue to completion as normal. Deleted workflows do not appear in the workflows list by default but are accessible via a "Show deleted" toggle.

A separate **Purge** action (Admin role only, confirmation friction-heavy) hard-deletes a workflow and all its versions. Purge fails loudly if any execution exists — current or completed — referencing any version of the workflow. This is to protect audit history; if Rosecrest needs the audit trail later, hard-deletion would erase it.

#### 10.8.8 Emergency manual migration (use with care)

There is exactly one situation that violates the "executions never change version" rule: when v6 contains a critical bug and 247 leads will hit it tomorrow. Admin needs to fast-forward those executions to v7.

**This is a deliberate, friction-heavy action.** Not a default behavior, not a single button on the Versions tab. Implemented as:

- `POST /api/v1/admin/workflow-executions/:id/migrate` endpoint, Admin role only
- Body: `{ targetVersionId: string, mapping: { oldNodeId: newNodeId } }`
- Admin selects, per execution, which node in v7 corresponds to the execution's current node in v6
- Platform validates the mapping (target node exists, types are compatible)
- On confirm: creates a new `WorkflowExecution` row pinned to v7 with the current context; sets old execution status to `migrated`; sets old `migratedToExecutionId` pointer
- Audit log records every migration with who, when, from-version, to-version, mapping

A "Migrate all in-flight" bulk action exists but requires admin to confirm twice and provide a written reason. Bulk migration audit records explicitly link all affected executions for traceability.

**Why so much friction:** the alternative is a one-click "migrate everyone to v7" button that ops will use casually, and the next time it produces a bug it'll be unfixable because nobody remembers what was migrated when.

#### 10.8.9 Edge cases the agent must handle correctly

| Scenario | Required behavior |
|---|---|
| Workflow has draft edits but no published version yet | Cannot trigger executions. UI shows "Publish to activate" instead of "Active". |
| Admin publishes v8 while v7 is still being published (race condition) | Use `SELECT ... FOR UPDATE` on the Workflow row inside the publish transaction. Second publish waits for the first to commit and re-validates the draft against the now-newer state. |
| WorkflowVersion is deleted but referenced by a WorkflowExecution | Cannot happen — WorkflowVersion has no delete action. Versions are kept forever. |
| Storage size of versions over time | Trivial. A workflow definition is a few KB. 100 versions × 100 workflows ≈ 10 MB. Do not optimize until it matters. |
| In-flight execution is on a version that's been superseded; what does the lead detail page show? | Show the lead's actual journey based on its pinned version. Add a small badge: "Running on v6 · v7 is now active · [Migrate]". |
| Admin tries to delete a node that's the `currentNodeId` of an in-flight execution on the active version | Allowed. The execution continues on its pinned version (which still has the node). The draft / new version simply won't have it. |
| Two admins edit the draft simultaneously | Last write wins on `draftNodes`/`draftEdges`. UI shows "Editing — last saved by Alice 12s ago" so they can coordinate. Real-time collaborative editing is out of scope for v1. |
| Workflow is duplicated (admin clones it) | The clone starts with no versions. The original's active version's nodes/edges become the clone's `draftNodes`/`draftEdges`. Admin publishes it as v1 of the new workflow. |

#### 10.8.10 What this buys us

- **Safe editing in production.** Admin can change a live workflow without fearing customer journey disruption.
- **Rollback in one click.** Any prior version can be made active again.
- **Full audit history.** Every workflow change is permanent, attributable, and replayable.
- **A reasoning floor for support.** "Lead X got the old quotation email" → check which version their execution is pinned to → reproduce the exact behavior.
- **Storage stays predictable.** Versions are cheap; no compaction needed at expected scale.

---

### 10.9 Honest note for the agent

**This is the most complex single feature in the build.** Budget at least 4–6 weeks of focused work on it. Build incrementally:
- Week 1: React Flow canvas with static nodes + edges, save/load
- Week 2: Node config panels for all node types
- Week 3: Execution engine for synchronous nodes (no Wait)
- Week 4: Wait node + QStash resume mechanism
- Week 5: Branch logic + complex flows
- Week 6: Test runs, polish, documentation

Do not skip the test-run feature. Workflow bugs are very hard to debug in production.

---

## 11. SLA tracking engine

### 11.1 Working-day calculation
Implement a utility:
```ts
function addWorkingDays(startDate: Date, days: number): Date
```
- Skips weekends
- Skips UK bank holidays (use the `date-holidays` npm package with `'GB-ENG'` region, or hardcode a JSON for 5 years)
- Returns the resulting date

### 11.2 Deadline calculation

The platform tracks **two distinct deadlines per job**:

- **Internal deadline** — operational target for the QC pipeline. Used for internal alerts and surveyor accountability. Never communicated to clients.
- **Client deadline** — the externally promised turnaround. Used in customer communications and breach calculations.

The internal deadline is always shorter than the client deadline, giving QC and revisions buffer before the client-facing promise is missed.

```ts
// Starts counting the day AFTER inspection (not the inspection day itself)
const day1 = addWorkingDays(inspectionDate, 1);
job.reportInternalDeadline = addWorkingDays(day1, slaConfig[jobType].internalDays - 1);
job.reportClientDeadline   = addWorkingDays(day1, slaConfig[jobType].clientDays - 1);
```

**SLA config per job type** (stored in `SystemSetting`, editable in admin UI):

| Job type | Internal (working days) | Client (working days) |
|---|---|---|
| RICS Level 1 | 1 | 2 |
| RICS Level 2 | 2 | 5 *(communicated as "3–5")* |
| RICS Level 3 | 3 | 7 *(communicated as "5–7")* |
| CPR-35 | 7 | 10 |
| Damp / Mould | 3 | 5 |
| Housing Disrepair | 5 | 7 |
| EPC | 2 | 3 |
| Environmental | 3 | 5 |
| Stock Condition | 7 | 10 |

Customer-facing messaging shows the *range* (e.g. "3–5 working days for Level 2") for SLAs that have a published range; internally we operate against the upper bound.

### 11.3 SLA monitor
A scheduled job (QStash recurring, runs every 30 minutes during business hours):
1. Query all jobs where `reportClientDeadline` is in the future and `reportStatus` not in (DELIVERED, OVERDUE)
2. For each, calculate % of SLA elapsed: `(now - inspectionDate) / (deadline - inspectionDate)`
3. At 50% → no action (informational only)
4. At 80% → create SlaEvent with threshold=80, notify surveyor + ops
5. At 100% → create SlaEvent with threshold=100, notify line manager
6. Past internal deadline but submitted late → set `reportStatus = LATE`, create SlaEvent, fire escalation
7. Past client deadline and still not delivered → set `reportStatus = OVERDUE`, create SlaEvent, fire escalation

**Escalation rule (mandatory)**: when `reportStatus` transitions to either `LATE` or `OVERDUE`, the platform automatically sends an internal escalation email to:
- The assigned surveyor
- The surveyor's line manager
- Senior management (configurable list in SystemSetting `sla.escalation_recipients`)

The escalation email includes: job number, customer name, property address, inspection date, deadline missed, current status, and a deep link to the job record. Cadence: one immediate alert on transition, then daily reminders until status moves to DELIVERED.

**Idempotency:** Check that an SlaEvent with this threshold doesn't already exist for this job before creating a new one. The daily-reminder cadence is its own scheduled job, separate from the threshold-trigger job.

---

## 12. Integrations detail

### 12.1 Stripe
- Use Stripe Payment Links (one per job) — created via Stripe API on quote send
- Webhook events handled: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
- Verify webhook signature with `stripe.webhooks.constructEvent` — reject 400 if invalid
- On `payment_intent.succeeded`: create Payment row, update Job.paymentStatus = PAID, trigger workflow `payment.received`

### 12.2 Twilio (SMS)
- Use Twilio Programmable Messaging
- Send via `messaging.v1.services(<msid>).preview.compliance.tollfreeVerifications.create()` — actually, simpler: `client.messages.create({ to, from, body, statusCallback })`
- Status callback URL: `/webhooks/twilio/status`
- Handle inbound replies (STOP, START): map to opt-out logic

### 12.3 Twilio WhatsApp
- All cadence messages must use pre-approved Meta templates
- Template approval is a manual process via Meta Business Manager — flag in onboarding
- Use `client.messages.create({ to: 'whatsapp:+44...', from: 'whatsapp:+...', contentSid, contentVariables })` for template messages

### 12.4 Resend
- API key in env
- Use `resend.emails.send({ from, to, subject, html, headers: { 'List-Unsubscribe': '...' } })`
- Configure webhooks for delivered/bounced/complained events
- Suppression list: store in DB, check before every send

### 12.5 Dialpad (embedded dialer + call logging)

Dialpad is a **first-class integration**, not a read-only one. Ops must be able to make and receive calls *inside* the CRM without switching tabs — click a Call button, hear audio in the browser, see call controls (mute/hold/hangup/transfer) without leaving the lead page.

This is implemented in three layers:

#### 12.5.1 The embedded dialer (iframe + SDK)

We embed Dialpad's **hosted softphone iframe** as a persistent sidebar in the platform. The iframe handles WebRTC audio, device permissions, call quality, and the dial pad UI — Dialpad's problem, not ours. We orchestrate it via the **Dialpad CTI JavaScript SDK** so the iframe and our React app can talk to each other.

```
┌──────────────────────────────────────────────┬──────────────────┐
│  CRM main view (lead detail, job, etc.)      │  Dialpad iframe  │
│                                              │  (persistent     │
│  Sarah Mitchell                              │   right sidebar) │
│  +44 7700 900142   [📞 Call]                 │                  │
│                                              │  ☎ Active call   │
│  ┌────────────────────────────────────────┐  │  Sarah Mitchell  │
│  │ Timeline                               │  │  00:42           │
│  │ ...                                    │  │                  │
│  │                                        │  │  [Mute] [Hold]   │
│  │                                        │  │  [Transfer]      │
│  │                                        │  │  [End call]      │
│  └────────────────────────────────────────┘  │                  │
└──────────────────────────────────────────────┴──────────────────┘
```

**Loading**:
- The iframe loads on app boot for any user with `phoneEnabled = true` on their User record
- The iframe URL is `https://dialpad.com/cti/embedded` (or whichever Dialpad publishes for partners)
- The user signs in to Dialpad inside the iframe once (OAuth or SSO); session persists across page loads via the iframe's own auth
- The iframe is collapsible — minimised state shows just a small dial icon

**Click-to-call from anywhere in the CRM**:
- Any phone number is rendered as a button: `<PhoneButton number="+447700900142" leadId={lead.id} />`
- Click → CRM sends a `dial` event via the Dialpad SDK → the embedded iframe places the call
- No tab switching, no app switching, no opening Dialpad in a new window

```ts
// packages/integrations/dialpad/cti.ts
import { DialpadCti } from '@dialpad/cti-sdk';

export const dialpad = new DialpadCti({
  iframeOrigin: 'https://dialpad.com',
  onReady: () => store.dispatch(setDialpadReady(true)),
  onIncomingCall: (call) => store.dispatch(showIncomingCallToast(call)),
  onCallStarted: (call) => store.dispatch(setActiveCall(call)),
  onCallEnded: (call) => recordCallActivity(call),
});

// In a React component:
function PhoneButton({ number, leadId, jobId }) {
  return (
    <button onClick={() => dialpad.dial(number, { leadId, jobId })}>
      <PhoneIcon /> Call
    </button>
  );
}
```

The `leadId` / `jobId` passed at dial time becomes context the CRM uses to attribute the call when it completes (Section 12.5.3).

#### 12.5.2 Inbound calls (screen pop)

When someone calls Rosecrest, Dialpad fires a `dialpad.incoming_call` event into our SDK. The CRM:

1. Receives the event with the caller's phone number
2. Searches `Customer` by phone (with normalization — strip spaces, normalize to E.164)
3. If a match is found: triggers a **screen pop** — the lead detail page slides in from the right, populated with the matched customer's full context (open jobs, last activity, payment status). Ops sees who's calling and their situation before they answer.
4. If no match: shows a "Caller not in system" notification with the number, with a "Create new lead" button
5. The user accepts or rejects the call inside the iframe

```ts
dialpad.on('incomingCall', async (call) => {
  const customer = await findCustomerByPhone(call.fromNumber);
  if (customer) {
    router.push(`/customers/${customer.id}`);
    showToast(`📞 ${customer.firstName} ${customer.lastName} is calling`);
  } else {
    showToast(`📞 Unknown caller: ${call.fromNumber}`, {
      action: { label: 'Create lead', onClick: () => router.push(`/leads/new?phone=${call.fromNumber}`) }
    });
  }
});
```

#### 12.5.3 Call logging (webhook + Activity creation)

Every completed call (inbound or outbound) is logged as an Activity on the relevant Lead/Job. This is the part that was already in the original spec — it stays, but it's now Layer 3, not the whole integration.

**Two paths feed call logs into the platform:**

**Path A: SDK in-browser event** (fast path)
- When a call ends, the SDK fires `callEnded` with duration, direction, and a `callId`
- If the call had `leadId` / `jobId` context (because we set it at dial time), the Activity is created immediately and attached to that record

**Path B: Dialpad webhook** (authoritative path)
- Dialpad POSTs to `/intake/voice/DIALPAD` when a call completes server-side
- This is the source of truth — it includes the recording URL, transcript (if enabled), final duration, hangup reason
- The webhook handler attaches the recording and transcript to the Activity created by Path A (matched by `callId`)
- If no Activity exists yet (e.g. browser closed before the SDK fired), the webhook handler creates one and uses phone-number-matching to attribute it to a Lead/Job

**Activity record for a call:**

```prisma
// Activity.metadata for a call:
{
  callId: "dialpad_xyz789",
  direction: "OUTBOUND" | "INBOUND",
  fromNumber: "+447700900142",
  toNumber: "+447100000000",
  durationSeconds: 132,
  status: "completed" | "missed" | "voicemail" | "abandoned",
  recordingUrl: "https://dialpad.com/recordings/...",
  transcriptUrl: "https://dialpad.com/transcripts/...",
  transcriptText: "...",                         // optional inline copy
  userId: "user_barisuka",                       // the rep who took/made the call
  dialpadCallUrl: "https://dialpad.com/calls/..."
}
```

#### 12.5.4 Configuration and edge cases

| Scenario | Behavior |
|---|---|
| User without Dialpad seat tries to call | Phone button is disabled with tooltip: "Dialpad not configured for your account — ask an admin" |
| Iframe fails to load (Dialpad down, blocked by ad-blocker, etc.) | Phone buttons fall back to `dialpad://` URL scheme; toast warns: "Dialpad in-browser unavailable — opening desktop app" |
| Multiple users on the same CRM page during an inbound call | Only the user the call is routed to (per Dialpad's routing rules) gets the screen pop; others see nothing |
| Call recording disabled by Rosecrest policy for this customer | `recordingUrl` is null; UI shows "Recording disabled per privacy preference" |
| Caller's number normalizes ambiguously (e.g. matches two customers) | Show a "Pick caller" toast with both candidates; ops picks one before answering |
| Customer is on the GDPR opt-out list | Outbound call button shows a warning: "Customer has opted out of marketing contact — confirm this call is for a transactional purpose" |

#### 12.5.5 What this requires from the client

- **Dialpad Pro Flex Plan or higher** — confirmed in client doc
- **CTI integration access** — Dialpad enables this per customer; needs to be requested from Dialpad support
- **OAuth credentials or SSO setup** — for the iframe to authenticate users
- **Webhook signing secret** from Dialpad for the `/intake/voice/DIALPAD` endpoint
- **Recording consent disclosure** — UK law requires informed consent for call recording; the disclosure copy must be configured per Rosecrest's policy

#### 12.5.6 Build effort

Implementing this fully is **~1.5–2 weeks** of focused work (sits inside Phase 4 — Integrations). Breakdown:

- Embed iframe + auth wiring: 2 days
- CTI SDK integration + event handling: 3 days
- Phone button component + dial flow: 1 day
- Incoming call screen pop + phone-number-matching: 2 days
- Webhook handler + Activity creation + recording attachment: 2 days
- Edge case handling + fallbacks: 2 days
- Testing across browsers (Chrome, Safari — Firefox has WebRTC quirks worth verifying): 1 day

### 12.6 Pinlocal webhook
- HMAC signature verification (secret in env)
- Payload schema: **TO BE CONFIRMED FROM ACTUAL PINLOCAL SAMPLE**
- If actual payload differs from documented schema, log the divergence and adapt mapping

---

## 12.7 Operational workflow triggers (must-have automations)

These are non-negotiable automation rules baked into the platform. They live as **seeded workflows** in the workflow builder (Section 10.7) so admin users can inspect and edit them, but they ship pre-built.

### Surveyor assignment notification
- **Trigger:** `Job.assignedToId` changes to a Surveyor user
- **Action:** Send email + in-app notification to the assigned surveyor with job details, property address, customer contact, inspection date (if set), and access notes
- **Rationale:** Surveyors can't deliver SLAs if they don't know they've been assigned

### Payment confirmation (Stripe)
- **Trigger:** Stripe `payment_intent.succeeded` webhook
- **Action:** Send acknowledgement email + SMS + WhatsApp to customer; transition Job to `PAID`; stop all chase cadence; create `Request Access` task assigned to ops
- **Latency:** All communications fire within 60 seconds of webhook receipt

### Payment confirmation (manual bank transfer)
- **Trigger:** Ops user marks `Payment.status = PAID` manually with `paymentMethod = BANK_TRANSFER`
- **Action:** Same as Stripe path — send acknowledgement, stop cadence, create access task
- **Rationale:** The customer experience must be identical regardless of payment method; ops staff often forget to communicate after manual reconciliation

### Inspection day-before reminder (unpaid jobs)
- **Trigger:** Job inspection date is exactly 24 working hours away **and** `Payment.status !== PAID`
- **Action:** Send email + SMS to customer with payment link and warning that inspection cannot proceed unpaid; alert ops to call customer
- **Rationale:** Catches the "scheduled but unpaid" edge case before a surveyor wastes a site visit

### Inspection day-before reminder (paid jobs)
- **Trigger:** Job inspection date is exactly 24 hours away **and** `Payment.status === PAID`
- **Action:** Send confirmation email + SMS to customer with surveyor name, arrival window, and access reminder; send reminder to assigned surveyor
- **Rationale:** Reduces no-shows on both sides

### Refund confirmation
- **Trigger:** Stripe `charge.refunded` webhook OR ops user marks `Payment.status = REFUNDED`
- **Action:** Send refund confirmation email to customer with refund amount and processing time; alert finance; create activity on Job
- **Rationale:** Refund without explicit confirmation is a top customer complaint source

### Access request after payment
- **Trigger:** Job stage transitions to `PAID` and no `vendorEmail`/`agentEmail` set
- **Action:** Send email + SMS + WhatsApp to customer requesting estate agent or vendor contact details with a structured reply form
- **Rationale:** This is the primary cause of post-payment delays in current Sales Igniter workflow

### Agent details captured → access request
- **Trigger:** Ops user fills `Job.agentEmail` (or `Job.vendorEmail`)
- **Action:** Send access-request email to the agent/vendor with property details, requested inspection windows, key collection instructions; transition Job to `ACCESS_REQUESTED`

### Inspection complete → chase report upload
- **Trigger:** Job stage transitions to `INSPECTION_COMPLETE`
- **Action:** Create internal task `Chase Report Upload` assigned to ops, due 24 working hours later
- **Rationale:** Detects surveyors who completed inspection but haven't uploaded data yet

### Report deadline approaching
- **Trigger:** `reportInternalDeadline` is exactly 4 working hours away **and** `reportStatus !== DELIVERED`
- **Action:** Reminder email to assigned surveyor + ops
- **Rationale:** Last chance to chase before internal deadline burns

### Lost reason captured
- **Trigger:** Lead transitions to `LOST`
- **Action:** If lost reason is `DND_REQUESTED`, set `Customer.marketingOptIn = false` and log opt-out; archive lead; do not send any further communication
- **Rationale:** Honouring opt-out is a GDPR requirement, not a courtesy

---

## 13. Frontend (Next.js App Router)

The CRM UI is a **thin client**: it renders state returned by the API and sends commands back as HTTP requests. It does not implement business rules that belong in the API (stage transition validation, intake normalization, audit logging, etc.).

### 13.1 Route map
```
/                       → redirect to /dashboard or /login
/login
/dashboard              → role-appropriate landing
/leads                  → leads list with filters
/leads/[id]             → lead detail (timeline, messages, actions)
/leads/new              → manual lead creation
/jobs                   → jobs list with filters
/jobs/[id]              → job detail
/jobs/[id]/inspection   → inspection booking interface
/jobs/[id]/report       → report drafting interface (link to external doc + status)
/inbox                  → unified message inbox
/templates              → template manager
/templates/[id]         → template editor with preview
/workflows              → workflow list
/workflows/[id]         → workflow canvas builder
/dashboards/sales
/dashboards/ops
/dashboards/sla
/dashboards/finance
/customers              → customer list (CRM view)
/customers/[id]         → customer profile + history
/settings               → system settings
/settings/users         → user management
/settings/sla           → SLA configuration
/settings/integrations  → integration credentials
/settings/templates     → template library
/audit                  → audit log viewer
```

### 13.2 Component library
- Tailwind for styling
- shadcn/ui for primitives (button, dialog, form, table, etc.)
- Lucide React for icons
- Recharts for dashboards
- React Hook Form + Zod for forms
- React Flow for workflow builder
- date-fns for date manipulation

### 13.3 Mobile considerations
- Surveyor view (`/jobs/[id]` and today's schedule) must be mobile-responsive
- Surveyor photo upload must work on mobile (file picker → upload to Supabase Storage)
- Other views can be desktop-first

### 13.4 Performance
- Use Next.js Server Components where possible
- Tables paginate at 50 rows
- Use `useTransition` for non-blocking filter changes
- Lazy load heavy components (workflow builder, dashboards)

---

## 14. Security and compliance

### 14.1 Data handling
- All data in transit: TLS 1.3
- All data at rest: AES-256 (Supabase default)
- PII fields: customer name, email, phone, property address — never logged in clear text
- Secrets in environment variables only, never in code
- Use Railway secret manager for production secrets

### 14.2 GDPR
- Consent capture: every lead form captures `marketingOptIn` explicitly
- Audit trail: every data change logged
- DSAR endpoint: `POST /api/v1/customers/:id/export` returns full data export (Admin+ only, logged as READ_SENSITIVE)
- Right to erasure: `DELETE /api/v1/customers/:id/erase` — anonymizes PII but retains audit trail of "deleted on X by Y"
- Data retention: configurable per entity type; default 6 years for completed jobs (industry standard), 12 months for lost leads

### 14.3 Rate limiting
- Login attempts: 5 per minute per IP, then escalating backoff
- API endpoints: 100 req/min per user
- Webhook endpoints: 1000 req/min per source IP (Pinlocal, Stripe, etc.)
- Use Express middleware (`express-rate-limit` with Redis store via Upstash)

### 14.4 Input validation
- Every endpoint validates with Zod before touching the database
- Reject 400 with descriptive error on validation failure
- Sanitize HTML in any user-provided rich text (use `isomorphic-dompurify`)

---

## 15. Testing strategy

### 15.1 Coverage targets
- Unit tests: ≥80% on `packages/integrations`, `packages/validation`, business logic in API
- Integration tests: every API endpoint, both happy path and failure modes
- E2E tests: top 10 critical user flows (lead creation, payment received, report delivery, SLA breach, workflow execution)

### 15.2 Test data
- Seed script (`pnpm db:seed`) creates: 1 SuperAdmin, 2 Ops, 3 Surveyors, 1 QC, 1 Finance, 20 sample customers, 30 leads in various stages, 15 jobs across all types, all standard templates and cadences
- Used for local dev, CI, and demo environments

### 15.3 CI
- GitHub Actions
- On every PR: typecheck, lint, unit tests, integration tests, build
- On main: deploy to staging
- On release tag: deploy to production

---

## 16. Build phases (DO IN THIS ORDER)

### Phase 1 — Foundation (Week 1–2)
- [ ] Monorepo scaffolding (pnpm + Turborepo)
- [ ] Prisma schema + migrations
- [ ] Supabase project setup (DB + Auth + Storage)
- [ ] Express API skeleton with auth middleware
- [ ] Next.js app skeleton with login flow
- [ ] CI pipeline
- [ ] Deploy hello-world to Railway + Netlify

### Phase 2 — Core domain + webhook intake foundation (Week 3–5)
- [ ] **`WebhookEvent` + `WebhookDelivery` tables and storage layer** (Section 6.5)
- [ ] **Universal intake endpoint scaffolding** (`/intake/:area/:source`)
- [ ] **`SourceAdapter` interface + registry pattern** with `version` field per adapter (Section 6.5.9-D)
- [ ] **Signature verification framework** (HMAC, Stripe, generic)
- [ ] **Idempotency check middleware** for all intake routes
- [ ] **`LeadInputSchema` (and `PaymentInputSchema`, etc.) canonical Zod contracts** (Section 6.5.9-C) — every adapter's normalize() must end with `.parse()`
- [ ] **DB unique constraints** to enforce idempotency at the database layer (e.g. `@@unique([source, sourceRef])` on Lead)
- [ ] **`DIRECT` adapter** (admin UI calls `/intake/leads/DIRECT` — never a separate endpoint)
- [ ] **Replay endpoint with `?mode=dry-run|safe|full`** (Section 6.5.9-A); UI surfaces age warning on events >72h old
- [ ] **Header sanitization** before storing `rawHeaders` (strip Authorization, Cookie, provider secrets)
- [ ] **Webhook archive job** — daily 03:00 UK; moves `PROCESSED` payloads to cold storage per retention policy (Section 6.5.9-B)
- [ ] **Validation failure alerting** — daily summary of `REJECTED` events grouped by source
- [ ] Lead CRUD + listing + filtering
- [ ] Customer CRUD
- [ ] Job CRUD + stage transitions
- [ ] Activity logging (auto on every change)
- [ ] Audit log
- [ ] User management
- [ ] RBAC enforcement
- [ ] Lead-to-Job conversion

### Phase 3 — Messaging foundation (Week 6–7)
- [ ] Resend integration + send abstraction
- [ ] Twilio SMS integration
- [ ] Twilio WhatsApp integration (template list + send)
- [ ] MessageTemplate CRUD + editor with preview
- [ ] Merge field rendering
- [ ] Delivery webhooks (Resend, Twilio)
- [ ] Suppression list / opt-out handling

### Phase 4 — Cadence engine (Week 8–9)
- [ ] Cadence + CadenceRun models
- [ ] QStash integration
- [ ] Cadence trigger on lead creation
- [ ] Stop condition checks
- [ ] Default homebuyer cadence seeded
- [ ] Manual stop / pause / resume

### Phase 5 — Payments (Week 10)
- [ ] Stripe integration (Payment Links, webhooks)
- [ ] Signature verification
- [ ] Payment received → stage transition + cadence stop
- [ ] Refund handling

### Phase 6 — Source adapters (Week 11)
> The endpoints already exist from Phase 2 — this phase adds the source-specific adapter implementations.
- [ ] `pinlocalAdapter` with HMAC verification + payload mapping
- [ ] `compareMyMoveAdapter` (when payload sample available)
- [ ] `reallyMovingAdapter` (when payload sample available)
- [ ] `getASurveyorAdapter` (when payload sample available)
- [ ] `websiteAdapter` for site form submissions
- [ ] `partyWallAdapter` for Party Wall Generator tool
- [ ] `dialpadAdapter` for call event ingestion (webhook → Activity creation)
- [ ] Inbound SMS reply handling via `twilioInboundAdapter` (STOP, etc.)
- [ ] Admin webhook event browser (`GET /admin/webhook-events`)
- [ ] Replay UI for failed events

### Phase 6.5 — Dialpad embedded dialer (Week 12)
> See Section 12.5. Tightly scoped — this is the in-browser calling experience, not just call logging.
- [ ] User schema fields: `phoneEnabled`, `dialpadUserId`
- [ ] Embed Dialpad CTI iframe as persistent right sidebar; OAuth/SSO auth flow
- [ ] Dialpad CTI JavaScript SDK integration with event handlers (`onReady`, `onIncomingCall`, `onCallStarted`, `onCallEnded`)
- [ ] `<PhoneButton>` React component used everywhere a phone number is rendered
- [ ] Outbound dial flow with `leadId` / `jobId` context attached
- [ ] Inbound call screen pop with phone-number-matching to Customer
- [ ] Unknown caller toast with "Create new lead" action
- [ ] Activity creation on `callEnded` (Path A — fast)
- [ ] Webhook recording + transcript attachment to Activity (Path B — authoritative)
- [ ] Iframe load failure → `dialpad://` URL scheme fallback
- [ ] Cross-browser testing (Chrome, Safari; verify Firefox WebRTC quirks)
- [ ] Recording consent disclosure copy configured per Rosecrest policy

### Phase 7 — SLA engine (Week 13)
- [ ] Working-day calculator with UK bank holidays
- [ ] SLA deadline computation on inspection set
- [ ] SLA monitor scheduled job
- [ ] Escalation emails

### Phase 8 — Editable workflow builder with versioning (Week 14–20)

> **This is the largest single feature in the build.** The version-pinning contract in Section 10.8 is load-bearing — do not skip any of its requirements. Build incrementally; do not try to ship the canvas without versioning.

**Week 14 — Canvas foundation**
- [ ] React Flow canvas (pan, zoom, minimap, fit-to-view)
- [ ] Node palette with drag-and-drop
- [ ] Bezier edge connectors
- [ ] All 10 node types render correctly on canvas

**Week 15 — Configuration & persistence**
- [ ] Config panel (right side) for each node type with type-specific form
- [ ] Draft persistence (auto-save to `Workflow.draftNodes` / `draftEdges` every 5s)
- [ ] Load `activeVersion` into canvas when no draft exists; load draft when one does
- [ ] Inline real-time validation warnings (Section 10.8.6 checks)

**Week 16 — Versioning & publish flow**
- [ ] `WorkflowVersion` schema with immutable `nodes` / `edges`
- [ ] Publish flow: validate → create `WorkflowVersion` → update `Workflow.activeVersionId` → clear draft
- [ ] Confirmation modal with in-flight execution count and change note input
- [ ] Audit log entry on every publish
- [ ] Validation hard-blocks per Section 10.8.6 (orphans, dead ends, missing trigger, etc.)

**Week 17 — Execution engine (version-pinned)**
- [ ] `WorkflowExecution.workflowVersionId` pinning at execution start
- [ ] Engine loads node/edge data from pinned `WorkflowVersion`, never from `Workflow` directly
- [ ] Synchronous nodes (Send Email, Send SMS, Send WhatsApp, Update Record, Create Task, Webhook, End)
- [ ] QStash callbacks carry only `executionId` — engine re-loads pinned version on resume

**Week 18 — Wait, Branch, and Test Run**
- [ ] Wait node with QStash scheduling + resume from pinned version
- [ ] Branch node with condition expression evaluator (Zod-validated expressions)
- [ ] Test Run mode: executes against synthetic context, highlights current node on canvas in real time, suppresses all outbound side effects
- [ ] Test runs are clearly marked in the database with `isTestRun = true` and never trigger real messaging

**Week 19 — Versions UI & rollback**
- [ ] Versions tab on each workflow listing every published version with in-flight counts
- [ ] Read-only canvas view per past version
- [ ] Diff view comparing two versions side-by-side
- [ ] One-click "Restore as draft" and "Make active" (rollback) actions
- [ ] Live execution counts (computed from `WorkflowExecution.workflowVersionId`)

**Week 20 — Emergency migration & polish**
- [ ] Migration endpoint (`POST /api/v1/admin/workflow-executions/:id/migrate`) with mapping payload and validation
- [ ] Bulk migration UI with double-confirmation and required written reason
- [ ] Soft-delete on workflows; Purge action with execution-existence guard
- [ ] Activity log surfaces every workflow edit and migration with diff metadata
- [ ] Seed initial workflows (Section 10.7) as v1 of each pre-built workflow
- [ ] Documentation pass: in-app tooltips on every node type explaining purpose, config, merge fields available

### Phase 9 — Dashboards (Week 21–22)
- [ ] Sales dashboard
- [ ] Operations dashboard
- [ ] SLA dashboard
- [ ] Financial dashboard
- [ ] CSV export

### Phase 10 — Trade work module (Week 23) *(if confirmed in scope)*
- [ ] Trade-specific job stages and fields
- [ ] Site visit / quote workflow
- [ ] Crew scheduling view
- [ ] RAMS document upload
- [ ] Completion sign-off + customer signature capture
- [ ] Snagging tracking

### Phase 11 — Polish & launch (Week 24–26)
- [ ] Mobile responsive pass (especially surveyor view)
- [ ] Data migration from Sales Igniter
- [ ] User acceptance testing with Rosecrest team
- [ ] Documentation (user guide, admin guide, runbook)
- [ ] Training session
- [ ] Go-live

**Total: ~26 weeks (~6 months) for the full build including trade module, editable workflow versioning, and embedded Dialpad calling. Subtract 4–5 weeks if trade is deferred.**

---

## 17. Open questions for the human (do NOT proceed past Phase 1 without answers)

### ✅ Resolved (per updated client doc)
- **Salesforce path:** Superseded — building custom platform instead
- **Dialpad integration:** Pro Flex Plan in place; integration confirmed
- **Lead source URLs:** All six sources documented (Pinlocal, Compare My Move, Get A Surveyor, ReallyMoving, Website Enquiries, Party Wall Generator)
- **Email volume ceiling:** Salesforce 5K/day was the constraint that drove custom build; not relevant to current architecture
- **Pricing model:** Custom platform, no per-seat licensing
- **Workflow builder scope:** Editable visual canvas with version pinning (Section 10.8). Phase 8 expanded to 7 weeks accordingly.

### ❌ Still blocking — must resolve before Phase 2
1. **Pinlocal webhook payload:** Actual sample payload + auth/secret method. Documented schema is not enough — get a real captured webhook from a test lead.
2. **WhatsApp Business Account:** Already verified with Meta? If not, start that process **immediately** (2–6 week lead time independent of build).
3. **Sales Igniter data migration:** What format will the export be in? CSV, JSON, SQL dump? Confirm before Phase 11. *Note: credentials should never be shared in plain text — use a password manager or one-time link.*
4. **Trade services scope:** Confirmed in updated doc that trades are referenced but not scoped. Which specific trades? In-house or subcontracted? Phase 10 cannot start without this list.
5. **Sender domain DNS access:** Need ability to add SPF, DKIM, DMARC records to `rosecrestgroupltd.co.uk`.
6. **Sample report URL** for inclusion in quotation email templates.
7. **Brand assets:** Logo SVG, colour codes, font choices.
8. **SLA escalation recipients:** Named list of senior management to receive Late/Overdue alerts (per Section 11.3).
9. **Refund policy:** Who can authorise refunds in the platform? Is there an approval workflow needed, or can ops process directly?

---

## 18. Done definition

The platform is "done" for v1 launch when:
- [ ] All Phase 1–9 (+ 10 if trade in scope) tasks complete
- [ ] All tests passing
- [ ] Deployed to production
- [ ] Rosecrest team trained
- [ ] First real Pinlocal lead processed end-to-end successfully
- [ ] First real Stripe payment received and stage transitioned
- [ ] First real report delivered through the platform
- [ ] First SLA breach escalation fired correctly (on a deliberately-stalled test job)
- [ ] First workflow built by an Admin user in the visual canvas, activated, and executed successfully

**Anything less than this is not v1.**

---

## 19. Decisions log location

Every non-obvious technical decision goes in `/docs/DECISIONS.md` with format:

```
## YYYY-MM-DD: Title
**Context:** What problem we faced
**Decision:** What we chose
**Alternatives:** What we considered
**Trade-offs:** What we accepted
```

Start with these pre-decided entries:
- Why QStash over BullMQ for cadence
- Why Express over NestJS or Fastify
- Why Supabase over Postgres+self-hosted auth
- Why React Flow over building canvas from scratch
- Why monorepo over polyrepo

---

## 20. Runbook (for production issues)

Maintained in `/docs/RUNBOOK.md`. Covers:
- How to roll back a bad deployment
- How to manually replay a failed webhook
- How to manually stop a cadence
- How to handle a Twilio outage
- How to restore from database backup
- On-call escalation chain