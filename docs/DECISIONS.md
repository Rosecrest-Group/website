# Architecture decisions log

## 2026-06-02: QStash over BullMQ for cadence and workflow delays

**Context:** Lead cadence and workflow Wait nodes need reliable delayed execution.

**Decision:** Use Upstash QStash HTTP callbacks to `/api/v1/webhooks/qstash`.

**Alternatives:** BullMQ + Redis worker process.

**Trade-offs:** Simpler ops (no dedicated worker for delays); dependent on QStash availability and HTTP idempotency.

## 2026-06-02: Express over NestJS / Fastify

**Context:** API surface is route-oriented with Prisma; team wanted minimal framework ceremony.

**Decision:** Express 4 with TypeScript, modular routers.

**Alternatives:** NestJS (DI/modules), Fastify (performance).

**Trade-offs:** Less structure out of the box; faster to ship for a small team.

## 2026-06-02: Supabase for Postgres + Auth

**Context:** Need EU-hosted Postgres, email/password auth, optional TOTP 2FA.

**Decision:** Supabase Auth + Postgres; Prisma as ORM in `api/` only.

**Alternatives:** Self-hosted Postgres + custom auth.

**Trade-offs:** Vendor coupling; CRM frontend never touches DB directly.

## 2026-06-02: React Flow for workflow canvas

**Context:** Admins need a visual, version-pinned workflow builder.

**Decision:** `@xyflow/react` for canvas; custom execution engine with `WorkflowVersion` pinning.

**Alternatives:** Build canvas from scratch; Retool-style external tool.

**Trade-offs:** Custom engine maintenance; full control over versioning contract.

## 2026-06-02: Flat monorepo layout (not Turborepo packages)

**Context:** PRD specifies `apps/` + `packages/`; repo uses `api/` + `app/crm/` + `crm/` at root.

**Decision:** Keep flat layout for this project; shared types in `crm/types` and `api` only.

**Alternatives:** Full Turborepo migration.

**Trade-offs:** Simpler local dev; differs from PRD folder names only cosmetically.
