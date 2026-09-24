# Feature: Email campaigns

**Class:** feature

**Statement:** An ops user writes one email in the existing composer, sends it to leads that match the leads-list filters, and then sees who was delivered, who opened, who clicked, who bounced, and who unsubscribed.

**Primary actor:** OPS, ADMIN, or SUPER_ADMIN (the same roles that can open Leads).

**Slice 1:** From Email campaigns in the sidebar, create a draft, write the body in the existing composer, set stage and source, see the recipient count, preview it as one of those leads, send a test, send it, and open the sent campaign to see that it went out.

**Spec path:** docs/features/email-campaigns.md

## Analog

| Item | Fill |
|---|---|
| Feature class | Email campaign sender |
| Products (named by user, or searched this session) | HubSpot marketing email. Mailchimp regular email. The user did not name a product. |
| URLs fetched this session | https://knowledge.hubspot.com/marketing-email/create-and-send-marketing-emails . https://knowledge.hubspot.com/marketing-email/analyze-marketing-email-recipients . https://knowledge.hubspot.com/marketing-email/analyze-your-marketing-email-campaign-performance . https://mailchimp.com/help/create-and-send-regular-email/ . https://mailchimp.com/help/preview-and-test-your-email-campaign/ . https://mailchimp.com/help/create-and-send-to-a-segment/ |
| Default capabilities | List of emails with draft, scheduled, and sent. Create. Subject, preview text, from name, from address. Send to a segment. Do not send to an excluded segment. Audience count and why people were excluded. Preview as a contact. Plain text preview. Send a test. Review, then send now or schedule. Cancel a scheduled send. Unsubscribe link. Open tracking and click tracking on by default. Performance numbers for sent, delivered, open rate, click rate, bounce, and unsubscribe. Recipient list by event. Duplicate into a new draft. Delete a draft. |
| Analog flow — Entry | HubSpot: Marketing, then Email. Mailchimp: Create email, or Campaigns. Cite https://knowledge.hubspot.com/marketing-email/create-and-send-marketing-emails and https://mailchimp.com/help/create-and-send-regular-email/ |
| Analog flow — Land | The email index. Rows are drafted, scheduled, or sent emails. One-to-one thread messages are not on this list. Create email is the primary action. Cite the same HubSpot article and the mobile index tabs in https://knowledge.hubspot.com/marketing-email/manage-your-marketing-emails-using-the-hubspot-mobile-app |
| Analog flow — Next | Open a draft. Set recipients, including a do-not-send segment. Set subject, preview text, and from. Design the body. Preview as a contact and send a test. Review and send, or schedule. A sent email opens performance, including a recipients tab. Cite the HubSpot create article and https://knowledge.hubspot.com/marketing-email/analyze-marketing-email-recipients |

## Design analog

The CRM shell stays. This table is the campaign screen, mapped onto existing tokens (`bg-surface`, `text-ink`, `border-line`). Do not copy HubSpot chrome.

| Region | Analog (not this repo) |
|---|---|
| Chrome | Editor title is the internal email name, with a way back to the index. Primary action is Review and send, Review and schedule, or Send. Secondary action is Preview and test, in the top right. Index chrome is the title plus Create email. Cite https://knowledge.hubspot.com/marketing-email/create-and-send-marketing-emails |
| Columns | Editor has two work columns inside the CRM shell. The left column is recipients: send to, do not send to, the count, and exclusion reasons. The right column is the email (subject, preview text, from name, body). Setup fields that are not the audience do not live in the audience column. The index is one table, not the editor. |
| Land canvas | Index land is an empty table with Create email when there are no campaigns, and a filled table when there are. Editor land is a blank message in the existing composer, not a block dropzone. HubSpot picks a template and then edits. This repo's ceiling is the existing composer. |
| Preview | HubSpot puts Preview and test in the top right. Choosing Preview as contact replaces the work canvas with the rendered email for that contact. Plain text is a display option on that preview. Send test opens a panel for the address. Preview is not an always-on third column, and it is not only a toolbar label with no canvas. |
| Density | One primary column of writing (the composer) beside one audience column. Not one stacked card that holds filters, fields, and the body in a single narrow form. |

## Stack card

| Item | This repo |
|---|---|
| How UI talks to data | `crm/lib/api.ts` `request()` to Express `/api/v1`. No Next server actions. |
| Where new actions are registered | Router mounted from `api/src/app.ts`. Client methods on the `api` object in `crm/lib/api.ts`. Scheduled send is a new `body.type` on `POST /webhooks/qstash` in `api/src/routes/webhooks.ts`, using `scheduleCallback` in `api/src/integrations/qstash.ts`. |
| UI layer(s) | CRM web app, `app/crm` and `crm/components`. Public unsubscribe page with no CRM shell. |
| Where navigation lives | `CRM_NAV_SECTIONS` in `crm/lib/constants.ts`. Icon in `HREF_ICON` and `NAV_ICONS` in `crm/components/layout/CrmSidebar.tsx`. Path gate in `pathAllowed` in `crm/lib/rbac.ts`. |
| typecheck / lint / build / test commands | Root `npm run lint`. API `npm run build --prefix api` (tsc). `npm run test:api`. `npm run test:e2e` when the browser path is covered. |
| Browser UI? | yes |

## Already exists

| Kind | Name | Path |
|---|---|---|
| action/route | `POST /messages/send` and `sendMessage` | `api/src/routes/messages.ts`, `api/src/services/messaging/send.ts` |
| action/route | `POST /templates/:id/preview` | `api/src/routes/templates.ts` |
| action/route | `GET /leads` with stage, source, search | `api/src/routes/leads.ts` |
| action/route | Resend webhook for delivered, opened, bounced | `api/src/routes/webhooks.ts` |
| action/route | QStash callback dispatch | `api/src/routes/webhooks.ts`, `api/src/integrations/qstash.ts` |
| table/model | `Customer.email`, `marketingOptIn`, `optOutDate` | `api/prisma/schema.prisma` |
| table/model | `Message` as the email log | `api/prisma/schema.prisma` |
| table/model | `Lead` | `api/prisma/schema.prisma` |
| component | `MessageRichCompose` and `EmailRichEditor` | `crm/components/ui/MessageRichCompose.tsx` |
| component | `CrmPageHeader`, `CrmPageContent`, `CrmSidebar` | `crm/components/layout/` |
| component | Leads filters | `crm/components/LeadsList.tsx`, `crm/lib/usePersistedListFilters.ts` |
| job | QStash `scheduleCallback` | `api/src/integrations/qstash.ts` |
| notification template | None for campaigns. Do not store the campaign body as a `MessageTemplate`. `trigger` is required, and `sendTemplateByTrigger` sends the first match. A `lead.created` template also moves the lead to `QUOTE_SENT`. | `api/src/services/messaging/send.ts` |

## Out of scope

- Automated workflow emails, and blog or RSS emails. Those are other HubSpot sending methods.
- A/B and multivariate tests. Mailchimp treats those as a different touchpoint.
- Inbox screenshots across mail clients. HubSpot generates those through a separate preview service this repo does not have.
- SMS and WhatsApp campaigns.
- A block builder. The user asked for the existing composer.
- A global saved-segment library. Each campaign stores its own filter. A shared library was not asked.

## Invariants

- One customer receives a campaign at most once. Enforced by a unique constraint on `(campaignId, customerId)`, and by a unique `Message.campaignRecipientId` written in the same insert that happens before the Resend call. A second attempt fails at that insert.
- A customer with `optOutDate` set, or with any prior `Message` in status `BOUNCED`, is not sent. Enforced in the audience resolver in the campaign domain module. The UI count is not the enforcement.
- `marketingOptIn` is not required. The user chose this. Schema default is `false` (`Customer.marketingOptIn`).
- Only `draft` can be edited or deleted. Only `draft` or `scheduled` can start a send. `sent` is immutable. Enforced by a conditional update on `Campaign.status` in the domain module.
- Starting a send is idempotent. The status move from `draft` or `scheduled` to `sending` is one conditional update. A second start from `sending` only enqueues another drain. It does not change status. A scheduled fire also has to match `scheduleNonce`, so a cancelled fire updates zero rows.
- A crash mid-send does not send the same person twice. A pending row with no linked `Message` is safe to send. A pending row whose `Message` exists is settled from `Message.status`. A `Message` still `QUEUED` becomes failed and is not retried.
- OPS, ADMIN, and SUPER_ADMIN are the only roles that can call campaign routes. Enforced by `requireAuth` and `requireExactRoles(...LEAD_ACCESS_ROLES)` on the router. `pathAllowed` must list the page. Today an unknown CRM path returns true at the end of `pathAllowed`.
- A test send does not insert a `CampaignRecipient` and does not change `Campaign.status`.
- An unsubscribe token sets `optOutDate` and `marketingOptIn` to false. A second visit is a no-op.
- Click tracking does not wrap the unsubscribe URL.
- Campaign HTML is stored on the campaign. Send calls `sendMessage` with `subject`, `body`, and `htmlBody`, and without `templateId`.

## Actors

- Staff (OPS, ADMIN, SUPER_ADMIN). They enter from Email campaigns in the Automation section of the sidebar.
- Recipient (the lead's customer). They enter from the email in their inbox, then from a tracked link or the unsubscribe link.
- System. QStash fires a scheduled send in chunks. Resend webhooks update `Message` only. The recipient list derives delivery, open, and bounce from that `Message`. The click route records `firstClickedAt`.
- Field surveyor. Dropped. Surveyors are not in `LEAD_ACCESS_ROLES` and have no campaign job in this product.
- Separate admin actor. Dropped. Admin uses the same screen and the same role gate as OPS.

## Actor × lifecycle grid

| Stage (in this feature's terms) | Staff | Recipient | System |
|---|---|---|---|
| Create/configure | Create a draft. Set internal name, subject, preview text, from name, HTML body, send-to filter, and do-not-send filter. | N/A. They do not author the email. | N/A. Nothing creates a campaign on its own. |
| Publish/enable | Send now, or pick a date and time. The review step shows the recipient count and missing required fields. | N/A. They do not publish. | At `scheduledAt`, QStash calls the send worker. |
| Discover/access | Sidebar item Email campaigns. The index lists draft, scheduled, and sent campaigns. One-to-one thread messages are excluded. | The email arrives if they were in the resolved audience. Excluded people get nothing. | N/A. Discovery is the index and the inbox. |
| Act/submit | Send a test to an address they type. Confirm send or schedule. | Open, click a link, or unsubscribe. | Resolve the audience, insert recipient rows, call `sendMessage` once per pending row. |
| Confirm/deliver | The send button shows loading, then success or the error. The sent campaign shows how many were attempted. | The message is in the inbox. | One `Message` row per recipient, status moving QUEUED, SENT, then webhook status. |
| Use/fulfil/verify | Open the sent campaign. See rates and the recipient list by event. | Read the email. | Delivered and opened come from the Resend webhook. Clicks come from the redirect route. |
| Modify/revoke | Edit or delete a draft. Cancel a schedule, which returns the campaign to draft. Duplicate a campaign into a new draft. | Unsubscribe. | Cancel drops the QStash callback. Unsubscribe writes `optOutDate`. |
| Close/expire | A sent campaign cannot be edited or sent again. | N/A. The email does not expire. | When no `pending` rows remain, status becomes `sent`. Failed rows stay failed. They do not block `sent`. |
| Reconcile/report | Open rate, click rate, delivered, bounce, and unsubscribe on the sent campaign. | N/A. They have no report. | Counts are aggregates of recipient rows. |

## States

| Entity | Status | Shown on | Transitioned by | Blocked while in it |
|---|---|---|---|---|
| Campaign | draft | Index tab Draft. Editor. | Create, cancel schedule, duplicate. | Send is allowed. Delete is allowed. |
| Campaign | scheduled | Index tab Scheduled. Editor with the chosen time. | Staff schedule action. | Edit of body and filters is blocked. Cancel returns to draft. A second schedule is blocked. |
| Campaign | sending | Index, and the performance page with a progress count. | Send worker, after the conditional status update. | Edit, delete, schedule, and a second send are blocked. |
| Campaign | sent | Index tab Sent. Performance page. | Send worker, when no pending rows remain. | Edit, delete, and send are blocked. Duplicate is allowed. |
| Campaign | cancelled | Not a stored status. Cancel returns the row to draft. | Staff cancel. | N/A. |
| Recipient | pending | Performance, filter Pending, while sending. | Audience insert at the start of send. | A second send of this row is blocked by the unique customer constraint and the status check. |
| Recipient | sent | Recipients, filter Sent. | `sendMessage` success. | Not sent again. |
| Recipient | delivered | Recipients, filter Delivered. | Resend `email.delivered` on the linked `Message`. | N/A. |
| Recipient | opened | Recipients, filter Opened. | Resend `email.opened`, which sets `Message.status` to READ. | N/A. |
| Recipient | clicked | Recipients, filter Clicked. | Click redirect. | Unsubscribe URL is not a click. |
| Recipient | bounced | Recipients, filter Bounced. | Resend `email.bounced`. | Future campaigns skip this customer. |
| Recipient | failed | Recipients, filter Failed, with `failureReason`. | `sendMessage` throw, caught per recipient. | Not retried automatically in this version. |
| Recipient | skipped | Exclusion list on the review step, and Recipients filter Skipped. | Audience resolver. | No `Message` is created. |
| Recipient | unsubscribed | Recipients, filter Unsubscribed. | Public unsubscribe. | Future campaigns skip this customer because `optOutDate` is set. |

Skipped reasons the review step must show: opted out, prior bounce, also matched the do-not-send filter, duplicate customer (one lead kept).

## Table-stakes (build)

- [ ] Sidebar item Email campaigns under Automation, beside Templates. Staff. `crm/lib/constants.ts`, `crm/components/layout/CrmSidebar.tsx`, `crm/lib/rbac.ts`
- [ ] Index with Draft, Scheduled, and Sent, plus an empty state and Create. Staff. `app/crm/email-campaigns/page.tsx`
- [ ] Editor uses `MessageRichCompose` for the body. Staff. `crm/components/email-campaigns/`
- [ ] Subject, preview text, and from name. From address stays `RESEND_FROM`. Staff.
- [ ] Send-to filters match the leads page: stage, source, and search. Empty stage means active leads (excludes CONVERTED and LOST), same as `GET /leads`. Staff.
- [ ] Do-not-send filters use the same three fields. Staff.
- [ ] Recipient count and exclusion reasons before send. Staff.
- [ ] Same merge tokens the template editor inserts. Preview as a chosen lead renders them. Staff.
- [ ] Preview and test in the header. Preview replaces the composer column. Plain text is a toggle on that preview. Staff.
- [ ] Send test to an address the staff member types. It does not create a recipient row. Staff.
- [ ] Review step, then send now. The button shows loading, success, and error. Staff.
- [ ] Schedule for a date and time, fired by QStash. Cancel returns the campaign to draft. Staff and system.
- [ ] Open tracking through the existing Resend webhook, and click tracking through a redirect that then sends the browser to the original URL. System.
- [ ] Unsubscribe link and a public page on `CRM_PUBLIC_ROUTES`. Recipient.
- [ ] Performance page with delivered, open rate, click rate, bounce, and unsubscribe, plus a recipient list filtered by event. Staff.
- [ ] Duplicate into a new draft. Delete a draft. Staff.
- [ ] Sent campaign is read-only. Staff.
- [ ] Each recipient is a `Message` on the chosen lead, so the lead thread shows the send and the webhook can find the row. System.
- [ ] Index on `Message.providerMessageId`. System. `api/prisma/schema.prisma`
- [ ] Wrong role rejected on every campaign route. System.

## Optional — user answered

- Marketing opt-in gate. NO. Skip opted-out and hard-bounced leads only.
- Named segment library. Not asked, easy to add later.
- Assignee and created-after filters. The leads API accepts them. The leads page does not show them. Not asked, easy to add later.
- Dark mode preview. Not asked, easy to add later.
- Reply tracking on the performance page. Not asked, easy to add later.
- Send-time optimization and throttling. Not asked, easy to add later.

## Acceptance walkthrough

### Staff

1. Sign in as OPS. Confirm Email campaigns is in the sidebar under Automation. Open it. Confirm the empty state.
2. Create a campaign. Confirm the composer is the same rich email editor used on a lead. Set subject, preview text, and from name. Set stage and source. Confirm the count.
3. Add a do-not-send stage. Confirm the count drops and the exclusion reason is listed.
4. Choose Preview and test, then Preview as lead. Confirm the canvas shows the rendered HTML for that lead. Switch on plain text. Confirm the text version.
5. Send a test to your address. Confirm the button shows loading, then success. Confirm the campaign is still a draft and the recipient list is empty.
6. Review and send. Confirm the count on the review step. Send. Confirm the button shows loading, then the performance page.
7. Create a second draft and schedule it. Confirm it appears under Scheduled. Cancel it. Confirm it is a draft again.
8. On a sent campaign, confirm edit and send are unavailable. Duplicate it. Confirm a new draft opens.
9. Sign in as a role outside OPS, ADMIN, and SUPER_ADMIN. Confirm the API rejects a campaign request.

### Recipient

1. Open the test email and the live email. Confirm merge fields show the lead's name where a token was used.
2. Click a normal link. Confirm the browser lands on the original URL.
3. Click Unsubscribe. Confirm the public page says you are unsubscribed. Click it again. Confirm the page still says you are unsubscribed and does not error.
4. As staff, send another campaign that would include that customer. Confirm they appear as skipped, opted out.

### System

1. After the live send, confirm a `Message` exists per recipient and the lead thread shows it.
2. When Resend reports delivered and opened, confirm the recipient row and the rates move. This depends on the Resend webhook. If the local server has no webhook, record that the click was not observed.
3. Click a tracked link. Confirm a click row and that the unsubscribe link was not rewritten as a click.
4. Bounce a recipient if a webhook fixture exists. Confirm the customer has `optOutDate` set. This is existing bounce behavior when `leadId` is present.

## Wiring audit

| Surface (action / route / op) | Identifier UI would use | Grep hits (paste lines) | Consumer (UI file or webhook/job) |
|---|---|---|---|
| List and create | `api.listCampaigns`, `api.createCampaign` | | |
| Get and update | `api.getCampaign`, `api.updateCampaign` | | |
| Delete draft | `api.deleteCampaign` | | |
| Audience count | `api.campaignAudience` | | |
| Preview | `api.previewCampaign` | | |
| Test send | `api.sendCampaignTest` | | |
| Send now | `api.sendCampaign` | | |
| Schedule and cancel | `api.scheduleCampaign`, `api.cancelCampaign` | | |
| Duplicate | `api.duplicateCampaign` | | |
| Recipients | `api.listCampaignRecipients` | | |
| Click redirect | `GET /api/v1/campaigns/click/:token` | | Public redirect. No CRM UI. |
| Unsubscribe | `POST /api/v1/campaigns/unsubscribe/:token` | | `app/crm/unsubscribe/[token]/page.tsx` |
| Scheduled fire | QStash `body.type` `campaign_send` | | `api/src/routes/webhooks.ts` |
| Open, deliver, bounce | Existing `POST /webhooks/resend` | | Webhook updates `Message`, then the recipient row. |

- [ ] Every new surface has pasted UI grep hits (or a documented non-UI consumer)
- [ ] Hits are not only in the server/API package, tests, or generated types
- [ ] Every UI action hits a real surface with loading, success, and error
- [ ] New controls follow VISUAL_FEEDBACK.md (result on the control, allowed motion only, toast is extra)
- [ ] Analog-flow table filled from fetched URLs or user screenshot (Entry, Land, Next). Discover/access matches it. Not an in-repo dump page the analog does not use for this class.
- [ ] Design analog table filled (chrome, columns, land canvas, preview, density). Shipped UI matches those regions.
- [ ] Every status has a screen and a transition (or system-only, documented)
- [ ] Every actor has an entry point
- [ ] Wrong actor is rejected at server/policy on every new surface
- [ ] All table-stakes ticked with paths
- [ ] All YES answers ticked with paths
- [ ] Empty, error, expired, and unauthorized states are intentional
- [ ] New tables, migrations, permissions, env, and jobs are registered where this repo registers them
- [ ] typecheck, lint, build, and tests run (commands from the stack card). A green compile is not wiring.
- [ ] Browser walkthrough done, or "could not click: reason"

## Intentionally skipped

- Marketing opt-in gate. You chose to skip only opted-out and hard-bounced leads.
- Named segment library, assignee filter, created-after filter, dark mode preview, reply tracking, send-time optimization, and throttling. Not asked. Easy to add later.
- Automated sends, RSS, A/B tests, mail-client screenshots, SMS, WhatsApp, and a block builder. Different products, or the composer ceiling you named.
