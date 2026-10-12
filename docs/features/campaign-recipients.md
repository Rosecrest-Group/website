# Feature: Campaign recipients

**Class:** feature

**Statement:** An ops user opens a campaign that was sent to one or more lists and sees every person it includes, at the email level, then opens one person and reads the thread so they can call or send a follow-up.

**Primary actor:** OPS, ADMIN, or SUPER_ADMIN (the same roles that can open campaigns and leads).

**Slice 1:** Open a sent campaign, land on the people it was sent to (one row per email, across every list), click a row, and either the existing lead page or a contact thread opens so they can call or send a follow-up.

**Spec path:** docs/features/campaign-recipients.md

## Analog

| Item | Fill |
|---|---|
| Feature class | Campaign recipient list that opens a conversation |
| Products (named by user, or searched this session) | HubSpot marketing email recipients. lemlist campaign lead list and inbox. The user did not name a product. They described the existing lead page as the screen a row opens. |
| URLs fetched this session | https://knowledge.hubspot.com/marketing-email/analyze-marketing-email-recipients . https://help.lemlist.com/en/articles/8000399-understand-lead-statuses . https://help.lemlist.com/en/articles/10035229-use-the-lemlist-inbox |
| Default capabilities | Recipients tab on a sent email. One row per contact, not per source list. Event filters: sent, delivered, opened, clicked, replied, bounced, unsubscribed, not sent. A contact can match more than one event. Expand or open the contact to see what happened. Reply from the conversation. Call while the thread is on screen. Status on the row. Search is required to find one person in a large list. Source list on the row (you asked for this). CSV export (you declined). |
| Analog flow — Entry | HubSpot: Marketing, then Email, then the name of a sent email, then the Recipients tab. Cite https://knowledge.hubspot.com/marketing-email/analyze-marketing-email-recipients |
| Analog flow — Land | The contacts who were part of this email. Source lists are not the rows. People who were never in this send are excluded. An event in the left column narrows the list. Cite the same HubSpot article. |
| Analog flow — Next | Pick an event. Open one contact. Read the emails. Reply or call. Cite the HubSpot recipients article and https://help.lemlist.com/en/articles/10035229-use-the-lemlist-inbox |

## Design analog

The CRM shell stays. Tokens stay `bg-surface`, `text-ink`, `border-line`, `bg-brand-muted`.

| Region | Analog (not this repo) |
|---|---|
| Chrome | Sent email name, with a way back to the email index. Recipients is the land for a sent email. The email itself is one tab away. No send action on a sent email. Cite https://knowledge.hubspot.com/marketing-email/analyze-marketing-email-recipients |
| Columns | Two work columns. The left column is the event list (All, Queued, Sent, Delivered, Opened, Clicked, Replied, Bounced, Unsubscribed, Not sent) with counts. The right column is the people table. The email body is not in either column. The person screen, when they are not already a lead, copies the lead page: identity and call on the left, thread and follow-up on the right. |
| Land canvas | A filled people table. Empty when the event matches nobody, or when the campaign has no recipient rows. A draft has no recipient rows, so this screen is not the draft editor. |
| Preview | HubSpot expands a contact's events. This screen opens the person. The thread is the next page, not a hidden toolbar preview and not an always-on third column on the list. |
| Density | One event column beside one table. The person page is two columns. Not one stacked card of filters and fields. |

## Stack card

| Item | This repo |
|---|---|
| How UI talks to data | `crm/lib/api.ts` `request()` to Express `/api/v1`. |
| Where new actions are registered | `api/src/routes/campaigns.ts`, mounted from `api/src/app.ts`. Client methods on `api` in `crm/lib/api.ts`. |
| UI layer(s) | CRM web app, `app/crm` and `crm/components`. |
| Where navigation lives | Existing Email campaigns nav. The recipients screen is a tab on the campaign. The person screen is `/crm/email-campaigns/recipients/[id]`. A person who already has a lead opens `/crm/leads/[id]`. |
| typecheck / lint / build / test commands | Root `npm run lint`. API `npm run build --prefix api`. `npm run test:api`. |
| Browser UI? | yes |

## Already exists

| Kind | Name | Path |
|---|---|---|
| action/route | Campaign CRUD and send | `api/src/routes/campaigns.ts`, `api/src/services/campaigns/lifecycle.ts` |
| action/route | `POST /messages/send` | `api/src/routes/messages.ts`, `api/src/services/messaging/send.ts` |
| action/route | Lead thread | `GET /messages?leadId=`, `crm/components/LeadMessageThread.tsx` |
| action/route | Dialpad call | `PhoneButton`, `POST /dialpad/calls/initiate` |
| table/model | `CampaignRecipient`, `Message.campaignRecipientId` | `api/prisma/schema.prisma` |
| table/model | `ContactList`, `ContactListMember` | `api/prisma/schema.prisma` |
| component | Lead page (call, thread, follow-up) | `crm/components/LeadDetail.tsx` |
| component | `Table`, `StatusPill`, `MessageRichCompose`, `PhoneButton` | `crm/components` |
| job | None new. Send already writes recipient rows. | |
| notification template | None. Follow-up uses `sendMessage`, not a template. | |

A listed page is a call target. The lead page is where a recipient goes when `leadId` is set. It is not the recipients list.

## Out of scope

- Turning every recipient into a survey lead. A follow-up to someone without a lead stores the email on that address. An inbound reply still creates a lead the way it already does.
- A new global inbox.
- CSV export. You declined it.
- Bulk email from the recipient list. That is another campaign.
- Editing a sent campaign.
- Interest labels and spam-report status. Spam reports are not stored.

## Invariants

- One email appears once per campaign. Enforced by `@@unique([campaignId, email])` on `CampaignRecipient`. The list reads those rows. It does not union list membership at read time.
- A follow-up is refused when the customer has `optOutDate` or this address has `unsubscribedAt`. Enforced in `sendRecipientFollowUp` before `sendMessage`. The button is not the enforcement.
- OPS, ADMIN, and SUPER_ADMIN are the only roles that can list recipients or send a follow-up. Enforced by `requireAuth` and `requireExactRoles(...LEAD_ACCESS_ROLES)` on `campaignsRouter`.
- A draft has no recipient rows until send starts. The recipients tab is not shown on a draft.
- Follow-up does not insert another `CampaignRecipient`. It inserts a `Message` through `sendMessage`.

## Actors

- Staff (OPS, ADMIN, SUPER_ADMIN). They enter from Email campaigns, then a sent, sending, or scheduled campaign.
- Recipient. They do not get a new screen. They already receive the campaign email and can reply or unsubscribe.
- System. Recipient rows, delivery, opens, clicks, and bounces already exist. This feature reads them. A follow-up calls `sendMessage`.
- Field surveyor. Dropped. Surveyors are not in `LEAD_ACCESS_ROLES`.
- Separate admin actor. Dropped. Admin uses the same screen and the same role gate.

## Actor × lifecycle grid

| Stage (in this feature's terms) | Staff | Recipient | System |
|---|---|---|---|
| Create/configure | N/A. The campaign and its lists already exist. | N/A. | N/A. Send already inserts recipient rows. |
| Publish/enable | N/A. Sending stays on the campaign editor. | N/A. | N/A. |
| Discover/access | Open a sent, sending, or scheduled campaign. Land on Recipients: one row per email. Drafts stay on the editor. | N/A. They are not browsing the CRM list. | N/A. |
| Act/submit | Filter by event, search, click a row. Call, or send a follow-up. | N/A. | N/A. |
| Confirm/deliver | The follow-up button shows sending, then sent or the error. The new email appears in the thread. | The follow-up arrives in their inbox. | `sendMessage` writes one `Message`. |
| Use/fulfil/verify | Read the thread, including the campaign email and later replies. | N/A. | Inbound mail already attaches to a lead when one exists, and creates one when a stranger replies. |
| Modify/revoke | N/A. Unsubscribe already exists. Staff do not delete a recipient row. | Unsubscribe still opts them out. A later follow-up is refused. | `optOutDate` / `unsubscribedAt` block the follow-up. |
| Close/expire | A sent campaign stays readable. | N/A. | N/A. |
| Reconcile/report | Counts on the event column: sent, delivered, opened, clicked, replied, bounced, unsubscribed, not sent, queued. | N/A. | Counts are derived from recipient rows and inbound messages. They are not a second stored tally. |

## States

| Entity | Status | Shown on | Transitioned by | Blocked while in it |
|---|---|---|---|---|
| Campaign | draft | Editor only. No recipients tab. | Existing create flow. | Recipients are not listed. |
| Campaign | scheduled, sending, sent | Recipients tab, selected by default. Email tab shows the locked body. | Existing send flow. | Body edit stays blocked by the existing campaign rules. |
| Recipient | queued | All, and Queued. Label Queued. | Row inserted as PENDING. | Not a follow-up target until there is an email address. |
| Recipient | sent, delivered, opened, clicked | Matching event column. Label is the strongest of those. | Existing send and Resend webhook. | N/A. |
| Recipient | replied | Replied column, and as the row label when they have replied. | Inbound email from that address after the campaign started. | N/A. |
| Recipient | bounced | Bounced column. | Existing bounce on `Message` or `failureReason`. | Future campaigns already skip them. |
| Recipient | unsubscribed | Unsubscribed column. | Existing unsubscribe. | Follow-up is refused. |
| Recipient | not sent | Not sent column. Label is the skip reason or Failed. | Audience resolver, or a send throw. | No campaign `Message` for a skip. |
| Person | has lead | Click opens `/crm/leads/:id`. | `CampaignRecipient.leadId`, or a later inbound reply. | N/A. |
| Person | no lead | Click opens the contact thread. | List import with no lead. | Mark-won and workflow actions are not on this page. |

## Table-stakes (build)

- [x] Recipients tab on a scheduled, sending, or sent campaign, selected by default. Staff. `crm/components/email-campaigns/CampaignEditor.tsx`
- [x] Left column of events with counts, right column of people. Staff. `crm/components/email-campaigns/CampaignRecipients.tsx`
- [x] One row per recipient email. Name, email, lists, status. Staff.
- [x] Search by name or email. Staff.
- [x] Click a row with a lead opens that lead. Back returns to the campaign when opened from here. Staff. `crm/components/LeadDetail.tsx`
- [x] Click a row with no lead opens a two-column thread: identity and call, then the emails and a follow-up composer. Staff. `crm/components/email-campaigns/RecipientConversation.tsx`
- [x] Follow-up button shows sending, sent, and error. Staff.
- [x] Empty list, empty event, load error, missing person, opted out. Staff.
- [x] Wrong role rejected on the campaign router. System. `api/src/routes/campaigns.ts`

## Optional — user answered

- [x] Source list column — YES — `crm/components/email-campaigns/CampaignRecipients.tsx`
- CSV export — NO
- Bulk follow-up from the list — not asked, easy to add later
- Interest labels — not asked, easy to add later

## Acceptance walkthrough

### Staff

1. Open Email campaigns and open a sent campaign that went to more than one list. Confirm Recipients is showing, with one row per email, and a Lists column.
2. Confirm someone who was on two of those lists appears once, with both list names.
3. Choose Replied, then Sent, then Not sent. Confirm the table changes and the selected event stays highlighted.
4. Search for a name. Confirm the table narrows. Clear the search.
5. Click someone who has a lead. Confirm the lead page opens on their thread, call still works, and the breadcrumb returns to the campaign.
6. Click someone who has no lead. Confirm the contact page shows their emails, a call button when they have a phone, and a follow-up box.
7. Send a follow-up. Confirm the button shows sending, then the email appears in the thread.
8. Open a draft campaign. Confirm the recipients tab is absent.

### Recipient

1. No new recipient screen. An opted-out address cannot be followed up. Confirm the composer says they opted out.

### System

1. Call `GET /campaigns/:id/recipients` without a campaign session. Confirm 401 or 403.

## Wiring audit

| Surface (action / route / op) | Identifier UI would use | Grep hits (paste lines) | Consumer (UI file or webhook/job) |
|---|---|---|---|
| List recipients | `api.listCampaignRecipients` | `crm/components/email-campaigns/CampaignRecipients.tsx:71` `.listCampaignRecipients(campaignId, { event, search: query, page })` | `CampaignRecipients.tsx` |
| Open a person without a lead | `api.getCampaignRecipient` | `crm/components/email-campaigns/RecipientConversation.tsx:61` `.getCampaignRecipient(recipientId)` and `:93` `await api.getCampaignRecipient(recipientId)` | `RecipientConversation.tsx` |
| Send a follow-up | `api.sendCampaignRecipientFollowUp` | `crm/components/email-campaigns/RecipientConversation.tsx:109` `await api.sendCampaignRecipientFollowUp(detail.id, {` | `RecipientConversation.tsx` |
| Open a person with a lead | `` `/crm/leads/${row.leadId}?fromCampaign=` `` | `crm/components/email-campaigns/CampaignRecipients.tsx:92` `` router.push(`${CRM_BASE_PATH}/leads/${row.leadId}?fromCampaign=${campaignId}`) `` | `CampaignRecipients.tsx` |

- [x] Every new surface has pasted UI grep hits (or a documented non-UI consumer)
- [x] Hits are not only in the server/API package, tests, or generated types
- [x] Every UI action hits a real surface with loading / success / error
- [x] New controls follow VISUAL_FEEDBACK.md (result on the control, allowed motion only, toast is extra)
- [x] Analog-flow table filled from fetched URLs or user screenshot (Entry / Land / Next). Discover/access matches it. Not an in-repo dump page the analog does not use for this class.
- [x] Design analog table filled (chrome, columns, land canvas, preview, density). Shipped UI matches those regions. Fail if analog is multi-column / always-on preview / empty canvas and code is a stacked form or a toolbar preview toggle.
- [x] Every status has a screen and a transition (or system-only, documented)
- [x] Every actor has an entry point
- [x] Wrong actor is rejected at server/policy on every new surface
- [x] All table-stakes ticked with paths
- [x] All YES answers ticked with paths
- [x] Empty / error / expired / unauthorized states are intentional
- [x] New tables/migrations, permissions, env, jobs registered where this repo registers them
- [x] typecheck / lint / build / tests run (commands from stack card) — compile green ≠ wired
- [x] Browser walkthrough done, or "could not click: the campaign URL redirected to CRM login, so the signed-in recipients table and follow-up were not clicked. Anonymous GET /api/v1/campaigns/:id/recipients returned 401."

## Intentionally skipped

- CSV export. You said no.
- Creating a survey lead for every recipient.
- Bulk follow-up and interest labels. Not asked. Easy to add later.
