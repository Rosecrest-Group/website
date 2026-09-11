# Feature: Planning enrichment (party-wall evidence)
**Class:** feature
**Statement:** A sales reviewer opens a party-wall prospect card and sees site planning history, constraints, committee vote (where published), documents, and professional-team contacts — not just a planning.data.gov.uk application row.
**Primary actor:** Sales executive (OPS)
**Slice 1:** Weekly/manual planning ingest writes history + constraints from planning.data.gov.uk; Idox portals may confirm status, vote, documents and team; the review card shows a Planning panel.
**Spec path:** docs/features/planning-enrichment.md

## Stack card
| Item | This repo |
|---|---|
| How UI talks to data | CRM `api` client → Express `/api/v1/prospecting/*` |
| Where new actions are registered | `api/src/connectors`, `persistPlanning.ts`, weekly `executeProspectingRun` |
| UI layer(s) | `/crm/prospecting/review/[id]`, Need Signals, Administration sources |
| Where navigation lives | `crm/lib/constants.ts` Prospecting section |
| typecheck / lint / build / test | website `npx tsc`; api `npm test` |
| Browser UI? | yes |

## Already exists
| Kind | Name | Path |
|---|---|---|
| connector | `planning_london_datahub` | `api/src/connectors/planningLondon.ts` |
| job | weekly ingest | `ingestPlanningLondon` in persistPlanning / runOrchestrator |
| card | prospect review | `app/crm/prospecting/review/[id]/page.tsx` |
| table | facts, signals, contacts, sources | Prisma B2B models |
| gate | borough confirmation | `partyWallActionableFromPlanning` |

## Out of scope
- Purchasing Barbour ABI / Glenigan (optional paid feed — see workflowdocs/b2b-todo.md).
- Per-borough ModernGov committee-PDF OCR for every London authority.
- Parsing full application-form PDFs for a richer professional team (officer report / S106 / neighbour PDFs are in slice 1).
- Non-Idox registers (Ocella, Northgate Explorer, Arcus) beyond a `not_checked` outcome.
- Answering whether a party-wall surveyor is already appointed (phone call only).

## Invariants
- A planning.data.gov.uk status alone cannot make a party-wall opportunity `proceed` — `partyWallActionableFromPlanning` + `planningUnconfirmed` in `decide`.
- `planning_feed_commercial` stays disabled unless an admin enables it; weekly run skips it when disabled.
- Gazette/planning news facts are tier 4 / `probable` and cannot confirm status.
- Portal fetches respect a robots.txt disallow for `/online-applications`.

## Actors
- Sales executive — review card / signals
- Administrator — enable/disable sources
- System — weekly run, query discovery

## Actor × lifecycle grid
| Stage | Sales | Admin | System |
|---|---|---|---|
| Create/configure | N/A — sources seeded | Toggle sources on Administration | Seed `planning_portal`, `planning_news`, `planning_feed_commercial` |
| Publish/enable | N/A | Enable news/portal; commercial stays off | Skip disabled sources |
| Discover/access | Open review card / Need Signals | See new source rows | PLD lat/lng history + constraints; Idox search by reference; RSS |
| Act/submit | Approve/reject existing | N/A | Persist facts, contacts, signals |
| Confirm/deliver | See Planning panel (history, vote, team, constraints) | N/A | `boroughPortalConfirmed` only after Idox match |
| Use/fulfil/verify | Script still omits unconfirmed status | N/A | Evaluation still blocks proceed without portal confirm |
| Modify/revoke | N/A — facts supersede on refetch | Disable source | Refetch planning entity |
| Close/expire | N/A | N/A | TTL 30 days on planning chips |
| Reconcile/report | N/A | N/A | Weekly `qualifying_pw_opportunities` + `median_lead_time_days` |

## States
| Entity | Status | Shown on | Transitioned by | Blocked while in it |
|---|---|---|---|---|
| Opportunity | draft / in_review | review | evaluate | `proceed` blocked if planning unconfirmed |
| Source commercial | enabled=false | admin | admin toggle | ingest no-ops |

## Table-stakes (build)
- [x] Site history + constraints from planning.data.gov.uk — system — `planningLondon.ts`
- [x] Idox portal enrichment — system — `planningPortal.ts`
- [x] News RSS → signals — system + sales — `planningNews.ts` / signals page
- [x] Planning panel on review card — sales — review `[id]` page
- [x] Officer report / S106 / neighbour PDF text — system — `planningPortalPdfExtract.ts`
- [x] Paid feed on B2B todo, connector disabled — admin — `workflowdocs/b2b-todo.md`

## Optional — user answered
- [x] Paid construction feed as a to-do (not purchase) — YES
- Full 33-borough ModernGov PDF pipeline — not asked, later

## Acceptance walkthrough

### Sales executive
1. Queue a party-wall / planning run (or open an existing planning opportunity).
2. Open Prospect Review → card.
3. Planning panel shows reference, history count, constraints, portal vote/team when the borough is Idox-mapped, and adjoining-owner / officer-report excerpts when those PDFs parse.

### Administrator
1. Open Prospecting → Administration.
2. See Planning portal, Planning news, and Commercial planning feed (off).

### System
1. Weekly run report includes `planning`, `planningNews`, and PW quality metrics.

## Wiring audit
| Surface (action / route / op) | Identifier UI would use | Grep hits (paste lines) | Consumer (UI file or webhook/job) |
|---|---|---|---|
| GET /prospecting/opportunities/:id | `api.getProspectingCard` | `setCard(await api.getProspectingCard(id));` and `{card.planning ? (` | `app/crm/prospecting/review/[id]/page.tsx` |
| GET /prospecting/signals | `api.listProspectingSignals` | `api.listProspectingSignals({ page })` | `app/crm/prospecting/signals/page.tsx` |
| GET /prospecting/admin | `api.getProspectingAdmin` | `setConfig(await api.getProspectingAdmin());` | `app/crm/prospecting/admin/page.tsx` |
| weekly ingest | `ingestPlanningLondon` / `ingestPlanningNews` | `report.planningNews = await ingestPlanningNews(runId);` | `api/src/services/prospecting/runOrchestrator.ts` (job) |

- [x] Every new surface has pasted UI grep hits (or a documented non-UI consumer)
- [x] Hits are not only in the server/API package, tests, or generated types
- [x] Every UI action hits a real surface with loading / success / error
- [x] Every status has a screen and a transition (or system-only, documented)
- [x] Every actor has an entry point
- [x] Wrong actor is rejected at server/policy on every new surface (existing prospecting router auth)
- [x] All table-stakes ticked with paths
- [x] All YES answers ticked with paths
- [x] Empty / error / expired / unauthorized states are intentional
- [x] New tables/migrations, permissions, env, jobs registered where this repo registers them (no new env; sources seeded)
- [x] typecheck / lint / build / tests run — api `tsc` green; planning unit tests 22 passed
- [ ] Browser walkthrough done, or "could not click: <reason>"

## Intentionally skipped
- [x] Paid Barbour/Glenigan live client — buy trigger not met; listed on B2B todo.
