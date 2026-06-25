# Rosecrest CRM — Admin guide

## Roles

| Role | Capabilities |
|------|----------------|
| Super Admin | All settings, user purge, workflow purge, bulk migration |
| Admin | Workflows, templates, integrations, user management |
| Ops | Leads, jobs, messaging, cadence control |
| Finance | Read + export + payment links |
| Surveyor / Trade | Assigned jobs and schedule only |

## User setup

1. Create user in database / seed script with Supabase-linked email.
2. Set `phoneEnabled` and `dialpadUserId` for CTI users.
3. Enforce 2FA for Admin/Super Admin via Supabase MFA.

## Lead sources (webhooks)

| Source | Endpoint |
|--------|----------|
| Pinlocal | `POST /api/v1/intake/leads/PINLOCAL` |
| Compare My Move | `POST /api/v1/intake/leads/COMPARE_MY_MOVE` |
| ReallyMoving | `POST /api/v1/intake/leads/REALLYMOVING` |
| Get A Surveyor | `POST /api/v1/intake/leads/GET_A_SURVEYOR` |
| Website (homebuyer booking) | `POST /api/v1/intake/leads/WEBSITE` |
| Website contact form | `POST /api/v1/intake/leads/WEBSITE_CONTACT_FORM` |
| Party Wall Tool | `POST /api/v1/intake/leads/PARTY_WALL_TOOL` |
| Manual (CRM) | `POST /api/v1/intake/leads/DIRECT` (authenticated) |

Configure HMAC secrets in API env: `PINLOCAL_WEBHOOK_SECRET`, `COMPARE_MY_MOVE_WEBHOOK_SECRET`, etc.

**Pinlocal:** Register your public intake URL with Pinlocal (must match `PINLOCAL_WEBHOOK_URL` exactly for signature verification). Pinlocal sends `multipart/form-data` or JSON with header `X-Pinlocal-Signature` (HMAC-SHA1, base64). The API responds with HTTP **200** on success (Pinlocal retries on other status codes). Webhook key comes from Pinlocal partner settings, not GHL.

**ReallyMoving:** Register **Push URL** in partner admin → Notification of leads. Use your **partner API key** as `REALLYMOVING_WEBHOOK_SECRET`. Signature: `HMAC-SHA256(api_key, timestamp + token)` in the POST body. HTTP **200** on success.

## Integrations admin

**Settings → Integrations**

- Browse webhook events by provider.
- Replay failed events (dry-run / safe / full).
- Run archive job for stale processed payloads.
- View validation summary (rejected events by provider).

## Workflows

- **Publish:** Validates graph (trigger, no orphans, dead ends).
- **Versions:** Restore as draft or rollback active version.
- **Diff:** Compare two published versions on the Versions tab.
- **Migrate:** Emergency move of in-flight execution to new version with explicit node ID mapping.

## Stripe

- Webhook: `POST /api/v1/intake/payments/stripe`
- Set `STRIPE_WEBHOOK_SECRET` and `STRIPE_SECRET_KEY`.
- Refunds update job `paymentStatus` to `REFUNDED`.

## SLA settings

Store in `SystemSetting`:

- `sla.escalation_recipients` — JSON array of emails for Late/Overdue alerts.

## Environment variables (API)

See `api/.env.example` for full list. Critical: `DATABASE_URL`, `SUPABASE_*`, `QSTASH_*`, `RESEND_API_KEY`, `TWILIO_*`, `STRIPE_*`, `DIALPAD_WEBHOOK_SECRET`.

## E2E tests in CI

Set `CRM_TEST_EMAIL` and `CRM_TEST_PASSWORD` for authenticated Playwright tests. Without them, only auth-guard smoke tests run.
