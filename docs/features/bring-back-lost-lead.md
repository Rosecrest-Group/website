# Feature: Bring back a lost lead
**Class:** feature
**Statement:** An ops user brings a lost lead back to Awaiting payment so they can take payment, without restarting the quote chase.
**Primary actor:** OPS (same roles that can mark a lead lost: OPS, ADMIN, SUPER_ADMIN)
**Slice 1:** On a lost lead, click Bring back, see Awaiting payment, see Mark as won and Move to paid, and see that automation stays off.
**Spec path:** docs/features/bring-back-lost-lead.md

## Analog
| Item | Fill |
|---|---|
| Feature class | Reopen a closed-lost deal on the same record. |
| Products (named by user, or searched this session) | Salesforce opportunity stage. HubSpot deal stage. The user did not name a product. |
| URLs fetched this session | https://letterdrop.com/blog/reopen-closed-lost-salesforce . https://community.hubspot.com/t/changing-deal-stage-after-customer-reply/99081 |
| Default capabilities | Open the closed record and change Closed Lost to an open stage. Keep the original loss reason. Log an activity that says why it was reopened. Restrict who can move a deal out of Closed Lost. Do not auto-reopen when a reply arrives. Clone-instead-of-reopen is the other default; the user named the ceiling that this must be the same lead, because a new lead starts the Pinlocal chase. |
| Analog flow — Entry | Salesforce: open the opportunity record, then edit. Cite https://letterdrop.com/blog/reopen-closed-lost-salesforce step 2. |
| Analog flow — Land | The closed-lost record, with the loss reason still on it. Open pipeline deals are not this screen. Cite the same article, "Preserve Historical Context". |
| Analog flow — Next | Change the stage to an open stage, keep the loss reason, log the reopen, then keep working the deal (amount and next step). Cite the same article, steps 2 and 3. HubSpot's workflow that reopens on reply is advised against. Cite https://community.hubspot.com/t/changing-deal-stage-after-customer-reply/99081 |

## Design analog
| Region | Analog (not this repo) |
|---|---|
| Chrome | The opportunity record. Back is the existing record back. Primary action is the stage change on that record, next to the other close actions. |
| Columns | The record keeps its existing two columns: details and the conversation. The reopen control sits with the other record actions and on the closed-lost notice. A new column is not part of this status. |
| Land canvas | The filled lost record, with the loss reason visible. Empty canvas is not this screen. |
| Preview | No new preview. The conversation column on the record stays visible. |
| Density | One action in the existing actions group and on the lost notice. Not a new form page. |

## Stack card
| Item | This repo |
|---|---|
| How UI talks to data | `crm/lib/api.ts` `request()` to Express `/api/v1` |
| Where new actions are registered | `api/src/routes/leads.ts`. Client method on `api` in `crm/lib/api.ts` |
| UI layer(s) | CRM web app, `app/crm` and `crm/components` |
| Where navigation lives | Existing Leads list (Lost filter) and lead detail. No new sidebar item. |
| typecheck / lint / build / test commands | API `npx vitest run` from `api/` for the new test. Root `npm run lint` when touching CRM. |
| Browser UI? | yes |

## Already exists
| Kind | Name | Path |
|---|---|---|
| action/route | `POST /leads/:id/mark-lost`, `POST /leads/:id/stage` | `api/src/routes/leads.ts` |
| action/route | Mark as won and Move to paid, hidden while Lost | `crm/components/LeadDetail.tsx` |
| table/model | `Lead.stage`, `Lead.cadenceStopped`, `Lead.lostReason` | `api/prisma/schema.prisma` |
| component | Lost banner, quick actions | `crm/components/LeadDetail.tsx`, `crm/components/EmbeddedLeadProfile.tsx` |
| job | Nurture refuses to send while `cadenceStopped` is set | `api/src/services/workflow/stop.ts`, `api/src/services/workflow/engine.ts` |
| notification template | None. Bring back must not send. Payment acknowledgement stays on Move to paid. | `api/src/services/payments/handler.ts` |

## Out of scope
- Creating a new lead or cloning the lost one. The user named this ceiling: a new record starts the Pinlocal chase.
- A stage picker. Landing stage is Awaiting payment.
- Taking the payment inside Bring back. Amount and survey type stay on Move to paid.
- Auto-reopen when the customer replies. HubSpot's workflow default was advised against, and this move is manual.
- Restarting or resuming the quote chase.

## Invariants
- Only a lead in `LOST` can be brought back. Enforced in `bringLeadBack` and by `updateMany` where `stage` is `LOST`.
- Bring back sets `stage` to `AWAITING_PAYMENT`. Enforced in `bringLeadBack`.
- Bring back does not clear `cadenceStopped`, `lostReason`, or `lostReasonNote`, and does not dispatch `lead.created` or resume cadence. Enforced by the update payload in `bringLeadBack`.
- If automation was not already stopped, Bring back stops it before the stage change and does not write a second cadence-stopped activity. Enforced in `bringLeadBack`.
- Running nurture executions are stopped. Enforced by `stopWorkflowExecutionsForLead` inside `bringLeadBack`.
- `LOST` still has no generic stage transitions, so the pipeline board cannot drop the lead on New. Enforced by `canTransition` in `api/src/lib/leadStages.ts`.
- OPS, ADMIN, and SUPER_ADMIN only. Enforced by `requireRole` on `POST /leads/:id/bring-back`.

## Actors
- OPS / ADMIN / SUPER_ADMIN — open a lost lead, bring it back, then Move to paid.
- End customer — N/A. They do not see CRM stages. Bring back sends them nothing.
- Surveyor / field — N/A. This lead is not a job until Move to paid.
- System — must not start the quote chase. A later Pinlocal extra enquiry still cannot send nurture while automation is stopped.

## Actor × lifecycle grid
| Stage (in this feature's terms) | Ops | Customer | System |
|---|---|---|---|
| Create/configure | N/A — no new settings object. The action is a stage move. | N/A | N/A |
| Publish/enable | Bring back on a lost lead. | N/A | Sets Awaiting payment and leaves automation stopped. |
| Discover/access | Leads filter Lost, then the lead record. | N/A | N/A |
| Act/submit | Click Bring back. | N/A | Does not email or text. |
| Confirm/deliver | Button shows Bringing back…, then the pill says Awaiting payment and the brought-back notice shows. | N/A | Activity `lead.reopened` |
| Use/fulfil/verify | Mark as won and Move to paid are available. Use Move to paid to take the money. | N/A | Nurture still sees `cadenceStopped` and does not send. |
| Modify/revoke | Mark as lost again. | N/A | Lost stops chase again. |
| Close/expire | Move to paid when they pay. | N/A | Payment acknowledgement is the existing Move to paid send, not this action. |
| Reconcile/report | The lead leaves the Lost list because stage is no longer Lost. Loss reason stays on the record. | N/A | Lost counts key off stage Lost. |

## States
| Entity | Status | Shown on | Transitioned by | Blocked while in it |
|---|---|---|---|---|
| Lead | LOST | Lost filter, lost notice | Mark as lost. Bring back. | Mark as won, Move to paid, quote chase, generic stage drag |
| Lead | AWAITING_PAYMENT after bring back | Active leads, Awaiting payment column, brought-back notice | Bring back. Later stage moves and Move to paid. | Quote chase, while `cadenceStopped` stays set |

## Table-stakes (build)
- [x] Bring back on the lost notice and in quick actions — ops — `crm/components/LeadDetail.tsx`, `crm/components/EmbeddedLeadProfile.tsx`
- [x] Lands on Awaiting payment — system — `api/src/services/leads/bringBack.ts`
- [x] Loss reason kept — system — `api/src/services/leads/bringBack.ts`
- [x] Activity on the lead — ops — `api/src/services/leads/bringBack.ts`, `crm/components/ActivityFeed.tsx`
- [x] Mark as won and Move to paid return — ops — existing `canMarkWon` / `canMoveToPaid` once stage is not Lost
- [x] Quote chase stays off — system — `api/src/services/leads/bringBack.ts`, existing nurture stop
- [x] Pipeline board still cannot drag a lost lead — system — `api/src/lib/leadStages.ts`
- [x] Wrong role rejected — system — `api/src/routes/leads.ts`

## Optional — user answered
- Clone into a new lead — NO — user ceiling, a new lead starts the Pinlocal chase
- Stage picker — NO — user chose Awaiting payment
- Take payment inside Bring back — NO — stays on Move to paid
- Auto-reopen on reply — not asked, easy to add later

## Acceptance walkthrough
### Ops
1. Open a lead that is Lost.
2. Click Bring back. The button shows Bringing back…, then the pill says Awaiting payment, the lost notice is gone, and a notice says automation stays off.
3. Mark as won and Move to paid are on the lead.
4. The activity feed says the lead was brought back and automation stays off.

### System
1. A lost lead cannot be moved to New through the stage endpoint.
2. Bring back does not clear `cadenceStopped`.
3. A second Bring back on a lead that is no longer lost is rejected.

## Wiring audit
| Surface (action / route / op) | Identifier UI would use | Grep hits (paste lines) | Consumer (UI file or webhook/job) |
|---|---|---|---|
| `POST /leads/:id/bring-back` | `api.bringLeadBack` | `crm/lib/api.ts`: `bringLeadBack: (id: string) => request<Lead>(\`/leads/${id}/bring-back\`, { method: "POST" })` · `crm/components/LeadDetail.tsx`: `await api.bringLeadBack(id);` · `crm/components/LeadDetail.tsx`: `Bringing back…` / `Bring back` · `crm/components/EmbeddedLeadProfile.tsx`: `Bringing back…` / `Bring back` | `crm/components/LeadDetail.tsx` |

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
- [x] typecheck / lint / build / tests run (commands from stack card) — compile green ≠ wired. API vitest: bringBack 4 passed, leadStages 4 passed.
- [x] Browser walkthrough done, or "could not click: CRM dev server was not running"

## Intentionally skipped
- Auto-reopen when a reply arrives — not asked.
- Cloning the lead — user ceiling.
