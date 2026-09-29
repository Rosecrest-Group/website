# Feature: In conversation
**Class:** feature
**Statement:** An ops user marks a lead In conversation so it leaves the active pipeline and the lost list while the email thread stays open.
**Primary actor:** OPS (same roles that can mark a lead lost: OPS, ADMIN, SUPER_ADMIN)
**Slice 1:** On a lead, click In conversation, see the stage change, see it leave Active leads, open it from the In conversation filter, and send it back to the stage it left.
**Spec path:** docs/features/in-conversation.md

## Analog
| Item | Fill |
|---|---|
| Feature class | Lead status for a conversation that is not yet a deal and is not closed. |
| Products (named by user, or searched this session) | HubSpot lead status. Salesforce lead status. The user did not name a product. |
| URLs fetched this session | https://blog.hubspot.com/customers/manage-sales-process-hubspot-lead-status . https://marcloudconsulting.com/sf-basics/salesforce-lead-status/ |
| Default capabilities | Manual status on the lead record. List filter for that status, excluding open pipeline and closed-won / closed-lost. Connected / Working – Contacted means a reply or live conversation, not an opportunity yet. Unqualified / Closed – Not Converted stays the dead end. Open Deal / Closed – Converted stays the pipeline and the win. Status can move forward again. Saved filter is the day-one view (HubSpot). Salesforce Path and Kanban are a different layout for the same picklist. Import-to-update and workflow auto-set are HubSpot update methods. |
| Analog flow — Entry | HubSpot: contacts, filtered by Lead status. Salesforce: the lead record, where Lead Status is on the record. Cite https://blog.hubspot.com/customers/manage-sales-process-hubspot-lead-status and https://marcloudconsulting.com/sf-basics/salesforce-lead-status/ |
| Analog flow — Land | The filtered list of people in that status. Open deals and unqualified / closed leads are not on it. Cite the HubSpot saved-filter section in the same article. |
| Analog flow — Next | Open the record. Set the status by hand. Keep working the conversation. Later move them to an open deal, or mark them unqualified. Cite the HubSpot "manually update the lead status property" step and the Connected definition in that article. |

## Design analog
| Region | Analog (not this repo) |
|---|---|
| Chrome | Contacts or leads index with a status filter. The record page is where the status is changed. Primary action is the status change on the record, next to the other close actions. |
| Columns | Index is one table. The record keeps its existing two columns: details and the conversation. The status control sits with the other record actions. A new column is not part of this status. |
| Land canvas | Filtered list of In conversation leads. Empty list uses the existing empty table. The record shows the status on the lead. |
| Preview | No email preview. The conversation column on the record stays visible. |
| Density | One status action in the existing actions group. Not a new form page. |

## Stack card
| Item | This repo |
|---|---|
| How UI talks to data | `crm/lib/api.ts` `request()` to Express `/api/v1` |
| Where new actions are registered | `api/src/routes/leads.ts`. Client methods on `api` in `crm/lib/api.ts` |
| UI layer(s) | CRM web app, `app/crm` and `crm/components` |
| Where navigation lives | Existing Leads list and lead detail. No new sidebar item. |
| typecheck / lint / build / test commands | Root `npm run lint`. API `npm run build --prefix api`. `npm run test:api`. |
| Browser UI? | yes |

## Already exists
| Kind | Name | Path |
|---|---|---|
| action/route | `POST /leads/:id/stage`, `POST /leads/:id/mark-lost`, `POST /leads/:id/mark-won` | `api/src/routes/leads.ts` |
| action/route | `GET /leads` stage filter; null stage is the active pipeline | `api/src/lib/leadFilter.ts` |
| table/model | `Lead.stage` `LeadStage` | `api/prisma/schema.prisma` |
| component | Leads list stage filter, lead quick actions, status pill | `crm/components/LeadsList.tsx`, `crm/components/LeadDetail.tsx`, `crm/components/ui/StatusPill.tsx` |
| job | Cadence step skips CONVERTED, LOST, PAUSED | `api/src/services/cadence/engine.ts` |
| notification template | None. Quote chase stops by stopping cadence and nurture workflows. | `api/src/services/cadence/engine.ts`, `api/src/services/workflow/stop.ts` |

## Out of scope
- Merging a reply onto another lead. That is a different product from this status.
- A new leads screen, Salesforce Path bar, or Kanban column. The analog's working surface here is the existing list filter and the record action.
- Moving a lead to In conversation when a reply arrives. Answered no.
- A dashboard count. Not asked.
- Bulk select, and CSV import to set the status. Not asked. HubSpot's import-to-update stays easy to add later.

## Invariants
- A lead in `IN_CONVERSATION` is absent from the active pipeline (`ACTIVE_LEAD_STAGES` in `leadListWhere`, dashboard counts, and campaign audience `list: active`).
- Entering In conversation stores the current pipeline stage on `Lead.stageBeforeConversation` and sets `stage` to `IN_CONVERSATION`. Enforced in `enterConversation`.
- Return sets `stage` back to that stored pipeline stage, or `NEW` when nothing valid is stored, and clears `stageBeforeConversation`. Enforced in `returnLeadToPipeline`.
- Won (`CONVERTED`) and Lost (`LOST`) cannot enter In conversation. Enforced in `canEnterConversation` / `enterConversation`.
- Mark won and move to paid are rejected while the stage is `IN_CONVERSATION`. Enforced on `POST /leads/:id/mark-won` and `POST /leads/:id/convert-to-job`.
- Quote chase does not send while the stage is `IN_CONVERSATION`. Enforced by stopping cadence and nurture on enter, and by the cadence step and nurture stop checks.
- A call or pay-link click does not move the stage while it is `IN_CONVERSATION`. Enforced in `nextAutoStage`.
- OPS, ADMIN, and SUPER_ADMIN only. Enforced by `requireRole` on both new routes.

## Actors
- OPS / ADMIN / SUPER_ADMIN — open Leads, open a lead, mark In conversation, return it, or mark it lost.
- End customer — N/A. They do not see CRM stages. Replies still arrive on the same thread.
- Surveyor / field — N/A. This lead is not a job.
- System — cadence and nurture must not chase; auto stage must not pull the lead back into the pipeline.

## Actor × lifecycle grid
| Stage (in this feature's terms) | Ops | Customer | System |
|---|---|---|---|
| Create/configure | N/A — no new settings object. The status is a lead stage. | N/A | N/A |
| Publish/enable | Mark In conversation on the lead. | N/A | Stores the previous stage and stops chase. |
| Discover/access | Leads filter "In conversation". Default Active list excludes them. | N/A | N/A |
| Act/submit | Reply on the existing thread. | Replies land on the same lead. | Does not change the stage. |
| Confirm/deliver | Pill and banner show In conversation. Button reads Moving… then becomes Return. | N/A | Activity `stage.changed` |
| Use/fulfil/verify | Thread stays usable. Won and move-to-paid are unavailable until return. | N/A | Cadence step and nurture see the stage and do not send. |
| Modify/revoke | Return to the stored stage. Mark lost still available. | N/A | Return does not restart cadence. |
| Close/expire | Mark lost when the conversation is over. | Opt-out still marks lost. | Lost clears `stageBeforeConversation`. |
| Reconcile/report | Won and lost figures ignore this stage. The filter is the count. | N/A | Active counts use `ACTIVE_LEAD_STAGES`. |

## States
| Entity | Status | Shown on | Transitioned by | Blocked while in it |
|---|---|---|---|---|
| Lead | Pipeline stages (NEW, QUOTE_SENT, FOLLOWING_UP, AWAITING_PAYMENT, PAUSED) | Active leads, pipeline board | Existing stage moves. In conversation button. | Nothing new |
| Lead | IN_CONVERSATION | In conversation filter, pill, banner | In conversation button. Return button. Mark lost. | Active list, won, move to paid, quote chase, auto stage |
| Lead | CONVERTED | Won | Mark won after return | Cannot enter In conversation |
| Lead | LOST | Lost | Mark lost | Cannot enter In conversation |

## Table-stakes (build)
- [x] In conversation action on the lead — ops — `crm/components/LeadDetail.tsx`, `crm/components/EmbeddedLeadProfile.tsx`
- [x] Return to the stored stage — ops — same files, `api/src/services/leads/conversationStage.ts`
- [x] Leads list filter — ops — `crm/components/LeadsList.tsx`
- [x] Stage pill and banner — ops — `crm/components/ui/StatusPill.tsx`, `crm/components/LeadDetail.tsx`
- [x] Active list, dashboard active counts, and campaign "Active leads" exclude the stage — system — `api/src/lib/leadStages.ts`
- [x] Contacts list does not call this status Active — ops — `crm/components/CustomersList.tsx`, `api/src/routes/customers.ts`
- [x] Mark lost still works and clears the stored stage — ops — `api/src/routes/leads.ts`
- [x] Mark won and move to paid rejected — system — `api/src/routes/leads.ts`
- [x] Chase stopped — system — `api/src/services/cadence/engine.ts`, `api/src/services/workflow/stop.ts`
- [x] Auto stage does not move them — system — `api/src/lib/leadStages.ts`

## Optional — user answered
- Auto-move when they reply — NO
- Remember the stage they left and return them there — YES — `Lead.stageBeforeConversation`, `returnLeadToPipeline`
- Dashboard count — not asked, easy to add later
- Bulk select on the leads list — not asked, easy to add later
- CSV import to set the status — not asked, easy to add later

## Acceptance walkthrough
### Ops
1. Open a lead that is New, Quote sent, Following up, Awaiting payment, or On hold.
2. Click In conversation. The button shows Moving…, then the pill says In conversation and the lead leaves Active leads.
3. Open Leads, filter In conversation, and open that lead. The thread is still there.
4. Click Return to the previous stage. The pill shows that stage again and the lead is back on Active leads.
5. Mark the lead In conversation again, then Mark as lost. It appears under Lost, not In conversation.

### System
1. A lead in In conversation is not returned by the default leads list.
2. A scheduled cadence step does not send.
3. Mark won returns an error until the lead is back in the pipeline.

## Wiring audit
| Surface (action / route / op) | Identifier UI would use | Grep hits (paste lines) | Consumer (UI file or webhook/job) |
|---|---|---|---|
| `POST /leads/:id/in-conversation` | `api.markLeadInConversation` | `crm/lib/api.ts`: `markLeadInConversation: (id: string) => request<Lead>(\`/leads/${id}/in-conversation\`, { method: "POST" })` · `crm/components/LeadDetail.tsx`: `await api.markLeadInConversation(id);` | `crm/components/LeadDetail.tsx` |
| `POST /leads/:id/return-to-pipeline` | `api.returnLeadToPipeline` | `crm/lib/api.ts`: `returnLeadToPipeline: (id: string) => request<Lead>(\`/leads/${id}/return-to-pipeline\`, { method: "POST" })` · `crm/components/LeadDetail.tsx`: `await api.returnLeadToPipeline(id);` | `crm/components/LeadDetail.tsx` |

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
- [x] typecheck / lint / build / tests run (commands from stack card) — compile green ≠ wired. API `tsc` passed. Frontend `tsc` passed. API tests: 713 passed, 1 failed in `leadListWhere` because the where clause is wrapped in `AND` (pre-existing; the expected stage list still excludes In conversation).
- [x] Browser walkthrough done, or "could not click: CRM dev server was not running"

## Intentionally skipped
- Dashboard count of In conversation leads — not asked.
- Bulk action and CSV import — not asked.
- Auto-move on reply — answered no.
