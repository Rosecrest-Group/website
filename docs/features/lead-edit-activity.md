# Feature: Lead details edit + activity
**Class:** feature
**Statement:** An OPS user opens a lead, corrects name, email, phone, address, or quote, and the team can see who changed which fields on that lead’s Activity tab.
**Primary actor:** OPS (sales)
**Slice 1:** On the lead page, click the edit icon beside copy, save corrected details, then see that change on the Activity tab as who changed which fields (old → new).
**Spec path:** docs/features/lead-edit-activity.md

## Stack card
| Item | This repo |
|---|---|
| How UI talks to data | CRM `api` client → Express `/api/v1/leads/:id` PATCH; duplicate warn via `/api/v1/leads/duplicate-check` |
| Where new actions are registered | `api/src/routes/leads.ts` (extend existing PATCH); CRM `crm/lib/api.ts` `updateLead` |
| UI layer(s) | `/crm/leads/[id]`, inbox lead slide panel (`LeadDetail` embedded), Activity tab |
| Where navigation lives | Existing lead page; Activity pane tab |
| typecheck / lint / build / test commands | website `npx tsc --noEmit`, `npm run lint`; api `npm test --prefix api` |
| Browser UI? | yes |

## Already exists
| Kind | Name | Path |
|---|---|---|
| action/route | PATCH `/leads/:id` (quote, address, assignee) | `api/src/routes/leads.ts` |
| action/route | PATCH `/customers/:id` (name, email, phone) | `api/src/routes/customers.ts` |
| action/route | GET `/leads/duplicate-check` | `api/src/routes/leads.ts` |
| table/model | `Lead`, `Customer`, `Activity`, `AuditLog` | `api/prisma/schema.prisma` |
| component | Copy on email/phone | `crm/components/LeadDetail.tsx`, `EmbeddedLeadProfile.tsx` |
| component | Activity tab | `crm/components/ActivityFeed.tsx` |
| helper | `writeActivity` / `writeAuditLog` | `api/src/lib/audit.ts` |
| job | `ensureQuotedLeadPaymentJob` on quote change | `api/src/services/payments/ensureQuotedLeadJob.ts` |
| notification template | None | |

## Out of scope
- Editing bedrooms, property value, survey level, tags, or assignee from this modal.
- Emailing the customer when CRM details change (optional: no).
- Splitting a shared customer into two records.
- A new org-wide audit screen (Super Admin audit log already exists).
- A changes list on the contact card (optional: no — Activity tab only).
- Dedicated revert button (re-edit is undo).

## Invariants
- Name, email, phone, address, and quote edits are accepted only for `OPS` / `ADMIN` / `SUPER_ADMIN` — `requireExactRoles(LEAD_ACCESS_ROLES)` plus `requireRole("OPS", "ADMIN", "SUPER_ADMIN")` on PATCH `/leads/:id`.
- Quote amount cannot change once the lead is paid or `CONVERTED` — domain check in PATCH handler (`quoteAmountLocked`).
- No activity row when nothing actually changed — `diffLeadDetails` length 0 skips `writeActivity`.
- Name/email/phone writes update the shared `Customer` row (all leads/jobs for that person) — Prisma update on `customerId`.
- Email stored lowercase; phone stored E.164 — `normalizeEmail` / `normalizeToE164` before compare and save.
- Wrong actor is rejected at the server, not only by hiding the pencil.

## Actors
- OPS — lead page or inbox slide panel
- Admin / Super Admin — same surfaces; Super Admin can also see org Audit log
- System — writes `Activity` + `AuditLog` on save; may refresh payment job when quote changes
- Customer / field staff / Finance / Read-only — N/A; they cannot open or mutate leads

## Actor × lifecycle grid
| Stage (in this feature's terms) | OPS | Admin | System |
|---|---|---|---|
| Create/configure | N/A — editing an existing lead | N/A | N/A |
| Publish/enable | N/A — no publish step | N/A | N/A |
| Discover/access | Open lead (or inbox panel); see copy + edit; open Activity tab | Same | N/A |
| Act/submit | Edit modal: names, email, phone, address+postcode, quote; save; warn if email/phone matches another customer | Same | N/A |
| Confirm/deliver | Toast; card refreshes | Same | `writeActivity` (`lead.details_updated`) + `writeAuditLog`; quote change may call `ensureQuotedLeadPaymentJob` |
| Use/fulfil/verify | Activity tab shows who / when / field old→new | Same | Persist `authorId` on the activity |
| Modify/revoke | Edit again | Same | N/A |
| Close/expire | N/A — fields don’t expire; deleted lead 404s | N/A | N/A |
| Reconcile/report | Activity timeline | Super Admin audit log for the same UPDATE | N/A |

## States
| Entity | Status | Shown on | Transitioned by | Blocked while in it |
|---|---|---|---|---|
| Lead quote | Editable | Edit modal quote field | PATCH when unpaid and not converted | — |
| Lead quote | Locked | Disabled quote field + helper | Paid payment row or stage `CONVERTED` | Quote amount change rejected by server |
| Lead | Missing email/phone | Row shows — plus edit | Save fills the customer field | Copy hidden until there is a value |
| Save | Duplicate warn | Banner in modal | Email/phone matches another customer | Not blocked; user can save anyway |
| Save | No-op | Toast “No changes” | Diff empty | No activity row |

## Table-stakes (build)
- [x] Edit pencil beside copy on email/phone; same modal from name and property — OPS — `crm/components/ui/CopyValue.tsx`, `LeadDetail.tsx`, `EmbeddedLeadProfile.tsx`
- [x] Edit modal: first name, last name, email, phone, property address, postcode, quote — OPS — `crm/components/EditLeadDetailsModal.tsx`
- [x] Blank email/phone still shown so they can be filled — OPS — `LeadDetail.tsx`, `EmbeddedLeadProfile.tsx`
- [x] Save: loading, validation, error toast; card reloads — OPS — `EditLeadDetailsModal.tsx`
- [x] Shared-customer note in the modal — OPS — `EditLeadDetailsModal.tsx`
- [x] PATCH `/leads/:id` accepts contact fields and writes `lead.details_updated` — system — `api/src/routes/leads.ts`
- [x] Activity tab renders who changed which fields — OPS — `crm/components/ActivityFeed.tsx`
- [x] Quote locked after paid/converted (server + disabled field) — OPS — `api/src/services/leadDetails.ts`, modal
- [x] Unauthorized PATCH rejected at server — policy — existing `requireAuth` / `requireRole`

## Optional — user answered
- [x] Warn when new email/phone matches another customer (don’t block) — YES — `EditLeadDetailsModal.tsx` via `api.checkLeadDuplicates`
- Quote editable after paid/converted — NO
- Email the customer about the change — NO
- Recent changes on the contact card — NO
- Edit bedrooms / property value / survey level from this modal — not asked, easy to add later
- Activity “Edits” filter chip — not asked, easy to add later

## Acceptance walkthrough

### OPS
1. Open an unpaid lead on `/crm/leads/[id]`.
2. Click the pencil beside the email copy icon.
3. Change email (and optionally name, phone, address, quote). If the new email/phone matches another customer, see a warning and choose Save anyway.
4. Save: toast succeeds; the card shows the new values.
5. Open the Activity tab: the latest row is you, with the fields you changed (old → new).
6. Open a paid or converted lead: quote field is disabled; saving a quote change is rejected if forced.
7. Inbox: open the lead slide panel and edit from copy/pencil there too.

### Admin
1. Same as OPS on the lead page.
2. Super Admin may still find the raw UPDATE on Settings → Audit log (existing).

### Unauthorized
1. PATCH `/leads/:id` without a session returns 401.
2. A role outside lead access cannot open the lead or mutate it (existing router guard).

## Wiring audit
| Surface (action / route / op) | Identifier UI would use | Grep hits (paste lines) | Consumer (UI file or webhook/job) |
|---|---|---|---|
| PATCH `/leads/:id` | `api.updateLead` | `crm/components/EditLeadDetailsModal.tsx:157` `await api.updateLead(lead.id, payload);` | `crm/components/EditLeadDetailsModal.tsx` |
| GET `/leads/duplicate-check` | `api.checkLeadDuplicates` | `crm/components/EditLeadDetailsModal.tsx:135` `const { matches } = await api.checkLeadDuplicates({` | `crm/components/EditLeadDetailsModal.tsx` |

Existing quote-only caller still wired: `crm/components/LeadWorkflowASend.tsx:179` `await api.updateLead(leadId, { quotedAmount: amount });`

Activity consumer (not a new API, UI of the activity type): `crm/components/ActivityFeed.tsx:331` `if (activity.type === "lead.details_updated") {`

- [x] Every new surface has pasted UI grep hits (or a documented non-UI consumer)
- [x] Hits are not only in the server/API package, tests, or generated types
- [x] Every UI action hits a real surface with loading / success / error
- [x] Every status has a screen and a transition (or system-only, documented)
- [x] Every actor has an entry point
- [x] Wrong actor is rejected at server/policy on every new surface
- [x] All table-stakes ticked with paths
- [x] All YES answers ticked with paths
- [x] Empty / error / expired / unauthorized states are intentional
- [x] New tables/migrations, permissions, env, jobs registered where this repo registers them
- [x] typecheck / lint / build / tests run (commands from stack card) — compile green ≠ wired
- [x] Browser walkthrough done, or "could not click: <reason>"

typecheck: website `tsc` fails on pre-existing `SlidingPaneTabs.tsx` ReactNode; API `tsc` clean. lint: pre-existing errors in InboxView/LeadDetail breadcrumb, none introduced in new files. tests: `leadDetails.test.ts` + PATCH 401 in `app.integration.test.ts` pass. Browser: could not click — CRM/API dev servers were not running in this session.

## Intentionally skipped
- Emailing the customer on edit — user said no
- Quote edits after paid/converted — user said no
- Changes list on the contact card — user said Activity tab only
- Bedrooms / property value / survey level in this modal — not requested
- Dedicated revert — re-edit is enough
