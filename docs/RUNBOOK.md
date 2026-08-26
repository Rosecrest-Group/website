# Rosecrest Operations Platform — Runbook

## Roll back a bad deployment

1. **Netlify (CRM UI):** Deployments → select last known good deploy → Publish.
2. **Railway (API):** Deployments → rollback to previous image.
3. Verify `GET /health` returns 200 and login works.

## Replay a failed webhook

1. Open **CRM → Settings → Integrations** (Admin).
2. Filter by provider; open the failed event.
3. Use **Dry-run** first to inspect normalized payload.
4. Use **Safe replay** if duplicate lead check should apply; **Full replay** to force reprocessing.
5. Events older than 72h show an amber warning — confirm before full replay.

API: `POST /api/v1/admin/webhook-events/:id/replay?mode=dry-run|safe|full`

## Stop a cadence manually

1. Open the lead in CRM.
2. Use **Stop cadence** (or mark lost / convert — both stop automation).
3. API: `POST /api/v1/leads/:id/stop-cadence` with optional `{ "reason": "..." }`.

## Twilio outage

- Outbound SMS/WhatsApp will fail; messages stay `FAILED` in DB.
- Pause cadences on affected leads if prolonged.
- Resume sending when Twilio status is green; no automatic retry of failed steps unless replayed manually.

## Resend / email outage

- Transactional emails queue as failed in `Message` table.
- Payment acknowledgements may fail silently (logged); verify job payment state in CRM.

## SLA monitor not firing

1. Confirm QStash cron hits `POST /api/v1/webhooks/qstash` with `{ "type": "sla_monitor" }`.
2. Manual run: **SLA dashboard → Run monitor** or `POST /api/v1/dashboards/sla/run-monitor`.
3. Check `sla.escalation_recipients` in `SystemSetting`.

## Pipeline scoring / daily call brief

- Board order is expected-value scoring (`PIPELINE_SCORING_ENABLED`, default on). Set `false` to restore rotting-then-quote order.
- Daily brief fires from the `sla_monitor` cron after 08:00 Europe/London on weekdays, and is also self-scheduled as `{ "type": "daily_call_brief" }`.
- LLM extraction of inbound email/SMS/call text needs `OPENAI_API_KEY`. Without it, ranking still works from structured fields only.
- Fit check (live `Lead` rows only, no dump tables): `npm run score:backtest` in the API repo.

## Database backup restore

1. Use Supabase dashboard → Database → Backups.
2. Restore to a staging project first; verify Prisma migrations match.
3. Re-point `DATABASE_URL` only after validation.

## On-call escalation

1. Check Better Stack / Sentry for API errors.
2. Verify Railway logs and recent webhook `FAILED` counts in Integrations admin.
3. Escalate to platform owner if payment or lead intake is blocked > 30 minutes.
