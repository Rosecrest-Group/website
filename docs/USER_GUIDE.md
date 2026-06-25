# Rosecrest CRM — User guide (Ops)

## Signing in

Go to `/crm/login`. Use your Rosecrest email and password. Admins with 2FA enabled must enter a TOTP code after password.

## Dashboard

The home dashboard shows active leads, conversion rate, jobs awaiting payment, and SLA breach count. Export CSV from the dashboard actions.

## Leads

- **List:** Filter by stage and search by name, email, or property.
- **New lead:** Manual entry uses the same pipeline as external sources (DIRECT intake).
- **Detail:** Move stage, pause/resume cadence, mark lost, convert to job.
- **Phone:** Click any phone number to dial via Dialpad (if enabled on your user).

## Jobs

- Create from converted leads with agreed amount.
- **Payment link:** Generates Stripe link; **Mark paid** for bank transfer.
- **Survey jobs:** Set inspection date to compute SLA deadlines.
- **Trade jobs:** Use trade workflow card for stages, work dates, RAMS documents, snagging, and sign-off.

## Inbox

Unified threads for email/SMS/WhatsApp linked to leads. Reply using templates where configured.

## Schedule (trade)

Crew-grouped view of trade jobs for the next 30 days. Tap a job to open details.

## Templates

Select a template to edit body/subject and preview with sample merge fields. Save updates for Admin users.

## Workflows

Visual builder: drag nodes, connect edges, configure in the right panel. **Publish** creates an immutable version. In-flight runs stay on their pinned version until migrated.

## SLA dashboard

Jobs at risk, late, and overdue. Admins can run the SLA monitor manually for testing.

## Getting help

See [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) for integrations and [RUNBOOK.md](./RUNBOOK.md) for incidents.
